// Import polyfills first
import '../../../lib/polyfills.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, voteType, clientId } = body;
    
    if (!productId || !voteType || !clientId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required fields"
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Vote recorded",
        data: {
          productId,
          voteType,
          hasVoted: true
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Vote API error:", error);
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

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const clientId = url.searchParams.get('clientId');
    
    if (!productId || !clientId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required parameters"
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          productId: parseInt(productId),
          hasVoted: false,
          voteType: null
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Vote status API error:", error);
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
