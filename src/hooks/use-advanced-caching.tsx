import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // in milliseconds
  enablePersistence: boolean;
  compressionEnabled: boolean;
}

class AdvancedCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      enablePersistence: true,
      compressionEnabled: false,
      ...config
    };

    this.loadFromStorage();
    this.startCleanup();
  }

  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // If cache is full, remove least recently used
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.saveToStorage();
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    // Update access info
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private evictLRU(): void {
    let lruKey = '';
    let lruTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  private calculateHitRate(): number {
    let totalAccesses = 0;
    for (const entry of this.cache.values()) {
      totalAccesses += entry.accessCount;
    }
    return totalAccesses / this.cache.size || 0;
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache) {
      size += key.length * 2; // UTF-16 encoding
      size += JSON.stringify(entry.data).length * 2;
      size += 64; // Approximate overhead for entry metadata
    }
    return size;
  }

  private loadFromStorage(): void {
    if (!this.config.enablePersistence || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem('advanced-cache');
      if (stored) {
        const entries = JSON.parse(stored);
        for (const [key, entry] of entries) {
          // Check if entry is still valid
          if (Date.now() - entry.timestamp <= entry.ttl) {
            this.cache.set(key, entry);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (!this.config.enablePersistence || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const entries = Array.from(this.cache.entries());
      localStorage.setItem('advanced-cache', JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
        }
      }
      this.saveToStorage();
    }, 60000); // Cleanup every minute
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

export const useAdvancedCaching = <T = any>(config?: Partial<CacheConfig>) => {
  const cacheRef = useRef<AdvancedCache<T>>();
  const [stats, setStats] = useState({ size: 0, maxSize: 0, hitRate: 0, memoryUsage: 0 });

  useEffect(() => {
    cacheRef.current = new AdvancedCache<T>(config);
    
    return () => {
      if (cacheRef.current) {
        cacheRef.current.destroy();
      }
    };
  }, []);

  const set = useCallback((key: string, data: T, ttl?: number) => {
    if (cacheRef.current) {
      cacheRef.current.set(key, data, ttl);
      setStats(cacheRef.current.getStats());
    }
  }, []);

  const get = useCallback((key: string): T | null => {
    if (cacheRef.current) {
      const result = cacheRef.current.get(key);
      setStats(cacheRef.current.getStats());
      return result;
    }
    return null;
  }, []);

  const has = useCallback((key: string): boolean => {
    return cacheRef.current ? cacheRef.current.has(key) : false;
  }, []);

  const remove = useCallback((key: string): boolean => {
    if (cacheRef.current) {
      const result = cacheRef.current.delete(key);
      setStats(cacheRef.current.getStats());
      return result;
    }
    return false;
  }, []);

  const clear = useCallback(() => {
    if (cacheRef.current) {
      cacheRef.current.clear();
      setStats(cacheRef.current.getStats());
    }
  }, []);

  const getStats = useCallback(() => {
    return cacheRef.current ? cacheRef.current.getStats() : stats;
  }, [stats]);

  // Cached fetch with automatic caching
  const cachedFetch = useCallback(async <R = any>(
    url: string,
    options?: RequestInit,
    cacheTTL?: number
  ): Promise<R> => {
    const cacheKey = `fetch:${url}:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cached = get(cacheKey);
    if (cached) {
      return cached as unknown as R;
    }

    // Fetch and cache
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      set(cacheKey, data as T, cacheTTL);
      return data as R;
    } catch (error) {
      console.error('Cached fetch error:', error);
      throw error;
    }
  }, [get, set]);

  return {
    set,
    get,
    has,
    remove,
    clear,
    stats,
    getStats,
    cachedFetch
  };
};

// Hook for API response caching
export const useApiCache = () => {
  const cache = useAdvancedCaching({
    maxSize: 50,
    defaultTTL: 10 * 60 * 1000, // 10 minutes
    enablePersistence: true
  });

  const cachedQuery = useCallback(async <T = any>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options?: { ttl?: number; forceRefresh?: boolean }
  ): Promise<T> => {
    const { ttl, forceRefresh = false } = options || {};

    if (!forceRefresh && cache.has(queryKey)) {
      return cache.get(queryKey) as T;
    }

    try {
      const data = await queryFn();
      cache.set(queryKey, data, ttl);
      return data;
    } catch (error) {
      // If we have stale data, return it
      const staleData = cache.get(queryKey);
      if (staleData) {
        console.warn('Using stale cache data due to fetch error:', error);
        return staleData as T;
      }
      throw error;
    }
  }, [cache]);

  return {
    ...cache,
    cachedQuery
  };
};