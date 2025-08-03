import { RAGTool, RAGContext, AppType, Platform } from '@/types/ideaforge';
import { getRAGToolProfile } from './ragToolProfiles';
import { geminiService } from './geminiService';

/**
 * RAG Documentation Service
 * Handles tool-specific documentation retrieval and context generation
 * Adapted from the Python RAG system to work with Next.js + Supabase + Gemini
 */

// Tool-specific documentation and prompting strategies
const TOOL_DOCUMENTATION: Record<RAGTool, {
  promptingStrategies: string[];
  optimizationTips: string[];
  constraints: string[];
  bestPractices: string[];
  examples: string[];
}> = {
  lovable: {
    promptingStrategies: [
      'Use C.L.E.A.R. framework (Context, Logic, Examples, Actions, Results)',
      'Implement incremental development approach',
      'Leverage Knowledge Base extensively',
      'Use Chat mode for planning and discussion',
      'Be explicit about constraints and requirements'
    ],
    optimizationTips: [
      'Use modern React patterns with TypeScript',
      'Implement responsive design with Tailwind CSS',
      'Integrate Supabase for backend functionality',
      'Follow accessibility best practices',
      'Use shadcn/ui components for consistent UI'
    ],
    constraints: [
      'React TypeScript only',
      'Supabase backend required',
      'Tailwind CSS for styling',
      'Responsive design mandatory',
      'Component-based architecture'
    ],
    bestPractices: [
      'Start with Knowledge Base setup',
      'Use structured prompts for complex features',
      'Implement mobile-first responsive design',
      'Follow React best practices',
      'Ensure accessibility compliance'
    ],
    examples: [
      'Create a task management dashboard with CRUD operations',
      'Build user authentication with Supabase Auth',
      'Implement real-time updates with Supabase subscriptions'
    ]
  },

  bolt: {
    promptingStrategies: [
      'Use enhancement-driven development',
      'Target specific files for modifications',
      'Break into incremental changes',
      'Leverage WebContainer capabilities',
      'Use enhance prompt feature for complex requests'
    ],
    optimizationTips: [
      'Structure requests for WebContainer compatibility',
      'Focus on browser-compatible solutions',
      'Use modern JavaScript/TypeScript patterns',
      'Implement progressive enhancement',
      'Optimize for rapid iteration'
    ],
    constraints: [
      'WebContainer limitations apply',
      'Browser-compatible code only',
      'No native binaries',
      'Limited file system access',
      'Client-side focused'
    ],
    bestPractices: [
      'Use the enhance prompt feature for detailed specs',
      'Lock critical files to prevent overwrites',
      'Test incrementally in WebContainer',
      'Focus on single-page applications',
      'Optimize bundle size'
    ],
    examples: [
      'Build a React todo application with local storage',
      'Create an interactive dashboard with charts',
      'Develop a real-time chat interface'
    ]
  },

  cursor: {
    promptingStrategies: [
      'Use schema-driven development approach',
      'Implement parallel processing patterns',
      'Leverage AI assistance for code completion',
      'Focus on structured development',
      'Use context-aware prompting'
    ],
    optimizationTips: [
      'Define clear schemas upfront',
      'Use TypeScript for better AI assistance',
      'Implement proper error handling',
      'Focus on code quality and maintainability',
      'Leverage AI for refactoring'
    ],
    constraints: [
      'IDE-based development',
      'Requires proper project setup',
      'Schema definitions needed',
      'Context window limitations',
      'File-based operations'
    ],
    bestPractices: [
      'Set up proper TypeScript configuration',
      'Use clear naming conventions',
      'Implement comprehensive error handling',
      'Focus on code documentation',
      'Leverage AI for code reviews'
    ],
    examples: [
      'Build a full-stack application with proper schemas',
      'Implement complex business logic with AI assistance',
      'Refactor legacy code with AI guidance'
    ]
  },

  v0: {
    promptingStrategies: [
      'Focus on production-ready components',
      'Use modern React patterns',
      'Implement accessible designs',
      'Leverage Vercel ecosystem',
      'Focus on component composition'
    ],
    optimizationTips: [
      'Use Next.js best practices',
      'Implement proper SEO optimization',
      'Focus on performance optimization',
      'Use Vercel deployment features',
      'Implement proper error boundaries'
    ],
    constraints: [
      'React/Next.js focused',
      'Vercel ecosystem preferred',
      'Component-based architecture',
      'Modern JavaScript required',
      'Production-ready code only'
    ],
    bestPractices: [
      'Follow Next.js conventions',
      'Implement proper TypeScript types',
      'Use Vercel Analytics and monitoring',
      'Focus on Core Web Vitals',
      'Implement proper caching strategies'
    ],
    examples: [
      'Create a landing page with optimal performance',
      'Build a dashboard with real-time data',
      'Implement an e-commerce product catalog'
    ]
  },

  // Add more tools with similar structure...
  bubble: {
    promptingStrategies: [
      'Use visual workflow design',
      'Focus on database relationships',
      'Implement user-friendly interfaces',
      'Leverage Bubble plugins',
      'Use responsive design principles'
    ],
    optimizationTips: [
      'Design efficient database structures',
      'Use Bubble\'s built-in components',
      'Implement proper user permissions',
      'Optimize page load times',
      'Use conditional formatting effectively'
    ],
    constraints: [
      'Bubble platform limitations',
      'No custom code in free tier',
      'Database structure constraints',
      'Plugin dependencies',
      'Responsive design limitations'
    ],
    bestPractices: [
      'Plan database structure carefully',
      'Use reusable elements',
      'Implement proper user workflows',
      'Test on multiple devices',
      'Use Bubble\'s SEO features'
    ],
    examples: [
      'Build a marketplace with user authentication',
      'Create a booking system with payments',
      'Develop a social media platform'
    ]
  },

  // Simplified entries for other tools
  flutterflow: {
    promptingStrategies: ['Visual Flutter development', 'Cross-platform design', 'Firebase integration'],
    optimizationTips: ['Use Flutter widgets effectively', 'Implement responsive layouts', 'Optimize for performance'],
    constraints: ['Flutter framework limitations', 'Platform-specific considerations', 'Firebase dependencies'],
    bestPractices: ['Follow Flutter conventions', 'Test on multiple devices', 'Use proper state management'],
    examples: ['Build a mobile app with authentication', 'Create a cross-platform e-commerce app']
  },

  framer: {
    promptingStrategies: ['Design-first approach', 'Animation-focused development', 'Component-based design'],
    optimizationTips: ['Use Framer components', 'Implement smooth animations', 'Optimize for performance'],
    constraints: ['Design tool limitations', 'Animation performance', 'Component complexity'],
    bestPractices: ['Start with design system', 'Use consistent animations', 'Test interactions thoroughly'],
    examples: ['Create an animated landing page', 'Build an interactive portfolio']
  },

  adalo: {
    promptingStrategies: ['Mobile-first design', 'No-code approach', 'Native functionality focus'],
    optimizationTips: ['Use native components', 'Implement proper navigation', 'Optimize for mobile'],
    constraints: ['No-code limitations', 'Mobile platform constraints', 'Component restrictions'],
    bestPractices: ['Design for mobile first', 'Use consistent UI patterns', 'Test on real devices'],
    examples: ['Build a social media app', 'Create a marketplace app']
  },

  uizard: {
    promptingStrategies: ['Sketch-to-digital conversion', 'AI-powered design', 'Rapid prototyping'],
    optimizationTips: ['Use clear sketches', 'Leverage AI suggestions', 'Iterate quickly'],
    constraints: ['AI interpretation limitations', 'Design complexity limits', 'Conversion accuracy'],
    bestPractices: ['Start with clear sketches', 'Refine AI suggestions', 'Test usability early'],
    examples: ['Convert hand-drawn wireframes', 'Create rapid prototypes']
  },

  cline: {
    promptingStrategies: ['Step-by-step development', 'Iterative approach', 'Detailed guidance'],
    optimizationTips: ['Follow structured steps', 'Document progress', 'Learn incrementally'],
    constraints: ['Learning curve', 'Step dependencies', 'Time requirements'],
    bestPractices: ['Follow the process', 'Take detailed notes', 'Practice regularly'],
    examples: ['Learn React step by step', 'Build projects incrementally']
  },

  windsurf: {
    promptingStrategies: ['Explanatory development', 'Async handling', 'Comprehensive documentation'],
    optimizationTips: ['Focus on explanations', 'Handle async operations', 'Document thoroughly'],
    constraints: ['Complexity management', 'Documentation overhead', 'Learning requirements'],
    bestPractices: ['Explain code thoroughly', 'Handle errors properly', 'Maintain documentation'],
    examples: ['Build complex async applications', 'Create educational content']
  },

  devin: {
    promptingStrategies: ['Autonomous planning', 'Security-first approach', 'Comprehensive project management'],
    optimizationTips: ['Focus on security', 'Plan comprehensively', 'Automate processes'],
    constraints: ['High complexity', 'Security requirements', 'Resource intensive'],
    bestPractices: ['Prioritize security', 'Plan thoroughly', 'Monitor continuously'],
    examples: ['Build enterprise applications', 'Create secure systems']
  },

  roocode: {
    promptingStrategies: ['AI-powered development', 'Rapid building', 'Code generation'],
    optimizationTips: ['Leverage AI assistance', 'Build rapidly', 'Generate quality code'],
    constraints: ['AI limitations', 'Code quality variance', 'Platform dependencies'],
    bestPractices: ['Review AI suggestions', 'Test thoroughly', 'Maintain code quality'],
    examples: ['Rapidly prototype applications', 'Generate boilerplate code']
  },

  manus: {
    promptingStrategies: ['Manual-first approach', 'Detailed documentation', 'Process-driven'],
    optimizationTips: ['Document everything', 'Follow processes', 'Learn systematically'],
    constraints: ['Manual overhead', 'Process complexity', 'Time requirements'],
    bestPractices: ['Maintain detailed docs', 'Follow established processes', 'Learn continuously'],
    examples: ['Create comprehensive documentation', 'Build process-driven applications']
  },

  same_dev: {
    promptingStrategies: ['Collaborative development', 'Shared environments', 'Team coordination'],
    optimizationTips: ['Coordinate with team', 'Use shared resources', 'Maintain consistency'],
    constraints: ['Team dependencies', 'Coordination overhead', 'Shared resource conflicts'],
    bestPractices: ['Communicate clearly', 'Share resources effectively', 'Coordinate changes'],
    examples: ['Build team projects', 'Create shared development environments']
  }
};

