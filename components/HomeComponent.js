import Link from "next/link";
import { FaCloudSun, FaBitcoin, FaNewspaper, FaTachometerAlt, FaRocket } from "react-icons/fa";
import { motion, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function HomeComponent() {
  const [isMobile, setIsMobile] = useState(false);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <div ref={ref} style={{
      backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2OwLqwnL09QW0vRxR9Mve2GV7crQF07Qu3Q&sp")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }} className="min-h-screen text-white flex flex-col items-center justify-start px-4 py-8 md:py-12 overflow-x-hidden">
      {/* 🌟 Hero Section - Enhanced */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 20 }
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center w-full max-w-4xl mx-auto py-8 md:py-16 px-4"
      >
        <div className="flex justify-center mb-4 md:mb-6">
          <motion.div
            animate={{ 
              rotate: isMobile ? [0, 5, -5, 0] : [0, 10, -10, 0],
              y: isMobile ? [0, -5, 0] : [0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            <div className="relative">
              <FaRocket className="text-yellow-400 text-3xl md:text-4xl z-10 relative" />
              <motion.div 
                className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-70"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
          </motion.div>
        </div>
        
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl pb-2 font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 px-2 tracking-tight"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{
            visible: { opacity: 1 },
            hidden: { opacity: 0 }
          }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          CryptoWeather Nexus
        </motion.h1>
        
        <motion.p 
          className="text-gray-300 text-lg md:text-xl lg:text-2xl mt-4 md:mt-6 max-w-2xl mx-auto leading-relaxed px-2"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{
            visible: { opacity: 1 },
            hidden: { opacity: 0 }
          }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Your <span className="text-yellow-400 font-semibold">all-in-one</span> dashboard for real-time <span className="text-blue-300">weather</span> and <span className="text-orange-300">crypto</span> data.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{
            visible: { opacity: 1 },
            hidden: { opacity: 0 }
          }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 md:mt-10"
        >
          <Link href="/dashboard" legacyBehavior>
            <motion.a
              whileHover={{ 
                scale: !isMobile ? 1.05 : 1,
                boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 text-lg md:text-xl font-bold rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">Explore Dashboard →</span>
              <motion.span 
                className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
              />
            </motion.a>
          </Link>
        </motion.div>
      </motion.section>

      {/* 🔥 Features Grid - Enhanced */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={controls}
        variants={{
          visible: { opacity: 1 },
          hidden: { opacity: 0 }
        }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-8 md:mt-12 w-full max-w-6xl px-4 md:px-6"
      >
        <FeatureCard
          title="Dashboard"
          icon={<FaTachometerAlt className="text-blue-400" />}
          description="All metrics at a glance with customizable widgets"
          link="/dashboard"
          delay={0.1}
          isMobile={isMobile}
          color="blue"
        />
        <FeatureCard
          title="Weather"
          icon={<FaCloudSun className="text-yellow-400" />}
          description="Hyper-local forecasts with severe weather alerts"
          link="/weather"
          delay={0.2}
          isMobile={isMobile}
          color="yellow"
        />
        <FeatureCard
          title="Crypto"
          icon={<FaBitcoin className="text-orange-400" />}
          description="Live market data with price alerts"
          link="/crypto"
          delay={0.3}
          isMobile={isMobile}
          color="orange"
        />
        <FeatureCard
          title="News"
          icon={<FaNewspaper className="text-green-400" />}
          description="Curated financial updates and analysis"
          link="/news"
          delay={0.4}
          isMobile={isMobile}
          color="green"
        />
      </motion.section>

      {/* ✨ Additional Decorative Elements */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={controls}
        variants={{
          visible: { opacity: 1 },
          hidden: { opacity: 0 }
        }}
        transition={{ delay: 1, duration: 1 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-yellow-400/10 to-orange-500/10"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(40px)"
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// Enhanced Feature Card Component
function FeatureCard({ title, icon, description, link, delay, isMobile, color }) {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/20 hover:border-blue-400/50",
    yellow: "from-yellow-500/10 to-yellow-600/20 hover:border-yellow-400/50",
    orange: "from-orange-500/10 to-orange-600/20 hover:border-orange-400/50",
    green: "from-green-500/10 to-green-600/20 hover:border-green-400/50"
  };

  return (
    <Link href={link} legacyBehavior>
      <motion.a
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: "backOut" }}
        whileHover={{ 
          y: isMobile ? 0 : -15,
          scale: isMobile ? 1 : 1.03
        }}
        className="block"
      >
        <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center transition-all duration-500 h-full hover:shadow-lg hover:shadow-${color}-500/10`}>
          <div className={`bg-gradient-to-br from-${color}-500/20 to-${color}-600/30 p-4 md:p-5 rounded-2xl mb-6 md:mb-8 transition-all duration-500 group-hover:scale-110`}>
            <div className="text-3xl md:text-4xl">
              {icon}
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">{title}</h3>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed md:leading-relaxed mb-4">{description}</p>
          <div className={`mt-4 md:mt-6 text-${color}-400 text-sm md:text-base font-medium flex items-center transition-all duration-300 group-hover:translate-x-1`}>
            Explore <span className="ml-2">→</span>
          </div>
        </div>
      </motion.a>
    </Link>
  );
}