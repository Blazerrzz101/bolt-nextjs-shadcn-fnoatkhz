import '../../../lib/complete-polyfills.js';
import supabase from '../../../lib/supabase-client';
import { v4 as uuidv4 } from 'uuid';

// Mock reviews data for development/testing
let mockReviews = {};

// Import mock products to ensure we have all product IDs
import mockProducts from '../../../mock/products.json';

// Initialize mock reviews for each product
for (const product of mockProducts) {
  if (!mockReviews[product.id]) {
    mockReviews[product.id] = [];
  }
}

// Add some sample reviews to the mock data
mockReviews['prod_1'] = [
  {
    id: 'rev_1',
    productId: 'prod_1',
    userId: 'user_1',
    username: 'John Doe',
    rating: 4.5,
    comment: 'Great product, very comfortable chair!',
    createdAt: '2023-06-15T12:00:00Z',
    updatedAt: '2023-06-15T12:00:00Z'
  },
  {
    id: 'rev_2',
    productId: 'prod_1',
    userId: 'user_2',
    username: 'Jane Smith',
    rating: 5,
    comment: 'Best office chair I\'ve ever used. Great support for long work days.',
    createdAt: '2023-06-20T14:30:00Z',
    updatedAt: '2023-06-20T14:30:00Z'
  }
];

mockReviews['prod_2'] = [
  {
    id: 'rev_3',
    productId: 'prod_2',
    userId: 'user_3',
    username: 'Mike Johnson',
    rating: 3.5,
    comment: 'Good smart home assistant, but has some connectivity issues.',
    createdAt: '2023-07-05T09:15:00Z',
    updatedAt: '2023-07-05T09:15:00Z'
  }
];

// Check if we're in mock mode
const isMockMode = () => {
  return process.env.MOCK_DB === 'true';
};

// Helper function to broadcast a review update in real-time
const broadcastReviewUpdate = async (productId, review, action = 'create') => {
  if (isMockMode()) return;
  
  try {
    await supabase
      .channel('global-updates')
      .send({
        type: 'broadcast',
        event: 'global-update',
        payload: {
          type: 'review-update',
          action,
          productId,
          review
        }
      });
  } catch (error) {
    console.error('Error broadcasting review update:', error);
  }
};

