import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, updateDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type Coupon = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  validFrom: Timestamp
  validUntil: Timestamp
  active: boolean
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async (): Promise<Coupon[]> => {
      const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Coupon, 'id'>) }))
    }
  })
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, orderAmount }: { code: string, orderAmount: number }) => {
      const q = query(collection(db, 'coupons'), where('code', '==', code.toUpperCase()))
      const snap = await getDocs(q)
      
      if (snap.empty) throw new Error('Invalid coupon code')
      
      const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon
      const now = new Date()
      
      if (!coupon.active) throw new Error('Coupon is inactive')
      if (coupon.validFrom?.toDate() > now) throw new Error('Coupon not yet valid')
      if (coupon.validUntil?.toDate() < now) throw new Error('Coupon has expired')
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new Error('Coupon usage limit reached')
      if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
        throw new Error(`Minimum order amount is $${coupon.minOrderAmount}`)
      }
      
      let discount = 0
      if (coupon.type === 'percentage') {
        discount = (orderAmount * coupon.value) / 100
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount
        }
      } else {
        discount = coupon.value
      }
      
      return { coupon, discount: Math.min(discount, orderAmount) }
    }
  })
}

export function useApplyCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (couponId: string) => {
      const couponRef = doc(db, 'coupons', couponId)
      await updateDoc(couponRef, {
        usedCount: (await getDocs(query(collection(db, 'coupons'), where('id', '==', couponId)))).docs[0]?.data()?.usedCount + 1 || 1,
        updatedAt: serverTimestamp()
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] })
    }
  })
}
