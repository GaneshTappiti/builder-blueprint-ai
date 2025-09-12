// AI Interaction Service - Supabase Integration
// Handles AI service logging and analytics

import { supabase } from '@/lib/supabase';

export interface AIInteraction {
  id: string;
  user_id: string;
  service: 'gemini' | 'openai' | 'claude' | 'other';
  request_type: string;
  request_data: Record<string, any>;
  response_data: Record<string, any>;
  tokens_used: number;
  cost: number;
  duration_ms: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface AIInteractionCreateRequest {
  service: 'gemini' | 'openai' | 'claude' | 'other';
  request_type: string;
  request_data: Record<string, any>;
  response_data: Record<string, any>;
  tokens_used?: number;
  cost?: number;
  duration_ms?: number;
  success: boolean;
  error_message?: string;
}

export interface AIInteractionResponse {
  success: boolean;
  interaction?: AIInteraction;
  error?: string;
}

export interface AIInteractionListResponse {
  success: boolean;
  interactions?: AIInteraction[];
  error?: string;
  total?: number;
}

export interface AIAnalytics {
  total_interactions: number;
  successful_interactions: number;
  failed_interactions: number;
  total_tokens_used: number;
  total_cost: number;
  average_duration_ms: number;
  interactions_by_service: Record<string, number>;
  interactions_by_type: Record<string, number>;
  daily_interactions: Array<{
    date: string;
    count: number;
    tokens: number;
    cost: number;
  }>;
}

class AIInteractionService {
  // Log an AI interaction
  async logInteraction(request: AIInteractionCreateRequest, userId: string): Promise<AIInteractionResponse> {
    try {
      const interactionData = {
        user_id: userId,
        service: request.service,
        request_type: request.request_type,
        request_data: request.request_data,
        response_data: request.response_data,
        tokens_used: request.tokens_used || 0,
        cost: request.cost || 0,
        duration_ms: request.duration_ms || 0,
        success: request.success,
        error_message: request.error_message || null
      };

      const { data, error } = await supabase
        .from('ai_interactions')
        .insert(interactionData)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        interaction: data
      };
    } catch (error) {
      console.error('Error logging AI interaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to log AI interaction'
      };
    }
  }

  // Get AI interactions for a user
  async getUserInteractions(
    userId: string, 
    limit: number = 50, 
    offset: number = 0,
    service?: string,
    requestType?: string
  ): Promise<AIInteractionListResponse> {
    try {
      let query = supabase
        .from('ai_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (service) {
        query = query.eq('service', service);
      }

      if (requestType) {
        query = query.eq('request_type', requestType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        interactions: data,
        total: data.length
      };
    } catch (error) {
      console.error('Error fetching user AI interactions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch AI interactions'
      };
    }
  }

  // Get AI analytics for a user
  async getUserAnalytics(userId: string, days: number = 30): Promise<{
    success: boolean;
    analytics?: AIAnalytics;
    error?: string;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('ai_interactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const analytics: AIAnalytics = {
        total_interactions: data.length,
        successful_interactions: 0,
        failed_interactions: 0,
        total_tokens_used: 0,
        total_cost: 0,
        average_duration_ms: 0,
        interactions_by_service: {},
        interactions_by_type: {},
        daily_interactions: []
      };

      let totalDuration = 0;

      data.forEach(interaction => {
        if (interaction.success) {
          analytics.successful_interactions++;
        } else {
          analytics.failed_interactions++;
        }

        analytics.total_tokens_used += interaction.tokens_used;
        analytics.total_cost += interaction.cost;
        totalDuration += interaction.duration_ms;

        // Count by service
        analytics.interactions_by_service[interaction.service] = 
          (analytics.interactions_by_service[interaction.service] || 0) + 1;

        // Count by type
        analytics.interactions_by_type[interaction.request_type] = 
          (analytics.interactions_by_type[interaction.request_type] || 0) + 1;
      });

      if (data.length > 0) {
        analytics.average_duration_ms = totalDuration / data.length;
      }

      // Group by day
      const dailyMap = new Map<string, { count: number; tokens: number; cost: number }>();
      
      data.forEach(interaction => {
        const date = interaction.created_at.split('T')[0];
        const existing = dailyMap.get(date) || { count: 0, tokens: 0, cost: 0 };
        existing.count++;
        existing.tokens += interaction.tokens_used;
        existing.cost += interaction.cost;
        dailyMap.set(date, existing);
      });

      analytics.daily_interactions = Array.from(dailyMap.entries()).map(([date, stats]) => ({
        date,
        count: stats.count,
        tokens: stats.tokens,
        cost: stats.cost
      })).sort((a, b) => a.date.localeCompare(b.date));

      return {
        success: true,
        analytics
      };
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch AI analytics'
      };
    }
  }

  // Get service-specific analytics
  async getServiceAnalytics(service: string, days: number = 30): Promise<{
    success: boolean;
    analytics?: {
      total_interactions: number;
      successful_interactions: number;
      failed_interactions: number;
      total_tokens_used: number;
      total_cost: number;
      average_duration_ms: number;
      top_request_types: Array<{ type: string; count: number }>;
    };
    error?: string;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('ai_interactions')
        .select('*')
        .eq('service', service)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const analytics = {
        total_interactions: data.length,
        successful_interactions: 0,
        failed_interactions: 0,
        total_tokens_used: 0,
        total_cost: 0,
        average_duration_ms: 0,
        top_request_types: [] as Array<{ type: string; count: number }>
      };

      let totalDuration = 0;
      const requestTypeCounts = new Map<string, number>();

      data.forEach(interaction => {
        if (interaction.success) {
          analytics.successful_interactions++;
        } else {
          analytics.failed_interactions++;
        }

        analytics.total_tokens_used += interaction.tokens_used;
        analytics.total_cost += interaction.cost;
        totalDuration += interaction.duration_ms;

        // Count request types
        const count = requestTypeCounts.get(interaction.request_type) || 0;
        requestTypeCounts.set(interaction.request_type, count + 1);
      });

      if (data.length > 0) {
        analytics.average_duration_ms = totalDuration / data.length;
      }

      // Get top request types
      analytics.top_request_types = Array.from(requestTypeCounts.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        success: true,
        analytics
      };
    } catch (error) {
      console.error('Error fetching service analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch service analytics'
      };
    }
  }

  // Clean up old interactions (for maintenance)
  async cleanupOldInteractions(daysToKeep: number = 90): Promise<{
    success: boolean;
    deleted_count?: number;
    error?: string;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await supabase
        .from('ai_interactions')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) throw error;

      return {
        success: true,
        deleted_count: data?.length || 0
      };
    } catch (error) {
      console.error('Error cleaning up old interactions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup old interactions'
      };
    }
  }
}

export default new AIInteractionService();