// GET handler to retrieve reviews for a product
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    
    if (!productId) {
      return Response.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Handle database or mock mode
    if (isMockMode()) {
      // Get reviews for the product from mock data
      const reviews = mockReviews[productId] || [];
      
      return Response.json({
        success: true,
        data: {
          reviews,
          totalCount: reviews.length,
          averageRating: reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0
        }
      });
    } else {
      // Real database mode
      const { data, error } = await supabase
        .from('reviews')
        .select('id, product_id, user_id, username, rating, comment, created_at, updated_at')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Database error:', error);
        return Response.json(
          { success: false, error: 'Error fetching reviews' },
          { status: 500 }
        );
      }
      
      // Transform the data to match our format
      const reviews = data.map(review => ({
        id: review.id,
        productId: review.product_id,
        userId: review.user_id,
        username: review.username,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at
      }));
      
      // Calculate average rating
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;
      
      return Response.json({
        success: true,
        data: {
          reviews,
          totalCount: reviews.length,
          averageRating
        }
      });
    }
  } catch (error) {
    console.error('Reviews API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST handler to add a new review
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, userId, username, rating, comment } = body;
    
    if (!productId) {
      return Response.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return Response.json(
        { success: false, error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }
    
    const actualUserId = userId || `anonymous-${uuidv4()}`;
    const displayName = username || 'Anonymous User';
    const now = new Date().toISOString();
    
    // Handle database or mock mode
    if (isMockMode()) {
      // Create new review
      const newReview = {
        id: `rev_${uuidv4()}`,
        productId,
        userId: actualUserId,
        username: displayName,
        rating,
        comment: comment || '',
        createdAt: now,
        updatedAt: now
      };
      
      // Initialize the reviews array if it doesn't exist
      if (!mockReviews[productId]) {
        mockReviews[productId] = [];
      }
      
      // Add the review to the mock data
      mockReviews[productId].push(newReview);
      
      return Response.json({
        success: true,
        data: {
          review: newReview
        }
      });
    } else {
      // Real database mode
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: actualUserId,
          username: displayName,
          rating,
          comment: comment || '',
        })
        .select()
        .single();
        
      if (error) {
        console.error('Database error:', error);
        return Response.json(
          { success: false, error: 'Error creating review' },
          { status: 500 }
        );
      }
      
      // Transform the data to match our format
      const newReview = {
        id: data.id,
        productId: data.product_id,
        userId: data.user_id,
        username: data.username,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Broadcast the new review for real-time updates
      await broadcastReviewUpdate(productId, newReview, 'create');
      
      return Response.json({
        success: true,
        data: {
          review: newReview
        }
      });
    }
  } catch (error) {
    console.error('Reviews API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT handler to update an existing review
export async function PUT(request) {
  try {
    const body = await request.json();
    const { reviewId, rating, comment } = body;
    
    if (!reviewId) {
      return Response.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }
    
    // Handle database or mock mode
    if (isMockMode()) {
      // Find the review in mock data
      let foundReview = null;
      let productId = null;
      
      // Search through all products for the review
      for (const [prodId, reviews] of Object.entries(mockReviews)) {
        const review = reviews.find(r => r.id === reviewId);
        if (review) {
          foundReview = review;
          productId = prodId;
          break;
        }
      }
      
      if (!foundReview) {
        return Response.json(
          { success: false, error: 'Review not found' },
          { status: 404 }
        );
      }
      
      // Update the review
      const now = new Date().toISOString();
      if (rating !== undefined) foundReview.rating = rating;
      if (comment !== undefined) foundReview.comment = comment;
      foundReview.updatedAt = now;
      
      return Response.json({
        success: true,
        data: {
          review: foundReview
        }
      });
    } else {
      // Real database mode
      const updateData = {};
      if (rating !== undefined) updateData.rating = rating;
      if (comment !== undefined) updateData.comment = comment;
      
      const { data, error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId)
        .select()
        .single();
        
      if (error) {
        console.error('Database error:', error);
        return Response.json(
          { success: false, error: 'Error updating review' },
          { status: 500 }
        );
      }
      
      if (!data) {
        return Response.json(
          { success: false, error: 'Review not found' },
          { status: 404 }
        );
      }
      
      // Transform the data to match our format
      const updatedReview = {
        id: data.id,
        productId: data.product_id,
        userId: data.user_id,
        username: data.username,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Broadcast the updated review for real-time updates
      await broadcastReviewUpdate(updatedReview.productId, updatedReview, 'update');
      
      return Response.json({
        success: true,
        data: {
          review: updatedReview
        }
      });
    }
  } catch (error) {
    console.error('Reviews API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a review
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const reviewId = url.searchParams.get('reviewId');
    
    if (!reviewId) {
      return Response.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }
    
    // Handle database or mock mode
    if (isMockMode()) {
      // Find the review in mock data
      let foundReview = null;
      let productId = null;
      let reviewIndex = -1;
      
      // Search through all products for the review
      for (const [prodId, reviews] of Object.entries(mockReviews)) {
        const index = reviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
          foundReview = reviews[index];
          productId = prodId;
          reviewIndex = index;
          break;
        }
      }
      
      if (!foundReview) {
        return Response.json(
          { success: false, error: 'Review not found' },
          { status: 404 }
        );
      }
      
      // Remove the review from mock data
      mockReviews[productId].splice(reviewIndex, 1);
      
      return Response.json({
        success: true,
        data: {
          message: 'Review deleted successfully',
          reviewId
        }
      });
    } else {
      // First get the review to know the product ID for broadcasting
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id, product_id')
        .eq('id', reviewId)
        .single();
      
      // Real database mode
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
        
      if (error) {
        console.error('Database error:', error);
        return Response.json(
          { success: false, error: 'Error deleting review' },
          { status: 500 }
        );
      }
      
      // Broadcast the deletion for real-time updates
      if (reviewData) {
        await broadcastReviewUpdate(
          reviewData.product_id, 
          { id: reviewId, productId: reviewData.product_id }, 
          'delete'
        );
      }
      
      return Response.json({
        success: true,
        data: {
          message: 'Review deleted successfully',
          reviewId
        }
      });
    }
  } catch (error) {
    console.error('Reviews API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 