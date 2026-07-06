import React from 'react'
import { useForm } from 'react-hook-form'
import { useAddAdminReview } from '../hooks/useReviews'
import toast from 'react-hot-toast'

type AdminReviewFormData = {
  userName: string
  userEmail: string
  rating: number
  comment: string
}

type Props = {
  productId: string
  onSuccess?: () => void
}

const AdminReviewForm: React.FC<Props> = ({
  productId,
  onSuccess
}) => {
  const addAdminReview = useAddAdminReview()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting }
  } = useForm<AdminReviewFormData>({
    defaultValues: {
      rating: 5
    }
  })

  const rating = watch('rating')

  const onSubmit = async (
    data: AdminReviewFormData
  ) => {
    if (!data.userName.trim()) {
      toast.error('Name is required')
      return
    }

    if (!data.userEmail.trim()) {
      toast.error('Email is required')
      return
    }

    if (!data.comment.trim()) {
      toast.error('Comment is required')
      return
    }

    toast.loading('Adding review...', {
      id: 'admin-review'
    })

    try {
      await addAdminReview.mutateAsync({
        productId,

        userName: data.userName.trim(),

        userEmail: data.userEmail.trim(),

        rating: data.rating,

        comment: data.comment.trim()
      })

      reset()

      toast.success(
        'Review added successfully',
        {
          id: 'admin-review'
        }
      )

      onSuccess?.()
    }catch (error) {
  console.error("ADMIN REVIEW ERROR:", error)
  toast.error("Failed to add review")
}
    //  catch (error) {
    //   toast.error(
    //     'Failed to add review',
    //     {
    //       id: 'admin-review'
    //     }
    //   )
    // }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">
          Customer Name
        </label>

        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="John Smith"
          {...register('userName')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Customer Email
        </label>

        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="john@example.com"
          {...register('userEmail')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Rating
        </label>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                setValue('rating', star)
              }
              className={`text-2xl ${
                star <= rating
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}

          <span className="ml-2 text-sm text-gray-600">
            ({rating} star
            {rating !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Review Comment
        </label>

        <textarea
          className="w-full border rounded px-3 py-2"
          rows={4}
          placeholder="Customer review..."
          {...register('comment')}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        {isSubmitting
          ? 'Adding Review...'
          : 'Add Review'}
      </button>
    </form>
  )
}

export default AdminReviewForm