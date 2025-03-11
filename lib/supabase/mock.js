/**
 * Mock Supabase Client Implementation
 * 
 * This file provides a mock implementation of the Supabase client for use
 * when the MOCK_DB environment variable is set to true
 */

// Debug helper
const debug = (action, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[Mock Supabase] ${action}`, data);
  }
};

// Define local mock products
const mockProducts = [
  {
    id: "j1k2l3m4-n5o6-p7q8-r9s0-t1u2v3w4x5y6",
    name: "ASUS ROG Swift PG279QM",
    description: "27-inch gaming monitor with 240Hz refresh rate and G-SYNC",
    category: "monitors",
    price: 849.99,
    url_slug: "asus-rog-swift-pg279qm",
    image_url: "/images/products/placeholder-monitor.svg",
    upvotes: 5,
    downvotes: 2,
    rating: 4.8,
    review_count: 156,
    score: 3
  },
  {
    id: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    name: "Sony WH-1000XM5",
    description: "Wireless noise-cancelling headphones with exceptional sound quality",
    category: "audio",
    price: 399.99,
    url_slug: "sony-wh-1000xm5",
    image_url: "/images/products/placeholder-headphones.svg",
    upvotes: 8,
    downvotes: 1,
    rating: 4.9,
    review_count: 203,
    score: 7
  }
];

// Create a mock Supabase client
export const createMockSupabaseClient = () => {
  console.log('Creating mock Supabase client');
  
  return {
    auth: {
      getUser: async () => {
        return { data: { user: null }, error: null };
      },
      getSession: async () => {
        return { data: { session: null }, error: null };
      },
      signUp: async () => {
        return { data: null, error: new Error('Auth not available in mock mode') };
      },
      signIn: async () => {
        return { data: null, error: new Error('Auth not available in mock mode') };
      },
      signOut: async () => {
        return { error: null };
      }
    },
    from: (table) => {
      return {
        select: () => {
          return {
            eq: () => {
              return {
                single: async () => {
                  if (table === 'products') {
                    return { data: mockProducts[0], error: null };
                  }
                  return { data: null, error: null };
                },
                async: () => {
                  if (table === 'products') {
                    return { data: mockProducts, error: null };
                  }
                  return { data: [], error: null };
                }
              };
            },
            async: () => {
              if (table === 'products') {
                return { data: mockProducts, error: null };
              }
              return { data: [], error: null };
            }
          };
        },
        insert: () => {
          return {
            single: async () => {
              return { data: { id: 'mock-id' }, error: null };
            }
          };
        },
        update: () => {
          return {
            eq: () => {
              return {
                single: async () => {
                  return { data: { updated: true }, error: null };
                }
              };
            }
          };
        },
        delete: () => {
          return {
            eq: () => {
              return {
                async: () => {
                  return { data: { deleted: true }, error: null };
                }
              };
            }
          };
        }
      };
    },
    rpc: (func) => {
      return {
        async: () => {
          return { data: null, error: new Error('RPC functions not available in mock mode') };
        }
      };
    },
    storage: {
      from: (bucket) => {
        return {
          upload: async () => {
            return { data: { path: 'mock-path' }, error: null };
          },
          getPublicUrl: (path) => {
            return { data: { publicUrl: `/mock-storage/${path}` } };
          }
        };
      }
    }
  };
};

export default createMockSupabaseClient; 