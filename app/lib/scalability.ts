// Scalability utilities for production chat system
import { monitoring } from './monitoring';

// Message pagination with cursor-based pagination
export interface MessagePaginationOptions {
  cursor?: string;
  limit: number;
  direction: 'before' | 'after';
}

export interface PaginatedMessages {
  messages: any[];
  hasMore: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

export class MessagePagination {
  private static readonly DEFAULT_LIMIT = 50;
  private static readonly MAX_LIMIT = 100;

  static validateOptions(options: MessagePaginationOptions): MessagePaginationOptions {
    return {
      cursor: options.cursor,
      limit: Math.min(Math.max(options.limit, 1), this.MAX_LIMIT),
      direction: options.direction
    };
  }

  static createPaginationQuery(
    baseQuery: any,
    options: MessagePaginationOptions
  ) {
    const validatedOptions = this.validateOptions(options);
    const { cursor, limit, direction } = validatedOptions;

    let query = baseQuery.limit(limit);

    if (cursor) {
      if (direction === 'before') {
        query = query.lt('created_at', cursor);
      } else {
        query = query.gt('created_at', cursor);
      }
    }

    return query.order('created_at', { ascending: direction === 'after' });
  }
}

// Channel member limits and management
export class ChannelLimits {
  static readonly MAX_MEMBERS_PER_CHANNEL = 1000;
  private static readonly MAX_CHANNELS_PER_TEAM = 100;
  private static readonly MAX_MESSAGE_LENGTH = 2000;

  static validateChannelMembership(channelId: string, currentMemberCount: number): boolean {
    return currentMemberCount < this.MAX_MEMBERS_PER_CHANNEL;
  }

  static validateTeamChannelLimit(teamId: string, currentChannelCount: number): boolean {
    return currentChannelCount < this.MAX_CHANNELS_PER_TEAM;
  }

  static validateMessageLength(content: string): boolean {
    return content.length <= this.MAX_MESSAGE_LENGTH;
  }

  static getChannelCapacity(currentMemberCount: number): number {
    return this.MAX_MEMBERS_PER_CHANNEL - currentMemberCount;
  }
}

// Message retention policies
export interface RetentionPolicy {
  maxAge: number; // in days
  maxMessages: number;
  archiveAfter: number; // in days
}

export class MessageRetention {
  private static readonly DEFAULT_POLICY: RetentionPolicy = {
    maxAge: 365, // 1 year
    maxMessages: 10000,
    archiveAfter: 30 // 30 days
  };

  static getRetentionPolicy(channelId: string): RetentionPolicy {
    // In production, this would fetch from database
    return this.DEFAULT_POLICY;
  }

  static shouldArchiveMessage(message: any, policy: RetentionPolicy): boolean {
    const messageAge = Date.now() - new Date(message.created_at).getTime();
    const ageInDays = messageAge / (1000 * 60 * 60 * 24);
    
    return ageInDays > policy.archiveAfter;
  }

  static shouldDeleteMessage(message: any, policy: RetentionPolicy): boolean {
    const messageAge = Date.now() - new Date(message.created_at).getTime();
    const ageInDays = messageAge / (1000 * 60 * 60 * 24);
    
    return ageInDays > policy.maxAge;
  }
}

// Horizontal scaling utilities
export class ScalingUtils {
  // Connection pooling for database
  static createConnectionPool(config: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
  }) {
    // In production, use a proper connection pool like pg-pool
    return {
      min: config.min,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMillis
    };
  }

  // Load balancing for real-time connections
  static selectRealtimeEndpoint(endpoints: string[]): string {
    // Simple round-robin selection
    const index = Math.floor(Math.random() * endpoints.length);
    return endpoints[index];
  }

  // Sharding strategy for messages
  static getShardKey(channelId: string, shardCount: number): number {
    // Simple hash-based sharding
    let hash = 0;
    for (let i = 0; i < channelId.length; i++) {
      hash = ((hash << 5) - hash + channelId.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % shardCount;
  }
}

// Caching layer for frequently accessed data
export class ChatCache {
  private static cache = new Map<string, { data: any; expires: number }>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  static get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  static invalidate(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  static clear(): void {
    this.cache.clear();
  }
}

// Rate limiting for different user tiers
export class TieredRateLimiter {
  private static readonly TIERS = {
    free: { requests: 100, window: 60000 }, // 100 requests per minute
    pro: { requests: 1000, window: 60000 }, // 1000 requests per minute
    enterprise: { requests: 10000, window: 60000 } // 10000 requests per minute
  };

  private static userTiers = new Map<string, keyof typeof TieredRateLimiter.TIERS>();

  static setUserTier(userId: string, tier: keyof typeof TieredRateLimiter.TIERS): void {
    this.userTiers.set(userId, tier);
  }

  static getUserTier(userId: string): keyof typeof TieredRateLimiter.TIERS {
    return this.userTiers.get(userId) || 'free';
  }

  static getRateLimit(userId: string): { requests: number; window: number } {
    const tier = this.getUserTier(userId);
    return this.TIERS[tier];
  }
}

// Database query optimization
export class QueryOptimizer {
  static optimizeMessageQuery(channelId: string, options: MessagePaginationOptions) {
    // Add proper indexes and query hints
    return {
      channelId,
      ...options,
      // Add query hints for better performance
      useIndex: 'idx_chat_messages_channel_created',
      explain: false
    };
  }

  static optimizeSearchQuery(query: string, channelId?: string) {
    // Use full-text search indexes
    return {
      query,
      channelId,
      useIndex: 'idx_chat_messages_content_search',
      rank: true
    };
  }
}

// Monitoring and alerting for scalability
export class ScalabilityMonitoring {
  static trackMessageVolume(channelId: string, messageCount: number): void {
    monitoring.track('message_volume', {
      channelId,
      messageCount,
      timestamp: Date.now()
    });

    // Alert if volume is too high
    if (messageCount > 1000) {
      monitoring.track('high_message_volume_alert', {
        channelId,
        messageCount
      });
    }
  }

  static trackChannelCapacity(channelId: string, memberCount: number): void {
    monitoring.track('channel_capacity', {
      channelId,
      memberCount,
      utilization: memberCount / ChannelLimits.MAX_MEMBERS_PER_CHANNEL
    });

    // Alert if approaching capacity
    if (memberCount > ChannelLimits.MAX_MEMBERS_PER_CHANNEL * 0.9) {
      monitoring.track('high_channel_capacity_alert', {
        channelId,
        memberCount
      });
    }
  }

  static trackDatabasePerformance(query: string, duration: number): void {
    monitoring.trackPerformance('database_query', duration, { query });

    // Alert if query is too slow
    if (duration > 1000) { // 1 second
      monitoring.track('slow_query_alert', {
        query,
        duration
      });
    }
  }
}
