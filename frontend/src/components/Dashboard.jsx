import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { 
  FaHome, FaBarcode, FaBox, FaShoppingCart, FaUser, 
  FaSignOutAlt, FaChartLine, FaBell, FaDownload, FaMoon, FaSun, FaTimes, FaSearch, FaTruck
} from 'react-icons/fa'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
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
} from 'chart.js'
import toast from 'react-hot-toast'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Inventory from './Inventory'
import Casier from './Casier'
import Suppliers from './Suppliers'
import Profile from './Profile'

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
)

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [activeTab, setActiveTab] = useState('home')
  
  const [stats, setStats] = useState({
    total_products: 0,
    total_inventory_value: 0,
    low_stock_items: 0,
    total_sales: 0,
    total_revenue: 0,
    category_breakdown: []
  })
  const [fastMoving, setFastMoving] = useState([])
  const [weeklyAnalysis, setWeeklyAnalysis] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Scanner Modal State
  const [showScanner, setShowScanner] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [scanMode, setScanMode] = useState('inventory') // 'inventory' or 'casier'
  const [barcodeInput, setBarcodeInput] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }, [location])

  useEffect(() => {
    fetchDashboardData()
    checkLowStock()
    // Real-time polling every 5 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true) 
      checkLowStock(true)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const checkLowStock = async (isBackground = false) => {
    try {
      const response = await axios.get('/api/inventory/low-stock')
      // Custom filter for < 5 quantity as requested
      const criticalStock = response.data.filter(item => item.quantity < 5)
      setLowStockItems(criticalStock)
      
      if (criticalStock.length > 0 && !isBackground) {
        toast((t) => (
          <div className="flex flex-col items-start">
            <div className="flex items-center text-red-500 font-bold mb-1">
              <FaBell className="mr-2 animate-bounce" />
              Low Stock Alert!
            </div>
            <span>Low stock product:</span>
            <span className="text-sm font-semibold mt-1">{criticalStock.map(i => i.name).join(', ')}</span>
          </div>
        ), { duration: 6000 })
      }
    } catch (error) {
      if (!isBackground) console.error('Error checking low stock:', error)
    }
  }

  const fetchDashboardData = async (isBackground = false) => {
    try {
      const [statsRes, fastRes, weeklyRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/fast-moving'),
        axios.get('/api/dashboard/weekly-analysis')
      ])
      
      setStats(statsRes.data)
      setFastMoving(fastRes.data)
      setWeeklyAnalysis(weeklyRes.data)
    } catch (error) {
      if (!isBackground) {
        toast.error('Failed to load dashboard data')
      }
    } finally {
      if (!isBackground) {
        setLoading(false)
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const exportCSV = async () => {
    try {
      const response = await axios.get('/api/transactions?limit=1000')
      const transactions = response.data
      
      const headers = ['Transaction ID', 'Date', 'Type', 'Items', 'Total Amount', 'Payment Method']
      const rows = transactions.map(t => [
        t.id,
        new Date(t.created_at).toLocaleString(),
        t.transaction_type,
        t.items.map(i => `${i.product_name} (x${i.quantity})`).join(' | '),
        t.total_amount,
        t.payment_method
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Report exported successfully!')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const handleScan = async (e) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    setIsScanning(true)
    try {
      if (scanMode === 'inventory') {
        // Just navigate to inventory with the barcode pre-filled to add manually
        navigate('/dashboard', { state: { activeTab: 'inventory', productData: { barcode: barcodeInput } } })
        setActiveTab('inventory')
        setShowScanner(false)
        setBarcodeInput('')
      } else if (scanMode === 'casier') {
        // Fetch product and navigate to casier
        const response = await axios.get(`/api/products/barcode/${barcodeInput}`)
        navigate('/dashboard', { state: { activeTab: 'casier', productToAdd: response.data } })
        setActiveTab('casier')
        setShowScanner(false)
        setBarcodeInput('')
      }
    } catch (error) {
      if (scanMode === 'casier') {
        toast.error('Product not found in inventory. Cannot add to cart.')
      } else {
        // Even if not found, we can pre-fill the barcode in the add modal for inventory
        navigate('/dashboard', { state: { activeTab: 'inventory', productData: { barcode: barcodeInput } } })
        setActiveTab('inventory')
        setShowScanner(false)
        setBarcodeInput('')
      }
    } finally {
      setIsScanning(false)
    }
  }

  const weeklyChartData = {
    labels: weeklyAnalysis.map(day => day.day || 'Unknown'),
    datasets: [
      {
        label: 'Sales',
        data: weeklyAnalysis.map(day => day.sales || 0),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Revenue',
        data: weeklyAnalysis.map(day => day.revenue || 0),
        borderColor: 'rgb(52, 211, 153)',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  }

  const fastMovingData = {
    labels: fastMoving.map(item => item.name),
    datasets: [
      {
        label: 'Units Sold',
        data: fastMoving.map(item => item.total_sold),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(52, 211, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(244, 63, 94, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(52, 211, 153)',
          'rgb(251, 146, 60)',
          'rgb(244, 63, 94)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 2,
      }
    ]
  }

  const categoryData = {
    labels: (stats.category_breakdown || []).map(cat => cat._id || 'Uncategorized'),
    datasets: [
      {
        data: (stats.category_breakdown || []).map(cat => cat.count),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(244, 63, 94, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderWidth: 1,
      }
    ]
  }

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center w-full px-4 py-3 rounded-lg font-medium transition-colors ${
        activeTab === id
          ? 'bg-indigo-50 text-indigo-700 shadow-sm'
          : 'text-gray-600 hover:bg-white/60 hover:text-indigo-600'
      }`}
    >
      <Icon className="mr-3 text-lg" />
      {label}
    </button>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory': return <Inventory isEmbedded={true} />
      case 'casier': return <Casier isEmbedded={true} />
      case 'suppliers': return <Suppliers isEmbedded={true} />
      case 'profile': return <Profile isEmbedded={true} />
      case 'home':
      default:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 max-w-7xl mx-auto"
          >
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <motion.div whileHover={{ y: -4 }} className="glass-panel p-6 rounded-2xl shadow-sm border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FaBox className="text-6xl text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Total Products</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{loading ? '...' : stats.total_products}</p>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="glass-panel p-6 rounded-2xl shadow-sm border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FaChartLine className="text-6xl text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Inventory Value</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  ₹{loading ? '...' : stats.total_inventory_value?.toFixed(2) || '0.00'}
                </p>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="glass-panel p-6 rounded-2xl shadow-sm border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FaShoppingCart className="text-6xl text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Today's Sales</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{loading ? '...' : stats.total_sales || 0}</p>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="glass-panel p-6 rounded-2xl shadow-sm border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FaChartLine className="text-6xl text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Today's Revenue</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  ₹{loading ? '...' : stats.total_revenue?.toFixed(2) || '0.00'}
                </p>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="glass-panel p-6 rounded-2xl shadow-sm border border-white/50">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
                  Weekly Performance
                </h3>
                <div className="relative h-[300px]">
                  {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center animate-pulse rounded-lg"></div>}
                  <Line data={weeklyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl shadow-sm border border-white/50">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></span>
                  Fast Moving Products
                </h3>
                <div className="relative h-[300px]">
                  {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center animate-pulse rounded-lg"></div>}
                  <Bar data={fastMovingData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="glass-panel p-6 rounded-2xl shadow-sm border border-white/50">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-6 bg-pink-500 rounded-full mr-3"></span>
                  Products by Category
                </h3>
                <div className="relative h-[300px]">
                  {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center animate-pulse rounded-lg"></div>}
                  <Doughnut data={categoryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
                </div>
              </div>
            </div>

            {/* Low Stock Alert Custom Tamil Message */}
            {lowStockItems.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaBell className="text-red-500 text-xl" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-red-800 mb-1">
                      Intha product kami ya iruku nega purchase pananu
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {lowStockItems.map(item => (
                        <li key={item.id}>{item.name} (Qty: {item.quantity})</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Fast Moving Products List */}
            <div className="glass-panel p-6 rounded-2xl shadow-sm border border-white/50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-amber-500 rounded-full mr-3"></span>
                Top Selling Products
              </h3>
              <div className="overflow-x-auto rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200/60 bg-white/40">
                      <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 rounded-tl-lg">Product</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Units Sold</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Revenue</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fastMoving.map((item, index) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={item.id} 
                        className="border-b border-gray-100 hover:bg-white/60 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold">
                              {item.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-500">Barcode: {item.barcode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-700">{item.total_sold}</td>
                        <td className="py-3 px-4 font-medium text-emerald-600">₹{item.revenue?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${item.quantity > 10 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200 animate-pulse'}`}>
                            {item.quantity > 10 ? 'In Stock' : 'Low Stock'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 premium-gradient">
      {/* Sidebar */}
      <div className="w-64 glass-sidebar flex flex-col justify-between z-30">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-indigo-700 tracking-tight cursor-pointer" onClick={() => setActiveTab('home')}>StockPilot</h1>
          </div>
          <nav className="mt-2 space-y-1 px-3">
            <NavItem id="home" icon={FaHome} label="Dashboard" />
            
            {/* Barcode Scanner triggers modal instead of a route */}
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-white/60 hover:text-indigo-600 rounded-lg transition-colors font-medium"
            >
              <FaBarcode className="mr-3 text-lg" />
              Scanner
            </button>
            
            <NavItem id="inventory" icon={FaBox} label="Inventory" />
            <NavItem id="suppliers" icon={FaTruck} label="Suppliers" />
            <NavItem id="casier" icon={FaShoppingCart} label="Casier" />
            <NavItem id="profile" icon={FaUser} label="Profile" />
          </nav>
        </div>
        <div className="p-4 mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 w-full rounded-lg transition-colors font-medium"
          >
            <FaSignOutAlt className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto relative">
        <header className="glass-panel sticky top-0 z-10 p-6 border-b border-gray-200/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 capitalize">
                {activeTab === 'home' ? `Welcome back, ${user?.full_name || 'User'}!` : activeTab}
              </h2>
              {activeTab === 'home' && <p className="text-gray-600">Here's what's happening with your store</p>}
            </div>
            <div className="flex items-center space-x-4">
              {activeTab === 'home' && (
                <button 
                  onClick={exportCSV}
                  className="flex items-center px-4 py-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors font-medium shadow-sm"
                >
                  <FaDownload className="mr-2" />
                  Export CSV
                </button>
              )}
              
              <button 
                onClick={() => setShowScanner(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
              >
                <FaBarcode className="mr-2" />
                Scan
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-gray-600"
                >
                  <FaBell className="text-xl" />
                  {lowStockItems.length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  )}
                </button>
                {/* Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h4 className="font-bold text-gray-800">Notifications</h4>
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">{lowStockItems.length} New</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {lowStockItems.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 font-medium">No new notifications</div>
                      ) : (
                        lowStockItems.map(item => (
                          <div key={item.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 flex items-start">
                            <div className="text-red-500 mt-1 mr-3"><FaBell /></div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">Low Stock Alert: {item.name}</p>
                              <p className="text-xs text-gray-600 mt-1">Quantity is {item.quantity}. Please purchase soon.</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={toggleTheme} 
                className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {renderContent()}

        {/* Barcode Scanner Modal */}
        <AnimatePresence>
          {showScanner && (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaBarcode className="mr-2 text-indigo-600" />
                    Barcode Scanner
                  </h3>
                  <button onClick={() => setShowScanner(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-lg shadow-sm">
                    <FaTimes />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Select Mode</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setScanMode('inventory')}
                        className={`p-3 border-2 rounded-xl flex items-center justify-center transition-colors font-semibold ${
                          scanMode === 'inventory' 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <FaBox className="mr-2" /> Inventory
                      </button>
                      <button
                        onClick={() => setScanMode('casier')}
                        className={`p-3 border-2 rounded-xl flex items-center justify-center transition-colors font-semibold ${
                          scanMode === 'casier' 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <FaShoppingCart className="mr-2" /> Cashier
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleScan} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Scan or Enter Barcode</label>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                          autoFocus
                          required 
                          type="text" 
                          value={barcodeInput} 
                          onChange={e => setBarcodeInput(e.target.value)} 
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-lg font-mono" 
                          placeholder="e.g. 123456789"
                          disabled={isScanning}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button 
                        type="submit" 
                        disabled={isScanning}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-70 flex items-center justify-center"
                      >
                        {isScanning ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          'Process Barcode'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Dashboard