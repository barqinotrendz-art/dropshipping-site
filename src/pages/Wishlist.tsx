import React, { useState } from 'react'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import ProductCard from '../components/ProductCard'
import ProductPreviewModal from '../components/ProductPreviewModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Wishlist: React.FC = () => {
  const { items, clear } = useWishlist()
  const { addItem: addToCart } = useCart()
  const { data: allProducts, isLoading } = useProducts()
  const [previewProduct, setPreviewProduct] = useState<any>(null)

  // Get full product details for wishlist items
  const wishlistProducts = React.useMemo(() => {
    if (!allProducts) return []
    return items
      .map(item => allProducts.find(p => p.id === item.productId))
      .filter(Boolean)
  }, [items, allProducts])

  const handleAddToCart = async (product: any) => {
    const currentPrice = product.discountPrice || product.price
    await addToCart({
      id: product.id,
      name: product.title,
      price: currentPrice,
      image: product.imagePublicIds?.[0],
    })
  }

  const handleClearAll = async () => {
    try {
      await clear()
      toast.success('Products cleared')
    } catch (error) {
      toast.error('Failed to clear')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Saved products</h1>
        {items.length > 0 && (
          <button onClick={handleClearAll} className="text-red-600 hover:text-red-700 text-sm font-medium">
            Clear All
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="xl" text="Loading wishlist..." />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center flex flex-col justify-center items-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className=" mb-4 h-48 w-48">
            <img src="https://cdn-icons-png.flaticon.com/512/3916/3916648.png" alt="icon" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Nothing saved for later</h2>
          <p className="text-gray-600 mb-6">Save your favorite products here!</p>
          <Link to="/" className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">{items.length} {items.length === 1 ? 'item' : 'items'} saved</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            {wishlistProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onPreview={setPreviewProduct}
                layout="carousel"
              />
            ))}
          </div>
        </div>
      )}

      {/* Product Preview Modal */}
      {previewProduct && (
        <ProductPreviewModal
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}

export default Wishlist
