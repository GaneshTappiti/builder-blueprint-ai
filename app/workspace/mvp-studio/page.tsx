"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Brain, 
  ExternalLink,
  Layers,
  Target
} from "lucide-react";

export default function MVPStudioPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [formData, setFormData] = useState({
    appName: "",
    platforms: [] as string[],
    designStyle: "minimal",
    appDescription: "",
    targetAudience: "",
    styleDescription: ""
  });

  const stages = [
    { id: 1, title: "App Idea Input", description: "Tell us your app idea" },
    { id: 2, title: "Quick Validation Questions", description: "Understand your product maturity" },
    { id: 3, title: "Application Blueprint Generator", description: "Auto-generated app structure" },
    { id: 4, title: "Page-Level Prompt Generator", description: "Detailed screen descriptions" },
    { id: 5, title: "App Flow & Wireframe Describer", description: "Navigation and logic flow" },
    { id: 6, title: "Prompt Export Composer", description: "Final prompt package" }
  ];

  const designStyles = [
    {
      id: "minimal",
      title: "Minimal",
      description: "Clean, simple, and focused design",
      subtitle: "Think Apple, Notion, or Linear"
    },
    {
      id: "playful",
      title: "Playful", 
      description: "Colorful, fun, and engaging design",
      subtitle: "Think Duolingo, Spotify, or Discord"
    },
    {
      id: "business",
      title: "Business",
      description: "Professional, trustworthy, and corporate",
      subtitle: "Think Salesforce, LinkedIn, or Slack"
    }
  ];

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform)
    }));
  };

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main content */}
      <main className="layout-main transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarToggle onClick={() => setSidebarOpen(true)} />
                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-green-400" />
                  <h1 className="text-xl font-bold text-white">MVP Studio</h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-600/40">
                  BETA
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-6 py-12 workspace-content-spacing">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-black/20 backdrop-blur-xl mb-6">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">AI-Powered Build Orchestrator</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
              MVP Studio
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Your AI-powered build orchestrator. Generate prompts, get tool recommendations, and build your MVP with the best AI builders in the market.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="glass-effect-theme p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">AI-Generated Prompts</div>
                <div className="text-sm text-gray-400">Tailored for each builder</div>
              </div>
              <div className="glass-effect-theme p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">14+ Tools</div>
                <div className="text-sm text-gray-400">Supported platforms</div>
              </div>
              <div className="glass-effect-theme p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">Export Ready</div>
                <div className="text-sm text-gray-400">Copy & paste prompts</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                onClick={() => router.push('/workspace/mvp-studio/builder')}
              >
                <Layers className="mr-2 h-4 w-4" />
                Start 6-Stage Builder
              </Button>
              <Button variant="outline" className="border-green-500/30 hover:bg-green-500/10 text-white">
                <Target className="mr-2 h-4 w-4" />
                Browse Templates
              </Button>
              <Button variant="outline" className="border-green-500/30 hover:bg-green-500/10 text-white">
                <Zap className="mr-2 h-4 w-4" />
                Browse AI Tools
              </Button>
            </div>

            <div className="glass-effect-theme p-4 rounded-lg mb-8">
              <p className="text-gray-300 mb-2">Want to see the converted React Router landing page?</p>
              <Button variant="outline" className="border-blue-500/30 hover:bg-blue-500/10 text-blue-300">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Landing Page Demo
              </Button>
            </div>
          </div>

          {/* Builder Blueprint AI Section */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="glass-effect-theme p-6 rounded-lg text-center">
                <Layers className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">🧱 Builder Cards</h3>
                <p className="text-gray-400 text-sm">Interactive builder recommendations</p>
              </div>
              <div className="glass-effect-theme p-6 rounded-lg text-center">
                <Target className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">📋 MVP Templates</h3>
                <p className="text-gray-400 text-sm">Pre-built project templates</p>
              </div>
              <div className="glass-effect-theme p-6 rounded-lg text-center">
                <Zap className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">🛠️ AI Tools Hub</h3>
                <p className="text-gray-400 text-sm">Comprehensive tool directory</p>
              </div>
            </div>

            {/* Main Builder Form */}
            <div className="glass-effect-theme p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">🧱 Builder Blueprint AI</h2>
              </div>
              <p className="text-gray-300 mb-8">Transform your app idea into AI-ready prompts for any builder platform</p>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Stage {currentStage} of 6</span>
                  <span className="text-sm text-gray-400">{Math.round((currentStage / 6) * 100)}% Complete</span>
                </div>
                <Progress value={(currentStage / 6) * 100} className="h-2" />
              </div>

              {/* Project History */}
              <div className="mb-6">
                <Button variant="outline" className="border-green-500/30 hover:bg-green-500/10 text-white">
                  Project History
                </Button>
              </div>

              {/* Stage 1 Form */}
              {currentStage === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Stage 1</h3>
                    <p className="text-gray-400 mb-6">Define your app concept, platform, and design preferences</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="appName" className="text-white">App Name *</Label>
                      <Input
                        id="appName"
                        placeholder="e.g., TaskMaster Pro, FitTracker, StudyBuddy"
                        value={formData.appName}
                        onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
                        className="mt-1 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Platform(s) *</Label>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="web"
                            checked={formData.platforms.includes("web")}
                            onCheckedChange={(checked) => handlePlatformChange("web", checked as boolean)}
                          />
                          <Label htmlFor="web" className="text-gray-300">Web Application</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mobile"
                            checked={formData.platforms.includes("mobile")}
                            onCheckedChange={(checked) => handlePlatformChange("mobile", checked as boolean)}
                          />
                          <Label htmlFor="mobile" className="text-gray-300">Mobile App</Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Design Style</Label>
                      <RadioGroup
                        value={formData.designStyle}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, designStyle: value }))}
                        className="mt-2"
                      >
                        {designStyles.map((style) => (
                          <div key={style.id} className="glass-effect-theme p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={style.id} id={style.id} />
                              <div className="flex-1">
                                <Label htmlFor={style.id} className="text-white font-medium">{style.title}</Label>
                                {style.id === "minimal" && <Badge className="ml-2 bg-green-600/20 text-green-400">Selected</Badge>}
                                <p className="text-gray-400 text-sm mt-1">{style.description}</p>
                                <p className="text-gray-500 text-xs mt-1">{style.subtitle}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="styleDescription" className="text-white">Style Description (Optional)</Label>
                      <Textarea
                        id="styleDescription"
                        placeholder="Any specific design preferences, color schemes, or visual inspirations..."
                        value={formData.styleDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, styleDescription: e.target.value }))}
                        className="mt-1 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="appDescription" className="text-white">Describe your app idea in detail *</Label>
                      <Textarea
                        id="appDescription"
                        placeholder="Example: A mobile app to track daily habits and view streaks. Users can create custom habits, set reminders, view progress charts, and share achievements with friends. The app should have a clean, motivating interface with gamification elements like badges and levels..."
                        value={formData.appDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, appDescription: e.target.value }))}
                        className="mt-1 bg-black/20 border-white/10 text-white placeholder:text-gray-500 min-h-[120px]"
                      />
                      <p className="text-gray-500 text-xs mt-1">{formData.appDescription.length}/50 characters minimum</p>
                    </div>

                    <div>
                      <Label htmlFor="targetAudience" className="text-white">Target Audience (Optional)</Label>
                      <Input
                        id="targetAudience"
                        placeholder="e.g., Young professionals, Students, Small business owners"
                        value={formData.targetAudience}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                        className="mt-1 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <Button
                      onClick={() => setCurrentStage(2)}
                      disabled={!formData.appName || formData.platforms.length === 0 || formData.appDescription.length < 50}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Continue to Stage 2
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Stages Preview */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Stages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stages.slice(1).map((stage) => (
                    <div key={stage.id} className="glass-effect-theme p-4 rounded-lg">
                      <h4 className="font-medium text-white">{stage.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{stage.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
