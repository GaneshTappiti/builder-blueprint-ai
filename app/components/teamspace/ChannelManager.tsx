"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Hash, 
  Lock, 
  Users, 
  Settings, 
  Trash2, 
  Edit, 
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ChatChannel } from "@/types/chat";

interface ChannelManagerProps {
  teamId?: string;
  onChannelSelect?: (channel: ChatChannel) => void;
  selectedChannelId?: string;
  className?: string;
}

const ChannelManager: React.FC<ChannelManagerProps> = ({
  teamId,
  onChannelSelect,
  selectedChannelId,
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    channels,
    createChannel,
    updateChannel,
    deleteChannel,
    joinChannel,
    leaveChannel,
    loading,
    error
  } = useChat();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ChatChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private' | 'group'>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Form state for creating/editing channels
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'group' as 'group' | 'private' | 'public',
    settings: {
      allowFileUploads: true,
      allowReactions: true,
      allowMentions: true,
      maxMessageLength: 2000,
      slowMode: 0,
      autoDelete: 0
    }
  });

  // Filter channels based on search and type
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || channel.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreateChannel = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Channel name is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createChannel({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        team_id: teamId,
        created_by: user?.id || '',
        is_archived: false,
        settings: formData.settings
      });

      // Auto-join the channel (assuming it was created successfully)
      // Note: createChannel doesn't return the channel, so we can't auto-select it
      setShowCreateDialog(false);
      setFormData({
        name: '',
        description: '',
        type: 'group',
        settings: {
          allowFileUploads: true,
          allowReactions: true,
          allowMentions: true,
          maxMessageLength: 2000,
          slowMode: 0,
          autoDelete: 0
        }
      });
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditChannel = async () => {
    if (!editingChannel || !formData.name.trim()) return;

    try {
      await updateChannel(editingChannel.id, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        settings: formData.settings
      });

      setShowEditDialog(false);
      setEditingChannel(null);
      setFormData({
        name: '',
        description: '',
        type: 'group',
        settings: {
          allowFileUploads: true,
          allowReactions: true,
          allowMentions: true,
          maxMessageLength: 2000,
          slowMode: 0,
          autoDelete: 0
        }
      });
    } catch (error) {
      console.error('Error updating channel:', error);
      toast({
        title: "Error",
        description: "Failed to update channel. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      await deleteChannel(channelId);
      toast({
        title: "Channel deleted",
        description: "The channel has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: "Error",
        description: "Failed to delete channel. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLeaveChannel = async (channelId: string) => {
    try {
      await leaveChannel(channelId);
      toast({
        title: "Left channel",
        description: "You have left the channel successfully.",
      });
    } catch (error) {
      console.error('Error leaving channel:', error);
      toast({
        title: "Error",
        description: "Failed to leave channel. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (channel: ChatChannel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      description: channel.description || '',
      type: channel.type,
      settings: {
        allowFileUploads: channel.settings.allowFileUploads,
        allowReactions: channel.settings.allowReactions,
        allowMentions: channel.settings.allowMentions,
        maxMessageLength: channel.settings.maxMessageLength,
        slowMode: channel.settings.slowMode || 0,
        autoDelete: channel.settings.autoDelete || 0
      }
    });
    setShowEditDialog(true);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'public':
        return <Users className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const getChannelTypeColor = (type: string) => {
    switch (type) {
      case 'private':
        return 'bg-red-500/20 text-red-400';
      case 'public':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  if (loading) {
    return (
      <Card className={`bg-black/40 backdrop-blur-sm border-white/10 ${className || ''}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading channels...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-black/40 backdrop-blur-sm border-white/10 ${className || ''}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-red-400 mb-4">Error loading channels: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-black/40 backdrop-blur-sm border-white/10 ${className || ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">Channels</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/80 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Channel</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Create a new channel for your team to communicate.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Channel Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="general"
                      className="bg-black/20 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What's this channel about?"
                      className="bg-black/20 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type" className="text-white">Channel Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 bg-black/20 border border-white/10 rounded text-white"
                    >
                      <option value="group">Group</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateChannel} className="bg-green-600 hover:bg-green-700">
                    Create Channel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/20 border-white/10 text-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="flex gap-1">
              {(['all', 'group', 'public', 'private'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className={filterType === type ? "bg-green-600" : "text-gray-400 hover:text-white"}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {filteredChannels.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No channels found</p>
              {searchQuery && (
                <p className="text-sm">Try adjusting your search</p>
              )}
            </div>
          ) : (
            filteredChannels.map((channel) => (
              <div
                key={channel.id}
                className={`flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer group ${
                  selectedChannelId === channel.id ? 'bg-green-500/20 border-l-2 border-green-500' : ''
                }`}
                onClick={() => onChannelSelect?.(channel)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-gray-400 group-hover:text-white">
                    {getChannelIcon(channel.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">
                        {channel.name}
                      </span>
                      <Badge className={`text-xs ${getChannelTypeColor(channel.type)}`}>
                        {channel.type}
                      </Badge>
                    </div>
                    {channel.description && (
                      <p className="text-sm text-gray-400 truncate">
                        {channel.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/80 border-white/10">
                    <DropdownMenuItem onClick={() => openEditDialog(channel)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Channel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleLeaveChannel(channel.id)}>
                      <Users className="h-4 w-4 mr-2" />
                      Leave Channel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteChannel(channel.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Channel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Edit Channel Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-black/80 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Channel</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update channel settings and information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-white">Channel Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-white">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-type" className="text-white">Channel Type</Label>
              <select
                id="edit-type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-2 bg-black/20 border border-white/10 rounded text-white"
              >
                <option value="group">Group</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditChannel} className="bg-green-600 hover:bg-green-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ChannelManager;
