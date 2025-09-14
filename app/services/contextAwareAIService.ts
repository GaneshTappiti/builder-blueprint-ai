/**
 * Context-Aware AI Service
 * Integrates user profile, project context, and behavioral data
 * to provide personalized AI responses
 */

import { enhancedAIService, type EnhancedAIOptions } from './enhancedAIService';
import { multiModelAIService, type ModelSelectionCriteria } from './multiModelAIService';
import { profileIntegrationService } from './profileIntegrationService';

export interface UserContext {
  id: string;
  name: string;
  industry: string;
  experience: 'beginner' | 'intermediate' | 'expert';
  role: 'founder' | 'developer' | 'designer' | 'marketer' | 'investor' | 'consultant';
  preferences: {
    communicationStyle: 'technical' | 'business' | 'casual' | 'formal';
    detailLevel: 'high' | 'medium' | 'low';
    focusAreas: string[];
    avoidTopics: string[];
  };
  behavior: {
    averageSessionLength: number;
    preferredCategories: string[];
    interactionHistory: string[];
    successPatterns: string[];
  };
  projectContext?: {
    currentProject: string;
    projectStage: 'ideation' | 'validation' | 'development' | 'launch' | 'growth';
    teamSize: number;
    budget: 'low' | 'medium' | 'high';
    timeline: 'urgent' | 'normal' | 'flexible';
    technologies: string[];
  };
}

export interface ContextualResponse {
  text: string;
  confidence: number;
  personalization: {
    adaptedToUser: boolean;
    contextUsed: string[];
    recommendations: string[];
  };
  metadata: {
    model: string;
    processingTime: number;
    contextScore: number;
    timestamp: string;
  };
}

class ContextAwareAIService {
  private userContextCache = new Map<string, UserContext>();

  /**
   * Set user context for personalized responses
   */
  setUserContext(userId: string, context: UserContext): void {
    this.userContextCache.set(userId, context);
  }

