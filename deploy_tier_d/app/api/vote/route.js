import '../../../lib/complete-polyfills.js';
import supabase, { createGlobalUpdateChannel } from '../../../lib/supabase-client';
import { applyRateLimit } from '../../../lib/rate-limit';
import { getCachedData, setCachedData, clearCachePattern } from '../../../lib/cache';

// Mock votes data
let mockVotes = {
  'prod_1': { upvotes: 15, downvotes: 3, votes: {} },
  'prod_2': { upvotes: 22, downvotes: 5, votes: {} },
  'prod_3': { upvotes: 18, downvotes: 2, votes: {} },
  'prod_4': { upvotes: 12, downvotes: 1, votes: {} },
  'prod_5': { upvotes: 9, downvotes: 0, votes: {} }
};

// Import mock products to ensure consistent IDs
import mockProducts from '../../../mock/products.json';

// Initialize mock votes with all product IDs from mock data
for (const product of mockProducts) {
  if (!mockVotes[product.id]) {
    mockVotes[product.id] = { 
      upvotes: product.upvotes || 0, 
      downvotes: product.downvotes || 0, 
      votes: {} 
    };
  }
}

// Generate a client ID for anonymous users
const generateClientId = () => {
  return 'anon-' + Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
};

// Check if we're in mock mode
const isMockMode = () => {
  return process.env.MOCK_DB === 'true';
};

// Helper function to broadcast a vote update in real-time
const broadcastVoteUpdate = async (productId, voteData) => {
  if (isMockMode()) return;
  
  try {
    await supabase
      .channel('global-updates')
      .send({
        type: 'broadcast',
        event: 'global-update',
        payload: {
          type: 'vote-update',
          productId,
          ...voteData
        }
      });
  } catch (error) {
    console.error('Error broadcasting vote update:', error);
  }
};

