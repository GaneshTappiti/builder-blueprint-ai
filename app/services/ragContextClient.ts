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
    const industryContext = this.getIndustrySpecificContext(query.appIdea);
    const marketTrends = this.getCurrentMarketTrends();
    
    const baseContext: RAGContextResult = {
      toolSpecificContext: industryContext.toolContext,
      architecturePatterns: industryContext.architecturePatterns,
      bestPractices: [
        'Follow industry-standard development practices',
        'Implement comprehensive error handling and monitoring',
        'Design for mobile-first responsive experience',
        'Use proven architectural patterns for scalability',
        'Implement proper security measures and data protection',
        'Ensure accessibility compliance (WCAG 2.1 AA)',
        'Follow microservices architecture for complex applications',
        'Implement proper logging and analytics',
        ...industryContext.bestPractices
      ],
      codeExamples: [
        'Industry-standard implementation patterns',
        'Scalable architecture examples',
        'Security best practice implementations',
        'Performance optimization techniques',
        ...industryContext.codeExamples
      ],
      constraints: [
        'Consider platform-specific limitations and capabilities',
        'Follow security best practices and compliance requirements',
        'Ensure accessibility compliance and inclusive design',
        'Plan for scalability and performance at scale',
        'Consider data privacy regulations (GDPR, CCPA)',
        ...industryContext.constraints
      ],
      optimizationTips: [
        'Optimize for Core Web Vitals and performance metrics',
        'Implement proper caching strategies',
        'Use CDN for static asset delivery',
        'Implement proper state management patterns',
        'Plan for horizontal scaling and load balancing',
        ...industryContext.optimizationTips
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
   * Get industry-specific context based on app idea
   */
  private static getIndustrySpecificContext(appIdea: string): {
    toolContext: string;
    architecturePatterns: string;
    bestPractices: string[];
    codeExamples: string[];
    constraints: string[];
    optimizationTips: string[];
  } {
    const lowerIdea = appIdea.toLowerCase();
    
    // FinTech specific context
    if (lowerIdea.includes('fintech') || lowerIdea.includes('finance') || lowerIdea.includes('payment') || lowerIdea.includes('banking')) {
      return {
        toolContext: 'FinTech applications require high security, compliance, and real-time processing capabilities',
        architecturePatterns: 'Event-driven microservices with CQRS pattern, API Gateway, and distributed caching',
        bestPractices: [
          'Implement PCI DSS compliance for payment processing',
          'Use end-to-end encryption for sensitive data',
          'Implement fraud detection and risk management',
          'Follow Open Banking API standards',
          'Use event sourcing for audit trails'
        ],
        codeExamples: [
          'Payment processing with Stripe/PayPal integration',
          'Real-time transaction monitoring',
          'KYC/AML compliance workflows',
          'Secure API authentication patterns'
        ],
        constraints: [
          'Strict regulatory compliance (PCI DSS, SOX, GDPR)',
          'High availability requirements (99.99% uptime)',
          'Real-time processing constraints',
          'Data residency requirements'
        ],
        optimizationTips: [
          'Implement circuit breakers for external API calls',
          'Use Redis for real-time caching',
          'Optimize database queries for financial data',
          'Implement proper monitoring and alerting'
        ]
      };
    }
    
    // HealthTech specific context
    if (lowerIdea.includes('health') || lowerIdea.includes('medical') || lowerIdea.includes('healthcare') || lowerIdea.includes('telemedicine')) {
      return {
        toolContext: 'HealthTech applications require HIPAA compliance, patient data security, and medical device integration',
        architecturePatterns: 'HIPAA-compliant microservices with FHIR API integration and secure data storage',
        bestPractices: [
          'Implement HIPAA compliance for patient data',
          'Use FHIR standards for medical data exchange',
          'Implement secure authentication and authorization',
          'Follow medical device software guidelines',
          'Ensure data encryption at rest and in transit'
        ],
        codeExamples: [
          'FHIR API integration patterns',
          'HIPAA-compliant data storage',
          'Medical device API integrations',
          'Patient portal authentication'
        ],
        constraints: [
          'HIPAA compliance requirements',
          'Medical device regulations (FDA)',
          'Patient data privacy laws',
          'Interoperability standards (FHIR)'
        ],
        optimizationTips: [
          'Optimize for medical data processing',
          'Implement secure file upload for medical images',
          'Use appropriate caching for patient data',
          'Plan for high availability in critical care scenarios'
        ]
      };
    }
    
    // EdTech specific context
    if (lowerIdea.includes('education') || lowerIdea.includes('learning') || lowerIdea.includes('school') || lowerIdea.includes('course')) {
      return {
        toolContext: 'EdTech applications require accessibility, scalability for multiple users, and learning analytics',
        architecturePatterns: 'Multi-tenant SaaS architecture with learning management system integration',
        bestPractices: [
          'Implement WCAG 2.1 AA accessibility standards',
          'Use SCORM/xAPI for learning content standards',
          'Implement real-time collaboration features',
          'Follow FERPA compliance for student data',
          'Design for various learning styles and disabilities'
        ],
        codeExamples: [
          'Learning management system integrations',
          'Real-time video conferencing for online classes',
          'Interactive learning content delivery',
          'Student progress tracking and analytics'
        ],
        constraints: [
          'Accessibility compliance requirements',
          'FERPA compliance for student data',
          'Scalability for large numbers of concurrent users',
          'Cross-platform compatibility for various devices'
        ],
        optimizationTips: [
          'Optimize for video streaming and content delivery',
          'Implement adaptive learning algorithms',
          'Use CDN for educational content distribution',
          'Plan for peak usage during exam periods'
        ]
      };
    }
    
    // E-commerce specific context
    if (lowerIdea.includes('ecommerce') || lowerIdea.includes('shopping') || lowerIdea.includes('retail') || lowerIdea.includes('marketplace')) {
      return {
        toolContext: 'E-commerce applications require high performance, payment processing, and inventory management',
        architecturePatterns: 'Microservices with event-driven architecture, API Gateway, and distributed caching',
        bestPractices: [
          'Implement secure payment processing (PCI DSS)',
          'Use CDN for product images and static content',
          'Implement real-time inventory management',
          'Follow e-commerce security best practices',
          'Optimize for mobile commerce (m-commerce)'
        ],
        codeExamples: [
          'Shopping cart and checkout flow implementations',
          'Payment gateway integrations',
          'Product catalog and search functionality',
          'Order management and fulfillment systems'
        ],
        constraints: [
          'PCI DSS compliance for payment processing',
          'High performance requirements for product catalogs',
          'Real-time inventory synchronization',
          'Mobile-first design requirements'
        ],
        optimizationTips: [
          'Implement advanced caching strategies',
          'Optimize database queries for product search',
          'Use image optimization and lazy loading',
          'Plan for traffic spikes during sales events'
        ]
      };
    }
    
    // Default context for other industries
    return {
      toolContext: 'Modern web application with scalable architecture and best practices',
      architecturePatterns: 'Component-based architecture with microservices and API-first design',
      bestPractices: [
        'Implement responsive design principles',
        'Use modern JavaScript frameworks and libraries',
        'Follow RESTful API design patterns',
        'Implement proper error handling and logging',
        'Use version control and CI/CD practices'
      ],
      codeExamples: [
        'Modern frontend framework implementations',
        'RESTful API design patterns',
        'Database design and optimization',
        'Authentication and authorization systems'
      ],
      constraints: [
        'Cross-browser compatibility requirements',
        'Performance and scalability considerations',
        'Security best practices',
        'Accessibility compliance'
      ],
      optimizationTips: [
        'Implement proper caching strategies',
        'Use performance monitoring and optimization',
        'Follow SEO best practices',
        'Plan for scalability and growth'
      ]
    };
  }

  /**
   * Get current market trends and technology insights
   */
  private static getCurrentMarketTrends(): string {
    return `
    Current Technology Trends (2024-2025):
    - AI/ML integration in applications (85% of enterprises adopting)
    - Edge computing and IoT device proliferation
    - Progressive Web Apps (PWA) for better mobile experience
    - Microservices and serverless architecture adoption
    - Real-time data processing and streaming
    - Enhanced security and privacy regulations
    - Cloud-native development and containerization
    - Low-code/no-code platform growth
    - Voice and conversational interfaces
    - Augmented Reality (AR) and Virtual Reality (VR) integration
    `;
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