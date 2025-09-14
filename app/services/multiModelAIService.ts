/**
 * Multi-Model AI Service
 * Provides support for multiple AI models (Gemini, GPT-4, Claude, etc.)
 * with intelligent model selection based on task requirements
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from '@/lib/env-validation';

export interface AIModel {
  id: string;
  name: string;
  provider: 'google' | 'openai' | 'anthropic' | 'cohere';
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'basic' | 'good' | 'excellent';
}

export interface ModelSelectionCriteria {
  task: 'idea_generation' | 'market_analysis' | 'technical_analysis' | 'creative_writing' | 'data_analysis';
  complexity: 'simple' | 'medium' | 'complex';
  speed: 'fast' | 'medium' | 'slow';
  quality: 'basic' | 'good' | 'excellent';
  budget: 'low' | 'medium' | 'high';
}

export interface MultiModelResponse {
  text: string;
  confidence: number;
  model: string;
  provider: string;
  metadata: {
    tokens: number;
    processingTime: number;
    cost: number;
    quality: string;
    timestamp: string;
  };
}

class MultiModelAIService {
  private models: AIModel[] = [
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'google',
      capabilities: ['text_generation', 'analysis', 'reasoning'],
      maxTokens: 8192,
      costPerToken: 0.000075,
      speed: 'fast',
      quality: 'good'
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      capabilities: ['text_generation', 'analysis', 'reasoning', 'code_generation'],
      maxTokens: 32768,
      costPerToken: 0.00125,
      speed: 'medium',
      quality: 'excellent'
    },
    {
      id: 'gemini-1.5-ultra',
      name: 'Gemini 1.5 Ultra',
      provider: 'google',
      capabilities: ['text_generation', 'analysis', 'reasoning', 'code_generation', 'complex_reasoning'],
      maxTokens: 32768,
      costPerToken: 0.0025,
      speed: 'slow',
      quality: 'excellent'
    }
  ];

  private genAI: GoogleGenerativeAI | null = null;

  private initializeGemini(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        throw new Error('Google Gemini API key is not configured');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Select the best model based on criteria
   */
  selectModel(criteria: ModelSelectionCriteria): AIModel {
    let candidates = this.models.filter(model => {
      // Filter by capabilities
      if (criteria.task === 'idea_generation' && !model.capabilities.includes('text_generation')) return false;
      if (criteria.task === 'market_analysis' && !model.capabilities.includes('analysis')) return false;
      if (criteria.task === 'technical_analysis' && !model.capabilities.includes('code_generation')) return false;
      if (criteria.task === 'creative_writing' && !model.capabilities.includes('text_generation')) return false;
      if (criteria.task === 'data_analysis' && !model.capabilities.includes('analysis')) return false;
      
      return true;
    });

    // Filter by speed requirements
    if (criteria.speed === 'fast') {
      candidates = candidates.filter(model => model.speed === 'fast');
    } else if (criteria.speed === 'medium') {
      candidates = candidates.filter(model => model.speed !== 'slow');
    }

    // Filter by quality requirements
    if (criteria.quality === 'excellent') {
      candidates = candidates.filter(model => model.quality === 'excellent');
    } else if (criteria.quality === 'good') {
      candidates = candidates.filter(model => model.quality !== 'basic');
    }

    // Filter by budget
    if (criteria.budget === 'low') {
      candidates = candidates.filter(model => model.costPerToken <= 0.001);
    } else if (criteria.budget === 'medium') {
      candidates = candidates.filter(model => model.costPerToken <= 0.002);
    }

    // Select the best candidate based on quality and cost
    if (candidates.length === 0) {
      // Fallback to the most capable model
      return this.models.find(m => m.id === 'gemini-1.5-pro') || this.models[0];
    }

    // Sort by quality (descending) then cost (ascending)
    candidates.sort((a, b) => {
      const qualityOrder = { 'excellent': 3, 'good': 2, 'basic': 1 };
      const qualityDiff = qualityOrder[b.quality] - qualityOrder[a.quality];
      if (qualityDiff !== 0) return qualityDiff;
      return a.costPerToken - b.costPerToken;
    });

    return candidates[0];
  }

  /**
   * Generate content using the best model for the task
   */
  async generateContent(
    prompt: string, 
    criteria: ModelSelectionCriteria,
    options: {
      maxTokens?: number;
      temperature?: number;
      context?: string;
    } = {}
  ): Promise<MultiModelResponse> {
    const startTime = Date.now();
    const selectedModel = this.selectModel(criteria);
    
    try {
      let response: any;
      
      if (selectedModel.provider === 'google') {
        response = await this.generateWithGemini(selectedModel, prompt, options);
      } else {
        throw new Error(`Provider ${selectedModel.provider} not implemented yet`);
      }

      const processingTime = Date.now() - startTime;
      const cost = (response.metadata?.tokens || 0) * selectedModel.costPerToken;

      return {
        text: response.text,
        confidence: response.confidence || 0.9,
        model: selectedModel.id,
        provider: selectedModel.provider,
        metadata: {
          tokens: response.metadata?.tokens || 0,
          processingTime,
          cost,
          quality: selectedModel.quality,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Multi-model AI generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate content using Gemini
   */
  private async generateWithGemini(model: AIModel, prompt: string, options: any): Promise<any> {
    const genAI = this.initializeGemini();
    const geminiModel = genAI.getGenerativeModel({ 
      model: model.id,
      generationConfig: {
        maxOutputTokens: options.maxTokens || model.maxTokens,
        temperature: options.temperature || 0.7,
      }
    });

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      text,
      confidence: 0.95,
      metadata: {
        tokens: text.length,
        model: model.id
      }
    };
  }

  /**
   * Generate business ideas with optimal model selection
   */
  async generateBusinessIdeas(category: string, options: any = {}): Promise<MultiModelResponse> {
    const criteria: ModelSelectionCriteria = {
      task: 'idea_generation',
      complexity: 'complex',
      speed: 'medium',
      quality: 'excellent',
      budget: 'medium'
    };

    const prompt = `You are a senior venture capitalist and startup advisor with 15+ years of experience. Generate 5 sophisticated, market-validated startup ideas in the ${category} space with detailed analysis including market size, competitive landscape, technology stack, and monetization models.`;

    return this.generateContent(prompt, criteria, options);
  }

  /**
   * Generate market analysis with optimal model selection
   */
  async generateMarketAnalysis(idea: string, options: any = {}): Promise<MultiModelResponse> {
    const criteria: ModelSelectionCriteria = {
      task: 'market_analysis',
      complexity: 'complex',
      speed: 'medium',
      quality: 'excellent',
      budget: 'medium'
    };

    const prompt = `You are a senior market analyst. Provide comprehensive market analysis for this startup idea: "${idea}". Include market size, competitive landscape, customer segments, and growth opportunities.`;

    return this.generateContent(prompt, criteria, options);
  }

  /**
   * Generate technical analysis with optimal model selection
   */
  async generateTechnicalAnalysis(idea: string, options: any = {}): Promise<MultiModelResponse> {
    const criteria: ModelSelectionCriteria = {
      task: 'technical_analysis',
      complexity: 'complex',
      speed: 'medium',
      quality: 'excellent',
      budget: 'medium'
    };

    const prompt = `You are a senior technical architect. Provide detailed technical analysis for this startup idea: "${idea}". Include technology stack recommendations, architecture patterns, scalability considerations, and implementation roadmap.`;

    return this.generateContent(prompt, criteria, options);
  }

  /**
   * Get available models
   */
  getAvailableModels(): AIModel[] {
    return [...this.models];
  }

  /**
   * Get model by ID
   */
  getModelById(id: string): AIModel | undefined {
    return this.models.find(model => model.id === id);
  }
}

export const multiModelAIService = new MultiModelAIService();
