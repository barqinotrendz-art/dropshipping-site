import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { getCloudinaryUrl } from '../lib/cloudinary'
import cartIcon from '../assets/empty-cart-svgrepo-com.svg'
import type { CartItem, PriceTier } from '../types'

const Cart: React.FC = () => {
  const { items, removeItem, updateQty, clear, loading, getTotal, getItemTotal  } = useCart()
  const navigate = useNavigate()

  //   const getItemTotal = (item:CartItem) => {
  //   if (!item.pricing || item.pricing.length === 0) {
  //     return item.price * item.qty
  //   }

  //   // Find matching tier (buy 1, buy 2, etc.)
  //   const tier = item.pricing.find(
  //     (p:PriceTier) => p.label === `buy ${item.qty}`
  //   )

  //   return (
  //     tier?.discountPrice ??
  //     tier?.price ??
  //     item.price * item.qty
  //   )
  // }

  // const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  const subtotal = getTotal()
  // const subtotal = items.reduce((sum, i) => sum + getItemTotal(i), 0)

  // Ensure cart page starts at top
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-700 font-medium">Updating cart...</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="text-sm text-gray-600">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 flex flex-col justify-center items-center bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-6xl mb-4 h-48 w-48"><img src={cartIcon} alt="cartIcon" /></div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((i) => (
              <div key={i.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      {i.image ? (
                        <img
                          src={getCloudinaryUrl(i.image, 200, 200)}
                          alt={i.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSA0MEg2NUw2MCA2MEgzNUwzNSA0MFoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNDUiIGN5PSI0NSIgcj0iNSIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{i.name}</h3>
                    <p className="text-lg font-bold text-blue-600">Rs {i.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {/* Total: Rs {(i.price * i.qty).toFixed(2)}                    */}
                      Total: Rs {getItemTotal(i).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQty(i.id, Math.max(1, i.qty - 1))}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                        value={i.qty}
                        onChange={(e) => updateQty(i.id, Math.max(1, Number(e.target.value) || 1))}
                      />
                      <button
                        onClick={() => updateQty(i.id, i.qty + 1)}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(i.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-medium">Rs {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Subtotal</span>
                  <span className="text-blue-600">Rs {subtotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors mb-3"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={clear}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
