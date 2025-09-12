"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RAGContextClient } from '@/services/ragContextClient';

export default function TestRAGIntegration() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runRAGTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Tool Selection Context',
        query: {
          stage: 'tool_selection' as const,
          toolId: 'lovable' as const,
          appIdea: 'A task management app for teams',
          appType: 'web-app',
          platforms: ['web']
        }
      },
      {
        name: 'Blueprint Generation Context',
        query: {
          stage: 'blueprint_generation' as const,
          toolId: 'cursor' as const,
          appIdea: 'A social media platform',
          appType: 'web-app',
          platforms: ['web']
        }
      },
      {
        name: 'Prompt Generation Context',
        query: {
          stage: 'prompt_generation' as const,
          toolId: 'v0' as const,
          appIdea: 'An e-commerce store',
          appType: 'web-app',
          platforms: ['web'],
          screenName: 'Product Listing'
        }
      },
      {
        name: 'Flow Generation Context',
        query: {
          stage: 'flow_generation' as const,
          toolId: 'bolt' as const,
          appIdea: 'A fitness tracking app',
          appType: 'mobile-app',
          platforms: ['mobile']
        }
      }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}`);
        const startTime = Date.now();
        const context = await RAGContextClient.getContextForStage(test.query);
        const endTime = Date.now();
        
        results.push({
          name: test.name,
          success: true,
          duration: endTime - startTime,
          context: {
            toolSpecificContext: context.toolSpecificContext?.substring(0, 100) + '...',
            bestPractices: context.bestPractices?.slice(0, 3),
            codeExamples: context.codeExamples?.slice(0, 2),
            constraints: context.constraints?.slice(0, 2),
            optimizationTips: context.optimizationTips?.slice(0, 2)
          }
        });
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">RAG Integration Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test RAG Context API</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This page tests the RAG context injection across all MVP Studio stages.
            It verifies that tool-specific context is properly loaded and cached.
          </p>
          <Button 
            onClick={runRAGTests} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Running Tests...' : 'Run RAG Tests'}
          </Button>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Test Results</h2>
          {testResults.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? '✅' : '❌'} {result.name}
                  {result.duration && (
                    <span className="text-sm text-muted-foreground">
                      ({result.duration}ms)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-3">
                    {result.context.toolSpecificContext && (
                      <div>
                        <h4 className="font-medium">Tool Context:</h4>
                        <p className="text-sm text-muted-foreground">
                          {result.context.toolSpecificContext}
                        </p>
                      </div>
                    )}
                    {result.context.bestPractices && result.context.bestPractices.length > 0 && (
                      <div>
                        <h4 className="font-medium">Best Practices:</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {result.context.bestPractices.map((practice: string, i: number) => (
                            <li key={i}>{practice}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.context.codeExamples && result.context.codeExamples.length > 0 && (
                      <div>
                        <h4 className="font-medium">Code Examples:</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {result.context.codeExamples.map((example: string, i: number) => (
                            <li key={i}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.context.constraints && result.context.constraints.length > 0 && (
                      <div>
                        <h4 className="font-medium">Constraints:</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {result.context.constraints.map((constraint: string, i: number) => (
                            <li key={i}>{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.context.optimizationTips && result.context.optimizationTips.length > 0 && (
                      <div>
                        <h4 className="font-medium">Optimization Tips:</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {result.context.optimizationTips.map((tip: string, i: number) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    <h4 className="font-medium">Error:</h4>
                    <p className="text-sm">{result.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cache Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-muted p-3 rounded">
            {JSON.stringify(RAGContextClient.getCacheStats(), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
