"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useIdeaForgePersistence } from "@/hooks/useIdeaForgePersistence";
import { Feature, TechStackItem } from "@/utils/ideaforge-persistence";
import {
  Layers, Plus, Smartphone, Code, Database, Edit, Trash2, Save, X,
  Monitor, Globe, Zap, Settings, ArrowUp, ArrowDown, Star, Brain,
  CheckCircle, Circle, Clock, AlertTriangle, Target, Rocket, Users, TrendingUp,
  Copy, Download, Share2, ExternalLink, History, FileText, Package, 
  ChevronRight, Play, RefreshCw, Archive, Eye, EyeOff, ArrowLeft, 
  BarChart3, Calendar, FileJson, FileCode, Globe2
} from "lucide-react";
import { StoredIdea, MVPStudioData, PromptHistoryItem, BlueprintAnalytics, RAGTool } from "@/types/ideaforge";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface BlueprintViewProps {
  idea: StoredIdea;
  onUpdate?: (updates: Partial<StoredIdea>) => void;
}

const BlueprintView: React.FC<BlueprintViewProps> = ({ idea, onUpdate }) => {
  const { toast } = useToast();
  const router = useRouter();
  const {
    features,
    techStack,
    appConfig,
    addFeature,
    updateFeature,
    deleteFeature,
    reorderFeatures,
    addTechStackItem,
    updateTechStackItem,
    deleteTechStackItem,
    updateAppConfig,
    isLoading
  } = useIdeaForgePersistence(idea.id);

  // Check for MVP Studio completion status from localStorage
  const [mvpStudioCompleted, setMvpStudioCompleted] = useState(false);
  const [mvpStudioData, setMvpStudioData] = useState<MVPStudioData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Check for MVP Studio data from localStorage
  useEffect(() => {
    const checkMvpStudioData = () => {
      try {
        // Check if there's any completed MVP Studio project
        const builderHistory = localStorage.getItem('builder-blueprint-history');
        if (builderHistory) {
          const projects = JSON.parse(builderHistory);
          const completedProject = projects.find((project: any) => 
            project.isCompleted && 
            project.appName.toLowerCase().includes(idea.title.toLowerCase())
          );

          if (completedProject) {
            // Convert builder project data to MVPStudioData format
            const mvpData: MVPStudioData = {
              isCompleted: true,
              completedAt: completedProject.dateModified,
              wizardData: {
                step1: { 
                  appName: completedProject.state.appIdea.appName, 
                  appType: "web-app" 
                },
                step2: { 
                  theme: "dark", 
                  designStyle: completedProject.state.appIdea.designStyle, 
                  selectedTool: completedProject.state.validationQuestions.selectedTool as RAGTool
                },
                step3: { 
                  platforms: completedProject.state.appIdea.platforms as any[]
                },
                step4: { 
                  selectedAI: "gpt-4" 
                },
                userPrompt: completedProject.state.appIdea.ideaDescription
              },
              generatedFramework: {
                prompts: {
                  framework: completedProject.state.exportPrompts?.unifiedPrompt || `Create a modern application called "${completedProject.state.appIdea.appName}". ${completedProject.state.appIdea.ideaDescription}`,
                  pages: completedProject.state.screenPrompts?.map((screen: any) => ({
                    pageName: screen.title,
                    prompt: `${screen.layout}\n\nComponents: ${screen.components}\n\nBehavior: ${screen.behavior}`,
                    components: screen.components.split(',').map((c: string) => c.trim()),
                    layout: screen.layout,
                    interactions: screen.conditionalLogic ? [screen.conditionalLogic] : []
                  })) || [],
                  linking: completedProject.state.appFlow?.flowLogic || "Implement proper navigation and user flow"
                },
                recommendedTools: [
                  {
                    name: completedProject.state.validationQuestions.selectedTool || "Cursor",
                    description: "AI-powered development tool",
                    url: "https://cursor.sh",
                    bestFor: ["Web apps", "Full-stack development"],
                    category: "ai-coding"
                  }
                ],
                metadata: {
                  generatedAt: completedProject.dateModified,
                  toolUsed: completedProject.state.validationQuestions.selectedTool as RAGTool,
                  confidence: 0.95
                }
              },
              promptHistory: completedProject.state.screenPrompts?.map((screen: any, index: number) => ({
                id: screen.screenId,
                type: "page" as const,
                content: `${screen.layout}\n\nComponents: ${screen.components}\n\nBehavior: ${screen.behavior}`,
                timestamp: completedProject.dateModified,
                version: index + 1,
                toolUsed: completedProject.state.validationQuestions.selectedTool as RAGTool,
                confidence: 0.95
              })) || [],
              analytics: {
                screensCount: completedProject.state.screenPrompts?.length || 0,
                userRolesCount: completedProject.state.appBlueprint?.userRoles?.length || 0,
                chosenTool: completedProject.state.validationQuestions.selectedTool as RAGTool,
                exportFormats: ["Markdown", "JSON", "PDF"],
                totalPrompts: (completedProject.state.screenPrompts?.length || 0) + 1,
                lastUpdated: completedProject.dateModified,
                completionPercentage: 100
              }
            };

            setMvpStudioData(mvpData);
            setMvpStudioCompleted(true);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking MVP Studio data:', error);
      }
      
      // No completed MVP Studio found
      setMvpStudioCompleted(false);
      setMvpStudioData(null);
    };

    checkMvpStudioData();
  }, [idea.title]);

  // Utility functions
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${label} has been copied to your clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToMvpStudio = () => {
    // Navigate to MVP Studio with the current idea context
    router.push('/workspace/mvp-studio');
  };

  const handleShareBlueprint = () => {
    if (!mvpStudioData) return;
    
    // Create a shareable link (in a real app, this would generate a unique URL)
    const shareableData = {
      ideaTitle: idea.title,
      blueprintData: mvpStudioData,
      shareUrl: `${window.location.origin}/shared-blueprint/${idea.id}`
    };
    
    const shareText = `Check out my ${idea.title} blueprint: ${shareableData.shareUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${idea.title} - Blueprint`,
        text: shareText,
        url: shareableData.shareUrl
      });
    } else {
      handleCopy(shareText, "Share link");
    }
  };

  const handleExport = (format: string) => {
    if (!mvpStudioData) return;
    
    let content = '';
    let filename = '';
    
    switch (format) {
      case 'markdown':
        content = generateMarkdownExport();
        filename = `${idea.title.replace(/[^a-zA-Z0-9]/g, '_')}-blueprint.md`;
        break;
      case 'json':
        content = JSON.stringify(mvpStudioData, null, 2);
        filename = `${idea.title.replace(/[^a-zA-Z0-9]/g, '_')}-blueprint.json`;
        break;
      case 'pdf':
        // In real app, this would generate PDF
        toast({
          title: "PDF Export",
          description: "PDF export feature coming soon!",
        });
        return;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `${format.toUpperCase()} file has been downloaded.`,
    });
  };

  const generateMarkdownExport = () => {
    if (!mvpStudioData) return '';
    
    return `# ${idea.title} - Blueprint

## Project Overview
${idea.description}

## Generated Framework
${mvpStudioData.generatedFramework.prompts.framework}

## Page Prompts
${mvpStudioData.generatedFramework.prompts.pages.map(page => 
  `### ${page.pageName}\n${page.prompt}\n\n**Components:** ${page.components.join(', ')}\n**Layout:** ${page.layout}\n**Interactions:** ${page.interactions.join(', ')}\n`
).join('\n')}