  /**
   * Get user context
   */
  async getUserContext(userId: string): Promise<UserContext | null> {
    try {
      const integrationData = await profileIntegrationService.getProfileIntegrationData(userId);
      return integrationData.userContext;
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  /**
   * Generate personalized business ideas
   */
  async generatePersonalizedBusinessIdeas(
    category: string,
    userId: string,
    options: EnhancedAIOptions = {}
  ): Promise<ContextualResponse> {
    const userContext = await this.getUserContext(userId);
    const startTime = Date.now();

    // Build personalized prompt based on user context
    let personalizedPrompt = this.buildPersonalizedPrompt(category, userContext);
    
    // Select optimal model based on user preferences
    const modelCriteria: ModelSelectionCriteria = this.selectModelForUser(userContext, 'idea_generation');
    
    // Generate content with context
    const response = await multiModelAIService.generateContent(
      personalizedPrompt,
      modelCriteria,
      {
        context: userContext?.projectContext?.currentProject,
        temperature: this.getOptimalTemperature(userContext),
        maxTokens: this.getOptimalTokenLimit(userContext)
      }
    );

    const processingTime = Date.now() - startTime;

    return {
      text: response.text,
      confidence: response.confidence,
      personalization: {
        adaptedToUser: !!userContext,
        contextUsed: this.extractUsedContext(userContext),
        recommendations: this.generateRecommendations(userContext, category)
      },
      metadata: {
        model: response.model,
        processingTime,
        contextScore: this.calculateContextScore(userContext),
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Generate personalized market analysis
   */
  async generatePersonalizedMarketAnalysis(
    idea: string,
    userId: string,
    options: EnhancedAIOptions = {}
  ): Promise<ContextualResponse> {
    const userContext = await this.getUserContext(userId);
    const startTime = Date.now();

    let personalizedPrompt = this.buildMarketAnalysisPrompt(idea, userContext);
    
    const modelCriteria: ModelSelectionCriteria = this.selectModelForUser(userContext, 'market_analysis');
    
    const response = await multiModelAIService.generateContent(
      personalizedPrompt,
      modelCriteria,
      {
        context: userContext?.projectContext?.currentProject,
        temperature: this.getOptimalTemperature(userContext),
        maxTokens: this.getOptimalTokenLimit(userContext)
      }
    );

    const processingTime = Date.now() - startTime;

    return {
      text: response.text,
      confidence: response.confidence,
      personalization: {
        adaptedToUser: !!userContext,
        contextUsed: this.extractUsedContext(userContext),
        recommendations: this.generateRecommendations(userContext, 'market_analysis')
      },
      metadata: {
        model: response.model,
        processingTime,
        contextScore: this.calculateContextScore(userContext),
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Build personalized prompt based on user context
   */
  private buildPersonalizedPrompt(category: string, userContext: UserContext | null): string {
    if (!userContext) {
      return `Generate 5 innovative startup ideas in the ${category} category with detailed market analysis.`;
    }

    const { role, experience, preferences, projectContext } = userContext;
    
    let prompt = `You are a senior startup advisor with 15+ years of experience. Generate 5 sophisticated startup ideas in the ${category} category specifically tailored for a ${role} with ${experience} experience level.`;

    // Add role-specific guidance
    if (role === 'founder') {
      prompt += ` Focus on ideas that are fundable, scalable, and have clear paths to profitability. Include specific funding requirements and investor appeal.`;
    } else if (role === 'developer') {
      prompt += ` Focus on ideas with interesting technical challenges and clear implementation roadmaps. Include specific technology stack recommendations.`;
    } else if (role === 'designer') {
      prompt += ` Focus on ideas with strong user experience opportunities and design innovation potential. Include specific UX/UI considerations.`;
    } else if (role === 'marketer') {
      prompt += ` Focus on ideas with clear go-to-market strategies and strong brand potential. Include specific marketing and customer acquisition strategies.`;
    } else if (role === 'investor') {
      prompt += ` Focus on ideas with high growth potential and strong return on investment. Include specific market size and exit strategy considerations.`;
    }

    // Add experience level guidance
    if (experience === 'beginner') {
      prompt += ` Provide detailed explanations and step-by-step guidance for each idea. Include common pitfalls to avoid and learning resources.`;
    } else if (experience === 'expert') {
      prompt += ` Focus on advanced strategies, competitive differentiation, and sophisticated market analysis. Assume deep industry knowledge.`;
    }

    // Add communication style
    if (preferences.communicationStyle === 'technical') {
      prompt += ` Use technical terminology and include specific implementation details.`;
    } else if (preferences.communicationStyle === 'business') {
      prompt += ` Focus on business metrics, market opportunities, and financial projections.`;
    } else if (preferences.communicationStyle === 'casual') {
      prompt += ` Use conversational tone and avoid overly formal language.`;
    }

    // Add project context
    if (projectContext) {
      prompt += ` Consider the user's current project stage (${projectContext.projectStage}) and team size (${projectContext.teamSize}).`;
      if (projectContext.budget) {
        prompt += ` Budget considerations: ${projectContext.budget}.`;
      }
      if (projectContext.timeline) {
        prompt += ` Timeline: ${projectContext.timeline}.`;
      }
    }

    return prompt;
  }

  /**
   * Build personalized market analysis prompt
   */
  private buildMarketAnalysisPrompt(idea: string, userContext: UserContext | null): string {
    if (!userContext) {
      return `Provide comprehensive market analysis for this startup idea: "${idea}".`;
    }

    const { role, experience, preferences } = userContext;
    
    let prompt = `As a senior market analyst, provide comprehensive market analysis for this startup idea: "${idea}".`;
    
    // Add role-specific analysis focus
    if (role === 'founder') {
      prompt += ` Focus on market size, competitive landscape, customer acquisition costs, and revenue potential.`;
    } else if (role === 'investor') {
      prompt += ` Focus on market opportunity, competitive moats, scalability potential, and exit strategies.`;
    } else if (role === 'developer') {
      prompt += ` Include technical market trends, technology adoption rates, and implementation challenges.`;
    }

    // Add experience level detail
    if (experience === 'beginner') {
      prompt += ` Provide detailed explanations of market analysis concepts and include actionable next steps.`;
    } else if (experience === 'expert') {
      prompt += ` Include advanced market analysis techniques and sophisticated competitive intelligence.`;
    }

    return prompt;
  }

  /**
   * Select optimal model based on user context
   */
  private selectModelForUser(userContext: UserContext | null, task: 'idea_generation' | 'market_analysis'): ModelSelectionCriteria {
    if (!userContext) {
      return {
        task,
        complexity: 'medium',
        speed: 'medium',
        quality: 'good',
        budget: 'medium'
      };
    }

    const { experience, projectContext } = userContext;
    
    let complexity: 'simple' | 'medium' | 'complex' = 'medium';
    let quality: 'basic' | 'good' | 'excellent' = 'good';
    let budget: 'low' | 'medium' | 'high' = 'medium';

    // Adjust based on experience level
    if (experience === 'expert') {
      complexity = 'complex';
      quality = 'excellent';
    } else if (experience === 'beginner') {
      complexity = 'simple';
      quality = 'good';
    }

    // Adjust based on project context
    if (projectContext) {
      if (projectContext.budget === 'high') {
        budget = 'high';
        quality = 'excellent';
      } else if (projectContext.budget === 'low') {
        budget = 'low';
      }

      if (projectContext.timeline === 'urgent') {
        complexity = 'simple';
      }
    }

    return {
      task,
      complexity,
      speed: 'medium',
      quality,
      budget
    };
  }

  /**
   * Get optimal temperature based on user preferences
   */
  private getOptimalTemperature(userContext: UserContext | null): number {
    if (!userContext) return 0.7;

    const { preferences, experience } = userContext;
    
    if (preferences.communicationStyle === 'casual' || experience === 'expert') {
      return 0.8; // More creative/innovative
    } else if (preferences.communicationStyle === 'technical') {
      return 0.6; // More focused/technical
    }
    
    return 0.7; // Balanced
  }

  /**
   * Get optimal token limit based on user preferences
   */
  private getOptimalTokenLimit(userContext: UserContext | null): number {
    if (!userContext) return 2000;

    const { preferences, experience } = userContext;
    
    if (preferences.detailLevel === 'high' || experience === 'expert') {
      return 4000;
    } else if (preferences.detailLevel === 'low') {
      return 1000;
    }
    
    return 2000;
  }

  /**
   * Extract used context for transparency
   */
  private extractUsedContext(userContext: UserContext | null): string[] {
    if (!userContext) return [];

    const used = [];
    if (userContext.role) used.push(`role:${userContext.role}`);
    if (userContext.experience) used.push(`experience:${userContext.experience}`);
    if (userContext.preferences.communicationStyle) used.push(`style:${userContext.preferences.communicationStyle}`);
    if (userContext.projectContext?.projectStage) used.push(`stage:${userContext.projectContext.projectStage}`);
    
    return used;
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(userContext: UserContext | null, category: string): string[] {
    if (!userContext) return [];

    const recommendations = [];
    
    if (userContext.role === 'founder') {
      recommendations.push('Consider creating a pitch deck for these ideas');
      recommendations.push('Research similar startups in your target market');
    } else if (userContext.role === 'developer') {
      recommendations.push('Create technical prototypes for validation');
      recommendations.push('Research relevant APIs and frameworks');
    }
    
    if (userContext.experience === 'beginner') {
      recommendations.push('Join startup communities for mentorship');
      recommendations.push('Consider taking entrepreneurship courses');
    }
    
    return recommendations;
  }

  /**
   * Calculate context score (0-1)
   */
  private calculateContextScore(userContext: UserContext | null): number {
    if (!userContext) return 0;

    let score = 0;
    if (userContext.role) score += 0.2;
    if (userContext.experience) score += 0.2;
    if (userContext.preferences.communicationStyle) score += 0.2;
    if (userContext.preferences.detailLevel) score += 0.1;
    if (userContext.projectContext) score += 0.3;
    
    return Math.min(score, 1);
  }
}

export const contextAwareAIService = new ContextAwareAIService();
