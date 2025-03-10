import '../../../lib/complete-polyfills.js';
import supabase from '../../../lib/supabase-client';
import { getCachedData, setCachedData } from '../../../lib/cache';
import { applyRateLimit } from '../../../lib/rate-limit';
import mockProducts from '../../../mock/products.json';

// Check if we're in mock mode
const isMockMode = () => {
  return process.env.MOCK_DB === 'true';
};

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const sortBy = url.searchParams.get('sortBy') || 'score'; // score, newest, price
    const order = url.searchParams.get('order') || 'desc'; // asc, desc
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    
    // Generate a unique key for this request (for caching)
    const cacheKey = `products:${category || 'all'}:${sortBy}:${order}:${limit}:${offset}`;
    
    // Apply rate limiting - IP-based or client ID if available
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const clientId = url.searchParams.get('clientId') || clientIp;
    
    const rateLimit = applyRateLimit(clientId, 120, 60); // 120 requests per minute
    
    // Check for rate limiting
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
    
    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return Response.json(
        { success: true, data: cachedData },
        { headers: rateLimit.headers }
      );
    }
    
    let products;
    
    if (isMockMode()) {
      // Filter and sort mock data
      products = [...mockProducts];
      
      // Apply category filter if specified
      if (category) {
        products = products.filter(product => product.category === category);
      }
      
      // Apply sorting
      products.sort((a, b) => {
        switch (sortBy) {
          case 'price':
            return order === 'asc' ? a.price - b.price : b.price - a.price;
          case 'newest':
            // In mock mode, use product ID as proxy for creation date
            return order === 'asc' 
              ? a.id.localeCompare(b.id) 
              : b.id.localeCompare(a.id);
          case 'score':
          default:
            const scoreA = a.upvotes - a.downvotes;
            const scoreB = b.upvotes - b.downvotes;
            return order === 'asc' ? scoreA - scoreB : scoreB - scoreA;
        }
      });
      
      // Apply pagination
      products = products.slice(offset, offset + limit);
    } else {
      // Query database
      let query = supabase
        .from('products')
        .select('*');
      
      // Apply category filter
      if (category) {
        query = query.eq('category', category);
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'price':
          query = query.order('price', { ascending: order === 'asc' });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: order === 'asc' });
          break;
        case 'score':
        default:
          // Use a custom score calculation
          query = query.order('score', { ascending: order === 'asc' });
          break;
      }
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
      // Execute query
      const { data, error } = await query;
      
      if (error) {
        console.error('Database error:', error);
        return Response.json(
          { success: false, error: 'Error fetching products' },
          { status: 500, headers: rateLimit.headers }
        );
      }
      
      products = data;
    }
    
    // Calculate total for pagination
    const total = isMockMode() 
      ? category 
        ? mockProducts.filter(p => p.category === category).length 
        : mockProducts.length
      : await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq(category ? 'category' : 'id', category || '*')
          .then(res => res.count || 0);
    
    // Prepare response data
    const responseData = {
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + products.length < total
      }
    };
    
    // Cache the result for 1 minute
    setCachedData(cacheKey, responseData, 60);
    
    return Response.json(
      { success: true, data: responseData },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error('Products API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
