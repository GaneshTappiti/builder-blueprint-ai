// Public Feedback Service - Supabase Integration
// Handles public feedback system with proper database storage

import { supabase } from '@/lib/supabase';

export interface PublicFeedback {
  id: string;
  idea_id: string;
  user_id?: string;
  feedback_type: 'comment' | 'rating' | 'like' | 'dislike';
  content?: string;
  rating?: number;
  is_anonymous: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FeedbackCreateRequest {
  idea_id: string;
  feedback_type: 'comment' | 'rating' | 'like' | 'dislike';
  content?: string;
  rating?: number;
  is_anonymous?: boolean;
}

export interface FeedbackUpdateRequest {
  id: string;
  content?: string;
  rating?: number;
}

export interface FeedbackResponse {
  success: boolean;
  feedback?: PublicFeedback;
  error?: string;
}

export interface FeedbackListResponse {
  success: boolean;
  feedbacks?: PublicFeedback[];
  error?: string;
  total?: number;
}

class PublicFeedbackService {
  // Get feedback for a specific idea
  async getIdeaFeedback(ideaId: string, limit: number = 50, offset: number = 0): Promise<FeedbackListResponse> {
    try {
      const { data, error } = await supabase
        .from('public_feedback')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        feedbacks: data,
        total: data.length
      };
    } catch (error) {
      console.error('Error fetching idea feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch feedback'
      };
    }
  }

  // Get feedback by a specific user
  async getUserFeedback(userId: string, limit: number = 50, offset: number = 0): Promise<FeedbackListResponse> {
    try {
      const { data, error } = await supabase
        .from('public_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        feedbacks: data,
        total: data.length
      };
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user feedback'
      };
    }
  }

  // Create new feedback
  async createFeedback(request: FeedbackCreateRequest, userId?: string): Promise<FeedbackResponse> {
    try {
      // Validate rating if provided
      if (request.feedback_type === 'rating' && (!request.rating || request.rating < 1 || request.rating > 5)) {
        return {
          success: false,
          error: 'Rating must be between 1 and 5'
        };
      }

      const feedbackData = {
        idea_id: request.idea_id,
        user_id: userId || null,
        feedback_type: request.feedback_type,
        content: request.content || null,
        rating: request.rating || null,
        is_anonymous: request.is_anonymous || false,
        metadata: {}
      };

      const { data, error } = await supabase
        .from('public_feedback')
        .insert(feedbackData)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        feedback: data
      };
    } catch (error) {
      console.error('Error creating feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create feedback'
      };
    }
  }

  // Update existing feedback
  async updateFeedback(request: FeedbackUpdateRequest, userId: string): Promise<FeedbackResponse> {
    try {
      // First check if user owns this feedback
      const { data: existingFeedback, error: fetchError } = await supabase
        .from('public_feedback')
        .select('user_id')
        .eq('id', request.id)
        .single();

      if (fetchError) throw fetchError;

      if (existingFeedback.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (request.content !== undefined) updateData.content = request.content;
      if (request.rating !== undefined) {
        if (request.rating < 1 || request.rating > 5) {
          return {
            success: false,
            error: 'Rating must be between 1 and 5'
          };
        }
        updateData.rating = request.rating;
      }

      const { data, error } = await supabase
        .from('public_feedback')
        .update(updateData)
        .eq('id', request.id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        feedback: data
      };
    } catch (error) {
      console.error('Error updating feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update feedback'
      };
    }
  }

  // Delete feedback
  async deleteFeedback(feedbackId: string, userId: string): Promise<FeedbackResponse> {
    try {
      // First check if user owns this feedback
      const { data: existingFeedback, error: fetchError } = await supabase
        .from('public_feedback')
        .select('user_id')
        .eq('id', feedbackId)
        .single();

      if (fetchError) throw fetchError;

      if (existingFeedback.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const { error } = await supabase
        .from('public_feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete feedback'
      };
    }
  }

  // Get feedback statistics for an idea
  async getIdeaFeedbackStats(ideaId: string): Promise<{
    success: boolean;
    stats?: {
      total_feedback: number;
      average_rating: number;
      likes: number;
      dislikes: number;
      comments: number;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('public_feedback')
        .select('feedback_type, rating')
        .eq('idea_id', ideaId);

      if (error) throw error;

      const stats = {
        total_feedback: data.length,
        average_rating: 0,
        likes: 0,
        dislikes: 0,
        comments: 0
      };

      let totalRating = 0;
      let ratingCount = 0;

      data.forEach(feedback => {
        switch (feedback.feedback_type) {
          case 'rating':
            if (feedback.rating) {
              totalRating += feedback.rating;
              ratingCount++;
            }
            break;
          case 'like':
            stats.likes++;
            break;
          case 'dislike':
            stats.dislikes++;
            break;
          case 'comment':
            stats.comments++;
            break;
        }
      });

      if (ratingCount > 0) {
        stats.average_rating = totalRating / ratingCount;
      }

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch feedback statistics'
      };
    }
  }
}

export default new PublicFeedbackService();
