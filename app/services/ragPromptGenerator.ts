import { 
  RAGTool, 
  RAGPromptResult, 
  MVPWizardData, 
  AppType, 
  Platform 
} from '@/types/ideaforge';
import { generateRAGContext, getToolDocumentation } from './ragDocumentationService';
import { getRAGToolProfile } from './ragToolProfiles';
import { geminiService } from './geminiService';

/**
 * RAG-Enhanced Prompt Generator
 * Generates tool-specific prompts using RAG context and documentation
 */

export class RAGPromptGenerator {
  /**
   * Generate enhanced framework prompt with RAG context
   */
  static async generateFrameworkPrompt(
    wizardData: MVPWizardData,
    selectedTool: RAGTool,
    userPrompt: string
  ): Promise<RAGPromptResult> {
    const toolProfile = getRAGToolProfile(selectedTool);
    const ragContext = await generateRAGContext(
      selectedTool,
      wizardData.step1.appType,
      wizardData.step3.platforms,
      userPrompt
    );

    const basePrompt = this.buildBaseFrameworkPrompt(wizardData, userPrompt);
    const toolSpecificPrompt = this.buildToolSpecificPrompt(toolProfile, ragContext, basePrompt);

    const enhancedPrompt = `
# ${toolProfile.name} - Enhanced Framework Generation

## Tool Context
**Platform**: ${toolProfile.name} (${toolProfile.category})
**Best For**: ${toolProfile.bestFor.join(', ')}
**Complexity Level**: ${toolProfile.complexity}

## Project Requirements
${basePrompt}

## Tool-Specific Guidance
${ragContext.relevantDocs.map(doc => `• ${doc}`).join('\n')}

## Optimization Tips
${ragContext.optimizationTips.map(tip => `• ${tip}`).join('\n')}

## Constraints & Limitations
${ragContext.constraints.map(constraint => `• ${constraint}`).join('\n')}

## Tool-Specific Examples
${ragContext.toolSpecificPrompts.map(example => `• ${example}`).join('\n')}

## Output Requirements
Please generate a comprehensive framework that:
1. Follows ${toolProfile.name} best practices
2. Addresses the specific constraints mentioned above
3. Leverages the tool's strengths for ${wizardData.step1.appType} development
4. Provides actionable implementation steps
5. Includes tool-specific recommendations

**Format**: Provide structured output optimized for ${toolProfile.name} development workflow.
`;

    return {
      prompt: enhancedPrompt,
      toolContext: ragContext,
      confidence: 0.9,
      sources: ragContext.relevantDocs,
      toolSpecificOptimizations: ragContext.optimizationTips
    };
  }

  /**
   * Generate enhanced page prompt with RAG context
   */
  static async generatePagePrompt(
    pageName: string,
    pageData: any,
    wizardData: MVPWizardData,
    selectedTool: RAGTool
  ): Promise<RAGPromptResult> {
    const toolProfile = getRAGToolProfile(selectedTool);
    const toolDocs = getToolDocumentation(selectedTool);

    const basePagePrompt = this.buildBasePagePrompt(pageName, pageData, wizardData);
    
    const enhancedPrompt = `
# ${toolProfile.name} - Page UI Generation: ${pageName}

## Tool Context
**Platform**: ${toolProfile.name}
**Page Type**: ${pageName}
**App Type**: ${wizardData.step1.appType}
**Platforms**: ${wizardData.step3.platforms.join(', ')}

## Base Requirements
${basePagePrompt}

## Tool-Specific UI Guidelines
${toolDocs.optimizationTips.map(tip => `• ${tip}`).join('\n')}

## Platform Considerations
${this.getPlatformSpecificGuidance(wizardData.step3.platforms, selectedTool)}

## Component Recommendations
${this.getComponentRecommendations(selectedTool, wizardData.step1.appType)}

## Implementation Notes
- Follow ${toolProfile.name} component patterns
- Ensure ${wizardData.step2.theme} theme compatibility
- Apply ${wizardData.step2.designStyle} design principles
- Consider ${toolProfile.complexity} complexity level

Please generate detailed UI specifications optimized for ${toolProfile.name}.
`;

    return {
      prompt: enhancedPrompt,
      toolContext: {
        toolId: selectedTool,
        relevantDocs: toolDocs.bestPractices,
        toolSpecificPrompts: toolDocs.examples,
        optimizationTips: toolDocs.optimizationTips,
        constraints: toolDocs.constraints
      },
      confidence: 0.85,
      sources: toolDocs.bestPractices,
      toolSpecificOptimizations: toolDocs.optimizationTips
    };
  }

