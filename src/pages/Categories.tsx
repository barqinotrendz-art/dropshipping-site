import React, { useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import { Package, ArrowRight, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import SEOHead from '../components/SEOHead'
import CategoryProductsSection from '../components/categories/CategoryProductsSection'
import CategoryGridSection from '../components/categories/CategoryGridSection'

const CategoriesPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const categorySlug = searchParams.get('type')
  
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const { data: allProducts, isLoading: productsLoading } = useProducts()

  // Find the selected category
  const selectedCategory = useMemo(() => {
    if (!categorySlug || !categories) return null
    return categories.find(cat => cat.slug === categorySlug)
  }, [categorySlug, categories])

  // Filter products for the selected category
  const categoryProducts = useMemo(() => {
    if (!selectedCategory || !allProducts) return []
    return allProducts.filter(p => 
      p.categoryId === selectedCategory.id && 
      p.active !== false && 
      p.stock && 
      p.stock > 0
    )
  }, [selectedCategory, allProducts])

  // Scroll to top when category changes
  useEffect(() => {
    if (categorySlug) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [categorySlug])

  // Initial loading state
  if (categoriesLoading && !categories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading categories..." />
      </div>
    )
  }

  // Error state
  if (categoriesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Categories</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!categories || categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Categories Yet</h2>
          <p className="text-gray-600 mb-6">Categories are being organized. Check back soon!</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse All Products
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    )
  }

 const pageTitle = selectedCategory 
  ? `${selectedCategory.name} - Easy Buy`
  : 'Shop by Categories - Easy Buy'

const pageDescription = selectedCategory
  ? `Browse and shop the best ${selectedCategory.name} products online at Easy Buy. High quality, fast delivery, and excellent service.`
  : 'Explore a wide range of products across electronics, fashion, watches, home essentials, and more at Easy Buy. Fast delivery and reliable service.'

  return (
    <>
      <SEOHead 
        title={`${pageTitle} - Easy buy`}
        description={pageDescription}
      />
      
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Categories</span>
            {selectedCategory && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium">{selectedCategory.name}</span>
              </>
            )}
          </nav>

          {/* Page Header */}
          {!selectedCategory && (
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Shop by Categories
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Click on any category below to view its products
              </p>
            </div>
          )}

          {/* Selected Category Products Section */}
          {selectedCategory && (
            <CategoryProductsSection
              category={selectedCategory}
              products={categoryProducts}
              isLoading={productsLoading}
            />
          )}

          {/* All Categories Grid Section */}
          <CategoryGridSection
            categories={categories}
            activeSlug={categorySlug || undefined}
            isLoading={categoriesLoading}
          />

          {/* Back to Home Link */}
          <div className="text-center mt-12">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default CategoriesPage
