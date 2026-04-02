import { useState, useRef } from 'react'
import type { FC } from 'react'
import ProductCard from '../ProductCard'

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

interface MobileProductCarouselProps {
  products: Product[]
  showBestsellerTag?: boolean
  onAddToCart: (product: Product) => void
  onPreview?: (product: Product) => void
}

const MobileProductCarousel: FC<MobileProductCarouselProps> = ({
  products,
  showBestsellerTag,
  onAddToCart,
  onPreview
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current || !products) return
    const scrollLeft = scrollRef.current.scrollLeft
    const containerWidth = scrollRef.current.offsetWidth
    const pairIndex = Math.round(scrollLeft / containerWidth)
    setCurrentIndex(pairIndex)
  }

  const totalPages = Math.ceil(products.length / 2)

  const scrollToPage = (pageIndex: number) => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.offsetWidth
      scrollRef.current.scrollTo({
        left: containerWidth * pageIndex,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="w-full">
      {/* Products Carousel - Mobile Optimized (2 cards per view) */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex">
          {/* Group products in pairs */}
          {Array.from({ length: totalPages }).map((_, pageIndex) => {
            const pageProducts = products.slice(pageIndex * 2, pageIndex * 2 + 2)
            const single = pageProducts.length === 1

            return (
              <div
                key={pageIndex}
                className={`flex-shrink-0 w-full flex gap-3 px-2 snap-start ${single ? 'justify-start' : ''}`}
              >
                {pageProducts.map((product) => (
                  <div
                    key={product.id}
                    className={single ? 'w-1/2 min-w-0' : 'flex-1 min-w-0'}
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
            )
          })}
        </div>
      </div>

      {/* Dots Indicator */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToPage(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'bg-black w-6 h-2'
                    : 'bg-gray-300 w-2 h-2'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileProductCarousel
  