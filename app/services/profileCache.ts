// Profile Cache Service
// Implements caching for profile data to improve performance

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ProfileCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear cache for a specific user
  clearUser(userId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(userId)
    );
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }
}

// Singleton instance
export const profileCache = new ProfileCache();

// Cache key generators
export const getCacheKey = {
  profile: (userId: string) => `profile:${userId}`,
  skills: (userId: string) => `skills:${userId}`,
  certifications: (userId: string) => `certifications:${userId}`,
  languages: (userId: string) => `languages:${userId}`,
  achievements: (userId: string) => `achievements:${userId}`,
  performance: (userId: string) => `performance:${userId}`,
  activity: (userId: string) => `activity:${userId}`,
  analytics: (userId: string) => `analytics:${userId}`,
  search: (filters: any, limit: number, offset: number) => 
    `search:${JSON.stringify(filters)}:${limit}:${offset}`,
};

// Cache TTL constants
export const CACHE_TTL = {
  PROFILE: 5 * 60 * 1000,        // 5 minutes
  SKILLS: 10 * 60 * 1000,        // 10 minutes
  CERTIFICATIONS: 30 * 60 * 1000, // 30 minutes
  LANGUAGES: 30 * 60 * 1000,     // 30 minutes
  ACHIEVEMENTS: 15 * 60 * 1000,  // 15 minutes
  PERFORMANCE: 2 * 60 * 1000,    // 2 minutes
  ACTIVITY: 1 * 60 * 1000,       // 1 minute
  ANALYTICS: 5 * 60 * 1000,      // 5 minutes
  SEARCH: 2 * 60 * 1000,         // 2 minutes
};

// Cleanup expired items every 5 minutes
setInterval(() => {
  profileCache.cleanup();
}, 5 * 60 * 1000);

export default profileCache;
