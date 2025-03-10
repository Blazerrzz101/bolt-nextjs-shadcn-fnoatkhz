/**
 * Simple rate limiting implementation to prevent API abuse
 */

// Store for rate limit counters
const rateLimitStore = new Map();

// Clean up expired rate limit entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Set up periodic cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    
    for (const [key, data] of rateLimitStore.entries()) {
      if (data.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Apply rate limiting to a request
 * @param {string} identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param {number} limit - Maximum number of requests allowed in the window
 * @param {number} windowSeconds - Time window in seconds
 * @returns {Object} Rate limit status and headers
 */
export function applyRateLimit(identifier, limit = 60, windowSeconds = 60) {
  const now = Date.now();
  const key = `${identifier}:${limit}:${windowSeconds}`;
  
  // Get or initialize rate limit data
  let rateLimitData = rateLimitStore.get(key);
  
  if (!rateLimitData || rateLimitData.resetAt < now) {
    // Create new rate limit entry or reset expired one
    rateLimitData = {
      count: 0,
      resetAt: now + (windowSeconds * 1000)
    };
  }
  
  // Increment request count
  rateLimitData.count++;
  
  // Store updated rate limit data
  rateLimitStore.set(key, rateLimitData);
  
  // Calculate remaining requests and time until reset
  const remaining = Math.max(0, limit - rateLimitData.count);
  const resetInSeconds = Math.ceil((rateLimitData.resetAt - now) / 1000);
  
  // Check if rate limit exceeded
  const limited = rateLimitData.count > limit;
  
  // Return rate limit status and headers
  return {
    limited,
    remaining,
    resetAt: rateLimitData.resetAt,
    resetInSeconds,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(rateLimitData.resetAt / 1000).toString()
    }
  };
} 