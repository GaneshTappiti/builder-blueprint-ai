// Idea Service - Supabase Integration
// Handles idea management with proper database storage instead of localStorage

import { supabase } from '@/lib/supabase';
import { IdeaVaultData, TeamComment, TeamSuggestion } from '@/utils/idea-vault-helpers';

export interface IdeaCreateRequest {
  title: string;
  description?: string;
  category?: string;
  status?: string;
  tags?: string[];
  content?: string;
  is_public?: boolean;
  team_id?: string;
}

export interface IdeaUpdateRequest {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  tags?: string[];
  content?: string;
  is_public?: boolean;
  team_id?: string;
  metadata?: Record<string, any>;
}

export interface IdeaResponse {
  success: boolean;
  idea?: IdeaVaultData;
  error?: string;
}

export interface IdeasListResponse {
  success: boolean;
  ideas?: IdeaVaultData[];
  error?: string;
  total?: number;
}

class IdeaService {
  // Get all ideas for a user
  async getUserIdeas(userId: string): Promise<IdeasListResponse> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          idea_collaborations(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ideas = data.map(this.mapDatabaseToIdeaVault);
      return {
        success: true,
        ideas,
        total: ideas.length
      };
    } catch (error) {
      console.error('Error fetching user ideas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ideas'
      };
    }
  }

  // Get public ideas
  async getPublicIdeas(limit: number = 50, offset: number = 0): Promise<IdeasListResponse> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          idea_collaborations(*)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const ideas = data.map(this.mapDatabaseToIdeaVault);
      return {
        success: true,
        ideas,
        total: ideas.length
      };
    } catch (error) {
      console.error('Error fetching public ideas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch public ideas'
      };
    }
  }

  // Get a specific idea by ID
  async getIdea(ideaId: string, userId?: string): Promise<IdeaResponse> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          idea_collaborations(*)
        `)
        .eq('id', ideaId)
        .single();

      if (error) throw error;

      // Check if user has access to this idea
      if (data.user_id !== userId && !data.is_public) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const idea = this.mapDatabaseToIdeaVault(data);
      return {
        success: true,
        idea
      };
    } catch (error) {
      console.error('Error fetching idea:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch idea'
      };
    }
  }

  // Create a new idea
  async createIdea(request: IdeaCreateRequest, userId: string): Promise<IdeaResponse> {
    try {
      const ideaData = {
        user_id: userId,
        title: request.title,
        description: request.description || '',
        content: request.content || '',
        category: request.category || 'general',
        status: request.status || 'draft',
        tags: request.tags || [],
        is_public: request.is_public || false,
        team_id: request.team_id || null,
        metadata: {}
      };

      const { data, error } = await supabase
        .from('ideas')
        .insert(ideaData)
        .select()
        .single();

      if (error) throw error;

      const idea = this.mapDatabaseToIdeaVault(data);
      return {
        success: true,
        idea
      };
    } catch (error) {
      console.error('Error creating idea:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create idea'
      };
    }
  }

  // Update an existing idea
  async updateIdea(request: IdeaUpdateRequest, userId: string): Promise<IdeaResponse> {
    try {
      // First check if user owns this idea
      const { data: existingIdea, error: fetchError } = await supabase
        .from('ideas')
        .select('user_id')
        .eq('id', request.id)
        .single();

      if (fetchError) throw fetchError;

      if (existingIdea.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (request.title !== undefined) updateData.title = request.title;
      if (request.description !== undefined) updateData.description = request.description;
      if (request.content !== undefined) updateData.content = request.content;
      if (request.category !== undefined) updateData.category = request.category;
      if (request.status !== undefined) updateData.status = request.status;
      if (request.tags !== undefined) updateData.tags = request.tags;
      if (request.is_public !== undefined) updateData.is_public = request.is_public;
      if (request.team_id !== undefined) updateData.team_id = request.team_id;
      if (request.metadata !== undefined) updateData.metadata = request.metadata;

      const { data, error } = await supabase
        .from('ideas')
        .update(updateData)
        .eq('id', request.id)
        .select()
        .single();

      if (error) throw error;

      const idea = this.mapDatabaseToIdeaVault(data);
      return {
        success: true,
        idea
      };
    } catch (error) {
      console.error('Error updating idea:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update idea'
      };
    }
  }

  // Delete an idea
  async deleteIdea(ideaId: string, userId: string): Promise<IdeaResponse> {
    try {
      // First check if user owns this idea
      const { data: existingIdea, error: fetchError } = await supabase
        .from('ideas')
        .select('user_id')
        .eq('id', ideaId)
        .single();

      if (fetchError) throw fetchError;

      if (existingIdea.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting idea:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete idea'
      };
    }
  }

  // Add team comment to an idea
  async addTeamComment(ideaId: string, userId: string, userName: string, content: string): Promise<IdeaResponse> {
    try {
      // Check if idea exists and is public
      const { data: idea, error: fetchError } = await supabase
        .from('ideas')
        .select('id, is_public')
        .eq('id', ideaId)
        .single();

      if (fetchError) throw fetchError;

      if (!idea.is_public) {
        return {
          success: false,
          error: 'Comments can only be added to public ideas'
        };
      }

      const { data, error } = await supabase
        .from('idea_collaborations')
        .insert({
          idea_id: ideaId,
          user_id: userId,
          collaboration_type: 'comment',
          content: content
        })
        .select()
        .single();

      if (error) throw error;

      // Update idea's comment count
      await supabase
        .from('ideas')
        .update({
          metadata: supabase.raw('metadata || ?', JSON.stringify({ comment_count: 1 }))
        })
        .eq('id', ideaId);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error adding team comment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add comment'
      };
    }
  }

  // Add team suggestion to an idea
  async addTeamSuggestion(
    ideaId: string, 
    userId: string, 
    userName: string, 
    field: string, 
    originalValue: string, 
    suggestedValue: string
  ): Promise<IdeaResponse> {
    try {
      // Check if idea exists and is public
      const { data: idea, error: fetchError } = await supabase
        .from('ideas')
        .select('id, is_public')
        .eq('id', ideaId)
        .single();

      if (fetchError) throw fetchError;

      if (!idea.is_public) {
        return {
          success: false,
          error: 'Suggestions can only be added to public ideas'
        };
      }

      const { data, error } = await supabase
        .from('idea_collaborations')
        .insert({
          idea_id: ideaId,
          user_id: userId,
          collaboration_type: 'suggestion',
          content: JSON.stringify({
            field,
            originalValue,
            suggestedValue,
            status: 'pending'
          })
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error adding team suggestion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add suggestion'
      };
    }
  }

  // Update team status
  async updateTeamStatus(
    ideaId: string, 
    status: 'under_review' | 'in_progress' | 'approved' | 'rejected', 
    userId: string
  ): Promise<IdeaResponse> {
    try {
      // Check if user owns this idea
      const { data: existingIdea, error: fetchError } = await supabase
        .from('ideas')
        .select('user_id, is_public')
        .eq('id', ideaId)
        .single();

      if (fetchError) throw fetchError;

      if (existingIdea.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const { data, error } = await supabase
        .from('ideas')
        .update({
          status: status,
          metadata: supabase.raw('metadata || ?', JSON.stringify({ 
            team_status: status,
            last_modified_by: userId 
          }))
        })
        .eq('id', ideaId)
        .select()
        .single();

      if (error) throw error;

      const idea = this.mapDatabaseToIdeaVault(data);
      return {
        success: true,
        idea
      };
    } catch (error) {
      console.error('Error updating team status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update status'
      };
    }
  }

  // Toggle idea privacy
  async toggleIdeaPrivacy(ideaId: string, userId: string): Promise<IdeaResponse> {
    try {
      // Check if user owns this idea
      const { data: existingIdea, error: fetchError } = await supabase
        .from('ideas')
        .select('user_id, is_public')
        .eq('id', ideaId)
        .single();

      if (fetchError) throw fetchError;

      if (existingIdea.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const { data, error } = await supabase
        .from('ideas')
        .update({
          is_public: !existingIdea.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', ideaId)
        .select()
        .single();

      if (error) throw error;

      const idea = this.mapDatabaseToIdeaVault(data);
      return {
        success: true,
        idea
      };
    } catch (error) {
      console.error('Error toggling idea privacy:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle privacy'
      };
    }
  }

  // Map database record to IdeaVaultData format
  private mapDatabaseToIdeaVault(data: any): IdeaVaultData {
    const collaborations = data.idea_collaborations || [];
    const comments = collaborations.filter((c: any) => c.collaboration_type === 'comment');
    const suggestions = collaborations.filter((c: any) => c.collaboration_type === 'suggestion');

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      tags: data.tags || [],
      votes: data.metadata?.votes || 0,
      comments: comments.length,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: data.user_id,
      validation_score: data.metadata?.validation_score,
      market_opportunity: data.metadata?.market_opportunity,
      risk_assessment: data.metadata?.risk_assessment,
      monetization_strategy: data.metadata?.monetization_strategy,
      key_features: data.metadata?.key_features || [],
      next_steps: data.metadata?.next_steps || [],
      competitor_analysis: data.metadata?.competitor_analysis,
      target_market: data.metadata?.target_market,
      problem_statement: data.metadata?.problem_statement,
      isPrivate: !data.is_public,
      teamId: data.team_id,
      visibility: data.is_public ? 'team' : 'private',
      teamComments: comments.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        userName: c.metadata?.user_name || 'Unknown User',
        content: c.content,
        created_at: c.created_at,
        updated_at: c.created_at
      })),
      teamSuggestions: suggestions.map((s: any) => {
        const suggestionData = JSON.parse(s.content || '{}');
        return {
          id: s.id,
          userId: s.user_id,
          userName: s.metadata?.user_name || 'Unknown User',
          field: suggestionData.field,
          originalValue: suggestionData.originalValue,
          suggestedValue: suggestionData.suggestedValue,
          status: suggestionData.status || 'pending',
          created_at: s.created_at,
          updated_at: s.created_at
        };
      }),
      teamStatus: data.metadata?.team_status || 'under_review',
      lastModifiedBy: data.metadata?.last_modified_by
    };
  }
}

export default new IdeaService();
