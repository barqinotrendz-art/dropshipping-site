import React from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface ErrorPageProps {
  title?: string
  message?: string
  showRetry?: boolean
  showGoHome?: boolean
  showGoBack?: boolean
  onRetry?: () => void
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again or contact support if the problem persists.",
  showRetry = true,
  showGoHome = true,
  showGoBack = false,
  onRetry
}) => {
  const navigate = useNavigate()

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8 animate-fadeIn">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6 animate-pulse">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-gray-600 mb-8">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {showRetry && (
              <button
                onClick={handleRetry}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            )}
            
            {showGoBack && (
              <button
                onClick={handleGoBack}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
            )}
            
            {showGoHome && (
              <Link
                to="/"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            )}
          </div>

          {/* Support Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact our{' '}
              <Link to="/contact" className="text-blue-600 hover:underline">
                support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage 
