import { NextRequest, NextResponse } from 'next/server';
import { withStaticBuildHandler, getServerClient, createSuccessResponse, createErrorResponse } from '@/lib/api-wrapper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// API endpoint to fix vote counts in the database
export const POST = withStaticBuildHandler(async (request: NextRequest) => {
  try {
    // Get authentication header (optional, could require a specific token)
    const authHeader = request.headers.get('authorization');
    
    // In production, you'd want to check for a valid token
    // This is a simplified example that could be enhanced with proper auth
    
    const { productId, dryRun = false } = await request.json();
    const supabase = getServerClient();
    
    // If we're in a static build or have no Supabase client
    if (!supabase) {
      return createSuccessResponse({
        message: 'Vote fix operation would run here (mock)',
        fixedProducts: [],
        dryRun: true,
        isMock: true
      });
    }
    
    // Results will store information about fixed products
    const results = {
      fixedProducts: [],
      errors: [],
      summary: {
        productsChecked: 0,
        productsFixed: 0,
        totalUpvotesAdded: 0,
        totalDownvotesAdded: 0,
        totalUpvotesRemoved: 0,
        totalDownvotesRemoved: 0,
      }
    };
    
    // If a specific product ID is provided, only fix that one
    if (productId) {
      console.log(`Fixing votes for specific product: ${productId} (dry run: ${dryRun})`);
      const productResult = await fixProductVotes(supabase, productId, dryRun);
      results.productsChecked = 1;
      
      if (productResult.fixed) {
        results.fixedProducts.push(productResult);
        results.summary.productsFixed++;
        results.summary.totalUpvotesAdded += productResult.upvotesAdded || 0;
        results.summary.totalDownvotesAdded += productResult.downvotesAdded || 0;
        results.summary.totalUpvotesRemoved += productResult.upvotesRemoved || 0;
        results.summary.totalDownvotesRemoved += productResult.downvotesRemoved || 0;
      }
    } else {
      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, upvotes, downvotes');
      
      if (productsError) {
        return createErrorResponse('Error fetching products', productsError);
      }
      
      console.log(`Fixing votes for ${products.length} products (dry run: ${dryRun})`);
      results.summary.productsChecked = products.length;
      
      // Process each product
      for (const product of products) {
        const productResult = await fixProductVotes(supabase, product.id, dryRun);
        
        if (productResult.fixed) {
          results.fixedProducts.push(productResult);
          results.summary.productsFixed++;
          results.summary.totalUpvotesAdded += productResult.upvotesAdded || 0;
          results.summary.totalDownvotesAdded += productResult.downvotesAdded || 0;
          results.summary.totalUpvotesRemoved += productResult.upvotesRemoved || 0;
          results.summary.totalDownvotesRemoved += productResult.downvotesRemoved || 0;
        }
      }
    }
    
    // Return results
    return createSuccessResponse({
      message: dryRun ? 'Dry run completed successfully' : 'Vote counts fixed successfully',
      dryRun,
      summary: results.summary,
      fixedProducts: results.fixedProducts
    });
  } catch (error) {
    console.error('Error in vote-fix API:', error);
    return createErrorResponse('Error fixing vote counts', error);
  }
});

// Helper function to fix vote counts for a specific product
async function fixProductVotes(supabase, productId, dryRun = false) {
  try {
    // First, get the current vote counts directly from the votes table
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('product_id', productId);
    
    if (votesError) {
      return {
        id: productId,
        error: 'Error fetching votes',
        details: votesError,
        fixed: false
      };
    }
    
    // Calculate actual counts
    const actualUpvotes = votes.filter(v => v.vote_type === 1).length;
    const actualDownvotes = votes.filter(v => v.vote_type === -1).length;
    
    // Get the current product record
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, upvotes, downvotes')
      .eq('id', productId)
      .single();
    
    if (productError) {
      return {
        id: productId,
        error: 'Error fetching product',
        details: productError,
        fixed: false
      };
    }
    
    // Ensure numeric values
    const currentUpvotes = Number(product.upvotes) || 0;
    const currentDownvotes = Number(product.downvotes) || 0;
    
    // Check if counts match
    const upvotesMismatch = currentUpvotes !== actualUpvotes;
    const downvotesMismatch = currentDownvotes !== actualDownvotes;
    
    // If no mismatch, nothing to fix
    if (!upvotesMismatch && !downvotesMismatch) {
      return {
        id: productId,
        name: product.name,
        fixed: false,
        message: 'Vote counts are already correct'
      };
    }
    
    // Calculate differences
    const upvotesAdded = upvotesMismatch && actualUpvotes > currentUpvotes ? actualUpvotes - currentUpvotes : 0;
    const upvotesRemoved = upvotesMismatch && actualUpvotes < currentUpvotes ? currentUpvotes - actualUpvotes : 0;
    const downvotesAdded = downvotesMismatch && actualDownvotes > currentDownvotes ? actualDownvotes - currentDownvotes : 0;
    const downvotesRemoved = downvotesMismatch && actualDownvotes < currentDownvotes ? currentDownvotes - actualDownvotes : 0;
    
    // Create a result object with details
    const result = {
      id: productId,
      name: product.name,
      fixed: true,
      upvotesAdded,
      upvotesRemoved,
      downvotesAdded,
      downvotesRemoved,
      before: {
        upvotes: currentUpvotes,
        downvotes: currentDownvotes
      },
      after: {
        upvotes: actualUpvotes,
        downvotes: actualDownvotes
      }
    };
    
    // If this is a dry run, just return the planned changes
    if (dryRun) {
      return {
        ...result,
        message: 'Dry run - no changes made'
      };
    }
    
    // Update the product's vote counts
    const { error: updateError } = await supabase
      .from('products')
      .update({
        upvotes: actualUpvotes,
        downvotes: actualDownvotes
      })
      .eq('id', productId);
    
    if (updateError) {
      return {
        id: productId,
        name: product.name,
        error: 'Error updating product vote counts',
        details: updateError,
        fixed: false
      };
    }
    
    return {
      ...result,
      message: 'Vote counts fixed successfully'
    };
  } catch (error) {
    return {
      id: productId,
      error: 'Error fixing vote counts',
      details: error instanceof Error ? error.message : String(error),
      fixed: false
    };
  }
} 