import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Category } from '../types'

export function useCategories(parentId?: string | null) {
  return useQuery({
    queryKey: ['categories', parentId ?? 'root'],
    queryFn: async (): Promise<Category[]> => {
      try {
        const base = collection(db, 'categories')
        const q = parentId
          ? query(base, where('parentId', '==', parentId), orderBy('sort', 'asc'))
          : query(base, orderBy('sort', 'asc'))
        
        const snap = await getDocs(q)
        const categories = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }))
        return categories;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}
