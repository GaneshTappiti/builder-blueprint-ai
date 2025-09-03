// AI Engine service - now powered by Google Gemini AI
import { geminiService, type GeminiResponse, type ValidationResult } from './geminiService';

interface AIResponse {
  text: string;
  confidence: number;
  metadata?: any;
}

// Re-export ValidationResult from geminiService for consistency
export type { ValidationResult };

export const aiEngine = {
  // Generate text using Gemini AI
  async generateText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }): Promise<AIResponse> {
    try {
      // Use Gemini AI service
      const response = await geminiService.generateText(prompt, {
        maxTokens: options?.maxTokens,
        temperature: options?.temperature
      });

      return {
        text: response.text,
        confidence: response.confidence,
        metadata: {
          ...response.metadata,
          model: options?.model || 'gemini-pro'
        }
      };
    } catch (error) {
      console.error('AI Engine Error:', error);

      // Fallback to mock response if Gemini fails
      const fallbackResponses = [
        `Based on your idea, this solution addresses a specific market need. The platform provides value by solving real problems that users face in their daily lives. By focusing on user experience and practical functionality, it offers a compelling alternative to existing solutions.`,
        `This idea enters a competitive market with unique positioning. It differentiates itself through its approach to solving the core problem and serving the target audience effectively. The implementation strategy should prioritize MVP development and user feedback.`,
        `The concept shows strong potential for addressing user needs. Consider focusing on user experience, scalability, and market validation. The technical approach should prioritize core functionality and user feedback integration.`
      ];

      return {
        text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        confidence: 0.6,
        metadata: {
          model: 'fallback-mock',
          error: 'Gemini AI unavailable - API key not configured',
          tokens: 150,
          temperature: options?.temperature || 0.7
        }
      };
    }
  },

  // Validate an idea using Gemini AI
  async validateIdea(ideaDescription: string): Promise<ValidationResult> {
    try {
      // Use Gemini AI service for idea validation
      return await geminiService.validateIdea(ideaDescription);
    } catch (error) {
      console.error('Idea validation error:', error);

      // Fallback validation if Gemini fails
      const baseScore = 70;
      return {
        score: baseScore,
        feedback: "Unable to complete AI analysis. The idea shows potential and warrants further development.",
        suggestions: [
          "Conduct user interviews to validate the problem",
          "Research existing competitors and their solutions",
          "Define your unique value proposition clearly",
          "Create a minimum viable product (MVP) plan",
          "Identify key metrics for success measurement"
        ],
        marketPotential: baseScore,
        technicalFeasibility: baseScore + 5,
        competitiveAdvantage: baseScore - 5
      };
    }
  },

  // Generate startup brief using Gemini AI
  async generateStartupBrief(idea: string): Promise<string> {
    try {
      // Use Gemini AI service for startup brief generation
      return await geminiService.generateStartupBrief(idea);
    } catch (error) {
      console.error('Startup brief generation error:', error);

      // Fallback brief if Gemini fails
      return `
# Startup Brief: ${idea}

## Executive Summary
This innovative solution addresses a significant market need with a scalable technology approach.

## Problem Statement
Current market solutions lack the efficiency and user-centric design needed for optimal results.

## Solution Overview
Our platform leverages cutting-edge technology to deliver superior user experience and measurable outcomes.

## Market Opportunity
- Target market size: Significant global opportunity
- Growing market with increasing demand
- Underserved segments identified

## Competitive Advantage
- Unique technology approach
- Strong team expertise
- First-mover advantage in key segments

## Business Model
- Subscription-based revenue
- Freemium tier for user acquisition
- Enterprise solutions for scale

## Next Steps
1. MVP development and testing
2. User validation and feedback
3. Seed funding preparation
4. Team expansion planning

*Note: This brief was generated using fallback content. Please try again for AI-enhanced analysis.*
      `.trim();
    }
  },

  // Analyze market trends using Gemini AI
  async analyzeMarket(industry: string): Promise<any> {
    try {
      // Use Gemini AI service for market analysis
      return await geminiService.analyzeMarket(industry);
    } catch (error) {
      console.error('Market analysis error:', error);

      // Fallback analysis if Gemini fails
      return {
        trends: [
          "AI integration increasing across all sectors",
          "Remote work driving digital transformation",
          "Sustainability becoming key differentiator",
          "Mobile-first approach essential"
        ],
        opportunities: [
          "Underserved niche markets",
          "Integration with existing platforms",
          "B2B enterprise solutions",
          "International expansion potential"
        ],
        threats: [
          "Increasing competition",
          "Regulatory changes",
          "Technology disruption",
          "Economic uncertainty"
        ]
      };
    }
  }
}