  /**
   * Generate enhanced linking prompt with RAG context
   */
  static async generateLinkingPrompt(
    pageNames: string[],
    wizardData: MVPWizardData,
    selectedTool: RAGTool
  ): Promise<RAGPromptResult> {
    const toolProfile = getRAGToolProfile(selectedTool);
    const toolDocs = getToolDocumentation(selectedTool);

    const enhancedPrompt = `
# ${toolProfile.name} - Navigation & Linking Implementation

## Tool Context
**Platform**: ${toolProfile.name}
**App Type**: ${wizardData.step1.appType}
**Target Platforms**: ${wizardData.step3.platforms.join(', ')}

## Pages to Connect
${pageNames.map(name => `• ${name}`).join('\n')}

## Tool-Specific Navigation Patterns
${this.getNavigationPatterns(selectedTool, wizardData.step1.appType)}

## Implementation Guidelines
${toolDocs.optimizationTips.filter(tip => 
  tip.toLowerCase().includes('navigation') || 
  tip.toLowerCase().includes('routing') ||
  tip.toLowerCase().includes('link')
).map(tip => `• ${tip}`).join('\n')}

## Platform-Specific Considerations
${this.getPlatformNavigationGuidance(wizardData.step3.platforms, selectedTool)}

## Best Practices
${toolDocs.bestPractices.map(practice => `• ${practice}`).join('\n')}

Please generate comprehensive navigation and linking implementation for ${toolProfile.name}.
`;

    return {
      prompt: enhancedPrompt,
      toolContext: {
        toolId: selectedTool,
        relevantDocs: toolDocs.bestPractices,
        toolSpecificPrompts: toolDocs.examples,
        optimizationTips: toolDocs.optimizationTips,
        constraints: toolDocs.constraints
      },
      confidence: 0.8,
      sources: toolDocs.bestPractices,
      toolSpecificOptimizations: toolDocs.optimizationTips
    };
  }

  /**
   * Build base framework prompt (tool-agnostic)
   */
  private static buildBaseFrameworkPrompt(wizardData: MVPWizardData, userPrompt: string): string {
    const { step1, step2, step3 } = wizardData;
    const platformText = step3.platforms.join(", ");

    return `
**Project**: ${step1.appName} (${step1.appType.replace('-', ' ')})
**Platforms**: ${platformText}
**Design**: ${step2.theme} theme with ${step2.designStyle} style
**Vision**: ${userPrompt}

Create a comprehensive app framework including:
1. Page structure and hierarchy
2. Navigation flow and user journey
3. Key components and features
4. Technical architecture recommendations
5. Implementation roadmap
`;
  }

  /**
   * Build base page prompt (tool-agnostic)
   */
  private static buildBasePagePrompt(pageName: string, pageData: any, wizardData: MVPWizardData): string {
    return `
**Page**: ${pageName}
**Purpose**: ${pageData?.description || 'Not specified'}
**Layout**: ${pageData?.layout || 'Not specified'}
**Components**: ${pageData?.components?.join(', ') || 'Not specified'}
**Theme**: ${wizardData.step2.theme} mode
**Style**: ${wizardData.step2.designStyle}
**Platforms**: ${wizardData.step3.platforms.join(', ')}

Design complete UI specifications for this page.
`;
  }

  /**
   * Build tool-specific prompt enhancements
   */
  private static buildToolSpecificPrompt(toolProfile: any, ragContext: any, basePrompt: string): string {
    return `${basePrompt}\n\n## ${toolProfile.name} Specific Requirements:\n${ragContext.optimizationTips.join('\n')}`;
  }

  /**
   * Get platform-specific guidance
   */
  private static getPlatformSpecificGuidance(platforms: Platform[], tool: RAGTool): string {
    const guidance: string[] = [];
    
    if (platforms.includes('web')) {
      guidance.push('• Implement responsive design for desktop, tablet, and mobile');
      guidance.push('• Ensure cross-browser compatibility');
    }
    
    if (platforms.includes('android') || platforms.includes('ios')) {
      guidance.push('• Design for touch interactions and mobile gestures');
      guidance.push('• Consider platform-specific UI guidelines');
    }
    
    if (platforms.includes('cross-platform')) {
      guidance.push('• Maintain consistent UI across platforms');
      guidance.push('• Handle platform-specific features gracefully');
    }

    return guidance.join('\n');
  }

  /**
   * Get component recommendations for specific tools
   */
  private static getComponentRecommendations(tool: RAGTool, appType: AppType): string {
    const recommendations: Record<RAGTool, string[]> = {
      lovable: ['shadcn/ui components', 'Tailwind CSS utilities', 'React hooks', 'Supabase integration'],
      bolt: ['Modern React components', 'CSS modules', 'Local storage', 'WebContainer-compatible libraries'],
      cursor: ['TypeScript interfaces', 'Proper error boundaries', 'Schema-driven components', 'AI-assisted patterns'],
      v0: ['Next.js components', 'Vercel optimizations', 'Performance-focused patterns', 'SEO-friendly structure'],
      bubble: ['Bubble native elements', 'Responsive groups', 'Database-connected elements', 'Workflow triggers'],
      flutterflow: ['Flutter widgets', 'Firebase components', 'Cross-platform layouts', 'Material/Cupertino design'],
      framer: ['Framer components', 'Animation variants', 'Interactive elements', 'Design system tokens'],
      adalo: ['Native mobile components', 'List components', 'Form elements', 'Navigation components'],
      uizard: ['AI-generated components', 'Design system elements', 'Prototype components', 'Conversion-optimized UI'],
      cline: ['Step-by-step components', 'Learning-focused UI', 'Progressive disclosure', 'Educational patterns'],
      windsurf: ['Async-aware components', 'Error handling UI', 'Loading states', 'Documentation-rich interfaces'],
      devin: ['Security-focused components', 'Enterprise patterns', 'Audit-friendly UI', 'Compliance-ready elements'],
      roocode: ['AI-generated components', 'Rapid prototyping elements', 'Code-generated UI', 'Template-based patterns'],
      manus: ['Documentation components', 'Process-driven UI', 'Manual-friendly interfaces', 'Step-by-step guides'],
      same_dev: ['Collaborative components', 'Shared state UI', 'Team-aware interfaces', 'Sync-enabled elements']
    };

    return recommendations[tool]?.map(rec => `• ${rec}`).join('\n') || '• Standard components for the platform';
  }

