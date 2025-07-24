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
        <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No Blueprint Generated</h3>
        <p className="text-sm text-muted-foreground">
          Complete the previous steps to generate your app blueprint.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          <Layout className="h-5 w-5 text-blue-500" />
          Generated App Blueprint
        </h3>
        <p className="text-sm text-muted-foreground">
          Your app structure based on "{state.appIdea.appName}"
        </p>
      </div>

      {/* Screens List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4" />
            🖼️ Screens List ({state.appBlueprint.screens.length} screens)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.appBlueprint.screens.map((screen, index) => (
            <div key={screen.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Badge variant="outline" className="mt-0.5">
                {index + 1}
              </Badge>
              <div className="flex-1">
                <h4 className="font-medium">{screen.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  📌 {screen.purpose}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {screen.components.slice(0, 3).map((component, idx) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {component}
                    </span>
                  ))}
                  {screen.components.length > 3 && (
                    <span className="text-xs text-muted-foreground">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="h-4 w-4" />
            🔁 Page Flow (Navigation Structure)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-mono text-sm">{state.appBlueprint.navigationFlow}</p>
          </div>
          <div className="mt-4 space-y-2">
            <h5 className="font-medium text-sm">Screen Connections:</h5>
            {state.appBlueprint.screens.map((screen) => (
              <div key={screen.id} className="text-sm">
                <span className="font-medium">{screen.name}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-muted-foreground">
                  {screen.navigation.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            👤 User Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {state.appBlueprint.userRoles.map((role, index) => (
              <Badge key={index} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
          {state.appBlueprint.userRoles.length === 1 && (
            <p className="text-sm text-muted-foreground mt-2">
              Single user role detected. Consider if you need different permission levels.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            📊 Data Models
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.appBlueprint.dataModels.map((model, index) => (
            <div key={index} className="border rounded-lg p-3">
              <h5 className="font-medium">{model.name}</h5>
              <div className="flex flex-wrap gap-1 mt-2">
                {model.fields.map((field: string, idx: number) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
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
        <Button variant="outline" className="flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          Regenerate Blueprint
        </Button>
        
        <Button 
          onClick={continueToPrompts}
          disabled={isGeneratingPrompts}
          className="flex items-center gap-2"
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
