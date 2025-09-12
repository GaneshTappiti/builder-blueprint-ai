// Production performance optimizations
import React from 'react';
import { monitoring } from './monitoring';

// Image optimization utilities
export function optimizeImageUrl(url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
} = {}): string {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // In production, integrate with image CDN like Cloudinary or ImageKit
  if (url.includes('cloudinary.com')) {
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`, `f_${format}`);
    
    return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
  }
  
  return url;
}

// Message pagination for large chat histories
export interface PaginationOptions {
  page: number;
  limit: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
  total?: number;
}

export function createPaginationQuery(
  baseQuery: any,
  options: PaginationOptions
) {
  const { page, limit, cursor } = options;
  
  if (cursor) {
    // Cursor-based pagination for better performance
    return baseQuery
      .lt('created_at', cursor)
      .order('created_at', { ascending: false })
      .limit(limit);
  } else {
    // Offset-based pagination
    return baseQuery
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
  }
}

// Debounced search for better performance
export function createDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;
  let abortController: AbortController;

  return (query: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      // Cancel previous request
      if (abortController) {
        abortController.abort();
      }
      
      abortController = new AbortController();
      
      // Clear previous timeout
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        try {
          const results = await searchFn(query);
          resolve(results);
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            reject(error);
          }
        }
      }, delay);
    });
  };
}

// Memory management for large datasets
export class DataCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = 100, ttl: number = 5 * 60 * 1000) { // 5 minutes
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: string, data: T): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Bundle splitting utilities
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(() => 
    importFunc().catch(error => {
      monitoring.trackError(error as Error, 'lazy_load_component');
      // Return a fallback component
      return {
        default: (() => React.createElement('div', null, 'Failed to load component')) as T
      };
    })
  );
}

// Service worker caching strategies
export const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
} as const;

export function getCacheStrategy(resource: string): string {
  if (resource.includes('/api/chat/messages')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  if (resource.includes('/api/chat/channels')) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  if (resource.includes('/api/notifications')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  if (resource.match(/\.(js|css|png|jpg|jpeg|gif|svg)$/)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Performance monitoring
export function measureChatPerformance() {
  // Track message rendering performance
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('message-render')) {
        monitoring.trackPerformance('message_render_time', entry.duration);
      }
    }
  });
  
  observer.observe({ entryTypes: ['measure'] });
  
  // Track memory usage
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      monitoring.trackPerformance('memory_usage', memory.usedJSHeapSize);
    }, 30000); // Every 30 seconds
  }
}

// Rate limiting for API calls
export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

export const chatRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
