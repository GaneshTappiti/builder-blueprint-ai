"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Layout, Users, GitBranch, Database, Eye, Edit3 } from "lucide-react";
import { useBuilder, builderActions } from "@/lib/builderContext";
import { useToast } from "@/hooks/use-toast";

export function BlueprintCard() {
  const { state, dispatch } = useBuilder();
  const { toast } = useToast();
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  const continueToPrompts = async () => {
    if (!state.appBlueprint) {
      toast({
        title: "No Blueprint Available",
        description: "Please generate a blueprint first.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPrompts(true);
    dispatch(builderActions.setGenerating(true));
    dispatch(builderActions.setGenerationProgress(0));

    // Simulate prompt generation
    const progressSteps = [
      { progress: 25, delay: 600, message: "Analyzing screen requirements..." },
      { progress: 50, delay: 800, message: "Creating detailed layouts..." },
      { progress: 75, delay: 700, message: "Generating component specifications..." },
      { progress: 100, delay: 500, message: "Finalizing prompts..." }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      dispatch(builderActions.setGenerationProgress(step.progress));
    }

    // Generate screen prompts based on blueprint
    const screenPrompts = state.appBlueprint.screens.map(screen => ({
      screenId: screen.id,
      title: screen.name,
      layout: generateLayoutPrompt(screen),
      components: generateComponentsPrompt(screen),
      behavior: generateBehaviorPrompt(screen),
      conditionalLogic: generateConditionalLogic(screen),
      styleHints: generateStyleHints(screen)
    }));

    // Add screen prompts to state
    screenPrompts.forEach(prompt => {
      dispatch(builderActions.addScreenPrompt(prompt));
    });

    dispatch(builderActions.setGenerating(false));
    dispatch(builderActions.setCurrentCard(4));
    setIsGeneratingPrompts(false);

    toast({
      title: "Screen Prompts Generated!",
      description: "Detailed prompts for each screen are ready for review.",
    });
  };

  const generateLayoutPrompt = (screen: any) => {
    const baseLayout = `${screen.name} screen with ${screen.purpose.toLowerCase()}. `;
    const components = screen.components.join(', ').toLowerCase();
    return `${baseLayout}Layout includes: ${components}. Use ${state.appIdea.designStyle} design style.`;
  };

  const generateComponentsPrompt = (screen: any) => {
    return screen.components.map((comp: string, index: number) => 
      `${index + 1}. ${comp}: Interactive element with appropriate styling and functionality`
    ).join('\n');
  };

  const generateBehaviorPrompt = (screen: any) => {
    const navigation = screen.navigation.join(', ');
    return `User interactions: Tap/click actions for navigation to ${navigation}. Include loading states and error handling.`;
  };

  const generateConditionalLogic = (screen: any) => {
    if (screen.id === 'login') return 'Show login form if not authenticated, redirect to dashboard if already logged in.';
    if (screen.id === 'dashboard') return 'Display personalized content based on user data and preferences.';
    return 'Standard navigation and state management based on user permissions and data availability.';
  };

  const generateStyleHints = (screen: any) => {
    const style = state.appIdea.designStyle;
    const platform = state.appIdea.platforms.join(' and ');
    return `${style} design for ${platform}. ${state.appIdea.styleDescription || 'Follow modern UI/UX best practices.'}`;
  };

  if (!state.appBlueprint) {
    return (
      <div className="text-center py-8">
        <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300">No Blueprint Generated</h3>
        <p className="text-sm text-gray-400">
          Complete the previous steps to generate your app blueprint.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2 text-white">
          <Layout className="h-5 w-5 text-blue-400" />
          Generated App Blueprint
        </h3>
        <p className="text-sm text-gray-400">
          Your app structure based on "{state.appIdea.appName}"
        </p>
      </div>

      {/* Screens List */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Eye className="h-4 w-4 text-blue-400" />
            🖼️ Screens List ({state.appBlueprint.screens.length} screens)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.appBlueprint.screens.map((screen, index) => (
            <div key={screen.id} className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
              <Badge variant="outline" className="mt-0.5 border-white/20 text-gray-300">
                {index + 1}
              </Badge>
              <div className="flex-1">
                <h4 className="font-medium text-white">{screen.name}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  📌 {screen.purpose}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {screen.components.slice(0, 3).map((component, idx) => (
                    <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded backdrop-blur-sm">
                      {component}
                    </span>
                  ))}
                  {screen.components.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{screen.components.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation Flow */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <GitBranch className="h-4 w-4 text-green-400" />
            🔁 Page Flow (Navigation Structure)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
            <p className="font-mono text-sm text-gray-300">{state.appBlueprint.navigationFlow}</p>
          </div>
          <div className="mt-4 space-y-2">
            <h5 className="font-medium text-sm text-white">Screen Connections:</h5>
            {state.appBlueprint.screens.map((screen) => (
              <div key={screen.id} className="text-sm">
                <span className="font-medium text-white">{screen.name}</span>
                <span className="text-gray-400"> → </span>
                <span className="text-gray-400">
                  {screen.navigation.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Roles */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Users className="h-4 w-4 text-purple-400" />
            👤 User Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {state.appBlueprint.userRoles.map((role, index) => (
              <Badge key={index} variant="secondary" className="bg-white/10 text-gray-300 border-white/20">
                {role}
              </Badge>
            ))}
          </div>
          {state.appBlueprint.userRoles.length === 1 && (
            <p className="text-sm text-gray-400 mt-2">
              Single user role detected. Consider if you need different permission levels.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data Models */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Database className="h-4 w-4 text-orange-400" />
            📊 Data Models
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.appBlueprint.dataModels.map((model, index) => (
            <div key={index} className="border border-white/20 rounded-lg p-3 bg-white/5 backdrop-blur-sm">
              <h5 className="font-medium text-white">{model.name}</h5>
              <div className="flex flex-wrap gap-1 mt-2">
                {model.fields.map((field: string, idx: number) => (
                  <span key={idx} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded backdrop-blur-sm">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" className="flex items-center gap-2 border-white/20 text-gray-300 hover:bg-white/10">
          <Edit3 className="h-4 w-4" />
          Regenerate Blueprint
        </Button>
        
        <Button 
          onClick={continueToPrompts}
          disabled={isGeneratingPrompts}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          {isGeneratingPrompts ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Generating Prompts...
            </>
          ) : (
            <>
              Continue to Page Prompts
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
