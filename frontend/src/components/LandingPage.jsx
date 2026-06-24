import React from 'react'
import { Link } from 'react-router-dom'
import { FaStore, FaBarcode, FaChartLine, FaShoppingCart } from 'react-icons/fa'
import { motion } from 'framer-motion'

const LandingPage = () => {
  return (
    <div className="min-h-screen premium-gradient overflow-hidden">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <FaStore className="text-4xl text-indigo-600" />
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">StockPilot</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-x-4 flex items-center"
        >
          <Link to="/login" className="px-5 py-2.5 text-indigo-700 hover:text-indigo-900 font-semibold transition-colors">
            Login
          </Link>
          <Link to="/register" className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Get Started
          </Link>
        </motion.div>
      </nav>

      <main className="container mx-auto px-6 py-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Supermarket Management</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-indigo-100/80 mb-12 leading-relaxed">
            Experience real-time inventory synchronization, instant barcode scanning, and intelligent analytics. Everything you need to run your store, beautifully engineered.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/register" className="px-10 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition inline-block">
              Start Free Trial Today
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -10 }}
            className="glass-panel p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaBarcode className="text-8xl text-indigo-600" />
            </div>
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
              <FaBarcode className="text-3xl text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Lightning Scanning</h3>
            <p className="text-gray-600 dark:text-indigo-100/70 leading-relaxed">Instantly identify products, update stock, and process checkouts with our ultra-fast barcode engine.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -10 }}
            className="glass-panel p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaChartLine className="text-8xl text-purple-600" />
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <FaChartLine className="text-3xl text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Real-Time Analytics</h3>
            <p className="text-gray-600 dark:text-indigo-100/70 leading-relaxed">Watch your sales and inventory update live. Make data-driven decisions with stunning visual dashboards.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -10 }}
            className="glass-panel p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaShoppingCart className="text-8xl text-emerald-600" />
            </div>
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <FaShoppingCart className="text-3xl text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Smart Point of Sale</h3>
            <p className="text-gray-600 dark:text-indigo-100/70 leading-relaxed">A beautifully designed cashier interface that syncs instantly with your inventory. Zero lag, maximum efficiency.</p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default LandingPage