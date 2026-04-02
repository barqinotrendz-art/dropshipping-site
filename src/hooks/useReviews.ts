import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

// Helper function to update product rating and review count
async function updateProductStats(productId: string) {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      where('status', '==', 'approved')
    )
    const snap = await getDocs(q)
    const reviews = snap.docs.map(d => d.data() as Review)

    const reviewCount = reviews.length
    const rating = reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0

    const roundedRating = Math.round(rating * 10) / 10

    await updateDoc(doc(db, 'products', productId), {
      rating: roundedRating,
      reviewCount,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    throw error
  }
}

export type Review = {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment?: string
  verified?: boolean
  helpful?: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export function useReviews(productId?: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    enabled: !!productId,
    queryFn: async (): Promise<Review[]> => {
      if (!productId) return []
      try {
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        const reviews = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }))
        return reviews
      } catch (error: any) {
        throw error
      }
    }
  })
}

export function useAllReviews() {
  return useQuery({
    queryKey: ['reviews-admin'],
    queryFn: async (): Promise<Review[]> => {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }))
    }
  })
}

export function useAddReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
      return addDoc(collection(db, 'reviews'), {
        ...review,
        helpful: 0,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['reviews', variables.productId] })
      qc.invalidateQueries({ queryKey: ['reviews-admin'] })
    }
  })
}

export function useUpdateReviewStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, productId }: { id: string, status: Review['status'], productId: string }) => {
      await updateDoc(doc(db, 'reviews', id), { status, updatedAt: serverTimestamp() })
      // Update product stats after status change
      await updateProductStats(productId)
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['reviews', variables.productId] })
      qc.invalidateQueries({ queryKey: ['reviews-admin'] })
      // Invalidate all product queries to refresh ratings
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    }
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, productId }: { id: string, productId: string }) => {
      await deleteDoc(doc(db, 'reviews', id))
      // Update product stats after deletion
      await updateProductStats(productId)
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['reviews', variables.productId] })
      qc.invalidateQueries({ queryKey: ['reviews-admin'] })
      // Invalidate all product queries to refresh ratings
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    }
  })
}
