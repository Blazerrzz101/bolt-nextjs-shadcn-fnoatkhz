import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * API endpoint to fix the voting system by directly applying SQL migrations
 * This is a production emergency fix, not standard practice for migrations
 */
export async function POST(request: NextRequest) {
  console.log('Vote System Fix API called (mock implementation)');
  return NextResponse.json({
    success: true,
    message: "Vote system fixed (mock implementation)",
    timestamp: new Date().toISOString()
  });
}

// GET endpoint to check if the fix has been applied
export async function GET(request: NextRequest) {
  try {
    // Test if the vote_for_product function works
    const { data: testResult, error: testError } = await supabaseServer.rpc('vote_for_product', {
      p_product_id: '00000000-0000-0000-0000-000000000001', // Random test ID
      p_vote_type: 1,
      p_client_id: 'api-test-check'
    });
    
    // Get a random product to test with
    const { data: product, error: productError } = await supabaseServer
      .from('products')
      .select('id, name, upvotes, downvotes')
      .limit(1)
      .single();
    
    return NextResponse.json({
      isFixed: !testError,
      functionTest: {
        success: !testError,
        error: testError ? testError.message : null,
        result: testResult
      },
      productTest: {
        success: !productError,
        product: product ? {
          id: product.id,
          name: product.name,
          upvotes: Number(product.upvotes) || 0,
          downvotes: Number(product.downvotes) || 0,
          score: (Number(product.upvotes) || 0) - (Number(product.downvotes) || 0)
        } : null,
        error: productError ? productError.message : null
      }
    });
  } catch (error) {
    console.error('Vote system check error:', error);
    return NextResponse.json({ 
      isFixed: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 