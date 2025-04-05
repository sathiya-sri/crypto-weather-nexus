import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { 
   FiDroplet, FiWind, 
  FiActivity, FiTrendingUp, FiCalendar, FiAlertCircle 
} from 'react-icons/fi';

import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// Register ChartJS components with additional plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// API configuration with fallback data
const API_CONFIG = {
  WEATHER: {
    url: 'https://api.openweathermap.org/data/2.5/weather',
    params: {
      q: 'New York',
      units: 'imperial',
      appid: process.env.NEXT_PUBLIC_WEATHER_API_KEY
    },
    fallback: {
      temp: 72,
      condition: 'Clear',
      humidity: 65,
      wind: 8,
      location: 'New York',
      icon: '01d'
    }
  },
  CRYPTO: {
    url: 'https://api.coingecko.com/api/v3/coins/markets',
    params: {
      vs_currency: 'usd',
      ids: 'bitcoin,ethereum,dogecoin',
      price_change_percentage: '24h'
    },
    fallback: [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        price: 42000,
        change: 2.5,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        price: 2800,
        change: -1.2,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      },
      {
        id: 'dogecoin',
        name: 'Dogecoin',
        symbol: 'DOGE',
        price: 0.15,
        change: 5.8,
        image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png'
      }
    ]
  },
  NEWS: {
    url: 'https://newsdata.io/api/1/news',
    params: {
      country: 'us',
      category: 'technology',
      apikey: process.env.NEXT_PUBLIC_NEWS_API_KEY
    },
    fallback: [
      {
        title: 'Latest in Tech: AI Breakthroughs Announced',
        source: 'TechNews',
        description: 'Major advancements in AI technology revealed this week',
        url: '#'
      },
      {
        title: 'New JavaScript Framework Gains Popularity',
        source: 'DevDaily',
        description: 'Developers flocking to new framework with innovative features',
        url: '#'
      }
    ]
  }
};

// Custom hook for fetching data with error handling and retry logic
const useApiData = (apiConfig, intervalTime) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(apiConfig.url, {
        params: apiConfig.params,
       
      });
      
      if (response.data) {
        setData(response.data);
        setError(null);
      }
    } catch (err) {
      console.error(`Error fetching ${apiConfig.url}:`, err);
      setError(err.message);
      
      // Use fallback data if available
      if (apiConfig.fallback) {
        setData(apiConfig.fallback);
      }
      
      // Retry logic (max 3 retries)
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData();
        }, 5000); // Retry after 5 seconds
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const interval = intervalTime ? setInterval(fetchData, intervalTime) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [retryCount]);

  return { data, loading, error, retry: () => setRetryCount(0) };
};

// Weather data hook
const useWeatherData = () => {
  const { data, loading, error, retry } = useApiData(API_CONFIG.WEATHER, 300000);
  
  const processedData = useMemo(() => {
    if (!data) return null;
    
    return {
      temp: Math.round(data.main?.temp || API_CONFIG.WEATHER.fallback.temp),
      condition: data.weather?.[0]?.main || API_CONFIG.WEATHER.fallback.condition,
      humidity: data.main?.humidity || API_CONFIG.WEATHER.fallback.humidity,
      wind: Math.round(data.wind?.speed || API_CONFIG.WEATHER.fallback.wind),
      location: data.name || API_CONFIG.WEATHER.fallback.location,
      icon: data.weather?.[0]?.icon || API_CONFIG.WEATHER.fallback.icon
    };
  }, [data]);

  return { weatherData: processedData, loading, error, retry };
};

// Crypto data hook
const useCryptoData = () => {
  const { data, loading, error, retry } = useApiData(API_CONFIG.CRYPTO, 60000);
  
  const processedData = useMemo(() => {
    if (!data) return API_CONFIG.CRYPTO.fallback;
    
    return data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      change: coin.price_change_percentage_24h,
      image: coin.image
    }));
  }, [data]);

  return { cryptoData: processedData, loading, error, retry };
};

// News data hook
const useNewsData = () => {
  const { data, loading, error, retry } = useApiData(API_CONFIG.NEWS, 900000);
  
  const processedData = useMemo(() => {
    if (!data?.results) return API_CONFIG.NEWS.fallback;
    
    return data.results.slice(0, 5).map(article => ({
      title: article.title,
      source: article.source_id || 'Unknown',
      description: article.description || '',
      url: article.link || '#'
    }));
  }, [data]);

  return { newsData: processedData, loading, error, retry };
};

// Chart configuration functions with memoization
const useWeatherChartConfig = (temp) => {
  return useMemo(() => ({
    labels: ['Now', '+3h', '+6h', '+9h', '+12h'],
    datasets: [
      {
        label: 'Temperature (°F)',
        data: [
          temp,
          temp + (Math.random() * 3 - 1),
          temp + (Math.random() * 2 - 0.5),
          temp - (Math.random() * 2),
          temp - (Math.random() * 4)
        ].map(n => Math.round(n)),
        borderColor: 'rgba(234, 179, 8, 1)',
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(234, 179, 8, 1)',
        borderWidth: 2
      }
    ]
  }), [temp]);
};

