import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useForm } from 'react-hook-form'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import toast from 'react-hot-toast'

type ProfileForm = {
  displayName: string
  email: string
}

const Profile: React.FC = () => {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileForm>({
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
    }
  })

  // Update form when user changes (after auth state update)
  React.useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName || '',
        email: user.email || '',
      })
    }
  }, [user, reset])

  const onUpdateProfile = async (data: ProfileForm) => {
    if (!user) return
    setIsSubmitting(true)
    
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: data.displayName })
      // Update Firestore user document to keep them in sync
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: data.displayName,
        updatedAt: serverTimestamp()
      })
      
      toast.success('Profile updated successfully! ✨')
    } catch (e) {
      console.error('Profile update error:', e)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return <p>Please log in to view your profile.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Account</h1>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Information</h2>
        </div>

        <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
              placeholder="Enter your display name"
              {...register('displayName', { required: 'Display name is required' })}
            />
            {errors.displayName && (
              <p className="text-sm text-red-600 mt-1">{errors.displayName.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input 
              className="w-full px-4 py-3 bg-gray-50 text-gray-500"
              {...register('email')}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed. This is your secure sign-in email.
            </p>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
            </button>
          </div>
        </form>

      
      </div>
    </div>
  )
}

export default Profile
