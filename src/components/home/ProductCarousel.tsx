import { useState, useRef, useEffect } from 'react'
import type { FC } from 'react'
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import ProductCard from '../ProductCard'
import MobileProductCarousel from './MobileProductCarousel'

interface Product {
  id: string
  title: string
  price: number
  discountPrice?: number
  imagePublicIds?: string[]
  colorVariants?: Array<{
    name: string
    value: string
    images: string[]
    stock: number
  }>
  rating?: number
  reviewCount?: number
  slug?: string
}

interface ProductCarouselProps {
  title: string
  products?: Product[]
  isLoading?: boolean
  error?: string
  showBestsellerTag?: boolean
  onAddToCart: (product: Product) => void
  onPreview?: (product: Product) => void
}

const ProductCarousel: FC<ProductCarouselProps> = ({
  title,
  products,
  isLoading,
  error,
  showBestsellerTag,
  onAddToCart,
  onPreview
}) => {

  const [isMobile, setIsMobile] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ✅ Mobile detect
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ✅ Scroll logic
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const scrollAmount = el.offsetWidth * 0.8

    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  // ✅ Loading UI
  if (isLoading) return (
    <section className="py-12 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  // ✅ Empty state
  if (error || !products || products.length === 0) return (
    <section className="py-12 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">{title}</h2>
        <div className="text-center py-12 bg-white rounded-lg border">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h3>
          <p className="text-gray-500">{error || "Exciting new products are being added."}</p>
        </div>
      </div>
    </section>
  )

  return (
    <section className="py-12 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col items-center justify-center w-full group">
            <h2 className="text-xl md:text-2xl text-center w-1/2 scale-95 hover:scale-105 font-bold duration-500 capitalize text-gray-900">
              {title}
            </h2>
            <div className="border-b-2 border-b-zinc-800 w-28 scale-95 group-hover:scale-110 animate-pulse duration-500"></div>
          </div>

          {products.length > 4 && (
            <div className="hidden sm:flex space-x-2">
              <button onClick={() => scroll('left')} className="p-2 rounded-full border hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scroll('right')} className="p-2 rounded-full border hover:bg-gray-100">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        {isMobile ? (
          <MobileProductCarousel
            products={products}
            showBestsellerTag={showBestsellerTag}
            onAddToCart={onAddToCart}
            onPreview={onPreview}
          />
        ) : (
          <div
            ref={scrollRef}
            className="overflow-x-auto no-scrollbar scroll-smooth"
          >
            <div
              className={`flex gap-6 pb-4 ${products.length <= 3 ? "justify-center" : ""
                }`}
            >
              {products.map(product => (
                <div
                  key={product.id}
                  className="flex-shrink-0
                    w-[80%] sm:w-[45%] md:w-[30%] lg:w-[25%]
                    min-w-[250px]"
                >
                  <ProductCard
                    product={product}
                    showBestsellerTag={showBestsellerTag}
                    onAddToCart={onAddToCart}
                    onPreview={onPreview}
                    layout="carousel"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductCarousel
