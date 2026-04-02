import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, doc, updateDoc, serverTimestamp, orderBy, query, Timestamp, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { getCloudinaryUrl } from '../../lib/cloudinary'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Bell, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { ADMIN_BASE_PATH } from '../../constants/routes'


type OrderItem = {
  productId: string
  title?: string
  name?: string // legacy field for backward compatibility
  price: number
  qty: number
  image?: string
}

type EnhancedOrderItem = OrderItem & {
  productTitle?: string
  productImage?: string
  productDescription?: string
  category?: string
}

type Order = {
  id: string
  orderNumber?: string
  userId: string
  customerEmail?: string
  userEmail?: string // Legacy field for backward compatibility
  items: Array<OrderItem>
  totals: {
    subtotal: number
    shipping: number
    discount?: number
    grandTotal: number
  }
  coupon?: {
    id: string
    code: string
    discount: number
  }
  status: string
  payment: {
    method: string
    status: string
  }
  shipping: {
    fullName: string
    phone: string
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  timeline: Array<{
    status: string
    at: any
    note?: string
  }>
  createdAt: any
  updatedAt: any
}

async function fetchOrders(): Promise<Order[]> {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
}

async function fetchProductDetails(productId: string) {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId))
    if (productDoc.exists()) {
      const data = productDoc.data()
      console.log(`Product data for ${productId}:`, data) // Debug log
      
      // Handle Cloudinary image public IDs
      let imageUrl = null
      if (data.imagePublicIds && Array.isArray(data.imagePublicIds) && data.imagePublicIds.length > 0) {
        imageUrl = getCloudinaryUrl(data.imagePublicIds[0], 200, 200)
      } else if (data.image) {
        imageUrl = data.image
      } else if (data.imageUrl) {
        imageUrl = data.imageUrl
      } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        imageUrl = data.images[0]
      }
      
      return {
        title: data.title || data.name || 'Unknown Product',
        image: imageUrl,
        description: data.description || '',
        category: data.category || '',
      }
    } else {
      console.log(`Product not found: ${productId}`) // Debug log
    }
  } catch (error) {
    console.error('Error fetching product details:', error)
  }
  return null
}

async function enhanceOrderItems(items: OrderItem[]): Promise<EnhancedOrderItem[]> {
  console.log('Enhancing order items:', items) // Debug log
  
  const enhancedItems = await Promise.all(
    items.map(async (item) => {
      const productDetails = await fetchProductDetails(item.productId)
      
      // Priority: product DB title > order item title > order item name > fallback
      const finalTitle = productDetails?.title || item.title || item.name || 'Unknown Product'
      
      // Priority: product DB image > order item image > null
      const finalImage = productDetails?.image || item.image || null
      
      console.log(`Enhanced item ${item.productId}:`, {
        originalName: item.name,
        originalTitle: item.title,
        originalImage: item.image,
        fetchedTitle: productDetails?.title,
        fetchedImage: productDetails?.image,
        finalTitle,
        finalImage
      }) // Debug log
      
      return {
        ...item,
        productTitle: finalTitle,
        productImage: finalImage,
        productDescription: productDetails?.description || '',
        category: productDetails?.category || '',
      }
    })
  )
  return enhancedItems
}

interface OrdersAdminPageProps {
  statusFilter?: string
  pageTitle?: string
}

