import React from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'
import { useAddReview } from '../hooks/useReviews'
import toast from 'react-hot-toast'

type ReviewFormData = {
  rating: number
  comment: string
}

type Props = {
  productId: string
  onSuccess?: () => void
}

const ReviewForm: React.FC<Props> = ({ productId, onSuccess }) => {
  const { user } = useAuth()
  const addReview = useAddReview()
  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = useForm<ReviewFormData>({
    defaultValues: { rating: 5 }
  })
  const rating = watch('rating')

  const onSubmit = async (data: ReviewFormData) => {
    if (!user) {
      toast.error('Please log in to submit a review')
      return
    }
    
    // Validation
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars')
      return
    }
    
    if (!data.comment?.trim()) {
      toast.error('Please write a review comment')
      return
    }
    
    toast.loading('Submitting your review...', { id: 'submit-review' })
    
    try {
      await addReview.mutateAsync({
        productId,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        rating: data.rating,
        comment: data.comment.trim(),
        verified: false,
        status: 'pending'
      })
      
      reset()
      toast.success('Review submitted successfully! It will appear after admin approval.', { 
        id: 'submit-review',
        duration: 5000 
      })
      onSuccess?.()
    } catch (error) {
      let errorMessage = 'Failed to submit review. Please try again.'
      
      if (error instanceof Error) {
        if (error.message?.includes('permission')) {
          errorMessage = 'Permission denied. Please make sure you are logged in.'
        } else if (error.message?.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        }
      }
      
      toast.error(errorMessage, { id: 'submit-review' })
    }
  }

  if (!user) {
    return (
      <div className="p-4 bg-gray-50 rounded">
        <p>Please log in to write a review.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue('rating', star)}
              className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">({rating} star{rating !== 1 ? 's' : ''})</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Your Review</label>
        <textarea 
          className="w-full border rounded px-3 py-2"
          rows={4}
          placeholder="Tell others about your experience with this product"
          {...register('comment')}
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}

export default ReviewForm
