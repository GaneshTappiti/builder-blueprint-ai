"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import { 
  Brain, 
  Sparkles, 
  Download, 
  Copy, 
  RefreshCw, 
  ArrowLeft,
  Lightbulb,
  Target,
  Users,
  DollarSign,
  Settings,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { BusinessModelCanvas, BMCGenerationRequest } from "@/types/businessModelCanvas";
import { BMCBlockGrid } from "@/components/bmc/BMCBlockGrid";
import { BMCExportPanel } from "@/components/bmc/BMCExportPanel";

export default function BusinessModelCanvasPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appIdea, setAppIdea] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [businessType, setBusinessType] = useState<'b2b' | 'b2c' | 'b2b2c'>('b2c');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [canvas, setCanvas] = useState<BusinessModelCanvas | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const { toast } = useToast();

  // Auto-save and restore canvas from localStorage
  useEffect(() => {
    const savedCanvas = localStorage.getItem('bmc-canvas');
    if (savedCanvas) {
      try {
        const parsedCanvas = JSON.parse(savedCanvas);
        // Restore dates as Date objects
        parsedCanvas.createdAt = new Date(parsedCanvas.createdAt);
        parsedCanvas.updatedAt = new Date(parsedCanvas.updatedAt);
        Object.values(parsedCanvas.blocks).forEach((block: any) => {
          block.lastUpdated = new Date(block.lastUpdated);
        });
        setCanvas(parsedCanvas);
      } catch (error) {
        console.error('Error loading saved canvas:', error);
        localStorage.removeItem('bmc-canvas');
      }
    }
  }, []);

  // Auto-save canvas when it changes
  useEffect(() => {
    if (canvas) {
      try {
        localStorage.setItem('bmc-canvas', JSON.stringify(canvas));
      } catch (error) {
        console.error('Error saving canvas:', error);
      }
    }
  }, [canvas]);

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

    if (trimmedIdea.length > 1000) {
      toast({
        title: "Idea too long",
        description: "Please keep your idea description under 1000 characters for better AI processing.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

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
          setCanvas(data.data.canvas);
          toast({
            title: "Business Model Canvas Created",
            description: "AI generation encountered issues, but we've created a template for you to customize.",
            variant: "destructive"
          });
        } else {
          throw new Error(data.error || 'Failed to generate Business Model Canvas');
        }
      } else {
        setCanvas(data.data.canvas);

        toast({
          title: "Business Model Canvas Generated!",
          description: "Your AI-powered business model canvas is ready. Review and edit as needed.",
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
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const handleClearAll = () => {
    setCanvas(null);
    setAppIdea('');
    setIndustry('');
    setTargetMarket('');
    setBusinessType('b2c');
    setAdditionalContext('');
    setShowExportPanel(false);

    // Clear saved canvas from localStorage
    localStorage.removeItem('bmc-canvas');

    toast({
      title: "Canvas cleared",
      description: "All data has been cleared. You can start fresh with a new idea.",
    });
  };

  const handleTryExample = () => {
    setAppIdea('A mobile app that helps students track their daily study habits and collaborate with peers through group challenges');
    setIndustry('EdTech');
    setTargetMarket('High school and college students');
    setBusinessType('b2c');
    setAdditionalContext('Focus on gamification and social features to increase engagement and retention');

    toast({
      title: "Example loaded",
      description: "Click 'Generate Business Model Canvas' to see AI in action!",
    });
  };

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="layout-main transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarToggle onClick={() => setSidebarOpen(true)} />
                <Link
                  href="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-green-600/20 text-green-300 border-green-600/40">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center space-y-6 mb-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-green-600/20 border border-green-500/30">
                <Target className="h-10 w-10 text-green-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">AI Business Model Canvas Generator</h2>
            </div>
            <p className="text-gray-300 text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed px-4">
              Transform your app or business idea into a complete, professional Business Model Canvas.
              Our AI analyzes your concept and generates expert-level strategic insights across all 9 essential blocks.
            </p>

            {/* Example Preview */}
            <div className="mt-8 p-6 sm:p-8 bg-black/20 rounded-xl border border-white/10 max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
                <h3 className="text-xl font-semibold text-white">Example Output</h3>
              </div>
              <div className="text-left space-y-6">
                <p className="text-sm sm:text-base text-gray-300">
                  <strong className="text-green-400">Input:</strong> "A mobile app that helps students track their daily study habits and collaborate with peers through group challenges."
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                    <p className="text-blue-400 font-medium mb-2">Customer Segments</p>
                    <p className="text-xs text-gray-400">High school and college students seeking productivity tools...</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                    <p className="text-green-400 font-medium mb-2">Value Proposition</p>
                    <p className="text-xs text-gray-400">Gamified habit tracking with social accountability...</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg border border-white/10 sm:col-span-2 lg:col-span-1">
                    <p className="text-yellow-400 font-medium mb-2">Revenue Streams</p>
                    <p className="text-xs text-gray-400">Freemium model with premium analytics...</p>
                  </div>
                </div>
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleTryExample}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10 px-6 py-2"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Try This Example
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <Card className="glass-effect border-white/10 max-w-5xl mx-auto">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-white text-xl">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
                Tell Us About Your Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
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
                      <span className="text-white font-medium">Generating your Business Model Canvas...</span>
                      <span className="text-gray-400 font-mono">{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-3" />
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

                  {canvas && (
                    <Button
                      variant="outline"
                      onClick={handleClearAll}
                      className="border-white/20 text-white hover:bg-white/10 px-6 py-3 h-12"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Start Over
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Canvas */}
          {canvas && (
            <div className="space-y-8">
              <BMCBlockGrid
                canvas={canvas}
                onCanvasUpdate={setCanvas}
                isGenerating={isGenerating}
              />

              <BMCExportPanel
                canvas={canvas}
                isVisible={showExportPanel}
                onToggle={() => setShowExportPanel(!showExportPanel)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
