// Import polyfills first
import '../../../lib/polyfills.js';

export async function GET(request) {
  try {
    const products = [
      { id: 1, name: "Product 1", description: "Description 1", upvotes: 5, downvotes: 2, score: 3 },
      { id: 2, name: "Product 2", description: "Description 2", upvotes: 10, downvotes: 1, score: 9 },
      { id: 3, name: "Product 3", description: "Description 3", upvotes: 8, downvotes: 4, score: 4 }
    ];
    
    return new Response(
      JSON.stringify({
        success: true,
        data: products
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Products API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An error occurred",
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
