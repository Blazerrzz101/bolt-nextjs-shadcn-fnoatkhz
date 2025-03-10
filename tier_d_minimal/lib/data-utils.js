import { isBrowser } from './polyfills';
import products from '../mock/products.json';

// In-memory storage for votes (client-side only)
const voteStore = new Map();
const reviewStore = new Map();

// Get all products, optionally filtered by category
export function getProducts(category = null) {
  let result = [...products];
  
  // Apply category filter if specified
  if (category) {
    result = result.filter(product => product.category === category);
  }
  
  // Sort by score (descending)
  result.sort((a, b) => b.score - a.score);
  
  return result;
}

// Get a single product by ID
export function getProductById(productId) {
  return products.find(product => product.id === productId) || null;
}

// Get product categories
export function getCategories() {
  const categories = Array.from(new Set(products.map(product => product.category)));
  return categories.map(name => ({ name }));
}

// Get votes for a product
export function getVotes(productId, clientId = null) {
  const key = clientId ? `${productId}-${clientId}` : productId;
  return voteStore.get(key) || null;
}

// Submit a vote
export function submitVote(productId, voteType, clientId) {
  // Find the product
  const product = getProductById(productId);
  if (!product) return { success: false, error: 'Product not found' };
  
  // Generate key for the vote
  const key = `${productId}-${clientId}`;
  
  // Check if the user has already voted
  const existingVote = voteStore.get(key);
  
  // Handle vote logic
  if (existingVote && existingVote.voteType === voteType) {
    // User is voting the same way again, so remove the vote
    voteStore.delete(key);
    
    // Update product counts
    if (voteType === 1) {
      product.upvotes--;
    } else {
      product.downvotes--;
    }
  } else if (existingVote) {
    // User is changing their vote
    // Revert previous vote
    if (existingVote.voteType === 1) {
      product.upvotes--;
    } else {
      product.downvotes--;
    }
    
    // Apply new vote
    if (voteType === 1) {
      product.upvotes++;
    } else {
      product.downvotes++;
    }
    
    // Update vote store
    voteStore.set(key, { productId, voteType, clientId });
  } else {
    // New vote
    if (voteType === 1) {
      product.upvotes++;
    } else {
      product.downvotes--;
    }
    
    // Save to vote store
    voteStore.set(key, { productId, voteType, clientId });
  }
  
  // Recalculate score
  product.score = product.upvotes - product.downvotes;
  
  return { 
    success: true, 
    data: {
      product,
      voteStatus: { hasVoted: !!voteStore.get(key), voteType: voteStore.get(key)?.voteType || null }
    }
  };
}

// Get all reviews for a product
export function getReviews(productId) {
  // Filter reviews for the specified product
  const productReviews = Array.from(reviewStore.values())
    .filter(review => review.productId === productId);
  
  // Sort by date (newest first)
  productReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return productReviews;
}

// Add a review
export function addReview(review) {
  const key = review.id;
  reviewStore.set(key, review);
  return { success: true, data: review };
}

// Mock analytics data
export function getAnalytics(period = 'week', category = null) {
  // Filter products by category if specified
  const filteredProducts = category 
    ? products.filter(product => product.category === category) 
    : products;
  
  // Calculate summary stats
  const totalVotes = filteredProducts.reduce((sum, product) => sum + product.upvotes + product.downvotes, 0);
  const totalUpvotes = filteredProducts.reduce((sum, product) => sum + product.upvotes, 0);
  const totalDownvotes = filteredProducts.reduce((sum, product) => sum + product.downvotes, 0);
  
  // Find top products by score
  const topProducts = [...filteredProducts]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(product => ({
      id: product.id,
      name: product.name,
      score: product.upvotes - product.downvotes,
      upvotes: product.upvotes,
      downvotes: product.downvotes,
    }));
    
  // Generate category distribution
  const categoryMap = {};
  filteredProducts.forEach(product => {
    if (!categoryMap[product.category]) {
      categoryMap[product.category] = {
        count: 0,
        votes: 0,
        score: 0,
      };
    }
    categoryMap[product.category].count++;
    categoryMap[product.category].votes += product.upvotes + product.downvotes;
    categoryMap[product.category].score += product.upvotes - product.downvotes;
  });
  
  const categoryDistribution = Object.entries(categoryMap).map(([name, data]) => ({
    name,
    count: data.count,
    votes: data.votes,
    score: data.score,
    percentage: Math.round((data.count / filteredProducts.length) * 100),
  }));
  
  // Generate mock trend data for the selected period
  const now = new Date();
  const trendData = [];
  
  let days = 7;
  if (period === 'day') days = 1;
  if (period === 'month') days = 30;
  if (period === 'year') days = 365;
  if (period === 'all') days = 90;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // Generate random activity values
    const votesCount = Math.floor(Math.random() * 50) + 5;
    const viewsCount = votesCount * (Math.floor(Math.random() * 5) + 2);
    const reviewsCount = Math.floor(Math.random() * 5);
    
    trendData.unshift({
      date: date.toISOString().split('T')[0],
      votes: votesCount,
      views: viewsCount,
      reviews: reviewsCount,
    });
  }
  
  return {
    summary: {
      totalProducts: filteredProducts.length,
      totalVotes,
      totalUpvotes,
      totalDownvotes,
      voteRatio: totalUpvotes / (totalVotes || 1),
      averageScore: (totalUpvotes - totalDownvotes) / (filteredProducts.length || 1),
      totalReviews: reviewStore.size,
      averageRating: 4.2, // Mock average rating
    },
    topProducts,
    categoryDistribution,
    trendData,
    recentReviews: Array.from(reviewStore.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  };
} 