const useActivityChartConfig = () => {
  return useMemo(() => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'API Requests',
        data: [1200, 1900, 1500, 2000, 1800, 2400, 2100],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        tension: 0.4,
        borderRadius: 6
      }
    ]
  }), []);
};

const useCryptoDistributionConfig = (cryptoData) => {
  return useMemo(() => ({
    labels: cryptoData.map(crypto => crypto.name),
    datasets: [
      {
        data: cryptoData.map(crypto => crypto.price * 100),
        backgroundColor: [
          'rgba(247, 144, 9, 0.8)',
          'rgba(78, 56, 156, 0.8)',
          'rgba(196, 162, 42, 0.8)'
        ],
        borderWidth: 0,
        hoverOffset: 20
      }
    ]
  }), [cryptoData]);
};

const useWeeklyActivityConfig = () => {
  return useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Website Visits',
        data: [5000, 7000, 6500, 8000, 9500, 11000, 12000],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 6
      },
      {
        label: 'API Calls',
        data: [3000, 4500, 5000, 6000, 7500, 9000, 10500],
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderRadius: 6
      }
    ]
  }), []);
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Main Dashboard Component
export default function Dashboard() {
  const { weatherData, loading: weatherLoading, error: weatherError, retry: retryWeather } = useWeatherData();
  const { cryptoData, loading: cryptoLoading, error: cryptoError, retry: retryCrypto } = useCryptoData();
  const { newsData, loading: newsLoading, error: newsError, retry: retryNews } = useNewsData();

  const [activeUsers, setActiveUsers] = useState(1248);
  const [apiRequests, setApiRequests] = useState(24593);

  // Chart configurations
  const weatherChartConfig = useWeatherChartConfig(weatherData?.temp || 72);
  const activityChartConfig = useActivityChartConfig();
  const cryptoDistributionConfig = useCryptoDistributionConfig(cryptoData);
  const weeklyActivityConfig = useWeeklyActivityConfig();

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 10));
      setApiRequests(prev => prev + Math.floor(Math.random() * 100));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Loading and error states
  const isLoading = weatherLoading || cryptoLoading || newsLoading;
  const hasErrors = weatherError || cryptoError || newsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-4xl uppercase font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 pb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-300 mt-2 md:mt-4 max-w-2xl mx-auto text-sm md:text-base">
            Real-time insights with interactive visualizations
          </p>
        </motion.div>

        {/* Error banners */}
        <AnimatePresence>
          {hasErrors && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <ErrorMessage 
                message="Some data may not be up to date due to connection issues"
                onRetry={() => {
                  if (weatherError) retryWeather();
                  if (cryptoError) retryCrypto();
                  if (newsError) retryNews();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8"
        >
          {/* Weather Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border border-gray-700 hover:border-yellow-400 transition-all duration-300 relative"
          >
            {weatherError && (
              <div className="absolute top-2 right-2 text-yellow-400">
                <FiAlertCircle title="Data may be outdated" />
              </div>
            )}
            
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-semibold flex items-center">
                {weatherData?.icon && (
                  <img 
                    src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`} 
                    alt="Weather icon"
                    className="w-8 h-8 mr-2"
                    loading="lazy"
                  />
                )}
                Weather
              </h2>
              <span className="bg-gray-700 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
                {weatherData?.location || '--'}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                {weatherData?.temp || '--'}°F
              </div>
              <div className="text-right">
                <div className="text-lg md:text-xl">{weatherData?.condition || '--'}</div>
                <div className="text-gray-400 text-sm md:text-base">
                  Feels like {weatherData ? weatherData.temp + 2 : '--'}°F
                </div>
              </div>
            </div>

            <div className="h-32 md:h-40 mb-4 md:mb-6">
              <Line 
                data={weatherChartConfig}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleColor: 'rgba(255, 255, 255, 0.9)',
                      bodyColor: 'rgba(255, 255, 255, 0.7)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      padding: 12,
                      cornerRadius: 8
                    }
                  },
                  scales: {
                    y: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index'
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
              <div className="bg-gray-700 p-2 md:p-3 rounded-lg hover:bg-gray-600 transition-colors">
                <FiDroplet className="mx-auto text-blue-400 text-lg md:text-xl" />
                <div className="mt-1 text-sm md:text-base">{weatherData?.humidity || '--'}%</div>
                <div className="text-xs text-gray-400">Humidity</div>
              </div>
              <div className="bg-gray-700 p-2 md:p-3 rounded-lg hover:bg-gray-600 transition-colors">
                <FiWind className="mx-auto text-green-400 text-lg md:text-xl" />
                <div className="mt-1 text-sm md:text-base">{weatherData?.wind || '--'} mph</div>
                <div className="text-xs text-gray-400">Wind</div>
              </div>
              <div className="bg-gray-700 p-2 md:p-3 rounded-lg hover:bg-gray-600 transition-colors">
                <FiCalendar className="mx-auto text-purple-400 text-lg md:text-xl" />
                <div className="mt-1 text-sm md:text-base">7-Day</div>
                <div className="text-xs text-gray-400">Forecast</div>
              </div>
            </div>
          </motion.div>

          {/* Crypto Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 relative"
          >
            {cryptoError && (
              <div className="absolute top-2 right-2 text-yellow-400">
                <FiAlertCircle title="Data may be outdated" />
              </div>
            )}
            
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 flex items-center">
              <FiTrendingUp className="mr-2 text-purple-500" />
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                Cryptocurrency
              </span>
            </h2>
            
            <div className="h-32 md:h-40 mb-4 md:mb-6">
              <Pie 
                data={cryptoDistributionConfig}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                          size: 10
                        },
                        usePointStyle: true
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.raw / 100;
                          return `${label}: $${value.toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}`;
                        }
                      },
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleColor: 'rgba(255, 255, 255, 0.9)',
                      bodyColor: 'rgba(255, 255, 255, 0.7)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      padding: 12,
                      cornerRadius: 8
                    }
                  }
                }}
              />
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {cryptoData.map((crypto) => (
                <div key={crypto.id} className="flex items-center justify-between p-2 md:p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex items-center">
                    {crypto.image && (
                      <img 
                        src={crypto.image} 
                        alt={crypto.name}
                        className="w-6 h-6 mr-2 md:mr-3"
                        loading="lazy"
                      />
                    )}
                    <div>
                      <div className="font-medium text-sm md:text-base">{crypto.name}</div>
                      <div className="text-xs md:text-sm text-gray-400">{crypto.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm md:text-base">
                      ${crypto.price.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                    <div className={`text-xs md:text-sm ${crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* News Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border border-gray-700 hover:border-blue-400 transition-all duration-300 relative"
          >
            {newsError && (
              <div className="absolute top-2 right-2 text-yellow-400">
                <FiAlertCircle title="Data may be outdated" />
              </div>
            )}
            
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
                Tech News
              </span>
            </h2>
            
            <div className="h-32 md:h-40 mb-4 md:mb-6">
              <Bar 
                data={activityChartConfig}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleColor: 'rgba(255, 255, 255, 0.9)',
                      bodyColor: 'rgba(255, 255, 255, 0.7)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      padding: 12,
                      cornerRadius: 8
                    }
                  },
                  scales: {
                    y: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  }
                }}
              />
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {newsData.map((news, index) => (
                <a 
                  key={index} 
                  href={news.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="font-medium text-sm md:text-base group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-2">
                    {news.title}
                  </div>
                  {news.description && (
                    <div className="text-gray-400 text-xs mt-1 line-clamp-1">
                      {news.description}
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{news.source}</span>
                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">Tech</span>
                  </div>
                  {index < newsData.length - 1 && (
                    <div className="border-t border-gray-700 mt-2 md:mt-3 pt-2 md:pt-3"></div>
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8"
        >
          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm md:text-base mb-1 md:mb-2">Active Users</h3>
                <div className="text-2xl md:text-3xl font-bold">{activeUsers.toLocaleString()}</div>
                <div className="text-xs md:text-sm opacity-90">+12% from last week</div>
              </div>
              <FiActivity className="text-2xl md:text-3xl opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm md:text-base mb-1 md:mb-2">API Requests</h3>
                <div className="text-2xl md:text-3xl font-bold">{apiRequests.toLocaleString()}</div>
                <div className="text-xs md:text-sm opacity-90">+32% from last week</div>
              </div>
              <FiTrendingUp className="text-2xl md:text-3xl opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm md:text-base mb-1 md:mb-2">Data Accuracy</h3>
                <div className="text-2xl md:text-3xl font-bold">99.8%</div>
                <div className="text-xs md:text-sm opacity-90">Real-time updates</div>
              </div>
              <FiCalendar className="text-2xl md:text-3xl opacity-80" />
            </div>
          </div>
        </motion.div>

        {/* Full Width Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border border-gray-700 mb-8"
        >
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Weekly Activity Overview</h2>
          <div className="h-60 md:h-80">
            <Bar 
              data={weeklyActivityConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: 'rgba(255, 255, 255, 0.7)',
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: 'rgba(255, 255, 255, 0.9)',
                    bodyColor: 'rgba(255, 255, 255, 0.7)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8
                  }
                },
                scales: {
                  y: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index'
                }
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}