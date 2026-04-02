import React from 'react'
import { Link } from 'react-router-dom'
import { useRecommendations, type RecommendedProduct } from '../hooks/useRecommendations'
import { cld } from '../lib/cloudinary'
import { AdvancedImage } from '@cloudinary/react'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'

type Props = {
  productId: string
  categoryId: string
  brand?: string
}

const ProductRecommendations: React.FC<Props> = ({ productId, categoryId, brand }) => {
  const { data: recommendations, isLoading } = useRecommendations(productId, categoryId, brand)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">You May Also Like</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">You May Also Like</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <RecommendationCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

const RecommendationCard: React.FC<{ product: RecommendedProduct }> = ({ product }) => {
  const mainImage = product.imagePublicIds?.[0] || 'cld-sample-5'
  const img = cld.image(mainImage)
    .format('auto').quality('auto')
    .resize(fill().width(250).height(250).gravity(autoGravity()))

  const currentPrice = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  return (
    <Link 
      to={`/product/${product.slug}`}
      className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square overflow-hidden">
        <AdvancedImage 
          cldImg={img} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm mb-1 line-clamp-2">{product.title}</h4>
        {product.brand && (
          <p className="text-xs text-gray-600 mb-1">{product.brand}</p>
        )}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">Rs {currentPrice.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-500 line-through">Rs {product.price.toFixed(2)}</span>
          )}
        </div>
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-yellow-400">★</span>
            <span>{product.rating.toFixed(1)}</span>
            {product.reviewCount && (
              <span className="text-gray-500">({product.reviewCount})</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default ProductRecommendations
