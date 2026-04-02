import React from 'react'
import { useAllReviews, useUpdateReviewStatus, useDeleteReview } from '../../hooks/useReviews'
import type { Review } from '../../hooks/useReviews'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const ReviewsAdminPage: React.FC = () => {
  const { data: reviews, isLoading, error } = useAllReviews()
  const updateStatus = useUpdateReviewStatus()
  const deleteReview = useDeleteReview()

  const handleStatusUpdate = async (review: Review, status: Review['status']) => {
    const action = status === 'approved' ? 'approving' : status === 'rejected' ? 'rejecting' : 'updating'
    toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)} review...`, { id: 'review-status' })
    
    try {
      await updateStatus.mutateAsync({ id: review.id, status, productId: review.productId })
      const actionPast = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'
      toast.success(`Review ${actionPast} successfully!`, { id: 'review-status' })
    } catch (error) {
      toast.error('Failed to update review status. Please try again.', { id: 'review-status' })
    }
  }

  const handleDelete = async (review: Review) => {
    if (!confirm(`Are you sure you want to delete this review by ${review.userName}? This action cannot be undone.`)) {
      return
    }
    
    toast.loading('Deleting review...', { id: 'delete-review' })
    
    try {
      await deleteReview.mutateAsync({ id: review.id, productId: review.productId })
      toast.success('Review deleted successfully!', { id: 'delete-review' })
    } catch (error) {
      toast.error('Failed to delete review. Please try again.', { id: 'delete-review' })
    }
  }

  const getStatusColor = (status: Review['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-yellow-100 text-yellow-700'
    }
  }

  const pendingReviews = reviews?.filter(r => r.status === 'pending') || []
  const approvedReviews = reviews?.filter(r => r.status === 'approved') || []
  const rejectedReviews = reviews?.filter(r => r.status === 'rejected') || []

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl font-semibold">Admin • Review Moderation</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded border">
          <div className="text-xl sm:text-2xl font-bold">{reviews?.length || 0}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Reviews</div>
        </div>
        <div className="bg-yellow-50 p-3 sm:p-4 rounded border">
          <div className="text-xl sm:text-2xl font-bold text-yellow-700">{pendingReviews.length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded border">
          <div className="text-xl sm:text-2xl font-bold text-green-700">{approvedReviews.length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-red-50 p-3 sm:p-4 rounded border">
          <div className="text-xl sm:text-2xl font-bold text-red-700">{rejectedReviews.length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading reviews..." />
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Reviews</h3>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Failed to load reviews'}
          </p>
          <p className="text-red-600 text-sm mt-2">
            Please check your Firestore security rules and ensure the 'reviews' collection exists.
          </p>
        </div>
      )}
      
      {!isLoading && !error && reviews && reviews.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-gray-800 font-medium mb-2">No Reviews Found</h3>
          <p className="text-gray-600 text-sm">
            No reviews have been submitted yet. Reviews will appear here once customers start submitting them.
          </p>
        </div>
      )}
      
      {!isLoading && !error && reviews && reviews.length > 0 && (
        <div className="space-y-6">
          {/* Pending Reviews */}
          {pendingReviews.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-yellow-700">
                Pending Reviews ({pendingReviews.length})
              </h2>
              <div className="space-y-4">
                {pendingReviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Reviews */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              All Reviews ({reviews.length})
            </h2>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-3 text-left text-sm font-medium">Product</th>
                    <th className="border p-3 text-left text-sm font-medium">User</th>
                    <th className="border p-3 text-left text-sm font-medium">Rating</th>
                    <th className="border p-3 text-left text-sm font-medium">Review</th>
                    <th className="border p-3 text-left text-sm font-medium">Status</th>
                    <th className="border p-3 text-left text-sm font-medium">Date</th>
                    <th className="border p-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td className="border p-3">
                        <div className="font-medium text-sm">ID: {review.productId.slice(0, 12)}...</div>
                      </td>
                      <td className="border p-3">
                        <div className="text-sm">{review.userName}</div>
                        {review.verified && (
                          <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                      </td>
                      <td className="border p-3">
                        <div className="flex items-center">
                          <span className="text-yellow-400 text-base">★</span>
                          <span className="ml-1 text-sm">{review.rating}</span>
                        </div>
                      </td>
                      <td className="border p-3 max-w-xs">
                        {review.comment && (
                          <div className="text-sm text-gray-600 line-clamp-2">{review.comment}</div>
                        )}
                      </td>
                      <td className="border p-3">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(review.status)}`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="border p-3 text-sm">
                        {review.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="border p-3">
                        <div className="flex gap-2">
                          {review.status !== 'approved' && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleStatusUpdate(review, 'approved')}
                              disabled={updateStatus.isPending}
                            >
                              Approve
                            </Button>
                          )}
                          {review.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleStatusUpdate(review, 'rejected')}
                              disabled={updateStatus.isPending}
                            >
                              Reject
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDelete(review)}
                            disabled={deleteReview.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">by {review.userName}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>
                  </div>
                  
                  {review.verified && (
                    <div className="mb-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    </div>
                  )}
                  
                  {review.comment && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.comment}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Product ID: {review.productId.slice(0, 12)}... • {review.createdAt?.toDate?.()?.toLocaleDateString()}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {review.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleStatusUpdate(review, 'approved')}
                        disabled={updateStatus.isPending}
                        className="flex-1 min-w-[80px]"
                      >
                        Approve
                      </Button>
                    )}
                    {review.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleStatusUpdate(review, 'rejected')}
                        disabled={updateStatus.isPending}
                        className="flex-1 min-w-[80px]"
                      >
                        Reject
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(review)}
                      disabled={deleteReview.isPending}
                      className="flex-1 min-w-[80px]"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ReviewCard: React.FC<{
  review: Review
  onStatusUpdate: (review: Review, status: Review['status']) => void
  onDelete: (review: Review) => void
  getStatusColor: (status: Review['status']) => string
}> = ({ review, onStatusUpdate, onDelete, getStatusColor }) => {
  return (
    <div className="bg-white border rounded p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-600">by {review.userName}</span>
            {review.verified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Verified Purchase
              </span>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(review.status)}`}>
          {review.status}
        </span>
      </div>
      
      {review.comment && (
        <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.comment}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Product ID: {review.productId} • {review.createdAt?.toDate?.()?.toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="success"
            onClick={() => onStatusUpdate(review, 'approved')}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onStatusUpdate(review, 'rejected')}
          >
            Reject
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onDelete(review)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReviewsAdminPage
