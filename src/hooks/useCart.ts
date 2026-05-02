// import { create } from 'zustand'
// import type { CartItem } from '../types'
// import { db, auth } from '../lib/firebase'
// import { doc, setDoc, onSnapshot } from 'firebase/firestore'
// import { onAuthStateChanged } from 'firebase/auth'
// import toast from 'react-hot-toast'

// interface CartState {
//   items: CartItem[]
//   loading: boolean
//   initialized: boolean
//   addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => Promise<void>
//   removeItem: (id: string) => Promise<void>
//   updateQty: (id: string, qty: number) => Promise<void>
//   clear: () => Promise<void>
//   reset: () => Promise<void>
//   getTotal: () => number
//   getItemCount: () => number
//   syncCart: (userId: string) => void
//   stopSync: () => void
// }

// let unsubscribeSnapshot: (() => void) | null = null

// const getItemTotal = (item: any) => {
//   if (!item.pricing || item.pricing.length === 0) {
//     return item.price * item.qty
//   }

//   const tier = item.pricing.find((t: any) => {
//     const label = t.label?.toLowerCase().replace(/\s+/g, '')
//     return label === `buy${item.qty}`
//   })

//   if (tier) {
//     const value = tier.discountPrice ?? tier.price

//     // ✅ IMPORTANT: detect if it's per-unit pricing
//     if (value <= item.price) {
//       return value * item.qty
//     }

//     return value
//   }

//   // fallback → last tier
//   const lastTier = item.pricing[item.pricing.length - 1]
//   const value = lastTier?.discountPrice ?? lastTier?.price

//   if (value && value <= item.price) {
//     return value * item.qty
//   }

//   return value ?? (item.price * item.qty)
// }

// export const useCart = create<CartState>((set, get) => ({
//   items: [],
//   loading: false,
//   initialized: false,

//   addItem: async (item) => {
//     set({ loading: true })
//     try {
//       const { items } = get()
//       const existingItem = items.find(i => i.id === item.id)

//       let newItems: CartItem[]
//       // if (existingItem) {
//       //   // Item exists - remove it (toggle off)
//       //   newItems = items.filter(i => i.id !== item.id)
//       //   toast.success(`Removed from cart`, {

//       //     duration: 1500,
//       //   })
//       // }
//       if (existingItem) {
//         newItems = items.map(i =>
//           i.id === item.id
//             ? { ...i, qty: i.qty + (item.qty || 1) }
//             : i
//         )
//       } else {
//         //  Item doesn't exist - add it (toggle on)
//         newItems = [...items, { ...item, qty: item.qty || 1 }]
//         toast.success(`Added to cart`, {
//           duration: 1500,
//         })
//       }

//       set({ items: newItems })

//       // Save to Firestore if user is authenticated
//       const user = auth.currentUser
//       if (user) {
//         // const total = newItems.reduce((sum, i) => sum + (i.price * i.qty), 0)
//         const total = newItems.reduce((sum, i) => sum + getItemTotal(i), 0)
//         await setDoc(doc(db, 'carts', user.uid), {
//           items: newItems,
//           total: total,
//           updatedAt: new Date().toISOString()
//         })
//       }
//     } catch (error) {
//       console.error('Error toggling cart item:', error)
//       toast.error('Failed to update cart', { duration: 1500 })
//     } finally {
//       set({ loading: false })
//     }
//   },

//   removeItem: async (id) => {
//     set({ loading: true })
//     try {
//       const { items } = get()
//       const newItems = items.filter(item => item.id !== id)

//       set({ items: newItems })

//       // Save to Firestore if user is authenticated
//       const user = auth.currentUser
//       if (user) {
//         // const total = newItems.reduce((sum, i) => sum + (i.price * i.qty), 0)
//         const total = newItems.reduce((sum, i) => sum + getItemTotal(i), 0)
//         await setDoc(doc(db, 'carts', user.uid), {
//           items: newItems,
//           total: total,
//           updatedAt: new Date().toISOString()
//         })
//       }


//     } finally {
//       set({ loading: false })
//     }
//   },

