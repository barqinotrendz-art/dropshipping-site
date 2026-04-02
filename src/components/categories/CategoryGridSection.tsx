import React from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight } from 'lucide-react'
import type { Category } from '../../types'
import { getCloudinaryUrl } from '../../lib/cloudinary'

interface CategoryGridSectionProps {
  categories: Category[]
  activeSlug?: string
  isLoading?: boolean
}

const CategoryGridSection: React.FC<CategoryGridSectionProps> = ({
  categories,
  activeSlug,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="py-12 border-t border-gray-200">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Browse All Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="py-12 border-t border-gray-200">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Available</h3>
          <p className="text-gray-500">Categories are being organized. Check back soon!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 border-t border-gray-200">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Browse All Categories
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Click on any category to view its products above
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {categories.map((category, index) => {
          const isActive = category.slug === activeSlug

          return (
            <Link
              key={category.id}
              to={`/categories?type=${category.slug}`}
              className={`group rounded-lg p-4 md:p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fadeIn ${
                isActive 
                  ? 'bg-black text-white shadow-lg scale-105' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Category Image/Icon */}
              <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-white">
                {category.imagePublicId ? (
                  <img
                    src={getCloudinaryUrl(category.imagePublicId, 300, 300)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
                    <Package className={`w-10 h-10 md:w-14 md:h-14 transition-colors ${
                      isActive ? 'text-black' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div>
                <h3 className={`font-semibold mb-1 transition-colors text-sm md:text-base line-clamp-2 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-900 group-hover:text-black'
                }`}>
                  {category.name}
                </h3>
                {category.description && (
                  <p className={`text-xs line-clamp-2 mb-2 ${
                    isActive ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {category.description}
                  </p>
                )}
                
                {/* Hover/Active Arrow */}
                <div className={`mt-2 transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <ArrowRight className={`w-4 h-4 mx-auto ${
                    isActive ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryGridSection
