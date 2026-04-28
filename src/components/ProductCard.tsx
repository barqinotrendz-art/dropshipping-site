import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Eye, Star, Flame, Heart } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { getCloudinaryUrl } from '../lib/cloudinary'
import Reusablebtn from './Reusablebtn'
import './productcard.css'

interface ProductCardProps {
  product: {
    id: string
    title: string
    slug?: string
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
    brand?: string
    stock?: number
  }
  showBestsellerTag?: boolean
  onAddToCart: (product: any) => void
  onPreview?: (product: any) => void
  layout?: 'grid' | 'carousel' // Different layouts for different pages
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showBestsellerTag,
  onAddToCart,
  onPreview,
  layout = 'grid'
}) => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const { user } = useAuth()
  const { addItem: addToWishlist, items: wishlistItems, remove: removeFromWishlist } = useWishlist()
  const { items: cartItems } = useCart()

  // Enhanced image logic with fallback to color variants
  const getImagePublicId = (index: number = 0): string | null => {
    // First try main product images
    if (product.imagePublicIds?.[index]) {
      return product.imagePublicIds[index]
    }
    
    // Check if colorVariants exist
    if (!product.colorVariants || product.colorVariants.length === 0) {
      return null
    }
    
    // For index 0, try first color variant's first image
    if (index === 0) {
      const firstVariant = product.colorVariants[0]
      if (firstVariant?.images?.[0]) {
        return firstVariant.images[0]
      }
    } 
    // For index 1, try multiple strategies to get a different image
    else if (index === 1) {
      // Strategy 1: Second image from first color variant
      const firstVariant = product.colorVariants[0]
      if (firstVariant?.images?.[1]) {
        return firstVariant.images[1]
      }
      
      // Strategy 2: First image from second color variant
      const secondVariant = product.colorVariants[1]
      if (secondVariant?.images?.[0]) {
        return secondVariant.images[0]
      }
      
      // Strategy 3: Any other image from any variant
      for (let variantIndex = 0; variantIndex < product.colorVariants.length; variantIndex++) {
        const variant = product.colorVariants[variantIndex]
        if (variant?.images && variant.images.length > 1 && variant.images[1]) {
          return variant.images[1]
        }
      }
    }
    
    // Return null if no image found at this index
    return null
  }

  const mainImageId = getImagePublicId(0)
  const secondImageId = getImagePublicId(1)
  
  // Use fallback only for main image, and only use second image if it exists and is different
  const mainImage = mainImageId || 'cld-sample-5'
  const secondImage = secondImageId && secondImageId !== mainImageId ? secondImageId : null
  
  const currentPrice = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price
  const isInCart = cartItems.some(item => item.id === product.id)
  const isInWishlist = wishlistItems.some(item => item.productId === product.id)
  const isOutOfStock = !product.stock || product.stock === 0

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if user is logged in
    if (!user) {
      toast.error('Please login to add items to your wishlist', {
        duration: 3000,
      })
      navigate('/login')
      return
    }

    if (isInWishlist) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist({
        productId: product.id,
        title: product.title,
        imagePublicId: mainImageId || 'cld-sample-5',
        price: currentPrice,
        slug: product.slug
      })
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) {
      toast.error('This product is out of stock')
      return
    }
    onAddToCart(product)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) {
      toast.error('This product is out of stock')
      return
    }
    onAddToCart(product)
    navigate('/cart')
  }

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPreview?.(product)
  }

  return (
    <div
      className="bg-white   shadow-sm  hover:shadow-lg transition-all duration-300 group rounded-xl"
      onMouseEnter={() => secondImage && setIsHovered(true)}
      onMouseLeave={() => secondImage && setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden ">
        <img
          src={getCloudinaryUrl(mainImage, 400, 400)}
          alt={product.title}
          className={`w-full h-full object-cover rounded-tl-xl rounded-tr-xl ${secondImage ? 'transition-all duration-500' : ''} ${
            isHovered && secondImage ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Second Image on Hover */}
        {secondImage && (
          <img
            src={getCloudinaryUrl(secondImage, 400, 400)}
            alt={`${product.title} variant`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
              }`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex flex-col space-y-1">
          {isOutOfStock && (
            <span className="bg-gray-800 text-white text-xs font-extrabold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow-md">
              Out of Stock
            </span>
          )}
          {!isOutOfStock && hasDiscount && (
            <span className="bg-black text-white text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow-md">
              {Math.round((1 - currentPrice / product.price) * 100)}% OFF
            </span>
          )}
          {!isOutOfStock && showBestsellerTag && (
            <span className="bg-black text-white font-extrabold text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center shadow-md">
              <Flame className="w-3 h-3 mr-0.5 sm:mr-1 text-orange-500" />
              Bestseller
            </span>
          )}
        </div>

        {/* Quick Actions - Show on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center rounded-xl">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex space-x-2">
            <button
              onClick={toggleWishlist}
              className={`p-2 sm:p-3 rounded-full shadow-lg transition-colors ${isInWishlist
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white text-gray-700 hover:text-red-500'
                }`}
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleAddToCart}
              className={`p-2 sm:p-3 rounded-full shadow-lg transition-colors ${isInCart
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white text-gray-700 hover:text-red-500 '
                }`}
              title={isInCart ? 'Remove from Cart' : 'Add to Cart'}
            >
              <ShoppingCart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInCart ? 'fill-current' : ''}`} />
            </button>
            {onPreview && (
              <button
                onClick={handlePreview}
                className="p-2 sm:p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="Quick View"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-2 sm:p-4">
        <Link to={`/product/${product.id || product.slug}`} className="block hover:bg-gray-50 rounded-md">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2  
          overflow-hidden group-hover:text-black transition-colors h-[45px] product-title">
            {product.title.slice(0, 70)}{product.title.length > 60 ? '...' : ''}
          </h3>
        

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mb-1 sm:mb-2">{product.brand}</p>
        )}

        {/* Rating */}
        {/* <div className="flex items-center mb-1 sm:mb-2">
          {product.reviewCount && product.reviewCount > 0 ? (
            <>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">
                ({product.reviewCount})
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-sm text-gray-400 ">
              No reviews
            </span>
          )}
        </div> */}

        {/* Price */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 mb-4 overflow-hidden min-h-[40px]">
          <span className="font-semibold text-md text-[#ca5c54]">
            {currentPrice.toFixed(2)} AED 
          </span>

          {hasDiscount ? (
            <span className="text-sm text-gray-500 line-through ">
              {product.price.toFixed(2)} AED 
            </span>
          ) : (
            // Invisible placeholder keeps height same
            <span className="text-sm opacity-0 select-none">No discount</span>
          )}
        </div>
</Link>


        {/* Action Buttons */}
        {layout === 'carousel' ? (
          <div className="flex flex-col space-y-1 sm:space-y-2">
            {/* Primary Actions */}
            <div className="flex gap-1 flex-col lg:flex-row md:flex-row sm:flex-row xl:flex-row "
             onClick={handleAddToCart}
            >
              <Reusablebtn text='Add to Cart' />
              {/* <button
                onClick={handleAddToCart}
                className="flex-1 bg-white text-black py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg border border-black hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                Add to Cart
              </button> */}
            
            </div>
            {/* Buy Now - Secondary Action */}
            <button
              onClick={handleBuyNow}
              className="w-full bg-black text-white py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium text-xs sm:text-sm"
            >
              Buy Now
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-1 sm:space-y-2">
            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white py-1.5 sm:py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
              Add to Cart
            </button>
            
          </div>
        )}
      </div>

    </div>
  )
}

export default ProductCard
