import Link from "next/link";
import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { FaBitcoin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Crypto", href: "/crypto" },
    { name: "Weather", href: "/weather" },
    { name: "News", href: "/news" },
  ];

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 mb-40 ${
        scrolled
          ? "bg-gray-900/95 backdrop-blur-sm py-2 shadow-xl"
          : "bg-gray-900 py-4"
      }`}
    >
      <nav className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 100,
            damping: 10,
          }}
          whileHover={{ scale: 1.05 }}
        >
          <Link href="/" className="flex items-center group">
            <motion.span
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mr-3"
            >
              <FaBitcoin className="text-yellow-400 text-2xl group-hover:text-yellow-300 transition-colors" />
            </motion.span>

            <h1 className="text-yellow-500 text-base md:text-2xl font-semibold uppercase tracking-wider group-hover:text-yellow-300 transition-colors">
              <span className="text-sm text-blue-500 lowercase">Crypto</span>{" "}
              Weather Nexus
            </h1>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <motion.div
              key={link.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={link.href}
                className="text-white hover:text-yellow-300 transition-colors font-medium relative group"
              >
                {link.name}
                <span className="absolute left-0 bottom-0 h-0.5 bg-yellow-400 w-0 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </motion.button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-sm shadow-lg"
            >
              <div className="flex flex-col space-y-4 p-4">
                {navLinks.map((link) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ backgroundColor: "rgba(253, 224, 71, 0.1)" }}
                  >
                    <Link
                      href={link.href}
                      className="block text-white hover:text-yellow-300 py-2 px-4 rounded transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
