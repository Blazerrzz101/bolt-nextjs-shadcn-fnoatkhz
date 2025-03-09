import '../../../lib/complete-polyfills.js';
import supabase from '../../../lib/supabase-client';
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
    
    // Handle database or mock mode
    if (isMockMode()) {
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
    } else {
      // Real database mode
      
      // Get period start date
      const getStartDate = () => {
        const now = new Date();
        switch (period) {
          case 'day':
            return new Date(now.setDate(now.getDate() - 1)).toISOString();
          case 'week':
            return new Date(now.setDate(now.getDate() - 7)).toISOString();
          case 'month':
            return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
          case 'year':
            return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
          case 'all':
          default:
            return null; // No date filter
        }
      };
      
      const startDate = getStartDate();
      
      // Get products with their vote counts
      let productsQuery = supabase.from('products').select('*');
      
      if (category) {
        productsQuery = productsQuery.eq('category', category);
      }
      
      const { data: products, error: productsError } = await productsQuery;
      
      if (productsError) {
        console.error('Database error:', productsError);
        return Response.json(
          { success: false, error: 'Error fetching products data' },
          { status: 500 }
        );
      }
      
      // Get reviews data
      let reviewsQuery = supabase
        .from('reviews')
        .select('id, product_id, user_id, username, rating, comment, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (startDate) {
        reviewsQuery = reviewsQuery.gte('created_at', startDate);
      }
      
      const { data: reviews, error: reviewsError } = await reviewsQuery;
      
      if (reviewsError) {
        console.error('Database error:', reviewsError);
        return Response.json(
          { success: false, error: 'Error fetching reviews data' },
          { status: 500 }
        );
      }
      
      // Get trend data
      let trendQuery = supabase
        .from('analytics_events')
        .select('date, event_type, count')
        .order('date', { ascending: true });
        
      if (startDate) {
        trendQuery = trendQuery.gte('date', startDate);
      }
      
      const { data: trendRawData, error: trendError } = await trendQuery;
      
      // Process trend data
      const trendMap = {};
      
      if (!trendError && trendRawData) {
        trendRawData.forEach(item => {
          const dateStr = item.date.split('T')[0];
          if (!trendMap[dateStr]) {
            trendMap[dateStr] = { date: dateStr, votes: 0, views: 0, reviews: 0 };
          }
          
          switch (item.event_type) {
            case 'vote':
              trendMap[dateStr].votes += item.count;
              break;
            case 'view':
              trendMap[dateStr].views += item.count;
              break;
            case 'review':
              trendMap[dateStr].reviews += item.count;
              break;
          }
        });
      }
      
      const trendData = Object.values(trendMap).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      // Calculate summary stats
      const totalVotes = products.reduce((sum, product) => sum + (product.upvotes || 0) + (product.downvotes || 0), 0);
      const totalUpvotes = products.reduce((sum, product) => sum + (product.upvotes || 0), 0);
      const totalDownvotes = products.reduce((sum, product) => sum + (product.downvotes || 0), 0);
      
      const totalReviews = reviews.length;
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      
      // Find top products by score
      const topProducts = [...products]
        .sort((a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)))
        .slice(0, 5)
        .map(product => ({
          id: product.id,
          name: product.name,
          score: (product.upvotes || 0) - (product.downvotes || 0),
          upvotes: product.upvotes || 0,
          downvotes: product.downvotes || 0,
        }));
        
      // Generate category distribution
      const categoryMap = {};
      products.forEach(product => {
        if (!categoryMap[product.category]) {
          categoryMap[product.category] = {
            count: 0,
            votes: 0,
            score: 0,
          };
        }
        categoryMap[product.category].count++;
        categoryMap[product.category].votes += (product.upvotes || 0) + (product.downvotes || 0);
        categoryMap[product.category].score += (product.upvotes || 0) - (product.downvotes || 0);
      });
      
      const categoryDistribution = Object.entries(categoryMap).map(([name, data]) => ({
        name,
        count: data.count,
        votes: data.votes,
        score: data.score,
        percentage: Math.round((data.count / (products.length || 1)) * 100),
      }));
      
      // Process recent reviews to include product name
      const productNameMap = products.reduce((map, product) => {
        map[product.id] = product.name;
        return map;
      }, {});
      
      const recentReviews = reviews.map(review => ({
        id: review.id,
        productId: review.product_id,
        productName: productNameMap[review.product_id] || 'Unknown Product',
        userId: review.user_id,
        username: review.username,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
      }));
      
      // Build response
      return Response.json({
        success: true,
        data: {
          summary: {
            totalProducts: products.length,
            totalVotes,
            totalUpvotes,
            totalDownvotes,
            voteRatio: totalUpvotes / (totalVotes || 1),
            averageScore: (totalUpvotes - totalDownvotes) / (products.length || 1),
            totalReviews,
            averageRating,
          },
          topProducts,
          categoryDistribution,
          trendData,
          recentReviews
        }
      });
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 