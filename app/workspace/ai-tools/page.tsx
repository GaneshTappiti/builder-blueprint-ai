"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Sparkles,
  Users,
  Zap,
  Rocket,
  Star,
  ExternalLink,
  Lightbulb,
  ChevronLeft,
  Target,
  Code,
  Menu
} from 'lucide-react';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import AIToolRecommender from '@/components/ai-tools/AIToolRecommender';
import { aiToolsCategories, aiToolsDatabase } from '@/lib/aiToolsDatabase';

export default function AIToolsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categoryStats = aiToolsCategories.map(category => ({
    ...category,
    count: aiToolsDatabase.filter(tool => tool.category === category.id).length,
    avgPopularity: Math.round(
      aiToolsDatabase
        .filter(tool => tool.category === category.id)
        .reduce((sum, tool) => sum + tool.popularity, 0) /
      aiToolsDatabase.filter(tool => tool.category === category.id).length
    )
  }));

  const featuredTools = aiToolsDatabase
    .filter(tool => tool.popularity >= 85)
    .slice(0, 6);

  const freeTools = aiToolsDatabase
    .filter(tool => tool.pricing.model === 'free')
    .slice(0, 4);

  const handleToolSelect = (tool: { name: string; officialUrl?: string }) => {
    toast({
      title: "Tool Selected",
      description: `Opening ${tool.name} in a new tab`
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Link
                  href="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">AI Tools Hub</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Discover and explore the best AI tools for your projects
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-8">
          
          {/* Hero Section */}
          <div className="text-center space-y-6 py-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-green-600/20 rounded-full">
                <Brain className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                AI Tools Hub
              </h1>
            </div>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover the perfect AI tools to build, design, and deploy your MVP. 
              From coding assistants to design tools, find everything you need to bring your ideas to life.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-white">{aiToolsDatabase.length}+ Tools</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-sm text-white">{aiToolsCategories.length} Categories</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <Star className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white">Curated & Updated</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryStats.slice(0, 4).map((category) => (
              <Card key={category.id} className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-green-500/30 transition-all duration-300 text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-2xl font-bold text-white">{category.count}</div>
                  <div className="text-sm text-gray-400">{category.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Featured Tools */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Featured Tools</h2>
              <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30">Most Popular</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.map((tool) => (
                <Card key={tool.id} className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-green-500/30 group hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {aiToolsCategories.find(c => c.id === tool.category)?.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{tool.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={tool.pricing.model === 'free' ? 'default' : 'secondary'} className="bg-green-600/20 text-green-400 border-green-500/30">
                              {tool.pricing.inr}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-400">{tool.popularity}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-gray-400">{tool.description}</CardDescription>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.bestFor.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-black/20 border-white/10 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      onClick={() => {
                        window.open(tool.officialUrl, '_blank');
                        handleToolSelect(tool);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Try {tool.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Free Tools Spotlight */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-green-500" />
              <h2 className="text-2xl font-bold text-white">Free Tools to Get Started</h2>
              <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-600/20">
                $0 Budget
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {freeTools.map((tool) => (
                <Card key={tool.id} className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-green-500/30 hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="text-2xl">
                        {aiToolsCategories.find(c => c.id === tool.category)?.icon}
                      </div>
                      <h3 className="font-semibold text-white">{tool.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {tool.description}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-black/20 border-white/10 hover:bg-black/30 text-white"
                        onClick={() => {
                          window.open(tool.officialUrl, '_blank');
                          handleToolSelect(tool);
                        }}
                      >
                        Try Free
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Tool Recommender */}
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <AIToolRecommender
              onToolSelect={handleToolSelect}
              showRecommendationFlow={true}
            />
          </div>

          {/* Growth Strategy Section */}
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-white">Ready to Build Your MVP?</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Join thousands of founders who've used our AI tool recommendations to build successful MVPs.
                From idea to launch in record time.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center space-y-3">
                  <div className="p-3 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full w-fit mx-auto">
                    <Target className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white">1. Get Recommendations</h3>
                  <p className="text-sm text-gray-400">
                    Tell us about your MVP and get personalized tool suggestions
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <div className="p-3 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full w-fit mx-auto">
                    <Code className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white">2. Build with AI</h3>
                  <p className="text-sm text-gray-400">
                    Use recommended tools to design, code, and deploy your MVP
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <div className="p-3 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full w-fit mx-auto">
                    <Rocket className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white">3. Launch & Scale</h3>
                  <p className="text-sm text-gray-400">
                    Deploy your MVP and iterate based on user feedback
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Building Now
                </Button>
                <Button variant="outline" size="lg" className="bg-black/60 border-white/20 hover:bg-black/80 text-white">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Success Stories
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
