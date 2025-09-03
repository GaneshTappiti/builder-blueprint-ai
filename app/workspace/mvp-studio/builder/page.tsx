"use client"

import React from 'react';
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SixStageArchitecture } from "@/components/builder-cards/SixStageArchitecture";

import { BuilderProvider } from "@/lib/builderContext";
import { useState } from "react";
import { ArrowLeft, Brain, Sparkles, Menu } from "lucide-react";
import Link from "next/link";
import { MinimalHeader } from "@/components/MinimalHeader";

export default function BuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BuilderProvider>
      <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
        <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <main className="layout-main transition-all duration-300">
          {/* Minimal Header */}
                  <MinimalHeader 
          onToggleSidebar={() => setSidebarOpen(true)}
          backToPath="/workspace/mvp-studio"
          backToLabel="Back to MVP Studio"
        />

          {/* Main Content */}
          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-black/20 backdrop-blur-xl mb-6">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">AI-Powered Build Orchestrator</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
                  Builder Blueprint AI
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  Transform your app idea into AI-ready prompts for any AI builder platform.
                </p>
              </div>

              {/* 6-Stage Architecture Component */}
              <div className="workspace-card-solid p-6 sm:p-8 lg:p-10">
                <SixStageArchitecture showOverview={false} forceBuilderMode={true} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </BuilderProvider>
  );
}
