import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, loading, isEmailVerified } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!loading && user && !isEmailVerified) {
      toast.error('Please verify your email before accessing the admin area.', {
        duration: 3500,
      })
    } else if (!loading && user && role !== 'admin') {
      toast.error('Access denied. Admin privileges required.', {
        duration: 3000,
      })
    }
  }, [loading, user, role, isEmailVerified])

  // Show loading state while checking authentication
  if (loading) {
    return null
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user && !isEmailVerified) {
    return <Navigate to="/verify?reminder=1" replace />
  }

  // Redirect to home if authenticated but not admin
  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  // User is authenticated and is admin
  return <>{children}</>
}

export default AdminRoute
