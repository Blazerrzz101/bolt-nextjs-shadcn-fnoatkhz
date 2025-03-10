// Mock for @supabase/ssr to use during build
// This prevents browser-specific code from causing build errors

// Define global.self if it doesn't exist (prevents 'self is not defined' errors)
// This needs to be executed at the top level
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  // @ts-ignore
  global.self = global;
}

// Mock window if it doesn't exist
if (typeof global !== 'undefined' && typeof window === 'undefined') {
  // @ts-ignore
  global.window = {
    location: { href: '' },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    sessionStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    fetch: () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    }),
    WebSocket: function() {
      return {
        addEventListener: () => {},
        removeEventListener: () => {},
        send: () => {},
        close: () => {}
      };
    }
  };
}

// Set browser environment flag
if (typeof process !== 'undefined' && typeof process === 'object') {
  try {
    Object.defineProperty(process, 'browser', { value: false });
  } catch (e) {
    console.warn('Could not set process.browser:', e);
  }
}

// Mock Supabase client for SSR
export const createServerClient = () => {
  // Return a mock client implementation that prevents build errors
  return {
    from: (table) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
      in: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      limit: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      order: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/mock.jpg' } }),
        list: () => Promise.resolve({ data: [], error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
      }),
    },
    // Add channel functionality which is used by realtime features
    channel: () => ({
      on: () => ({
        subscribe: () => Promise.resolve(),
      }),
      subscribe: () => Promise.resolve(),
      unsubscribe: () => Promise.resolve(),
    }),
  };
};

// Export aliases for various client types
export const createBrowserClient = createServerClient;
export const createRouteHandlerClient = createServerClient;
export const createServerComponentClient = createServerClient;
export const createClientComponentClient = createServerClient;

// Default export
export default {
  createServerClient,
  createBrowserClient,
  createRouteHandlerClient,
  createServerComponentClient,
  createClientComponentClient
};

module.exports = {
  createServerClient,
  createBrowserClient,
  createRouteHandlerClient,
  createServerComponentClient,
  createClientComponentClient
}; 