import { getVotes, submitVote } from '../../../lib/data-utils';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  const clientId = url.searchParams.get('clientId');
  
  if (!productId) {
    return Response.json(
      { success: false, error: 'Product ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const vote = getVotes(productId, clientId);
    
    return Response.json({
      success: true,
      data: {
        hasVoted: !!vote,
        voteType: vote?.voteType || null
      }
    });
  } catch (error) {
    console.error('Vote API error:', error);
    return Response.json(
      { success: false, error: error.message || 'An error occurred checking vote status' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { productId, voteType, clientId: requestClientId } = await request.json();
    
    if (!productId) {
      return Response.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    if (voteType !== 1 && voteType !== -1) {
      return Response.json(
        { success: false, error: 'Vote type must be 1 (upvote) or -1 (downvote)' },
        { status: 400 }
      );
    }
    
    // Use provided client ID or generate a new one
    const clientId = requestClientId || uuidv4();
    
    const result = submitVote(productId, voteType, clientId);
    
    if (!result.success) {
      return Response.json(
        { success: false, error: result.error || 'Failed to submit vote' },
        { status: 400 }
      );
    }
    
    return Response.json({
      success: true,
      data: {
        ...result.data,
        clientId // Return client ID for future requests
      }
    });
  } catch (error) {
    console.error('Vote API error:', error);
    return Response.json(
      { success: false, error: error.message || 'An error occurred submitting vote' },
      { status: 500 }
    );
  }
} 