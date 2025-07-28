"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  RefreshCw, 
  Sparkles,
  Edit3,
  Copy,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { BusinessModelCanvas } from "@/types/businessModelCanvas";
import { BMCBlockGrid } from "@/components/bmc/BMCBlockGrid";
import { BMCExportPanel } from "@/components/bmc/BMCExportPanel";

export default function BMCViewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [canvas, setCanvas] = useState<BusinessModelCanvas | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Load canvas data
  useEffect(() => {
    const loadCanvas = () => {
      try {
        // For now, load from localStorage - in production, this would be an API call
        const savedCanvas = localStorage.getItem(`bmc-${params.id}`);
        if (savedCanvas) {
          setCanvas(JSON.parse(savedCanvas));
        } else {
          // Fallback to general saved canvas
          const generalCanvas = localStorage.getItem('bmc-canvas');
          if (generalCanvas) {
            setCanvas(JSON.parse(generalCanvas));
          } else {
            toast({
              title: "Canvas not found",
              description: "The requested Business Model Canvas could not be found.",
              variant: "destructive"
            });
            router.push('/workspace/business-model-canvas');
          }
        }
      } catch (error) {
        console.error('Error loading canvas:', error);
        toast({
          title: "Error loading canvas",
          description: "There was an error loading your Business Model Canvas.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadCanvas();
    }
  }, [params.id, router, toast]);

  const handleCanvasUpdate = (updatedCanvas: BusinessModelCanvas) => {
    setCanvas(updatedCanvas);
    // Save to localStorage
    localStorage.setItem(`bmc-${params.id}`, JSON.stringify(updatedCanvas));
    localStorage.setItem('bmc-canvas', JSON.stringify(updatedCanvas));
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
      const url = window.location.href;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-green-600" />
            <p className="text-gray-600">Loading your Business Model Canvas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <p className="text-gray-600">Canvas not found</p>
            <Link href="/workspace/business-model-canvas">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Generator
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/workspace/business-model-canvas">
                <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Business Model Canvas</h1>
                <p className="text-sm text-gray-600 mt-1">Review and refine each block. Click edit to customize or regenerate for new AI suggestions.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Business Idea Display */}
        <Card className="mb-6 sm:mb-8 bg-white/60 backdrop-blur-sm border-green-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Business Idea
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{canvas.appIdea}</p>
            {canvas.metadata && (
              <div className="flex flex-wrap gap-2 mt-3">
                {canvas.metadata.industry && (
                  <Badge variant="outline" className="text-xs">Industry: {canvas.metadata.industry}</Badge>
                )}
                {canvas.metadata.targetMarket && (
                  <Badge variant="outline" className="text-xs">Market: {canvas.metadata.targetMarket}</Badge>
                )}
                {canvas.metadata.businessType && (
                  <Badge variant="outline" className="text-xs">Type: {canvas.metadata.businessType.toUpperCase()}</Badge>
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
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
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
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShare}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
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
