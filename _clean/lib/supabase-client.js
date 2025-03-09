import { createClient } from '@supabase/supabase-js';

// Load polyfills if we're in Node.js environment
if (typeof window === 'undefined') {
  // Basic globals
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  if (!global.navigator) global.navigator = { userAgent: 'node.js' };
  
  console.log('Applied polyfills for Supabase in Node.js environment');
}

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client with realtime enabled
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: typeof window !== 'undefined'
  }
});

// Mock mode detection (for development, testing, or when database is unavailable)
const isMockMode = () => {
  return process.env.MOCK_DB === 'true' || 
         !supabaseUrl.includes('your-project') || 
         !supabaseAnonKey.includes('your-anon-key');
};

// Channels for real-time updates
export const createProductUpdateChannel = (productId, callback) => {
  if (isMockMode()) {
    // In mock mode, just return a dummy unsubscribe function
    console.log('Mock mode: No real-time connection established');
    return { unsubscribe: () => {} };
  }
  
  // Create a channel for this specific product
  const channel = supabase
    .channel(`product-${productId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'votes',
        filter: `product_id=eq.${productId}`
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
  
  return channel;
};

// Create a channel for reviews
export const createReviewsChannel = (productId, callback) => {
  if (isMockMode()) {
    // In mock mode, just return a dummy unsubscribe function
    console.log('Mock mode: No real-time connection established for reviews');
    return { unsubscribe: () => {} };
  }
  
  // Create a channel for reviews of this specific product
  const channel = supabase
    .channel(`reviews-${productId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reviews',
        filter: `product_id=eq.${productId}`
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
  
  return channel;
};

// Create a global updates channel for system-wide updates
export const createGlobalUpdateChannel = (callback) => {
  if (isMockMode()) {
    // In mock mode, just return a dummy unsubscribe function
    console.log('Mock mode: No real-time connection established for global updates');
    return { unsubscribe: () => {} };
  }
  
  // Create a channel for global updates
  const channel = supabase
    .channel('global-updates')
    .on(
      'broadcast',
      { event: 'global-update' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
  
  return channel;
};

export default supabase;
