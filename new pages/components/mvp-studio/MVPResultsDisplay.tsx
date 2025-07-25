import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PromptViewer } from '@/components/ui/prompt-viewer';
import { AIResponse } from '@/components/ui/ai-response';
import { Copy, ExternalLink, Download, Layers, Palette, Zap, Star, Clock, DollarSign, Globe, Chrome, Brain, Monitor, Link, Sparkles, Share } from 'lucide-react';

interface MVPResultsDisplayProps {
  results?: any;
}

const MVPResultsDisplay: React.FC<MVPResultsDisplayProps> = ({ results }) => {
  const { toast } = useToast();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (!results) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No results to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">MVP Results</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(JSON.stringify(results, null, 2))}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-white/10">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-green-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="prompts" className="text-white data-[state=active]:bg-green-600">
            Prompts
          </TabsTrigger>
          <TabsTrigger value="details" className="text-white data-[state=active]:bg-green-600">
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black/20 rounded-lg border border-white/10">
              <h4 className="text-white font-medium mb-2">Project Overview</h4>
              <p className="text-gray-300 text-sm">
                {results.description || "No description available"}
              </p>
            </div>
            <div className="p-4 bg-black/20 rounded-lg border border-white/10">
              <h4 className="text-white font-medium mb-2">Status</h4>
              <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
                {results.status || "Generated"}
              </Badge>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-400">Prompt results will be displayed here</p>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-400">Detailed results will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MVPResultsDisplay;