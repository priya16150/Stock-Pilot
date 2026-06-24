import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  FaStore, FaBarcode, FaChartLine, FaShoppingCart, 
  FaBox, FaUser, FaArrowRight, FaShieldAlt, FaCloud 
} from 'react-icons/fa'

const Home = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: <FaBarcode className="text-4xl text-indigo-600" />,
      title: 'Barcode Scanning',
      description: 'Quickly identify products with built-in barcode scanner'
    },
    {
      icon: <FaChartLine className="text-4xl text-indigo-600" />,
      title: 'Analytics Dashboard',
      description: 'Track sales, inventory, and performance metrics'
    },
    {
      icon: <FaShoppingCart className="text-4xl text-indigo-600" />,
      title: 'Smart Checkout',
      description: 'Efficient billing with automatic inventory updates'
    },
    {
      icon: <FaBox className="text-4xl text-indigo-600" />,
      title: 'Inventory Management',
      description: 'Real-time stock tracking with low stock alerts'
    },
    {
      icon: <FaShieldAlt className="text-4xl text-indigo-600" />,
      title: 'Secure System',
      description: 'Protected by advanced security and authentication'
    },
    {
      icon: <FaCloud className="text-4xl text-indigo-600" />,
      title: 'Cloud-Based',
      description: 'Access your data from anywhere, anytime'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Products Scanned' },
    { number: '500+', label: 'Happy Customers' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaStore className="text-3xl text-indigo-600" />
            <span className="text-2xl font-bold text-indigo-600">StockPilot</span>
          </div>
          <div className="space-x-4">
            {user ? (
              <Link to="/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Smart Supermarket Management
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Streamline your inventory, track sales, and manage your supermarket efficiently with StockPilot
          </p>
          {!user && (
            <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition inline-flex items-center">
              Start Free Trial
              <FaArrowRight className="ml-2" />
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center">
              <p className="text-3xl font-bold text-indigo-600">{stat.number}</p>
              <p className="text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
          Everything You Need to Manage Your Store
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Store?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of store owners using StockPilot</p>
          {!user ? (
            <Link to="/register" className="px-8 py-4 bg-white text-indigo-600 text-lg rounded-lg hover:bg-gray-100 transition inline-flex items-center">
              Get Started Now
              <FaArrowRight className="ml-2" />
            </Link>
          ) : (
            <Link to="/dashboard" className="px-8 py-4 bg-white text-indigo-600 text-lg rounded-lg hover:bg-gray-100 transition inline-flex items-center">
              Go to Dashboard
              <FaArrowRight className="ml-2" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <FaStore className="text-2xl text-indigo-600" />
              <span className="text-xl font-bold text-indigo-600">StockPilot</span>
            </div>
            <p className="text-gray-600 text-sm mt-4 md:mt-0">
              © 2024 StockPilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home