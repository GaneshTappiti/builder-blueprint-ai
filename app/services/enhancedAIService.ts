/**
 * Enhanced AI Service
 * Provides sophisticated, context-aware AI generation with advanced prompting
 * and multi-model support for high-quality business content generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from '@/lib/env-validation';
import { multiModelAIService, type ModelSelectionCriteria } from './multiModelAIService';
import { contextAwareAIService, type UserContext } from './contextAwareAIService';
import { profileIntegrationService } from './profileIntegrationService';

// Enhanced AI models configuration
const AI_MODELS = {
  GEMINI_PRO: 'gemini-1.5-pro',
  GEMINI_FLASH: 'gemini-1.5-flash',
  GEMINI_ULTRA: 'gemini-1.5-ultra'
} as const;

type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];

interface EnhancedAIOptions {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  context?: string;
  industry?: string;
  userProfile?: any;
  projectContext?: any;
}

interface EnhancedAIResponse {
  text: string;
  confidence: number;
  metadata: {
    model: string;
    tokens: number;
    temperature: number;
    processingTime: number;
    contextUsed: boolean;
    industryContext: boolean;
    timestamp: string;
    cost?: number;
    personalization?: any;
  };
}

class EnhancedAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelCache = new Map<string, any>();

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

  private getModel(modelName: AIModel) {
    if (!this.modelCache.has(modelName)) {
      const genAI = this.initializeGemini();
      const model = genAI.getGenerativeModel({ model: modelName });
      this.modelCache.set(modelName, model);
    }
    return this.modelCache.get(modelName);
  }

  /**
   * Generate sophisticated business ideas with market research context
   */
  async generateBusinessIdeas(category: string, options: EnhancedAIOptions = {}): Promise<EnhancedAIResponse> {
    const industryContext = this.getIndustryContext(options.industry || category);
    const marketTrends = this.getMarketTrends(category);
    
    const prompt = `You are a senior venture capitalist and startup advisor with 15+ years of experience in ${category} and emerging technologies. You've helped launch 200+ successful startups and have deep market insights.

INDUSTRY CONTEXT:
${industryContext}

CURRENT MARKET TRENDS (2024-2025):
${marketTrends}

TASK: Generate 5 highly sophisticated, market-validated startup ideas in the ${category} space.

For each idea, provide:

1. **COMPELLING TITLE** (2-4 words that capture the essence)
2. **PROBLEM STATEMENT** (Specific, quantified problem with market size data)
3. **WHY NOW** (3-4 specific market forces, technology shifts, or regulatory changes)
4. **TARGET AUDIENCE** (Specific personas with demographics, pain points, and buying behavior)
5. **UNIQUE VALUE PROPOSITION** (Clear differentiation from existing solutions)
6. **MARKET OPPORTUNITY** (TAM/SAM/SOM with specific numbers)
7. **TECHNOLOGY STACK** (Specific technologies that enable this solution)
8. **COMPETITIVE LANDSCAPE** (Key competitors and our advantages)
9. **MONETIZATION MODEL** (Specific revenue streams with pricing)
10. **GO-TO-MARKET STRATEGY** (Specific channels and tactics)

REQUIREMENTS:
- Ideas must be based on REAL market gaps and opportunities
- Include specific data points, statistics, and market research
- Focus on ideas that can realistically achieve $10M+ ARR within 3 years
- Consider current technology capabilities and market readiness
- Avoid generic or over-saturated concepts
- Each idea should have clear competitive moats

FORMAT: Return as structured JSON with detailed analysis for each idea.

Focus on ${category} innovations that leverage AI, automation, data analytics, or emerging technologies.`;

    return this.generateWithContext(prompt, {
      ...options,
      model: AI_MODELS.GEMINI_PRO,
      temperature: 0.8
    });
  }

  /**
   * Generate sophisticated problem statements with market validation
   */
  async generateProblemStatement(idea: string, options: EnhancedAIOptions = {}): Promise<EnhancedAIResponse> {
    const prompt = `You are a market research analyst and startup consultant specializing in problem validation and market sizing.

IDEA: "${idea}"

TASK: Create a comprehensive, data-driven problem statement that would convince investors and customers.

STRUCTURE YOUR RESPONSE AS:

**PROBLEM STATEMENT**
[2-3 sentences describing the specific, painful problem]

**PROBLEM VALIDATION**
- Market Size: [Specific TAM/SAM with sources]
- Problem Severity: [Quantified impact on target users]
- Current Solutions Gap: [What existing solutions fail to address]
- Cost of Inaction: [Financial/operational impact of not solving this]

**TARGET USER PAIN POINTS**
1. [Specific pain point with user quote/example]
2. [Specific pain point with user quote/example]
3. [Specific pain point with user quote/example]

**MARKET EVIDENCE**
- Industry reports showing this problem
- Customer research data
- Competitive analysis gaps
- Regulatory/economic factors driving urgency

**PROBLEM-SOLUTION FIT**
[How your solution directly addresses each pain point]

**SUCCESS METRICS**
- How you'll measure if the problem is truly solved
- Leading indicators of problem-solution fit
- User adoption and retention metrics

Make this compelling, specific, and backed by real market data. Avoid generic statements.`;

    return this.generateWithContext(prompt, {
      ...options,
      model: AI_MODELS.GEMINI_PRO,
      temperature: 0.7
    });
  }

  /**
   * Generate sophisticated target audience analysis
   */
  async generateTargetAudience(idea: string, options: EnhancedAIOptions = {}): Promise<EnhancedAIResponse> {
    const prompt = `You are a customer research expert and growth strategist with expertise in market segmentation and customer acquisition.

IDEA: "${idea}"

TASK: Create detailed, actionable target audience profiles that would guide product development and marketing strategy.

STRUCTURE YOUR RESPONSE AS:

**PRIMARY TARGET AUDIENCE**
**Persona Name:** [Specific persona title]
**Demographics:** [Age, income, location, job title, company size]
**Psychographics:** [Values, motivations, fears, aspirations]
**Pain Points:** [3-4 specific, urgent problems they face]
**Buying Behavior:** [How they research, evaluate, and purchase solutions]
**Channels:** [Where to reach them - specific platforms, events, publications]
**Budget Authority:** [Decision-making power and budget range]
**Success Metrics:** [How they measure success/value]

**SECONDARY TARGET AUDIENCE**
[Same structure as primary]

**TERTIARY TARGET AUDIENCE**
[Same structure as primary]

**AUDIENCE VALIDATION STRATEGY**
- Specific research methods to validate these personas
- Key questions to ask in customer interviews
- Metrics to track audience engagement and conversion
- A/B testing strategies for different segments

**CUSTOMER ACQUISITION STRATEGY**
- Specific channels and tactics for each audience
- Content marketing approach
- Partnership opportunities
- Referral and viral growth strategies

**COMPETITIVE DIFFERENTIATION**
- How to position against competitors for each audience
- Unique value propositions per segment
- Pricing strategies per audience

Base this on real market research and avoid generic personas.`;

    return this.generateWithContext(prompt, {
      ...options,
      model: AI_MODELS.GEMINI_PRO,
      temperature: 0.7
    });
  }

  /**
   * Generate sophisticated trend analysis
   */
  async generateTrendAnalysis(idea: string, options: EnhancedAIOptions = {}): Promise<EnhancedAIResponse> {
    const prompt = `You are a technology trend analyst and futurist with deep expertise in emerging technologies and market dynamics.

IDEA: "${idea}"

TASK: Provide comprehensive trend analysis that validates timing and market readiness.

STRUCTURE YOUR RESPONSE AS:

**CURRENT MARKET TRENDS (2024-2025)**
1. **Technology Trends**
   - [Specific technology trend with data/statistics]
   - [Specific technology trend with data/statistics]
   - [Specific technology trend with data/statistics]

2. **Consumer Behavior Trends**
   - [Specific behavioral shift with supporting data]
   - [Specific behavioral shift with supporting data]
   - [Specific behavioral shift with supporting data]

3. **Economic/Regulatory Trends**
   - [Specific economic factor with impact data]
   - [Specific regulatory change with implications]
   - [Specific market condition with timing]

**WHY NOW ANALYSIS**
- Technology readiness: [Specific technologies that enable this solution]
- Market timing: [Why this is the optimal time to enter]
- Competitive landscape: [Market gaps and opportunities]
- Economic factors: [Market conditions favoring this solution]

**FUTURE TREND PROJECTIONS (2025-2027)**
- [Specific trend with projected impact]
- [Specific trend with projected impact]
- [Specific trend with projected impact]

**RISK FACTORS**
- [Potential trend reversal or market shift]
- [Technology disruption risks]
- [Regulatory or economic risks]

**OPPORTUNITY TIMING**
- Optimal launch window: [Specific timeframe with reasoning]
- Market maturation timeline: [When market will be fully ready]
- Competitive advantage window: [How long before competitors catch up]

**VALIDATION STRATEGY**
- Key trend indicators to monitor
- Market signals to watch for
- Pivot triggers and contingency plans

Include specific data sources, statistics, and market research to support each trend.`;

    return this.generateWithContext(prompt, {
      ...options,
      model: AI_MODELS.GEMINI_PRO,
      temperature: 0.7
    });
  }

  /**
   * Generate sophisticated market analysis
   */
  async generateMarketAnalysis(idea: string, options: EnhancedAIOptions = {}): Promise<EnhancedAIResponse> {
    const prompt = `You are a senior market analyst and competitive intelligence expert with 15+ years of experience in market research and strategic planning.

IDEA: "${idea}"

TASK: Provide comprehensive market analysis that would be suitable for investor presentations and strategic planning.

STRUCTURE YOUR RESPONSE AS:

**MARKET SIZE & OPPORTUNITY**
- **Total Addressable Market (TAM):** [Specific number with methodology]
- **Serviceable Addressable Market (SAM):** [Specific number with assumptions]
- **Serviceable Obtainable Market (SOM):** [Specific number with market share assumptions]
- **Market Growth Rate:** [CAGR with supporting data]
- **Market Drivers:** [3-4 key factors driving growth]

**COMPETITIVE LANDSCAPE**
**Direct Competitors:**
1. [Company Name] - [Market share, strengths, weaknesses, pricing]
2. [Company Name] - [Market share, strengths, weaknesses, pricing]
3. [Company Name] - [Market share, strengths, weaknesses, pricing]

**Indirect Competitors:**
- [Category of indirect competitors with examples]
- [How they solve the same problem differently]

**Competitive Advantages:**
- [Specific competitive moat 1]
- [Specific competitive moat 2]
- [Specific competitive moat 3]

**MARKET SEGMENTATION**
- **Primary Segment:** [Size, characteristics, growth rate]
- **Secondary Segment:** [Size, characteristics, growth rate]
- **Emerging Segment:** [Size, characteristics, growth rate]

**CUSTOMER ACQUISITION ANALYSIS**
- **Customer Acquisition Cost (CAC):** [Estimated with methodology]
- **Customer Lifetime Value (LTV):** [Estimated with methodology]
- **LTV/CAC Ratio:** [Target ratio with industry benchmarks]
- **Payback Period:** [Estimated months with assumptions]

**REVENUE MODEL ANALYSIS**
- **Primary Revenue Streams:** [Specific streams with pricing]
- **Revenue Projections:** [3-year projections with assumptions]
- **Unit Economics:** [Per-customer economics breakdown]

**MARKET RISKS & OPPORTUNITIES**
**Risks:**
- [Specific market risk with mitigation strategy]
- [Specific competitive risk with mitigation strategy]
- [Specific technology risk with mitigation strategy]

**Opportunities:**
- [Specific market opportunity with action plan]
- [Specific partnership opportunity with strategy]
- [Specific expansion opportunity with timeline]

**INDUSTRY TRENDS & FORECASTS**
- [Specific trend with 3-year impact projection]
- [Specific trend with 3-year impact projection]
- [Specific trend with 3-year impact projection]

Include specific data sources, industry reports, and market research to support all claims.`;

    return this.generateWithContext(prompt, {
      ...options,
      model: AI_MODELS.GEMINI_PRO,
      temperature: 0.6
    });
  }

  /**
   * Get user profile data for AI generation
   */
  async getUserProfileForAI(userId: string): Promise<any> {
    try {
      const integrationData = await profileIntegrationService.getProfileIntegrationData(userId);
      return integrationData.userProfile;
    } catch (error) {
      console.error('Error getting user profile for AI:', error);
      return null;
    }
  }

  /**
   * Core generation method with context awareness
   */
  private async generateWithContext(prompt: string, options: EnhancedAIOptions = {}): Promise<EnhancedAIResponse> {
    const startTime = Date.now();
    
    try {
      const model = this.getModel(options.model || AI_MODELS.GEMINI_PRO);
      
      // Enhance prompt with context
      let enhancedPrompt = prompt;
      
      if (options.context) {
        enhancedPrompt = `CONTEXT: ${options.context}\n\n${prompt}`;
      }
      
      if (options.userProfile) {
        enhancedPrompt += `\n\nUSER PROFILE: ${JSON.stringify(options.userProfile)}`;
      }
      
      if (options.projectContext) {
        enhancedPrompt += `\n\nPROJECT CONTEXT: ${JSON.stringify(options.projectContext)}`;
      }

      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();

      const processingTime = Date.now() - startTime;

      return {
        text,
        confidence: 0.95,
        metadata: {
          model: options.model || AI_MODELS.GEMINI_PRO,
          tokens: text.length,
          temperature: options.temperature || 0.7,
          processingTime,
          contextUsed: !!options.context,
          industryContext: !!options.industry,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Enhanced AI generation failed:', error);
      throw error;
    }
  }

  /**
   * Get industry-specific context
   */
  private getIndustryContext(industry: string): string {
    const contexts = {
      'fintech': 'Financial technology sector experiencing rapid digital transformation, regulatory changes, and consumer adoption of digital banking solutions.',
      'healthtech': 'Healthcare technology sector with focus on digital health, telemedicine, AI diagnostics, and patient data management.',
      'edtech': 'Education technology sector with emphasis on online learning, personalized education, and digital classroom tools.',
      'ecommerce': 'E-commerce sector with focus on omnichannel retail, personalization, and supply chain optimization.',
      'saas': 'Software as a Service sector with emphasis on cloud-based solutions, subscription models, and enterprise software.',
      'ai': 'Artificial Intelligence sector with focus on machine learning, automation, and intelligent systems.',
      'blockchain': 'Blockchain and cryptocurrency sector with emphasis on decentralized systems and digital assets.',
      'cybersecurity': 'Cybersecurity sector with focus on threat protection, data privacy, and security compliance.',
      'iot': 'Internet of Things sector with emphasis on connected devices and smart systems.',
      'biotech': 'Biotechnology sector with focus on medical research, drug development, and life sciences.'
    };

    return contexts[industry.toLowerCase() as keyof typeof contexts] || 'Technology sector with focus on innovation and digital transformation.';
  }

  /**
   * Get current market trends
   */
  private getMarketTrends(category: string): string {
    return `Current market trends include AI integration, sustainability focus, remote work solutions, data privacy concerns, and customer experience optimization.`;
  }

  /**
   * Generate context-aware business ideas with user personalization
   */
  async generatePersonalizedBusinessIdeas(
    category: string, 
    userId: string,
    options: EnhancedAIOptions = {}
  ): Promise<EnhancedAIResponse> {
    try {
      const response = await contextAwareAIService.generatePersonalizedBusinessIdeas(
        category,
        userId,
        options
      );

      return {
        text: response.text,
        confidence: response.confidence,
        metadata: {
          model: response.metadata.model,
          tokens: 0, // Default value since tokens not available in response
          temperature: options.temperature || 0.7,
          processingTime: response.metadata.processingTime,
          contextUsed: response.personalization.adaptedToUser,
          industryContext: !!options.industry,
          timestamp: response.metadata.timestamp,
          personalization: {
            contextScore: response.metadata.contextScore,
            recommendations: response.personalization.recommendations
          }
        }
      };
    } catch (error) {
      console.error('Personalized business ideas generation failed:', error);
      // Fallback to standard generation
      return this.generateBusinessIdeas(category, options);
    }
  }

  /**
   * Generate context-aware market analysis with user personalization
   */
  async generatePersonalizedMarketAnalysis(
    idea: string,
    userId: string,
    options: EnhancedAIOptions = {}
  ): Promise<EnhancedAIResponse> {
    try {
      const response = await contextAwareAIService.generatePersonalizedMarketAnalysis(
        idea,
        userId,
        options
      );

      return {
        text: response.text,
        confidence: response.confidence,
        metadata: {
          model: response.metadata.model,
          tokens: 0, // Default value since tokens not available in response
          temperature: options.temperature || 0.7,
          processingTime: response.metadata.processingTime,
          contextUsed: response.personalization.adaptedToUser,
          industryContext: !!options.industry,
          timestamp: response.metadata.timestamp,
          personalization: {
            contextScore: response.metadata.contextScore,
            recommendations: response.personalization.recommendations
          }
        }
      };
    } catch (error) {
      console.error('Personalized market analysis generation failed:', error);
      // Fallback to standard generation
      return this.generateMarketAnalysis(idea, options);
    }
  }

  /**
   * Generate content using optimal model selection
   */
  async generateWithOptimalModel(
    prompt: string,
    task: 'idea_generation' | 'market_analysis' | 'technical_analysis' | 'creative_writing' | 'data_analysis',
    userId?: string,
    options: EnhancedAIOptions = {}
  ): Promise<EnhancedAIResponse> {
    try {
      const userContext = userId ? await contextAwareAIService.getUserContext(userId) : null;
      
      const criteria: ModelSelectionCriteria = {
        task,
        complexity: userContext?.experience === 'expert' ? 'complex' : 'medium',
        speed: 'medium',
        quality: userContext?.experience === 'expert' ? 'excellent' : 'good',
        budget: userContext?.projectContext?.budget || 'medium'
      };

      const response = await multiModelAIService.generateContent(
        prompt,
        criteria,
        {
          context: userContext?.projectContext?.currentProject,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 2000
        }
      );

      return {
        text: response.text,
        confidence: response.confidence,
        metadata: {
          model: response.model,
          tokens: 0, // Default value since tokens not available in response
          temperature: options.temperature || 0.7,
          processingTime: response.metadata.processingTime,
          contextUsed: !!userContext,
          industryContext: !!options.industry,
          timestamp: response.metadata.timestamp,
          cost: response.metadata.cost
        }
      };
    } catch (error) {
      console.error('Optimal model generation failed:', error);
      // Fallback to standard Gemini generation
      return this.generateWithContext(prompt, options);
    }
  }

  /**
   * Set user context for personalized responses
   */
  setUserContext(userId: string, context: UserContext): void {
    contextAwareAIService.setUserContext(userId, context);
  }

  /**
   * Get available AI models
   */
  getAvailableModels() {
    return multiModelAIService.getAvailableModels();
  }
}

export const enhancedAIService = new EnhancedAIService();
export { AI_MODELS, type AIModel, type EnhancedAIOptions, type EnhancedAIResponse };
