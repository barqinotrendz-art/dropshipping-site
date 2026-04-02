import React, { createContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

export type AppUser = User | null
export type AppRole = 'admin' | 'customer' | null

type UserProfile = {
  displayName?: string
  email?: string
}

type AuthContextType = {
  user: AppUser
  userProfile: UserProfile | null
  role: AppRole
  loading: boolean
  isEmailVerified: boolean
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  role: null,
  loading: true,
  isEmailVerified: true,
  logout: async () => {}
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<AppRole>(null)
  const [loading, setLoading] = useState(true)
  const [isEmailVerified, setIsEmailVerified] = useState(true)

  const logout = async () => {
    try {
      // Clear all user-related localStorage data
      const keysToRemove = [
        'user-preferences',
        'auth-cache',
        'recent-searches',
        'viewed-products',
        'emailForSignIn'
      ]

      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })

      // Clear any other user-related localStorage items dynamically
      const dynamicKeysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.includes('user') ||
          key.includes('auth') ||
          key.includes('cart') ||
          key.includes('wishlist') ||
          key.includes('order') ||
          key.includes('profile') ||
          key.includes('address') ||
          key.includes('payment') ||
          key.includes('checkout')
        )) {
          dynamicKeysToRemove.push(key)
        }
      }
      dynamicKeysToRemove.forEach(key => localStorage.removeItem(key))

      // Clear sessionStorage completely
      sessionStorage.clear()

      // Sign out from Firebase
      await signOut(auth)

      // Reset local state
      setUser(null)
      setUserProfile(null)
      setRole(null)

      // Redirect immediately
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error signing out. Please try again.')

      // Force sign out even if there's an error
      try {
        await signOut(auth)
        setUser(null)
        setUserProfile(null)
        setRole(null)
        window.location.href = '/'
      } catch (fallbackError) {
        console.error('Fallback logout error:', fallbackError)
        window.location.reload()
      }
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          setUser(u)
          // Determine if email is verified:
          // - If provider is password/email, use u.emailVerified
          // - If provider is Google, Facebook, etc., treat as verified
          const providerId = u.providerData[0]?.providerId
          if (providerId === 'password') {
            setIsEmailVerified(!!u.emailVerified)
          } else {
            setIsEmailVerified(true)
          }
          try {
            // Get user data from Firestore
            const snap = await getDoc(doc(db, 'users', u.uid))
            const userData = snap.data() as { role?: AppRole; displayName?: string; email?: string } | undefined
            const userRole: AppRole = (snap.exists() && userData?.role) || 'customer'
            setRole(userRole)
            // Set user profile
            if (snap.exists() && userData) {
              setUserProfile({
                displayName: userData.displayName || u.displayName || u.email?.split("@")[0] || "User",
                email: userData.email || u.email || undefined,
              })
            } else {
              setUserProfile({
                displayName: u.displayName || u.email?.split("@")[0] || "User",
                email: u.email || undefined,
              })
            }
          } catch (firestoreError) {
            console.warn('Failed to fetch user data from Firestore:', firestoreError)
            setRole('customer')
            setUserProfile({
              displayName: u.displayName || u.email?.split("@")[0] || "User",
              email: u.email || undefined,
            })
          }
        } else {
          setUser(null)
          setUserProfile(null)
          setRole(null)
          setIsEmailVerified(true)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setUser(null)
        setUserProfile(null)
        setRole(null)
        setIsEmailVerified(true)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, role, loading, isEmailVerified, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
