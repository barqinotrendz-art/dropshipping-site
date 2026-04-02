import React from 'react'
import { useForm } from 'react-hook-form'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp, FaYoutube } from 'react-icons/fa'

type SocialSettingsForm = {
  facebook?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  whatsapp?: string
}

async function fetchSocialSettings() {
  const docRef = doc(db, 'settings', 'social')
  const snap = await getDoc(docRef)
  if (snap.exists()) {
    return snap.data() as SocialSettingsForm
  }
  return {}
}

const SocialSettingsPage: React.FC = () => {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ 
    queryKey: ['social-settings'], 
    queryFn: fetchSocialSettings 
  })
  
  const { register, handleSubmit, reset } = useForm<SocialSettingsForm>({
    values: data
  })
  
  const [saving, setSaving] = React.useState(false)

  const onSubmit = async (formData: SocialSettingsForm) => {
    setSaving(true)
    toast.loading('Saving social media settings...', { id: 'social-save' })
    
    try {
      const docRef = doc(db, 'settings', 'social')
      await setDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true })
      
      await qc.invalidateQueries({ queryKey: ['social-settings'] })
      toast.success('Social media settings saved successfully!', { id: 'social-save' })
    } catch (e: any) {
      console.error('Error saving social settings:', e)
      toast.error('Failed to save settings. Please try again.', { id: 'social-save' })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Social Media Settings</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Manage your social media links. Leave empty to hide the icon from the user site.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg max-w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full">
          
          {/* Facebook */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FaFacebook className="text-blue-600 text-xl" />
              Facebook URL
            </label>
            <input
              type="url"
              {...register('facebook')}
              placeholder="https://www.facebook.com/yourpage"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter your complete Facebook page URL
            </p>
          </div>

          {/* Instagram */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FaInstagram className="text-pink-600 text-xl" />
              Instagram URL
            </label>
            <input
              type="url"
              {...register('instagram')}
              placeholder="https://www.instagram.com/yourprofile"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter your complete Instagram profile URL
            </p>
          </div>

          {/* TikTok */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FaTiktok className="text-gray-900 text-xl" />
              TikTok URL
            </label>
            <input
              type="url"
              {...register('tiktok')}
              placeholder="https://www.tiktok.com/@yourprofile"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm sm:text-base"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter your complete TikTok profile URL
            </p>
          </div>

          {/* YouTube */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FaYoutube className="text-red-600 text-xl" />
              YouTube URL
            </label>
            <input
              type="url"
              {...register('youtube')}
              placeholder="https://www.youtube.com/@yourchannel"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter your complete YouTube channel URL
            </p>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FaWhatsapp className="text-green-600 text-xl" />
              WhatsApp Number
            </label>
            <input
              type="text"
              {...register('whatsapp')}
              placeholder="923001234567"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter phone number with country code (no + or spaces). Example: 923001234567 for Pakistan
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto order-1 sm:order-none"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              type="button"
              onClick={() => reset()}
              variant="outline"
              disabled={saving}
              className="w-full sm:w-auto order-2 sm:order-none"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 max-w-full">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Preview</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
          Icons will appear in the footer and WhatsApp chat button (if configured):
        </p>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {data?.facebook && (
            <div className="flex items-center gap-2 text-xs sm:text-sm bg-white rounded-lg px-3 py-2 shadow-sm">
              <FaFacebook className="text-blue-600 text-lg sm:text-xl" />
              <span className="text-gray-600">Facebook</span>
            </div>
          )}
          {data?.instagram && (
            <div className="flex items-center gap-2 text-xs sm:text-sm bg-white rounded-lg px-3 py-2 shadow-sm">
              <FaInstagram className="text-pink-600 text-lg sm:text-xl" />
              <span className="text-gray-600">Instagram</span>
            </div>
          )}
          {data?.tiktok && (
            <div className="flex items-center gap-2 text-xs sm:text-sm bg-white rounded-lg px-3 py-2 shadow-sm">
              <FaTiktok className="text-gray-900 text-lg sm:text-xl" />
              <span className="text-gray-600">TikTok</span>
            </div>
          )}
          {data?.youtube && (
            <div className="flex items-center gap-2 text-xs sm:text-sm bg-white rounded-lg px-3 py-2 shadow-sm">
              <FaYoutube className="text-red-600 text-lg sm:text-xl" />
              <span className="text-gray-600">YouTube</span>
            </div>
          )}
          {data?.whatsapp && (
            <div className="flex items-center gap-2 text-xs sm:text-sm bg-white rounded-lg px-3 py-2 shadow-sm">
              <FaWhatsapp className="text-green-600 text-lg sm:text-xl" />
              <span className="text-gray-600">WhatsApp</span>
            </div>
          )}
          {!data?.facebook && !data?.instagram && !data?.tiktok && !data?.youtube && !data?.whatsapp && (
            <p className="text-sm text-gray-500 italic">No social media links configured yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SocialSettingsPage
