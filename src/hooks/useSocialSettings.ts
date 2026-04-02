import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type SocialSettings = {
  facebook?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  whatsapp?: string
}

async function fetchSocialSettings() {
  const docRef = doc(db, 'settings', 'social')
  const snap = await getDoc(docRef)
  if (snap.exists()) {
    return snap.data() as SocialSettings
  }
  return {}
}

export function useSocialSettings() {
  return useQuery({ 
    queryKey: ['social-settings'], 
    queryFn: fetchSocialSettings,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  })
}
