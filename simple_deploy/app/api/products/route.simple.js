/**
 * Simplified Products API
 */

// Import polyfills first
import '../../../lib/minimal-polyfills.js';

// Import API utilities
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling, 
  getQueryParams 
} from '../../../lib/api-simple.js';

// Import Supabase client
import getSupabaseClient from '../../../lib/supabase-simple.js';

/**
 * GET handler for products API
 */
async function handleGetProducts(request) {
  // Get Supabase client
  const supabase = getSupabaseClient();
  
  // Get query parameters
  const params = getQueryParams(request);
  const { category, sort } = params;
  
  // Get products from Supabase or mock data
  const { data, error } = await supabase.from('products').select('*');
  
  if (error) {
    return createErrorResponse('Failed to fetch products', error.message);
  }
  
  // Sort products if needed
  let sortedProducts = [...data];
  if (sort === 'popular') {
    sortedProducts.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  } else if (sort === 'score') {
    sortedProducts.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  
  // Filter by category if needed
  if (category) {
    sortedProducts = sortedProducts.filter(product => 
      product.category === category || 
      (product.categories && product.categories.includes(category))
    );
  }
  
  return createSuccessResponse({ products: sortedProducts });
}

// Export the handler with error handling
export const GET = withErrorHandling(handleGetProducts); 