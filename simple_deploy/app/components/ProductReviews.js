import { useState } from 'react';
import { useRealTimeReviews } from '../../hooks/useRealTimeReviews';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

/**
 * ProductReviews component with real-time updates
 * Displays reviews for a product and allows users to add new reviews
 */
export default function ProductReviews({ productId, className = '' }) {
  const {
    reviews,
    totalCount,
    averageRating,
    loading,
    error,
    submitReview,
    updateReview,
    deleteReview,
    userId
  } = useRealTimeReviews(productId);
  
  // State for new review form
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    username: '',
  });
  
  // State for review being edited
  const [editingReview, setEditingReview] = useState(null);
  
  // Handle rating change in new review form
  const handleRatingChange = (value) => {
    setNewReview(prev => ({ ...prev, rating: value }));
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle new review submission
  const handleSubmit = (e) => {
    e.preventDefault();
    submitReview(newReview);
    setNewReview({
      rating: 5,
      comment: '',
      username: newReview.username, // Keep the username for future reviews
    });
  };
  
  // Start editing a review
  const handleStartEdit = (review) => {
    setEditingReview({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
    });
  };
  
  // Cancel editing a review
  const handleCancelEdit = () => {
    setEditingReview(null);
  };
  
  // Save edited review
  const handleSaveEdit = () => {
    if (!editingReview) return;
    
    updateReview({
      reviewId: editingReview.id,
      rating: editingReview.rating,
      comment: editingReview.comment,
    });
    
    setEditingReview(null);
  };
  
  // Handle changes in edit form
  const handleEditChange = (field, value) => {
    setEditingReview(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with average rating */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Customer Reviews</h2>
        <div className="flex items-center">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {averageRating.toFixed(1)} out of 5 ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add new review form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Write a Review</h3>
        
        {/* Rating selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="focus:outline-none"
              >
                {star <= newReview.rating ? (
                  <StarIcon className="h-6 w-6 text-yellow-400" />
                ) : (
                  <StarIconOutline className="h-6 w-6 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Username field */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name (optional)
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={newReview.username}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your name"
          />
        </div>
        
        {/* Comment field */}
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Review
          </label>
          <textarea
            name="comment"
            id="comment"
            value={newReview.comment}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write your review here..."
          />
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
      
      {/* Reviews list */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">All Reviews</h3>
        
        {loading && reviews.length === 0 ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className={`bg-white p-4 rounded-lg border ${
                  review.isPending ? 'border-blue-300 bg-blue-50' : 
                  review.isUpdating ? 'border-yellow-300 bg-yellow-50' : 
                  'border-gray-200'
                }`}
              >
                {/* Review header with user and rating */}
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{review.username}</div>
                  <div className="flex items-center">
                    {editingReview && editingReview.id === review.id ? (
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleEditChange('rating', star)}
                            className="focus:outline-none"
                          >
                            {star <= editingReview.rating ? (
                              <StarIcon className="h-5 w-5 text-yellow-400" />
                            ) : (
                              <StarIconOutline className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-5 w-5 ${
                              star <= review.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Review date */}
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                  {review.updatedAt !== review.createdAt && 
                    ` (edited ${new Date(review.updatedAt).toLocaleDateString()})`}
                </div>
                
                {/* Review content */}
                {editingReview && editingReview.id === review.id ? (
                  <textarea
                    value={editingReview.comment}
                    onChange={(e) => handleEditChange('comment', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
                  />
                ) : (
                  <div className="text-gray-800">{review.comment}</div>
                )}
                
                {/* Edit/Delete controls - only shown for user's own reviews */}
                {review.userId === userId && (
                  <div className="mt-3 flex justify-end space-x-2">
                    {editingReview && editingReview.id === review.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-sm bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(review)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
                
                {/* Pending indicator */}
                {review.isPending && (
                  <div className="mt-2 text-xs text-blue-600">
                    Submitting review...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 