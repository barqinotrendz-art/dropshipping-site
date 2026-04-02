import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Category } from '../types'


export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['categoryBySlug', slug],
    enabled: !!slug,
    queryFn: async (): Promise<Category | null> => {
      if (!slug) return null
      const q = query(collection(db, 'categories'), where('slug', '==', slug), limit(1))
      const snap = await getDocs(q)
      if (snap.empty) return null
      const d = snap.docs[0]
      return { id: d.id, ...(d.data() as Omit<Category, 'id'>) }
    }
  })
}
