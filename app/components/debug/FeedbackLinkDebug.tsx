"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { publicFeedbackPersistence } from '@/utils/public-feedback-persistence';
import { createTestIdeaWithFeedback } from '@/utils/create-test-idea';

interface FeedbackLinkDebugProps {
  ideaId?: string;
}

export function FeedbackLinkDebug({ ideaId }: FeedbackLinkDebugProps) {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (ideaId) {
      gatherDebugInfo();
    }
  }, [ideaId]);

  const gatherDebugInfo = async () => {
    setIsLoading(true);
    try {
      const info = {
        ideaId,
        windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
        isPublicIdea: ideaId ? publicFeedbackPersistence.isPublicIdea(ideaId) : false,
        publicIdea: ideaId ? publicFeedbackPersistence.getPublicIdea(ideaId) : null,
        allPublicIdeas: publicFeedbackPersistence.getAllPublicIdeas(),
        clipboardSupported: typeof navigator !== 'undefined' && !!navigator.clipboard,
        timestamp: new Date().toISOString()
      };
      setDebugInfo(info);
    } catch (error) {
      console.error('Error gathering debug info:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testLinkGeneration = async () => {
    try {
      if (!ideaId) {
        toast({
          title: "Error",
          description: "No idea ID provided",
          variant: "destructive",
        });
        return;
      }

      const link = `${window.location.origin}/feedback/${ideaId}`;
      
      // Test clipboard
      try {
        await navigator.clipboard.writeText(link);
        toast({
          title: "Success",
          description: "Link generated and copied to clipboard",
        });
      } catch (clipboardError) {
        toast({
          title: "Link Generated",
          description: `Link: ${link}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to generate link: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const createTestIdea = () => {
    try {
      if (!ideaId) {
        toast({
          title: "Error",
          description: "No idea ID provided",
          variant: "destructive",
        });
        return;
      }

      createTestIdeaWithFeedback(ideaId);
      toast({
        title: "Success",
        description: "Test idea created successfully",
      });
      gatherDebugInfo();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create test idea: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const testPublicPage = () => {
    if (!ideaId) return;
    
    const link = `${window.location.origin}/feedback/${ideaId}`;
    window.open(link, '_blank');
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🐛 Feedback Link Debug
          <Badge variant="outline">Debug Mode</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={gatherDebugInfo} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh Debug Info'}
          </Button>
          <Button onClick={testLinkGeneration} disabled={!ideaId}>
            Test Link Generation
          </Button>
          <Button onClick={createTestIdea} disabled={!ideaId}>
            Create Test Idea
          </Button>
          <Button onClick={testPublicPage} disabled={!ideaId}>
            Open Public Page
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Quick Tests</h3>
          <div className="space-y-2">
            <div>
              <strong>Idea ID:</strong> {ideaId || 'Not provided'}
            </div>
            <div>
              <strong>Window Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
            </div>
            <div>
              <strong>Clipboard Support:</strong> {typeof navigator !== 'undefined' && !!navigator.clipboard ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              <strong>Public Idea Exists:</strong> {ideaId ? (publicFeedbackPersistence.isPublicIdea(ideaId) ? '✅ Yes' : '❌ No') : 'N/A'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
