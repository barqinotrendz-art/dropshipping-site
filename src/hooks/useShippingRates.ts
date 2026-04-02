import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type ShippingRate = {
  id: string
  city: string
  rate: number
  province?: string
  active?: boolean
  createdAt?: any
}

async function fetchShippingRates(): Promise<ShippingRate[]> {
  const q = query(collection(db, 'shippingRates'), orderBy('city', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ShippingRate))
}

export function useShippingRates() {
  return useQuery({
    queryKey: ['shippingRates'],
    queryFn: fetchShippingRates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAddShippingRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (rate: Omit<ShippingRate, 'id'>) => {
      const docRef = doc(collection(db, 'shippingRates'))
      await setDoc(docRef, {
        ...rate,
        createdAt: new Date(),
        active: rate.active !== false
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shippingRates'] })
    }
  })
}

export function useUpdateShippingRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ShippingRate> & { id: string }) => {
      await setDoc(doc(db, 'shippingRates', id), data, { merge: true })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shippingRates'] })
    }
  })
}

export function useDeleteShippingRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'shippingRates', id))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shippingRates'] })
    }
  })
}

// Helper function to get shipping rate for a city
export function getShippingRateForCity(city: string, rates: ShippingRate[], defaultRate: number = 300): number {
  if (!city || !rates || rates.length === 0) return defaultRate
  
  // Normalize input city: trim and convert to lowercase for comparison
  const normalizedInputCity = city.trim().toLowerCase()
  
  // Find matching rate (case-insensitive comparison)
  const rate = rates.find(r => 
    r.active !== false && 
    r.city.trim().toLowerCase() === normalizedInputCity
  )
  
  return rate?.rate || defaultRate
}
