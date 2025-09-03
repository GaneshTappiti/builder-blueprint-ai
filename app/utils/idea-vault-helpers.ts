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

  // Get a specific idea by ID
  getIdea(id: string): IdeaVaultData | null {
    const ideas = this.getAllIdeas();
    return ideas.find(idea => idea.id === id) || null;
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
      next_steps: storedIdea.content?.nextSteps
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
        ...idea
      } as IdeaVaultData;
      ideas.unshift(savedIdea); // Add to beginning
    }
    
    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ideas));
    return savedIdea;
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
