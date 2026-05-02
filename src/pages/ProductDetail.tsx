import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProductBySlug } from '../hooks/useProductBySlug'
import ProductGallery from '../components/ProductGallery'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../hooks/useAuth'
import ReviewsList from '../components/ReviewsList'
import ReviewForm from '../components/ReviewForm'
import ProductRecommendations from '../components/ProductRecommendations'
import ColorSelector from '../components/ColorSelector'
import { type ColorVariant } from '../types'
import toast from 'react-hot-toast'
import ErrorPage from '../components/common/ErrorPage'
import LoadingPage from '../components/common/LoadingPage'

const ProductDetail: React.FC = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading } = useProductBySlug(slug)
  const { addItem } = useCart()
  const { user } = useAuth()
  const { addItem: addToWishlist, items: wishlistItems, remove: removeFromWishlist } = useWishlist()
  const [showReviewForm, setShowReviewForm] = React.useState(false)
  const [selectedColor, setSelectedColor] = React.useState<ColorVariant | null>(null)

  // Handle color variants - must be defined before early returns
  const colorVariants: ColorVariant[] = product?.colorVariants || []

  // Set default selected color on first load
  React.useEffect(() => {
    if (product && colorVariants.length > 0 && !selectedColor) {
      const firstAvailableColor = colorVariants.find(variant => variant.stock > 0) || colorVariants[0]
      setSelectedColor(firstAvailableColor)
    }
  }, [product, colorVariants, selectedColor])

  // Early returns AFTER all hooks
  if (isLoading) return <LoadingPage message="Loading product details..." />

  if (!product) {
    return (
      <ErrorPage
        title="Product Not Found"
        message="The product you're looking for doesn't exist or has been removed from our catalog."
        showRetry={false}
        showGoHome={true}
        showGoBack={true}
      />
    )
  }

  // Enhanced image logic with fallback to color variants (same as ProductCard)
  const getAllProductImages = () => {
    const allImages: string[] = []

    // First, add main product images (default images)
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

  const publicIds = getAllProductImages()

  // const currentPrice = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price
  const isInWishlist = wishlistItems.some(item => item.productId === product.id)

  const firstTier = product.pricing?.[0]

  const currentPrice =
    firstTier?.discountPrice ??
    firstTier?.price ??
    product.discountPrice ??
    product.price ??
    0

  const onAddToCart = async () => {
    // Check if color is selected and in stock
    if (colorVariants.length > 0) {
      if (!selectedColor) {
        toast.error('Please select a color')
        return
      }
      if (selectedColor.stock === 0) {
        toast.error(`${selectedColor.name} is out of stock`)
        return
      }
    }

    // Check general stock
    const availableStock = selectedColor ? selectedColor.stock : product.stock ?? 0
    if (availableStock === 0) {
      toast.error('This product is out of stock')
      return
    }

    // Use selected color's first image if available, otherwise use first available image
    const cartImage = selectedColor && selectedColor.images.length > 0
      ? selectedColor.images[0]
      : publicIds[0] !== 'cld-sample-5' ? publicIds[0] : 'cld-sample-5'

    await addItem({
      id: product.id,
      name: `${product.title}${selectedColor ? ` - ${selectedColor.name}` : ''}`,
      price: currentPrice,
        pricing: product.pricing ?? [],   // ✅ ADD THIS
      qty: 1,
      image: cartImage,
      maxQty: availableStock,
    })
  }

  const onBuyNow = () => {
    onAddToCart()
    navigate('/checkout')
  }

  const toggleWishlist = async () => {
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
      // Use selected color's first image if available, otherwise use main product image
      const wishlistImage = selectedColor && selectedColor.images.length > 0
        ? selectedColor.images[0]
        : publicIds[0]

      await addToWishlist({
        productId: product.id,
        title: product.title,
        imagePublicId: wishlistImage,
        price: currentPrice,
        slug: product.slug
      })
      toast.success('Item saved for later')
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ProductGallery
            publicIds={publicIds}
            colorVariants={colorVariants}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
        </div>
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-semibold">{product.title}</h1>
            {product.brand && (
              <p className="text-lg text-gray-600 mt-1">{product.brand}4</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">Rs {currentPrice.toFixed(2)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-500 line-through">Rs {product.price.toFixed(2)}</span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                  {Math.round((1 - currentPrice / product.price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= product.rating! ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}

          {/* Color Selector */}
          {colorVariants.length > 0 && (
            <ColorSelector
              variants={colorVariants}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              className="py-2"
            />
          )}

          {product.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <div>SKU: {product.sku || 'N/A'}</div>
            <div>
              Stock: {selectedColor ? selectedColor.stock : product.stock ?? 0} units available
              {selectedColor && selectedColor.stock === 0 && (
                <span className="text-red-600 ml-2">• Out of stock</span>
              )}
            </div>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {(() => {
              const availableStock = product.stock ?? 0
              const isOutOfStock = availableStock === 0
              const needsColorSelection = colorVariants.length > 0 && !selectedColor

              return (
                <>
                  <button
                    className={`flex-1 px-4 py-3 rounded font-medium transition-colors ${isOutOfStock || needsColorSelection
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    onClick={onAddToCart}
                    disabled={isOutOfStock || needsColorSelection}
                  >
                    {isOutOfStock ? 'Out of Stock' : needsColorSelection ? 'Select Color' : 'Add to Cart'}
                  </button>
                  <button
                    className={`flex-1 px-4 py-3 rounded font-medium border-2 transition-colors ${isOutOfStock || needsColorSelection
                      ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                      : 'border-black text-black hover:bg-black hover:text-white'
                      }`}
                    onClick={onBuyNow}
                    disabled={isOutOfStock || needsColorSelection}
                  >
                    {isOutOfStock ? 'Out of Stock' : needsColorSelection ? 'Select Color' : 'Buy Now'}
                  </button>
                </>
              )
            })()}
            <button
              className={`px-4 py-3 border rounded ${isInWishlist ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-300'}`}
              onClick={toggleWishlist}
            >
              {isInWishlist ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </div>

      {/* Customer reviews (bottom) - only reviews shown before recommendations */}
      <div className="border-t pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-black text-white rounded text-sm"
          >
            {showReviewForm ? 'Cancel' : 'Write Review'}
          </button>
        </div>

        {showReviewForm && (
          <div className="bg-gray-50 p-4 rounded mb-4">
            <ReviewForm
              productId={product.id}
              onSuccess={() => setShowReviewForm(false)}
            />
          </div>
        )}

        <ReviewsList productId={product.id} />
      </div>

      {/* Product Recommendations */}
      <div className="border-t pt-8">
        <ProductRecommendations
          productId={product.id}
          categoryId={product.categoryId || ''}
          brand={product.brand}
        />
      </div>
    </div>
  )
}

export default ProductDetail
