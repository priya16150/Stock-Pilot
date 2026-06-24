import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaMinus, FaTrash, FaCreditCard, FaMoneyBill, FaBarcode, FaShoppingCart, FaPrint, FaTimes, FaMoon, FaSun, FaTruck, FaBox } from 'react-icons/fa'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Casier = ({ isEmbedded = false }) => {
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const [customerEmail, setCustomerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [scanning, setScanning] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    // Check if we have product from scanner
    if (location.state?.productToAdd) {
      addToCart(location.state.productToAdd)
    }
  }, [location])

  useEffect(() => {
    calculateTotal()
  }, [cart])

  const calculateTotal = () => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    setTotal(newTotal)
  }

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      toast.error(`${product.name} is completely out of stock!`)
      return
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      
      // product.quantity represents the total stock available from the DB
      const maxAvailable = product.quantity 

      if (existingItem) {
        if (existingItem.quantity >= maxAvailable) {
          setTimeout(() => toast.error(`Limit reached! Only ${maxAvailable} units of ${product.name} in stock.`), 0)
          return prevCart
        }
        setTimeout(() => toast.success(`${product.name} quantity increased`), 0)
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      
      setTimeout(() => toast.success(`${product.name} added to cart`), 0)
      return [...prevCart, { ...product, quantity: 1, maxStock: maxAvailable }]
    })
  }

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
    toast.success('Item removed from cart')
  }

  const updateQuantity = (productId, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change
          if (newQuantity <= 0) {
            return null
          }
          if (item.maxStock !== undefined && newQuantity > item.maxStock) {
            setTimeout(() => toast.error(`Limit reached! Only ${item.maxStock} units in stock.`), 0)
            return item
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      }).filter(item => item !== null)
    })
  }

  const handleBarcodeScan = async () => {
    if (!barcodeInput.trim()) return
    
    setScanning(true)
    try {
      const response = await axios.get(`/api/products/barcode/${barcodeInput}`)
      addToCart(response.data)
      setBarcodeInput('')
    } catch (error) {
      toast.error('Product not found')
    } finally {
      setScanning(false)
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    const transactionData = {
      transaction_type: 'sale',
      items: cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        barcode: item.barcode,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      total_amount: total,
      payment_method: paymentMethod,
      customer_email: customerEmail || undefined,
      cashier_id: 'user123' // In production, get from auth
    }

    try {
      await axios.post('/api/transactions', transactionData)
      toast.success('Transaction completed successfully!')
      setCurrentTransaction(transactionData)
      setShowReceiptModal(true)
      setCart([])
      setCustomerEmail('')
      setTotal(0)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Transaction failed')
      console.error('Transaction error:', error)
    }
  }

  return (
    <div className={!isEmbedded ? "min-h-screen premium-gradient pb-12" : "pb-8"}>
      {!isEmbedded && (
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
            <FaShoppingCart className="text-2xl text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Point of Sale (Casier)</h1>
          </div>
          <div className="w-32"></div>
        </div>
      </header>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto p-6"
      >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Products */}
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-2xl shadow-sm border border-white/50 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Cart Items</h2>
              
              {/* Barcode Input */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <FaBarcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan()}
                    placeholder="Scan or enter barcode..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={scanning}
                  />
                </div>
                {/* <button
                  onClick={handleBarcodeScan}
                  disabled={scanning}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {scanning ? 'Scanning...' : 'Add'}
                </button> */}
              </div>

              {/* Cart Items */}
              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white/40 rounded-xl border-2 border-dashed border-gray-200">
                  <FaShoppingCart className="text-5xl mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">Cart is empty</p>
                  <p className="text-sm mt-1">Scan or search products to add them to the cart</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        key={item.id} 
                        className="flex items-center justify-between p-4 bg-white/60 hover:bg-white/80 rounded-xl border border-white transition-colors shadow-sm"
                      >
                        <div className="flex-1 flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{item.name}</p>
                            <p className="text-sm font-medium text-emerald-600">₹{item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center bg-gray-100/50 rounded-lg p-1 border border-gray-200/50">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-md transition-all shadow-sm"
                            >
                              <FaMinus className="text-xs" />
                            </button>
                            <span className="font-bold w-10 text-center text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-md transition-all shadow-sm"
                            >
                              <FaPlus className="text-xs" />
                            </button>
                          </div>
                          <p className="font-bold text-gray-800 w-20 text-right">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                            title="Remove item"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Checkout */}
          <div className="lg:col-span-1">
            <div className="glass-panel rounded-2xl shadow-sm border border-white/50 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
                Order Summary
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email (Optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="customer@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2 rounded-lg border-2 transition ${
                        paymentMethod === 'cash'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:text-indigo-400'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <FaMoneyBill className="mx-auto text-xl mb-1" />
                      <span className="text-sm font-medium">Cash</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2 rounded-lg border-2 transition ${
                        paymentMethod === 'card'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:text-indigo-400'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <FaCreditCard className="mx-auto text-xl mb-1" />
                      <span className="text-sm font-medium">Card</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200/60 pt-6 mt-6">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-medium text-gray-700">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Tax (0%)</span>
                    <span className="font-medium text-gray-700">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold">
                    <span className="text-gray-800">Total</span>
                    <span className="text-indigo-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
                  >
                    <FaShoppingCart className="mr-2" />
                    Complete Purchase
                  </motion.button>

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear the cart?')) {
                        setCart([])
                        setCustomerEmail('')
                        toast.success('Cart cleared')
                      }
                    }}
                    disabled={cart.length === 0}
                    className="w-full py-3 text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && currentTransaction && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <style type="text/css">
              {`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printable-receipt, #printable-receipt * {
                    visibility: visible;
                  }
                  #printable-receipt {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    box-shadow: none !important;
                    border: none !important;
                  }
                  .print-hide {
                    display: none !important;
                  }
                }
              `}
            </style>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              {/* Printable Area */}
              <div id="printable-receipt" className="p-8 bg-white text-gray-800">
                <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-6">
                  <h2 className="text-2xl font-black tracking-tighter text-indigo-900 uppercase">StockPilot</h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium tracking-widest uppercase">Official Receipt</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date().toLocaleString()}</p>
                </div>
                
                <div className="mb-6 space-y-3">
                  {currentTransaction.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm font-medium">
                      <div className="flex-1 pr-4">
                        <span className="text-gray-800">{item.product_name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="text-gray-800 font-bold">₹{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-bold uppercase text-sm">Total Amount</span>
                    <span className="text-2xl font-black text-indigo-600">₹{currentTransaction.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500 font-medium">
                    <span>Payment Method</span>
                    <span className="uppercase">{currentTransaction.payment_method}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-medium">Thank you for shopping with us!</p>
                  <p className="text-xs text-gray-400 mt-1">Visit again</p>
                </div>
              </div>

              {/* Action Buttons (Hidden during print) */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 print-hide">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <FaTimes className="mr-2" /> Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center"
                >
                  <FaPrint className="mr-2" /> Print
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Casier