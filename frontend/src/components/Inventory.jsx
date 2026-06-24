import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSearch, FaBell, FaBoxOpen, FaSun, FaMoon, FaCamera, FaUpload, FaMagic, FaTruck, FaShoppingCart, FaBarcode, FaHome, FaBox, FaPrint } from 'react-icons/fa'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import BarcodePrinter from './BarcodePrinter'

const Inventory = ({ isEmbedded = false }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [suppliers, setSuppliers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: 'grocery',
    price: '',
    quantity: '',
    min_quantity: '5',
    supplier: '',
    image_url: ''
  })
  const [lowStockItems, setLowStockItems] = useState([])
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [showBarcodePrinter, setShowBarcodePrinter] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
    checkLowStock()
    
    // Real-time polling every 5 seconds
    const interval = setInterval(() => {
      fetchProducts(true)
      checkLowStock(true)
    }, 5000)

    // Check if we have product data from scanner
    if (location.state?.productData) {
      const product = location.state.productData
      setFormData({
        name: product.name || '',
        barcode: product.barcode || '',
        category: product.category || 'grocery',
        price: product.price || '',
        quantity: product.quantity || '',
        min_quantity: product.min_quantity || '5',
        supplier: product.supplier || '',
        image_url: product.image_url || ''
      })
      setShowAddModal(true)
    }
    
    return () => clearInterval(interval)
  }, [location])

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/api/suppliers')
      setSuppliers(response.data)
    } catch (error) {
      console.error('Failed to fetch suppliers')
    }
  }

  const fetchProducts = async (isBackground = false) => {
    try {
      const response = await axios.get('/api/products')
      setProducts(response.data)
    } catch (error) {
      if (!isBackground) toast.error('Failed to load products')
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  const checkLowStock = async (isBackground = false) => {
    try {
      const response = await axios.get('/api/inventory/low-stock')
      setLowStockItems(response.data)
      if (response.data.length > 0 && !isBackground) {
        toast((t) => (
          <div className="flex items-center">
            <FaBell className="text-red-500 mr-2 animate-bounce" />
            <span>{response.data.length} item(s) are low on stock!</span>
          </div>
        ), { duration: 5000 })
      }
    } catch (error) {
      if (!isBackground) console.error('Error checking low stock:', error)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, formData)
        toast.success('Product updated successfully')
      } else {
        await axios.post('/api/products', formData)
        toast.success('Product added successfully')
      }
      setShowAddModal(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        barcode: '',
        category: 'grocery',
        price: '',
        quantity: '',
        min_quantity: '5',
        supplier: '',
        image_url: ''
      })
      fetchProducts()
      checkLowStock()
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Failed to save product')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      min_quantity: product.min_quantity || '5',
      supplier: product.supplier || '',
      image_url: product.image_url || ''
    })
    setShowAddModal(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${productId}`)
        toast.success('Product deleted successfully')
        fetchProducts()
        checkLowStock()
      } catch (error) {
        toast.error('Failed to delete product')
      }
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAIAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first')
      return
    }

    setAiLoading(true)
    
    const reader = new FileReader()
    reader.readAsDataURL(selectedImage)
    reader.onload = async () => {
      try {
        const response = await axios.post('/api/ai/analyze-image', {
          image: reader.result
        })
        
        const aiData = response.data
        
        setFormData(prev => ({
          ...prev,
          name: aiData.product_name || '',
          category: aiData.category || 'grocery',
          price: aiData.estimated_price_in_inr || ''
        }))
        
        setShowAIModal(false)
        setSelectedImage(null)
        setImagePreview('')
        setShowAddModal(true)
        
        toast.success('Image analyzed successfully!')
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to analyze image')
      } finally {
        setAiLoading(false)
      }
    }
    reader.onerror = () => {
      setAiLoading(false)
      toast.error('Failed to read image file')
    }
  }

  const closeAIModal = () => {
    setShowAIModal(false)
    setSelectedImage(null)
    setImagePreview('')
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  )

  return (
    <>
    <div className={`${!isEmbedded ? 'min-h-screen premium-gradient pb-12' : 'pb-8'} ${showBarcodePrinter ? 'print:hidden' : ''}`}>
      {/* Header */}
      {!isEmbedded && (
      <header className="glass-panel sticky top-0 z-20 p-4 border-b border-white/50 mb-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button onClick={() => navigate('/dashboard')} className="flex items-center px-4 py-2 text-indigo-600 hover:bg-white/60 rounded-lg transition-colors font-medium">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          <Link to="/inventory" className="flex items-center px-4 py-3 text-gray-600 hover:bg-white/60 hover:text-indigo-600 rounded-lg transition-colors">
            <FaBox className="mr-3 text-lg" />
            Inventory
          </Link>
          <Link to="/suppliers" className="flex items-center px-4 py-3 text-gray-600 hover:bg-white/60 hover:text-indigo-600 rounded-lg transition-colors">
            <FaTruck className="mr-3 text-lg" />
            Suppliers
          </Link>
            
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleTheme} 
              className="mr-4 relative p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </button>
            <FaBoxOpen className="text-2xl text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Inventory Management</h1>
          </div>
        </div>
      </header>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-6"
      >
        {/* Controls */}
        <div className="glass-panel rounded-2xl shadow-sm border border-white/50 p-4 mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBarcodePrinter(true)}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center shadow-sm font-medium"
            >
              <FaPrint className="mr-2 text-indigo-600" />
              Print Labels
            </button>
            <button
              onClick={() => {
                setEditingProduct(null)
                setFormData({
                  name: '',
                  barcode: '',
                  category: 'grocery',
                  price: '',
                  quantity: '',
                  min_quantity: '5',
                  supplier: '',
                  image_url: ''
                })
                setShowAddModal(true)
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
            <div className="flex items-center">
              <FaBell className="text-red-500 text-xl mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">Low Stock Alert</p>
                <p className="text-sm text-red-700">
                  {lowStockItems.map(item => `${item.name} (${item.quantity} left)`).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64 glass-panel rounded-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl shadow-sm border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/40 border-b border-gray-200/60">
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Product</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Barcode</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Price</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Quantity</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Status</th>
                    <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredProducts.map((product, index) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03 }}
                        key={product.id} 
                        className="border-b border-gray-100/50 hover:bg-white/60 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                              {product.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.supplier || 'No Supplier'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-sm text-gray-600">{product.barcode}</td>
                        <td className="py-4 px-6 text-gray-600 capitalize">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium text-emerald-600">₹{product.price}</td>
                        <td className="py-4 px-6 font-medium text-gray-700">{product.quantity}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm border ${
                            product.quantity <= product.min_quantity 
                              ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' 
                              : 'bg-green-100 text-green-700 border-green-200'
                          }`}>
                            {product.quantity <= product.min_quantity ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTrash />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="grocery">Grocery</option>
                  <option value="dairy">Dairy</option>
                  <option value="beverages">Beverages</option>
                  <option value="snacks">Snacks</option>
                  <option value="fruits">Fruits</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="meat">Meat</option>
                  <option value="bakery">Bakery</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Quantity Alert</label>
                <input
                  type="number"
                  name="min_quantity"
                  value={formData.min_quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Image Upload Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
            <button 
              onClick={closeAIModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl leading-none"
              disabled={aiLoading}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaMagic className="mr-2 text-purple-500" />
              Smart Product Addition
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Upload a picture of a product and let our AI automatically identify its name, category, and estimated price.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 text-center hover:bg-gray-50 transition relative overflow-hidden group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={aiLoading}
                capture="environment"
              />
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img src={imagePreview} alt="Preview" className="h-32 object-contain mb-3 rounded" />
                  <p className="text-sm text-indigo-600 font-medium group-hover:text-indigo-700 transition">Click to change image</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FaCamera className="text-4xl text-gray-400 mb-3 group-hover:text-indigo-400 transition" />
                  <p className="text-gray-600 mb-1 font-medium">Click to take a photo or upload file</p>
                  <p className="text-xs text-gray-400">Supports JPG, PNG</p>
                </div>
              )}
            </div>

            <button
              onClick={handleAIAnalyze}
              disabled={!selectedImage || aiLoading}
              className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center transition-colors ${
                !selectedImage || aiLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 shadow-md'
              }`}
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  Analyze Image
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Barcode Printer Overlay */}
      {showBarcodePrinter && (
        <BarcodePrinter 
          products={products} 
          onClose={() => setShowBarcodePrinter(false)} 
        />
      )}
    </div>
    </>
  )
}

export default Inventory