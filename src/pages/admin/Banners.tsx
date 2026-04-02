import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ImageUpload from '../../components/ui/ImageUpload'

type BannerForm = {
  title?: string
  caption?: string
  ctaLabel?: string
  ctaUrl?: string
  active?: boolean
}

async function fetchBanners() {
  const q = query(collection(db, 'banners'), orderBy('sort', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
}

const BannersPage: React.FC = () => {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['banners-admin'], queryFn: fetchBanners })
  const { register, handleSubmit, reset } = useForm<BannerForm>({
    defaultValues: { active: true }
  })
  const [desktopImages, setDesktopImages] = useState<string[]>([])
  const [mobileImages, setMobileImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)


  const onSubmit = async (values: BannerForm) => {
    // Validation
    if (!desktopImages || desktopImages.length === 0) {
      toast.error('Please upload a desktop banner image')
      return
    }
    
    if (!mobileImages || mobileImages.length === 0) {
      toast.error('Please upload a mobile banner image')
      return
    }
    
    setIsSubmitting(true)
    toast.loading('Adding banner...', { id: 'add-banner' })
    
    try {
      await addDoc(collection(db, 'banners'), {
        publicId: desktopImages[0], // Desktop image
        mobilePublicId: mobileImages[0], // Mobile image
        // If title is empty, store null so UI can treat it as "no title"
        title: values.title?.trim() ? values.title.trim() : null,
        caption: values.caption?.trim() || '',
        ctaLabel: values.ctaLabel?.trim() || '',
        ctaUrl: values.ctaUrl?.trim() || '',
        active: values.active !== false,
        sort: (data?.length || 0) + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      reset({ title: '', caption: '', ctaLabel: '', ctaUrl: '', active: true })
      setDesktopImages([])
      setMobileImages([])
      qc.invalidateQueries({ queryKey: ['banners-admin'] })
      qc.invalidateQueries({ queryKey: ['banners'] })
      
      toast.success('Banner added successfully!', { id: 'add-banner' })
    } catch (error) {
      console.error('Error adding banner:', error)
      toast.error('Failed to add banner. Please try again.', { id: 'add-banner' })
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'banners', id))
      qc.invalidateQueries({ queryKey: ['banners-admin'] })
      qc.invalidateQueries({ queryKey: ['banners'] })
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error('Failed to delete banner. Please try again.', { id: 'delete-banner' })
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'banners', id), { active: !current, updatedAt: serverTimestamp() })
    qc.invalidateQueries({ queryKey: ['banners-admin'] })
    qc.invalidateQueries({ queryKey: ['banners'] })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-semibold">Admin • Banners</h1>

      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8 max-w-4xl">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Add New Banner</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Desktop Banner Image Upload */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Desktop Banner (Required)</h3>
            <ImageUpload
              images={desktopImages}
              onImagesChange={setDesktopImages}
              maxImages={1}
              label="Desktop Banner Image *"
              showImageNames={false}
              requiredWidth={1920}
              requiredHeight={880}
              aspectRatioTolerance={0.1}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              <strong>Required:</strong> 1920×880px (~2.18:1 aspect ratio) for desktop display. 
              <br />
              Size range: 1800-1920px wide × 800-900px height accepted.
            </p>
          </div>

          {/* Mobile Banner Image Upload */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Mobile Banner (Required)</h3>
            <ImageUpload
              images={mobileImages}
              onImagesChange={setMobileImages}
              maxImages={1}
              label="Mobile Banner Image *"
              showImageNames={false}
              requiredWidth={800}
              requiredHeight={800}
              aspectRatioTolerance={0.1}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              <strong>Required:</strong> 800×800px (1:1 aspect ratio) for mobile display.
              <br />
              Square format optimized for mobile screens.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>📱 Responsive Design:</strong> Upload both desktop and mobile versions for optimal display across all devices. 
              Desktop banners show on large screens, mobile banners show on phones and tablets.
            </p>
          </div>

          {/* Banner Text Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none" 
                placeholder="e.g., Summer Sale"
                {...register('title')} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption (Optional)</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none" 
                placeholder="e.g., Up to 50% off"
                {...register('caption')} 
              />
            </div>
          </div>

          {/* CTA Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text (Optional)</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none" 
                placeholder="e.g., Shop Now"
                {...register('ctaLabel')} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Link (Optional)</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none" 
                placeholder="e.g., /products"
                {...register('ctaUrl')} 
              />
            </div>
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="active"
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              {...register('active')} 
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active (Show on website)
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitting || desktopImages.length === 0 || mobileImages.length === 0}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Adding...' : 'Add Banner'}
            </Button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Existing Banners</h2>
        {isLoading && <LoadingSpinner size="md" text="Loading banners..." />}
        {!isLoading && (!data || data.length === 0) && <p className="text-sm sm:text-base text-gray-600">No banners yet.</p>}
        <ul className="space-y-3 sm:space-y-4">
          {data?.map((b: any) => (
            <li key={b.id} className="border rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base truncate">{b.title ?? ''}</div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">publicId: {b.publicId}</div>
                  <div className="text-xs sm:text-sm text-gray-600">sort: {b.sort ?? '-'} • active: {String(b.active !== false)}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => toggleActive(b.id, b.active !== false)} className="text-xs sm:text-sm">
                    {b.active !== false ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(b.id)} className="text-xs sm:text-sm">Delete</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default BannersPage
