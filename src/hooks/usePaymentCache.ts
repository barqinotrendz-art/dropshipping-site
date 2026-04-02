import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, setDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'

export type PaymentMethod = {
  id: string
  type: 'card' | 'bank' | 'wallet'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  createdAt: Timestamp
}

export type Address = {
  id: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
  createdAt: Timestamp
}

export function usePaymentCache() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Cache user addresses
  const addresses = useQuery({
    queryKey: ['user-addresses', user?.uid],
    queryFn: async (): Promise<Address[]> => {
      if (!user) return []
      const addressesRef = collection(db, 'users', user.uid, 'addresses')
      const q = query(addressesRef, orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Address))
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes - addresses don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Cache payment methods (for future payment gateway integration)
  const paymentMethods = useQuery({
    queryKey: ['user-payment-methods', user?.uid],
    queryFn: async (): Promise<PaymentMethod[]> => {
      if (!user) return []
      const paymentRef = collection(db, 'users', user.uid, 'paymentMethods')
      const q = query(paymentRef, orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentMethod))
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Cache user orders for payment history
  const orderHistory = useQuery({
    queryKey: ['user-orders', user?.uid],
    queryFn: async () => {
      if (!user) return []
      const ordersRef = collection(db, 'orders')
      const q = query(
        ordersRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - orders might update frequently
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Mutation to save address
  const saveAddress = useMutation({
    mutationFn: async (address: Omit<Address, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('User not authenticated')
      const addressRef = doc(collection(db, 'users', user.uid, 'addresses'))
      await setDoc(addressRef, {
        ...address,
        createdAt: new Date(),
      })
      return addressRef.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses', user?.uid] })
    },
  })

  // Mutation to save payment method (for future use)
  const savePaymentMethod = useMutation({
    mutationFn: async (paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('User not authenticated')
      const paymentRef = doc(collection(db, 'users', user.uid, 'paymentMethods'))
      await setDoc(paymentRef, {
        ...paymentMethod,
        createdAt: new Date(),
      })
      return paymentRef.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-payment-methods', user?.uid] })
    },
  })

  // Invalidate all payment-related cache
  const invalidatePaymentCache = () => {
    queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
    queryClient.invalidateQueries({ queryKey: ['user-payment-methods'] })
    queryClient.invalidateQueries({ queryKey: ['user-orders'] })
  }

  return {
    addresses: addresses.data || [],
    paymentMethods: paymentMethods.data || [],
    orderHistory: orderHistory.data || [],
    isLoading: addresses.isLoading || paymentMethods.isLoading || orderHistory.isLoading,
    saveAddress,
    savePaymentMethod,
    invalidatePaymentCache,
  }
}
