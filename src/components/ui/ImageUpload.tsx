import React, { useState, useRef } from 'react'
import { HiPlus, HiX, HiPhotograph } from 'react-icons/hi'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'
import { auth } from '../../lib/firebase'
import { getCloudinaryUrl, getUploadPreset, getUploadUrl } from '../../lib/cloudinary'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  label?: string
  showImageNames?: boolean
  colorVariant?: string
  requiredWidth?: number
  requiredHeight?: number
  aspectRatioTolerance?: number // Allow some tolerance (e.g., 0.1 = 10%)
}

interface ImageFile {
  file: File
  url: string
  name: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  label = 'Product Images',
  showImageNames = true,
  colorVariant,
  requiredWidth,
  requiredHeight,
  aspectRatioTolerance = 0.1
}) => {
  const [uploading, setUploading] = useState(false)
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadCount, setUploadCount] = useState(0)
  const [lastUploadTime, setLastUploadTime] = useState(0)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Rate limiting: Max 10 uploads per minute
    const now = Date.now()
    if (now - lastUploadTime < 60000) {
      if (uploadCount >= 10) {
        toast.error('Too many uploads. Please wait a minute.')
        return
      }
    } else {
      // Reset counter after 1 minute
      setUploadCount(0)
      setLastUploadTime(now)
    }

    // Check if we can add more images
    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    const filesToUpload = files.slice(0, remainingSlots)
    setUploading(true)
    toast.loading(`Uploading ${filesToUpload.length} image(s)...`, { id: 'image-upload' })

    try {
      const uploadedPublicIds: string[] = []
      const newImageFiles: ImageFile[] = []
      
      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`)
          continue
        }

        // Validate image dimensions if required
        if (requiredWidth || requiredHeight) {
          const dimensionCheck = await new Promise<boolean>((resolve) => {
            const img = new Image()
            img.onload = () => {
              const width = img.width
              const height = img.height
              
              // Check exact dimensions with tolerance
              if (requiredWidth && requiredHeight) {
                const expectedRatio = requiredWidth / requiredHeight
                const actualRatio = width / height
                const ratioDiff = Math.abs(expectedRatio - actualRatio) / expectedRatio
                
                if (ratioDiff > aspectRatioTolerance) {
                  toast.error(`${file.name}: Invalid aspect ratio. Expected ${requiredWidth}x${requiredHeight} (or similar ratio)`)
                  resolve(false)
                  return
                }
                
                // Check if dimensions are at least the minimum required
                if (width < requiredWidth * 0.8 || height < requiredHeight * 0.8) {
                  toast.error(`${file.name}: Image too small. Minimum ${requiredWidth}x${requiredHeight} recommended`)
                  resolve(false)
                  return
                }
              }
              
              resolve(true)
            }
            img.onerror = () => {
              toast.error(`${file.name}: Failed to load image`)
              resolve(false)
            }
            img.src = URL.createObjectURL(file)
          })
          
          if (!dimensionCheck) {
            continue
          }
        }

        try {
          // Check if user is authenticated (client-side check for Spark Plan)
          const user = auth.currentUser
          if (!user) {
            toast.error('Please login to upload images')
            throw new Error('User not authenticated')
          }
          
          // Upload to Cloudinary using unsigned upload (Spark Plan compatible)
          const uploadPreset = getUploadPreset()
          
          const formData = new FormData()
          formData.append('file', file)
          formData.append('upload_preset', uploadPreset)
          formData.append('folder', 'store/products')
          
          const response = await fetch(
            getUploadUrl(),
            {
              method: 'POST',
              body: formData,
            }
          )
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Cloudinary upload error:', errorData)
            throw new Error(errorData.error?.message || 'Upload failed')
          }
          
          const result = await response.json()
          uploadedPublicIds.push(result.public_id)
          
          // Increment upload counter
          setUploadCount(prev => prev + 1)
          
          // Create preview
          const url = URL.createObjectURL(file)
          newImageFiles.push({
            file,
            url,
            name: file.name
          })
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          toast.error(`Failed to upload ${file.name}`)
        }
      }

      if (uploadedPublicIds.length > 0) {
        const updatedImageFiles = [...imageFiles, ...newImageFiles]
        setImageFiles(updatedImageFiles)
        
        // Add Cloudinary public IDs to the images array
        const newImages = [...images, ...uploadedPublicIds]
        onImagesChange(newImages)
        
        toast.success(`Successfully uploaded ${uploadedPublicIds.length} image(s)!`, { id: 'image-upload' })
      } else {
        toast.error('No images were uploaded', { id: 'image-upload' })
      }
      
    } catch (error) {
      console.error('Error processing images:', error)
      toast.error('Failed to upload images. Please try again.', { id: 'image-upload' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newImageFiles = imageFiles.filter((_, i) => i !== index)
    
    // Revoke URL to prevent memory leaks
    if (imageFiles[index]) {
      URL.revokeObjectURL(imageFiles[index].url)
    }
    
    setImageFiles(newImageFiles)
    onImagesChange(newImages)
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {colorVariant && `(${colorVariant})`}
        </label>
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image, index) => {
          // Check if it's a Cloudinary public ID or a blob URL
          const isCloudinaryId = !image.startsWith('blob:')
          const imageUrl = isCloudinaryId 
            ? getCloudinaryUrl(image, 200, 200)
            : image
          
          return (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
              <img
                src={imageUrl}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
            >
              <HiX className="w-4 h-4" />
            </button>

            {/* Image Name */}
            {showImageNames && imageFiles[index] && (
              <div className="mt-1">
                <p className="text-xs text-gray-500 truncate" title={imageFiles[index].name}>
                  {imageFiles[index].name}
                </p>
              </div>
            )}
          </div>
          )
        })}

        {/* Add Image Button */}
        {canAddMore && (
          <div className="aspect-square">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
            >
              {uploading ? (
                <LoadingSpinner size="md" color="gray" />
              ) : (
                <>
                  <HiPlus className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Add Image</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Instructions */}
      <div className="text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <HiPhotograph className="w-4 h-4" />
          <span>
            Upload up to {maxImages} images. Supported formats: JPG, PNG, WebP
          </span>
        </div>
        {colorVariant && (
          <p className="mt-1 text-xs">
            These images will be associated with the {colorVariant} color variant.
          </p>
        )}
      </div>

      {/* Bulk Actions */}
      {images.length > 0 && (
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canAddMore || uploading}
          >
            Add More Images
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              imageFiles.forEach(img => URL.revokeObjectURL(img.url))
              setImageFiles([])
              onImagesChange([])
            }}
          >
            Remove All
          </Button>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
