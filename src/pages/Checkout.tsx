import React, { useState, useEffect } from 'react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { doc, setDoc, serverTimestamp, collection, Timestamp, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useNavigate, Link } from 'react-router-dom'
import { useCoupons, type Coupon } from '../hooks/useCoupons'
import { useShippingRates, getShippingRateForCity } from '../hooks/useShippingRates'
import { usePaymentSettings } from '../hooks/usePaymentSettings'
import { getCloudinaryUrl } from '../lib/cloudinary'
import { AdvancedImage } from '@cloudinary/react'
import { cld } from '../lib/cloudinary'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'
import toast from 'react-hot-toast'

type Address = {
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}


// Hook for applying coupons
function useApplyCoupon() {
  const { data: coupons } = useCoupons()
  
  return (code: string) => {
    const coupon = coupons?.find(c => c.code.toLowerCase() === code.toLowerCase() && c.active)
    if (!coupon) return null
    return coupon
  }
}

// CouponInput component
const CouponInput: React.FC<{
  orderAmount: number
  onCouponApplied: (coupon: Coupon, discount: number) => void
  onCouponRemoved: () => void
  appliedCoupon: { coupon: Coupon; discount: number } | null
}> = ({ orderAmount, onCouponApplied, onCouponRemoved, appliedCoupon }) => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const applyCoupon = useApplyCoupon()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    
    setLoading(true)
    try {
      const coupon = applyCoupon(code.trim())
      if (!coupon) {
        toast.error('Invalid coupon code')
        return
      }
      
      if (orderAmount < (coupon.minOrderAmount || 0)) {
        toast.error(`Minimum order amount is Rs${coupon.minOrderAmount || 0}`)
        return
      }
      
      let discount = 0
      if (coupon.type === 'percentage') {
        discount = Math.min((orderAmount * coupon.value) / 100, coupon.maxDiscount || Infinity)
      } else {
        discount = coupon.value
      }
      
      onCouponApplied(coupon, discount)
      setCode('')
      toast.success('Coupon applied successfully!')
    } catch {
      toast.error('Failed to apply coupon')
    } finally {
      setLoading(false)
    }
  }
  
  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
        <div>
          <span className="text-green-800 font-medium">{appliedCoupon.coupon.code}</span>
          <span className="text-green-600 text-sm ml-2">-Rs {appliedCoupon.discount.toFixed(2)}</span>
        </div>
        <button
          onClick={onCouponRemoved}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Remove
        </button>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter coupon code"
        className="flex-1 border rounded px-3 py-2"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? 'Applying...' : 'Apply'}
      </button>
    </form>
  )
}

const Checkout: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, clear } = useCart()
  const { data: shippingRates } = useShippingRates()
  const { data: paymentSettings, isLoading: isLoadingPayment } = usePaymentSettings()

  // Debug payment settings removed for production

  const [addr, setAddr] = useState<Address>({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
  })

  const [saveForNext, setSaveForNext] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<{ coupon: Coupon; discount: number } | null>(null)

  // Auto-load saved address when user logs in
  useEffect(() => {
    const loadSavedAddress = async () => {
      if (!user) return
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        const data = snap.data() as { shippingAddress?: Address } | undefined
        if (data?.shippingAddress) {
          setAddr(data.shippingAddress)
        }
      } catch (error) {
        // Silent catch for production build
      }
    }
    loadSavedAddress()
  }, [user])

  const subtotal = items.reduce((sum: number, item) => sum + (item.price * item.qty), 0)
  const shipping = getShippingRateForCity(addr.city, shippingRates || [], 300)
  const discount = appliedCoupon?.discount || 0
  const total = Math.max(0, subtotal - discount)
  const hasBankDetails = Boolean(
    paymentSettings && (
      paymentSettings.accountName?.trim() ||
      paymentSettings.bankName?.trim() ||
      paymentSettings.accountNumber?.trim() ||
      paymentSettings.iban?.trim()
    )
  )
  const hasWalletDetails = Boolean(
    paymentSettings?.wallets?.some(
      (wallet) => wallet.name?.trim() && wallet.number?.trim()
    )
  )

  const onPlaceOrder = async () => {
    // Validate required fields
    const requiredFields = [
      { field: 'fullName', label: 'Full Name' },
      { field: 'phone', label: 'Phone Number' },
      { field: 'line1', label: 'Address Line 1' },
      { field: 'city', label: 'City' },
      { field: 'postalCode', label: 'Postal Code' }
    ]

    for (const { field, label } of requiredFields) {
      if (!addr[field as keyof Address]?.trim()) {
        const errorMsg = `Please enter ${label}`
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }
    }

    // Validate Pakistan phone number format (03XX XXXXXXX)
    const phoneRegex = /^03\d{9}$/
    const cleanPhone = addr.phone.replace(/\s/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      const errorMsg = 'Please enter a valid mobile number (03XX XXXXXXX)'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    // Validate postal code
    if (addr.postalCode.length < 3) {
      const errorMsg = 'Please enter a valid postal code'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!user) {
      // Save to localStorage if not logged in
      localStorage.setItem('checkoutAddress', JSON.stringify(addr))
      toast.error('Please log in to complete your order')
      navigate('/login', { state: { from: '/checkout' } })
      return
    }

   
    
    // Check if email is valid
    if (!user.email || user.email === 'undefined@gmail.com' || !user.email.includes('@')) {
      toast.error('Invalid user account. Please log out and create a new account with a valid email.')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty. Please add some items before checkout.')
      return
    }

    if (isLoadingPayment) {
      toast.error('Payment details are loading. Please wait a moment and try again.')
      return
    }

    if (!hasBankDetails && !hasWalletDetails) {
      toast.error('Payment details not configured. Please contact admin.')
      return
    }

    toast.loading('Processing your order...', { id: 'checkout' })

    try {
      setSubmitting(true)
      setError(null)

      // Save address if requested
      if (saveForNext && user) {
        await setDoc(
          doc(db, 'users', user.uid),
          { shippingAddress: addr },
          { merge: true }
        )
      }

      // Create order with auto-generated ID
      const ordersRef = collection(db, 'orders')
      const docRef = doc(ordersRef)
      
      // Generate order number: ORD-YYYYMMDD-XXXXX (last 5 chars of doc ID)
      const now = new Date()
      const dateStr = now.getFullYear().toString() + 
                      (now.getMonth() + 1).toString().padStart(2, '0') + 
                      now.getDate().toString().padStart(2, '0')
      const orderNumber = `ORD-${dateStr}-${docRef.id.slice(-5).toUpperCase()}`
      
      const orderData = {
        userId: user.uid,
        customerEmail: user.email || 'no-email',
        orderNumber,
        items: items.map((i) => ({
          productId: i.id,
          title: i.name,
          price: i.price,
          qty: i.qty,
          image: i.image ? (i.image.startsWith('http') ? i.image : getCloudinaryUrl(i.image, 200, 200)) : null,
        })),
        totals: { subtotal, shipping, discount, grandTotal: total },
        coupon: appliedCoupon ? {
          id: appliedCoupon.coupon.id,
          code: appliedCoupon.coupon.code,
          discount: appliedCoupon.discount
        } : null,
        currency: 'USD',
        payment: { method: 'COD', status: 'pending' },
        shipping: addr,
        status: 'Pending',
        timeline: [{ status: 'Pending', at: Timestamp.now() }],
        createdAt: serverTimestamp(),
      }
      
      await setDoc(docRef, orderData)
      
      // Note: Coupon usage tracking would be handled here if needed
      // For now, we just record it in the order
      
      clear()
      toast.success('Order placed successfully!', { id: 'checkout' })
      navigate(`/orders/${docRef.id}`)
    } catch (e) {
      let errorMessage = 'Failed to place order. Please try again.'
      
      if (e instanceof Error) {
        if (e.message?.includes('permission')) {
          errorMessage = 'Permission denied. Please log in and try again.'
        } else if (e.message?.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else {
          errorMessage = `Error: ${e.message}`
        }
      } else if (typeof e === 'object' && e !== null && 'code' in e) {
        const firebaseError = e as { code: string; message?: string }
        if (firebaseError.code === 'permission-denied') {
          errorMessage = 'Permission denied. Firebase rules blocking order creation.'
        } else {
          errorMessage = `Error: ${firebaseError.code}${firebaseError.message ? ` - ${firebaseError.message}` : ''}`
        }
      }
      
      setError(errorMessage)
      toast.error(errorMessage, { id: 'checkout' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          {!user && (
            <Link to="/login" className="text-blue-600 hover:underline text-sm">
              Sign in for faster checkout
            </Link>
          )}
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Your cart is empty. <Link className="text-blue-600 hover:underline" to="/">Browse products</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">


              {/* Delivery Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery</h2>
                <div className="space-y-4">
                  <div>
                    <div className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm bg-gray-50 text-gray-700">
                      Pakistan
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="First name" 
                      value={addr.fullName.split(' ')[0] || ''} 
                      onChange={e => {
                        const lastName = addr.fullName.split(' ').slice(1).join(' ')
                        setAddr({ ...addr, fullName: `${e.target.value} ${lastName}`.trim() })
                      }}
                      required
                    />
                    <input 
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Last name" 
                      value={addr.fullName.split(' ').slice(1).join(' ') || ''} 
                      onChange={e => {
                        const firstName = addr.fullName.split(' ')[0] || ''
                        setAddr({ ...addr, fullName: `${firstName} ${e.target.value}`.trim() })
                      }}
                    />
                  </div>
                  <input 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Address" 
                    value={addr.line1} 
                    onChange={e => setAddr({ ...addr, line1: e.target.value })}
                    required
                  />
                  <input 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Apartment, suite, etc. (optional)" 
                    value={addr.line2} 
                    onChange={e => setAddr({ ...addr, line2: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="City" 
                      value={addr.city} 
                      onChange={e => setAddr({ ...addr, city: e.target.value })}
                      required
                    />
                    <input 
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Postal code" 
                      value={addr.postalCode} 
                      onChange={e => setAddr({ ...addr, postalCode: e.target.value })}
                    />
                  </div>
                  <input 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Phone" 
                    value={addr.phone} 
                    onChange={e => setAddr({ ...addr, phone: e.target.value })}
                    required
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input 
                      type="checkbox" 
                      checked={saveForNext} 
                      onChange={(e) => setSaveForNext(e.target.checked)} 
                      className="rounded border-gray-300"
                    />
                    Save this information for next time
                  </label>
                </div>
              </div>



              {/* Payment Method */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment</h2>
                <p className="text-xs text-gray-500 mb-4">All transactions are secure and encrypted.</p>
                <div className="border border-gray-300 rounded-md">
                  <div className="p-4 bg-blue-50 border-b border-gray-300">
                    <label className="flex items-center gap-3">
                      <input type="radio" checked readOnly className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Cash on Delivery (COD)</span>
                    </label>
                  </div>
                  <div className="p-4 bg-gray-50">
                    <div className="space-y-4 text-sm">
                      {/* English Instructions */}
                      <div className="space-y-2">
                        <p className="font-semibold text-gray-900">Thank you for your order!</p>
                        <p className="text-gray-700">
                          To confirm your order, you have to make an advance payment of <strong>Rs {shipping.toFixed(2)}</strong> separately for delivery charges. 
                          After payment, kindly share screenshot as a proof on this number: <strong className="text-blue-600">{paymentSettings?.whatsappNumber || '(Not set)'}</strong> (WhatsApp only)
                        </p>
                        
                        {isLoadingPayment ? (
                          <div className="bg-white border border-gray-200 rounded p-3">
                            <p className="text-gray-500 text-sm">Loading payment details...</p>
                          </div>
                        ) : paymentSettings && Object.keys(paymentSettings).length > 0 ? (
                          <div className="bg-white border border-gray-200 rounded p-3 space-y-1">
                            <p className="font-semibold text-gray-900">Account details:</p>

                            {paymentSettings.accountName && (
                              <p>Account name: <strong>{paymentSettings.accountName}</strong></p>
                            )}

                            {paymentSettings.bankName && (
                              <p>Bank: <strong>{paymentSettings.bankName}</strong></p>
                            )}

                            {paymentSettings.accountNumber && (
                              <p>Account no: <strong>{paymentSettings.accountNumber}</strong></p>
                            )}

                            {paymentSettings.iban && (
                              <p>Iban: <strong>{paymentSettings.iban}</strong></p>
                            )}

                            {paymentSettings.wallets && paymentSettings.wallets.length > 0 && (
                              <div>
                                <p className="text-gray-700">Wallets:</p>
                                {paymentSettings.wallets.map((wallet) => (
                                  <p key={wallet.id} className="ml-2 text-base">
                                    {wallet.wallet_name && (
                                      <span>
                                        <strong>Holder:</strong> {wallet.wallet_name}{'- '}
                                      </span>
                                    )}
                                    <strong>{wallet.name}: </strong> {wallet.number}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white border border-gray-200 rounded p-3">
                            <p className="text-red-600 text-sm">Payment details not configured. Please contact admin.</p>
                          </div>
                        )}
                        
                        {paymentSettings?.instructionsEnglish && (
                          <p className="text-gray-600 text-xs">{paymentSettings.instructionsEnglish}</p>
                        )}
                      </div>

                      {/* Urdu Instructions */}
                      {paymentSettings && Object.keys(paymentSettings).length > 0 && (
                        <div className="border-t pt-3 space-y-2 text-sm font-sans" dir="rtl">
                          <p className="font-bold text-gray-900"> آرڈر کے لئے آپ کا شکریہ!</p>
                          <p className="text-gray-700">
                            اپنے آرڈر کی تصدیق کرنے کے لیے، آپ کو ڈیلیوری چارجز کی الگ سے <strong>{shipping.toFixed(2)} روپے</strong> کی آڈوانس ادائیگی کرنی ہوگی۔ 
                            ادائیگی کے بعد دیے گئے نمبر پر صرف واٹس ایپ کے ذریعے شیئر کریں  
                          </p>
                            <strong className="text-blue-600 text" dir="ltr">{ paymentSettings.whatsappNumber || '(Not set)'}</strong>
                          <p>
                            دیگر  ادائیگی (COD) کے تحت ڈیلیوری کے وقت کی جائے گی۔
                          </p>
                          <div className="bg-white border border-gray-200 rounded p-3 space-y-1">
                            <p className="font-semibold text-gray-900">اکاؤنٹ کی تفصیلات:</p>

                            {paymentSettings.accountName && (
                              <p>نام: <strong>{paymentSettings.accountName}</strong></p>
                            )}

                            {paymentSettings.bankName && (
                              <p>بینک: <strong>{paymentSettings.bankName}</strong></p>
                            )}

                            {paymentSettings.accountNumber && (
                              <p>اکاؤنٹ نمبر: <strong>{paymentSettings.accountNumber}</strong></p>
                            )}

                            {paymentSettings.iban && (
                              <p>Iban: <strong>{paymentSettings.iban}</strong></p>
                            )}

                            {paymentSettings.wallets && paymentSettings.wallets.length > 0 && (
                              <div>
                                <p className="text-gray-700">والیٹس:</p>
                                {paymentSettings.wallets.map((wallet) => (
                                  <p key={wallet.id} className="mr-2 text-base">
                                    {wallet.wallet_name && (
                                      <span>
                                         {wallet.wallet_name}{' '}
                                      </span>
                                    )}
                                    <strong>{wallet.name} {"-"}</strong> {wallet.number}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                            
                          
                          {paymentSettings.instructionsUrdu && (
                            <p className="text-gray-600 text-xs">{paymentSettings.instructionsUrdu}</p>
                          )}
                        </div>
                      )}
                      
                      <div className="border-t pt-3">
                        <p className="text-base text-gray-600"><strong>Step 2 - Product Payment:</strong> Pay <strong>Rs {total.toFixed(2)}</strong> (product amount) on delivery.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => {
                    const productImage = item.image 
                      ? cld.image(item.image).format('auto').quality('auto').resize(fill().width(80).height(80).gravity(autoGravity()))
                      : null
                    
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative">
                          {productImage ? (
                            <div className="w-16 h-16 rounded-md border overflow-hidden bg-gray-100">
                              <AdvancedImage cldImg={productImage} alt={item.name} />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-md border bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                          <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.qty}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">Qty: {item.qty}</p>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          Rs {(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Coupon Code */}
                <div className="mb-6">
                  <CouponInput
                    orderAmount={subtotal}
                    onCouponApplied={(coupon: Coupon, discount: number) => setAppliedCoupon({ coupon, discount })}
                    onCouponRemoved={() => setAppliedCoupon(null)}
                    appliedCoupon={appliedCoupon}
                  />
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Rs {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col ">
                   <div className='flex justify-between text-sm'>
                     <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{addr.city ? `Rs ${shipping.toFixed(2)}` : 'Calculated at next step'}</span>
                  
                   </div>
                   <div className='text-xs text-gray-500'>
                    <span>before checkout first scroll to read shipping policies</span>
                  </div>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-Rs {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold border-t pt-3">
                    <span>Total</span>
                    <span>PKR Rs {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Complete Order Button */}
                <button 
                  className="w-full py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-6" 
                  disabled={submitting || items.length === 0} 
                  onClick={onPlaceOrder}
                >
                  {submitting ? 'Processing...' : 'Complete order'}
                </button>
                
                {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md mt-4">{error}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Checkout
