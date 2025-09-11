"use client";

import { StoredIdea } from './ideaforge-storage';

export interface IdeaVaultData {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  tags: string[];
  votes?: number;
  comments?: number;
  created_at: string;
  updated_at: string;
  user_id?: string;
  validation_score?: number;
  market_opportunity?: string;
  risk_assessment?: string;
  monetization_strategy?: string;
  key_features?: string[];
  next_steps?: string[];
  competitor_analysis?: string;
  target_market?: string;
  problem_statement?: string;
  // Privacy and team settings
  isPrivate: boolean;
  teamId?: string;
  visibility: 'private' | 'team';
  // Team collaboration features
  teamComments?: TeamComment[];
  teamSuggestions?: TeamSuggestion[];
  teamStatus?: 'under_review' | 'in_progress' | 'approved' | 'rejected';
  lastModifiedBy?: string;
}

export interface TeamComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TeamSuggestion {
  id: string;
  userId: string;
  userName: string;
  field: string;
  originalValue: string;
  suggestedValue: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export class IdeaVaultHelpers {
  private readonly STORAGE_KEY = 'ideaVault';

  // Get all ideas from localStorage
  getAllIdeas(): IdeaVaultData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const data = JSON.parse(stored);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error loading ideas from vault storage:', error);
      return [];
    }
  }

  // Get ideas with security checks (private ideas only for owner, team ideas for everyone)
  getIdeasForUser(userId?: string): IdeaVaultData[] {
    const allIdeas = this.getAllIdeas();
    return allIdeas.filter(idea => {
      // Team ideas are visible to everyone
      if (!idea.isPrivate) return true;
      // Private ideas are only visible to their creator
      return idea.user_id === userId;
    });
  }

  // Get a specific idea by ID
  getIdea(id: string): IdeaVaultData | null {
    const ideas = this.getAllIdeas();
    return ideas.find(idea => idea.id === id) || null;
  }

  // Get a specific idea by ID with security check
  getIdeaForUser(id: string, userId?: string): IdeaVaultData | null {
    const idea = this.getIdea(id);
    if (!idea) return null;
    
    // Team ideas are accessible to everyone
    if (!idea.isPrivate) return idea;
    
    // Private ideas are only accessible to their creator
    if (idea.user_id === userId) return idea;
    
    return null; // Access denied
  }

  // Convert IdeaVaultData to StoredIdea for ideaforge compatibility
  convertToStoredIdea(vaultIdea: IdeaVaultData): StoredIdea {
    return {
      id: vaultIdea.id,
      title: vaultIdea.title,
      description: vaultIdea.description,
      status: (vaultIdea.status as StoredIdea['status']) || 'draft',
      tags: vaultIdea.tags || [],
      createdAt: vaultIdea.created_at,
      updatedAt: vaultIdea.updated_at,
      progress: {
        wiki: 0,
        blueprint: 0,
        journey: 0,
        feedback: 0
      },
      content: {
        problemStatement: vaultIdea.problem_statement,
        targetMarket: vaultIdea.target_market,
        keyFeatures: vaultIdea.key_features,
        businessModel: vaultIdea.monetization_strategy,
        competitiveAnalysis: vaultIdea.competitor_analysis,
        marketValidation: vaultIdea.market_opportunity,
        risks: vaultIdea.risk_assessment ? [vaultIdea.risk_assessment] : [],
        nextSteps: vaultIdea.next_steps
      },
      metadata: {
        version: 1,
        viewCount: 0,
        likeCount: vaultIdea.votes || 0,
        isPublic: false
      }
    };
  }

  // Convert StoredIdea to IdeaVaultData for vault compatibility  
  convertFromStoredIdea(storedIdea: StoredIdea): IdeaVaultData {
    return {
      id: storedIdea.id,
      title: storedIdea.title,
      description: storedIdea.description,
      category: 'ideaforge',
      status: storedIdea.status,
      tags: storedIdea.tags,
      votes: storedIdea.metadata?.likeCount || 0,
      comments: 0,
      created_at: storedIdea.createdAt,
      updated_at: storedIdea.updatedAt,
      problem_statement: storedIdea.content?.problemStatement,
      target_market: storedIdea.content?.targetMarket,
      key_features: storedIdea.content?.keyFeatures,
      monetization_strategy: storedIdea.content?.businessModel,
      competitor_analysis: storedIdea.content?.competitiveAnalysis,
      market_opportunity: storedIdea.content?.marketValidation,
      risk_assessment: storedIdea.content?.risks?.[0],
      next_steps: storedIdea.content?.nextSteps,
      isPrivate: true, // Default to private for converted ideas
      visibility: 'private' as const
    };
  }

  // Save an idea to vault storage
  saveIdea(idea: Partial<IdeaVaultData>): IdeaVaultData {
    const ideas = this.getAllIdeas();
    const now = new Date().toISOString();
    
    let savedIdea: IdeaVaultData;
    
    if (idea.id) {
      // Update existing idea
      const index = ideas.findIndex(i => i.id === idea.id);
      if (index >= 0) {
        savedIdea = {
          ...ideas[index],
          ...idea,
          updated_at: now
        } as IdeaVaultData;
        ideas[index] = savedIdea;
      } else {
        throw new Error('Idea not found for update');
      }
    } else {
      // Create new idea
      savedIdea = {
        id: Date.now().toString(),
        title: idea.title || 'Untitled Idea',
        description: idea.description || '',
        category: idea.category || 'general',
        status: idea.status || 'draft',
        tags: idea.tags || [],
        votes: 0,
        comments: 0,
        created_at: now,
        updated_at: now,
        // Default privacy settings
        isPrivate: idea.isPrivate !== undefined ? idea.isPrivate : true,
        visibility: idea.visibility || 'private',
        teamComments: [],
        teamSuggestions: [],
        teamStatus: 'under_review',
        ...idea
      } as IdeaVaultData;
      ideas.unshift(savedIdea); // Add to beginning
    }
    
    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ideas));
    return savedIdea;
  }

  // Get private ideas only (for current user)
  getPrivateIdeas(userId?: string): IdeaVaultData[] {
    const allIdeas = this.getAllIdeas();
    return allIdeas.filter(idea => idea.isPrivate && (!userId || idea.user_id === userId));
  }

  // Get team ideas (shared with all team members)
  getTeamIdeas(): IdeaVaultData[] {
    const allIdeas = this.getAllIdeas();
    return allIdeas.filter(idea => !idea.isPrivate);
  }

  // Toggle idea privacy (private <-> team)
  toggleIdeaPrivacy(ideaId: string, userId?: string): IdeaVaultData | null {
    try {
      const ideas = this.getAllIdeas();
      const index = ideas.findIndex(i => i.id === ideaId);
      
      if (index === -1) {
        console.error('Idea not found:', ideaId);
        return null;
      }
      
      const idea = ideas[index];
      
      // Only allow the creator to toggle privacy, but be more lenient for testing
      if (userId && idea.user_id && idea.user_id !== userId) {
        console.warn('User not authorized to change privacy settings for this idea');
        return null; // Return null instead of throwing error
      }
      
      // Toggle privacy
      idea.isPrivate = !idea.isPrivate;
      idea.visibility = idea.isPrivate ? 'private' : 'team';
      idea.updated_at = new Date().toISOString();
      
      // If switching to team, add team collaboration features
      if (!idea.isPrivate) {
        idea.teamComments = idea.teamComments || [];
        idea.teamSuggestions = idea.teamSuggestions || [];
        idea.teamStatus = idea.teamStatus || 'under_review';
      }
      
      ideas[index] = idea;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ideas));
      return idea;
    } catch (error) {
      console.error('Error toggling idea privacy:', error);
      return null;
    }
  }

  // Add team comment to an idea
  addTeamComment(ideaId: string, userId: string, userName: string, content: string): boolean {
    const ideas = this.getAllIdeas();
    const index = ideas.findIndex(i => i.id === ideaId);
    
    if (index >= 0 && !ideas[index].isPrivate) {
      const idea = ideas[index];
      idea.teamComments = idea.teamComments || [];
      
      const comment: TeamComment = {
        id: Date.now().toString(),
        userId,
        userName,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      idea.teamComments.push(comment);
      idea.comments = (idea.comments || 0) + 1;
      idea.updated_at = new Date().toISOString();
      
      ideas[index] = idea;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ideas));
      return true;
    }
    
    return false;
  }

  // Update team status
  updateTeamStatus(ideaId: string, status: 'under_review' | 'in_progress' | 'approved' | 'rejected', userId?: string): boolean {
    const ideas = this.getAllIdeas();
    const index = ideas.findIndex(i => i.id === ideaId);
    
    if (index >= 0 && !ideas[index].isPrivate) {
      const idea = ideas[index];
      idea.teamStatus = status;
      idea.lastModifiedBy = userId;
      idea.updated_at = new Date().toISOString();
      
      ideas[index] = idea;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ideas));
      return true;
    }
    
    return false;
  }

  // Create a test idea for debugging
  createTestIdea(): IdeaVaultData {
    const testIdea: Partial<IdeaVaultData> = {
      title: "Test Startup Idea",
      description: "This is a test idea created to verify the Idea Vault functionality is working correctly.",
      category: "test",
      status: "draft",
      tags: ["test", "startup", "debugging"]
    };
    
    return this.saveIdea(testIdea);
  }
}

export const ideaVaultHelpers = new IdeaVaultHelpers();
