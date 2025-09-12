import { NextRequest, NextResponse } from 'next/server';
import { RAGContextInjector } from '@/services/ragContextInjector';
import { RAGTool } from '@/types/ideaforge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stage, toolId, appIdea, appType, platforms, screenName } = body;

    // Validate required fields
    if (!stage || !appIdea) {
      return NextResponse.json(
        { error: 'Missing required fields: stage, appIdea' },
        { status: 400 }
      );
    }

    // Get RAG context for the specified stage
    const context = await RAGContextInjector.getContextForStage({
      stage,
      toolId: toolId as RAGTool,
      appIdea,
      appType,
      platforms,
      screenName
    });

    return NextResponse.json({
      success: true,
      context
    });

  } catch (error) {
    console.error('RAG context API error:', error);
    
    // Return fallback context if RAG fails
    const fallbackContext = {
      toolSpecificContext: '',
      architecturePatterns: '',
      bestPractices: ['Follow standard development practices', 'Ensure proper error handling', 'Implement responsive design'],
      codeExamples: ['Standard implementation patterns'],
      constraints: ['Consider platform limitations', 'Follow security best practices'],
      optimizationTips: ['Optimize for performance', 'Use appropriate design patterns']
    };

    return NextResponse.json({
      success: true,
      context: fallbackContext,
      fallback: true
    });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RAG Context API is running',
    endpoints: {
      POST: '/api/rag/context - Get RAG context for MVP Studio stages'
    }
  });
}
