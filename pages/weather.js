import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWeather, dismissAlert, clearAllAlerts } from "../store/weatherSlice";
import Navbar from "../components/Navbar";
import { FaHeart, FaRegHeart, FaExclamationTriangle, FaChevronDown, FaTimes } from "react-icons/fa";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiDayCloudy,
  WiHumidity,
  WiStrongWind,
  WiBarometer,
  WiSunrise,
  WiSunset,
  WiDayHaze,
} from "react-icons/wi";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw } from "react-icons/fi";
import { BsDroplet } from "react-icons/bs";
import { IoTimeOutline } from "react-icons/io5";
import { addFavoriteCity, removeFavoriteCity } from "../store/perferencesSlice.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Weather() {
  const dispatch = useDispatch();
  const weather = useSelector((state) => state.weather);
  const favoriteCities = useSelector((state) => state.preferences.favoriteCities);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedAlerts, setExpandedAlerts] = useState({});

  const toggleFavorite = (city) => {
    if (favoriteCities.includes(city)) {
      dispatch(removeFavoriteCity(city));
    } else {
      dispatch(addFavoriteCity(city));
    }
  };

  const toggleAlertExpansion = (cityName) => {
    setExpandedAlerts(prev => ({
      ...prev,
      [cityName]: !prev[cityName]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dispatch(fetchWeather());
        
        if (res.payload) {
          const cities = Array.isArray(res.payload) ? res.payload : [res.payload];
          let highestPriorityAlert = null;
          
          // Find the highest priority alert across all cities
          cities.forEach((city) => {
            if (city?.alerts?.length > 0) {
              city.alerts.forEach((alert) => {
                if (!highestPriorityAlert || 
                    (alert.event.toLowerCase().includes('warning') && 
                     !highestPriorityAlert.event.toLowerCase().includes('warning'))) {
                  highestPriorityAlert = {
                    ...alert,
                    cityName: city.name
                  };
                }
              });
            }
          });

          // Show only the highest priority alert
          if (highestPriorityAlert) {
            toast.warn(
              <div className="p-2">
                <div className="font-bold flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-400" />
                  {highestPriorityAlert.cityName} Weather Alert
                </div>
                <div className="mt-1 font-medium">{highestPriorityAlert.event}</div>
                <div className="mt-2 text-sm text-gray-100">
                  {highestPriorityAlert.description.split('\n')[0]}
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-300">
                  <span>
                    Until: {new Date(highestPriorityAlert.end * 1000).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => toast.dismiss()}
                    className="text-yellow-300 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>,
              {
                position: "top-right",
                autoClose: 10000,
                closeButton: false,
                toastId: 'weather-alert',
                className: '!bg-gradient-to-r !from-red-900/90 !to-amber-900/90 !border !border-red-800/50',
                bodyClassName: '!p-0'
              }
            );
          }
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
        toast.error("Failed to load weather data", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    };
    
    fetchData();
  }, [dispatch]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    dispatch(fetchWeather()).finally(() => {
      setTimeout(() => setIsRefreshing(false), 1000);
    });
  };

  const getWeatherIcon = (main, size = "text-7xl") => {
    const baseClasses = `${size} transition-all duration-300`;
    switch (main) {
      case "Clear":
        return (
          <WiDaySunny
            className={`text-yellow-300 ${baseClasses} drop-shadow-[0_0_15px_rgba(253,230,138,0.7)]`}
          />
        );
      case "Clouds":
        return (
          <WiCloud
            className={`text-gray-200 ${baseClasses} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
          />
        );
      case "Rain":
        return (
          <WiRain
            className={`text-blue-300 ${baseClasses} drop-shadow-[0_0_10px_rgba(147,197,253,0.5)]`}
          />
        );
      case "Snow":
        return (
          <WiSnow
            className={`text-blue-100 ${baseClasses} drop-shadow-[0_0_10px_rgba(191,219,254,0.4)]`}
          />
        );
      case "Thunderstorm":
        return (
          <WiThunderstorm
            className={`text-purple-300 ${baseClasses} drop-shadow-[0_0_15px_rgba(196,181,253,0.5)] animate-pulse`}
          />
        );
      case "Fog":
      case "Mist":
      case "Haze":
        return (
          <WiDayHaze
            className={`text-gray-300 ${baseClasses} drop-shadow-[0_0_10px_rgba(209,213,219,0.3)]`}
          />
        );
      default:
        return (
          <WiDayCloudy
            className={`text-gray-300 ${baseClasses} drop-shadow-[0_0_10px_rgba(209,213,219,0.3)]`}
          />
        );
    }
  };

  const getBackgroundGradient = (main) => {
    switch (main) {
      case "Clear":
        return "from-amber-500/10 via-sky-600/10 to-purple-600/10";
      case "Clouds":
        return "from-gray-500/10 via-gray-600/10 to-gray-700/10";
      case "Rain":
        return "from-blue-600/10 via-indigo-600/10 to-violet-600/10";
      case "Snow":
        return "from-blue-200/10 via-cyan-200/10 to-white/10";
      case "Thunderstorm":
        return "from-purple-600/10 via-indigo-800/10 to-blue-900/10";
      case "Fog":
      case "Mist":
      case "Haze":
        return "from-gray-400/10 via-gray-500/10 to-gray-600/10";
      default:
        return "from-gray-600/10 via-gray-700/10 to-gray-800/10";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <Navbar />

      <div className="pt-16">
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-2xl lg:text-4xl font-semibold uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 pb-2">
                Weather Forecast
              </h1>
              <p className="text-sm md:text-base text-gray-400 max-w-2xl ml-2 mt-2 uppercase tracking-wide">
                Real-time weather conditions with beautiful visualizations
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-md hover:bg-gray-700/50 transition-all duration-300 group"
              aria-label="Refresh weather data"
            >
              <motion.span
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{
                  duration: 0.5,
                  repeat: isRefreshing ? Infinity : 0,
                }}
              >
                <FiRefreshCw
                  className={`text-gray-400 group-hover:text-cyan-400 transition-colors ${
                    isRefreshing ? "text-cyan-400" : ""
                  }`}
                />
              </motion.span>
              <span className="text-gray-300 group-hover:text-white">
                {isRefreshing ? "Refreshing..." : "Refresh Data"}
              </span>
            </motion.button>
          </motion.div>

          {/* Weather Alerts Summary Panel */}
          {weather.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full mb-6 bg-gradient-to-r from-red-900/50 to-amber-900/50 border border-red-800/30 rounded-lg overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FaExclamationTriangle className="text-red-400 text-xl" />
                    <h3 className="font-semibold text-white">
                      Active Weather Alerts ({weather.alerts.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => dispatch(clearAllAlerts())}
                    className="text-xs px-3 py-1 bg-black/30 rounded hover:bg-black/40 transition-colors text-gray-300 hover:text-white flex items-center gap-1"
                  >
                    <FaTimes className="text-xs" />
                    Dismiss All
                  </button>
                </div>
                
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {weather.alerts.map((alert, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-black/20 rounded-lg border border-red-900/30"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white flex items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${alert.event.toLowerCase().includes('warning') ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                            {alert.city}: {alert.event}
                          </h4>
                          <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                            {alert.description.split('\n')[0]}
                          </p>
                        </div>
                        <button
                          onClick={() => dispatch(dismissAlert(alert.city))}
                          className="text-xs p-1 bg-black/30 rounded hover:bg-black/40 transition-colors"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Until: {new Date(alert.end * 1000).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            {weather.loading ? (
              <div className="col-span-full flex justify-center items-center h-64">
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-16 h-16 border-4 border-cyan-400/50 border-t-cyan-400 rounded-full animate-spin"></div>
                  <p className="text-gray-400 text-xl font-light tracking-wider">
                    Loading weather data...
                  </p>
                </div>
              </div>
            ) : weather.error ? (
              <div className="col-span-full flex justify-center items-center h-64">
                <div className="flex flex-col items-center space-y-6">
                  <div className="text-red-400 text-4xl">⚠️</div>
                  <p className="text-gray-400 text-xl font-light tracking-wider">
                    Failed to load weather data
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center w-full px-0 md:px-10 lg:px-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                  <AnimatePresence>
                    {weather.data?.map((city) => (
                      <motion.div
                        key={city.id}
                        variants={cardVariants}
                        whileHover="hover"
                        className={`relative group overflow-hidden bg-gray-800/20 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-xl hover:shadow-lg transition-all duration-500 ${
                          getWeatherIcon(
                            city.weather[0]?.main
                          ).props.className.includes("yellow")
                            ? "hover:shadow-amber-500/20"
                            : ""
                        }`}
                      >
                        {/* Favorite Button */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(city.name);
                          }}
                          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-black/40 backdrop-blur-sm"
                          aria-label={
                            favoriteCities.includes(city.name)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <div className="h-5 w-5 flex items-center justify-center">
                            {favoriteCities.includes(city.name) ? (
                              <FaHeart className="text-rose-500 text-lg drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]" />
                            ) : (
                              <FaRegHeart className="text-gray-200 text-lg hover:text-rose-300" />
                            )}
                          </div>
                          
                          {favoriteCities.includes(city.name) && (
                            <motion.div
                              className="absolute -inset-1 rounded-full bg-rose-500/20 pointer-events-none"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0, 0.3]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          )}
                        </motion.button>

                        <div
                          className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${getBackgroundGradient(
                            city.weather[0]?.main
                          )}`}
                        ></div>

                        {city.weather[0]?.main === "Rain" && (
                          <div className="absolute inset-0 overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-4 bg-blue-400/30 rounded-full"
                                initial={{ y: -20, x: Math.random() * 100 }}
                                animate={{
                                  y: ["-20px", "120%"],
                                  x: [
                                    `${Math.random() * 100}%`,
                                    `${Math.random() * 100}%`,
                                  ],
                                }}
                                transition={{
                                  duration: 1 + Math.random() * 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                  delay: Math.random() * 2,
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {city.weather[0]?.main === "Snow" && (
                          <div className="absolute inset-0 overflow-hidden">
                            {[...Array(30)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-white/50 rounded-full"
                                initial={{ y: -10, x: Math.random() * 100 }}
                                animate={{
                                  y: ["-10px", "120%"],
                                  x: [
                                    `${Math.random() * 100}%`,
                                    `${Math.random() * 100}%`,
                                  ],
                                }}
                                transition={{
                                  duration: 3 + Math.random() * 5,
                                  repeat: Infinity,
                                  ease: "linear",
                                  delay: Math.random() * 5,
                                }}
                              />
                            ))}
                          </div>
                        )}

                        <div className="relative p-6 h-full flex flex-col">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                              <motion.div
                                animate={{
                                  scale: [1, 1.05, 1],
                                  transition: { repeat: Infinity, duration: 8 },
                                }}
                              >
                                {getWeatherIcon(city.weather[0]?.main)}
                              </motion.div>
                              <div>
                                <h2 className="text-base font-semibold md:text-2xl lg:text-2xl md:font-bold text-gray-100">
                                  {city.name}
                                </h2>
                                <p className="text-gray-400 text-sm capitalize">
                                  {city.weather[0]?.description}
                                </p>
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                  <IoTimeOutline />
                                  <span>
                                    {new Date(
                                      city.dt * 1000
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-base md:text-3xl font-bold bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                              {Math.round(city.main?.temp)}°C
                            </span>
                          </div>

                          <div className="mt-2 space-y-4 mb-4">
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Min: {Math.round(city.main?.temp_min)}°C</span>
                              <span>Current: {Math.round(city.main?.temp)}°C</span>
                              <span>Max: {Math.round(city.main?.temp_max)}°C</span>
                            </div>

                            <div className="relative h-2.5 bg-gray-700 rounded-full">
                              <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-amber-400"
                                style={{
                                  width: `${((city.main?.temp - city.main?.temp_min) / 
                                           (city.main?.temp_max - city.main?.temp_min)) * 100}%`
                                }}
                              >
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <motion.div
                              variants={fadeIn}
                              className="flex items-center gap-3 bg-gray-800/40 p-3 rounded-xl backdrop-blur-sm"
                            >
                              <WiHumidity className="text-cyan-300 text-2xl" />
                              <div>
                                <p className="text-gray-400 text-xs">Humidity</p>
                                <p className="text-gray-100 font-medium">
                                  {city.main?.humidity}%
                                </p>
                              </div>
                            </motion.div>
                            <motion.div
                              variants={fadeIn}
                              className="flex items-center gap-3 bg-gray-800/40 p-3 rounded-xl backdrop-blur-sm"
                            >
                              <WiStrongWind className="text-cyan-300 text-2xl" />
                              <div>
                                <p className="text-gray-400 text-xs">Wind</p>
                                <p className="text-gray-100 font-medium">
                                  {city.wind?.speed} m/s
                                </p>
                              </div>
                            </motion.div>
                            <motion.div
                              variants={fadeIn}
                              className="flex items-center gap-3 bg-gray-800/40 p-3 rounded-xl backdrop-blur-sm"
                            >
                              <WiBarometer className="text-cyan-300 text-2xl" />
                              <div>
                                <p className="text-gray-400 text-xs">Pressure</p>
                                <p className="text-gray-100 font-medium">
                                  {city.main?.pressure} hPa
                                </p>
                              </div>
                            </motion.div>
                            <motion.div
                              variants={fadeIn}
                              className="flex items-center gap-3 bg-gray-800/40 p-3 rounded-xl backdrop-blur-sm"
                            >
                              <BsDroplet className="text-cyan-300 text-xl" />
                              <div>
                                <p className="text-gray-400 text-xs">Feels Like</p>
                                <p className="text-gray-100 font-medium">
                                  {Math.round(city.main?.feels_like)}°C
                                </p>
                              </div>
                            </motion.div>
                          </div>

                          {city.sys && (
                            <div className="mt-6 pt-4 border-t border-gray-700/50">
                              <div className="flex justify-between">
                                <div className="flex items-center gap-2">
                                  <WiSunrise className="text-amber-300 text-xl" />
                                  <div>
                                    <p className="text-gray-400 text-xs">Sunrise</p>
                                    <p className="text-gray-100 text-sm">
                                      {new Date(
                                        city.sys.sunrise * 1000
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <WiSunset className="text-purple-300 text-xl" />
                                  <div>
                                    <p className="text-gray-400 text-xs">Sunset</p>
                                    <p className="text-gray-100 text-sm">
                                      {new Date(
                                        city.sys.sunset * 1000
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Weather Alert Section */}
                        {city.alerts && city.alerts.length > 0 && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 z-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div 
                              className={`p-3 ${city.alerts[0].event.toLowerCase().includes('warning') ? 'bg-red-900/80' : 'bg-amber-900/80'} rounded-b-xl cursor-pointer`}
                              onClick={() => toggleAlertExpansion(city.name)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FaExclamationTriangle className="text-red-300" />
                                  <span className="font-medium text-white">
                                    {city.alerts[0].event}
                                  </span>
                                </div>
                                <motion.div
                                  animate={{ rotate: expandedAlerts[city.name] ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <FaChevronDown className="text-white text-sm" />
                                </motion.div>
                              </div>
                              
                              {expandedAlerts[city.name] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-2"
                                >
                                  <div className="text-xs text-gray-200 whitespace-pre-line">
                                    {city.alerts[0].description}
                                  </div>
                                  <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                                    <span>
                                      From: {new Date(city.alerts[0].start * 1000).toLocaleString()}
                                    </span>
                                    <span>
                                      To: {new Date(city.alerts[0].end * 1000).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-end mt-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(dismissAlert(city.name));
                                      }}
                                      className="text-xs px-2 py-1 bg-black/30 rounded hover:bg-black/40 transition-colors flex items-center gap-1"
                                    >
                                      <FaTimes className="text-xs" />
                                      Dismiss
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center text-gray-500 text-sm"
          >
            <p>Weather data updates every 5 minutes</p>
            <p className="mt-1">© {new Date().getFullYear()} Weather App</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}