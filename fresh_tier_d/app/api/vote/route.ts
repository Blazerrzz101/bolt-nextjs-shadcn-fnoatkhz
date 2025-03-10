import { NextRequest, NextResponse } from 'next/server';
import supabaseClient from '../../../lib/supabase/client';
import mockApi from '../../../lib/mock/data';

// Check if we're using mock mode
const isMockDb = process.env.MOCK_DB === 'true';
const maxVotesPerDay = Number(process.env.NEXT_PUBLIC_MAX_VOTES_PER_DAY || '10');
const enableVotes = process.env.NEXT_PUBLIC_ENABLE_VOTES === 'true';

// GET: Check vote status
export async function GET(request: NextRequest) {
  if (!enableVotes) {
    return NextResponse.json(
      { success: false, error: 'Voting is disabled' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const clientId = searchParams.get('clientId');

    if (!productId || !clientId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // If using mock data
    if (isMockDb || !supabaseClient) {
      const result = mockApi.getVoteStatus(Number(productId), clientId);
      return NextResponse.json(result);
    }

    // If using Supabase - client is guaranteed to be non-null here
    // Check if user has voted for this product
    const { data, error } = await supabaseClient
      .from('votes')
      .select('vote_type')
      .eq('product_id', productId)
      .eq('client_id', clientId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        hasVoted: !!data,
        voteType: data ? data.vote_type : null
      }
    });
  } catch (error) {
    console.error('Error in vote status API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Cast a vote
export async function POST(request: NextRequest) {
  if (!enableVotes) {
    return NextResponse.json(
      { success: false, error: 'Voting is disabled' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { productId, voteType, clientId } = body;

    if (!productId || !voteType || !clientId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (voteType !== 1 && voteType !== -1) {
      return NextResponse.json(
        { success: false, error: 'Invalid vote type' },
        { status: 400 }
      );
    }

    // If using mock data
    if (isMockDb || !supabaseClient) {
      const result = mockApi.recordVote(Number(productId), voteType, clientId);
      return NextResponse.json(result);
    }

    // If using Supabase - client is guaranteed to be non-null here
    // Check if reached daily vote limit
    const today = new Date().toISOString().split('T')[0];
    const { data: votesCount, error: countError } = await supabaseClient
      .from('votes')
      .select('id', { count: 'exact' })
      .eq('client_id', clientId)
      .gte('created_at', `${today}T00:00:00.000Z`);

    if (countError) {
      console.error('Error checking vote count:', countError);
      return NextResponse.json(
        { success: false, error: 'Error checking vote limit' },
        { status: 500 }
      );
    }

    // @ts-ignore - count is available but TypeScript doesn't see it
    const count = votesCount.count || 0;
    if (count >= maxVotesPerDay) {
      return NextResponse.json(
        { success: false, error: `Daily vote limit (${maxVotesPerDay}) reached` },
        { status: 429 }
      );
    }

    // Check if user has already voted for this product
    const { data: existingVote, error: checkError } = await supabaseClient
      .from('votes')
      .select('*')
      .eq('product_id', productId)
      .eq('client_id', clientId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // Not found error is ok
      console.error('Error checking existing vote:', checkError);
      return NextResponse.json(
        { success: false, error: 'Error checking existing vote' },
        { status: 500 }
      );
    }

    let result;
    
    // If user already voted
    if (existingVote) {
      // If same vote type, remove the vote
      if (existingVote.vote_type === voteType) {
        // Delete the vote
        const { error: deleteError } = await supabaseClient
          .from('votes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) {
          console.error('Error deleting vote:', deleteError);
          return NextResponse.json(
            { success: false, error: 'Error removing vote' },
            { status: 500 }
          );
        }

        // Update product vote counts
        const { error: updateError } = await supabaseClient.rpc(
          'update_product_votes',
          { 
            p_id: productId, 
            up_delta: voteType === 1 ? -1 : 0, 
            down_delta: voteType === -1 ? -1 : 0 
          }
        );

        if (updateError) {
          console.error('Error updating product votes:', updateError);
          return NextResponse.json(
            { success: false, error: 'Error updating product votes' },
            { status: 500 }
          );
        }

        result = { voteType: null };
      } 
      // If different vote type, change the vote
      else {
        // Update the vote
        const { error: updateVoteError } = await supabaseClient
          .from('votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);

        if (updateVoteError) {
          console.error('Error updating vote:', updateVoteError);
          return NextResponse.json(
            { success: false, error: 'Error changing vote' },
            { status: 500 }
          );
        }

        // Update product vote counts (switch from one type to another)
        const { error: updateError } = await supabaseClient.rpc(
          'update_product_votes',
          { 
            p_id: productId, 
            up_delta: voteType === 1 ? 1 : -1, 
            down_delta: voteType === -1 ? 1 : -1 
          }
        );

        if (updateError) {
          console.error('Error updating product votes:', updateError);
          return NextResponse.json(
            { success: false, error: 'Error updating product votes' },
            { status: 500 }
          );
        }

        result = { voteType };
      }
    } 
    // If new vote
    else {
      // Insert new vote
      const { error: insertError } = await supabaseClient
        .from('votes')
        .insert({
          product_id: productId,
          client_id: clientId,
          vote_type: voteType
        });

      if (insertError) {
        console.error('Error inserting vote:', insertError);
        return NextResponse.json(
          { success: false, error: 'Error recording vote' },
          { status: 500 }
        );
      }

      // Update product vote counts
      const { error: updateError } = await supabaseClient.rpc(
        'update_product_votes',
        { 
          p_id: productId, 
          up_delta: voteType === 1 ? 1 : 0, 
          down_delta: voteType === -1 ? 1 : 0 
        }
      );

      if (updateError) {
        console.error('Error updating product votes:', updateError);
        return NextResponse.json(
          { success: false, error: 'Error updating product votes' },
          { status: 500 }
        );
      }

      result = { voteType };
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Vote recorded successfully',
        ...result
      }
    });
  } catch (error) {
    console.error('Error in vote API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 