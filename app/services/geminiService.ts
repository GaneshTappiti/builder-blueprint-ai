import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Get the Gemini Flash model (updated model name)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface GeminiResponse {
  text: string;
  confidence: number;
  metadata?: any;
}

export interface ValidationResult {
  score: number;
  feedback: string;
  suggestions: string[];
  marketPotential: number;
  technicalFeasibility: number;
  competitiveAdvantage: number;
}

export const geminiService = {
  // Generate text using Gemini AI
  async generateText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<GeminiResponse> {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
        confidence: 0.9, // Gemini typically has high confidence
        metadata: {
          model: 'gemini-1.5-flash',
          tokens: text.length, // Approximate token count
          temperature: options?.temperature || 0.7
        }
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate text with Gemini AI');
    }
  },

  // ✅ Roadmap and Planning
  async generateRoadmap(idea: string, timeframe: string = '6 months'): Promise<any> {
    const prompt = `
    Create a detailed ${timeframe} roadmap for this startup idea: "${idea}"

    Please structure the roadmap as follows:

    PHASE 1 (Months 1-2): Foundation
    - [Key milestone 1]
    - [Key milestone 2]
    - [Key milestone 3]

    PHASE 2 (Months 3-4): Development
    - [Key milestone 1]
    - [Key milestone 2]
    - [Key milestone 3]

    PHASE 3 (Months 5-6): Launch & Growth
    - [Key milestone 1]
    - [Key milestone 2]
    - [Key milestone 3]

    KEY METRICS:
    - [Metric 1]
    - [Metric 2]
    - [Metric 3]

    RESOURCES NEEDED:
    - [Resource 1]
    - [Resource 2]
    - [Resource 3]

    Be specific and actionable.
    `;

    try {
      const result = await this.generateText(prompt);
      return this.parseRoadmapResponse(result.text);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw error;
    }
  },

  // ✅ Task Breakdown and Estimation
  async breakdownTasks(feature: string, complexity: 'simple' | 'medium' | 'complex' = 'medium'): Promise<any> {
    const prompt = `
    Break down this feature into detailed tasks: "${feature}"

    Complexity level: ${complexity}

    Please provide:

    TASKS:
    - [Task 1] (Estimated: X hours)
    - [Task 2] (Estimated: X hours)
    - [Task 3] (Estimated: X hours)
    - [Task 4] (Estimated: X hours)
    - [Task 5] (Estimated: X hours)

    TOTAL ESTIMATE: X hours

    DEPENDENCIES:
    - [Dependency 1]
    - [Dependency 2]

    RISKS:
    - [Risk 1]
    - [Risk 2]

    ACCEPTANCE CRITERIA:
    - [Criteria 1]
    - [Criteria 2]
    - [Criteria 3]

    Be specific with time estimates and consider ${complexity} complexity.
    `;

    try {
      const result = await this.generateText(prompt);
      return this.parseTaskBreakdown(result.text);
    } catch (error) {
      console.error('Error breaking down tasks:', error);
      throw error;
    }
  },

  // Validate an idea using Gemini AI
  async validateIdea(ideaDescription: string): Promise<ValidationResult> {
    const prompt = `
    As an expert startup advisor and market analyst, please evaluate this business idea:
    
    "${ideaDescription}"
    
    Please provide a comprehensive analysis in the following format:
    
    OVERALL SCORE: [0-100]
    
    FEEDBACK: [2-3 sentences of overall assessment]
    
    SUGGESTIONS:
    - [Suggestion 1]
    - [Suggestion 2]
    - [Suggestion 3]
    - [Suggestion 4]
    - [Suggestion 5]
    
    MARKET POTENTIAL: [0-100]
    TECHNICAL FEASIBILITY: [0-100]
    COMPETITIVE ADVANTAGE: [0-100]
    
    Please be specific and actionable in your feedback.
    `;

    try {
      const result = await this.generateText(prompt);
      const text = result.text;
      
      // Parse the response to extract structured data
      const scoreMatch = text.match(/OVERALL SCORE:\s*(\d+)/i);
      const feedbackMatch = text.match(/FEEDBACK:\s*(.*?)(?=SUGGESTIONS:|$)/is);
      const suggestionsMatch = text.match(/SUGGESTIONS:\s*(.*?)(?=MARKET POTENTIAL:|$)/is);
      const marketMatch = text.match(/MARKET POTENTIAL:\s*(\d+)/i);
      const technicalMatch = text.match(/TECHNICAL FEASIBILITY:\s*(\d+)/i);
      const competitiveMatch = text.match(/COMPETITIVE ADVANTAGE:\s*(\d+)/i);
      
      // Extract suggestions
      const suggestionsText = suggestionsMatch?.[1] || '';
      const suggestions = suggestionsText
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(suggestion => suggestion.length > 0)
        .slice(0, 5); // Limit to 5 suggestions
      
      return {
        score: parseInt(scoreMatch?.[1] || '75'),
        feedback: feedbackMatch?.[1]?.trim() || 'The idea shows potential and warrants further development.',
        suggestions: suggestions.length > 0 ? suggestions : [
          'Conduct market research to validate demand',
          'Identify key competitors and differentiation',
          'Define target customer segments',
          'Create a minimum viable product plan',
          'Develop a go-to-market strategy'
        ],
        marketPotential: parseInt(marketMatch?.[1] || '70'),
        technicalFeasibility: parseInt(technicalMatch?.[1] || '75'),
        competitiveAdvantage: parseInt(competitiveMatch?.[1] || '65')
      };
    } catch (error) {
      console.error('Error validating idea:', error);
      // Return fallback validation
      return {
        score: 70,
        feedback: 'Unable to complete AI analysis. Please try again later.',
        suggestions: [
          'Conduct market research to validate demand',
          'Identify key competitors and differentiation',
          'Define target customer segments',
          'Create a minimum viable product plan',
          'Develop a go-to-market strategy'
        ],
        marketPotential: 70,
        technicalFeasibility: 75,
        competitiveAdvantage: 65
      };
    }
  },

  // Generate startup brief using Gemini AI
  async generateStartupBrief(idea: string): Promise<string> {
    const prompt = `
    Create a comprehensive startup brief for this business idea: "${idea}"
    
    Please structure the brief with the following sections:
    1. Executive Summary
    2. Problem Statement
    3. Solution Overview
    4. Market Opportunity (include market size estimates)
    5. Competitive Advantage
    6. Business Model
    7. Technology Requirements
    8. Go-to-Market Strategy
    9. Financial Projections (high-level)
    10. Next Steps
    
    Make it professional, detailed, and actionable. Use markdown formatting.
    `;

    try {
      const result = await this.generateText(prompt);
      return result.text;
    } catch (error) {
      console.error('Error generating startup brief:', error);
      return `# Startup Brief: ${idea}\n\n*Unable to generate AI-powered brief. Please try again later.*`;
    }
  },

  // Analyze market trends using Gemini AI
  async analyzeMarket(industry: string): Promise<any> {
    const prompt = `
    Analyze the current market trends for the ${industry} industry. Please provide:
    
    TRENDS:
    - [List 4-5 key current trends]
    
    OPPORTUNITIES:
    - [List 4-5 market opportunities]
    
    THREATS:
    - [List 4-5 potential threats or challenges]
    
    Be specific and focus on actionable insights for startups entering this market.
    `;

    try {
      const result = await this.generateText(prompt);
      const text = result.text;
      
      // Parse the response
      const trendsMatch = text.match(/TRENDS:\s*(.*?)(?=OPPORTUNITIES:|$)/is);
      const opportunitiesMatch = text.match(/OPPORTUNITIES:\s*(.*?)(?=THREATS:|$)/is);
      const threatsMatch = text.match(/THREATS:\s*(.*?)$/is);
      
      const parseList = (text: string) => 
        text.split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim())
          .filter(item => item.length > 0);
      
      return {
        trends: parseList(trendsMatch?.[1] || ''),
        opportunities: parseList(opportunitiesMatch?.[1] || ''),
        threats: parseList(threatsMatch?.[1] || '')
      };
    } catch (error) {
      console.error('Error analyzing market:', error);
      return {
        trends: ['AI integration increasing', 'Remote work transformation', 'Sustainability focus'],
        opportunities: ['Underserved markets', 'Technology gaps', 'Changing consumer behavior'],
        threats: ['Increased competition', 'Regulatory changes', 'Economic uncertainty']
      };
    }
  },

  // ✅ Investor Matching
  async findInvestorMatches(startup: any): Promise<any> {
    const prompt = `
    Based on this startup profile, recommend suitable investor types and strategies:

    Startup: ${startup.name || 'Unnamed Startup'}
    Industry: ${startup.industry || 'Not specified'}
    Stage: ${startup.stage || 'Early stage'}
    Funding needed: ${startup.fundingNeeded || 'Not specified'}

    Please provide:

    INVESTOR TYPES:
    - [Type 1]: [Why they're a good fit]
    - [Type 2]: [Why they're a good fit]
    - [Type 3]: [Why they're a good fit]

    FUNDING STRATEGIES:
    - [Strategy 1]
    - [Strategy 2]
    - [Strategy 3]

    PITCH FOCUS AREAS:
    - [Focus area 1]
    - [Focus area 2]
    - [Focus area 3]

    PREPARATION CHECKLIST:
    - [Item 1]
    - [Item 2]
    - [Item 3]
    `;

    try {
      const result = await this.generateText(prompt);
      return this.parseInvestorMatches(result.text);
    } catch (error) {
      console.error('Error finding investor matches:', error);
      throw error;
    }
  },

  // ✅ Prompt Optimization
  async optimizePrompt(originalPrompt: string, purpose: string): Promise<any> {
    const prompt = `
    Optimize this prompt for better AI results:

    Original prompt: "${originalPrompt}"
    Purpose: ${purpose}

    Please provide:

    OPTIMIZED PROMPT:
    [Your improved version here]

    IMPROVEMENTS MADE:
    - [Improvement 1]
    - [Improvement 2]
    - [Improvement 3]

    ADDITIONAL SUGGESTIONS:
    - [Suggestion 1]
    - [Suggestion 2]
    - [Suggestion 3]

    PROMPT STRUCTURE TIPS:
    - [Tip 1]
    - [Tip 2]
    - [Tip 3]
    `;

    try {
      const result = await this.generateText(prompt);
      return this.parsePromptOptimization(result.text);
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      throw error;
    }
  },

  // ✅ Analytics Insights
  async generateInsights(data: any): Promise<any> {
    const prompt = `
    Analyze this data and provide actionable insights:

    Data: ${JSON.stringify(data, null, 2)}

    Please provide:

    KEY INSIGHTS:
    - [Insight 1]
    - [Insight 2]
    - [Insight 3]

    TRENDS IDENTIFIED:
    - [Trend 1]
    - [Trend 2]
    - [Trend 3]

    RECOMMENDATIONS:
    - [Recommendation 1]
    - [Recommendation 2]
    - [Recommendation 3]

    ACTION ITEMS:
    - [Action 1]
    - [Action 2]
    - [Action 3]
    `;

    try {
      const result = await this.generateText(prompt);
      return this.parseAnalyticsInsights(result.text);
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  },

  // ✅ Recommendation Engine
  async generateRecommendations(context: any): Promise<any> {
    const prompt = `
    Based on this context, provide personalized recommendations:

    Context: ${JSON.stringify(context, null, 2)}

    Please provide:

    IMMEDIATE ACTIONS:
    - [Action 1]
    - [Action 2]
    - [Action 3]

    STRATEGIC RECOMMENDATIONS:
    - [Recommendation 1]
    - [Recommendation 2]
    - [Recommendation 3]

    TOOLS & RESOURCES:
    - [Tool/Resource 1]
    - [Tool/Resource 2]
    - [Tool/Resource 3]

    LEARNING OPPORTUNITIES:
    - [Opportunity 1]
    - [Opportunity 2]
    - [Opportunity 3]
    `;

    try {
      const result = await this.generateText(prompt);
      return this.parseRecommendations(result.text);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  },

  // ✅ Writing Assistance
  async improveWriting(text: string, purpose: string): Promise<any> {
    const prompt = `
    Improve this text for ${purpose}:

    Original text: "${text}"

    Please provide:

    IMPROVED VERSION:
    [Your improved version here]

    CHANGES MADE:
    - [Change 1]
    - [Change 2]
    - [Change 3]

    WRITING TIPS:
    - [Tip 1]
    - [Tip 2]
    - [Tip 3]

    TONE ASSESSMENT:
    Current tone: [Assessment]
    Suggested tone: [Suggestion]
    `;

    try {
      const result = await this.generateText(prompt);
      return this.parseWritingImprovement(result.text);
    } catch (error) {
      console.error('Error improving writing:', error);
      throw error;
    }
  },

  // Helper methods for parsing responses
  parseRoadmapResponse(text: string): any {
    const phases = text.match(/PHASE \d+.*?(?=PHASE \d+|KEY METRICS:|$)/gs) || [];
    const metricsMatch = text.match(/KEY METRICS:\s*(.*?)(?=RESOURCES NEEDED:|$)/is);
    const resourcesMatch = text.match(/RESOURCES NEEDED:\s*(.*?)$/is);

    return {
      phases: phases.map(phase => {
        const titleMatch = phase.match(/PHASE \d+[^:]*:(.*?)(?=\n-)/s);
        const tasks = phase.match(/- (.*?)(?=\n|$)/g) || [];
        return {
          title: titleMatch?.[1]?.trim() || 'Phase',
          tasks: tasks.map(task => task.replace(/^- /, '').trim())
        };
      }),
      metrics: this.parseList(metricsMatch?.[1] || ''),
      resources: this.parseList(resourcesMatch?.[1] || '')
    };
  },

  parseTaskBreakdown(text: string): any {
    const tasksMatch = text.match(/TASKS:\s*(.*?)(?=TOTAL ESTIMATE:|$)/is);
    const totalMatch = text.match(/TOTAL ESTIMATE:\s*(\d+)\s*hours/i);
    const dependenciesMatch = text.match(/DEPENDENCIES:\s*(.*?)(?=RISKS:|$)/is);
    const risksMatch = text.match(/RISKS:\s*(.*?)(?=ACCEPTANCE CRITERIA:|$)/is);
    const criteriaMatch = text.match(/ACCEPTANCE CRITERIA:\s*(.*?)$/is);

    const tasks = tasksMatch?.[1]?.split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => {
        const match = line.match(/- (.*?)\s*\(Estimated:\s*(\d+)\s*hours?\)/i);
        return {
          name: match?.[1]?.trim() || line.replace(/^- /, '').trim(),
          estimate: parseInt(match?.[2] || '0')
        };
      }) || [];

    return {
      tasks,
      totalEstimate: parseInt(totalMatch?.[1] || '0'),
      dependencies: this.parseList(dependenciesMatch?.[1] || ''),
      risks: this.parseList(risksMatch?.[1] || ''),
      acceptanceCriteria: this.parseList(criteriaMatch?.[1] || '')
    };
  },

  parseInvestorMatches(text: string): any {
    const typesMatch = text.match(/INVESTOR TYPES:\s*(.*?)(?=FUNDING STRATEGIES:|$)/is);
    const strategiesMatch = text.match(/FUNDING STRATEGIES:\s*(.*?)(?=PITCH FOCUS AREAS:|$)/is);
    const focusMatch = text.match(/PITCH FOCUS AREAS:\s*(.*?)(?=PREPARATION CHECKLIST:|$)/is);
    const checklistMatch = text.match(/PREPARATION CHECKLIST:\s*(.*?)$/is);

    return {
      investorTypes: this.parseList(typesMatch?.[1] || ''),
      strategies: this.parseList(strategiesMatch?.[1] || ''),
      pitchFocus: this.parseList(focusMatch?.[1] || ''),
      checklist: this.parseList(checklistMatch?.[1] || '')
    };
  },

  parsePromptOptimization(text: string): any {
    const optimizedMatch = text.match(/OPTIMIZED PROMPT:\s*(.*?)(?=IMPROVEMENTS MADE:|$)/is);
    const improvementsMatch = text.match(/IMPROVEMENTS MADE:\s*(.*?)(?=ADDITIONAL SUGGESTIONS:|$)/is);
    const suggestionsMatch = text.match(/ADDITIONAL SUGGESTIONS:\s*(.*?)(?=PROMPT STRUCTURE TIPS:|$)/is);
    const tipsMatch = text.match(/PROMPT STRUCTURE TIPS:\s*(.*?)$/is);

    return {
      optimizedPrompt: optimizedMatch?.[1]?.trim() || '',
      improvements: this.parseList(improvementsMatch?.[1] || ''),
      suggestions: this.parseList(suggestionsMatch?.[1] || ''),
      tips: this.parseList(tipsMatch?.[1] || '')
    };
  },

  parseAnalyticsInsights(text: string): any {
    const insightsMatch = text.match(/KEY INSIGHTS:\s*(.*?)(?=TRENDS IDENTIFIED:|$)/is);
    const trendsMatch = text.match(/TRENDS IDENTIFIED:\s*(.*?)(?=RECOMMENDATIONS:|$)/is);
    const recommendationsMatch = text.match(/RECOMMENDATIONS:\s*(.*?)(?=ACTION ITEMS:|$)/is);
    const actionsMatch = text.match(/ACTION ITEMS:\s*(.*?)$/is);

    return {
      insights: this.parseList(insightsMatch?.[1] || ''),
      trends: this.parseList(trendsMatch?.[1] || ''),
      recommendations: this.parseList(recommendationsMatch?.[1] || ''),
      actions: this.parseList(actionsMatch?.[1] || '')
    };
  },

  parseRecommendations(text: string): any {
    const immediateMatch = text.match(/IMMEDIATE ACTIONS:\s*(.*?)(?=STRATEGIC RECOMMENDATIONS:|$)/is);
    const strategicMatch = text.match(/STRATEGIC RECOMMENDATIONS:\s*(.*?)(?=TOOLS & RESOURCES:|$)/is);
    const toolsMatch = text.match(/TOOLS & RESOURCES:\s*(.*?)(?=LEARNING OPPORTUNITIES:|$)/is);
    const learningMatch = text.match(/LEARNING OPPORTUNITIES:\s*(.*?)$/is);

    return {
      immediateActions: this.parseList(immediateMatch?.[1] || ''),
      strategic: this.parseList(strategicMatch?.[1] || ''),
      tools: this.parseList(toolsMatch?.[1] || ''),
      learning: this.parseList(learningMatch?.[1] || '')
    };
  },

  parseWritingImprovement(text: string): any {
    const improvedMatch = text.match(/IMPROVED VERSION:\s*(.*?)(?=CHANGES MADE:|$)/is);
    const changesMatch = text.match(/CHANGES MADE:\s*(.*?)(?=WRITING TIPS:|$)/is);
    const tipsMatch = text.match(/WRITING TIPS:\s*(.*?)(?=TONE ASSESSMENT:|$)/is);
    const toneMatch = text.match(/TONE ASSESSMENT:\s*(.*?)$/is);

    return {
      improvedText: improvedMatch?.[1]?.trim() || '',
      changes: this.parseList(changesMatch?.[1] || ''),
      tips: this.parseList(tipsMatch?.[1] || ''),
      toneAssessment: toneMatch?.[1]?.trim() || ''
    };
  },

  parseList(text: string): string[] {
    return text.split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(item => item.length > 0);
  }
};
