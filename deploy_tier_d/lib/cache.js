/**
 * Simple in-memory cache for API responses
 * This helps reduce database load and improve response times
 */

// Cache store with expiration
const cacheStore = new Map();

// Get cached data if it exists and is not expired
export function getCachedData(key) {
  if (!key) return null;
  
  const cacheItem = cacheStore.get(key);
  if (!cacheItem) return null;
  
  // Check if cache has expired
  if (cacheItem.expiresAt < Date.now()) {
    cacheStore.delete(key);
    return null;
  }
  
  return cacheItem.data;
}

// Set data in cache with expiration
export function setCachedData(key, data, ttlSeconds = 60) {
  if (!key) return;
  
  cacheStore.set(key, {
    data,
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
}

// Clear a specific cache item
export function clearCacheItem(key) {
  if (!key) return;
  cacheStore.delete(key);
}

// Clear all items from cache
export function clearAllCache() {
  cacheStore.clear();
}

// Clear all cache items matching a pattern
export function clearCachePattern(pattern) {
  if (!pattern) return;
  
  const regex = new RegExp(pattern);
  
  for (const key of cacheStore.keys()) {
    if (regex.test(key)) {
      cacheStore.delete(key);
    }
  }
}

// Get current cache stats
export function getCacheStats() {
  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys()),
    memory: process.memoryUsage().heapUsed
  };
} 