const OrdersAdminPage: React.FC<OrdersAdminPageProps> = ({ 
  statusFilter,
  pageTitle = 'Order Management' 
}) => {
  const qc = useQueryClient()
  const { data: allOrders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchOrders
  })

  // Filter orders based on statusFilter prop
  const orders = React.useMemo(() => {
    if (!allOrders || !statusFilter) return allOrders
    return allOrders.filter(order => {
      const status = order.status.toLowerCase()
      switch (statusFilter) {
        case 'pending':
          return status === 'pending'
        case 'confirmed':
          return status === 'confirmed'
        case 'shipped':
          return status === 'shipped'
        case 'delivered':
          return status === 'delivered'
        case 'cancelled':
          return status === 'cancelled'
        case 'refunded':
          return status === 'refunded'
        default:
          return ['confirmed', 'shipped'].includes(status)
      }
    })
  }, [allOrders, statusFilter])

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, note }: { orderId: string, status: string, note?: string }) => {
      const orderRef = doc(db, 'orders', orderId)
      const currentOrder = allOrders?.find(o => o.id === orderId)
      
      const newTimelineEntry = {
        status,
        at: Timestamp.now(),
        ...(note && { note })
      }
      
      const updatedTimeline = [...(currentOrder?.timeline || []), newTimelineEntry]
      
      await updateDoc(orderRef, {
        status,
        timeline: updatedTimeline,
        updatedAt: serverTimestamp()
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Order status updated successfully!')
    },
    onError: (error: any) => {
      console.error('Failed to update order status:', error)
      toast.error(error?.message || 'Failed to update order status')
    }
  })

  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)
  const [enhancedOrderItems, setEnhancedOrderItems] = React.useState<EnhancedOrderItem[]>([])
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = React.useState(false)
  const [statusUpdate, setStatusUpdate] = React.useState({ status: '', note: '' })

  // Enhance order items when a new order is selected
  React.useEffect(() => {
    const loadOrderDetails = async () => {
      if (selectedOrder) {
        setIsLoadingOrderDetails(true)
        try {
          const enhanced = await enhanceOrderItems(selectedOrder.items)
          setEnhancedOrderItems(enhanced)
        } catch (error) {
          console.error('Error loading order details:', error)
          setEnhancedOrderItems(selectedOrder.items)
        } finally {
          setIsLoadingOrderDetails(false)
        }
      } else {
        setEnhancedOrderItems([])
      }
    }

    loadOrderDetails()
  }, [selectedOrder])

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !statusUpdate.status) {
      toast.error('Please select a status')
      return
    }
    
    try {
      await updateOrderStatus.mutateAsync({
        orderId: selectedOrder.id,
        status: statusUpdate.status,
        note: statusUpdate.note || undefined
      })
      setSelectedOrder(null)
      setStatusUpdate({ status: '', note: '' })
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'shipped': return 'bg-indigo-100 text-indigo-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'refunded': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const statusOptions = [
    'Pending',
    'Confirmed', 
    'Shipped',
    'Delivered',
    'Cancelled',
    'Refunded'
  ]

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text="Loading orders..." />
    </div>
  )

  const pendingOrdersCount = allOrders?.filter(o => o.status.toLowerCase() === 'pending').length || 0

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold">Admin • {pageTitle}</h1>
        {pendingOrdersCount > 0 && (
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 sm:px-4 py-2 rounded-lg border-2 border-yellow-300 animate-pulse">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-sm sm:text-base">{pendingOrdersCount} Pending Order{pendingOrdersCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Stats - All Status Sections */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Link to={`${ADMIN_BASE_PATH}/orders/pending`} className="bg-yellow-50 p-3 sm:p-4 rounded border-2 border-yellow-300 relative hover:bg-yellow-100 transition-colors cursor-pointer">
          {pendingOrdersCount > 0 && (
            <div className="absolute -top-1 -right-1">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
            </div>
          )}
          <div className="text-lg sm:text-2xl font-bold text-yellow-700">
            {pendingOrdersCount}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 font-medium">Pending</div>
        </Link>

        <Link to={`${ADMIN_BASE_PATH}/orders/confirmed`} className="bg-blue-50 p-3 sm:p-4 rounded border hover:bg-blue-100 transition-colors cursor-pointer">
          <div className="text-lg sm:text-2xl font-bold text-blue-700">
            {allOrders?.filter(o => o.status.toLowerCase() === 'confirmed').length || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Confirmed</div>
        </Link>

        <Link to={`${ADMIN_BASE_PATH}/orders/shipped`} className="bg-indigo-50 p-3 sm:p-4 rounded border hover:bg-indigo-100 transition-colors cursor-pointer">
          <div className="text-lg sm:text-2xl font-bold text-indigo-700">
            {allOrders?.filter(o => o.status.toLowerCase() === 'shipped').length || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Shipped</div>
        </Link>
        
        <Link to={`${ADMIN_BASE_PATH}/orders/delivered`} className="bg-green-50 p-3 sm:p-4 rounded border hover:bg-green-100 transition-colors cursor-pointer">
          <div className="text-lg sm:text-2xl font-bold text-green-700">
            {allOrders?.filter(o => o.status.toLowerCase() === 'delivered').length || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Delivered</div>
        </Link>

        <Link to={`${ADMIN_BASE_PATH}/orders/cancelled`} className="bg-red-50 p-3 sm:p-4 rounded border hover:bg-red-100 transition-colors cursor-pointer">
          <div className="text-lg sm:text-2xl font-bold text-red-700">
            {allOrders?.filter(o => o.status.toLowerCase() === 'cancelled').length || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Cancelled</div>
        </Link>

        <Link to={`${ADMIN_BASE_PATH}/orders/refunded`} className="bg-gray-50 p-3 sm:p-4 rounded border hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="text-lg sm:text-2xl font-bold text-gray-700">
            {allOrders?.filter(o => o.status.toLowerCase() === 'refunded').length || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Refunded</div>
        </Link>
      </div>

      {/* Orders Table - Desktop */}
      <div className="bg-white rounded border max-w-full overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders` : 'All Orders'}</h2>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm">Order ID</th>
                <th className="text-left p-3 text-sm">Customer</th>
                <th className="text-left p-3 text-sm">Items</th>
                <th className="text-left p-3 text-sm">Total</th>
                <th className="text-left p-3 text-sm">Status</th>
                <th className="text-left p-3 text-sm">Payment</th>
                <th className="text-left p-3 text-sm">Date</th>
                <th className="text-left p-3 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => {
                const isPending = order.status.toLowerCase() === 'pending'
                return (
                <tr 
                  key={order.id} 
                  className={`border-b hover:bg-gray-50 transition-colors ${
                    isPending ? 'bg-yellow-50 border-l-4 border-l-yellow-500' : ''
                  }`}
                >
                  <td className="p-3 font-mono text-sm">
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <AlertCircle className="w-4 h-4 text-yellow-600 animate-pulse" />
                      )}
                      <span>{order.orderNumber || order.id.slice(-8)}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div className="font-medium">{order.shipping.fullName}</div>
                      <div className="text-gray-600 text-xs">{order.customerEmail || order.userEmail || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div className="font-medium">Rs {order.totals.grandTotal.toFixed(2)}</div>
                      {order.coupon && (
                        <div className="text-green-600 text-xs">
                          -{order.coupon.code} (-Rs {order.coupon.discount.toFixed(2)})
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        getStatusColor(order.status)
                      } ${isPending ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}>
                        {order.status}
                      </span>
                      {['shipped', 'delivered'].includes(order.status.toLowerCase()) && (
                        <div className="text-xs text-green-600 font-medium">
                          🚚 {order.status.toLowerCase() === 'delivered' ? 'Delivered' : 'In Transit'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div>{order.payment.method}</div>
                      <div className="text-gray-600 text-xs">{order.payment.status}</div>
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant={isPending ? 'danger' : 'primary'}
                      onClick={() => setSelectedOrder(order)}
                      className={`text-sm ${isPending ? 'animate-pulse' : ''}`}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              )})
              }
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {orders?.map((order) => {
            const isPending = order.status.toLowerCase() === 'pending'
            return (
              <div 
                key={order.id} 
                className={`p-4 border-b last:border-b-0 ${
                  isPending ? 'bg-yellow-50 border-l-4 border-l-yellow-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <AlertCircle className="w-4 h-4 text-yellow-600 animate-pulse" />
                    )}
                    <span className="font-mono text-sm font-medium">
                      {order.orderNumber || order.id.slice(-8)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    getStatusColor(order.status)
                  } ${isPending ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div>
                    <span className="text-xs text-gray-500">Customer:</span>
                    <div className="font-medium text-sm">{order.shipping.fullName}</div>
                    <div className="text-gray-600 text-xs">{order.customerEmail || order.userEmail || 'N/A'}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-gray-500">Items:</span>
                      <div>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Total:</span>
                      <div className="font-medium">Rs {order.totals.grandTotal.toFixed(2)}</div>
                      {order.coupon && (
                        <div className="text-green-600 text-xs">
                          -{order.coupon.code}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-gray-500">Payment:</span>
                      <div>{order.payment.method}</div>
                      <div className="text-gray-600 text-xs">{order.payment.status}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Date:</span>
                      <div>{order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</div>
                    </div>
                  </div>

                  {['shipped', 'delivered'].includes(order.status.toLowerCase()) && (
                    <div className="text-xs text-green-600 font-medium">
                      🚚 {order.status.toLowerCase() === 'delivered' ? 'Delivered' : 'In Transit'}
                    </div>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant={isPending ? 'danger' : 'primary'}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-sm ${isPending ? 'animate-pulse' : ''}`}
                >
                  {isPending ? 'View Order Details' : 'View Details'}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Order Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Order ID: {selectedOrder.orderNumber || selectedOrder.id?.slice(-8) || 'N/A'}
                </p>
              </div>
              <Button
                onClick={() => {
                  setSelectedOrder(null)
                  setStatusUpdate({ status: '', note: '' })
                }}
                variant="outline"
                className="mt-3 sm:mt-0 w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Order Info */}
              <div className="space-y-6">
                {/* Product Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    Product Details ({selectedOrder.items?.length || 0} item{(selectedOrder.items?.length || 0) !== 1 ? 's' : ''})
                  </h4>
                  
                  {isLoadingOrderDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner className="w-6 h-6" />
                      <span className="ml-2 text-sm text-gray-600">Loading product details...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enhancedOrderItems && enhancedOrderItems.length > 0 ? (
                        enhancedOrderItems.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="space-y-4">
                            {/* Product Header Row */}
                            <div className="flex flex-col sm:flex-row gap-4 ">

                              {/* Product Image */}
                              <div className="flex-shrink-0 self-start ">
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                                  {/* Item index badge */}
                                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                                    {index + 1}
                                  </div>
                                  {item.productImage ? (
                                    <img 
                                      src={item.productImage} 
                                      alt={item.productTitle || 'Product'} 
                                      className="w-full h-full object-cover transition-transform hover:scale-110"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSA0MEg2NUw2MCA2MEgzNUwzNSA0MFoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNDUiIGN5PSI0NSIgcj0iNSIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </div>                      
                              {/* Product Info */}
                              <div className="flex-1 min-w-0 ">
                                <h5 className="font-bold text-lg text-gray-900 mb-2 leading-tight">{item.productTitle || 'Unknown Product'}</h5>
                              
                                {/* Category */}
                                {item.category && (
                                  <div className="mb-3">
                                    <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium shadow-sm">
                                      {item.category}
                                    </span>
                                  </div>
                                )}
                              
                                {/* Product ID */}
                                <div className="mb-3">
                                  <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full font-mono shadow-sm">
                                    Product ID: {item.productId ? item.productId : 'N/A'}
                                  </span>
                                </div>

                                {/* Extract color/variant info from title if available */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {item.productTitle && item.productTitle.toLowerCase().includes('color') && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-full font-medium shadow-sm">
                                       {item.productTitle.match(/color[:\s]*([^,\-\n]+)/i)?.[1]?.trim() || 'Color'}
                                    </span>
                                  )}
                                  {item.productTitle && item.productTitle.toLowerCase().includes('size') && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-1 rounded-full font-medium shadow-sm">
                                      📏 {item.productTitle.match(/size[:\s]*([^,\-\n]+)/i)?.[1]?.trim() || 'Size'}
                                    </span>
                                  )}
                                  {item.productTitle && (item.productTitle.toLowerCase().includes('style') || item.productTitle.toLowerCase().includes('variant')) && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-3 py-1 rounded-full font-medium shadow-sm">
                                       {item.productTitle.match(/(style|variant)[:\s]*([^,\-\n]+)/i)?.[2]?.trim() || 'Style'}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Product Description */}
                                {item.productDescription && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium text-gray-700">📝 Description:</span> 
                                      <span className="ml-1">{item.productDescription.slice(0, 100)}{item.productDescription.length > 100 ? '...' : ''}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Quantity & Price Section */}
                            <div className="flex  items-center justify-between bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 mb-1 font-medium">Quantity</div>
                                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-md">
                                    ×{item.qty}
                                  </div>
                                </div>
                                
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 mb-1 font-medium">Unit Price</div>
                                  <div className="font-semibold text-gray-700">Rs {item.price?.toFixed?.(2) ?? item.price}</div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-xs text-gray-500 mb-1 font-medium">Subtotal</div>
                                <div className="text-xl font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg shadow-sm">
                                  Rs {(item.price * item.qty).toFixed(2)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Additional product details if title contains more info */}
                            {item.productTitle && (item.productTitle.includes('–') || item.productTitle.includes('-') || item.productTitle.includes('by')) && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Full Description:</span> {item.productTitle}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                    ))
                  ) : (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="text-center text-yellow-800">
                        <div className="text-sm font-medium">No items found in this order</div>
                        <div className="text-xs text-yellow-600 mt-1">There might be an issue with the order data</div>
                      </div>
                    </div>
                  )}
                    
                    {/* Items Summary */}
                    {enhancedOrderItems && enhancedOrderItems.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-blue-800 font-medium">
                            Total Items: {enhancedOrderItems.reduce((sum, item) => sum + (item.qty || 0), 0)}
                          </span>
                          <span className="text-blue-800 font-medium">
                            Items Value: Rs {enhancedOrderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 0)), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    💰 Order Summary
                  </h4>
                  {selectedOrder.totals ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>Rs {(selectedOrder.totals.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Shipping:</span>
                        <div className="flex items-center gap-2">
                          <span>Rs {(selectedOrder.totals.shipping || 0).toFixed(2)}</span>
                          {/* Shipping Status Indicator */}
                          {selectedOrder.status && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              ['shipped', 'delivered'].includes(selectedOrder.status.toLowerCase())
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {selectedOrder.status.toLowerCase() === 'delivered' 
                                ? 'Paid & Delivered ✅' 
                                : ['shipped'].includes(selectedOrder.status.toLowerCase())
                                ? 'Paid & In Transit 🚚'
                                : 'Pending ⏳'
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedOrder.coupon && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({selectedOrder.coupon.code || 'N/A'}):</span>
                          <span>-Rs {(selectedOrder.coupon.discount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-semibold text-base">
                        <span>Total:</span>
                        <span>Rs {(selectedOrder.totals.grandTotal || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-yellow-600 text-sm">Order totals not available</div>
                  )}
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    💳 Payment Information
                  </h4>
                  {selectedOrder.payment ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span className="font-medium">{selectedOrder.payment.method || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          // Color coding for COD orders based on order status
                          (selectedOrder.payment.method || '').toLowerCase() === 'cod' 
                            ? (selectedOrder.status || '').toLowerCase() === 'delivered' 
                              ? 'bg-green-100 text-green-700'  // Paid (delivered)
                              : (selectedOrder.status || '').toLowerCase() === 'shipped'
                              ? 'bg-blue-100 text-blue-700'    // Shipped
                              : (selectedOrder.status || '').toLowerCase() === 'processing'
                              ? 'bg-purple-100 text-purple-700' // Processing
                              : (selectedOrder.status || '').toLowerCase() === 'confirmed'
                              ? 'bg-indigo-100 text-indigo-700' // Confirmed
                              : (selectedOrder.status || '').toLowerCase() === 'cancelled'
                              ? 'bg-red-100 text-red-700'      // Cancelled
                              : 'bg-yellow-100 text-yellow-700' // Pending
                            // For non-COD orders, use payment status
                            : (selectedOrder.payment.status || '').toLowerCase() === 'paid' 
                            ? 'bg-green-100 text-green-700' 
                            : (selectedOrder.payment.status || '').toLowerCase() === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {/* Show appropriate status based on payment method and order status */}
                          {(selectedOrder.payment.method || '').toLowerCase() === 'cod' 
                            ? (selectedOrder.status || '').toLowerCase() === 'delivered' 
                              ? 'Paid (Cash Collected)'
                              : (selectedOrder.status || '').toLowerCase() === 'shipped'
                              ? 'Shipped - Pay on Delivery'
                              : (selectedOrder.status || '').toLowerCase() === 'processing'
                              ? 'Processing - COD'
                              : (selectedOrder.status || '').toLowerCase() === 'confirmed'
                              ? 'Confirmed - COD'
                              : (selectedOrder.status || '').toLowerCase() === 'cancelled'
                              ? 'Cancelled'
                              : 'Pending - COD'
                            : selectedOrder.payment.status || 'Unknown'
                          }
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-yellow-600 text-sm">Payment information not available</div>
                  )}
                </div>
              </div>

              {/* Right Column - Shipping & Status */}
              <div className="space-y-6">
                {/* Shipping Address */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🏠 Shipping Address
                  </h4>
                  {selectedOrder.shipping ? (
                    <div className="space-y-2 text-sm">
                      <div className="font-medium text-base mb-3">👤 Customer Information</div>
                      
                      {/* Name Section */}
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-blue-600 font-medium mb-1">Full Name</div>
                        <div className="text-gray-800 font-medium">{selectedOrder.shipping.fullName || 'No name provided'}</div>
                      </div>
                      
                      {/* Phone Section */}
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-green-600 font-medium mb-1">📞 Phone Number</div>
                        <div className="text-gray-800 font-medium">{selectedOrder.shipping.phone || 'No phone provided'}</div>
                      </div>
                      
                      {/* Address Section */}
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-purple-600 font-medium mb-1">🏠 Street Address</div>
                        <div className="text-gray-800">{selectedOrder.shipping.line1 || 'No address provided'}</div>
                        {selectedOrder.shipping.line2 && (
                          <div className="text-gray-700 text-sm mt-1">
                            <span className="text-xs text-purple-500">Apartment/Suite:</span> {selectedOrder.shipping.line2}
                          </div>
                        )}
                      </div>
                      
                      {/* Location Section */}
                      <div className="bg-white rounded-lg p-3 border border-orange-200">
                        <div className="text-xs text-orange-600 font-medium mb-1">🌍 Location</div>
                        <div className="text-gray-800">
                          <div><span className="text-orange-500 text-xs">City:</span> {selectedOrder.shipping.city || 'No city'}</div>
                          {selectedOrder.shipping.state && (
                            <div><span className="text-orange-500 text-xs">State:</span> {selectedOrder.shipping.state}</div>
                          )}
                          <div><span className="text-orange-500 text-xs">Postal Code:</span> {selectedOrder.shipping.postalCode || 'No postal code'}</div>
                          <div><span className="text-orange-500 text-xs">Country:</span> {selectedOrder.shipping.country || 'No country'}</div>
                        </div>
                      </div>
                      
                      {/* Email Section */}
                      {(selectedOrder.customerEmail || selectedOrder.userEmail) && (
                        <div className="bg-white rounded-lg p-3 border border-indigo-200">
                          <div className="text-xs text-indigo-600 font-medium mb-1">✉️ Email Address</div>
                          <div className="text-gray-800 font-medium break-all">{selectedOrder.customerEmail || selectedOrder.userEmail}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-yellow-600 text-sm">Shipping address not available</div>
                  )}
                </div>

                {/* Current Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    📋 Order Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status || 'unknown')}`}>
                        {selectedOrder.status || 'Unknown Status'}
                      </span>
                    </div>
                    
                    {/* Shipping charges status */}
                    {selectedOrder.totals?.shipping && (
                      <div className={`text-sm p-3 rounded border-l-4 ${
                        ['shipped', 'delivered'].includes((selectedOrder.status || '').toLowerCase())
                          ? 'bg-green-50 border-green-500 text-green-800'
                          : 'bg-yellow-50 border-yellow-500 text-yellow-800'
                      }`}>
                        <div className="font-medium">
                          Shipping: Rs {selectedOrder.totals.shipping.toFixed(2)} - {
                            (selectedOrder.status || '').toLowerCase() === 'delivered' 
                              ? 'Paid & Delivered ✅'
                              : ['shipped'].includes((selectedOrder.status || '').toLowerCase())
                              ? 'Paid & In Transit 🚚'
                              : 'Pending ⏳'
                          }
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-600 mt-3">
                    Created: {selectedOrder.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'} {selectedOrder.createdAt?.toDate?.()?.toLocaleTimeString() || ''}
                  </div>
                </div>

                {/* Order Timeline */}
                {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      📅 Order Timeline
                    </h4>
                    <div className="space-y-3">
                      {selectedOrder.timeline.map((entry, index) => {
                        const isLatestEntry = index === selectedOrder.timeline.length - 1 // Most recent entry
                        
                        return (
                          <div key={index} className={`border-l-2 ${
                            isLatestEntry ? 'border-blue-500' : 'border-gray-300'
                          } pl-3 ${isLatestEntry ? 'bg-blue-50 -ml-1 py-2 px-3 rounded-r' : ''}`}>
                            <div className="flex items-center gap-2">
                              <div className={`font-medium text-sm ${isLatestEntry ? 'text-blue-800' : ''}`}>
                                {entry.status}
                              </div>
                              {isLatestEntry && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              {entry.at?.toDate?.()?.toLocaleDateString()} {entry.at?.toDate?.()?.toLocaleTimeString()}
                            </div>
                            {entry.note && (
                              <div className="text-xs text-gray-700 mt-1 italic bg-gray-100 p-2 rounded">
                                💬 {entry.note}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Status Update Section */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    ⚡ Update Status
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">New Status</label>
                      <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={statusUpdate.status}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      >
                        <option value="">Select Status</option>
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Note (Optional)</label>
                      <textarea
                        className="w-full border rounded px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Add a note about this status update..."
                        value={statusUpdate.note}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, note: e.target.value })}
                      />
                    </div>
                    
                    <Button
                      onClick={handleStatusUpdate}
                      disabled={!statusUpdate.status || updateOrderStatus.isPending}
                      loading={updateOrderStatus.isPending}
                      variant="primary"
                      className="w-full"
                    >
                      Update Order Status
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersAdminPage
