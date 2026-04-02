import React, { useState } from 'react'
import { useValidateCoupon } from '../hooks/useCoupons'
import type { Coupon } from '../types'

type Props = {
  orderAmount: number
  onCouponApplied: (coupon: Coupon, discount: number) => void
  onCouponRemoved: () => void
  appliedCoupon?: { coupon: Coupon; discount: number } | null
}

const CouponInput: React.FC<Props> = ({ 
  orderAmount, 
  onCouponApplied, 
  onCouponRemoved, 
  appliedCoupon 
}) => {
  const [couponCode, setCouponCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const validateCoupon = useValidateCoupon()

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setError(null)
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        orderAmount
      })
      onCouponApplied(result.coupon, result.discount)
      setCouponCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid coupon code')
    }
  }

  const handleRemoveCoupon = () => {
    onCouponRemoved()
    setError(null)
  }

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-green-700 font-medium">✓ Coupon Applied</span>
              <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded">
                {appliedCoupon.coupon.code}
              </span>
            </div>
            <p className="text-sm text-green-600">
              You saved Rs {appliedCoupon.discount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-green-700 hover:text-green-900 text-sm underline"
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 border rounded px-3 py-2 text-sm font-mono"
          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
        />
        <button
          onClick={handleApplyCoupon}
          disabled={!couponCode.trim() || validateCoupon.isPending}
          className="px-4 py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
        >
          {validateCoupon.isPending ? 'Checking...' : 'Apply'}
        </button>
      </div>
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  )
}

export default CouponInput
