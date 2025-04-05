import { useEffect, useState, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCrypto, updateCryptoPrice } from "../store/cryptoSlice";
import Navbar from "../components/Navbar";
import {
  FaBitcoin,
  FaEthereum,
  FaLayerGroup,
  FaCircleNotch,
  FaStar,
  FaRegStar,
  FaChartLine
} from "react-icons/fa";
import { SiSolana, SiBinance } from "react-icons/si";
import { IoMdRefresh, IoMdTrendingUp, IoMdTrendingDown } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import {
  addFavoriteCrypto,
  removeFavoriteCrypto
} from "../store/perferencesSlice.js";



// Constants
const cryptoIcons = {
  bitcoin: <FaBitcoin className="text-orange-400 text-2xl" />,
  ethereum: <FaEthereum className="text-purple-400 text-2xl" />,
  solana: <SiSolana className="text-green-400 text-2xl" />,
  cardano: <FaLayerGroup className="text-blue-400 text-2xl" />
};

const COIN_MAPPING = {
  'BTCUSDT': 'bitcoin',
  'ETHUSDT': 'ethereum',
  'ADAUSDT': 'cardano',
  'SOLUSDT': 'solana'
};

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY = 1000;

const CryptoCoin = memo(({ coin, currentPrice, change, isFavorite, toggleFavorite }) => {
  const changePercentage = ((change / (currentPrice - change)) * 100).toFixed(2);
  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <motion.div
      layout
      className={`bg-gray-800/60 hover:bg-gray-700/70 p-4 md:p-6 rounded-xl 
        flex justify-between items-center border border-gray-700/50 backdrop-blur-md
        ${isFavorite ? "ring-1 ring-yellow-400/30" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div>{cryptoIcons[coin.id]}</div>
        <div>
          <h2 className="text-lg font-semibold capitalize">{coin.id}</h2>
          <p className="text-sm text-gray-400">${currentPrice}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {isUp && <IoMdTrendingUp className="text-green-400" />}
          {isDown && <IoMdTrendingDown className="text-red-400" />}
          <span className={`${isUp ? "text-green-400" : isDown ? "text-red-400" : "text-gray-300"} text-sm`}>
            {isNaN(changePercentage) ? "0%" : `${changePercentage}%`}
          </span>
        </div>
        <button onClick={() => toggleFavorite(coin.id)} className="focus:outline-none">
          {isFavorite ? <FaStar className="text-yellow-400" /> : <FaRegStar className="text-gray-500" />}
        </button>
      </div>
    </motion.div>
  );
});

export default function Crypto() {
  const dispatch = useDispatch();
  const crypto = useSelector((state) => state.crypto);
  const favorites = useSelector((state) => state.preferences.favoriteCryptos);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [priceChanges, setPriceChanges] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatTime = useCallback((date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }, []);

  const updatePriceWithChange = useCallback((id, newPrice) => {
    if (isNaN(newPrice)) return;
    const currentPrice = crypto.livePrices[id] || crypto.data.find((c) => c.id === id)?.current_price;
    if (currentPrice === undefined) return;
    const change = parseFloat(newPrice) - parseFloat(currentPrice);
    setPriceChanges((prev) => ({ ...prev, [id]: change }));
    dispatch(updateCryptoPrice({ id, price: newPrice }));
    setLastUpdated(new Date());
  }, [crypto.data, crypto.livePrices, dispatch]);

  const toggleFavorite = useCallback((id) => {
    if (favorites.includes(id)) {
      dispatch(removeFavoriteCrypto(id));
    } else {
      dispatch(addFavoriteCrypto(id));
    }
  }, [dispatch, favorites]);

  useEffect(() => {
    let socket;
    let reconnectAttempts = 0;
    let reconnectTimer;

    const connectWebSocket = () => {
      socket = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");

      socket.onopen = () => {
        setConnectionStatus("connected");
        setLastUpdated(new Date());
        reconnectAttempts = 0;
        dispatch(fetchCrypto());
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          data.forEach((coin) => {
            if (COIN_MAPPING[coin.s]) {
              updatePriceWithChange(COIN_MAPPING[coin.s], parseFloat(coin.c).toFixed(2));
            }
          });
        } catch (error) {
          console.error("Error parsing WebSocket data:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("disconnected");
      };

      socket.onclose = () => {
        setConnectionStatus("disconnected");
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts), 30000);
          reconnectTimer = setTimeout(() => {
            reconnectAttempts++;
            connectWebSocket();
          }, delay);
        }
      };
    };

    if (isMounted) connectWebSocket();

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) socket.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [dispatch, updatePriceWithChange, isMounted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar />
      <div className="pt-20">
      <div className="p-4 md:p-8 max-w-5xl mx-auto pt-40">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-orange-400 text-3xl animate-pulse" />
            <div >
              <h1 className="text-xl md:text-3xl font-bold text-orange-300">Crypto Tracker</h1>
              <p className="text-xs text-gray-400">Real-time cryptocurrency prices</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full 
            ${connectionStatus === "connected"
              ? "bg-green-600/20 border border-green-500"
              : connectionStatus === "connecting"
              ? "bg-yellow-600/20 border border-yellow-500"
              : "bg-red-600/20 border border-red-500"}`}>
            {connectionStatus === "connected" ? (
              <IoMdRefresh className="text-green-400 animate-spin-slow" />
            ) : connectionStatus === "connecting" ? (
              <FaCircleNotch className="text-yellow-400 animate-spin" />
            ) : (
              <>⚠️</>
            )}
            <span className="hidden sm:inline">
              {connectionStatus === "connected" ? "Live Updates" : 
              connectionStatus === "connecting" ? "Connecting..." : "Disconnected"}
            </span>
            {lastUpdated && (
              <span className="text-xs text-gray-300 ml-1 hidden md:inline">
                {formatTime(lastUpdated)}
              </span>
            )}
          </div>
        </div>

        {/* Render crypto coins */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          {crypto.data.map((coin) => (
            <CryptoCoin
              key={coin.id}
              coin={coin}
              currentPrice={crypto.livePrices[coin.id] || coin.current_price}
              change={priceChanges[coin.id] || 0}
              isFavorite={favorites.includes(coin.id)}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {/* Binance footer */}
        <div className="mt-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <SiBinance className="text-yellow-500 animate-spin-slow" />
          <span>Data from Binance WebSocket API</span>
          {lastUpdated && (
            <span className="hidden md:inline">• Last update: {formatTime(lastUpdated)}</span>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