//   updateQty: async (id, qty) => {
//     if (qty <= 0) {
//       await get().removeItem(id)
//       return
//     }

//     set({ loading: true })
//     try {
//       const { items } = get()
//       const newItems = items.map(item => item.id === id ? { ...item, qty } : item)
//       set({ items: newItems })

//       // Save to Firestore if user is authenticated
//       const user = auth.currentUser
//       if (user) {
//         const total = newItems.reduce((sum, i) => sum + getItemTotal(i), 0)
//         await setDoc(doc(db, 'carts', user.uid), {
//           items: newItems,
//           total: total,
//           updatedAt: new Date().toISOString()
//         })
//       }
//     } finally {
//       set({ loading: false })
//     }
//   },

//   clear: async () => {
//     set({ loading: true })
//     try {
//       set({ items: [] })

//       // Clear from Firestore if user is authenticated
//       const user = auth.currentUser
//       if (user) {
//         await setDoc(doc(db, 'carts', user.uid), {
//           items: [],
//           total: 0,
//           updatedAt: new Date().toISOString()
//         })
//       }
//     } finally {
//       set({ loading: false })
//     }
//   },

//   reset: async () => {
//     set({ loading: true })
//     try {
//       set({ items: [] })

//       // Clear from Firestore if user is authenticated
//       const user = auth.currentUser
//       if (user) {
//         await setDoc(doc(db, 'carts', user.uid), {
//           items: [],
//           total: 0,
//           updatedAt: new Date().toISOString()
//         })
//       }
//     } catch (error) {
//       console.error('Error resetting cart:', error)
//     } finally {
//       set({ loading: false })
//     }
//   },

//   // getTotal: () => {
//   //   const { items } = get()
//   //   return items.reduce((total, item) => total + (item.price * item.qty), 0)
//   // },

//   getTotal: () => {
//     const { items } = get()
//     return items.reduce((total, item) => total + getItemTotal(item), 0)
//   },

//   getItemCount: () => {
//     const { items } = get()
//     return items.reduce((count, item) => count + item.qty, 0)
//   },

//   syncCart: (userId: string) => {
//     // Stop any existing subscription
//     if (unsubscribeSnapshot) {
//       unsubscribeSnapshot()
//     }

//     // Set up real-time listener for cart changes
//     const cartRef = doc(db, 'carts', userId)

//     unsubscribeSnapshot = onSnapshot(
//       cartRef,
//       async (snapshot) => {
//         if (snapshot.exists()) {
//           const data = snapshot.data()
//           const currentItems = get().items
//           const firestoreItems = data.items || []

//           // Prevent unnecessary updates if items are the same
//           if (JSON.stringify(currentItems) !== JSON.stringify(firestoreItems)) {
//             set({ items: firestoreItems, initialized: true })
//           } else {
//             set({ initialized: true })
//           }
//         } else {
//           // Create initial empty cart document in Firestore
//           try {
//             await setDoc(cartRef, {
//               items: [],
//               total: 0,
//               updatedAt: new Date().toISOString(),
//               createdAt: new Date().toISOString()
//             })
//           } catch (error) {
//             console.error('Error creating cart document:', error)
//           }
//           set({ items: [], initialized: true })
//         }
//       },
//       (error) => {
//         console.error('Error syncing cart:', error)
//         set({ initialized: true })
//       }
//     )
//   },

//   stopSync: () => {
//     if (unsubscribeSnapshot) {
//       unsubscribeSnapshot()
//       unsubscribeSnapshot = null
//     }
//     set({ items: [], initialized: false })
//   }
// }))

// // Initialize cart sync on auth state change
// let isFirstAuthStateChange = true
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     useCart.getState().syncCart(user.uid)
//   } else if (!isFirstAuthStateChange) {
//     // Only stop sync if this isn't the first auth state change
//     // This prevents clearing cart during initial page load
//     useCart.getState().stopSync()
//   }

//   isFirstAuthStateChange = false
// })

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
  getItemTotal: (item: CartItem) => number

  syncCart: (userId: string) => void
  stopSync: () => void
}

let unsubscribeSnapshot: (() => void) | null = null

