"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Sparkles,
  Target,
  Zap,
  Users,
  Star,
  ExternalLink,
  Rocket,
  ArrowRight,
  Layers,
  Palette
} from "lucide-react";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { BuilderWizardAccordion } from "@/components/BuilderWizardAccordion";
import { aiToolsDatabase, aiToolsCategories, AITool } from "@/lib/aiToolsDatabase";
import { mvpTemplates, MVPTemplate } from "@/lib/mvpTemplates";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('builder');
  const { toast } = useToast();

  const builderTools = aiToolsDatabase
    .filter(tool => tool.category === 'app-builders')
    .slice(0, 6);



  const handleToolSelect = (tool: AITool) => {
    toast({
      title: "Tool Selected",
      description: `Opening ${tool.name} in a new tab`
    });
    window.open(tool.officialUrl, '_blank');
  };

  const handleTemplateSelect = (template: MVPTemplate) => {
    toast({
      title: "Template Selected",
      description: `Starting Builder with ${template.name} template`
    });
    setActiveTab('builder');
  };

  return (
    <div className="workspace-background flex">
      <WorkspaceSidebar />
      <main className="flex-1 transition-all duration-300 md:ml-64">
        <div className="max-w-7xl mx-auto p-6">
          <div className="workspace-card-solid p-8">

            {/* Hero Section */}
            <div className="text-center space-y-6 py-8 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                  MVP Studio
                </h1>
              </div>

              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Your AI-powered build orchestrator. Generate prompts, get tool recommendations,
                and build your MVP with the best AI builders in the market.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">AI-Generated Prompts</span>
                </div>
                <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{aiToolsDatabase.length}+ Tools</span>
                </div>
                <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm">Export Ready</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
              <Button
                onClick={() => setActiveTab('builder')}
                size="lg"
                className="w-full sm:w-auto transition-all hover:shadow-glow hover:scale-105 bg-gradient-to-r from-primary to-primary/80"
              >
                <Layers className="h-5 w-5 mr-2" />
                Start Builder Cards
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto transition-all hover:shadow-glow hover:scale-105"
                onClick={() => setActiveTab('templates')}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Browse Templates
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto transition-all hover:shadow-glow hover:scale-105"
                onClick={() => setActiveTab('tools')}
              >
                <Target className="h-5 w-5 mr-2" />
                Browse AI Tools
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="builder">🧱 Builder Cards</TabsTrigger>
                <TabsTrigger value="templates">📋 MVP Templates</TabsTrigger>
                <TabsTrigger value="tools">🛠️ AI Tools Hub</TabsTrigger>
              </TabsList>

              {/* Builder Cards Tab */}
              <TabsContent value="builder" className="space-y-6">
                <BuilderWizardAccordion />
              </TabsContent>

              {/* MVP Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">MVP Templates</h2>
                  <p className="text-muted-foreground">Pre-configured templates to jumpstart your MVP development</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mvpTemplates.map(template => (
                    <Card key={template.id} className="workspace-card workspace-hover hover:translate-y-[-2px] transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <template.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                            <p className="text-muted-foreground mb-3">{template.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {template.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Complexity:</span>
                            <Badge variant={template.complexity === 'High' ? 'destructive' : template.complexity === 'Medium' ? 'default' : 'secondary'}>
                              {template.complexity}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Est. Time:</span>
                            <span>{template.estimatedTime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Recommended Tools:</span>
                            <span className="text-right">{template.recommendedTools.slice(0, 2).join(', ')}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full mt-4 workspace-button"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <Rocket className="h-4 w-4 mr-2" />
                          Use This Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* AI Tools Hub Tab */}
              <TabsContent value="tools" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">AI Tools Hub</h2>
                  <p className="text-muted-foreground">Discover the perfect AI tools to build, design, and deploy your MVP</p>

                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{aiToolsDatabase.length}+ Tools</span>
                    </div>
                    <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{aiToolsCategories.length} Categories</span>
                    </div>
                    <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-sm">INR Pricing</span>
                    </div>
                  </div>
                </div>

                {/* Featured Builder Tools */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">🏗️ Featured App Builders</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {builderTools.map((tool) => (
                      <Card key={tool.id} className="workspace-card group hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{aiToolsCategories.find(c => c.id === tool.category)?.icon}</div>
                              <div>
                                <CardTitle className="text-lg">{tool.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={tool.pricing.model === 'free' ? 'default' : 'secondary'}>
                                    {tool.pricing.inr}
                                  </Badge>
                                  {tool.apiCompatible && (
                                    <Badge variant="outline" className="text-xs">API</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">{tool.popularity}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {tool.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {tool.bestFor.slice(0, 3).map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleToolSelect(tool)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open Tool
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>


      </main>
    </div>
  );
}
