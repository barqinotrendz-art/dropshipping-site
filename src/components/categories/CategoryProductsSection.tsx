import React from 'react'
import { Package } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import type { Product } from '../../hooks/useProducts'
import type { Category } from '../../types'
import ProductCard from '../ProductCard'
import { getCloudinaryUrl } from '../../lib/cloudinary'

interface CategoryProductsSectionProps {
  category: Category
  products: Product[]
  isLoading?: boolean
}

const CategoryProductsSection: React.FC<CategoryProductsSectionProps> = ({
  category,
  products,
  isLoading
}) => {
  const { addItem } = useCart()

  // const handleAddToCart = async (product: Product) => {
  //   const currentPrice = product.discountPrice || product.price
  //   await addItem({
  //     id: product.id,
  //     name: product.title,
  //     price: currentPrice,
  //     image: product.imagePublicIds?.[0],
  //   })
  // }
  const handleAddToCart = async (product: Product) => {
    const firstTier = product.pricing?.[0]

    const currentPrice =
      firstTier?.discountPrice ??
      firstTier?.price ??
      product.discountPrice ??
      product.price

    console.log('ADDING TO CART:', {
      title: product.title,
      productPrice: product.price,
      pricing: product.pricing,
      finalPrice: currentPrice
    })

    await addItem({
      id: product.id,
      name: product.title,
      price: Number(currentPrice) || 0,   // 🔥 THIS FIXES 0 ISSUE
      pricing: product.pricing || [],     // 🔥 REQUIRED FOR TIERS
      image: product.imagePublicIds?.[0],
    })
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="aspect-square bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
        <p className="text-gray-600">
          There are no products in the {category.name} category yet.
        </p>
      </div>
    )
  }

  return (
    <div className="py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {category.imagePublicId && (
            <img
              src={getCloudinaryUrl(category.imagePublicId, 100, 100)}
              alt={category.name}
              className="w-20 h-20 rounded-lg object-cover shadow-md"
            />
          )}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h2>
            {category.description && (
              <p className="text-gray-600 mt-1">{category.description}</p>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {products.length} {products.length === 1 ? 'product' : 'products'} available
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            layout="grid"
          />
        ))}
      </div>
    </div>
  )
}

export default CategoryProductsSection
