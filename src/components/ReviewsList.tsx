import React from 'react'
import { useReviews } from '../hooks/useReviews'
import type { Review } from '../hooks/useReviews'

type Props = {
  productId: string
}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-base'
  
  return (
    <div className={`flex items-center ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
    </div>
  )
}

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => {
  const reviewDate = review.createdAt?.toDate?.() || new Date()
  
  return (
    <div className="border-b pb-4 mb-4 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-sm text-gray-600">by {review.userName}</span>
            {review.verified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Verified Purchase
              </span>
            )}
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {reviewDate.toLocaleDateString()}
        </span>
      </div>
      
      {review.comment && (
        <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
      )}
      
      {review.helpful && review.helpful > 0 && (
        <div className="mt-2">
          <span className="text-xs text-gray-500">
            {review.helpful} people found this helpful
          </span>
        </div>
      )}
    </div>
  )
}

const ReviewsList: React.FC<Props> = ({ productId }) => {
  const { data: reviews, isLoading, error } = useReviews(productId)

  if (isLoading) return <p className="text-gray-500">Loading reviews...</p>
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800 font-medium">Failed to load reviews</p>
        <p className="text-red-600 text-sm mt-1">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
        <p className="text-red-600 text-xs mt-2">
          Check browser console for more details. This might be a Firestore permissions issue.
        </p>
      </div>
    )
  }
  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
  }

  // Calculate average rating
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => 
    reviews.filter(review => review.rating === rating).length
  )

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 p-4 rounded">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{avgRating.toFixed(1)}</div>
            <StarRating rating={Math.round(avgRating)} />
            <div className="text-sm text-gray-600">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
          </div>
          
          <div className="flex-1">
            {ratingCounts.map((count, index) => {
              const rating = 5 - index
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span>{rating} ★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-600 w-8">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReviewsList
