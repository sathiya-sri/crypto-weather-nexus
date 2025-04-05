import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNews } from "../store/newsSlice";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { FiExternalLink, FiClock, FiLoader, FiImage } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

export default function News() {
  const dispatch = useDispatch();
  const news = useSelector((state) => state.news);

  useEffect(() => {
    if (news.status === "idle") {
      dispatch(fetchNews());
    }
  }, [dispatch, news.status]);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.5 
      } 
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)"
    }
  };

  // Loading skeleton
  const SkeletonCard = () => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-2xl h-full border border-gray-700 overflow-hidden">
      <div className="animate-pulse space-y-4">
        <div className="h-40 bg-gray-700 rounded-xl w-full"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="flex justify-between pt-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );

  // Format date from API safely
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      return formatDistanceToNow(new Date(dateString.replace(/-/g, "/")), {
        addSuffix: true
      });
    } catch (e) {
      return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />

      <div className="px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-5xl lg:text-5xl font-semibold uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4 pb-4">
            Crypto Pulse
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm uppercase tracking-wider">
            Stay ahead with the latest developments in blockchain and cryptocurrency
          </p>
        </motion.div>

        {/* Loading state */}
        {news?.status === "loading" && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div variants={item} key={i}>
                <SkeletonCard />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Error state */}
        {news?.status === "failed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
            className="bg-gradient-to-br from-red-900/50 to-red-800/30 border border-red-700/50 rounded-2xl p-8 text-center max-w-2xl mx-auto backdrop-blur-sm"
          >
            <div className="bg-red-700/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FiLoader className="text-red-400 text-3xl animate-spin" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Failed to load news</h3>
            <p className="text-red-300 mb-6">{news.error || "Network error occurred"}</p>
            <button
              onClick={() => dispatch(fetchNews())}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl transition-all flex items-center justify-center mx-auto shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
            >
              <FiLoader className="mr-2 animate-spin" /> Retry
            </button>
          </motion.div>
        )}

        {/* Success state */}
        {news?.status === "succeeded" && news?.data.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {news?.data.map((article) => (
              <motion.a
                key={article.article_id || article.link}
                variants={item}
                whileHover="hover"
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-gradient-to-br from-gray-800/70 to-gray-800/50 hover:from-gray-800/80 hover:to-gray-800/60 border border-gray-700 hover:border-blue-500/50 rounded-2xl p-6 flex flex-col h-full transition-all duration-300 overflow-hidden backdrop-blur-sm"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Hover border effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/30 pointer-events-none transition-all duration-500"></div>

                {/* Article Image */}
                <div className="relative h-48 mb-5 rounded-xl overflow-hidden">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={"News Image"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <FiImage className="text-gray-500 text-4xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/10 to-transparent"></div>
                </div>

                <h3 className="text-xl font-semibold mb-3 relative z-10 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title || "Untitled"}
                </h3>

                {/* Categories */}
                {article.category?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.category.map((cat, i) => (
                      <motion.span
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="text-xs px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full backdrop-blur-sm"
                      >
                        {cat}
                      </motion.span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-4 relative z-10 border-t border-gray-700/50 group-hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <FiClock className="text-blue-400/80" />
                      <span>{formatDate(article.pubDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {article.source_icon && (
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          src={article.source_icon}
                          alt={article.source_name || "Source"}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-xl text-xs backdrop-blur-sm">
                        {article.source_name || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* External link indicator */}
                <div className="absolute top-5 right-5 bg-gray-800/80 group-hover:bg-blue-500/20 backdrop-blur-sm rounded-full p-2 transition-all duration-300">
                  <FiExternalLink className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                </div>
              </motion.a>
            ))}
          </motion.div>
        ) : (
          news?.status === "succeeded" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring" }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700/50 rounded-2xl p-8 text-center max-w-2xl mx-auto backdrop-blur-sm"
            >
              <div className="bg-blue-700/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FiImage className="text-blue-400 text-3xl" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">No news articles found</h3>
              <p className="text-gray-400 mb-6">The crypto world seems quiet at the moment</p>
              <button
                onClick={() => dispatch(fetchNews())}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
              >
                <FiLoader className="mr-2 animate-spin" /> Refresh
              </button>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}