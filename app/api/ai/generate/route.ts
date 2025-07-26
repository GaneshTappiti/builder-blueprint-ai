import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/services/geminiService';

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, options } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'text':
        result = await geminiService.generateText(prompt, options);
        break;
      case 'validate':
        result = await geminiService.validateIdea(prompt);
        break;
      case 'brief':
        result = await geminiService.generateStartupBrief(prompt);
        break;
      case 'market':
        result = await geminiService.analyzeMarket(prompt);
        break;
      case 'roadmap':
        result = await geminiService.generateRoadmap(prompt, options?.timeframe);
        break;
      case 'tasks':
        result = await geminiService.breakdownTasks(prompt, options?.complexity);
        break;
      case 'investors':
        result = await geminiService.findInvestorMatches(JSON.parse(prompt));
        break;
      case 'optimize-prompt':
        result = await geminiService.optimizePrompt(prompt, options?.purpose);
        break;
      case 'insights':
        result = await geminiService.generateInsights(JSON.parse(prompt));
        break;
      case 'recommendations':
        result = await geminiService.generateRecommendations(JSON.parse(prompt));
        break;
      case 'improve-writing':
        result = await geminiService.improveWriting(prompt, options?.purpose);
        break;
      case 'business-model-canvas':
        result = await geminiService.generateBusinessModelCanvas(JSON.parse(prompt));
        break;
      case 'bmc-block':
        const { blockId, appIdea, existingCanvas } = JSON.parse(prompt);
        result = await geminiService.generateBMCBlock(blockId, appIdea, existingCanvas);
        break;
      default:
        result = await geminiService.generateText(prompt, options);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
