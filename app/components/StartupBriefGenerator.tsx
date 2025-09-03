import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Loader2, Sparkles } from 'lucide-react';
import { aiEngine } from '@/services/aiEngine';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';

interface StartupBriefGeneratorProps {
  ideaDescription?: string;
  onGenerated?: (brief: string) => void;
  onSaveToVault?: (brief: string) => Promise<void>;
}

const StartupBriefGenerator: React.FC<StartupBriefGeneratorProps> = ({ 
  ideaDescription = '',
  onGenerated,
  onSaveToVault
}) => {
  const [idea, setIdea] = useState(ideaDescription);
  const [generatedBrief, setGeneratedBrief] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Auto-generate brief when component mounts with idea description
  useEffect(() => {
    if (ideaDescription && ideaDescription.trim()) {
      handleGenerate();
    }
  }, [ideaDescription]);

  const handleGenerate = async () => {
    if (!idea.trim()) return;

    setIsGenerating(true);
    try {
      // Use the existing AI response to generate a comprehensive startup brief
      const brief = await aiEngine.generateStartupBrief(idea);
      setGeneratedBrief(brief);
      onGenerated?.(brief);
      
      // Show success toast
      toast({
        title: "🚀 Startup Brief Generated!",
        description: "Your comprehensive startup analysis is ready",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating brief:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate startup brief. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedBrief], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'startup-brief.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Show loading state while generating
  if (isGenerating) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 mx-auto text-blue-400 animate-spin" />
            <h3 className="text-lg font-semibold text-white">Generating Startup Brief</h3>
            <p className="text-gray-400">Creating a comprehensive analysis from your AI response...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show generated brief
  if (generatedBrief) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-400" />
            Startup Brief Generated
            <Badge className="bg-green-600/20 text-green-400">Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">Comprehensive Startup Analysis</h4>
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Again
                </Button>
                {onSaveToVault && (
                  <Button
                    onClick={() => onSaveToVault(generatedBrief)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Add to Idea Vault
                  </Button>
                )}
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:bg-gray-800 prose-code:text-gray-200 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-gray-800 prose-pre:text-gray-200 prose-pre:p-4 prose-pre:rounded prose-blockquote:border-l-blue-400 prose-blockquote:bg-gray-800/50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:rounded-r prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-li:text-gray-300 prose-table:border prose-table:border-gray-600 prose-th:border prose-th:border-gray-600 prose-th:bg-gray-800 prose-th:p-3 prose-th:text-white prose-td:border prose-td:border-gray-600 prose-td:p-3 prose-td:text-gray-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold text-white mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-medium text-white mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-gray-300">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
                    code: ({ children }) => <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-400 bg-gray-800/50 pl-4 py-2 rounded-r text-gray-300 italic">{children}</blockquote>,
                  }}
                >
                  {generatedBrief}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show initial state (shouldn't normally be seen since we auto-generate)
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/10">
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          <FileText className="h-12 w-12 mx-auto text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Ready to Generate Brief</h3>
          <p className="text-gray-400">Click below to create a comprehensive startup analysis</p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleGenerate}
              disabled={!idea.trim() || isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Startup Brief
                </>
              )}
            </Button>
            {generatedBrief && (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StartupBriefGenerator;
