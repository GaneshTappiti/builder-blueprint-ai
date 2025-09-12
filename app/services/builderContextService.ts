// Builder Context Service - Supabase Integration
// Handles builder context and project data with proper database storage

import { supabase } from '@/lib/supabase';

export interface BuilderContext {
  id: string;
  user_id: string;
  project_name: string;
  project_data: Record<string, any>;
  app_ideas: any[];
  builder_state: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BuilderContextCreateRequest {
  project_name: string;
  project_data?: Record<string, any>;
  app_ideas?: any[];
  builder_state?: Record<string, any>;
}

export interface BuilderContextUpdateRequest {
  id: string;
  project_name?: string;
  project_data?: Record<string, any>;
  app_ideas?: any[];
  builder_state?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface BuilderContextResponse {
  success: boolean;
  context?: BuilderContext;
  error?: string;
}

export interface BuilderContextListResponse {
  success: boolean;
  contexts?: BuilderContext[];
  error?: string;
  total?: number;
}

class BuilderContextService {
  // Get all builder contexts for a user
  async getUserContexts(userId: string): Promise<BuilderContextListResponse> {
    try {
      const { data, error } = await supabase
        .from('builder_context')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        contexts: data,
        total: data.length
      };
    } catch (error) {
      console.error('Error fetching user contexts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch builder contexts'
      };
    }
  }

  // Get a specific builder context by ID
  async getContext(contextId: string, userId: string): Promise<BuilderContextResponse> {
    try {
      const { data, error } = await supabase
        .from('builder_context')
        .select('*')
        .eq('id', contextId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        context: data
      };
    } catch (error) {
      console.error('Error fetching builder context:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch builder context'
      };
    }
  }

  // Create a new builder context
  async createContext(request: BuilderContextCreateRequest, userId: string): Promise<BuilderContextResponse> {
    try {
      const contextData = {
        user_id: userId,
        project_name: request.project_name,
        project_data: request.project_data || {},
        app_ideas: request.app_ideas || [],
        builder_state: request.builder_state || {},
        metadata: {}
      };

      const { data, error } = await supabase
        .from('builder_context')
        .insert(contextData)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        context: data
      };
    } catch (error) {
      console.error('Error creating builder context:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create builder context'
      };
    }
  }

  // Update an existing builder context
  async updateContext(request: BuilderContextUpdateRequest, userId: string): Promise<BuilderContextResponse> {
    try {
      // First check if user owns this context
      const { data: existingContext, error: fetchError } = await supabase
        .from('builder_context')
        .select('user_id')
        .eq('id', request.id)
        .single();

      if (fetchError) throw fetchError;

      if (existingContext.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (request.project_name !== undefined) updateData.project_name = request.project_name;
      if (request.project_data !== undefined) updateData.project_data = request.project_data;
      if (request.app_ideas !== undefined) updateData.app_ideas = request.app_ideas;
      if (request.builder_state !== undefined) updateData.builder_state = request.builder_state;
      if (request.metadata !== undefined) updateData.metadata = request.metadata;

      const { data, error } = await supabase
        .from('builder_context')
        .update(updateData)
        .eq('id', request.id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        context: data
      };
    } catch (error) {
      console.error('Error updating builder context:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update builder context'
      };
    }
  }

  // Delete a builder context
  async deleteContext(contextId: string, userId: string): Promise<BuilderContextResponse> {
    try {
      // First check if user owns this context
      const { data: existingContext, error: fetchError } = await supabase
        .from('builder_context')
        .select('user_id')
        .eq('id', contextId)
        .single();

      if (fetchError) throw fetchError;

      if (existingContext.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const { error } = await supabase
        .from('builder_context')
        .delete()
        .eq('id', contextId);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting builder context:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete builder context'
      };
    }
  }

  // Get or create default context for a user
  async getOrCreateDefaultContext(userId: string): Promise<BuilderContextResponse> {
    try {
      // Try to get existing default context
      const { data: existingContext, error: fetchError } = await supabase
        .from('builder_context')
        .select('*')
        .eq('user_id', userId)
        .eq('project_name', 'Default Project')
        .single();

      if (existingContext && !fetchError) {
        return {
          success: true,
          context: existingContext
        };
      }

      // Create default context if none exists
      const createResult = await this.createContext({
        project_name: 'Default Project',
        project_data: {},
        app_ideas: [],
        builder_state: {}
      }, userId);

      return createResult;
    } catch (error) {
      console.error('Error getting or creating default context:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get or create default context'
      };
    }
  }
}

export default new BuilderContextService();
