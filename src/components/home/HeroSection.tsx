import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCloudinaryUrl } from '../../lib/cloudinary'

interface Banner {
  id: string
  title?: string
  subtitle?: string
  publicId: string
  mobilePublicId?: string
  ctaText?: string
  ctaLink?: string
}

interface HeroSectionProps {
  banners?: Banner[]
  isLoading?: boolean
  error?: string
}

const HeroSection: FC<HeroSectionProps> = ({ banners, isLoading, error }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Auto-slide logic (no hover pause)
  useEffect(() => {
    if (!banners || banners.length <= 1) return
    
    let interval: ReturnType<typeof setInterval>
    
    // Wait for first animation to complete before starting auto-slide
    const firstTimeout = setTimeout(() => {
      // First slide change after animation completes
      setCurrentSlide((prev) => (prev + 1) % banners.length)
      
      // Then start regular intervals
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
      }, 8000)
    }, 8000)
    
    return () => {
      clearTimeout(firstTimeout)
      if (interval) clearInterval(interval)
    }
  }, [banners])

 useEffect(() => {
    // Reset animation: start zoomed in, then zoom out
    setAnimate(false)
    const timeout = setTimeout(() => setAnimate(true), 300)
    return () => clearTimeout(timeout)
  }, [currentSlide])



  const nextSlide = () => {
    if (banners && banners.length > 1 && !isTransitioning) {
      setIsTransitioning(true)
      // Add fade out effect
      setAnimate(false)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
        setTimeout(() => setIsTransitioning(false), 300)
      }, 200)
    }
  }

  const prevSlide = () => {
    if (banners && banners.length > 1 && !isTransitioning) {
      setIsTransitioning(true)
      // Add fade out effect
      setAnimate(false)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
        setTimeout(() => setIsTransitioning(false), 300)
      }, 200)
    }
  }

  if (isLoading) {
    return (
      <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading banners...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error || !banners || banners.length === 0) {
    return (
      <section className="relative h-[70vh] md:h-[85vh] lg:h-screen w-full bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl mx-auto">
          <div className="mb-8">
            <ShoppingBag className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 opacity-60" />
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fadeIn">
              Coming Soon
            </h1>
            <p className="text-xl md:text-3xl lg:text-4xl opacity-90 mb-10 animate-fadeIn animation-delay-200 leading-relaxed">
              {error ? 'Unable to load banners at the moment' : 'Exciting new banners are being prepared for you!'}
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center px-10 py-5 md:px-12 md:py-6 bg-white text-black font-bold text-lg md:text-xl rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 animate-fadeIn animation-delay-400 shadow-2xl"
          >
            <ShoppingBag className="w-6 h-6 md:w-7 md:h-7 mr-3" />
            Explore Products
          </Link>
        </div>
      </section>
    )
  }

  const currentBanner = banners[currentSlide]

  return (
    <section className="relative h-[70vh] md:h-[85vh] lg:h-screen w-full overflow-hidden group">
      {/* Clickable Banner Wrapper */}
      {currentBanner.ctaLink ? (
        <Link
          to={currentBanner.ctaLink}
          className="absolute inset-0 z-0 cursor-pointer block"
        >
          {/* Banner Image */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
            <picture key={currentBanner.id}>
              {/* Mobile Image (up to 768px) */}
              {currentBanner.mobilePublicId && (
                <source
                  media="(max-width: 768px)"
                  srcSet={`
                    ${getCloudinaryUrl(currentBanner.mobilePublicId, 400, 400)} 400w,
                    ${getCloudinaryUrl(currentBanner.mobilePublicId, 600, 600)} 600w,
                    ${getCloudinaryUrl(currentBanner.mobilePublicId, 800, 800)} 800w
                  `}
                  sizes="100vw"
                />
              )}
              
              {/* Desktop Image (769px and up) */}
              <source
                media="(min-width: 769px)"
                srcSet={`
                  ${getCloudinaryUrl(currentBanner.publicId, 1280, 585)} 1280w,
                  ${getCloudinaryUrl(currentBanner.publicId, 1536, 702)} 1536w,
                  ${getCloudinaryUrl(currentBanner.publicId, 1920, 880)} 1920w
                `}
                sizes="100vw"
              />
              
              {/* Fallback Image */}
              <img
                src={getCloudinaryUrl(currentBanner.publicId, 1920, 880)}
                alt={currentBanner.title || 'Banner'}
                className={`w-full h-full object-cover transition-all duration-[5000ms] ease-out ${
                  animate ? 'scale-100' : 'scale-110'
                } ${isTransitioning ? 'scale-105 opacity-70' : ''}`}
              />
            </picture>

            {/* Overlay Gradient */}
            {(currentBanner.title || currentBanner.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            )}
          </div>

          {/* Content Overlay */}
          {(currentBanner.title || currentBanner.subtitle) && (
            <div className="relative z-10 h-full flex items-end pb-20 md:pb-24 lg:pb-32">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl animate-fadeInUp">
                  {currentBanner.title && (
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl  font-bold capitalize text-white drop-shadow-lg mb-6">
                      {currentBanner.title}
                    </h1>
                  )}
                  {currentBanner.subtitle && (
                    <p className="text-base md:text-xl  lg:text-2xl text-gray-200 leading-relaxed mb-8">
                      {currentBanner.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Link>
      ) : (
        <>
          {/* Banner Image */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
            <picture key={currentBanner.id}>
              {/* Mobile Image (up to 768px) */}
              {currentBanner.mobilePublicId && (
                <source
                  media="(max-width: 768px)"
                  srcSet={`
                    ${getCloudinaryUrl(currentBanner.mobilePublicId, 400, 400)} 400w,
                    ${getCloudinaryUrl(currentBanner.mobilePublicId, 600, 600)} 600w,
                    ${getCloudinaryUrl(currentBanner.mobilePublicId, 800, 800)} 800w
                  `}
                  sizes="100vw"
                />
              )}
              
              {/* Desktop Image (769px and up) */}
              <source
                media="(min-width: 769px)"
                srcSet={`
                  ${getCloudinaryUrl(currentBanner.publicId, 1280, 585)} 1280w,
                  ${getCloudinaryUrl(currentBanner.publicId, 1536, 702)} 1536w,
                  ${getCloudinaryUrl(currentBanner.publicId, 1920, 880)} 1920w
                `}
                sizes="100vw"
              />
              
              {/* Fallback Image */}
              <img
                src={getCloudinaryUrl(currentBanner.publicId, 1920, 880)}
                alt={currentBanner.title || 'Banner'}
                className={`w-full h-full object-cover transition-all duration-[5000ms] ease-out ${
                  animate ? 'scale-100' : 'scale-110'
                } ${isTransitioning ? 'scale-105 opacity-70' : ''}`}
              />
            </picture>

            {/* Overlay Gradient */}
            {(currentBanner.title || currentBanner.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            )}
          </div>

          {/* Content Overlay */}
          {(currentBanner.title || currentBanner.subtitle) && (
            <div className="relative z-10 h-full flex items-end pb-20 md:pb-24 lg:pb-32">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl animate-fadeInUp">
                  {currentBanner.title && (
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white drop-shadow-lg mb-6">
                      {currentBanner.title}
                    </h1>
                  )}
                  {currentBanner.subtitle && (
                    <p className="text-base md:text-xl lg:text-2xl text-gray-200 leading-relaxed mb-8">
                      {currentBanner.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Navigation Arrows */}
      {banners && banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-20 p-2 md:p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 z-20 p-2 md:p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners && banners.length > 1 && (
        <div className="absolute bottom-6 md:bottom-1 left-1/2 transform -translate-x-1/2 z-20 flex space-x-4">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isTransitioning && index !== currentSlide) {
                  setIsTransitioning(true)
                  setAnimate(false)
                  setTimeout(() => {
                    setCurrentSlide(index)
                    setTimeout(() => setIsTransitioning(false), 300)
                  }, 200)
                }
              }}
              className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-slate-200 scale-125 shadow-md'
                  : 'bg-slate-200/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default HeroSection
