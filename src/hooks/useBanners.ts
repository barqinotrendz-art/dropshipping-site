import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type Banner = {
  id: string
  publicId: string // Desktop image (1920×880)
  mobilePublicId?: string // Mobile image (800×800)
  title?: string
  caption?: string
  ctaLabel?: string
  ctaUrl?: string
  sort?: number
  active?: boolean
}

export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async (): Promise<Banner[]> => {
      try {
        const q = query(collection(db, 'banners'), orderBy('sort', 'asc'))
        const snap = await getDocs(q)
        const allBanners = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Banner, 'id'>) }))
        
        // Filter only active banners
        const activeBanners = allBanners.filter(banner => banner.active !== false)
        return activeBanners;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}
