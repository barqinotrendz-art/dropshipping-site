import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight } from 'lucide-react'
import { getCloudinaryUrl } from '../../lib/cloudinary'
import AnimatedUnderlineHeading from '../AnimatedUnderlineHeading'

interface Category {
  id: string
  name: string
  slug: string
  publicId?: string
  productCount?: number
}

interface CategoriesSectionProps {
  categories?: Category[]
  isLoading?: boolean
  error?: string
}

const CategoriesSection: FC<CategoriesSectionProps> = ({
  categories,
  isLoading,
  error
}) => {
  // Loading state
  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold border-1 border-black text-start text-gray-900 mb-8">Shop by Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error or empty state
  if (error || !categories || categories.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Shop by Categories</h2>
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h3>
            <p className="text-gray-500">
              {error || "New product categories are being organized. Stay tuned!"}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <AnimatedUnderlineHeading
            title="Shop by"
            highlightedText="Categories"
          />
          <p className="text-gray-600 max-w-2xl mx-auto mt-6">
            Discover our wide range of product categories, carefully curated to meet all your needs.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 p-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <div>
              <Link
                key={category.id}
                to={`/categories?type=${category.slug}`}
                className="group relative overflow-hidden w-full bg-[#f9fafb] aspect-square text-center 
                 flex flex-col justify-center items-center  rounded-full
                 transition-all duration-300 transform hover:scale-105 p-0
                 hover:shadow-lg animate-fadeIn
                 "
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* <div
                  className="
                    absolute inset-0
                    rounded-full
                    bg-[conic-gradient(from_135deg,#183831_0deg,#183831_180deg,#f9fafb_180deg,#f9fafb_360deg)]
                    transition-transform duration-700 ease-in-out
                    group-hover:rotate-[180deg]
                  "
                /> */}
                <div
                  className="
                  absolute inset-0
                  rounded-full
                  bg-[conic-gradient(from_135deg,#183831_0deg,#183831_180deg,#f9fafb_180deg,#f9fafb_360deg)]"
                />

                {/* Green dial sweep */}
                <div className="
                  absolute inset-0
                  rounded-full
                  bg-[conic-gradient(from_134.5deg,#183831_0deg,#183831_181deg,transparent_180deg,transparent_360deg)]    rotate-0
                  group-hover:rotate-[180deg]
                  transition-transform
                  duration-500
                  ease-linear "
                />


                {/* Category Image/Icon */}
                <div className="relative z-10 w-[75%] aspect-square border border-1 overflow-hidden flex-shrink-0 
              rounded-full bg-white">
                  {category.publicId ? (
                    <img
                      src={getCloudinaryUrl(category.publicId, 200, 200)}
                      alt={category.name}
                      className="w-full h-full object-cover  group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
                      <Package className="w-8 h-8 md:w-12 md:h-12 text-gray-400 group-hover:text-gray-500 transition-colors" />
                    </div>
                  )}
                </div>

                {/* Category Info */}
                <div>
                  {/* <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-white text-center transition-colors text-sm md:text-base">
                  {category.name}
                </h3> */}
                  {category.productCount !== undefined && (
                    <p className="text-xs md:text-sm text-gray-500 group-hover:text-white transition-colors">
                      {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
                    </p>
                  )}

                  {/* Hover Arrow */}
                  {/* <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-4 h-4 mx-auto text-gray-600 group-hover:text-white " />
                </div> */}
                </div>

              </Link>
              <div className='my-4'>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-white text-center transition-colors text-sm md:text-base">
                  {category.name}
                </h3>
              </div>

            </div>

          ))}
        </div>

        {/* View All Categories Link */}
        {categories.length >= 6 && (
          <div className="text-center mt-8">
            <Link
              to="/categories"
              className="inline-flex items-center px-6 py-3  rounded-lg transition-colors group hover:bg-black hover:text-white border-2 border-black"
            >
              View All Categories
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default CategoriesSection