  /**
   * Get navigation patterns for specific tools
   */
  private static getNavigationPatterns(tool: RAGTool, appType: AppType): string {
    const patterns: Record<RAGTool, string[]> = {
      lovable: ['React Router navigation', 'Supabase auth routing', 'Protected routes', 'Dynamic navigation'],
      bolt: ['Client-side routing', 'Hash-based navigation', 'Single-page app patterns', 'WebContainer-friendly routing'],
      cursor: ['File-based routing', 'TypeScript route definitions', 'Schema-driven navigation', 'AI-assisted routing'],
      v0: ['Next.js App Router', 'Server-side navigation', 'SEO-optimized routing', 'Performance-focused patterns'],
      bubble: ['Bubble page navigation', 'Workflow-based routing', 'Conditional navigation', 'User role-based routing'],
      flutterflow: ['Flutter navigation', 'Cross-platform routing', 'Firebase auth routing', 'Native navigation patterns'],
      framer: ['Page transitions', 'Animated navigation', 'Interactive routing', 'Design-driven navigation'],
      adalo: ['Native mobile navigation', 'Tab-based routing', 'Stack navigation', 'Deep linking support'],
      uizard: ['Prototype navigation', 'Design-based routing', 'User flow navigation', 'Conversion-optimized paths'],
      cline: ['Step-by-step navigation', 'Learning path routing', 'Progressive navigation', 'Educational flow'],
      windsurf: ['Async navigation', 'Error-aware routing', 'Documentation-integrated navigation', 'Context-aware routing'],
      devin: ['Security-first navigation', 'Audit-logged routing', 'Permission-based navigation', 'Enterprise routing'],
      roocode: ['AI-generated navigation', 'Template-based routing', 'Rapid prototype navigation', 'Code-generated routing'],
      manus: ['Process-driven navigation', 'Documentation-integrated routing', 'Manual-friendly navigation', 'Step-guided routing'],
      same_dev: ['Collaborative navigation', 'Shared routing state', 'Team-aware navigation', 'Sync-enabled routing']
    };

    return patterns[tool]?.map(pattern => `• ${pattern}`).join('\n') || '• Standard navigation patterns';
  }

  /**
   * Get platform-specific navigation guidance
   */
  private static getPlatformNavigationGuidance(platforms: Platform[], tool: RAGTool): string {
    const guidance: string[] = [];
    
    platforms.forEach(platform => {
      switch (platform) {
        case 'web':
          guidance.push('• Implement browser history management');
          guidance.push('• Support keyboard navigation');
          guidance.push('• Ensure accessibility compliance');
          break;
        case 'android':
          guidance.push('• Follow Material Design navigation patterns');
          guidance.push('• Implement Android back button handling');
          guidance.push('• Support gesture navigation');
          break;
        case 'ios':
          guidance.push('• Follow iOS Human Interface Guidelines');
          guidance.push('• Implement iOS-specific navigation patterns');
          guidance.push('• Support iOS gestures and interactions');
          break;
        case 'cross-platform':
          guidance.push('• Maintain consistent navigation across platforms');
          guidance.push('• Handle platform-specific navigation differences');
          guidance.push('• Implement adaptive navigation patterns');
          break;
      }
    });

    return guidance.join('\n');
  }
}

/**
 * Convenience function for generating RAG-enhanced prompts
 */
export async function generateRAGEnhancedPrompt(
  type: 'framework' | 'page' | 'linking',
  wizardData: MVPWizardData,
  selectedTool: RAGTool,
  additionalData?: any
): Promise<RAGPromptResult> {
  switch (type) {
    case 'framework':
      return RAGPromptGenerator.generateFrameworkPrompt(
        wizardData,
        selectedTool,
        additionalData?.userPrompt || wizardData.userPrompt
      );
    
    case 'page':
      return RAGPromptGenerator.generatePagePrompt(
        additionalData?.pageName,
        additionalData?.pageData,
        wizardData,
        selectedTool
      );
    
    case 'linking':
      return RAGPromptGenerator.generateLinkingPrompt(
        additionalData?.pageNames || [],
        wizardData,
        selectedTool
      );
    
    default:
      throw new Error(`Unsupported prompt type: ${type}`);
  }
}
