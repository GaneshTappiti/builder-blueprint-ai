"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SixStageArchitecture } from "@/components/builder-cards/SixStageArchitecture";
import { BuilderProvider } from "@/lib/builderContext";
import SimpleMVPWizard from "@/components/mvp-studio/SimpleMVPWizard";
import { MinimalHeader } from "@/components/MinimalHeader";
import {
  Sparkles,
  Zap,
  Brain,
  ExternalLink,
  Layers,
  Target,
  ArrowLeft,
  CheckCircle,
  Clock,
  Play,
  Settings
} from "lucide-react";

export default function MVPStudioPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <BuilderProvider>
      <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
        <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="layout-main transition-all duration-300">
        {/* Minimal Header */}
        <MinimalHeader 
          onToggleSidebar={() => setSidebarOpen(true)}
          backToPath="/workspace"
          backToLabel="Back to Workspace"
          showSearch={false}
          showNotifications={false}
          showProfile={false}
        />

        {/* Main Content */}
        <div className="px-6 py-8 workspace-content-spacing">
          {/* SixStageArchitecture Component */}
          <SixStageArchitecture
            showOverview={true}
            onStartBuilder={() => router.push('/workspace/mvp-studio/builder')}
          />

        </div>

        {/* Bottom Section - Quick Actions and Features */}
        <div className="px-6 py-12 bg-black/40 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-4xl mx-auto">


            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-effect-theme p-6 rounded-lg text-center hover:bg-white/5 transition-colors">
                <Layers className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">🧱 Builder Cards</h3>
                <p className="text-gray-400 text-sm">Interactive builder recommendations</p>
              </div>
              <div className="glass-effect-theme p-6 rounded-lg text-center hover:bg-white/5 transition-colors">
                <Target className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">🚀 MVP Templates</h3>
                <p className="text-gray-400 text-sm">Pre-built project templates</p>
              </div>
              <div className="glass-effect-theme p-6 rounded-lg text-center hover:bg-white/5 transition-colors">
                <Zap className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">🛠️ AI Tools Hub</h3>
                <p className="text-gray-400 text-sm">Comprehensive tool directory</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* RAG-Enhanced MVP Wizard */}
      <SimpleMVPWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={(result) => {
          console.log('RAG-Enhanced MVP Wizard completed:', result);
          setIsWizardOpen(false);
          // You can add additional logic here to handle the result
        }}
      />

      </div>
    </BuilderProvider>
  );
}
