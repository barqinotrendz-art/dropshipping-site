import React from 'react'
import { Link } from 'react-router-dom'
import { ADMIN_BASE_PATH } from '../../constants/routes'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { 
  HiCurrencyDollar, 
  HiShoppingBag, 
  HiUsers, 
  HiClipboardList,
  HiFolder,
  HiExclamationCircle,
  HiTrendingDown,
  HiChatAlt
} from 'react-icons/hi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

async function fetchDashboardStats() {
  const [productsSnap, ordersSnap, usersSnap, reviewsSnap] = await Promise.all([
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'orders')),
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'reviews'))
  ])

  const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const reviews = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Calculate metrics
  const totalRevenue = orders
    .filter((order: any) => order.status?.toLowerCase() !== 'cancelled')
    .reduce((sum: number, order: any) => sum + (order.totals?.grandTotal || 0), 0)
  const pendingOrders = orders.filter((order: any) => order.status?.toLowerCase() === 'pending').length
  const lowStockProducts = products.filter((product: any) => (product.stock || 0) < 10).length
  const pendingReviews = reviews.filter((review: any) => review.status === 'pending').length

  // Recent orders
  const recentOrders = orders
    .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 5)

  return {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue,
    pendingOrders,
    lowStockProducts,
    pendingReviews,
    recentOrders
  }
}

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: fetchDashboardStats
  })

  const pendingOrdersCount = stats?.pendingOrders ?? 0
  const lowStockCount = stats?.lowStockProducts ?? 0
  const pendingReviewsCount = stats?.pendingReviews ?? 0

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <LoadingSpinner size="xl" text="Loading dashboard..." />
    </div>
  )

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your store and monitor performance</p>
      </div>

      {pendingReviewsCount > 0 && (
        <div className="mb-6">
          <div className="relative overflow-hidden rounded-xl border-2 border-orange-400 bg-orange-50 p-4 sm:p-5 shadow-md animate-pulse">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-3 rounded-full bg-orange-500 text-white flex-shrink-0">
                  <HiChatAlt className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-orange-800">Pending Reviews Require Attention</h2>
                  <p className="text-xs sm:text-sm text-orange-700 mt-1">
                    {pendingReviewsCount} {pendingReviewsCount === 1 ? 'customer review is' : 'customer reviews are'} waiting for moderation. Approve or reject promptly to keep trust high.
                  </p>
                </div>
              </div>
              <Link
                to={`${ADMIN_BASE_PATH}/reviews`}
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md shadow hover:bg-orange-600 transition-colors w-full sm:w-auto"
              >
                Review Now
              </Link>
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200 opacity-60 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                Rs {(stats?.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
              <HiCurrencyDollar className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats?.totalOrders || 0}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <HiClipboardList className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats?.totalProducts || 0}</p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
              <HiShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats?.totalUsers || 0}</p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
              <HiUsers className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 mt-6 sm:mt-8">
          <div
            className={`rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow ${
              pendingOrdersCount > 0
                ? 'bg-red-50 border-2 border-red-300 animate-pulse'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                  pendingOrdersCount > 0 ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
                }`}
              >
                <HiExclamationCircle
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${pendingOrdersCount > 0 ? 'text-red-600' : 'text-gray-500'}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className={`font-semibold text-base sm:text-lg ${pendingOrdersCount > 0 ? 'text-red-800' : 'text-gray-800'}`}>
                    ⚠️ Pending Orders
                  </p>
                  <span
                    className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide self-start ${
                      pendingOrdersCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {pendingOrdersCount > 0 ? 'Action Required' : 'All Clear'}
                  </span>
                </div>
                <p
                  className={`text-xs sm:text-sm mt-2 leading-5 sm:leading-6 ${
                    pendingOrdersCount > 0 ? 'text-red-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {pendingOrdersCount} {pendingOrdersCount === 1 ? 'order is' : 'orders are'} waiting for approval. Review immediately to keep customers updated.
                </p>
                {pendingOrdersCount > 0 && (
                  <div className="mt-3">
                    <Link
                      to={`${ADMIN_BASE_PATH}/orders`}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-red-700 transition-colors"
                    >
                      Go to Orders
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className={`rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow ${
              lowStockCount > 0
                ? 'bg-red-50 border-2 border-red-300 animate-pulse'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                  lowStockCount > 0 ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
                }`}
              >
                <HiTrendingDown
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-500'}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className={`font-semibold text-base sm:text-lg ${lowStockCount > 0 ? 'text-red-800' : 'text-gray-800'}`}>
                    🚨 Low Stock Alert
                  </p>
                  <span
                    className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide self-start ${
                      lowStockCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {lowStockCount > 0 ? 'Restock Now' : 'All Clear'}
                  </span>
                </div>
                <p
                  className={`text-xs sm:text-sm mt-2 leading-5 sm:leading-6 ${
                    lowStockCount > 0 ? 'text-red-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {lowStockCount} {lowStockCount === 1 ? 'product is' : 'products are'} below the safety threshold. Refill inventory to avoid backorders.
                </p>
                {lowStockCount > 0 && (
                  <div className="mt-3">
                    <Link
                      to={`${ADMIN_BASE_PATH}/inventory`}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-red-700 transition-colors"
                    >
                      View Inventory
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className={`rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow ${
              pendingReviewsCount > 0
                ? 'bg-orange-50 border-2 border-orange-300 animate-pulse'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                  pendingReviewsCount > 0 ? 'bg-orange-100 animate-pulse' : 'bg-gray-100'
                }`}
              >
                <HiChatAlt
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${pendingReviewsCount > 0 ? 'text-orange-600' : 'text-gray-500'}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className={`font-semibold text-base sm:text-lg ${pendingReviewsCount > 0 ? 'text-orange-800' : 'text-gray-800'}`}>
                    📝 Pending Reviews
                  </p>
                  <span
                    className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide self-start ${
                      pendingReviewsCount > 0 ? 'bg-orange-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {pendingReviewsCount > 0 ? 'Moderation Needed' : 'All Clear'}
                  </span>
                </div>
                <p
                  className={`text-xs sm:text-sm mt-2 leading-5 sm:leading-6 ${
                    pendingReviewsCount > 0 ? 'text-orange-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {pendingReviewsCount} {pendingReviewsCount === 1 ? 'review is' : 'reviews are'} waiting for your approval. Publish timely to maintain trust.
                </p>
                {pendingReviewsCount > 0 && (
                  <div className="mt-3">
                    <Link
                      to={`${ADMIN_BASE_PATH}/reviews`}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-orange-600 transition-colors"
                    >
                      Moderate Reviews
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          <Link 
            to={`${ADMIN_BASE_PATH}/orders`} 
            className="flex flex-col items-center p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HiClipboardList className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-gray-600" />
            <span className="text-xs sm:text-sm font-medium text-center">Orders</span>
          </Link>
          <Link 
            to={`${ADMIN_BASE_PATH}/products`} 
            className="flex flex-col items-center p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HiShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-gray-600" />
            <span className="text-xs sm:text-sm font-medium text-center">Products</span>
          </Link>
          <Link 
            to={`${ADMIN_BASE_PATH}/categories`} 
            className="flex flex-col items-center p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HiFolder className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-gray-600" />
            <span className="text-xs sm:text-sm font-medium text-center">Categories</span>
          </Link>
          <Link 
            to={`${ADMIN_BASE_PATH}/coupons`} 
            className="flex flex-col items-center p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl sm:text-2xl mb-2">🎫</span>
            <span className="text-xs sm:text-sm font-medium text-center">Coupons</span>
          </Link>
          <Link 
            to={`${ADMIN_BASE_PATH}/reviews`} 
            className="flex flex-col items-center p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl sm:text-2xl mb-2">⭐</span>
            <span className="text-xs sm:text-sm font-medium text-center">Reviews</span>
          </Link>
          <Link 
            to={`${ADMIN_BASE_PATH}/inventory`} 
            className="flex flex-col items-center p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl sm:text-2xl mb-2">📦</span>
            <span className="text-xs sm:text-sm font-medium text-center">Inventory</span>
          </Link>
          <Link 
            to={`${ADMIN_BASE_PATH}/reports`} 
            className="flex flex-col items-center p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl sm:text-2xl mb-2">📊</span>
            <span className="text-xs sm:text-sm font-medium text-center">Reports</span>
          </Link>
        </div>
      </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Recent Orders</h2>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Order ID</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Customer</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Total</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order: any) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 font-mono text-sm text-gray-900">{order.orderNumber || `#${order.id.slice(-8)}`}</td>
                        <td className="py-3 text-sm text-gray-900">{order.userEmail || order.customerEmail || 'N/A'}</td>
                        <td className="py-3 text-sm font-medium text-gray-900">Rs {(order.totals?.grandTotal || 0).toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-mono text-xs sm:text-sm font-medium text-gray-900">
                        {order.orderNumber || `#${order.id.slice(-8)}`}
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">{order.userEmail || order.customerEmail || 'N/A'}</div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                      <div className="text-sm sm:text-base font-semibold text-gray-900">Rs {(order.totals?.grandTotal || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📋</span>
              <p className="text-gray-500">No recent orders</p>
            </div>
          )}
        </div>
    </div>
  )
}

export default AdminDashboard
