import { useState, useEffect, useCallback } from "react";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hitRate: number;
  totalItems: number;
  memoryUsage: number;
  oldestItem: number;
  newestItem: number;
}

export const useCache = <T>(cacheKey: string, ttl: number = 5 * 60 * 1000) => {
  const [cache, setCache] = useState<Map<string, CacheItem<T>>>(new Map());
  const [stats, setStats] = useState<CacheStats>({
    hitRate: 0,
    totalItems: 0,
    memoryUsage: 0,
    oldestItem: 0,
    newestItem: 0,
  });

  useEffect(() => {
    // Load cache from localStorage on mount
    loadCacheFromStorage();

    // Clean up expired items every minute
    const cleanupInterval = setInterval(cleanupExpiredItems, 60000);

    return () => {
      clearInterval(cleanupInterval);
      saveCacheToStorage();
    };
  }, []);

  const loadCacheFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(`brainbolt-cache-${cacheKey}`);
      if (stored) {
        const cacheData = JSON.parse(stored);
        const cacheMap = new Map(Object.entries(cacheData));
        setCache(cacheMap);
        updateStats(cacheMap);
      }
    } catch (error) {
      console.error("Error loading cache from storage:", error);
    }
  }, [cacheKey]);

  const saveCacheToStorage = useCallback(() => {
    try {
      const cacheObj = Object.fromEntries(cache);
      localStorage.setItem(
        `brainbolt-cache-${cacheKey}`,
        JSON.stringify(cacheObj)
      );
    } catch (error) {
      console.error("Error saving cache to storage:", error);
    }
  }, [cache, cacheKey]);

  const cleanupExpiredItems = useCallback(() => {
    const now = Date.now();
    const newCache = new Map();

    for (const [key, item] of cache) {
      if (item.expiresAt > now) {
        newCache.set(key, item);
      }
    }

    if (newCache.size !== cache.size) {
      setCache(newCache);
      updateStats(newCache);
    }
  }, [cache]);

  const updateStats = useCallback((cacheMap: Map<string, CacheItem<T>>) => {
    const items = Array.from(cacheMap.values());
    const now = Date.now();

    const totalAccesses = items.reduce(
      (sum, item) => sum + item.accessCount,
      0
    );
    const hitRate = totalAccesses > 0 ? items.length / totalAccesses : 0;

    const timestamps = items.map((item) => item.timestamp);
    const oldestItem = timestamps.length > 0 ? Math.min(...timestamps) : 0;
    const newestItem = timestamps.length > 0 ? Math.max(...timestamps) : 0;

    // Estimate memory usage (rough calculation)
    const memoryUsage = JSON.stringify(Object.fromEntries(cacheMap)).length;

    setStats({
      hitRate: Math.round(hitRate * 100) / 100,
      totalItems: items.length,
      memoryUsage,
      oldestItem,
      newestItem,
    });
  }, []);

  const get = useCallback(
    (key: string): T | null => {
      const item = cache.get(key);

      if (!item) {
        return null;
      }

      const now = Date.now();

      // Check if expired
      if (item.expiresAt <= now) {
        const newCache = new Map(cache);
        newCache.delete(key);
        setCache(newCache);
        return null;
      }

      // Update access info
      const updatedItem = {
        ...item,
        accessCount: item.accessCount + 1,
        lastAccessed: now,
      };

      const newCache = new Map(cache);
      newCache.set(key, updatedItem);
      setCache(newCache);

      return item.data;
    },
    [cache]
  );

  const set = useCallback(
    (key: string, data: T, customTtl?: number): void => {
      const now = Date.now();
      const expiresAt = now + (customTtl || ttl);

      const item: CacheItem<T> = {
        data,
        timestamp: now,
        expiresAt,
        accessCount: 0,
        lastAccessed: now,
      };

      const newCache = new Map(cache);
      newCache.set(key, item);
      setCache(newCache);
      updateStats(newCache);
    },
    [cache, ttl, updateStats]
  );

  const has = useCallback(
    (key: string): boolean => {
      const item = cache.get(key);
      if (!item) return false;

      const now = Date.now();
      if (item.expiresAt <= now) {
        const newCache = new Map(cache);
        newCache.delete(key);
        setCache(newCache);
        return false;
      }

      return true;
    },
    [cache]
  );

  const remove = useCallback(
    (key: string): boolean => {
      const newCache = new Map(cache);
      const deleted = newCache.delete(key);
      if (deleted) {
        setCache(newCache);
        updateStats(newCache);
      }
      return deleted;
    },
    [cache, updateStats]
  );

  const clear = useCallback((): void => {
    setCache(new Map());
    setStats({
      hitRate: 0,
      totalItems: 0,
      memoryUsage: 0,
      oldestItem: 0,
      newestItem: 0,
    });
  }, []);

  const getOrSet = useCallback(
    async (
      key: string,
      fetcher: () => Promise<T>,
      customTtl?: number
    ): Promise<T> => {
      const cached = get(key);
      if (cached !== null) {
        return cached;
      }

      try {
        const data = await fetcher();
        set(key, data, customTtl);
        return data;
      } catch (error) {
        console.error("Error fetching data for cache:", error);
        throw error;
      }
    },
    [get, set]
  );

  const preload = useCallback(
    async (
      keys: string[],
      fetcher: (key: string) => Promise<T>,
      customTtl?: number
    ): Promise<void> => {
      const promises = keys.map(async (key) => {
        if (!has(key)) {
          try {
            const data = await fetcher(key);
            set(key, data, customTtl);
          } catch (error) {
            console.error(`Error preloading cache for key ${key}:`, error);
          }
        }
      });

      await Promise.all(promises);
    },
    [has, set]
  );

  const getLRU = useCallback((): string[] => {
    const items = Array.from(cache.entries());
    return items
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
      .map(([key]) => key);
  }, [cache]);

  const getMostAccessed = useCallback((): string[] => {
    const items = Array.from(cache.entries());
    return items
      .sort((a, b) => b[1].accessCount - a[1].accessCount)
      .map(([key]) => key);
  }, [cache]);

  const evictLRU = useCallback(
    (count: number = 1): void => {
      const lruKeys = getLRU().slice(0, count);
      lruKeys.forEach((key) => remove(key));
    },
    [getLRU, remove]
  );

  const evictOldest = useCallback(
    (count: number = 1): void => {
      const items = Array.from(cache.entries());
      const oldestKeys = items
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, count)
        .map(([key]) => key);

      oldestKeys.forEach((key) => remove(key));
    },
    [cache, remove]
  );

  const optimize = useCallback((): void => {
    const maxItems = 100; // Maximum items in cache
    const currentItems = cache.size;

    if (currentItems > maxItems) {
      const toRemove = currentItems - maxItems;
      evictLRU(toRemove);
    }
  }, [cache.size, evictLRU]);

  // Auto-save to localStorage when cache changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveCacheToStorage();
    }, 1000); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [cache, saveCacheToStorage]);

  return {
    get,
    set,
    has,
    remove,
    clear,
    getOrSet,
    preload,
    getLRU,
    getMostAccessed,
    evictLRU,
    evictOldest,
    optimize,
    stats,
    size: cache.size,
  };
};
