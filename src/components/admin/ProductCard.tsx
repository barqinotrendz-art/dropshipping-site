import React, { useState } from "react"
import {
  Pencil,
  Trash2,
  EyeOff,
  Eye
} from "lucide-react"
import Button from "../ui/Button"
import { getCloudinaryUrl } from "../../lib/cloudinary"

type PriceTier = {
  label: string
  price: number
  discountPrice?: number
}

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    images: string[] // Cloudinary public IDs
    colors?: { name: string; images: string[] }[] // Color variants with Cloudinary public IDs
    stock: number
    category: string
    isActive?: boolean
    pricing?: PriceTier[]
  }

  onEdit: (productId: string) => void
  onDelete: (productId: string) => Promise<void>
  onToggleActive: (productId: string, isActive: boolean) => Promise<void>
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(product.id)
    } catch (error) {
      console.error("Failed to delete product:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleToggleActive = async () => {
    setIsToggling(true)
    try {
      await onToggleActive(product.id, product.isActive ?? false)
    } catch (error) {
      console.error("Failed to toggle product status:", error)
    } finally {
      setIsToggling(false)
    }
  }

  // Convert Cloudinary public IDs to URLs
  const getImageUrl = (publicId: string) => {
    if (!publicId) return "/placeholder-image.jpg"
    return getCloudinaryUrl(publicId, 400, 400)
  }

  const displayImage = product.images?.[0]
    ? getImageUrl(product.images[0])
    : product.colors?.[0]?.images?.[0]
      ? getImageUrl(product.colors[0].images[0])
      : "/placeholder-image.jpg"

  const secondImage = product.images?.[1]
    ? getImageUrl(product.images[1])
    : product.colors?.[1]?.images?.[0]
      ? getImageUrl(product.colors[1].images[0])
      : undefined
  console.log(product.pricing)
  return (
    <div
      className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full ${!product.isActive ? "opacity-75" : ""
        }`}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg group flex-shrink-0">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {secondImage && (
          <img
            src={secondImage}
            alt={`${product.name} variant`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${product.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {product.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Stock Badge */}
        {product.stock < 10 && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 shadow-sm">
              Low Stock: {product.stock}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Product Info - Fixed Height */}
        <div className="mb-3">
          <h3
            className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">{product.category}</p>
          <div className="flex gap-2 items-center">
            <p className="text-md font-semibold text-[#c03e35] mt-1">
              AED {product.pricing?.[0]?.discountPrice}

            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1 line-through">
              AED {product.pricing?.[0]?.price}
            </p>
          </div>
        </div>

        {/* Color Variants - Fixed Height Container */}
        <div className="mb-3 h-12 flex items-center">
          {product.colors && product.colors.length > 0 ? (
            <div className="w-full">
              <p className="text-xs text-gray-500 mb-1">
                Colors ({product.colors.length})
              </p>
              <div className="flex space-x-1">
                {product.colors.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border-2 border-gray-200 overflow-hidden flex-shrink-0"
                    title={color.name}
                  >
                    <img
                      src={color.images?.[0] ? getImageUrl(color.images[0]) : "/placeholder-image.jpg"}
                      alt={color.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {product.colors.length > 4 && (
                  <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-600">
                      +{product.colors.length - 4}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full">
              <p className="text-xs text-gray-400 italic">No color variants</p>
            </div>
          )}
        </div>

        {/* Stock Info */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Stock:</span>
            <span
              className={`font-medium ${product.stock < 10 ? "text-red-600" : "text-green-600"
                }`}
            >
              {product.stock} units
            </span>
          </div>
        </div>

        {/* Action Buttons - Pushed to bottom */}
        <div className="mt-auto space-y-2">
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Pencil className="w-4 h-4" />}
              onClick={() => onEdit(product.id)}
              className="flex-1 min-w-0"
            >
              <span className="truncate">Edit</span>
            </Button>

            <Button
              variant={product.isActive ? "warning" : "success"}
              size="sm"
              icon={
                product.isActive ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )
              }
              onClick={handleToggleActive}
              loading={isToggling}
              className="flex-1 min-w-0"
            >
              <span className="truncate">
                {product.isActive ? "Deactivate" : "Activate"}
              </span>
            </Button>
          </div>

          <Button
            variant={showDeleteConfirm ? "danger" : "secondary"}
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={handleDelete}
            loading={isDeleting}
            className={`w-full ${showDeleteConfirm ? "animate-pulse" : ""}`}
          >
            {showDeleteConfirm ? "Confirm Delete" : "Delete"}
          </Button>
        </div>

        {showDeleteConfirm && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <p>Are you sure? This action cannot be undone.</p>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-red-600 hover:text-red-800 underline mt-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
