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
