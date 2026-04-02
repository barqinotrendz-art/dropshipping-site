import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type ProductVariant = {
  id: string
  color: string
  size?: string
  sku: string
  price: number
  stock: number
  imagePublicIds?: string[]
}

export type Product = {
  id: string
  title: string
  slug: string
  description?: string
  brand?: string
  price: number
  discountPrice?: number
  categoryId?: string | null
  imagePublicIds?: string[]
  colorVariants?: Array<{
    name: string
    value: string
    images: string[]
    stock: number
  }>
  variants?: ProductVariant[]
  stock?: number
  sku?: string
  rating?: number
  reviewCount?: number
  tags?: string[]
  active?: boolean
  featured?: boolean
  topSelling?: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export function useProducts(opts?: { categoryId?: string | null; limit?: number }) {
  return useQuery({
    queryKey: ['products', opts?.categoryId ?? 'all', opts?.limit ?? 'unlimited'],
    queryFn: async (): Promise<Product[]> => {
      try {
        const base = collection(db, 'products')
        
        // Build optimized query - get all products without active filter
        let q;
        if (opts?.categoryId) {
          q = query(
            base, 
            where('categoryId', '==', opts.categoryId),
            orderBy('title', 'asc'),
            ...(opts?.limit ? [limit(opts.limit)] : [])
          )
        } else {
          // Get products with limit for better performance
          q = query(
            base,
            orderBy('title', 'asc'),
            ...(opts?.limit ? [limit(opts.limit)] : [limit(100)])
          )
        }
        const snap = await getDocs(q)
        const products = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }))
        // Filter out inactive products in code - this handles products created before active field was added
        // Only filter if active field exists and is explicitly false
        const activeProducts = products.filter(p => p.active !== false)
        return activeProducts;
      } catch (error) {
        throw error; // Throw error so React Query can handle it properly
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}
