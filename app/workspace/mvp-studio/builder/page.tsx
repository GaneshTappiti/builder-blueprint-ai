"use client"

import React from 'react';
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SixStageArchitecture } from "@/components/builder-cards/SixStageArchitecture";

import { useState, useEffect } from "react";
import { ArrowLeft, Brain, Sparkles, Menu, Save, FolderOpen } from "lucide-react";
import Link from "next/link";
import { MinimalHeader } from "@/components/MinimalHeader";
import { useMVPProjectStorage } from "@/hooks/useMVPProjectStorage";
import { useSearchParams } from "next/navigation";

export default function BuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  
  const {
    currentProject,
    isLoading,
    isSaving,
    saveProject,
    createNewProject,
    loadProject
  } = useMVPProjectStorage({
    autoSave: true,
    projectId: projectId || undefined
  });

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
        <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <main className="layout-main transition-all duration-300">
          {/* Minimal Header */}
          <MinimalHeader 
            onToggleSidebar={() => setSidebarOpen(true)}
            backToPath="/workspace/mvp-studio"
            backToLabel="Back to MVP Studio"
          />
          
          {/* Project Status Bar */}
          {currentProject && (
            <div className="px-6 py-3 bg-black/20 backdrop-blur-xl border-b border-white/10">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">
                    {currentProject.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {currentProject.status}
                  </Badge>
                  {isSaving && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      Saving...
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => saveProject()}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-3 h-3" />
                  Save
                </Button>
              </div>
            </div>
          )}

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
  );
}
