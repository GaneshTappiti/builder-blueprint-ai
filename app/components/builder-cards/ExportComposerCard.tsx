"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  Copy, 
  Check, 
  Package, 
  FileText, 
  Layers,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { useBuilder, builderActions } from "@/lib/builderContext";
import { useToast } from "@/hooks/use-toast";
import { CelebrationAnimation } from "../CelebrationAnimation";

const builderTools = [
  {
    id: 'framer',
    name: 'Framer',
    description: 'Unified prompt for interactive web designs',
    icon: '🎨',
    promptStyle: 'unified'
  },
  {
    id: 'uizard',
    name: 'Uizard',
    description: 'Screen-by-screen for AI wireframes',
    icon: '🤖',
    promptStyle: 'screen-by-screen'
  },
  {
    id: 'adalo',
    name: 'Adalo',
    description: 'Screen-by-screen for no-code apps',
    icon: '📱',
    promptStyle: 'screen-by-screen'
  },
  {
    id: 'flutterflow',
    name: 'FlutterFlow',
    description: 'Unified prompt for Flutter apps',
    icon: '🚀',
    promptStyle: 'unified'
  },
  {
    id: 'bubble',
    name: 'Bubble',
    description: 'Screen-by-screen for web apps',
    icon: '💭',
    promptStyle: 'screen-by-screen'
  },
  {
    id: 'webflow',
    name: 'Webflow',
    description: 'Unified prompt for responsive websites',
    icon: '🌐',
    promptStyle: 'unified'
  }
];

