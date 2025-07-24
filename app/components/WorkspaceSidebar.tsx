"use client"

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Lightbulb, 
  Layout, 
  Palette, 
  GitBranch, 
  FileText, 
  Home,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface StageItem {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
}

const stages: StageItem[] = [
  {
    id: 'tool-adaptive',
    name: 'Tool-Adaptive Engine',
    path: '/stage/tool-adaptive',
    icon: Brain,
    status: 'upcoming',
    description: 'Configure AI builder preferences'
  },
  {
    id: 'idea-interpreter',
    name: 'Idea Interpreter',
    path: '/stage/idea-interpreter',
    icon: Lightbulb,
    status: 'upcoming',
    description: 'Transform ideas into structured requirements'
  },
  {
    id: 'app-skeleton',
    name: 'App Skeleton Generator',
    path: '/stage/app-skeleton',
    icon: Layout,
    status: 'upcoming',
    description: 'Generate app structure and navigation'
  },
  {
    id: 'ui-prompts',
    name: 'UI Prompt Generator',
    path: '/stage/ui-prompts',
    icon: Palette,
    status: 'upcoming',
    description: 'Create page-by-page UI prompts'
  },
  {
    id: 'logic-flow',
    name: 'Logic & Navigation Flow',
    path: '/stage/logic-flow',
    icon: GitBranch,
    status: 'upcoming',
    description: 'Map interactions and data flow'
  },
  {
    id: 'prompt-export',
    name: 'Prompt Export Composer',
    path: '/stage/prompt-export',
    icon: FileText,
    status: 'upcoming',
    description: 'Export ready-to-use prompts'
  }
];

export const WorkspaceSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isStageActive = (path: string) => pathname === path;
  const isHomeActive = pathname === '/';

  return (
    <div className={`fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">MVP Studio</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Home */}
          <Link href="/">
            <Button
              variant={isHomeActive ? "default" : "ghost"}
              className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}
              size="sm"
            >
              <Home className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Home</span>}
            </Button>
          </Link>

          <Separator className="my-4" />

          {/* Stages */}
          {!isCollapsed && (
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Build Stages
            </div>
          )}

          <div className="space-y-1">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = isStageActive(stage.path);
              
              return (
                <Link key={stage.id} href={stage.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} relative`}
                    size="sm"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{stage.name}</div>
                          <div className="text-xs text-muted-foreground">{stage.description}</div>
                        </div>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                        {stage.status === 'completed' && (
                          <Badge variant="default" className="text-xs">✓</Badge>
                        )}
                        {stage.status === 'current' && (
                          <Badge variant="secondary" className="text-xs">•</Badge>
                        )}
                      </div>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}
            size="sm"
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Settings</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}
            size="sm"
          >
            <HelpCircle className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Help</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