## Linking Strategy
${mvpStudioData.generatedFramework.prompts.linking}

## Recommended Tools
${mvpStudioData.generatedFramework.recommendedTools.map(tool => 
  `- **${tool.name}**: ${tool.description}\n  - Best for: ${tool.bestFor.join(', ')}\n  - URL: ${tool.url}\n`
).join('\n')}

---
*Generated on ${new Date(mvpStudioData.generatedFramework.metadata.generatedAt).toLocaleString()}*
*Tool used: ${mvpStudioData.generatedFramework.metadata.toolUsed}*
*Confidence: ${Math.round(mvpStudioData.generatedFramework.metadata.confidence * 100)}%*`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Context */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="h-6 w-6 text-green-400" />
              {idea.title} - Blueprint
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <Badge className={mvpStudioCompleted ? "bg-green-600/20 text-green-400 border-green-500/30" : "bg-yellow-600/20 text-yellow-400 border-yellow-500/30"}>
                {mvpStudioCompleted ? "Blueprint Ready" : "Incomplete"}
              </Badge>
              {mvpStudioData?.completedAt && (
                <span className="text-sm text-gray-400">
                  Completed {new Date(mvpStudioData.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {mvpStudioCompleted && (
            <>
              <Button
                variant="outline"
                onClick={() => handleExport('markdown')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={handleShareBlueprint}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Conditional Display */}
      {!mvpStudioCompleted ? (
        /* MVP Studio NOT completed - Show guidance */
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-yellow-600/20 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Your Blueprint is not ready yet</h3>
              <p className="text-gray-400 mb-6">
                Please complete the 6-Stage MVP Studio to auto-generate prompts and create your comprehensive blueprint. The MVP Studio will generate all the prompts, page-by-page descriptions, and tool-specific optimizations that will be stored here.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleNavigateToMvpStudio}
                  className="bg-green-600 hover:bg-green-700 w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Go to MVP Studio
                </Button>
                <p className="text-xs text-gray-500">
                  The MVP Studio will guide you through 6 stages to create a complete app blueprint
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* MVP Studio completed - Show Blueprint Repository */
        <div className="space-y-6">
          {/* Analytics & Insights */}
          {mvpStudioData?.analytics && (
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  Analytics & Insights
                </CardTitle>
                <p className="text-sm text-gray-400">Project statistics and development insights</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{mvpStudioData.analytics.screensCount}</div>
                    <div className="text-sm text-gray-400">Screens</div>
                    <div className="text-xs text-gray-500 mt-1">UI Pages</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{mvpStudioData.analytics.userRolesCount}</div>
                    <div className="text-sm text-gray-400">User Roles</div>
                    <div className="text-xs text-gray-500 mt-1">Access Levels</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{mvpStudioData.analytics.totalPrompts}</div>
                    <div className="text-sm text-gray-400">Total Prompts</div>
                    <div className="text-xs text-gray-500 mt-1">Generated</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{mvpStudioData.analytics.completionPercentage}%</div>
                    <div className="text-sm text-gray-400">Complete</div>
                    <div className="text-xs text-gray-500 mt-1">MVP Studio</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">Development Tool</span>
                    </div>
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                      {mvpStudioData.analytics.chosenTool}
                    </Badge>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-white">Last Updated</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(mvpStudioData.analytics.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span>Blueprint is ready for development with {mvpStudioData.analytics.chosenTool}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unified App Prompt */}
          {mvpStudioData?.generatedFramework.prompts.framework && (
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-400" />
                  Unified App Prompt
                </CardTitle>
                <p className="text-sm text-gray-400">Overall brief combining all 6 stages</p>
              </CardHeader>
              <CardContent>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {mvpStudioData.generatedFramework.prompts.framework}
                  </pre>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(mvpStudioData.generatedFramework.prompts.framework, "Unified prompt")}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Prompt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('markdown')}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Page-by-Page Prompts */}
          {mvpStudioData?.generatedFramework.prompts.pages && mvpStudioData.generatedFramework.prompts.pages.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-400" />
                  Page-by-Page Prompts
                </CardTitle>
                <p className="text-sm text-gray-400">Individual screen prompts from Stage 4 & 5</p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {mvpStudioData.generatedFramework.prompts.pages.map((page, index) => (
                    <AccordionItem key={index} value={`page-${index}`} className="border-white/10">
                      <AccordionTrigger className="text-white hover:text-green-400">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📱</span>
                          <span className="font-medium">{page.pageName}</span>
                          <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-xs">
                            {page.components.length} components
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                          <h5 className="font-medium text-white mb-2">Prompt</h5>
                          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                            {page.prompt}
                          </pre>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-medium text-white mb-2">Components</h6>
                            <div className="flex flex-wrap gap-1">
                              {page.components.map((component, idx) => (
                                <Badge key={idx} className="bg-white/10 text-gray-300 border-white/20 text-xs">
                                  {component}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h6 className="font-medium text-white mb-2">Interactions</h6>
                            <div className="flex flex-wrap gap-1">
                              {page.interactions.map((interaction, idx) => (
                                <Badge key={idx} className="bg-green-600/20 text-green-400 border-green-500/30 text-xs">
                                  {interaction}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(page.prompt, `${page.pageName} prompt`)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Screen Prompt
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Chosen Tool Context */}
          {mvpStudioData?.generatedFramework.recommendedTools && mvpStudioData.generatedFramework.recommendedTools.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-400" />
                  Chosen Tool Context
                </CardTitle>
                <p className="text-sm text-gray-400">Tool selected in Stage 3 with optimized prompts</p>
              </CardHeader>
              <CardContent>
                {mvpStudioData.generatedFramework.recommendedTools.map((tool, index) => (
                  <div key={index} className="bg-black/20 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{tool.name}</h4>
                        <p className="text-sm text-gray-400">{tool.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(tool.url, '_blank')}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Tool
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-400">Best for:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tool.bestFor.map((use, idx) => (
                            <Badge key={idx} className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-xs">
                              {use}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Category:</span>
                        <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30 text-xs ml-2">
                          {tool.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Prompt History */}
          {mvpStudioData?.promptHistory && mvpStudioData.promptHistory.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-cyan-400" />
                  Prompt History
                </CardTitle>
                <p className="text-sm text-gray-400">Timeline of all generated prompts with rollback capability</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mvpStudioData.promptHistory.map((item, index) => (
                    <div key={item.id} className="bg-black/20 p-4 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-cyan-600/20 text-cyan-400 border-cyan-500/30 text-xs">
                            {item.type}
                          </Badge>
                          <span className="text-sm text-gray-400">
                            v{item.version} • {new Date(item.timestamp).toLocaleString()}
                          </span>
                          {index === 0 && (
                            <Badge className="bg-green-600/20 text-green-400 border-green-500/30 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.confidence && (
                            <span className="text-xs text-gray-400">
                              {Math.round(item.confidence * 100)}% confidence
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(item.content, `${item.type} prompt`)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {index > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Rollback Feature",
                                  description: "Rollback functionality will restore this version as the current prompt.",
                                });
                              }}
                              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="bg-black/40 p-3 rounded border border-white/10">
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono line-clamp-3">
                          {item.content}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <History className="h-4 w-4" />
                    <span>Rollback any version to restore it as the current prompt</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    const allPrompts = [
                      mvpStudioData?.generatedFramework.prompts.framework,
                      ...(mvpStudioData?.generatedFramework.prompts.pages.map(p => p.prompt) || [])
                    ].filter(Boolean).join('\n\n---\n\n');
                    handleCopy(allPrompts, "All prompts");
                  }}
                  className="border-white/20 text-white hover:bg-white/10 h-auto p-4"
                >
                  <div className="text-center">
                    <Copy className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Copy All Prompts</div>
                    <div className="text-xs text-gray-400 mt-1">Unified + Screens</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('json')}
                  className="border-white/20 text-white hover:bg-white/10 h-auto p-4"
                >
                  <div className="text-center">
                    <Package className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Download Package</div>
                    <div className="text-xs text-gray-400 mt-1">Complete Blueprint</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNavigateToMvpStudio}
                  className="border-white/20 text-white hover:bg-white/10 h-auto p-4"
                >
                  <div className="text-center">
                    <RefreshCw className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Re-open MVP Studio</div>
                    <div className="text-xs text-gray-400 mt-1">Regenerate if needed</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BlueprintView;

