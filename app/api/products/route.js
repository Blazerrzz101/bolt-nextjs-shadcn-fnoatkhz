import { getProducts, getProductById } from '../../../lib/data-utils';

export const dynamic = "force-dynamic"; // This ensures Vercel doesn't try to statically generate it

export async function GET(request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const category = url.searchParams.get('category');
  
  try {
    // If ID is provided, return a single product
    if (id) {
      const product = getProductById(id);
      
      if (!product) {
        return Response.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      
      return Response.json({ success: true, data: product });
    }
    
    // Otherwise return all products, optionally filtered by category
    const products = getProducts(category);
    return Response.json({ 
      success: true, 
      data: { 
        products,
        pagination: {
          total: products.length,
          limit: products.length,
          offset: 0,
          hasMore: false
        }
      }
    });
  } catch (error) {
    console.error('Products API error:', error);
    return Response.json(
      { success: false, error: error.message || 'An error occurred fetching products' },
      { status: 500 }
    );
  }
} 