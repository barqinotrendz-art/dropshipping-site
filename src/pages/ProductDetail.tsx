import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
import { addBusinessDays, formatDate } from '../utils/delivery'
import { CircleSmall } from 'lucide-react'
import { type PriceTier } from '../types/index'
import { generateCartId } from '../types/index'

const ProductDetail: React.FC = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading } = useProductBySlug(slug)
  const { addItem } = useCart()
  const { user } = useAuth()
  const { addItem: addToWishlist, items: wishlistItems, remove: removeFromWishlist } = useWishlist()
  const [showReviewForm, setShowReviewForm] = React.useState(false)
  const [selectedColor, setSelectedColor] = React.useState<ColorVariant | null>(null)
  const [quantity, setQuantity] = React.useState(1)
  const activeTier = product?.pricing?.[quantity - 1]

  React.useEffect(() => {
    if (product?.pricing?.length) {
      setQuantity(1) // default to Buy 1
    }
  }, [product])

  console.log("Desc", product?.pricing)

  const today = new Date()

  // UAE delivery estimate: 1 to 3 business days
  const minDeliveryDate = addBusinessDays(today, 1)
  const maxDeliveryDate = addBusinessDays(today, 3)

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
    product.price ??
    0

  const hasDiscount = currentPrice < originalPrice


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

    const cartId = generateCartId(
      product.id,
      product.colorVariants?.[0]?.name
    )
    await addItem({
      id: cartId,
      productId: product.id,
      name: `${product.title}${selectedColor ? ` - ${selectedColor.name}` : ''}`,
      // price: currentPrice,
      price: activeTier?.discountPrice ?? activeTier?.price,
      pricing: product.pricing ?? [],   // ✅ ADD THIS
      // qty: 1,
      qty: quantity,
      image: cartImage,
      maxQty: availableStock,
      tierLabel: activeTier?.label,
      replaceQty: true,
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
          <span className="bg-[#c03e35] text-white px-3 py-1 rounded-2xl md:text-sm text-[12px]  font-medium">
            -{Math.round((1 - currentPrice / originalPrice) * 100)}%
          </span>
          <div>
            <h1 className="md:text-3xl text-2xl font-semibold">{product.title}</h1>
            {/* {product.brand && (
              <p className="text-lg text-gray-600 mt-1">{product.brand}</p>
            )} */}
          </div>
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-[18px] ${star <= (product.rating ?? 0) ? 'text-[#ff9c05]' : 'text-gray-300'} `}
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

          <div className="flex items-center md:gap-3 gap-2">
            <span className="lg:text-2xl md:text-[18px] text-[16px] text-[#c03e35] font-bold">{currentPrice.toFixed(2)} AED</span>
            {/* {hasDiscount && (
              <>
                <span className="text-lg text-gray-500 line-through">AED {currentPrice.toFixed(2)}</span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                  {Math.round((1 - currentPrice / product.price) * 100)}% OFF
                </span>
              </>
            )} */}
            {hasDiscount && (
              <>
                <span className="lg:text-lg md:text-[16px] text-[14px] font-semibold text-gray-500 line-through">
                  {originalPrice.toFixed(2)} AED
                </span>

                <span className="text-[#c03e35] px-2 py-1 rounded lg:text-lg md:text-[16px] text-[14px]  font-semibold">
                  Save {(Math.round((originalPrice - currentPrice) * 100) / 100).toFixed(2)} AED
                </span>
              </>
            )}
          </div>
          <div>
            <p className='text-gray-800 text-[14px]'>
              Free <Link to={'/shipping'} className='underline font-medium'>shipping</Link> across UAE
            </p>
          </div>
          {/* Esyimated delivery time  */}


          <div className='border border-gray-100 rounded w-full max-w-lg'>
            <p className='text-gray-700 py-3 ps-2'>
              <span className='font-semibold text-black'>
                {formatDate(minDeliveryDate)} to {formatDate(maxDeliveryDate)}
              </span>{' '}
              Estimated Delivery
            </p>
          </div>

          {/* inStock & ready to ship  */}

          <div className="flex items-center gap-3 ps-1.5">
            <span className="relative flex h-3 w-3">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75"></span>

              <span className="relative inline-flex h-3 w-3 items-center justify-center rounded-full bg-[#14854e]">

                <span className="h-1.5 w-1.5 rounded-full bg-white"></span>

              </span>
            </span>

            <span className="text-[16px] font-medium text-green-700 mb-[2px]">
              In Stock and ready to ship
            </span>
          </div>

          {/* Hurry up Emergency text */}

          {/* <div>
            <p className='text-medium font-medium text-gray-600'>
              Hurry up! Only 2 items left in stock
            </p>
          </div> */}

          <div className="w-full max-w-lg">

            <p className="mb-3 text-md font-medium text-gray-600">
              Hurry up! Only 2 items left in stock
            </p>

            <div className="h-[5px] w-full rounded-full bg-gray-200">
              <div className="h-[5px] w-[97%] rounded-full bg-[#c03e35]"></div>
            </div>

          </div>

          {/* Limited offer tag & save more */}

          <div className='max-w-lg border border-dashed rounded-xl
           border-[#14854e] flex flex-col justify-center items-center gap-2.5 bg-[#f6faf8] mt-[22px]'>

            <div className='pt-3.5'>
              <h3 className='text-[#14854e] md:text-lg text-[16px] font-medium'>
                🔥 Limited Time Offer
              </h3>
            </div>

            <div className='pb-3.5'>
              <p className='md:text-[16px] text-[14px] text-[#14854e] font-medium'>
                Hurry up and place your order now!
              </p>
            </div>

          </div>

          <div className="max-w-lg relative py-3">

            {/* Line */}
            <div className="absolute top-1/2 left-0 w-full border-t border border-[#bbc7c5]"></div>

            {/* Center Text */}
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm font-medium text-gray-500">
                Save More !
              </span>
            </div>

          </div>

          {/* Tier Pricing  */}

          <div className="space-y-3 max-w-lg">
            {product && product.pricing?.map((item: PriceTier, i: number) => {

              const isActive = quantity === i + 1

              return (
                <div
                  key={i}
                  onClick={() => setQuantity(i + 1)}
                  className={`border-2 rounded-xl p-4 flex justify-between items-center`}
                >
                  <div>
                    <div className='flex items-center gap-4 justify-center'>
                      {isActive ? 'yes' : 'no'}
                      <CircleSmall />
                      <div>
                        <h4 className="font-semibold">
                          {item.label}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Best for family pack
                        </p>

                      </div>

                    </div>



                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-[#c03e35]">
                      {/* {tier.discountPrice} AED */}
                    </p>

                    <p className="text-sm line-through text-gray-400">
                      {/* {tier.price} AED */}
                    </p>
                  </div>
                </div>
              )
            }
            )}
          </div>
          <button
            onClick={onAddToCart}
            className="w-full mt-4 px-4 py-3 rounded bg-black text-white font-medium"
          >
            Add to Cart — {activeTier?.label} • {activeTier?.discountPrice ?? activeTier?.price} AED
          </button>



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
