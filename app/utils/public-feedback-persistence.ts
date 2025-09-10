"use client";

import { FeedbackItem, FeedbackReply } from "./ideaforge-persistence";

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

  // Get all public ideas
  getAllPublicIdeas(): PublicIdeaData[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading public ideas:', error);
      return [];
    }
  }

  // Get a specific public idea
  getPublicIdea(ideaId: string): PublicIdeaData | null {
    const ideas = this.getAllPublicIdeas();
    return ideas.find(idea => idea.id === ideaId) || null;
  }

  // Create or update a public idea
  savePublicIdea(ideaData: Partial<PublicIdeaData>): PublicIdeaData {
    const ideas = this.getAllPublicIdeas();
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

  // Add feedback to a public idea
  addFeedback(ideaId: string, feedback: Omit<FeedbackItem, 'id'>): boolean {
    const idea = this.getPublicIdea(ideaId);
    if (!idea) return false;

    const newFeedback: FeedbackItem = {
      ...feedback,
      id: this.generateId()
    };

    idea.feedback.push(newFeedback);
    idea.updatedAt = new Date().toISOString();
    
    return this.savePublicIdea(idea) !== null;
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
  isPublicIdea(ideaId: string): boolean {
    return this.getPublicIdea(ideaId) !== null;
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
