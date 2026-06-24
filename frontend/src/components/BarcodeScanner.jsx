import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaBarcode, FaSun, FaMoon, FaTools } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const BarcodeScanner = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen premium-gradient pb-12">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-20 p-4 border-b border-white/50 mb-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {user?.role === 'admin' ? (
            <button onClick={() => navigate('/dashboard')} className="flex items-center px-4 py-2 text-indigo-600 hover:bg-white/60 rounded-lg transition-colors font-medium">
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          ) : (
            <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
              Logout
            </button>
          )}
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleTheme} 
              className="mr-4 relative p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </button>
            <FaBarcode className="text-2xl text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Barcode Scanner</h1>
          </div>
          <div className="w-32"></div>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="glass-panel rounded-2xl shadow-sm border border-white/50 p-16 flex flex-col items-center justify-center min-h-[500px]">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-indigo-200 mb-8"
          >
            <FaTools className="text-8xl" />
          </motion.div>
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Coming Soon!</h2>
          <p className="text-gray-600 text-lg text-center max-w-lg">
            We are currently upgrading our Barcode Scanner feature to provide you with a faster and more reliable scanning experience. 
            Check back soon!
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default BarcodeScanner