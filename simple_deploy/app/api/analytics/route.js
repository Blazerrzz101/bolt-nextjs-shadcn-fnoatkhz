import '../../../lib/complete-polyfills.js';
import mockProducts from '../../../mock/products.json';

// Check if we're in mock mode
const isMockMode = () => {
  return process.env.MOCK_DB === 'true';
};

// GET handler to retrieve analytics data
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'week'; // day, week, month, year, all
    const category = url.searchParams.get('category');
    
    // Generate mock analytics based on mock products
    const totalVotes = mockProducts.reduce((sum, product) => sum + product.upvotes + product.downvotes, 0);
    const totalUpvotes = mockProducts.reduce((sum, product) => sum + product.upvotes, 0);
    const totalDownvotes = mockProducts.reduce((sum, product) => sum + product.downvotes, 0);
    
    // Find top products by votes
    const topProducts = [...mockProducts]
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
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
    mockProducts.forEach(product => {
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
      percentage: Math.round((data.count / mockProducts.length) * 100),
    }));
    
    // Generate mock trend data for the selected period
    const now = new Date();
    const trendData = [];
    
    let days = 7;
    if (period === 'day') days = 1;
    if (period === 'month') days = 30;
    if (period === 'year') days = 365;
    if (period === 'all') days = 730;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Generate random activity values
      const votesCount = Math.floor(Math.random() * 100) + 10;
      const viewsCount = votesCount * (Math.floor(Math.random() * 5) + 3);
      const reviewsCount = Math.floor(Math.random() * 10);
      
      trendData.unshift({
        date: date.toISOString().split('T')[0],
        votes: votesCount,
        views: viewsCount,
        reviews: reviewsCount,
      });
    }
    
    // Generate reviews data
    const mockReviews = [
      {
        id: 'rev_1',
        productId: 'prod_1',
        productName: 'Premium Ergonomic Chair',
        username: 'John Doe',
        rating: 4.5,
        comment: 'Great product!',
        createdAt: '2023-06-15T12:00:00Z',
      },
      {
        id: 'rev_2',
        productId: 'prod_1',
        productName: 'Premium Ergonomic Chair',
        username: 'Jane Smith',
        rating: 5,
        comment: 'Best chair ever!',
        createdAt: '2023-06-20T14:30:00Z',
      },
      {
        id: 'rev_3',
        productId: 'prod_2',
        productName: 'Smart Home Assistant Hub',
        username: 'Mike Johnson',
        rating: 3.5,
        comment: 'Good but has issues',
        createdAt: '2023-07-05T09:15:00Z',
      }
    ];
    
    // Build response
    return Response.json({
      success: true,
      data: {
        summary: {
          totalProducts: mockProducts.length,
          totalVotes,
          totalUpvotes,
          totalDownvotes,
          voteRatio: totalUpvotes / (totalVotes || 1),
          averageScore: (totalUpvotes - totalDownvotes) / (mockProducts.length || 1),
          totalReviews: mockReviews.length,
          averageRating: 4.3, // Mock average rating
        },
        topProducts,
        categoryDistribution,
        trendData,
        recentReviews: mockReviews
      }
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return Response.json(
      { success: false, error: error.message || 'An error occurred fetching analytics data' },
      { status: 500 }
    );
  }
} 