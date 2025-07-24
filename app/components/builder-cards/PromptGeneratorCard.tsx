"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  Layout, 
  Settings, 
  Palette,
  Copy,
  Check
} from "lucide-react";
import { useBuilder, builderActions } from "@/lib/builderContext";
import { useToast } from "@/hooks/use-toast";

export function PromptGeneratorCard() {
  const { state, dispatch } = useBuilder();
  const { toast } = useToast();
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [showAllScreens, setShowAllScreens] = useState(false);
  const [copiedPrompts, setCopiedPrompts] = useState<Set<string>>(new Set());
  const [isGeneratingFlow, setIsGeneratingFlow] = useState(false);

  const screenPrompts = state.screenPrompts;
  const currentPrompt = screenPrompts[currentScreenIndex];

  const handlePreviousScreen = () => {
    if (currentScreenIndex > 0) {
      setCurrentScreenIndex(currentScreenIndex - 1);
    }
  };

  const handleNextScreen = () => {
    if (currentScreenIndex < screenPrompts.length - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1);
    }
  };

  const copyPromptToClipboard = async (promptText: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompts(prev => new Set([...prev, promptId]));
      toast({
        title: "Copied to Clipboard",
        description: "Prompt has been copied to your clipboard.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedPrompts(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy prompt to clipboard.",
        variant: "destructive"
      });
    }
  };

  const generateFullPrompt = (prompt: any) => {
    return `Screen: ${prompt.title}

Layout & Structure:
${prompt.layout}

Components:
${prompt.components}

Behavior & Interactions:
${prompt.behavior}

Conditional Logic:
${prompt.conditionalLogic}

Style Guidelines:
${prompt.styleHints}

Platform: ${state.appIdea.platforms.join(' and ')}
Design Style: ${state.appIdea.designStyle}`;
  };

  const continueToFlow = async () => {
    if (screenPrompts.length === 0) {
      toast({
        title: "No Screen Prompts",
        description: "Please generate screen prompts first.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingFlow(true);
    dispatch(builderActions.setGenerating(true));
    dispatch(builderActions.setGenerationProgress(0));

    // Simulate flow generation
    const progressSteps = [
      { progress: 30, delay: 700, message: "Analyzing screen relationships..." },
      { progress: 60, delay: 900, message: "Creating navigation logic..." },
      { progress: 90, delay: 600, message: "Generating flow descriptions..." },
      { progress: 100, delay: 400, message: "Finalizing app flow..." }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      dispatch(builderActions.setGenerationProgress(step.progress));
    }

    // Generate app flow
    const appFlow = {
      flowLogic: generateFlowLogic(),
      conditionalRouting: generateConditionalRouting(),
      backButtonBehavior: "Standard back navigation with state preservation",
      modalLogic: "Modals for confirmations, forms, and detail views",
      screenTransitions: generateScreenTransitions()
    };

    dispatch(builderActions.setAppFlow(appFlow));
    dispatch(builderActions.setGenerating(false));
    dispatch(builderActions.setCurrentCard(5));
    setIsGeneratingFlow(false);

    toast({
      title: "App Flow Generated!",
      description: "Navigation and wireframe logic is ready.",
    });
  };

  const generateFlowLogic = () => {
    const screens = state.appBlueprint?.screens || [];
    return `App follows a ${screens.length}-screen architecture:\n` +
           screens.map((screen, index) => 
             `${index + 1}. ${screen.name}: ${screen.purpose}`
           ).join('\n');
  };

  const generateConditionalRouting = () => {
    return [
      "Authentication required for main features",
      "Guest users redirected to login",
      "Admin users see additional options",
      "Error states show fallback screens"
    ];
  };

  const generateScreenTransitions = () => {
    const screens = state.appBlueprint?.screens || [];
    return screens.map(screen => 
      `${screen.name} → ${screen.navigation.join(', ')}`
    );
  };

  if (screenPrompts.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No Screen Prompts Generated</h3>
        <p className="text-sm text-muted-foreground">
          Complete the blueprint generation to create detailed screen prompts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          🎨 Page-Level Prompt Generator
        </h3>
        <p className="text-sm text-muted-foreground">
          Detailed prompts for each screen ({screenPrompts.length} screens)
        </p>
      </div>

      {/* Screen Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousScreen}
          disabled={currentScreenIndex === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Screen
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {currentScreenIndex + 1} of {screenPrompts.length}
          </Badge>
          <span className="text-sm font-medium">{currentPrompt?.title}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextScreen}
          disabled={currentScreenIndex === screenPrompts.length - 1}
          className="flex items-center gap-2"
        >
          Next Screen
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Screen Prompt */}
      {currentPrompt && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                {currentPrompt.title}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyPromptToClipboard(generateFullPrompt(currentPrompt), currentPrompt.screenId)}
                className="flex items-center gap-2"
              >
                {copiedPrompts.has(currentPrompt.screenId) ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Prompt
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Layout */}
            <div>
              <h5 className="font-medium flex items-center gap-2 mb-2">
                <Layout className="h-4 w-4 text-blue-500" />
                Layout & Structure
              </h5>
              <div className="bg-gray-50 p-3 rounded text-sm">
                {currentPrompt.layout}
              </div>
            </div>

            {/* Components */}
            <div>
              <h5 className="font-medium flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-green-500" />
                Components
              </h5>
              <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-line">
                {currentPrompt.components}
              </div>
            </div>

            {/* Behavior */}
            <div>
              <h5 className="font-medium flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Behavior & Interactions
              </h5>
              <div className="bg-gray-50 p-3 rounded text-sm">
                {currentPrompt.behavior}
              </div>
            </div>

            {/* Conditional Logic */}
            <div>
              <h5 className="font-medium flex items-center gap-2 mb-2">
                <ArrowRight className="h-4 w-4 text-orange-500" />
                Conditional Logic
              </h5>
              <div className="bg-gray-50 p-3 rounded text-sm">
                {currentPrompt.conditionalLogic}
              </div>
            </div>

            {/* Style Hints */}
            <div>
              <h5 className="font-medium flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-pink-500" />
                Style Guidelines
              </h5>
              <div className="bg-gray-50 p-3 rounded text-sm">
                {currentPrompt.styleHints}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toggle All Screens View */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setShowAllScreens(!showAllScreens)}
          className="flex items-center gap-2"
        >
          {showAllScreens ? 'Hide' : 'Show'} All Screens
          <Layout className="h-4 w-4" />
        </Button>
      </div>

      {/* All Screens Accordion */}
      {showAllScreens && (
        <div className="space-y-3">
          <h4 className="font-medium">All Screen Prompts</h4>
          {screenPrompts.map((prompt, index) => (
            <Card key={prompt.screenId} className="border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{prompt.title}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyPromptToClipboard(generateFullPrompt(prompt), prompt.screenId)}
                    className="flex items-center gap-2"
                  >
                    {copiedPrompts.has(prompt.screenId) ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  value={generateFullPrompt(prompt)}
                  readOnly
                  className="min-h-[200px] text-sm"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={continueToFlow}
          disabled={isGeneratingFlow}
          className="flex items-center gap-2"
          size="lg"
        >
          {isGeneratingFlow ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Generating Flow...
            </>
          ) : (
            <>
              Continue to App Flow
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
