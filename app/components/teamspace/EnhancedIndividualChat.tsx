"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  MicOff,
  Phone,
  Video,
  MoreHorizontal,
  Check,
  CheckCheck,
  ArrowLeft,
  Shield,
  Lock,
  Search,
  Filter,
  Bell,
  BellOff,
  Pin,
  PinOff,
  Download,
  Eye,
  EyeOff,
  X,
  Plus,
  Settings,
  Users,
  Hash,
  AtSign,
  FileText,
  Image,
  File,
  Volume2,
  VolumeX,
  Star,
  StarOff,
  Reply,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { TeamMember } from "@/types/teamManagement";
import { ChatMessage, FileAttachment, MessageReaction } from "@/types/chat";
import { cn } from "@/lib/utils";

interface EnhancedIndividualChatProps {
  member: TeamMember;
  currentUserId: string;
  onBack: () => void;
  isAdmin?: boolean;
  className?: string;
}

interface MessageSearchFilters {
  query: string;
  dateFrom: string;
  dateTo: string;
  messageType: string;
  senderId: string;
}

interface NotificationSettings {
  mentions: boolean;
  allMessages: boolean;
  reactions: boolean;
  fileUploads: boolean;
  systemMessages: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

const EnhancedIndividualChat: React.FC<EnhancedIndividualChatProps> = ({ 
  member, 
  currentUserId, 
  onBack,
  isAdmin = false,
  className
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    channels, 
    currentChannel, 
    messages, 
    sendMessage, 
    uploadFile, 
    searchMessages,
    markAsRead,
    reactToMessage,
    removeReaction,
    editMessage,
    deleteMessage,
    subscribeToChannel,
    unsubscribeFromChannel
  } = useChat();
  
  const { hasPermission } = useTeamPermissions();

  // State
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [searchFilters, setSearchFilters] = useState<MessageSearchFilters>({
    query: '',
    dateFrom: '',
    dateTo: '',
    messageType: '',
    senderId: ''
  });
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    mentions: true,
    allMessages: true,
    reactions: true,
    fileUploads: true,
    systemMessages: true,
    pushEnabled: true,
    emailEnabled: false
  });
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Get or create private channel for this member
  const privateChannel = channels.find(channel => 
    channel.type === 'private' && 
    channel.name.includes(member.name)
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to channel updates
  useEffect(() => {
    if (privateChannel) {
      subscribeToChannel(privateChannel.id);
      return () => unsubscribeFromChannel(privateChannel.id);
    }
  }, [privateChannel, subscribeToChannel, unsubscribeFromChannel]);

  // Mark messages as read when channel is active
  useEffect(() => {
    if (privateChannel && messages.length > 0) {
      markAsRead(privateChannel.id);
    }
  }, [privateChannel, messages, markAsRead]);

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Start typing indicator
    if (!isTyping) {
      setIsTyping(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !privateChannel) return;

    try {
      const messageData = {
        channel_id: privateChannel.id,
        sender_id: currentUserId,
        content: newMessage.trim(),
        message_type: 'text' as const,
        metadata: {
          mentions: extractMentions(newMessage),
          hashtags: extractHashtags(newMessage),
          custom_data: {
            reply_to: replyToMessage?.id
          }
        }
      };

      await sendMessage(newMessage.trim(), 'text', messageData.metadata);
      setNewMessage('');
      setReplyToMessage(null);
      setIsTyping(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !privateChannel) return;

    try {
      for (const file of Array.from(files)) {
        const attachment = await uploadFile(file, privateChannel.id);
        
        // Send message with file attachment
        const messageData = {
          channel_id: privateChannel.id,
          sender_id: currentUserId,
          content: `📎 ${file.name}`,
          message_type: 'file' as const,
          metadata: {
            custom_data: {
              attachments: [attachment],
              file_name: file.name,
              file_size: file.size,
              file_type: file.type
            }
          }
        };

        await sendMessage(messageData.content, 'file', {
          custom_data: messageData.metadata
        });
      }
      
      toast({
        title: "Success",
        description: "File(s) uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file(s)",
        variant: "destructive"
      });
    }
  };

  const handleVoiceRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordingRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        recordingRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        recordingRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioFile = new (File as any)([audioBlob], 'voice-message.wav');
          
          if (privateChannel) {
            try {
              const attachment = await uploadFile(audioFile, privateChannel.id);
              await sendMessage('🎤 Voice message', 'voice', {
                custom_data: {
                  attachments: [attachment],
                  file_name: 'voice-message.wav',
                  file_type: 'audio/wav'
                }
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to send voice message",
                variant: "destructive"
              });
            }
          }
        };

        recordingRef.current.start();
        setIsRecording(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to access microphone",
          variant: "destructive"
        });
      }
    } else {
      if (recordingRef.current) {
        recordingRef.current.stop();
        recordingRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchFilters.query.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchMessages(searchFilters.query, privateChannel?.id);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search messages",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleReaction = async (message: ChatMessage, emoji: string) => {
    try {
      const existingReaction = message.reactions?.find(r => r.user_id === currentUserId && r.emoji === emoji);
      
      if (existingReaction) {
        await removeReaction(message.id, emoji);
      } else {
        await reactToMessage(message.id, emoji);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      });
    }
  };

  const handleEditMessage = async (message: ChatMessage, newContent: string) => {
    try {
      await editMessage(message.id, newContent);
      setEditingMessage(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMessage = async (message: ChatMessage) => {
    try {
      await deleteMessage(message.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  // Utility functions
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    return Array.from(text.matchAll(mentionRegex)).map(match => match[1]);
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    return Array.from(text.matchAll(hashtagRegex)).map(match => match[1]);
  };

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const canEditMessage = (message: ChatMessage): boolean => {
    return message.sender_id === currentUserId || hasPermission('messages.edit_all');
  };

  const canDeleteMessage = (message: ChatMessage): boolean => {
    return message.sender_id === currentUserId || hasPermission('messages.delete_all');
  };

  const renderMessage = (message: ChatMessage) => {
    const isOwnMessage = message.sender_id === currentUserId;
    const isEdited = message.edited_at;
    const isPinned = message.is_pinned;

    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-3 p-3 hover:bg-white/5 transition-colors group",
          isOwnMessage && "flex-row-reverse"
        )}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {message.sender?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className={cn("flex-1 space-y-1", isOwnMessage && "text-right")}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {message.sender?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-400">
              {formatMessageTime(message.created_at)}
            </span>
            {isEdited && (
              <span className="text-xs text-gray-500">(edited)</span>
            )}
            {isPinned && (
              <Pin className="h-3 w-3 text-yellow-400" />
            )}
          </div>

          <div className={cn(
            "inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg",
            isOwnMessage 
              ? "bg-blue-600 text-white" 
              : "bg-gray-700 text-gray-100"
          )}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {/* File attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 bg-black/20 rounded">
                    <File className="h-4 w-4" />
                    <span className="text-xs truncate">{attachment.file_name}</span>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Message reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction) => (
                  <Button
                    key={`${reaction.emoji}-${reaction.user_id}`}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleReaction(message, reaction.emoji)}
                  >
                    {reaction.emoji} {reaction.user?.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Message actions */}
          <div className={cn(
            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isOwnMessage && "justify-end"
          )}>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setReplyToMessage(message)}
            >
              <Reply className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => handleReaction(message, '👍')}
            >
              <Smile className="h-3 w-3" />
            </Button>

            {canEditMessage(message) && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setEditingMessage(message)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}

            {canDeleteMessage(message) && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                onClick={() => handleDeleteMessage(message)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setReplyToMessage(message)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReaction(message, '❤️')}>
                  <Smile className="h-4 w-4 mr-2" />
                  Add Reaction
                </DropdownMenuItem>
                {isPinned ? (
                  <DropdownMenuItem onClick={() => {/* TODO: Unpin message */}}>
                    <PinOff className="h-4 w-4 mr-2" />
                    Unpin
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => {/* TODO: Pin message */}}>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };

  if (!privateChannel) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-white/10 h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="text-white">Creating private channel...</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-4" />
            <p>Setting up private chat with {member.name}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-black/40 backdrop-blur-sm border-white/10 h-[600px] flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-green-600 text-white">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${getStatusColor(member.status)}`}></div>
            </div>
            
            <div>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                {member.name}
                <Lock className="h-4 w-4 text-green-400" />
              </CardTitle>
              <p className="text-sm text-gray-400">
                {member.status === 'online' ? 'Online' : 
                 member.status === 'busy' ? 'Busy' : 'Offline'} • Private Chat
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="text-gray-400 hover:text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Phone className="h-4 w-4 mr-2" />
                  Voice Call
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Video className="h-4 w-4 mr-2" />
                  Video Call
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Hash className="h-4 w-4 mr-2" />
                  Channel Info
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <div className="flex gap-2">
              <Input
                placeholder="Search messages..."
                value={searchFilters.query}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                size="sm"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                {searchResults.map((message) => (
                  <div
                    key={message.id}
                    className="p-2 hover:bg-white/10 rounded cursor-pointer"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <p className="text-sm text-gray-300 truncate">{message.content}</p>
                    <p className="text-xs text-gray-500">
                      {message.sender?.name} • {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <Tabs defaultValue="notifications" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="notifications" className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationSettings.mentions}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, mentions: e.target.checked }))}
                    />
                    <span className="text-sm text-white">Mentions</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationSettings.allMessages}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, allMessages: e.target.checked }))}
                    />
                    <span className="text-sm text-white">All Messages</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushEnabled}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushEnabled: e.target.checked }))}
                    />
                    <span className="text-sm text-white">Push Notifications</span>
                  </label>
                </div>
              </TabsContent>
              
              <TabsContent value="permissions" className="space-y-4">
                <div className="text-sm text-gray-400">
                  <p>Channel permissions are managed by team administrators.</p>
                  <p>Current role: {isAdmin ? 'Admin' : 'Member'}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map(renderMessage)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply to Message */}
        {replyToMessage && (
          <div className="p-3 bg-blue-500/20 border-t border-blue-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-300">Replying to {replyToMessage.sender?.name}</span>
                <span className="text-xs text-blue-400 truncate max-w-xs">
                  {replyToMessage.content}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyToMessage(null)}
                className="text-blue-400 hover:text-blue-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="min-h-[40px] max-h-32 bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                rows={1}
              />
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="absolute -top-8 left-0 text-xs text-gray-400">
                  {member.name} is typing...
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-white"
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceRecording}
                className={cn(
                  "text-gray-400 hover:text-white",
                  isRecording && "text-red-400"
                )}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-white"
              >
                <Smile className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedIndividualChat;
