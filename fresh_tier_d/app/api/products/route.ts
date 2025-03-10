import { NextRequest, NextResponse } from 'next/server';
import supabaseClient from '../../../lib/supabase/client';
import mockApi from '../../../lib/mock/data';
import { createClient } from '@supabase/supabase-js';

// Check if we're using mock mode
const isMockDb = process.env.MOCK_DB === 'true';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    
    // If using mock data
    if (isMockDb || !supabaseClient) {
      if (id) {
        const product = mockApi.getProductById(Number(id));
        if (!product) {
          return NextResponse.json(
            { success: false, error: 'Product not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: product });
      }
      
      if (category) {
        const products = mockApi.getProductsByCategory(category);
        return NextResponse.json({ success: true, data: products });
      }
      
      const products = mockApi.getProducts();
      return NextResponse.json({ success: true, data: products });
    }
    
    // TypeScript can't know that supabaseClient is non-null here, 
    // but we've already handled the null case above
    const client = supabaseClient as ReturnType<typeof createClient>;
    
    // If using Supabase
    let query = client.from('products').select('*');
    
    if (id) {
      query = query.eq('id', id).single();
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('score', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} export const dynamic = 'force-dynamic';
