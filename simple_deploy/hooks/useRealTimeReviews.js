import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import supabase, { createReviewsChannel } from '../lib/supabase-client';

/**
 * Custom hook for real-time reviews functionality
 * Works with both Supabase real-time updates and REST API fallback
 */
export function useRealTimeReviews(productId) {
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    totalCount: 0,
    averageRating: 0,
    loading: true,
    error: null,
  });
  
  // Get or generate a user ID for anonymous reviews
  const [userId, setUserId] = useState(() => {
    // Try to get from localStorage if in browser environment
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('reviewer_user_id');
      if (storedUserId) return storedUserId;
      
      // Generate a new one if not found
      const newUserId = `anon-${uuidv4()}`;
      localStorage.setItem('reviewer_user_id', newUserId);
      return newUserId;
    }
    // Fallback for server-side rendering
    return null;
  });
  
  // Function to fetch reviews for a product
  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    
    try {
      setReviewsData(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(`/api/reviews?productId=${productId}`);
      const result = await response.json();
      
      if (result.success) {
        setReviewsData({
          reviews: result.data.reviews,
          totalCount: result.data.totalCount,
          averageRating: result.data.averageRating,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(result.error || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviewsData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch reviews',
      }));
    }
  }, [productId]);
  
  // Function to submit a new review
  const submitReview = useCallback(async ({ rating, comment, username }) => {
    if (!productId || !userId || !rating || rating < 1 || rating > 5) return;
    
    try {
      // Optimistic update - add the review temporarily with a pending state
      const tempReview = {
        id: `temp-${uuidv4()}`,
        productId,
        userId,
        username: username || 'You',
        rating,
        comment: comment || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPending: true
      };
      
      setReviewsData(prev => {
        const newReviews = [tempReview, ...prev.reviews];
        const newTotalCount = prev.totalCount + 1;
        const newTotal = prev.reviews.reduce((sum, review) => sum + review.rating, 0) + rating;
        const newAverage = newTotal / newTotalCount;
        
        return {
          ...prev,
          reviews: newReviews,
          totalCount: newTotalCount,
          averageRating: newAverage,
          loading: true,
        };
      });
      
      // Submit the review to the server
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId,
          username: username || 'Anonymous User',
          rating,
          comment: comment || '',
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Remove the temporary review and add the real one
        setReviewsData(prev => {
          const filteredReviews = prev.reviews.filter(r => r.id !== tempReview.id);
          return {
            ...prev,
            reviews: [result.data.review, ...filteredReviews],
            loading: false,
          };
        });
      } else {
        throw new Error(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Remove the temporary review and show error
      setReviewsData(prev => ({
        ...prev,
        reviews: prev.reviews.filter(r => !r.isPending),
        loading: false,
        error: error.message || 'Failed to submit review',
      }));
      
      // Refresh the reviews to ensure consistency
      fetchReviews();
    }
  }, [productId, userId, fetchReviews]);
  
  // Function to update a review
  const updateReview = useCallback(async ({ reviewId, rating, comment }) => {
    if (!reviewId) return;
    
    try {
      // Optimistic update
      setReviewsData(prev => {
        const updatedReviews = prev.reviews.map(review => {
          if (review.id === reviewId) {
            // Calculate the change in the total rating sum
            const oldRating = review.rating;
            const newRating = rating !== undefined ? rating : oldRating;
            const ratingDifference = newRating - oldRating;
            
            // Create updated review
            return {
              ...review,
              rating: newRating,
              comment: comment !== undefined ? comment : review.comment,
              updatedAt: new Date().toISOString(),
              isUpdating: true
            };
          }
          return review;
        });
        
        // Recalculate average if rating changed
        let newAverage = prev.averageRating;
        const reviewToUpdate = prev.reviews.find(r => r.id === reviewId);
        if (reviewToUpdate && rating !== undefined && rating !== reviewToUpdate.rating) {
          const oldTotal = prev.averageRating * prev.totalCount;
          const newTotal = oldTotal + (rating - reviewToUpdate.rating);
          newAverage = newTotal / prev.totalCount;
        }
        
        return {
          ...prev,
          reviews: updatedReviews,
          averageRating: newAverage,
          loading: true,
        };
      });
      
      // Make the API call
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          rating,
          comment,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update with the actual data from the server
        setReviewsData(prev => {
          const updatedReviews = prev.reviews.map(review => 
            review.id === reviewId 
              ? { ...result.data.review, isUpdating: false } 
              : review
          );
          
          return {
            ...prev,
            reviews: updatedReviews,
            loading: false,
          };
        });
      } else {
        throw new Error(result.error || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      
      // Revert the optimistic update
      fetchReviews();
      
      setReviewsData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update review',
      }));
    }
  }, [fetchReviews]);
  
  // Function to delete a review
  const deleteReview = useCallback(async (reviewId) => {
    if (!reviewId) return;
    
    try {
      // Find the review to be deleted
      const reviewToDelete = reviewsData.reviews.find(r => r.id === reviewId);
      if (!reviewToDelete) return;
      
      // Optimistic update - remove the review
      setReviewsData(prev => {
        const filteredReviews = prev.reviews.filter(r => r.id !== reviewId);
        const newTotalCount = Math.max(0, prev.totalCount - 1);
        
        // Calculate new average rating
        let newAverage = 0;
        if (newTotalCount > 0) {
          const newTotal = prev.reviews
            .filter(r => r.id !== reviewId)
            .reduce((sum, review) => sum + review.rating, 0);
          newAverage = newTotal / newTotalCount;
        }
        
        return {
          ...prev,
          reviews: filteredReviews,
          totalCount: newTotalCount,
          averageRating: newAverage,
          loading: true,
        };
      });
      
      // Make the API call
      const response = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update is already done optimistically
        setReviewsData(prev => ({
          ...prev,
          loading: false,
        }));
      } else {
        throw new Error(result.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      
      // Revert the optimistic update
      fetchReviews();
      
      setReviewsData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to delete review',
      }));
    }
  }, [reviewsData.reviews, fetchReviews]);
  
  // Handle real-time updates
  useEffect(() => {
    if (!productId) return;
    
    // Fetch initial reviews
    fetchReviews();
    
    // Set up real-time subscription
    const channel = createReviewsChannel(productId, (payload) => {
      if (payload.eventType === 'INSERT') {
        // A new review was added
        const newReview = {
          id: payload.new.id,
          productId: payload.new.product_id,
          userId: payload.new.user_id,
          username: payload.new.username,
          rating: payload.new.rating,
          comment: payload.new.comment,
          createdAt: payload.new.created_at,
          updatedAt: payload.new.updated_at
        };
        
        setReviewsData(prev => {
          // Skip if we already have this review (likely from our optimistic update)
          if (prev.reviews.some(r => r.id === newReview.id)) return prev;
          
          const newReviews = [newReview, ...prev.reviews.filter(r => !r.isPending)];
          const newTotalCount = prev.totalCount + 1;
          const newTotal = prev.reviews.reduce((sum, r) => sum + r.rating, 0) + newReview.rating;
          const newAverage = newTotal / newTotalCount;
          
          return {
            ...prev,
            reviews: newReviews,
            totalCount: newTotalCount,
            averageRating: newAverage,
          };
        });
      } else if (payload.eventType === 'UPDATE') {
        // A review was updated
        const updatedReview = {
          id: payload.new.id,
          productId: payload.new.product_id,
          userId: payload.new.user_id,
          username: payload.new.username,
          rating: payload.new.rating,
          comment: payload.new.comment,
          createdAt: payload.new.created_at,
          updatedAt: payload.new.updated_at
        };
        
        setReviewsData(prev => {
          const oldReview = prev.reviews.find(r => r.id === updatedReview.id);
          if (!oldReview) return prev;
          
          const updatedReviews = prev.reviews.map(r => 
            r.id === updatedReview.id ? updatedReview : r
          );
          
          // Recalculate average if rating changed
          let newAverage = prev.averageRating;
          if (oldReview.rating !== updatedReview.rating) {
            const oldTotal = prev.averageRating * prev.totalCount;
            const newTotal = oldTotal + (updatedReview.rating - oldReview.rating);
            newAverage = newTotal / prev.totalCount;
          }
          
          return {
            ...prev,
            reviews: updatedReviews,
            averageRating: newAverage,
          };
        });
      } else if (payload.eventType === 'DELETE') {
        // A review was deleted
        const deletedReviewId = payload.old.id;
        
        setReviewsData(prev => {
          const deletedReview = prev.reviews.find(r => r.id === deletedReviewId);
          if (!deletedReview) return prev;
          
          const filteredReviews = prev.reviews.filter(r => r.id !== deletedReviewId);
          const newTotalCount = Math.max(0, prev.totalCount - 1);
          
          // Calculate new average rating
          let newAverage = 0;
          if (newTotalCount > 0) {
            const newTotal = filteredReviews.reduce((sum, r) => sum + r.rating, 0);
            newAverage = newTotal / newTotalCount;
          }
          
          return {
            ...prev,
            reviews: filteredReviews,
            totalCount: newTotalCount,
            averageRating: newAverage,
          };
        });
      }
    });
    
    // Subscribe to the global broadcast channel for real-time updates
    const globalChannel = supabase
      .channel('global-updates')
      .on('broadcast', { event: 'global-update' }, (payload) => {
        if (payload.payload?.type === 'review-update' && 
            payload.payload.productId === productId) {
          
          const { action, review } = payload.payload;
          
          if (action === 'create') {
            // A new review was added
            setReviewsData(prev => {
              // Skip if we already have this review
              if (prev.reviews.some(r => r.id === review.id)) return prev;
              
              const newReviews = [review, ...prev.reviews.filter(r => !r.isPending)];
              const newTotalCount = prev.totalCount + 1;
              const newTotal = prev.reviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
              const newAverage = newTotal / newTotalCount;
              
              return {
                ...prev,
                reviews: newReviews,
                totalCount: newTotalCount,
                averageRating: newAverage,
              };
            });
          } else if (action === 'update') {
            // A review was updated
            setReviewsData(prev => {
              const oldReview = prev.reviews.find(r => r.id === review.id);
              if (!oldReview) return prev;
              
              const updatedReviews = prev.reviews.map(r => 
                r.id === review.id ? review : r
              );
              
              // Recalculate average if rating changed
              let newAverage = prev.averageRating;
              if (oldReview.rating !== review.rating) {
                const oldTotal = prev.averageRating * prev.totalCount;
                const newTotal = oldTotal + (review.rating - oldReview.rating);
                newAverage = newTotal / prev.totalCount;
              }
              
              return {
                ...prev,
                reviews: updatedReviews,
                averageRating: newAverage,
              };
            });
          } else if (action === 'delete') {
            // A review was deleted
            setReviewsData(prev => {
              const deletedReview = prev.reviews.find(r => r.id === review.id);
              if (!deletedReview) return prev;
              
              const filteredReviews = prev.reviews.filter(r => r.id !== review.id);
              const newTotalCount = Math.max(0, prev.totalCount - 1);
              
              // Calculate new average rating
              let newAverage = 0;
              if (newTotalCount > 0) {
                const newTotal = filteredReviews.reduce((sum, r) => sum + r.rating, 0);
                newAverage = newTotal / newTotalCount;
              }
              
              return {
                ...prev,
                reviews: filteredReviews,
                totalCount: newTotalCount,
                averageRating: newAverage,
              };
            });
          }
        }
      })
      .subscribe();
    
    // Clean up subscriptions when unmounting
    return () => {
      channel.unsubscribe();
      globalChannel.unsubscribe();
    };
  }, [productId, fetchReviews]);
  
  return {
    reviews: reviewsData.reviews,
    totalCount: reviewsData.totalCount,
    averageRating: reviewsData.averageRating,
    loading: reviewsData.loading,
    error: reviewsData.error,
    fetchReviews,
    submitReview,
    updateReview,
    deleteReview,
    userId,
  };
} 