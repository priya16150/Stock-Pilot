import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { 
  FaArrowLeft, FaTruck, FaPlus, FaCheck, FaTimes, FaBox, FaMoon, FaSun
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const Suppliers = ({ isEmbedded = false }) => {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('directory') // 'directory' or 'orders'
  const [suppliers, setSuppliers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Add supplier modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSupplier, setNewSupplier] = useState({
    name: '', contact_person: '', email: '', phone: '', address: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [suppRes, orderRes] = await Promise.all([
        axios.get('/api/suppliers'),
        axios.get('/api/suppliers/orders')
      ])
      setSuppliers(suppRes.data)
      setOrders(orderRes.data)
    } catch (error) {
      toast.error('Failed to load suppliers data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSupplier = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/suppliers', newSupplier)
      toast.success('Supplier added successfully!')
      setShowAddModal(false)
      setNewSupplier({ name: '', contact_person: '', email: '', phone: '', address: '' })
      fetchData()
    } catch (error) {
      toast.error('Failed to add supplier')
    }
  }

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return
    try {
      await axios.delete(`/api/suppliers/${id}`)
      toast.success('Supplier deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete supplier')
    }
  }

  const handleReceiveOrder = async (orderId) => {
    try {
      await axios.post(`/api/suppliers/orders/${orderId}/receive`)
      toast.success('Order marked as received! Inventory updated.')
      fetchData()
    } catch (error) {
      toast.error('Failed to receive order')
    }
  }

  return (
    <div className={!isEmbedded ? "min-h-screen premium-gradient pb-12" : "pb-8"}>
      {/* Header */}
      {!isEmbedded && (
      <header className="glass-panel sticky top-0 z-20 p-4 border-b border-white/50 mb-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button onClick={() => navigate('/dashboard')} className="flex items-center px-4 py-2 text-indigo-600 hover:bg-white/60 rounded-lg transition-colors font-medium">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleTheme} 
              className="mr-4 relative p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </button>
            <FaTruck className="text-2xl text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Suppliers & Restocking</h1>
          </div>
          <div className="w-32"></div>
        </div>
      </header>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
              activeTab === 'directory'
                ? 'bg-indigo-600 text-white shadow-indigo-200'
                : 'glass-panel text-gray-600 hover:text-indigo-600'
            }`}
          >
            Suppliers Directory
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-indigo-200'
                : 'glass-panel text-gray-600 hover:text-indigo-600'
            }`}
          >
            Purchase Orders
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeTab}
          >
            {activeTab === 'directory' && (
              <div className="glass-panel rounded-2xl shadow-sm border border-white/50 overflow-hidden">
                <div className="p-6 border-b border-white/50 flex justify-between items-center bg-white/20">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
                    Manage Suppliers
                  </h2>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-md shadow-indigo-200"
                  >
                    <FaPlus className="mr-2" />
                    Add Supplier
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Contact Person</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Phone</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">No suppliers found.</td></tr>
                      ) : (
                        suppliers.map(sup => (
                          <tr key={sup.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-white/40 dark:hover:bg-gray-800/40">
                            <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{sup.name}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-300">{sup.contact_person || '-'}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-300">{sup.email || '-'}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-300">{sup.phone || '-'}</td>
                            <td className="p-4">
                              <button onClick={() => handleDeleteSupplier(sup.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg">
                                <FaTimes />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="glass-panel rounded-2xl shadow-sm border border-white/50 overflow-hidden">
                <div className="p-6 border-b border-white/50 bg-white/20">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></span>
                    Auto-Restocking Orders
                  </h2>
                  <p className="text-gray-500 mt-2 text-sm">Orders are automatically created when a product drops below its minimum stock level.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-50/30 dark:bg-gray-800/30">
                  {orders.length === 0 ? (
                    <div className="col-span-2 p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      No pending purchase orders.
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                              {order.status}
                            </span>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-2">{order.product_name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Supplier: {order.supplier_name}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{order.quantity}</span>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Units</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-4">Ordered: {new Date(order.created_at).toLocaleString()}</p>
                        
                        {order.status === 'Pending' ? (
                          <button 
                            onClick={() => handleReceiveOrder(order.id)}
                            className="w-full py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-600 hover:text-white dark:hover:text-white transition font-medium flex items-center justify-center"
                          >
                            <FaCheck className="mr-2" /> Mark as Received
                          </button>
                        ) : (
                          <div className="w-full py-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg font-medium flex items-center justify-center cursor-not-allowed">
                            <FaCheck className="mr-2" /> Received on {new Date(order.received_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800">Add New Supplier</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-lg shadow-sm">
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                  <input required type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="e.g. Fresh Farms Ltd"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Person</label>
                  <input type="text" value={newSupplier.contact_person} onChange={e => setNewSupplier({...newSupplier, contact_person: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="John Doe"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                    <input type="email" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="john@example.com"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="+1 234 567 8900"/>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">
                    Save Supplier
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Suppliers
