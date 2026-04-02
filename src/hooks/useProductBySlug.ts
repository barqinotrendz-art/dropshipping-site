import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Product } from '../types'

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    enabled: !!slug,
    queryFn: async (): Promise<Product | null> => {
      if (!slug) return null
      
      try {
        // First try to find by slug
        const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1))
        const snap = await getDocs(q)
        
        // If not found by slug, try by ID (fallback for products without slugs)
        if (snap.empty) {
          const docRef = collection(db, 'products')
          const allDocs = await getDocs(query(docRef, limit(100)))
          const productDoc = allDocs.docs.find(d => d.id === slug)
          
          if (!productDoc) {
            return null
          }
          
          const product = { id: productDoc.id, ...(productDoc.data() as Omit<Product, 'id'>) }
          return product
        }
        
        const d = snap.docs[0]
        const product = { id: d.id, ...(d.data() as Omit<Product, 'id'>) }
        return product
      } catch (error) {
        throw error
      }
    },
    // Optimized caching for product details
    staleTime: 10 * 60 * 1000, // 10 minutes - product details don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 2,
  })
}