// GET handler to check vote status
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const clientId = url.searchParams.get('clientId');
    
    if (!productId) {
      return Response.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Apply rate limiting
    const requestIdentifier = clientId || url.searchParams.get('ip') || 'anonymous';
    const rateLimit = applyRateLimit(requestIdentifier, 60, 60); // 60 requests per minute
    
    if (rateLimit.limited) {
      return Response.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            ...rateLimit.headers,
            'Retry-After': rateLimit.resetInSeconds.toString()
          }
        }
      );
    }
    
    // Check cache for vote status
    const cacheKey = `vote:status:${productId}:${clientId || 'anonymous'}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      return Response.json(
        { success: true, data: cachedData },
        { headers: rateLimit.headers }
      );
    }
    
    // Handle database or mock mode
    if (isMockMode()) {
      // Get vote data for the product from mock data
      const productVotes = mockVotes[productId] || { upvotes: 0, downvotes: 0, votes: {} };
      
      // Get client's vote if clientId is provided
      let userVote = null;
      if (clientId && productVotes.votes[clientId]) {
        userVote = productVotes.votes[clientId];
      }
      
      const responseData = {
        productId,
        upvotes: productVotes.upvotes,
        downvotes: productVotes.downvotes,
        score: productVotes.upvotes - productVotes.downvotes,
        hasVoted: userVote !== null,
        voteType: userVote
      };
      
      // Cache the result for 5 minutes
      setCachedData(cacheKey, responseData, 5 * 60);
      
      return Response.json({
        success: true,
        data: responseData
      }, { headers: rateLimit.headers });
    } else {
      // Real database mode
      const { data, error } = await supabase
        .from('products')
        .select('id, upvotes, downvotes')
        .eq('id', productId)
        .single();
        
      if (error) {
        console.error('Database error:', error);
        return Response.json(
          { success: false, error: 'Error fetching product vote data' },
          { status: 500, headers: rateLimit.headers }
        );
      }
      
      // Get user's vote if clientId provided
      let userVote = null;
      let hasVoted = false;
      
      if (clientId) {
        const { data: voteData, error: voteError } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('product_id', productId)
          .eq('client_id', clientId)
          .single();
          
        if (!voteError && voteData) {
          userVote = voteData.vote_type;
          hasVoted = true;
        }
      }
      
      const responseData = {
        productId,
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        score: (data.upvotes || 0) - (data.downvotes || 0),
        hasVoted,
        voteType: userVote
      };
      
      // Cache the result for 5 minutes
      setCachedData(cacheKey, responseData, 5 * 60);
      
      return Response.json({
        success: true,
        data: responseData
      }, { headers: rateLimit.headers });
    }
  } catch (error) {
    console.error('Vote API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST handler to submit a vote
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, voteType, clientId } = body;
    
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
    
    const actualClientId = clientId || generateClientId();
    
    // Apply rate limiting - stricter for voting actions
    const rateLimit = applyRateLimit(actualClientId, 20, 60); // 20 votes per minute
    
    if (rateLimit.limited) {
      return Response.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            ...rateLimit.headers,
            'Retry-After': rateLimit.resetInSeconds.toString()
          }
        }
      );
    }
    
    // Handle database or mock mode
    if (isMockMode()) {
      // Initialize product votes if not exists
      if (!mockVotes[productId]) {
        mockVotes[productId] = { upvotes: 0, downvotes: 0, votes: {} };
      }
      
      const productVotes = mockVotes[productId];
      const previousVote = productVotes.votes[actualClientId];
      
      // Remove previous vote if exists
      if (previousVote !== undefined) {
        if (previousVote === 1) productVotes.upvotes--;
        if (previousVote === -1) productVotes.downvotes--;
      }
      
      // If same vote type, toggle it off
      if (previousVote === voteType) {
        delete productVotes.votes[actualClientId];
        voteType = null;
      } else {
        // Add new vote
        productVotes.votes[actualClientId] = voteType;
        if (voteType === 1) productVotes.upvotes++;
        if (voteType === -1) productVotes.downvotes++;
      }
      
      const responseData = {
        productId,
        clientId: actualClientId,
        upvotes: productVotes.upvotes,
        downvotes: productVotes.downvotes,
        score: productVotes.upvotes - productVotes.downvotes,
        voteType
      };
      
      // Clear cache for this product and this client
      clearCachePattern(`vote:status:${productId}:`);
      clearCachePattern(`products:`);
      
      return Response.json({
        success: true,
        data: responseData
      }, { headers: rateLimit.headers });
    } else {
      // Real database mode with transaction for vote reliability
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, upvotes, downvotes')
        .eq('id', productId)
        .single();
        
      if (productError) {
        console.error('Database error:', productError);
        return Response.json(
          { success: false, error: 'Error fetching product data' },
          { status: 500, headers: rateLimit.headers }
        );
      }
      
      // Get user's previous vote if any
      const { data: prevVote, error: voteError } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('product_id', productId)
        .eq('client_id', actualClientId)
        .single();
      
      let finalVoteType = voteType;
      let newUpvotes = product.upvotes || 0;
      let newDownvotes = product.downvotes || 0;
      
      // Begin transaction
      const { error: transactionError } = await supabase.rpc('process_vote', {
        p_product_id: productId,
        p_client_id: actualClientId,
        p_vote_type: voteType,
        p_prev_vote_type: prevVote?.vote_type || null
      });
      
      if (transactionError) {
        console.error('Transaction error:', transactionError);
        
        // Fallback manual handling if RPC fails
        if (prevVote) {
          // Remove previous vote
          if (prevVote.vote_type === 1) newUpvotes--;
          if (prevVote.vote_type === -1) newDownvotes--;
          
          // If same vote type, toggle it off
          if (prevVote.vote_type === voteType) {
            await supabase
              .from('votes')
              .delete()
              .eq('product_id', productId)
              .eq('client_id', actualClientId);
              
            finalVoteType = null;
          } else {
            // Update vote
            await supabase
              .from('votes')
              .update({ vote_type: voteType })
              .eq('product_id', productId)
              .eq('client_id', actualClientId);
              
            // Add new vote to counts
            if (voteType === 1) newUpvotes++;
            if (voteType === -1) newDownvotes++;
          }
        } else {
          // Insert new vote
          await supabase
            .from('votes')
            .insert({
              product_id: productId,
              client_id: actualClientId,
              vote_type: voteType
            });
            
          // Add new vote to counts
          if (voteType === 1) newUpvotes++;
          if (voteType === -1) newDownvotes++;
        }
        
        // Update product counts
        await supabase
          .from('products')
          .update({
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            score: newUpvotes - newDownvotes // Store score for faster sorting
          })
          .eq('id', productId);
      } else {
        // Get updated counts if transaction succeeded
        const { data: updatedProduct } = await supabase
          .from('products')
          .select('upvotes, downvotes')
          .eq('id', productId)
          .single();
          
        if (updatedProduct) {
          newUpvotes = updatedProduct.upvotes;
          newDownvotes = updatedProduct.downvotes;
        }
        
        // Check if vote was toggled off (same vote twice)
        if (prevVote && prevVote.vote_type === voteType) {
          finalVoteType = null;
        }
      }
      
      // Create response data
      const responseData = {
        productId,
        clientId: actualClientId,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        score: newUpvotes - newDownvotes,
        voteType: finalVoteType
      };
      
      // Clear cache for this product and this client 
      clearCachePattern(`vote:status:${productId}:`);
      clearCachePattern(`products:`);
      
      // Broadcast update for real-time clients
      await broadcastVoteUpdate(productId, responseData);
      
      return Response.json({
        success: true,
        data: responseData
      }, { headers: rateLimit.headers });
    }
  } catch (error) {
    console.error('Vote API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
