"use client"

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Menu, ArrowLeft } from "lucide-react";

interface MinimalHeaderProps {
  onToggleSidebar: () => void;
  backToPath?: string;
  backToLabel?: string;
}

export function MinimalHeader({ 
  onToggleSidebar, 
  backToPath = "/workspace", 
  backToLabel = "Back to Workspace"
}: MinimalHeaderProps) {

  return (
    <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Hamburger & Back Navigation */}
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-black/30"
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            
            {/* Back to Workspace Link */}
            {backToPath && (
              <Link
                href={backToPath}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{backToLabel}</span>
              </Link>
            )}
          </div>

          {/* Right Section - BETA Badge */}
          <div className="flex items-center">
            <Badge 
              variant="secondary" 
              className="bg-blue-600/20 text-blue-300 border-blue-600/40 text-xs font-semibold"
            >
              BETA
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
