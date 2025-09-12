"use client"

import { useState, useEffect } from "react";
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
  Settings,
  PlusCircle
} from "lucide-react";

export default function MVPStudioPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recent projects on component mount
  useEffect(() => {
    const loadRecentProjects = async () => {
      try {
        setIsLoading(true);
        // Simulate loading recent projects
        const projects = [
          {
            id: '1',
            name: 'E-commerce Platform',
            status: 'In Progress',
            lastModified: new Date().toISOString(),
            progress: 65
          },
          {
            id: '2', 
            name: 'Social Media App',
            status: 'Completed',
            lastModified: new Date(Date.now() - 86400000).toISOString(),
            progress: 100
          },
          {
            id: '3',
            name: 'Task Management Tool',
            status: 'Planning',
            lastModified: new Date(Date.now() - 172800000).toISOString(),
            progress: 25
          }
        ];
        setRecentProjects(projects);
      } catch (error) {
        console.error('Error loading recent projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentProjects();
  }, []);

  const handleWizardComplete = (result: any) => {
    console.log('RAG-Enhanced MVP Wizard completed:', result);
    setIsWizardOpen(false);
    
    // Add the new project to recent projects
    if (result && result.appName) {
      const newProject = {
        id: Date.now().toString(),
        name: result.appName,
        status: 'Planning',
        lastModified: new Date().toISOString(),
        progress: 10
      };
      setRecentProjects(prev => [newProject, ...prev.slice(0, 4)]); // Keep only 5 recent projects
    }
  };

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
              onStartBuilder={() => setIsWizardOpen(true)}
            />
          </div>

          {/* Enhanced Bottom Section - Recent Projects and Quick Actions */}
          <div className="px-6 py-12 bg-black/40 backdrop-blur-xl border-t border-white/10">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Projects */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-400" />
                      Recent Projects
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsWizardOpen(true)}
                      className="border-green-500/30 bg-green-600/10 hover:bg-green-600/20 text-green-400"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Project
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-black/20 rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentProjects.length > 0 ? (
                    <div className="space-y-3">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="bg-black/20 rounded-lg p-4 hover:bg-black/30 transition-colors cursor-pointer group">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white group-hover:text-green-400 transition-colors">
                              {project.name}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                project.status === 'Completed' ? 'border-green-500/30 text-green-400' :
                                project.status === 'In Progress' ? 'border-blue-500/30 text-blue-400' :
                                'border-yellow-500/30 text-yellow-400'
                              }`}
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{project.progress}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Layers className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No recent projects</p>
                      <Button
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Your First Project
                      </Button>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Quick Actions
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      onClick={() => setIsWizardOpen(true)}
                      className="w-full justify-start bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    >
                      <Sparkles className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Create New MVP</div>
                        <div className="text-xs opacity-90">Start with AI-powered wizard</div>
                      </div>
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/workspace/idea-forge')}
                      variant="outline"
                      className="w-full justify-start border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400"
                    >
                      <Brain className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Idea Forge</div>
                        <div className="text-xs opacity-90">Develop and refine ideas</div>
                      </div>
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/workspace/idea-vault')}
                      variant="outline"
                      className="w-full justify-start border-purple-500/30 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400"
                    >
                      <Target className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Idea Vault</div>
                        <div className="text-xs opacity-90">Manage your ideas</div>
                      </div>
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/workspace')}
                      variant="outline"
                      className="w-full justify-start border-gray-500/30 bg-gray-600/10 hover:bg-gray-600/20 text-gray-400"
                    >
                      <ExternalLink className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Workspace</div>
                        <div className="text-xs opacity-90">Back to main workspace</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* RAG-Enhanced MVP Wizard */}
        <SimpleMVPWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={handleWizardComplete}
        />
      </div>
    </BuilderProvider>
  );
}
