import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isEmailVerified } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!loading && user && !isEmailVerified) {
      toast.error('Please verify your email before accessing this page.', {
        duration: 3500,
      })
    }
  }, [loading, user, isEmailVerified])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user && !isEmailVerified) {
    return <Navigate to="/verify?reminder=1" replace />
  }

  // User is authenticated
  return <>{children}</>
}

export default ProtectedRoute