// ✅ MAIN PRICE CALCULATOR (FIXED)
const calculateItemTotal = (item: CartItem) => {
  const basePrice = Number(item.price) || 0

  if (!item.pricing || item.pricing.length === 0) {
    return basePrice * item.qty
  }

  const tiers = item.pricing
    .map((t: any) => ({
      qty: parseInt(t.label.match(/\d+/)?.[0] || '0', 10),
      price: Number(t.discountPrice ?? t.price) || 0
    }))
    .filter((t: any) => t.qty > 0)
    .sort((a: any, b: any) => b.qty - a.qty) // DESC

  let remaining = item.qty
  let total = 0

  for (const tier of tiers) {
    if (remaining >= tier.qty) {
      const count = Math.floor(remaining / tier.qty)
      total += count * tier.price
      remaining -= count * tier.qty
    }
  }

  if (remaining > 0) {
    total += remaining * basePrice
  }

  return total
}

// ✅ CART TOTAL
const calculateCartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + calculateItemTotal(i), 0)

export const useCart = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  initialized: false,

  // ✅ EXPOSE TO UI
  getItemTotal: (item) => calculateItemTotal(item),

  addItem: async (item) => {
    set({ loading: true })
    try {
      const { items } = get()
      const existing = items.find(i => i.id === item.id)

      let newItems: CartItem[]

      if (existing) {
        newItems = items.map(i =>
          i.id === item.id
            ? { ...i, qty: i.qty + (item.qty || 1) }
            : i
        )
      } else {
        newItems = [...items, { ...item, qty: item.qty || 1 }]
        toast.success('Added to cart', { duration: 1500 })
      }

      set({ items: newItems })

      const user = auth.currentUser
      if (user) {
        await setDoc(doc(db, 'carts', user.uid), {
          items: newItems,
          total: calculateCartTotal(newItems),
          updatedAt: new Date().toISOString()
        })
      }
    } catch (e) {
      console.error(e)
      toast.error('Cart error')
    } finally {
      set({ loading: false })
    }
  },

  removeItem: async (id) => {
    set({ loading: true })
    try {
      const newItems = get().items.filter(i => i.id !== id)
      set({ items: newItems })

      const user = auth.currentUser
      if (user) {
        await setDoc(doc(db, 'carts', user.uid), {
          items: newItems,
          total: calculateCartTotal(newItems),
          updatedAt: new Date().toISOString()
        })
      }
    } finally {
      set({ loading: false })
    }
  },

  updateQty: async (id, qty) => {
    if (qty <= 0) return get().removeItem(id)

    set({ loading: true })
    try {
      const newItems = get().items.map(i =>
        i.id === id ? { ...i, qty } : i
      )

      set({ items: newItems })

      const user = auth.currentUser
      if (user) {
        await setDoc(doc(db, 'carts', user.uid), {
          items: newItems,
          total: calculateCartTotal(newItems),
          updatedAt: new Date().toISOString()
        })
      }
    } finally {
      set({ loading: false })
    }
  },

  clear: async () => {
    set({ loading: true })
    try {
      set({ items: [] })

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
    await get().clear()
  },

  // ✅ TOTALS
  getTotal: () => {
    return calculateCartTotal(get().items)
  },

  getItemCount: () => {
    return get().items.reduce((c, i) => c + i.qty, 0)
  },

  // ✅ FIREBASE SYNC
  syncCart: (userId) => {
    if (unsubscribeSnapshot) unsubscribeSnapshot()

    const ref = doc(db, 'carts', userId)

    unsubscribeSnapshot = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        set({ items: snap.data().items || [], initialized: true })
      } else {
        await setDoc(ref, {
          items: [],
          total: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        set({ items: [], initialized: true })
      }
    })
  },

  stopSync: () => {
    if (unsubscribeSnapshot) unsubscribeSnapshot()
    unsubscribeSnapshot = null
    set({ items: [], initialized: false })
  }
}))

// ✅ AUTH LISTENER
let first = true

onAuthStateChanged(auth, (user) => {
  if (user) {
    useCart.getState().syncCart(user.uid)
  } else if (!first) {
    useCart.getState().stopSync()
  }
  first = false
})