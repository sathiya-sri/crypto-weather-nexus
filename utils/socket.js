import { toast } from "react-toastify";
import { addNotification, removeNotification } from "../store/notificationsSlice";

const SYMBOLS = ["bitcoin", "ethereum", "cardano"];
const STREAMS = SYMBOLS.map((s) => `${s}@ticker`).join("/");
const WS_URL = `wss://stream.binance.com:9443/stream?streams=${STREAMS}`;

const MAX_RETRIES = 5;
const BASE_RECONNECT_DELAY = 3000;
const PRICE_CHANGE_THRESHOLD = 0.01;

const connectionManager = {
  socket: null,
  retryCount: 0,
  retryTimer: null,
  previousPrices: {},
  activeToasts: new Set(),

  connect(dispatch) {
    this.cleanup();

    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.retryCount = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (!parsed.data || !parsed.stream) return;
        const ticker = parsed.data;
        console.log("Ticker received:", ticker);
        this.processTicker(ticker, dispatch);
      } catch (error) {
        console.error("Message processing error:", error);
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.handleDisconnection(dispatch);
    };

    this.socket.onclose = (event) => {
      console.warn("WebSocket closed", event.code, event.reason);
      this.handleDisconnection(dispatch);
    };
  },

  processTicker(ticker, dispatch) {
    const symbol = ticker.s.toLowerCase();
    const newPrice = parseFloat(ticker.c);
    if (isNaN(newPrice)) return;

    const prevPrice = this.previousPrices[symbol];
    this.previousPrices[symbol] = newPrice;

    if (prevPrice !== undefined) {
      const change = Math.abs((newPrice - prevPrice) / prevPrice);
      if (change >= PRICE_CHANGE_THRESHOLD) {
        this.showPriceAlert(symbol.toUpperCase(), newPrice, dispatch);
      }
    }
  },

  showPriceAlert(symbol, price, dispatch) {
    const notificationId = `price-alert-${symbol}-${Date.now()}`;
    const message = `${symbol}: $${price.toFixed(2)}`;

    dispatch(
      addNotification({
        id: notificationId,
        message,
        timestamp: Date.now(),
      })
    );

    if (!this.activeToasts.has(symbol)) {
      toast.info(message, {
        position: "top-right",
        autoClose: 3000,
        onClose: () => {
          this.activeToasts.delete(symbol);
          dispatch(removeNotification(notificationId));
        },
      });

      this.activeToasts.add(symbol);
    }
  },

  handleDisconnection(dispatch) {
    this.cleanup();

    if (this.retryCount < MAX_RETRIES) {
      const delay = BASE_RECONNECT_DELAY * Math.pow(2, this.retryCount);
      this.retryCount++;
      console.log(`Reconnecting attempt ${this.retryCount} in ${delay}ms`);

      this.retryTimer = setTimeout(() => {
        this.connect(dispatch);
      }, delay);
    } else {
      toast.error("Connection lost. Please refresh the page.", {
        autoClose: false,
      });
    }
  },

  cleanup() {
    if (this.socket) {
      this.socket.close(1000, "Normal closure");
      this.socket = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  },

  disconnect() {
    this.cleanup();
    this.retryCount = 0;
    this.previousPrices = {};
    this.activeToasts.clear();
  },
};

export const connectCryptoWebSocket = (dispatch) =>
  connectionManager.connect(dispatch);
export const disconnectCryptoWebSocket = () =>
  connectionManager.disconnect();
