"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Share2, 
  ArrowLeft,
  Lightbulb,
  Users,
  DollarSign,
  Settings,
  Zap,
  ExternalLink,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BusinessModelCanvas, BMCGenerationRequest } from "@/types/businessModelCanvas";
import { BMCBlockGrid } from "@/components/bmc/BMCBlockGrid";
import { BMCExportPanel } from "@/components/bmc/BMCExportPanel";
import { StoredIdea } from "@/types/ideaforge";

interface BMCViewProps {
  idea: StoredIdea;
  onUpdate?: (updates: Partial<StoredIdea>) => void;
}

export default function BMCView({ idea, onUpdate }: BMCViewProps) {
  const { toast } = useToast();
  const [canvas, setCanvas] = useState<BusinessModelCanvas | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [appIdea, setAppIdea] = useState(idea.title || '');
  const [industry, setIndustry] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [businessType, setBusinessType] = useState<'b2b' | 'b2c' | 'b2b2c'>('b2c');
  const [additionalContext, setAdditionalContext] = useState('');

  // Load existing BMC if available
  useEffect(() => {
    const loadExistingBMC = () => {
      try {
        // Check if there's an existing BMC for this idea
        const bmcKey = `bmc-${idea.id}`;
        const savedCanvas = localStorage.getItem(bmcKey);
        
        if (savedCanvas) {
          const loadedCanvas = JSON.parse(savedCanvas);
          setCanvas(loadedCanvas);
          setShowForm(false);
        } else {
          // Check for general saved canvas
          const generalCanvas = localStorage.getItem('bmc-canvas');
          if (generalCanvas) {
            const loadedCanvas = JSON.parse(generalCanvas);
            setCanvas(loadedCanvas);
            setShowForm(false);
          } else {
            setShowForm(true);
          }
        }
      } catch (error) {
        console.error('Error loading BMC:', error);
        setShowForm(true);
      }
    };

    loadExistingBMC();
  }, [idea.id]);

  const handleGenerate = async () => {
    const trimmedIdea = appIdea.trim();

    if (!trimmedIdea) {
      toast({
        title: "App idea required",
        description: "Please enter your app or business idea to generate a Business Model Canvas.",
        variant: "destructive"
      });
      return;
    }

    if (trimmedIdea.length < 10) {
      toast({
        title: "Idea too short",
        description: "Please provide a more detailed description of your app or business idea (at least 10 characters).",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStep('Initializing AI generation...');

    // Enhanced progress simulation with steps
    const progressSteps = [
      { progress: 10, step: 'Analyzing business idea...' },
      { progress: 25, step: 'Generating customer segments...' },
      { progress: 40, step: 'Creating value proposition...' },
      { progress: 55, step: 'Defining channels and relationships...' },
      { progress: 70, step: 'Structuring revenue and costs...' },
      { progress: 85, step: 'Checking for content duplication...' },
      { progress: 95, step: 'Finalizing business model canvas...' }
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        const currentStep = progressSteps[stepIndex];
        setGenerationProgress(currentStep.progress);
        setGenerationStep(currentStep.step);
        stepIndex++;
      }
    }, 800);

    try {
      const request: BMCGenerationRequest = {
        appIdea: appIdea.trim(),
        industry: industry || undefined,
        targetMarket: targetMarket || undefined,
        businessType,
        additionalContext: additionalContext || undefined
      };

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'business-model-canvas',
          prompt: JSON.stringify(request)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!data.success) {
        // Even if AI failed, we might have fallback content
        if (data.data?.canvas) {
          const canvas = data.data.canvas;
          const canvasId = canvas.id || `bmc_${Date.now()}`;

          // Save canvas to localStorage
          localStorage.setItem(`bmc-${idea.id}`, JSON.stringify(canvas));
          localStorage.setItem('bmc-canvas', JSON.stringify(canvas));

          setCanvas(canvas);
          setShowForm(false);

          toast({
            title: "Business Model Canvas Created",
            description: "Your canvas has been generated successfully.",
          });
        } else {
          throw new Error(data.error || 'Failed to generate Business Model Canvas');
        }
      } else {
        const canvas = data.data.canvas;
        const canvasId = canvas.id || `bmc_${Date.now()}`;

        // Save canvas to localStorage
        localStorage.setItem(`bmc-${idea.id}`, JSON.stringify(canvas));
        localStorage.setItem('bmc-canvas', JSON.stringify(canvas));

        setCanvas(canvas);
        setShowForm(false);

        toast({
          title: "Business Model Canvas Generated!",
          description: "Your canvas has been generated successfully.",
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error generating BMC:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate Business Model Canvas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setGenerationProgress(0);
        setGenerationStep('');
      }, 1000);
    }
  };

  const handleCanvasUpdate = (updatedCanvas: BusinessModelCanvas) => {
    // Clean up any error content in blocks
    const cleanedCanvas = {
      ...updatedCanvas,
      blocks: Object.fromEntries(
        Object.entries(updatedCanvas.blocks).map(([key, block]) => [
          key,
          {
            ...block,
            content: block.content?.includes('Error generating content') 
              ? '' 
              : block.content
          }
        ])
      )
    } as BusinessModelCanvas;

    setCanvas(cleanedCanvas);
    // Save to localStorage
    localStorage.setItem(`bmc-${idea.id}`, JSON.stringify(cleanedCanvas));
    localStorage.setItem('bmc-canvas', JSON.stringify(cleanedCanvas));
  };

  const handleRegenerate = async () => {
    if (!canvas) return;
    
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'business-model-canvas',
          prompt: JSON.stringify({
            appIdea: canvas.appIdea,
            industry: canvas.metadata?.industry,
            targetMarket: canvas.metadata?.targetMarket,
            businessType: canvas.metadata?.businessType,
          })
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const newCanvas = { ...data.data.canvas, id: canvas.id };
        handleCanvasUpdate(newCanvas);
        toast({
          title: "Canvas Regenerated!",
          description: "Your Business Model Canvas has been updated with fresh AI insights.",
        });
      } else {
        throw new Error(data.error || 'Failed to regenerate canvas');
      }
    } catch (error) {
      console.error('Error regenerating canvas:', error);
      toast({
        title: "Regeneration Failed",
        description: error instanceof Error ? error.message : "Failed to regenerate canvas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/workspace/idea-forge/${idea.id}?tab=bmc`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Share this link to let others view your Business Model Canvas.",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-green-600/20 border border-green-500/30">
              <Target className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Generate Business Model Canvas</h2>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Transform your idea into a complete, professional Business Model Canvas with AI-powered insights.
          </p>
        </div>

        {/* Input Form */}
        <Card className="glass-effect border-white/10 max-w-4xl mx-auto">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-white text-xl">
              <Lightbulb className="h-6 w-6 text-yellow-400" />
              Tell Us About Your Idea
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="appIdea" className="text-white font-medium text-sm">
                    App or Business Idea *
                  </Label>
                  <span className={`text-xs ${
                    appIdea.length > 1000 ? 'text-red-400' :
                    appIdea.length > 800 ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    {appIdea.length}/1000
                  </span>
                </div>
                <Textarea
                  id="appIdea"
                  placeholder="Describe your app or business idea in 1-2 sentences..."
                  value={appIdea}
                  onChange={(e) => setAppIdea(e.target.value)}
                  className={`bg-black/30 border-white/20 text-white placeholder:text-gray-400 min-h-[120px] resize-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 ${
                    appIdea.length > 1000 ? 'border-red-500/50' : ''
                  }`}
                  maxLength={1000}
                />
                {appIdea.length < 10 && appIdea.length > 0 && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Please provide more details (minimum 10 characters)
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="industry" className="text-white font-medium text-sm block">
                  Industry (Optional)
                </Label>
                <Input
                  id="industry"
                  placeholder="e.g., FinTech, HealthTech, EdTech"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="bg-black/30 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="targetMarket" className="text-white font-medium text-sm block">
                  Target Market (Optional)
                </Label>
                <Input
                  id="targetMarket"
                  placeholder="e.g., Young professionals, Small businesses"
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  className="bg-black/30 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="businessType" className="text-white font-medium text-sm block">
                  Business Type
                </Label>
                <Select value={businessType} onValueChange={(value: 'b2b' | 'b2c' | 'b2b2c') => setBusinessType(value)}>
                  <SelectTrigger className="bg-black/30 border-white/20 text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b2c">B2C (Business to Consumer)</SelectItem>
                    <SelectItem value="b2b">B2B (Business to Business)</SelectItem>
                    <SelectItem value="b2b2c">B2B2C (Business to Business to Consumer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2 space-y-3">
                <Label htmlFor="additionalContext" className="text-white font-medium text-sm block">
                  Additional Context (Optional)
                </Label>
                <Textarea
                  id="additionalContext"
                  placeholder="Any additional details about your business model, target audience, or unique aspects..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  className="bg-black/30 border-white/20 text-white placeholder:text-gray-400 min-h-[80px] resize-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                />
              </div>
            </div>
            
            <div className="space-y-6 pt-6 border-t border-white/10">
              {isGenerating && (
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white font-medium">
                      {generationStep || 'Generating your Business Model Canvas...'}
                    </span>
                    <span className="text-gray-400 font-mono">{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-3" />
                  {generationProgress >= 85 && generationProgress < 100 && (
                    <div className="text-center text-xs text-green-400 animate-pulse">
                      ✨ Applying deduplication for professional quality
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !appIdea.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium min-w-[280px] h-12"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                      Generating Canvas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-3" />
                      Generate Business Model Canvas
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className="text-center py-16">
        <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <Target className="h-12 w-12 text-green-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-300 mb-2">No Business Model Canvas Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Generate a comprehensive Business Model Canvas for your idea to visualize your business strategy.
        </p>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generate Canvas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Business Model Canvas</h2>
          <p className="text-gray-400 mt-1">Review and refine each block. Click edit to customize or regenerate for new AI suggestions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-400 border-green-400/30">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Generated
          </Badge>
        </div>
      </div>

      {/* Business Idea Display */}
      <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-green-400 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Business Idea
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-200 leading-relaxed">{canvas.appIdea}</p>
          {canvas.metadata && (
            <div className="flex flex-wrap gap-2 mt-3">
              {canvas.metadata.industry && (
                <Badge variant="outline" className="text-xs border-green-400/30 text-green-400">Industry: {canvas.metadata.industry}</Badge>
              )}
              {canvas.metadata.targetMarket && (
                <Badge variant="outline" className="text-xs border-green-400/30 text-green-400">Market: {canvas.metadata.targetMarket}</Badge>
              )}
              {canvas.metadata.businessType && (
                <Badge variant="outline" className="text-xs border-green-400/30 text-green-400">Type: {canvas.metadata.businessType.toUpperCase()}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* BMC Grid */}
      <BMCBlockGrid 
        canvas={canvas} 
        onCanvasUpdate={handleCanvasUpdate}
        isGenerating={isRegenerating}
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 shadow-lg shadow-green-600/20"
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Canvas
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowExportPanel(true)}
          className="border-green-400/30 text-green-400 hover:bg-green-400/10 hover:border-green-400/50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button
          variant="outline"
          onClick={handleShare}
          className="border-green-400/30 text-green-400 hover:bg-green-400/10 hover:border-green-400/50"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Export Panel */}
      {showExportPanel && (
        <BMCExportPanel
          canvas={canvas}
          isVisible={showExportPanel}
          onToggle={() => setShowExportPanel(false)}
        />
      )}
    </div>
  );
}
