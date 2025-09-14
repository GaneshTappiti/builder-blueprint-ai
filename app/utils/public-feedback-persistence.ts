"use client";

import { FeedbackItem, FeedbackReply } from "./ideaforge-persistence";
import { supabase } from '@/lib/supabase';

export interface PublicIdeaData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  feedback: FeedbackItem[];
}

export class PublicFeedbackPersistence {
  private static instance: PublicFeedbackPersistence;
  private readonly STORAGE_KEY = 'public_feedback_data';

  static getInstance(): PublicFeedbackPersistence {
    if (!PublicFeedbackPersistence.instance) {
      PublicFeedbackPersistence.instance = new PublicFeedbackPersistence();
    }
    return PublicFeedbackPersistence.instance;
  }

  // Get all public ideas from Supabase
  async getAllPublicIdeas(): Promise<PublicIdeaData[]> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description || '',
        tags: idea.tags || [],
        createdAt: idea.created_at,
        updatedAt: idea.updated_at,
        feedback: [] // Will be loaded separately
      })) || [];
    } catch (error) {
      console.error('Error loading public ideas from Supabase:', error);
      // Fallback to localStorage
      return this.getLocalPublicIdeas();
    }
  }

  // Get a specific public idea from Supabase
  async getPublicIdea(ideaId: string): Promise<PublicIdeaData | null> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .eq('is_public', true)
        .single();

      if (error) throw error;

      if (data) {
        // Load feedback for this idea
        const feedback = await this.getIdeaFeedback(ideaId);
        
        return {
          id: data.id,
          title: data.title,
          description: data.description || '',
          tags: data.tags || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          feedback: feedback
        };
      }

      return null;
    } catch (error) {
      console.error('Error loading public idea from Supabase:', error);
      // Fallback to localStorage
      return this.getLocalPublicIdea(ideaId);
    }
  }

  // Fallback methods for localStorage
  private getLocalPublicIdeas(): PublicIdeaData[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading public ideas from localStorage:', error);
      return [];
    }
  }

  private getLocalPublicIdea(ideaId: string): PublicIdeaData | null {
    const ideas = this.getLocalPublicIdeas();
    return ideas.find(idea => idea.id === ideaId) || null;
  }

  // Create or update a public idea in Supabase
  async savePublicIdea(ideaData: Partial<PublicIdeaData>): Promise<PublicIdeaData> {
    try {
      const now = new Date().toISOString();
      
      if (ideaData.id) {
        // Update existing idea
        const { data, error } = await supabase
          .from('ideas')
          .update({
            title: ideaData.title,
            description: ideaData.description,
            tags: ideaData.tags,
            is_public: true,
            updated_at: now
          })
          .eq('id', ideaData.id)
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          title: data.title,
          description: data.description || '',
          tags: data.tags || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          feedback: ideaData.feedback || []
        };
      } else {
        // Create new idea
        const { data, error } = await supabase
          .from('ideas')
          .insert({
            title: ideaData.title || 'Untitled Idea',
            description: ideaData.description || '',
            tags: ideaData.tags || [],
            is_public: true,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          title: data.title,
          description: data.description || '',
          tags: data.tags || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          feedback: ideaData.feedback || []
        };
      }
    } catch (error) {
      console.error('Error saving public idea to Supabase:', error);
      // Fallback to localStorage
      return this.saveLocalPublicIdea(ideaData);
    }
  }

  // Fallback method for localStorage
  private saveLocalPublicIdea(ideaData: Partial<PublicIdeaData>): PublicIdeaData {
    const ideas = this.getLocalPublicIdeas();
    const now = new Date().toISOString();
    
    let savedIdea: PublicIdeaData;
    
    if (ideaData.id) {
      // Update existing idea
      const index = ideas.findIndex(i => i.id === ideaData.id);
      if (index >= 0) {
        savedIdea = {
          ...ideas[index],
          ...ideaData,
          updatedAt: now
        } as PublicIdeaData;
        ideas[index] = savedIdea;
      } else {
        // Create new idea if ID doesn't exist
        savedIdea = {
          id: ideaData.id,
          title: ideaData.title || 'Untitled Idea',
          description: ideaData.description || '',
          tags: ideaData.tags || [],
          createdAt: now,
          updatedAt: now,
          feedback: ideaData.feedback || []
        };
        ideas.push(savedIdea);
      }
    } else {
      // Create new idea
      savedIdea = {
        id: this.generateId(),
        title: ideaData.title || 'Untitled Idea',
        description: ideaData.description || '',
        tags: ideaData.tags || [],
        createdAt: now,
        updatedAt: now,
        feedback: ideaData.feedback || []
      };
      ideas.push(savedIdea);
    }

    this.saveToStorage(ideas);
    return savedIdea;
  }

  // Get feedback for a specific idea from Supabase
  async getIdeaFeedback(ideaId: string): Promise<FeedbackItem[]> {
    try {
      const { data, error } = await supabase
        .from('public_feedback')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(feedback => ({
        id: feedback.id,
        author: feedback.is_anonymous ? 'Anonymous' : 'User',
        content: feedback.content || '',
        type: feedback.feedback_type === 'comment' ? 'suggestion' : 'positive',
        timestamp: feedback.created_at,
        likes: 0,
        rating: feedback.rating || 0,
        emojiReaction: '😊' as const,
        replies: []
      })) || [];
    } catch (error) {
      console.error('Error loading feedback from Supabase:', error);
      return [];
    }
  }

  // Add feedback to a public idea in Supabase
  async addFeedback(ideaId: string, feedback: Omit<FeedbackItem, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('public_feedback')
        .insert({
          idea_id: ideaId,
          feedback_type: feedback.type === 'suggestion' ? 'comment' : 'comment',
          content: feedback.content,
          rating: feedback.rating,
          is_anonymous: true,
          metadata: {}
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding feedback to Supabase:', error);
      // Fallback to localStorage
      return this.addLocalFeedback(ideaId, feedback);
    }
  }

  // Fallback method for localStorage
  private addLocalFeedback(ideaId: string, feedback: Omit<FeedbackItem, 'id'>): boolean {
    const idea = this.getLocalPublicIdea(ideaId);
    if (!idea) return false;

    const newFeedback: FeedbackItem = {
      ...feedback,
      id: this.generateId()
    };

    idea.feedback.push(newFeedback);
    idea.updatedAt = new Date().toISOString();
    
    return this.saveLocalPublicIdea(idea) !== null;
  }

  // Update feedback
  updateFeedback(ideaId: string, feedbackId: string, updates: Partial<FeedbackItem>): boolean {
    const idea = this.getPublicIdea(ideaId);
    if (!idea) return false;

    const feedbackIndex = idea.feedback.findIndex(f => f.id === feedbackId);
    if (feedbackIndex === -1) return false;

    idea.feedback[feedbackIndex] = { ...idea.feedback[feedbackIndex], ...updates };
    idea.updatedAt = new Date().toISOString();
    
    return this.savePublicIdea(idea) !== null;
  }

  // Delete feedback
  deleteFeedback(ideaId: string, feedbackId: string): boolean {
    const idea = this.getPublicIdea(ideaId);
    if (!idea) return false;

    idea.feedback = idea.feedback.filter(f => f.id !== feedbackId);
    idea.updatedAt = new Date().toISOString();
    
    return this.savePublicIdea(idea) !== null;
  }

  // Add reply to feedback
  addReply(ideaId: string, feedbackId: string, reply: Omit<FeedbackReply, 'id'>): boolean {
    const idea = this.getPublicIdea(ideaId);
    if (!idea) return false;

    const feedback = idea.feedback.find(f => f.id === feedbackId);
    if (!feedback) return false;

    const newReply: FeedbackReply = {
      ...reply,
      id: this.generateId()
    };

    if (!feedback.replies) {
      feedback.replies = [];
    }
    feedback.replies.push(newReply);
    idea.updatedAt = new Date().toISOString();
    
    return this.savePublicIdea(idea) !== null;
  }

  // Update reply
  updateReply(ideaId: string, feedbackId: string, replyId: string, updates: Partial<FeedbackReply>): boolean {
    const idea = this.getPublicIdea(ideaId);
    if (!idea) return false;

    const feedback = idea.feedback.find(f => f.id === feedbackId);
    if (!feedback || !feedback.replies) return false;

    const replyIndex = feedback.replies.findIndex(r => r.id === replyId);
    if (replyIndex === -1) return false;

    feedback.replies[replyIndex] = { ...feedback.replies[replyIndex], ...updates };
    idea.updatedAt = new Date().toISOString();
    
    return this.savePublicIdea(idea) !== null;
  }

  // Delete reply
  deleteReply(ideaId: string, feedbackId: string, replyId: string): boolean {
    const idea = this.getPublicIdea(ideaId);
    if (!idea) return false;

    const feedback = idea.feedback.find(f => f.id === feedbackId);
    if (!feedback || !feedback.replies) return false;

    feedback.replies = feedback.replies.filter(r => r.id !== replyId);
    idea.updatedAt = new Date().toISOString();
    
    return this.savePublicIdea(idea) !== null;
  }

  // Create a public idea from an existing idea
  createPublicIdeaFromIdea(idea: any): PublicIdeaData {
    const publicIdea: PublicIdeaData = {
      id: idea.id,
      title: idea.title || 'Untitled Idea',
      description: idea.description || '',
      tags: idea.tags || [],
      createdAt: idea.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      feedback: idea.feedback || []
    };

    return this.savePublicIdea(publicIdea);
  }

  // Check if idea exists in public storage
  async isPublicIdea(ideaId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('id')
        .eq('id', ideaId)
        .eq('is_public', true)
        .single();

      if (error) return false;
      return !!data;
    } catch (error) {
      console.error('Error checking if idea is public:', error);
      // Fallback to localStorage
      return this.getLocalPublicIdea(ideaId) !== null;
    }
  }

  // Sync with authenticated user's data (if available)
  syncWithAuthenticatedData(ideaId: string, authenticatedData: any): boolean {
    if (!authenticatedData) return false;

    const publicIdea = this.getPublicIdea(ideaId);
    if (!publicIdea) {
      // Create public version from authenticated data
      this.createPublicIdeaFromIdea(authenticatedData);
      return true;
    }

    // Merge feedback from authenticated data
    if (authenticatedData.feedback && Array.isArray(authenticatedData.feedback)) {
      const existingFeedbackIds = new Set(publicIdea.feedback.map(f => f.id));
      const newFeedback = authenticatedData.feedback.filter((f: FeedbackItem) => !existingFeedbackIds.has(f.id));
      
      if (newFeedback.length > 0) {
        publicIdea.feedback.push(...newFeedback);
        publicIdea.updatedAt = new Date().toISOString();
        this.savePublicIdea(publicIdea);
      }
    }

    return true;
  }

  private saveToStorage(ideas: PublicIdeaData[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ideas));
    } catch (error) {
      console.error('Error saving public ideas:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const publicFeedbackPersistence = PublicFeedbackPersistence.getInstance();
