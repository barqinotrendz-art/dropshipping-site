import { create } from 'zustand'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import toast from 'react-hot-toast'

export interface WishlistItem {
  productId: string
  title: string
  imagePublicId?: string
  price?: number
  slug?: string
  addedAt: number
}

interface WishlistStore {
  items: WishlistItem[]
  loading: boolean
  initialized: boolean
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>
  remove: (productId: string) => Promise<void>
  clear: () => Promise<void>
  reset: () => Promise<void>
  isInWishlist: (productId: string) => boolean
  loadWishlist: (userId: string) => Promise<void>
}

export const useWishlist = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,
  initialized: false,
  
  addItem: async (item) => {
    set({ loading: true })
    try {
      const { items } = get()
      const exists = items.find(i => i.productId === item.productId)
      
      if (!exists) {
        const newItem = { ...item, addedAt: Date.now() }
        const updatedItems = [...items, newItem]
        
        set({ items: updatedItems })
        
        // Sync to Firestore if user is authenticated
        const user = auth.currentUser
        if (user) {
          await setDoc(doc(db, 'wishlists', user.uid), {
            items: updatedItems,
            updatedAt: Date.now()
          })
        }
        
        toast.success('Item saved for later', {
          icon: '❤️',
          duration: 1500,
        })
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
    } finally {
      set({ loading: false })
    }
  },
  
  remove: async (productId) => {
    set({ loading: true })
    try {
      const updatedItems = get().items.filter(item => item.productId !== productId)
      set({ items: updatedItems })
      
      // Sync to Firestore if user is authenticated
      const user = auth.currentUser
      if (user) {
        await setDoc(doc(db, 'wishlists', user.uid), {
          items: updatedItems,
          updatedAt: Date.now()
        })
      }
      
      toast.success('Removed from wishlist', {
       
        duration: 1500,
      })
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    } finally {
      set({ loading: false })
    }
  },
  
  clear: async () => {
    set({ loading: true })
    try {
      set({ items: [] })
      
      // Clear from Firestore if user is authenticated
      const user = auth.currentUser
      if (user) {
        await setDoc(doc(db, 'wishlists', user.uid), {
          items: [],
          updatedAt: Date.now()
        })
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error)
    } finally {
      set({ loading: false })
    }
  },

  reset: async () => {
    set({ loading: true })
    try {
      set({ items: [] })
      
      // Clear from Firestore if user is authenticated
      const user = auth.currentUser
      if (user) {
        await setDoc(doc(db, 'wishlists', user.uid), {
          items: [],
          updatedAt: Date.now()
        })
      }
    } catch (error) {
      console.error('Error resetting wishlist:', error)
    } finally {
      set({ loading: false })
    }
  },
  
  isInWishlist: (productId) => {
    return get().items.some(item => item.productId === productId)
  },

  loadWishlist: async (userId: string) => {
    try {
      set({ loading: true })
      const wishlistRef = doc(db, 'wishlists', userId)
      const snapshot = await getDoc(wishlistRef)
      
      if (snapshot.exists()) {
        const data = snapshot.data()
        set({ items: data.items || [], initialized: true })
      } else {
        // Create initial empty wishlist document
        await setDoc(wishlistRef, {
          items: [],
          updatedAt: Date.now(),
          createdAt: Date.now()
        })
        set({ items: [], initialized: true })
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
      set({ items: [], initialized: true })
    } finally {
      set({ loading: false })
    }
  }
}))

// Load wishlist once on auth state change (no real-time sync)
onAuthStateChanged(auth, (user) => {
  if (user) {
    useWishlist.getState().loadWishlist(user.uid)
  } else {
    // Clear wishlist on logout
    useWishlist.setState({ items: [], initialized: false })
  }
})