// Import polyfills first
import '../../../lib/complete-polyfills.js';

// GET handler
export async function GET(request) {
  try {
    // Generate mock activities data
    const activities = [
      {
        id: '1',
        type: 'vote',
        productId: 'prod_1',
        productName: 'Premium Ergonomic Chair',
        userId: 'user_1',
        username: 'John Doe',
        action: 'upvote',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        type: 'review',
        productId: 'prod_2',
        productName: 'Smart Home Assistant Hub',
        userId: 'user_2',
        username: 'Jane Smith',
        action: 'add',
        rating: 4.5,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: '3',
        type: 'vote',
        productId: 'prod_3',
        productName: 'Wireless Noise-Cancelling Headphones',
        userId: 'user_3',
        username: 'Mike Johnson',
        action: 'downvote',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
      }
    ];

    return Response.json({
      success: true,
      data: {
        activities
      }
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 