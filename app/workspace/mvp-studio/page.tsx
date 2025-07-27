"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SixStageArchitecture } from "@/components/builder-cards/SixStageArchitecture";
import { BuilderProvider } from "@/lib/builderContext";
import { 
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

          {/* Working Builder Blueprint AI Section */}
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

            {/* 6-Stage Builder Architecture */}
            <section className="mb-6 md:mb-8">
              <div>
                <BuilderProvider>
                  <SixStageArchitecture className="px-0" showOverview={true} />
                </BuilderProvider>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