export function ExportComposerCard() {
  const { state, dispatch } = useBuilder();
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState('framer');
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  // Show celebration when component first loads (project is complete)
  React.useEffect(() => {
    if (state.exportPrompts && !showCelebration) {
      const timer = setTimeout(() => setShowCelebration(true), 500);
      return () => clearTimeout(timer);
    }
  }, [state.exportPrompts, showCelebration]);

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, itemId]));
      toast({
        title: "Copied to Clipboard",
        description: "Content has been copied to your clipboard.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive"
      });
    }
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: `${filename} has been downloaded.`,
    });
  };

  const generateUnifiedPrompt = () => {
    if (!state.exportPrompts) return '';
    
    const tool = builderTools.find(t => t.id === selectedTool);
    const toolSpecific = tool ? `\n\n## ${tool.name} Specific Instructions\n${getToolSpecificInstructions(tool.id)}` : '';
    
    return state.exportPrompts.unifiedPrompt + toolSpecific;
  };

  const getToolSpecificInstructions = (toolId: string) => {
    switch (toolId) {
      case 'framer':
        return 'Create responsive components with proper breakpoints. Use Framer Motion for animations. Implement proper component hierarchy and reusable elements.';
      case 'uizard':
        return 'Focus on wireframe clarity and user flow. Use standard UI patterns and clear labeling for AI recognition.';
      case 'adalo':
        return 'Design for mobile-first approach. Use Adalo\'s native components and actions. Consider database relationships and user permissions.';
      case 'flutterflow':
        return 'Design with Flutter widgets in mind. Consider state management and navigation patterns. Use Material Design principles.';
      case 'bubble':
        return 'Think in terms of Bubble\'s element structure. Consider workflows and database design. Use responsive design principles.';
      case 'webflow':
        return 'Focus on semantic HTML structure. Use Webflow\'s class system effectively. Consider CMS integration if needed.';
      default:
        return 'Follow platform-specific best practices and design guidelines.';
    }
  };

  const generateScreenByScreenPrompts = () => {
    if (!state.screenPrompts) return [];
    
    return state.screenPrompts.map(prompt => ({
      ...prompt,
      fullPrompt: `# ${prompt.title} - ${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}

${prompt.layout}

## Components
${prompt.components}

## Behavior
${prompt.behavior}

## Conditional Logic
${prompt.conditionalLogic}

## Style Guidelines
${prompt.styleHints}

## ${builderTools.find(t => t.id === selectedTool)?.name} Specific
${getToolSpecificInstructions(selectedTool)}`
    }));
  };

  const downloadAllPrompts = () => {
    const tool = builderTools.find(t => t.id === selectedTool);
    const appName = state.appIdea.appName.replace(/[^a-zA-Z0-9]/g, '_');

    if (tool?.promptStyle === 'unified') {
      const content = generateUnifiedPrompt();
      downloadAsFile(content, `${appName}_${selectedTool}_unified_prompt.txt`);
    } else {
      const prompts = generateScreenByScreenPrompts();
      const content = prompts.map(p => `${p.fullPrompt}\n\n${'='.repeat(50)}\n\n`).join('');
      downloadAsFile(content, `${appName}_${selectedTool}_screen_prompts.txt`);
    }
  };

  const saveProject = () => {
    dispatch(builderActions.saveProject());
    toast({
      title: "Project Saved",
      description: "Your project has been saved to history.",
    });
  };

  if (!state.exportPrompts) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No Export Package Generated</h3>
        <p className="text-sm text-muted-foreground">
          Complete the app flow generation to create your export package.
        </p>
      </div>
    );
  }

  const selectedToolData = builderTools.find(t => t.id === selectedTool);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          <Package className="h-5 w-5 text-blue-500" />
          📦 Prompt Export Composer
        </h3>
        <p className="text-sm text-muted-foreground">
          Final prompt package ready for your chosen AI builder tool
        </p>
      </div>

      {/* Tool Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            Select Target Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTool} onValueChange={setSelectedTool}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {builderTools.map(tool => (
                <SelectItem key={tool.id} value={tool.id}>
                  <div className="flex items-center gap-2">
                    <span>{tool.icon}</span>
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs text-muted-foreground">{tool.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedToolData && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{selectedToolData.icon}</span>
                <span className="font-medium">{selectedToolData.name}</span>
                <Badge variant="secondary">{selectedToolData.promptStyle}</Badge>
              </div>
              <p className="text-sm text-blue-700">{selectedToolData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Tabs */}
      <Tabs defaultValue={selectedToolData?.promptStyle === 'unified' ? 'unified' : 'screen-by-screen'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unified" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Unified Prompt
          </TabsTrigger>
          <TabsTrigger value="screen-by-screen" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Screen-by-Screen
          </TabsTrigger>
        </TabsList>

        {/* Unified Prompt Tab */}
        <TabsContent value="unified" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Complete App Specification</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateUnifiedPrompt(), 'unified')}
                    className="flex items-center gap-2"
                  >
                    {copiedItems.has('unified') ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsFile(generateUnifiedPrompt(), `${state.appIdea.appName}_unified_prompt.txt`)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generateUnifiedPrompt()}
                readOnly
                className="min-h-[400px] text-sm font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Screen-by-Screen Tab */}
        <TabsContent value="screen-by-screen" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Individual Screen Prompts</h4>
            <Button
              onClick={downloadAllPrompts}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download All Screens
            </Button>
          </div>

          {generateScreenByScreenPrompts().map((prompt, index) => (
            <Card key={prompt.screenId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    {prompt.title}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(prompt.fullPrompt, prompt.screenId)}
                    className="flex items-center gap-2"
                  >
                    {copiedItems.has(prompt.screenId) ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={prompt.fullPrompt}
                  readOnly
                  className="min-h-[200px] text-sm font-mono"
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Success Message */}
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-green-800">🎉 Your Blueprint is Complete!</h4>
              <p className="text-sm text-green-700 mt-1">
                You've successfully created a comprehensive prompt package for "{state.appIdea.appName}". 
                Your prompts are optimized for {selectedToolData?.name} and ready to use.
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-green-600">
                <span>✅ {state.appBlueprint?.screens.length || 0} Screens</span>
                <span>✅ {state.screenPrompts.length} Detailed Prompts</span>
                <span>✅ Complete Flow Logic</span>
                <span>✅ Export Ready</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ExternalLink className="h-4 w-4" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <span>Copy or download your prompts using the buttons above</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <span>Open {selectedToolData?.name} and start a new project</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <span>Paste the prompts and let AI generate your app structure</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <span>Iterate and refine based on the generated output</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Project */}
      <div className="flex justify-center pt-4">
        <Button onClick={saveProject} className="flex items-center gap-2" size="lg">
          <Package className="h-4 w-4" />
          Save Project to History
        </Button>
      </div>

      {/* Celebration Animation */}
      <CelebrationAnimation
        isVisible={showCelebration}
        onClose={() => setShowCelebration(false)}
        projectName={state.appIdea.appName}
        onDownload={downloadAllPrompts}
        onShare={() => {
          toast({
            title: "Share Feature",
            description: "Share functionality coming soon!",
          });
        }}
      />
    </div>
  );
}

// Import React for hooks
import React from 'react';
