import React, { useState, useEffect } from 'react'
import { Line, Bar, Pie } from 'react-chartjs-2'
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
import { FaDownload, FaCalendar, FaChartLine, FaBox, FaMoneyBill } from 'react-icons/fa'
import axios from 'axios'
import toast from 'react-hot-toast'

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

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week')
  const [analyticsData, setAnalyticsData] = useState({
    weekly: [],
    monthly: [],
    categoryData: [],
    topProducts: [],
    stats: {
      totalRevenue: 0,
      totalSales: 0,
      averageOrderValue: 0,
      topCategory: ''
    }
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const [weeklyRes, monthlyRes, categoryRes, topProductsRes] = await Promise.all([
        axios.get('/api/dashboard/weekly-analysis'),
        axios.get('/api/dashboard/monthly-analysis'),
        axios.get('/api/dashboard/category-analysis'),
        axios.get('/api/dashboard/top-products')
      ])

      setAnalyticsData({
        weekly: weeklyRes.data || [],
        monthly: monthlyRes.data || [],
        categoryData: categoryRes.data || [],
        topProducts: topProductsRes.data || [],
        stats: {
          totalRevenue: weeklyRes.data.reduce((sum, d) => sum + (d.revenue || 0), 0),
          totalSales: weeklyRes.data.reduce((sum, d) => sum + (d.sales || 0), 0),
          averageOrderValue: weeklyRes.data.length > 0 
            ? weeklyRes.data.reduce((sum, d) => sum + (d.revenue || 0), 0) / weeklyRes.data.reduce((sum, d) => sum + (d.sales || 0), 0)
            : 0,
          topCategory: 'grocery'
        }
      })
    } catch (error) {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const weeklyChartData = {
    labels: analyticsData.weekly.map(d => d.day || 'Unknown'),
    datasets: [
      {
        label: 'Revenue',
        data: analyticsData.weekly.map(d => d.revenue || 0),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Sales',
        data: analyticsData.weekly.map(d => d.sales || 0),
        borderColor: 'rgb(52, 211, 153)',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  }

  const categoryChartData = {
    labels: analyticsData.categoryData.map(d => d.category || 'Other'),
    datasets: [
      {
        label: 'Revenue by Category',
        data: analyticsData.categoryData.map(d => d.revenue || 0),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(52, 211, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(244, 63, 94, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 2,
      }
    ]
  }

  const topProductsData = {
    labels: analyticsData.topProducts.map(p => p.name || 'Unknown'),
    datasets: [
      {
        label: 'Units Sold',
        data: analyticsData.topProducts.map(p => p.total_sold || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your store performance</p>
        </div>
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center">
            <FaDownload className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                ₹{analyticsData.stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaMoneyBill className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {analyticsData.stats.totalSales}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaChartLine className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                ₹{analyticsData.stats.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaBox className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Category</p>
              <p className="text-2xl font-bold text-gray-800 mt-1 capitalize">
                {analyticsData.stats.topCategory}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FaCalendar className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Performance</h3>
          <div style={{ height: '300px' }}>
            <Line data={weeklyChartData} options={options} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Category</h3>
          <div style={{ height: '300px' }}>
            <Pie data={categoryChartData} options={pieOptions} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h3>
          <div style={{ height: '300px' }}>
            <Bar data={topProductsData} options={options} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h3>
          <div className="space-y-4">
            {analyticsData.weekly.slice(0, 7).map((day, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <p className="font-medium text-gray-800">{day.day}</p>
                  <p className="text-sm text-gray-500">{day.sales || 0} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">₹{(day.revenue || 0).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics