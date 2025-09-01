"use client"

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Menu, ArrowLeft, Search, Calendar, ChevronDown, Bell, User, Settings, Brain } from "lucide-react";
import { useState, useRef } from "react";

interface MinimalHeaderProps {
  onToggleSidebar: () => void;
  backToPath?: string;
  backToLabel?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  unreadCount?: number;
  onShowNotifications?: () => void;
  onShowProfile?: () => void;
  onShowSettings?: () => void;
  onShowAISettings?: () => void;
}

export function MinimalHeader({ 
  onToggleSidebar, 
  backToPath = "/workspace", 
  backToLabel = "Back to Workspace",
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  onSearchChange,
  searchQuery = "",
  unreadCount = 0,
  onShowNotifications,
  onShowProfile,
  onShowSettings,
  onShowAISettings
}: MinimalHeaderProps) {
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  return (
    <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Hamburger, Search & Context */}
          <div className="flex items-center gap-2 md:gap-4 flex-1">
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
            
            {/* Back to Workspace Link - Only show if path is provided */}
            {backToPath && (
              <Link
                href={backToPath}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{backToLabel}</span>
              </Link>
            )}

            {/* Enhanced Search bar */}
            {showSearch && (
              <div ref={searchRef} className="relative flex-1 max-w-xs md:max-w-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workspace..."
                  className="pl-10 pr-4 py-2 w-full md:w-80 bg-black/50 border-white/20 text-white"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:block">
                  <kbd className="px-2 py-1 text-xs text-gray-400 bg-black/30 rounded border border-white/10">
                    ⌘K
                  </kbd>
                </div>
              </div>
            )}

            {/* Context Switcher - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-black/30 px-3 py-2">
                <Calendar className="h-4 w-4 mr-2" />
                Today
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Section - Actions & Profile */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* AI Status Indicator - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">AI Ready</span>
            </div>

            {/* Divider - Hidden on mobile */}
            <div className="hidden md:block h-6 w-px bg-white/10"></div>

            {/* Notification Button */}
            {showNotifications && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30 relative"
                  onClick={onShowNotifications}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-green-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            )}

            {/* Profile Button */}
            {showProfile && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30"
                  onClick={onShowProfile}
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Button>
              </div>
            )}

            {/* BETA Badge */}
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
