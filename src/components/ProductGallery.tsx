import React from 'react'
import { AdvancedImage } from '@cloudinary/react'
import { cld } from '../lib/cloudinary'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'
import type { ColorVariant } from '../types'

interface Props {
  publicIds: string[]
  colorVariants?: ColorVariant[]
  selectedColor?: ColorVariant | null
  onColorChange?: (color: ColorVariant) => void
}

const ProductGallery: React.FC<Props> = ({ publicIds, colorVariants, selectedColor, onColorChange }) => {
  const [active, setActive] = React.useState(0)

  // Build complete image list with all product images and color variant images
  const allImages = React.useMemo(() => {
    const imagesList: Array<{ id: string; colorName?: string; colorHex?: string }> = []
    const processedIds = new Set<string>()
    
    // Add main product images first (default images) - these won't have color info
    publicIds.forEach(id => {
      if (!processedIds.has(id)) {
        imagesList.push({ id })
        processedIds.add(id)
      }
    })
    
    // Then add color variant images with their color info
    if (colorVariants && colorVariants.length > 0) {
      colorVariants.forEach(variant => {
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach(id => {
            // For color variant images, we want to add them WITH color info
            // even if the same image exists in publicIds
            const existingIndex = imagesList.findIndex(img => img.id === id)
            if (existingIndex !== -1) {
              // Update existing image to add color info
              imagesList[existingIndex] = { id, colorName: variant.name, colorHex: variant.value }
            } else {
              // Add new image with color info
              imagesList.push({ id, colorName: variant.name, colorHex: variant.value })
            }
          })
        }
      })
    }
    
    return imagesList
  }, [publicIds, colorVariants])

  // When selected color changes, jump to first image of that color
  React.useEffect(() => {
    if (selectedColor && colorVariants && colorVariants.length > 0) {
      const firstColorImageIndex = allImages.findIndex(
        img => img.colorName === selectedColor.name
      )
      if (firstColorImageIndex !== -1) {
        setActive(firstColorImageIndex)
      }
    }
  }, [selectedColor, allImages, colorVariants])

  const main = React.useMemo(() => {
    const imageData = allImages[active]
    if (!imageData) return cld.image(publicIds[0]).format('auto').quality('auto').resize(fill().width(800).height(800).gravity(autoGravity()))
    return cld.image(imageData.id).format('auto').quality('auto').resize(fill().width(800).height(800).gravity(autoGravity()))
  }, [allImages, active, publicIds])

  const handleThumbnailClick = (idx: number) => {
    setActive(idx)
    
    // If this image belongs to a color variant, update selected color
    const imageData = allImages[idx]
    if (imageData.colorName && colorVariants && onColorChange) {
      const matchingColor = colorVariants.find(v => v.name === imageData.colorName)
      if (matchingColor) {
        onColorChange(matchingColor)
      }
    }
  }

  return (
    <div className="space-y-3">
      {/* Main Image Display */}
      <div className="border rounded overflow-hidden bg-gray-50">
        <AdvancedImage cldImg={main} />
      </div>
      
      {/* Thumbnail Gallery - Shows ALL images */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {allImages.map((imageData, idx) => {
            const thumb = cld.image(imageData.id).format('auto').quality('auto').resize(fill().width(120).height(120).gravity(autoGravity()))
            const isActive = idx === active
            return (
              <button
                key={imageData.id + idx}
                onClick={() => handleThumbnailClick(idx)}
                className={`relative flex-shrink-0 border-2 rounded overflow-hidden transition-all ${
                  isActive ? 'ring-2 ring-black border-black' : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ lineHeight: 0 }}
                aria-label={`Select image ${idx + 1}${imageData.colorName ? ` - ${imageData.colorName}` : ''}`}
              >
                <AdvancedImage cldImg={thumb} />
                {/* Color indicator dot */}
                {imageData.colorHex && (
                  <div 
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: imageData.colorHex }}
                    title={imageData.colorName}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProductGallery
