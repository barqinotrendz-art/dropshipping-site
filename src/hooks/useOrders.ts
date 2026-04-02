import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type Order = {
  id: string
  orderNumber?: string
  userId: string
  customerEmail?: string
  items: Array<{
    productId: string
    title: string
    price: number
    qty: number
  }>
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
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order))
}

export function useOrders() {
  return useQuery({ 
    queryKey: ['admin-orders'], 
    queryFn: fetchOrders,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Order> }) => {
      await updateDoc(doc(db, 'orders', id), data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
    }
  })
}
