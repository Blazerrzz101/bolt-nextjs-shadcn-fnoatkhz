// Mock for @supabase/supabase-js to use during build
// This prevents browser-specific code from causing build errors

// Define global.self if it doesn't exist to prevent 'self is not defined' errors
if (typeof self === 'undefined' && typeof global !== 'undefined') {
  global.self = global;
}

// Mock createClient function
const createClient = () => {
  return {
    from: (table) => ({
      select: (columns) => Promise.resolve({ data: [], error: null }),
      insert: (data) => Promise.resolve({ data: null, error: null }),
      update: (data) => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: (column, value) => ({
        single: () => Promise.resolve({ data: null, error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
      in: (column, values) => Promise.resolve({ data: [], error: null }),
      limit: (limit) => ({
        eq: (column, value) => Promise.resolve({ data: [], error: null }),
      }),
      order: (column, { ascending }) => Promise.resolve({ data: [], error: null }),
      match: (query) => Promise.resolve({ data: [], error: null }),
    }),
    rpc: (fn, params) => Promise.resolve({ data: null, error: null }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      updateUser: (data) => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: (credentials) => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: (callback) => {
        // Return a dummy unsubscribe function
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      setSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    storage: {
      from: (bucket) => ({
        upload: (path, file) => Promise.resolve({ data: { path: path }, error: null }),
        getPublicUrl: (path) => ({ data: { publicUrl: `https://example.com/${path}` } }),
        list: (path) => Promise.resolve({ data: [], error: null }),
        remove: (paths) => Promise.resolve({ data: { path: paths }, error: null }),
      }),
    },
  };
};

// Add additional mock exports that might be needed
module.exports = {
  createClient,
}; 