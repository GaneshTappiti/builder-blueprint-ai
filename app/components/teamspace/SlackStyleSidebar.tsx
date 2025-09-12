"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Hash, 
  Lock, 
  Plus, 
  Search, 
  Settings, 
  Users, 
  MessageSquare, 
  Phone, 
  Video, 
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Star,
  StarOff,
  Bell,
  BellOff,
  Circle,
  CheckCircle2
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamManagement } from "@/contexts/TeamManagementContext";
import { ChatChannel, ChatMessage } from "@/types/chat";
import { TeamMember } from "@/types/teamManagement";
import { cn } from "@/lib/utils";

interface SlackStyleSidebarProps {
  onChannelSelect: (channel: ChatChannel) => void;
  onDirectMessageSelect: (member: TeamMember) => void;
  onStartCall: (type: 'video' | 'audio', memberId?: string) => void;
  className?: string;
}

interface ChannelWithUnread extends ChatChannel {
  unreadCount: number;
  lastMessage?: ChatMessage;
}

interface DirectMessageWithStatus extends TeamMember {
  unreadCount: number;
  lastMessage?: ChatMessage;
  isOnline: boolean;
}

export function SlackStyleSidebar({ 
  onChannelSelect, 
  onDirectMessageSelect, 
  onStartCall,
  className 
}: SlackStyleSidebarProps) {
  const { channels, unreadCounts, currentChannel } = useChat();
  const { user } = useAuth();
  const { teamMembers } = useTeamManagement();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    channels: true,
    directMessages: true,
    starred: false
  });
  const [starredChannels, setStarredChannels] = useState<string[]>([]);

  // Process channels with unread counts
  const channelsWithUnread: ChannelWithUnread[] = channels.map(channel => ({
    ...channel,
    unreadCount: unreadCounts[channel.id] || 0,
    lastMessage: undefined // Would be populated from last message
  }));

  // Process team members for direct messages
  const directMessages: DirectMessageWithStatus[] = teamMembers
    .filter(member => member.id !== user?.id)
    .map(member => ({
      ...member,
      unreadCount: 0, // Would be calculated from private channel unread count
      lastMessage: undefined,
      isOnline: member.status === 'online'
    }));

  // Filter channels based on search
  const filteredChannels = channelsWithUnread.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter direct messages based on search
  const filteredDirectMessages = directMessages.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleStar = (channelId: string) => {
    setStarredChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const getChannelIcon = (channel: ChatChannel) => {
    if (channel.type === 'private') return <Lock className="h-4 w-4" />;
    return <Hash className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={cn("w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full", className)}>
      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Your Workspace</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Workspace Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Users className="h-4 w-4 mr-2" />
                Invite People
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Channels Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div 
            className="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-800 rounded px-2 py-1"
            onClick={() => toggleSection('channels')}
          >
            <div className="flex items-center">
              {expandedSections.channels ? 
                <ChevronDown className="h-4 w-4 text-gray-400 mr-1" /> : 
                <ChevronRight className="h-4 w-4 text-gray-400 mr-1" />
              }
              <span className="text-gray-400 text-sm font-medium">Channels</span>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                // Handle create channel
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {expandedSections.channels && (
            <div className="space-y-1">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  className={cn(
                    "flex items-center justify-between group px-2 py-1.5 rounded cursor-pointer hover:bg-gray-800",
                    currentChannel?.id === channel.id && "bg-gray-700"
                  )}
                  onClick={() => onChannelSelect(channel)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    {getChannelIcon(channel)}
                    <span className="ml-2 text-gray-300 text-sm truncate">
                      {channel.name}
                    </span>
                    {starredChannels.includes(channel.id) && (
                      <Star className="h-3 w-3 text-yellow-400 ml-1" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {channel.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                        {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(channel.id);
                      }}
                    >
                      {starredChannels.includes(channel.id) ? 
                        <StarOff className="h-3 w-3" /> : 
                        <Star className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Direct Messages Section */}
        <div className="p-2 border-t border-gray-700">
          <div 
            className="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-800 rounded px-2 py-1"
            onClick={() => toggleSection('directMessages')}
          >
            <div className="flex items-center">
              {expandedSections.directMessages ? 
                <ChevronDown className="h-4 w-4 text-gray-400 mr-1" /> : 
                <ChevronRight className="h-4 w-4 text-gray-400 mr-1" />
              }
              <span className="text-gray-400 text-sm font-medium">Direct Messages</span>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                // Handle add DM
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {expandedSections.directMessages && (
            <div className="space-y-1">
              {filteredDirectMessages.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between group px-2 py-1.5 rounded cursor-pointer hover:bg-gray-800"
                  onClick={() => onDirectMessageSelect(member)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-gray-900",
                        getStatusColor(member.status)
                      )} />
                    </div>
                    <span className="ml-2 text-gray-300 text-sm truncate">
                      {member.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {member.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                        {member.unreadCount > 99 ? '99+' : member.unreadCount}
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onStartCall('video', member.id)}>
                          <Video className="h-4 w-4 mr-2" />
                          Start Video Call
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStartCall('audio', member.id)}>
                          <Phone className="h-4 w-4 mr-2" />
                          Start Audio Call
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Bell className="h-4 w-4 mr-2" />
                          Notification Settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
