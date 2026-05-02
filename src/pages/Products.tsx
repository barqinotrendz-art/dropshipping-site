import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useCart } from '../hooks/useCart'
import { ShoppingCart, Filter, X } from 'lucide-react'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ProductCard from '../components/ProductCard'
import ProductPreviewModal from '../components/ProductPreviewModal'

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  
  const { data: products, isLoading: productsLoading } = useProducts()
  const { data: categories } = useCategories()
  const { addItem } = useCart()

  // Calculate max price from all products
  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 100000
    const prices = products.map(p => p.discountPrice || p.price)
    return Math.ceil(Math.max(...prices) / 1000) * 1000 // Round up to nearest 1000
  }, [products])

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('featured')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice])
  const [showFilters, setShowFilters] = useState(false)
  const [previewProduct, setPreviewProduct] = useState<any>(null)

  // Update price range when maxPrice changes
  React.useEffect(() => {
    setPriceRange([0, maxPrice])
  }, [maxPrice])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return []

    // Show all active products (including out of stock)
    let filtered = products.filter(p => p.active !== false)

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryId === selectedCategory)
    }

    // Price range filter
    filtered = filtered.filter(p => {
      const price = p.discountPrice || p.price
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price))
        break
      case 'price-high':
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price))
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
        filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        break
      default: // featured
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
    }

    return filtered
  }, [products, searchQuery, selectedCategory, sortBy, priceRange])

  // Debug logs removed for production

  // const handleAddToCart = async (product: any) => {
  //   const currentPrice = product.discountPrice || product.price
  //   await addItem({
  //     id: product.id,
  //     name: product.title,
  //     price: currentPrice,
  //     image: product.imagePublicIds?.[0],
  //   })
  // }

  const handleAddToCart = async (product: any) => {
  const firstTier = product.pricing?.[0]

  const currentPrice =
    firstTier?.discountPrice ??
    firstTier?.price ??
    product.discountPrice ??
    product.price ??
    0

  console.log('ALL PRODUCTS ADD:', {
    title: product.title,
    finalPrice: currentPrice,
    pricing: product.pricing
  })

  await addItem({
    id: product.id,
    name: product.title,
    price: Number(currentPrice) || 0,
    pricing: product.pricing || [], // 🔥 CRITICAL FIX
    image: product.imagePublicIds?.[0],
  })
}

  if (productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading products..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products?.filter(p => p.active !== false).length || 0} products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0 lg:sticky lg:top-28 lg:h-fit">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg mb-4"
            >
              <Filter className="w-5 h-5" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {/* Filters */}
            <div className={`bg-white rounded-lg shadow-sm p-6 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'} lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto`}>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all' ? 'bg-black text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat.id ? 'bg-black text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Rs {priceRange[0]}</span>
                    <span>Rs {priceRange[1].toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    step={Math.max(100, Math.ceil(maxPrice / 100))}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Max: Rs {maxPrice.toLocaleString()}</p>
                </div>
              </div>

              {(selectedCategory !== 'all' || sortBy !== 'featured' || priceRange[1] !== maxPrice) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSortBy('featured')
                    setPriceRange([0, maxPrice])
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onPreview={setPreviewProduct}
                    layout="carousel"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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

export default ProductsPage