/**
 * Generate RAG context for a specific tool and project requirements
 */
export async function generateRAGContext(
  toolId: RAGTool,
  appType: AppType,
  platforms: Platform[],
  projectDescription: string
): Promise<RAGContext> {
  const toolProfile = getRAGToolProfile(toolId);
  const toolDocs = TOOL_DOCUMENTATION[toolId];

  // Generate tool-specific prompts using Gemini
  const contextPrompt = `
Generate tool-specific development context for ${toolProfile.name} based on:

Project Type: ${appType}
Platforms: ${platforms.join(', ')}
Description: ${projectDescription}

Tool Capabilities: ${toolProfile.bestFor.join(', ')}
Tool Category: ${toolProfile.category}
Tool Complexity: ${toolProfile.complexity}

Please provide:
1. Relevant documentation snippets
2. Tool-specific prompts for this project
3. Optimization tips specific to this use case
4. Potential constraints to consider

Format as JSON with keys: relevantDocs, toolSpecificPrompts, optimizationTips, constraints
`;

  try {
    const response = await geminiService.generateText(contextPrompt);
    
    // Try to parse JSON response, fallback to structured data if parsing fails
    let generatedContext;
    try {
      generatedContext = JSON.parse(response.text);
    } catch {
      // Fallback to predefined documentation
      generatedContext = {
        relevantDocs: toolDocs.bestPractices,
        toolSpecificPrompts: toolDocs.examples,
        optimizationTips: toolDocs.optimizationTips,
        constraints: toolDocs.constraints
      };
    }

    return {
      toolId,
      relevantDocs: generatedContext.relevantDocs || toolDocs.bestPractices,
      toolSpecificPrompts: generatedContext.toolSpecificPrompts || toolDocs.examples,
      optimizationTips: generatedContext.optimizationTips || toolDocs.optimizationTips,
      constraints: generatedContext.constraints || toolDocs.constraints
    };
  } catch (error) {
    console.error('Error generating RAG context:', error);
    
    // Fallback to static documentation
    return {
      toolId,
      relevantDocs: toolDocs.bestPractices,
      toolSpecificPrompts: toolDocs.examples,
      optimizationTips: toolDocs.optimizationTips,
      constraints: toolDocs.constraints
    };
  }
}

/**
 * Get static tool documentation (fallback)
 */
export function getToolDocumentation(toolId: RAGTool) {
  return TOOL_DOCUMENTATION[toolId];
}

/**
 * Search for relevant documentation based on query
 */
export async function searchToolDocumentation(
  toolId: RAGTool,
  query: string
): Promise<string[]> {
  const toolDocs = TOOL_DOCUMENTATION[toolId];
  const allDocs = [
    ...toolDocs.promptingStrategies,
    ...toolDocs.optimizationTips,
    ...toolDocs.bestPractices,
    ...toolDocs.examples
  ];

  // Simple keyword-based search (can be enhanced with embeddings later)
  const queryWords = query.toLowerCase().split(' ');
  const relevantDocs = allDocs.filter(doc =>
    queryWords.some(word => doc.toLowerCase().includes(word))
  );

  return relevantDocs.length > 0 ? relevantDocs : allDocs.slice(0, 3);
}
