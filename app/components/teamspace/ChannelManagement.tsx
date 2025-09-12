"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Plus, 
  Hash, 
  Lock, 
  Users, 
  Settings, 
  Trash2, 
  Edit, 
  MoreVertical,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Shield,
  Crown,
  UserPlus,
  UserMinus,
  Bell,
  BellOff
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { ChatChannel, ChannelMember } from "@/types/chat";
import { TeamMember } from "@/types/teamManagement";
import { cn } from "@/lib/utils";

interface ChannelManagementProps {
  teamMembers: TeamMember[];
  onChannelSelect?: (channel: ChatChannel) => void;
  className?: string;
}

interface ChannelFormData {
  name: string;
  description: string;
  type: 'public' | 'private' | 'group';
  settings: {
    allowFileUploads: boolean;
    allowReactions: boolean;
    allowMentions: boolean;
    maxMessageLength: number;
    slowMode?: number;
    autoDelete?: number;
  };
}

interface ChannelFilters {
  search: string;
  type: string;
  sortBy: 'name' | 'created_at' | 'member_count';
  sortOrder: 'asc' | 'desc';
}

const ChannelManagement: React.FC<ChannelManagementProps> = ({
  teamMembers,
  onChannelSelect,
  className
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    channels, 
    createChannel, 
    updateChannel, 
    deleteChannel,
    joinChannel,
    leaveChannel,
    getChannelMembers
  } = useChat();
  
  const { hasPermission, isAdmin } = useTeamPermissions();

  // State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ChatChannel | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [channelMembers, setChannelMembers] = useState<ChannelMember[]>([]);
  const [filters, setFilters] = useState<ChannelFilters>({
    search: '',
    type: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [formData, setFormData] = useState<ChannelFormData>({
    name: '',
    description: '',
    type: 'public',
    settings: {
      allowFileUploads: true,
      allowReactions: true,
      allowMentions: true,
      maxMessageLength: 2000,
      slowMode: 0,
      autoDelete: 0
    }
  });

  // Load channel members when a channel is selected
  useEffect(() => {
    if (selectedChannel) {
      loadChannelMembers(selectedChannel.id);
    }
  }, [selectedChannel]);

  const loadChannelMembers = async (channelId: string) => {
    try {
      const members = getChannelMembers(channelId);
      setChannelMembers(members);
    } catch (error) {
      console.error('Error loading channel members:', error);
    }
  };

  const handleCreateChannel = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Channel name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const channelData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        team_id: user?.id,
        created_by: user?.id || '',
        settings: formData.settings,
        is_archived: false
      };

      await createChannel(channelData);
      
      toast({
        title: "Success",
        description: "Channel created successfully"
      });
      
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive"
      });
    }
  };

  const handleUpdateChannel = async () => {
    if (!editingChannel || !formData.name.trim()) {
      return;
    }

    try {
      await updateChannel(editingChannel.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        settings: formData.settings
      });
      
      toast({
        title: "Success",
        description: "Channel updated successfully"
      });
      
      setShowEditDialog(false);
      setEditingChannel(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update channel",
        variant: "destructive"
      });
    }
  };

  const handleDeleteChannel = async (channel: ChatChannel) => {
    if (!hasPermission('messages.manage_channels')) {
      toast({
        title: "Error",
        description: "You don't have permission to delete channels",
        variant: "destructive"
      });
      return;
    }

    try {
      await deleteChannel(channel.id);
      
      toast({
        title: "Success",
        description: "Channel deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete channel",
        variant: "destructive"
      });
    }
  };

  const handleJoinChannel = async (channel: ChatChannel) => {
    try {
      await joinChannel(channel.id);
      
      toast({
        title: "Success",
        description: `Joined #${channel.name}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join channel",
        variant: "destructive"
      });
    }
  };

  const handleLeaveChannel = async (channel: ChatChannel) => {
    try {
      await leaveChannel(channel.id);
      
      toast({
        title: "Success",
        description: `Left #${channel.name}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave channel",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'public',
      settings: {
        allowFileUploads: true,
        allowReactions: true,
        allowMentions: true,
        maxMessageLength: 2000,
        slowMode: 0,
        autoDelete: 0
      }
    });
  };

  const openEditDialog = (channel: ChatChannel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      description: channel.description || '',
      type: channel.type,
      settings: channel.settings
    });
    setShowEditDialog(true);
  };

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         (channel.description && channel.description.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesType = !filters.type || channel.type === filters.type;
    
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (filters.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'member_count':
        comparison = (channelMembers.length || 0) - (channelMembers.length || 0);
        break;
    }
    
    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'private': return <Lock className="h-4 w-4" />;
      case 'group': return <Users className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const getChannelTypeColor = (type: string) => {
    switch (type) {
      case 'private': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'group': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Channels</h2>
          <p className="text-gray-400">Manage team communication channels</p>
        </div>
        
        {hasPermission('messages.create_channels') && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Channel</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Set up a new communication channel for your team
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white">Channel Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., general, announcements"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-white">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What's this channel for?"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-white">Channel Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="group">Group</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Settings</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowFileUploads}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allowFileUploads: e.target.checked }
                        }))}
                      />
                      <span className="text-sm text-gray-300">Allow file uploads</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowReactions}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allowReactions: e.target.checked }
                        }))}
                      />
                      <span className="text-sm text-gray-300">Allow reactions</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowMentions}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allowMentions: e.target.checked }
                        }))}
                      />
                      <span className="text-sm text-gray-300">Allow mentions</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateChannel} className="bg-blue-600 hover:bg-blue-700">
                    Create Channel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search channels..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>
        
        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
        >
          <option value="">All Types</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="group">Group</option>
        </select>
        
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
        >
          <option value="name">Name</option>
          <option value="created_at">Created Date</option>
          <option value="member_count">Members</option>
        </select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters(prev => ({ 
            ...prev, 
            sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
          }))}
          className="border-gray-600 text-gray-300"
        >
          {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>

      {/* Channels List */}
      <div className="grid gap-4">
        {filteredChannels.map((channel) => (
          <Card key={channel.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getChannelIcon(channel.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">#{channel.name}</h3>
                      <Badge className={getChannelTypeColor(channel.type)}>
                        {channel.type}
                      </Badge>
                    </div>
                    {channel.description && (
                      <p className="text-sm text-gray-400">{channel.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        Created {new Date(channel.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {channelMembers.length} members
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedChannel(channel);
                      onChannelSelect?.(channel);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {hasPermission('messages.manage_channels') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(channel)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleJoinChannel(channel)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Join Channel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLeaveChannel(channel)}>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Leave Channel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Channel Settings
                      </DropdownMenuItem>
                      {hasPermission('messages.manage_channels') && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteChannel(channel)}
                            className="text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Channel
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Channel Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Channel</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update channel settings and information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white">Channel Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-white">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-white">Channel Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="group">Group</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateChannel} className="bg-blue-600 hover:bg-blue-700">
                Update Channel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChannelManagement;
