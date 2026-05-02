import React, { useState } from 'react'
import { X, ShoppingCart, Star, Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../hooks/useAuth'
import Button from './ui/Button'
import toast from 'react-hot-toast'
import { getCloudinaryUrl } from '../lib/cloudinary'

type PriceTier = {
  label: string
  price: number
  discountPrice?: number
}

interface Product {
  id: string
  title: string
  price: number
  discountPrice?: number
  imagePublicIds?: string[]
  rating?: number
  reviewCount?: number
  slug?: string
  description?: string
  brand?: string
  stock?: number
  colorVariants?: Array<{
    name: string
    value: string
    images: string[]
    stock: number
  }>
  pricing?: PriceTier[]
}

interface ProductPreviewModalProps {
  product: Product
  onClose: () => void
  onAddToCart: (product: Product) => void
}

const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem: addToWishlist, items: wishlistItems, remove: removeFromWishlist } = useWishlist()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<number>(0)

  // Enhanced image logic with fallback to color variants (same as ProductCard)
  const getAllImages = (): string[] => {
    const allImages: string[] = []

    // First, add main product images
    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      allImages.push(...product.imagePublicIds)
    }

    // Then, add images from color variants
    if (product.colorVariants && product.colorVariants.length > 0) {
      product.colorVariants.forEach(variant => {
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach(image => {
            // Only add if not already in the array
            if (!allImages.includes(image)) {
              allImages.push(image)
            }
          })
        }
      })
    }

    // If no images found, return fallback
    return allImages.length > 0 ? allImages : ['cld-sample-5']
  }

  const images = getAllImages()
  // const currentPrice = product.discountPrice || product.price
  // const hasDiscount = product.discountPrice && product.discountPrice < product.price
  const isInWishlist = wishlistItems.some(item => item.productId === product.id)

  const firstTier = product.pricing?.[0]

  const currentPrice =
    firstTier?.discountPrice ??
    firstTier?.price ??
    product.discountPrice ??
    product.price ??
    0

  const originalPrice =
    firstTier?.price ??
    product.price

  const hasDiscount =
    firstTier?.discountPrice != null
      ? firstTier.discountPrice < firstTier.price
      : product.discountPrice != null &&
      product.discountPrice < product.price

  const handleBuyNow = () => {
    onAddToCart(product)
    onClose()
    navigate('/checkout')
  }

  const toggleWishlist = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to add items to your wishlist', {
        duration: 3000,
      })
      onClose()
      navigate('/login')
      return
    }

    if (isInWishlist) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist({
        productId: product.id,
        title: product.title,
        imagePublicId: images[0],
        price: currentPrice,
        slug: product.slug
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">Quick View</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={getCloudinaryUrl(images[selectedImageIndex], 600, 600)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {hasDiscount && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-lg shadow-lg">
                    {Math.round((1 - currentPrice / originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                        ? 'border-black shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                      <img
                        src={getCloudinaryUrl(img, 100, 100)}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                {product.brand && (
                  <p className="text-gray-600">{product.brand}</p>
                )}
              </div>

              {/* Rating */}
              <div className='w-[100%] '>

                {product.rating != null && product.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(product.rating!)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
                    </span>
                  </div>



                )}
              </div>

              {/* Price */}
              {/* <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  Rs {currentPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      Rs {product.price.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                      Save Rs {(product.price - currentPrice).toFixed(2)}
                    </span>
                  </>
                )}
              </div> */}

              <span className="text-xl font-semibold text-[#c03e35] me-2">
                Rs {currentPrice.toFixed(2)}
              </span>

              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    AED {originalPrice.toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium ms-2">
                    Save AED {(originalPrice - currentPrice).toFixed(2)}
                  </span>
                </>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Availability:</span>
                {product.stock && product.stock > 0 ? (
                  <span className="text-sm font-medium text-green-600">
                    In Stock ({product.stock} units)
                  </span>
                ) : (
                  <span className="text-sm font-medium text-red-600">Out of Stock</span>
                )}
              </div>

              {/* Color Variants */}
              {product.colorVariants && product.colorVariants.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Color: {product.colorVariants[selectedColor]?.name}
                  </h3>
                  <div className="flex gap-2">
                    {product.colorVariants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(index)}
                        className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all ${selectedColor === index
                          ? 'border-black shadow-md scale-110'
                          : 'border-gray-200 hover:border-gray-400'
                          }`}
                      >
                        <img
                          src={getCloudinaryUrl(variant.images[0], 50, 50)}
                          alt={variant.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      onAddToCart(product)
                      onClose()
                    }}
                    variant="secondary"
                    className="flex-1"
                    icon={<ShoppingCart className="w-5 h-5" />}
                    disabled={!product.stock || product.stock === 0}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="primary"
                    className="flex-1"
                    disabled={!product.stock || product.stock === 0}
                  >
                    Buy Now
                  </Button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={toggleWishlist}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${isInWishlist
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                    {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                  </button>
                  <Link
                    to={`/product/${product.slug || product.id}`}
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPreviewModal
