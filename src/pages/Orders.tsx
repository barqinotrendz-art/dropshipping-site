import React, { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getCloudinaryUrl } from '../lib/cloudinary'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useParams } from 'react-router-dom'
import type { Order, Product } from '../types/index'
import emptycart from "../assets/empty-cart-svgrepo-com.svg"

const Orders: React.FC = () => {
  const { user } = useAuth()
  const { id: orderIdFromUrl } = useParams()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orderIdFromUrl || null)
  const [productDetails, setProductDetails] = useState<{ [key: string]: Product }>({})

  // Check if order exists in user's orders
  const isOrderAccessible = React.useCallback((orderId: string) => {
    return orders.some(order => order.id === orderId)
  }, [orders])

  // Helper function to fetch product details
  const fetchProductDetails = async (productId: string) => {
    if (productDetails[productId]) return productDetails[productId]

    try {
      const productDoc = await getDoc(doc(db, 'products', productId))
      if (productDoc.exists()) {
        const product = { id: productDoc.id, ...productDoc.data() } as Product
        setProductDetails(prev => ({ ...prev, [productId]: product }))
        return product
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    }
    return null
  }

  // Helper function to parse smart product title
  const parseProductTitle = (title: string) => {
    const colorMatch = title.match(/\b(red|blue|green|yellow|black|white|pink|purple|orange|brown|grey|gray|navy|beige|cream|gold|silver)\b/i)
    const sizeMatch = title.match(/\b(XS|S|M|L|XL|XXL|XXXL|\d+)\b/i)

    let cleanTitle = title
    let color = ''
    let size = ''

    if (colorMatch) {
      color = colorMatch[0]
      cleanTitle = cleanTitle.replace(colorMatch[0], '').trim()
    }

    if (sizeMatch) {
      size = sizeMatch[0]
      cleanTitle = cleanTitle.replace(sizeMatch[0], '').trim()
    }

    // Clean up extra spaces and formatting
    cleanTitle = cleanTitle.replace(/\s+/g, ' ').replace(/^[\s,-]+|[\s,-]+$/g, '')

    return { cleanTitle, color, size }
  }

  // Helper function to get Cloudinary image URL
  const getImageUrl = async (productId: string, fallbackImage?: string) => {
    // First try to get fresh product data
    let product = productDetails[productId]
    if (!product) {
      const fetchedProduct = await fetchProductDetails(productId)
      if (fetchedProduct) {
        product = fetchedProduct
      }
    }

    if (!product && !fallbackImage) return '/placeholder-image.jpg'

    // Priority: product DB imagePublicIds > fallback > placeholder
    let imageUrl = null

    if (product?.imagePublicIds && Array.isArray(product.imagePublicIds) && product.imagePublicIds.length > 0) {
      imageUrl = getCloudinaryUrl(product.imagePublicIds[0], 400, 400)
    } else if (fallbackImage) {
      // Handle already full URLs
      if (fallbackImage.startsWith('http')) {
        imageUrl = fallbackImage
      } else {
        // Try as Cloudinary public ID
        imageUrl = getCloudinaryUrl(fallbackImage, 400, 400)
      }
    }

    return imageUrl || '/placeholder-image.jpg'
  }

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Try query with orderBy first
        let q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )

        let snapshot
        try {
          snapshot = await getDocs(q)
        } catch (indexError: any) {
          // If index error, fall back to query without orderBy
          console.warn('Firestore index not found, using fallback query:', indexError.message)
          q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid)
          )
          snapshot = await getDocs(q)
        }

        let fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order))

        // Sort in memory if we couldn't use orderBy
        fetchedOrders = fetchedOrders.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0
          const bTime = b.createdAt?.toMillis?.() || 0
          return bTime - aTime
        })

        setOrders(fetchedOrders)
      } catch (e) {
        console.error('Error loading orders:', e)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [user])

  // Toggle order details expansion
  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null)
      navigate('/orders')
    } else {
      setExpandedOrderId(orderId)
      navigate(`/orders/${orderId}`)
    }
  }

  // Load product details when an order is expanded
  useEffect(() => {
    const loadProductDetailsForOrder = async () => {
      if (expandedOrderId) {
        const order = orders.find(o => o.id === expandedOrderId)
        if (order?.items) {
          // Load product details for all items in the expanded order
          await Promise.all(
            order.items.map(item => {
              if (item.productId && !productDetails[item.productId]) {
                return fetchProductDetails(item.productId)
              }
              return Promise.resolve()
            })
          )
        }
      }
    }

    loadProductDetailsForOrder()
  }, [expandedOrderId, orders])

  // Verify access when URL has order ID
  useEffect(() => {
    if (orderIdFromUrl && orders.length > 0) {
      if (!isOrderAccessible(orderIdFromUrl)) {
        // Order not found or not accessible
        navigate('/orders')
        setExpandedOrderId(null)
      } else {
        // Set expanded if order is accessible
        setExpandedOrderId(orderIdFromUrl)
      }
    }
  }, [orderIdFromUrl, orders, navigate, isOrderAccessible])

  // Order Item Component with proper image loading
  const OrderItemComponent: React.FC<{ item: any, idx: number }> = ({ item, idx }) => {
    const [imageUrl, setImageUrl] = useState<string>('/placeholder-image.jpg')
    const [imageLoading, setImageLoading] = useState(true)

    const product = productDetails[item.productId || '']
    const { cleanTitle, color, size } = parseProductTitle(item.name || '')

    useEffect(() => {
      const loadImage = async () => {
        if (item.productId) {
          setImageLoading(true)
          const url = await getImageUrl(item.productId, item.image)
          setImageUrl(url)
          setImageLoading(false)
        } else {
          setImageLoading(false)
        }
      }

      loadImage()
    }, [item.productId, item.image])

    return (
      <div className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl p-3 sm:p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
              {imageLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt={cleanTitle || 'Product'}
                  className="w-full h-full object-cover transition-transform hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSA0MEg2NUw2MCA2MEgzNUwzNSA0MFoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNDUiIGN5PSI0NSIgcj0iNSIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K'
                  }}
                />
              )}
              {/* Item number badge */}
              <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                {idx + 1}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 w-full min-w-0">
            <div className="font-bold text-base sm:text-lg text-gray-900 mb-2 leading-tight text-center sm:text-left">
              {cleanTitle || item.name || 'Unknown Product'}
            </div>

            {/* Category */}
            {product?.categoryId && (
              <div className="mb-3 flex justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-2 sm:px-3 py-1 rounded-full font-medium shadow-sm">
                  Category ID: {product.categoryId}
                </span>
              </div>
            )}

            {/* Product Details Row */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 justify-center sm:justify-start">
              {color && (
                <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-2 sm:px-3 py-1 rounded-full font-medium shadow-sm">
                  {color}
                </span>
              )}
              {size && (
                <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-2 sm:px-3 py-1 rounded-full font-medium shadow-sm">
                  {size}
                </span>
              )}
              {item.productId && (
                <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-2 sm:px-3 py-1 rounded-full font-mono shadow-sm truncate max-w-[120px] sm:max-w-none">
                  {item.productId}
                </span>
              )}
            </div>

            {/* Quantity and Price Row - Mobile Stack, Desktop Side by Side */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex justify-center sm:justify-start items-center gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Quantity</div>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 sm:px-3 py-1 rounded-full font-bold text-sm shadow-md">
                      ×{item.qty}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Unit Price</div>
                    <div className="font-semibold text-gray-700 text-sm">Rs {item.price?.toFixed?.(2) ?? item.price}</div>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="text-xs text-gray-500 mb-1 font-medium">Subtotal</div>
                  <div className="text-lg sm:text-xl font-bold text-green-600 bg-green-50 px-2 sm:px-3 py-1 rounded-lg shadow-sm">
                    Rs {(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description */}
            {product?.description && (
              <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                <div className="text-xs text-gray-600">
                  <span className="font-medium text-gray-700">📝 Description:</span>
                  <span className="ml-1">{product.description.slice(0, 80)}{product.description.length > 80 ? '...' : ''}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Login
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">View and track all your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4 flex justify-center items-center"><img src={emptycart} alt="Empty Cart" width="200" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-block"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id
            const subtotal = order.totals?.subtotal ?? 0
            const shippingAmount = order.totals?.shipping ?? 0
            const discountAmount = order.totals?.discount ?? 0
            const grandTotal = order.totals?.grandTotal ?? 0
            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Summary - Always Visible */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.orderNumber || `Order #${order.id.slice(0, 8)}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.createdAt?.toDate ?
                          new Date(order.createdAt.toDate()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) :
                          'Date not available'
                        }
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                      <div className="text-center sm:text-left">
                        <p className="text-gray-500 text-xs sm:text-sm">Items</p>
                        <p className="font-medium">{order.items?.length || 0} item(s)</p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-gray-500 text-xs sm:text-sm">Total</p>
                        <p className="font-medium">Rs {grandTotal.toFixed(2)}</p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-gray-500 text-xs sm:text-sm">Payment</p>
                        <p className="font-medium text-xs sm:text-sm">{order.payment?.method || 'COD'}</p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-gray-500 text-xs sm:text-sm">Shipping</p>
                        <p className="font-medium text-xs sm:text-sm truncate">{order.shipping?.city || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 overflow-x-auto">
                      {order.items?.slice(0, 2).map((item, idx: number) => (
                        <span key={idx} className="bg-gray-100 px-2 py-1 rounded whitespace-nowrap text-xs">
                          {item.name?.length > 15 ? `${item.name.slice(0, 15)}...` : item.name}
                        </span>
                      ))}
                      {order.items?.length > 2 && (
                        <span className="text-gray-500 text-xs whitespace-nowrap">+{order.items.length - 2} more</span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleOrderDetails(order.id)}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Order Details - Expandable */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      {/* Items List */}
                      <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 sm:px-6 py-3 sm:py-4 border-b border-blue-100">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                                 Order Items
                                <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold px-2 py-1 rounded-full">
                                  {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                </span>
                              </h3>
                              <div className="text-xs sm:text-sm text-gray-600">
                                <span className="font-medium">Items Value: </span>
                                <span className="text-green-600 font-bold">Rs {subtotal.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 sm:p-6">
                            <div className="space-y-3 sm:space-y-4">
                              {order.items?.map((item, idx: number) => (
                                <OrderItemComponent key={idx} item={item} idx={idx} />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>

                          {/* Responsive grid: 1 column on mobile, 2 on md+ */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Name & Phone */}
                            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm space-y-3">
                              <div>
                                <div className="text-[11px] uppercase font-medium text-gray-500">Full Name</div>
                                <div className="font-semibold text-gray-800 text-sm">{order.shipping?.fullName}</div>
                              </div>

                              <div>
                                <div className="text-[11px] uppercase font-medium text-gray-500">Phone Number</div>
                                <div className="font-semibold text-gray-800 text-sm">{order.shipping?.phone}</div>
                              </div>
                            </div>

                            {/* Street Address */}
                            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm space-y-3">
                              <div>
                                <div className="text-[11px] uppercase font-medium text-gray-500">Street Address</div>
                                <div className="font-semibold text-gray-800 text-sm">{order.shipping?.line1}</div>
                              </div>

                              {order.shipping?.line2 && (
                                <div>
                                  <div className="text-[11px] uppercase font-medium text-gray-500">Apartment / Suite</div>
                                  <div className="font-semibold text-gray-800 text-sm">{order.shipping?.line2}</div>
                                </div>
                              )}
                            </div>

                            {/* City, State, Zip & Country */}
                            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm space-y-3 md:col-span-2">
                              <div>
                                <div className="text-[11px] uppercase font-medium text-gray-500">City</div>
                                <div className="font-semibold text-gray-800 text-sm">
                                  {order.shipping?.city}, {order.shipping?.state}
                                </div>
                              </div>

                              <div>
                                <div className="text-[11px] uppercase font-medium text-gray-500">Postal Code</div>
                                <div className="font-semibold text-gray-800 text-sm">{order.shipping?.postalCode}</div>
                              </div>

                              <div>
                                <div className="text-[11px] uppercase font-medium text-gray-500">Country</div>
                                <div className="font-semibold text-gray-800 text-sm">{order.shipping?.country}</div>
                              </div>
                            </div>

                          </div>
                        </div>


                        {/* Account Email */}
                        {(order.customerEmail || order.userEmail) && (
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Account Email</h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                              <div className="flex items-center gap-2 ">
                                <span className="font-medium break-all">{order.customerEmail || order.userEmail}</span>
                              </div>
                              <p className=" text-xs mt-1">This is the email address associated with your account</p>
                            </div>
                          </div>
                        )}


                      </div>

                      {/* Order Summary & Status */}
                      <div className="space-y-4 sm:space-y-6">
                        {/* Price Breakdown */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                          <div className="bg-white border rounded-lg p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="font-medium">Rs {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Rs {shippingAmount.toFixed(2)}</span>
                                {/* Shipping Payment Status */}
                                {order.status && ['shipped', 'delivered'].includes(order.status.toLowerCase()) && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                    Paid ✅
                                  </span>
                                )}
                              </div>
                            </div>
                            {discountAmount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span className="font-medium">-Rs {discountAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                              <span>Total</span>
                              <div className="flex items-center space-x-2">
                                <span>Rs {grandTotal.toFixed(2)}</span>
                                {/* Total Payment Status */}
                                {order.status && order.status.toLowerCase() === 'delivered' && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                    {order.payment?.method === 'COD' ? 'Paid ✅' : 'Paid ✅'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status Timeline */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Order Status</h3>
                          <div className="bg-white border rounded-lg p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <span className="text-sm text-gray-600">Current Status:</span>
                                <div className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                                  order.status?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                    order.status?.toLowerCase() === 'confirmed' ? 'bg-indigo-100 text-indigo-700' :
                                      order.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                  }`}>
                                  {order.status || 'Pending'}
                                </div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Payment Status:</span>
                                <div className="mt-1">
                                  {order.payment?.method === 'COD' ? (
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                                      order.status?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                      }`}>
                                      {order.status?.toLowerCase() === 'delivered' ? 'Paid (COD)' :
                                        order.status?.toLowerCase() === 'shipped' ? 'Pay on Delivery' :
                                          'Cash on Delivery'}
                                    </span>
                                  ) : (
                                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                      {order.payment?.status === 'completed' ? 'Paid Online' : 'Pending Payment'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <p className="font-medium text-gray-700">Timeline:</p>
                              {order.timeline?.map((t, idx: number) => {
                                let dateString = ''
                                try {
                                  if (t.at && typeof t.at.toDate === 'function') {
                                    dateString = t.at.toDate().toLocaleString()
                                  } else if (t.at) {
                                    dateString = new Date(t.at as any).toLocaleString()
                                  }
                                } catch (e) {
                                  dateString = 'Invalid date'
                                }

                                return (
                                  <div key={idx} className="flex items-start space-x-2 text-gray-600">
                                    <span className="text-blue-600">•</span>
                                    <div className="flex-1">
                                      <div>
                                        <span className="font-medium">{t.status}</span>
                                        {dateString && (
                                          <span className="text-xs text-gray-500 ml-2">
                                            {dateString}
                                          </span>
                                        )}
                                      </div>
                                      {t.note && (
                                        <div className="text-xs text-gray-600 mt-1 italic bg-gray-50 px-2 py-1 rounded">
                                          Note: {t.note}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                        {/* Continue Shopping */}
                        <div className="mt-6">
                          <button
                            onClick={() => navigate('/')}
                            className="w-full sm:w-1/2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition-colors"
                          >
                            Continue Shopping
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Orders
