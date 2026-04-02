import { create } from 'zustand'
import type { CartItem } from '../types'
import { db, auth } from '../lib/firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import toast from 'react-hot-toast'

interface CartState {
  items: CartItem[]
  loading: boolean
  initialized: boolean
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQty: (id: string, qty: number) => Promise<void>
  clear: () => Promise<void>
  reset: () => Promise<void>
  getTotal: () => number
  getItemCount: () => number
  syncCart: (userId: string) => void
  stopSync: () => void
}

let unsubscribeSnapshot: (() => void) | null = null

export const useCart = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  initialized: false,
  
  addItem: async (item) => {
    set({ loading: true })
    try {
      const { items } = get()
      const existingItem = items.find(i => i.id === item.id)
      
      let newItems: CartItem[]
      if (existingItem) {
        // Item exists - remove it (toggle off)
        newItems = items.filter(i => i.id !== item.id)
        toast.success(`Removed from cart`, {
          
          duration: 1500,
        })
      } else {
        // Item doesn't exist - add it (toggle on)
        newItems = [...items, { ...item, qty: item.qty || 1 }]
        toast.success(`Added to cart`, {
          duration: 1500,
        })
      }

      set({ items: newItems })

      // Save to Firestore if user is authenticated
      const user = auth.currentUser
      if (user) {
        const total = newItems.reduce((sum, i) => sum + (i.price * i.qty), 0)
        await setDoc(doc(db, 'carts', user.uid), {
          items: newItems,
          total: total,
          updatedAt: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error toggling cart item:', error)
      toast.error('Failed to update cart', { duration: 1500 })
    } finally {
      set({ loading: false })
    }
  },
  
  removeItem: async (id) => {
    set({ loading: true })
    try {
      const { items } = get()
      const newItems = items.filter(item => item.id !== id)
      
      set({ items: newItems })

      // Save to Firestore if user is authenticated
      const user = auth.currentUser
      if (user) {
        const total = newItems.reduce((sum, i) => sum + (i.price * i.qty), 0)
        await setDoc(doc(db, 'carts', user.uid), {
          items: newItems,
          total: total,
          updatedAt: new Date().toISOString()
        })
      }

   
    }finally {
      set({ loading: false })
    }
  },
  
  updateQty: async (id, qty) => {
    if (qty <= 0) {
      await get().removeItem(id)
      return
    }
    
    set({ loading: true })
    try {
      const { items } = get()
      const newItems = items.map(item => item.id === id ? { ...item, qty } : item)
      set({ items: newItems })

      // Save to Firestore if user is authenticated
      const user = auth.currentUser
      if (user) {
        const total = newItems.reduce((sum, i) => sum + (i.price * i.qty), 0)
        await setDoc(doc(db, 'carts', user.uid), {
          items: newItems,
          total: total,
          updatedAt: new Date().toISOString()
        })
      }
    }  finally {
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
        await setDoc(doc(db, 'carts', user.uid), {
          items: [],
          total: 0,
          updatedAt: new Date().toISOString()
        })
      }
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
        await setDoc(doc(db, 'carts', user.uid), {
          items: [],
          total: 0,
          updatedAt: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error resetting cart:', error)
    } finally {
      set({ loading: false })
    }
  },
  
  getTotal: () => {
    const { items } = get()
    return items.reduce((total, item) => total + (item.price * item.qty), 0)
  },
  
  getItemCount: () => {
    const { items } = get()
    return items.reduce((count, item) => count + item.qty, 0)
  },

  syncCart: (userId: string) => {
    // Stop any existing subscription
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot()
    }

    // Set up real-time listener for cart changes
    const cartRef = doc(db, 'carts', userId)
    
    unsubscribeSnapshot = onSnapshot(
      cartRef, 
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          const currentItems = get().items
          const firestoreItems = data.items || []
          
          // Prevent unnecessary updates if items are the same
          if (JSON.stringify(currentItems) !== JSON.stringify(firestoreItems)) {
            set({ items: firestoreItems, initialized: true })
          } else {
            set({ initialized: true })
          }
        } else {
          // Create initial empty cart document in Firestore
          try {
            await setDoc(cartRef, {
              items: [],
              total: 0,
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString()
            })
          } catch (error) {
            console.error('Error creating cart document:', error)
          }
          set({ items: [], initialized: true })
        }
      }, 
      (error) => {
        console.error('Error syncing cart:', error)
        set({ initialized: true })
      }
    )
  },

  stopSync: () => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot()
      unsubscribeSnapshot = null
    }
    set({ items: [], initialized: false })
  }
}))

// Initialize cart sync on auth state change
let isFirstAuthStateChange = true
onAuthStateChanged(auth, (user) => {
  if (user) {
    useCart.getState().syncCart(user.uid)
  } else if (!isFirstAuthStateChange) {
    // Only stop sync if this isn't the first auth state change
    // This prevents clearing cart during initial page load
    useCart.getState().stopSync()
  }
  
  isFirstAuthStateChange = false
})
