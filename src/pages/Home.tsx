import { useMemo, useState } from 'react'
import type { FC } from 'react'
import { useBanners } from '../hooks/useBanners'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useCart } from '../hooks/useCart'
import SEOHead from '../components/SEOHead.tsx'
import ErrorBoundary from '../components/common/ErrorBoundary.tsx'
import LoadingPage from '../components/common/LoadingPage.tsx'
import HeroSection from '../components/home/HeroSection.tsx'
import ProductCarousel from '../components/home/ProductCarousel.tsx'
import CategoriesSection from '../components/home/CategoriesSection.tsx'
import NewsletterSection from '../components/home/NewsletterSection.tsx'
import ProductPreviewModal from '../components/ProductPreviewModal.tsx'
 
const Home: FC = () => {
  const { addItem } = useCart()
  const [previewProduct, setPreviewProduct] = useState<any>(null)
  
  // Data fetching
  const { data: banners, isLoading: bannersLoading, error: bannersError } = useBanners()
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts()
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()

  // Process products for different sections with category-based grouping
  const processedProducts = useMemo(() => {
    if (!products || !categories || products.length === 0 || categories.length === 0) return null

    // Filter active products and categories
    const activeProducts = products.filter(p => p.active !== false && p.stock && p.stock > 0)
    const activeCategories = categories.filter(c => c.active !== false || c.isActive !== false)

    // Group products by category for each section
    const categoryBasedSections = activeCategories.map(category => {
      const categoryProducts = activeProducts.filter(p => p.categoryId === category.id)
      
      return {
        category,
        featured: categoryProducts.filter(p => p.featured === true).slice(0, 8),
        topSelling: categoryProducts.filter(p => p.topSelling === true).slice(0, 8),
        latest: categoryProducts
          .sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0
            const bTime = b.createdAt?.seconds || 0
            return bTime - aTime
          })
          .slice(0, 6),
        all: categoryProducts
      }
    }).filter(section => section.all.length > 0) // Only include categories with products

    return {
      categoryBasedSections,
      // Fallback: all products grouped by type (if no categories)
      featured: activeProducts.filter(p => p.featured === true).slice(0, 8),
      topSelling: activeProducts.filter(p => p.topSelling === true).slice(0, 8),
      latest: activeProducts
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0
          const bTime = b.createdAt?.seconds || 0
          return bTime - aTime
        })
        .slice(0, 6),
      all: activeProducts
    }
  }, [products, categories])

  // Handle add to cart - adapter function to handle type differences
  const handleAddToCart = async (product: { id: string; title: string; price: number; discountPrice?: number; imagePublicIds?: string[] }) => {
    const currentPrice = product.discountPrice || product.price
    await addItem({
      id: product.id,
      name: product.title,
      price: currentPrice,
      image: product.imagePublicIds?.[0],
    })
  }

  if (bannersLoading && productsLoading && categoriesLoading) {
    return <LoadingPage message="Loading homepage..." />
  }

  return (
    <ErrorBoundary>
      <SEOHead 
       title="Barqino Online Store for Electronics, Fashion & More"
description="Shop a wide range of products including electronics, fashion, watches, home essentials, and more at Easy Buy. Quality products, fast delivery, and reliable service anywhere in the region."
/>


      <div className="bg-white animate-fadeIn">
        {/* <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-10 space-y-4 text-center">
            <h1 className="text-3xl font-semibold text-gray-900">Welcome to Esfylo</h1>
            <p className="text-gray-700 text-base leading-relaxed">
              Esfylo is a watches store where customers can explore curated watches, manage their shopping accounts, and place secure orders. We offer Google Sign-In to provide a safe and convenient way to access your purchases and account history.
            </p>
            <p className="text-gray-700 text-base leading-relaxed">
              For assistance, reach us at <a href="mailto:only.only.esfylo.store@gmail.com" className="text-blue-600 font-medium">only.only.esfylo.store@gmail.com</a>.
            </p>
            <div>
              <a href="/privacy-policy" className="text-blue-600 font-medium">View our Privacy Policy</a>
            </div>
          </div>
        </div> */}

        {/* Hero Section */}
        <div className="animate-fadeIn " style={{ animationDelay: '0ms' }}>
          <HeroSection 
              banners={banners?.map(b => ({
                id: b.id,
                // pass title only when present; otherwise leave undefined so HeroSection hides it
                title: b.title ?? undefined,
                subtitle: b.caption ?? undefined,
                publicId: b.publicId,
                mobilePublicId: b.mobilePublicId,
                ctaText: b.ctaLabel || 'Shop Now',
                ctaLink: b.ctaUrl || '/products'
              }))}
            isLoading={bannersLoading}
            error={bannersError ? 'Failed to load banners' : undefined}
          />
        </div>

          {/* Latest Arrivals Section - Category Based */}
        {processedProducts?.categoryBasedSections && processedProducts.categoryBasedSections.length > 0 && (
          <div className="py-8">
            {/* Main Latest Arrivals Heading */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 ">Latest Arrivals</h2>
                <p className="text-gray-600">Fresh new products just added to our collection</p>
              </div>
            </div>
            
            {/* Category-based Latest Carousels */}
            {processedProducts.categoryBasedSections.map((section, index) => 
              section.latest.length > 0 && (
                <div key={`latest-${section.category.id}`} className="animate-fadeIn" style={{ animationDelay: `${800 + (index * 100)}ms` }}>
                  <ProductCarousel
                    title={section.category.name}
                    products={section.latest}
                    isLoading={productsLoading}
                    showBestsellerTag={true}
                    onAddToCart={handleAddToCart}
                    onPreview={setPreviewProduct}
                  />
                </div>
              )
            )}
          </div>
        )}

        {/* Fallback: Single Latest Arrivals if no categories */}
        {(!processedProducts?.categoryBasedSections || processedProducts.categoryBasedSections.length === 0) && (
          <div className="animate-fadeIn" style={{ animationDelay: '800ms' }}>
            <ProductCarousel
              title="Latest Arrivals"
              products={processedProducts?.latest}
              isLoading={productsLoading}
              error={productsError ? 'Failed to load latest products' : undefined}
              onAddToCart={handleAddToCart}
              onPreview={setPreviewProduct}
            />
          </div>
        )}



    

        {/* Categories Section - Only show if more than 1 active category */}
        {categories && categories.filter(c => c.active !== false).length > 1 && (
          <div className="animate-fadeIn" style={{ animationDelay: '400ms' }}>
            <CategoriesSection
              categories={categories
                ?.filter(c => c.active !== false) // Only show active categories
                .map(c => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                  publicId: c.imagePublicId, // Category image from Cloudinary
                  productCount: undefined // Category doesn't have productCount in current schema
                }))}
              isLoading={categoriesLoading}
              error={categoriesError ? 'Failed to load categories' : undefined}
            />
          </div>
        )}

        {/* Top Selling Products Section - Category Based */}
        {processedProducts?.categoryBasedSections && processedProducts.categoryBasedSections.length > 0 && (
          <div className="py-8">
            {/* Main Top Selling Heading */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Top Selling Products</h2>
                <p className="text-gray-600">Best-selling items loved by our customers</p>
              </div>
            </div>
            
            {/* Category-based Top Selling Carousels */}
            {processedProducts.categoryBasedSections.map((section, index) => 
              section.topSelling.length > 0 && (
                <div key={`topselling-${section.category.id}`} className="animate-fadeIn" style={{ animationDelay: `${600 + (index * 100)}ms` }}>
                  <ProductCarousel
                    title={section.category.name}
                    products={section.topSelling}
                    isLoading={productsLoading}
                    showBestsellerTag={true}
                    onAddToCart={handleAddToCart}
                    onPreview={setPreviewProduct}
                  />
                </div>
              )
            )}
          </div>
        )}

        {/* Fallback: Single Top Selling if no categories */}
        {(!processedProducts?.categoryBasedSections || processedProducts.categoryBasedSections.length === 0) && (
          <div className="animate-fadeIn" style={{ animationDelay: '600ms' }}>
            <ProductCarousel
              title="Top Selling Products"
              products={processedProducts?.topSelling}
              isLoading={productsLoading}
              error={productsError ? 'Failed to load top products' : undefined}
              showBestsellerTag={true}
              onAddToCart={handleAddToCart}
              onPreview={setPreviewProduct}
            />
          </div>
        )}

    {/* Featured Products Section - Category Based */}
        {processedProducts?.categoryBasedSections && processedProducts.categoryBasedSections.length > 0 && (
          <div className="py-8">
            {/* Main Featured Products Heading */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
                <p className="text-gray-600">Discover our handpicked selection across all categories</p>
              </div>
            </div>
            
            {/* Category-based Featured Carousels */}
            {processedProducts.categoryBasedSections.map((section, index) => 
              section.featured.length > 0 && (
                <div key={`featured-${section.category.id}`} className="animate-fadeIn" style={{ animationDelay: `${200 + (index * 100)}ms` }}>
                  <ProductCarousel
                    title={section.category.name}
                    products={section.featured}
                    isLoading={productsLoading}
                    onAddToCart={handleAddToCart}
                    onPreview={setPreviewProduct}
                  />
                </div>
              )
            )}
          </div>
        )}

        {/* Fallback: Single Featured Products if no categories */}
        {(!processedProducts?.categoryBasedSections || processedProducts.categoryBasedSections.length === 0) && (
          <div className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <ProductCarousel
              title="Featured Products"
              products={processedProducts?.featured}
              isLoading={productsLoading}
              error={productsError ? 'Failed to load featured products' : undefined}
              onAddToCart={handleAddToCart}
              onPreview={setPreviewProduct}
            />
          </div>
        )}
      
        {/* Newsletter Section */}
        <div className="animate-fadeIn" style={{ animationDelay: '1000ms' }}>
          <NewsletterSection />
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
    </ErrorBoundary>
  )
}

export default Home
