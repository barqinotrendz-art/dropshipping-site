import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type InventoryAlert = {
  id: string
  title: string
  stock: number
  lowStockThreshold: number
  category: string
  price: number
  imagePublicIds?: string[]
}

async function fetchLowStockProducts(threshold: number = 10): Promise<InventoryAlert[]> {
  const q = query(
    collection(db, 'products'),
    where('stock', '<=', threshold),
    where('stock', '>', 0)
  )
  
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    lowStockThreshold: threshold
  } as InventoryAlert))
}

async function fetchOutOfStockProducts(): Promise<InventoryAlert[]> {
  const q = query(
    collection(db, 'products'),
    where('stock', '==', 0)
  )
  
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    lowStockThreshold: 0
  } as InventoryAlert))
}

export function useLowStockProducts(threshold: number = 10) {
  return useQuery({
    queryKey: ['low-stock-products', threshold],
    queryFn: () => fetchLowStockProducts(threshold),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export function useOutOfStockProducts() {
  return useQuery({
    queryKey: ['out-of-stock-products'],
    queryFn: fetchOutOfStockProducts,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export function useInventoryAlerts(lowStockThreshold: number = 10) {
  const { data: lowStock, isLoading: lowStockLoading } = useLowStockProducts(lowStockThreshold)
  const { data: outOfStock, isLoading: outOfStockLoading } = useOutOfStockProducts()

  return {
    lowStockProducts: lowStock || [],
    outOfStockProducts: outOfStock || [],
    totalAlerts: (lowStock?.length || 0) + (outOfStock?.length || 0),
    isLoading: lowStockLoading || outOfStockLoading
  }
}
