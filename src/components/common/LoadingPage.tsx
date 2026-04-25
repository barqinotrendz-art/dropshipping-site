// import { ShoppingBag } from 'lucide-react'
import extralogocircle from '../../assets/extralogocircle.png'

interface LoadingPageProps {
  message?: string
}

const LoadingPage: React.FC<LoadingPageProps> = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Animated Logo Container */}
        <div className="relative mb-10">
          {/* Outer Glow Effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-black opacity-5 rounded-full blur-2xl animate-pulse"></div>
          </div>
          
          {/* Main Logo Circle */}
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br rounded-full shadow-xl">
            <img src={extralogocircle} alt="logo" className="w-24 h-24 rounded-full" />
          </div>
          
          {/* Spinning Rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 border-3 border-transparent border-t-black border-r-black rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-transparent border-b-gray-300 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            loading
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Preparing your experience...
          </p>
        </div>



        {/* Loading Dots */}
        <div className="flex justify-center items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-gray-800 rounded-full animate-bounce"></div>
          <div className="w-2.5 h-2.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage