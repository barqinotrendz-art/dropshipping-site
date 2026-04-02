import React from 'react'
import { useForm } from 'react-hook-form'
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useCoupons } from '../../hooks/useCoupons'
import { useQueryClient } from '@tanstack/react-query'
import type { Coupon } from '../../hooks/useCoupons'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

type CouponForm = {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  validFrom: string
  validUntil: string
  active: boolean
}

const CouponsAdminPage: React.FC = () => {
  const qc = useQueryClient()
  const { data: coupons, isLoading } = useCoupons()
  const { register, handleSubmit, reset, watch } = useForm<CouponForm>({
    defaultValues: {
      active: true,
      type: 'percentage',
      value: 10,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    }
  })
  
  const couponType = watch('type')

  const onSubmit = async (values: CouponForm) => {
    const payload = {
      code: values.code.toUpperCase(),
      type: values.type,
      value: Number(values.value),
      minOrderAmount: values.minOrderAmount ? Number(values.minOrderAmount) : null,
      maxDiscount: values.maxDiscount ? Number(values.maxDiscount) : null,
      usageLimit: values.usageLimit ? Number(values.usageLimit) : null,
      usedCount: 0,
      validFrom: new Date(values.validFrom),
      validUntil: new Date(values.validUntil),
      active: values.active,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    
    await addDoc(collection(db, 'coupons'), payload)
    reset({
      code: '',
      type: 'percentage',
      value: 10,
      minOrderAmount: undefined,
      maxDiscount: undefined,
      usageLimit: undefined,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true
    })
    qc.invalidateQueries({ queryKey: ['coupons'] })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this coupon?')) {
      await deleteDoc(doc(db, 'coupons', id))
      qc.invalidateQueries({ queryKey: ['coupons'] })
    }
  }

  const toggleActive = async (coupon: Coupon) => {
    await updateDoc(doc(db, 'coupons', coupon.id), {
      active: !coupon.active,
      updatedAt: serverTimestamp()
    })
    qc.invalidateQueries({ queryKey: ['coupons'] })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">Admin • Coupons</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl bg-gray-50 p-4 sm:p-6 rounded">
        <h2 className="text-base sm:text-lg font-medium">Create New Coupon</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Coupon Code *</label>
            <input 
              className="w-full border rounded px-3 py-2 uppercase"
              placeholder="SAVE20"
              {...register('code', { required: true })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select className="w-full border rounded px-3 py-2" {...register('type')}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {couponType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount ($)'} *
            </label>
            <input 
              type="number"
              step={couponType === 'percentage' ? '1' : '0.01'}
              className="w-full border rounded px-3 py-2"
              {...register('value', { required: true, valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min Order Amount ($)</label>
            <input 
              type="number"
              step="0.01"
              className="w-full border rounded px-3 py-2"
              {...register('minOrderAmount', { valueAsNumber: true })}
            />
          </div>
          {couponType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium mb-1">Max Discount ($)</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border rounded px-3 py-2"
                {...register('maxDiscount', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Usage Limit</label>
            <input 
              type="number"
              className="w-full border rounded px-3 py-2"
              placeholder="Unlimited"
              {...register('usageLimit', { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valid From *</label>
            <input 
              type="date"
              className="w-full border rounded px-3 py-2"
              {...register('validFrom', { required: true })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valid Until *</label>
            <input 
              type="date"
              className="w-full border rounded px-3 py-2"
              {...register('validUntil', { required: true })}
            />
          </div>
        </div>

        <div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register('active')} />
            Active
          </label>
        </div>

        <Button type="submit" variant="primary">
          Create Coupon
        </Button>
      </form>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Existing Coupons</h2>
        {isLoading && <LoadingSpinner size="md" text="Loading coupons..." />}
        {!isLoading && (!coupons || coupons.length === 0) && <p className="text-gray-500 text-sm sm:text-base">No coupons yet.</p>}
        {coupons && coupons.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-left text-xs sm:text-sm">Code</th>
                    <th className="border p-2 text-left text-xs sm:text-sm">Type</th>
                    <th className="border p-2 text-left text-xs sm:text-sm">Value</th>
                    <th className="border p-2 text-left text-xs sm:text-sm">Usage</th>
                    <th className="border p-2 text-left text-xs sm:text-sm">Valid Period</th>
                    <th className="border p-2 text-left text-xs sm:text-sm">Status</th>
                    <th className="border p-2 text-left text-xs sm:text-sm">Actions</th>
                  </tr>
                </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const validFrom = coupon.validFrom?.toDate?.()?.toLocaleDateString() || 'N/A'
                  const validUntil = coupon.validUntil?.toDate?.()?.toLocaleDateString() || 'N/A'
                  const isExpired = coupon.validUntil?.toDate?.() < new Date()
                  
                  return (
                    <tr key={coupon.id}>
                      <td className="border p-2 font-mono">{coupon.code}</td>
                      <td className="border p-2">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                      </td>
                      <td className="border p-2 text-sm">
                        {coupon.minOrderAmount && <div>Min: ${coupon.minOrderAmount}</div>}
                        {coupon.maxDiscount && <div>Max: ${coupon.maxDiscount}</div>}
                      </td>
                      <td className="border p-2">
                        {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                      </td>
                      <td className="border p-2 text-sm">
                        <div>{validFrom}</div>
                        <div>{validUntil}</div>
                      </td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          !coupon.active ? 'bg-gray-200 text-gray-700' :
                          isExpired ? 'bg-red-100 text-red-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {!coupon.active ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="border p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive(coupon)}
                          >
                            {coupon.active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(coupon.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {coupons.map((coupon: any) => {
                const validFrom = new Date(coupon.validFrom?.toDate?.() || coupon.validFrom).toLocaleDateString()
                const validUntil = new Date(coupon.validUntil?.toDate?.() || coupon.validUntil).toLocaleDateString()
                const isExpired = new Date() > new Date(coupon.validUntil?.toDate?.() || coupon.validUntil)
                const usageText = coupon.usageLimit ? `${coupon.usedCount || 0}/${coupon.usageLimit}` : `${coupon.usedCount || 0}/∞`
                
                return (
                  <div key={coupon.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-blue-600">{coupon.code}</h3>
                        <p className="text-sm text-gray-600 capitalize">{coupon.type} • {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        !coupon.active ? 'bg-gray-200 text-gray-700' :
                        isExpired ? 'bg-red-100 text-red-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {!coupon.active ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Usage:</span>
                        <span className="font-medium">{usageText}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valid:</span>
                        <span className="font-medium">{validFrom} - {validUntil}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(coupon)}
                        className="flex-1"
                      >
                        {coupon.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(coupon.id)}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CouponsAdminPage
