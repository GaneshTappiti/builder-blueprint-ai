/**
 * RAG Context Client Service
 * Client-side service to call RAG context API
 * Replaces direct server-side RAG service calls from client components
 */

import { RAGTool } from '@/types/ideaforge';

export interface RAGContextResult {
  toolSpecificContext: string;
  architecturePatterns: string;
  bestPractices: string[];
  codeExamples: string[];
  constraints: string[];
  optimizationTips: string[];
}

export interface ContextQuery {
  stage: 'tool_selection' | 'blueprint_generation' | 'prompt_generation' | 'flow_generation';
  toolId?: RAGTool;
  appIdea: string;
  appType?: string;
  platforms?: string[];
  screenName?: string;
}

export class RAGContextClient {
  private static contextCache = new Map<string, RAGContextResult>();

  /**
   * Get RAG context for a specific stage via API
   */
  static async getContextForStage(query: ContextQuery): Promise<RAGContextResult> {
    const cacheKey = this.generateCacheKey(query);

    // Check cache first
    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey)!;
    }

    try {
      const response = await fetch('/api/rag/context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query)
      });

      if (!response.ok) {
        throw new Error(`RAG API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.context) {
        // Cache the result
        this.contextCache.set(cacheKey, result.context);
        return result.context;
      } else {
        throw new Error('Invalid RAG context response');
      }

    } catch (error) {
      console.warn('RAG context API failed, using fallback:', error);
      
      // Return fallback context
      const fallbackContext = this.getFallbackContext(query);
      this.contextCache.set(cacheKey, fallbackContext);
      return fallbackContext;
    }
  }

  /**
   * Get fallback context when RAG API fails
   */
  private static getFallbackContext(query: ContextQuery): RAGContextResult {
    const baseContext: RAGContextResult = {
      toolSpecificContext: '',
      architecturePatterns: '',
      bestPractices: [
        'Follow standard development practices',
        'Ensure proper error handling',
        'Implement responsive design',
        'Use appropriate design patterns'
      ],
      codeExamples: [
        'Standard implementation patterns',
        'Best practice examples'
      ],
      constraints: [
        'Consider platform limitations',
        'Follow security best practices',
        'Ensure accessibility compliance'
      ],
      optimizationTips: [
        'Optimize for performance',
        'Use appropriate design patterns',
        'Implement proper state management'
      ]
    };

    // Add tool-specific fallback context if tool is selected
    if (query.toolId) {
      baseContext.toolSpecificContext = `Using ${query.toolId} for ${query.appType || 'web-app'} development`;
      baseContext.optimizationTips.push(`Optimize for ${query.toolId} workflow`);
    }

    // Add stage-specific context
    switch (query.stage) {
      case 'tool_selection':
        baseContext.bestPractices.push('Choose tools based on project complexity');
        baseContext.optimizationTips.push('Consider team expertise and project timeline');
        break;
      case 'blueprint_generation':
        baseContext.architecturePatterns = 'Component-based architecture with clear separation of concerns';
        baseContext.bestPractices.push('Start with core user flows', 'Define clear data models');
        break;
      case 'prompt_generation':
        baseContext.bestPractices.push('Be specific about layout and components', 'Include interaction behaviors');
        baseContext.codeExamples.push('UI component patterns', 'Interaction examples');
        break;
      case 'flow_generation':
        baseContext.architecturePatterns = 'Clear navigation hierarchy with proper state management';
        baseContext.bestPractices.push('Define clear navigation patterns', 'Plan for error states');
        break;
    }

    return baseContext;
  }

  /**
   * Generate cache key for context query
   */
  private static generateCacheKey(query: ContextQuery): string {
    return `${query.stage}_${query.toolId || 'none'}_${query.appIdea.substring(0, 50)}`;
  }

  /**
   * Clear context cache
   */
  static clearCache(): void {
    this.contextCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.contextCache.size,
      keys: Array.from(this.contextCache.keys())
    };
  }
}

/**
 * Convenience function for backward compatibility
 */
export async function getRAGContextForStage(query: ContextQuery): Promise<RAGContextResult> {
  return RAGContextClient.getContextForStage(query);
}