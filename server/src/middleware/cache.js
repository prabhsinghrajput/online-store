/**
 * In-memory Cache Store with TTL & Cache Invalidation support.
 */

const cacheStore = new Map();

// Periodic cleanup of expired keys every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cacheStore.entries()) {
    if (item.expiresAt && item.expiresAt <= now) {
      cacheStore.delete(key);
    }
  }
}, 60000).unref(); // unref so it won't prevent Node process from exiting

/**
 * Express middleware for caching JSON responses in-memory.
 * @param {number} ttlSeconds - Time-to-live in seconds (default: 60)
 * @param {string} [customPrefix] - Optional prefix tag for grouped invalidation
 */
export const cacheMiddleware = (ttlSeconds = 60, customPrefix = '') => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const prefix = customPrefix || req.baseUrl || '';
    const cacheKey = `${prefix}:${req.originalUrl}`;
    const now = Date.now();

    const cached = cacheStore.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    // Intercept res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Only cache successful 2xx responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheStore.set(cacheKey, {
          data,
          expiresAt: now + ttlSeconds * 1000,
          prefix,
        });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalidate all cache entries matching a prefix or substring.
 * @param {string} prefixOrPattern - String or tag prefix to invalidate
 */
export const invalidateCache = (prefixOrPattern) => {
  if (!prefixOrPattern) return;
  const lower = prefixOrPattern.toLowerCase();
  for (const [key] of cacheStore.entries()) {
    if (key.toLowerCase().includes(lower)) {
      cacheStore.delete(key);
    }
  }
};

/**
 * Clear the entire cache.
 */
export const clearAllCache = () => {
  cacheStore.clear();
};
