import React from 'react'
import { Search, Home, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="animate-fadeIn">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold text-gray-300 mb-4 animate-bounce">
              404
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full animate-pulse">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fadeIn animation-delay-200">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8 animate-fadeIn animation-delay-400">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn animation-delay-600">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>
            <button
              onClick={handleGoBack}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>

          {/* Popular Links */}
          <div className="mt-12 animate-fadeIn animation-delay-800">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Pages
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                All Products
              </Link>
              <Link
                to="/categories"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                Categories
              </Link>
              <Link
                to="/about"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
