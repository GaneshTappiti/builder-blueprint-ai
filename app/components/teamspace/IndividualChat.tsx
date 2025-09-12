"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Settings,
  User
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { TeamMember } from "@/types/teamManagement";
import { ChatMessage, ChatChannel } from "@/types/chat";

interface IndividualChatProps {
  member: TeamMember;
  onStartCall: (type: 'video' | 'audio', memberId: string) => void;
  onBack: () => void;
  isAdmin?: boolean;
  className?: string;
}

const IndividualChat: React.FC<IndividualChatProps> = ({ 
  member, 
  onStartCall,
  onBack,
  isAdmin = false,
  className
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    currentChannel,
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    uploadFile,
    reactToMessage,
    removeReaction,
    markAsRead,
    createChannel,
    loading,
    error
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create or find private channel for this member
  const [privateChannel, setPrivateChannel] = useState<ChatChannel | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create private channel if it doesn't exist
  useEffect(() => {
    const createPrivateChannel = async () => {
      if (!user || !member) return;

      try {
        // Check if private channel already exists
        const existingChannel = currentChannel;
        if (existingChannel && existingChannel.type === 'private') {
          setPrivateChannel(existingChannel);
          return;
        }

        // Create new private channel
        const channelName = `Private chat with ${member.name}`;
        const newChannel = await createChannel({
          name: channelName,
          description: `Private conversation with ${member.name}`,
          type: 'private',
          team_id: undefined,
          created_by: user.id,
          is_archived: false,
          settings: {
            allowFileUploads: true,
            allowReactions: true,
            allowMentions: true,
            maxMessageLength: 2000,
            slowMode: 0,
            autoDelete: 0
          }
        });

        if (newChannel) {
          setPrivateChannel(newChannel);
        }
      } catch (error) {
        console.error('Error creating private channel:', error);
        toast({
          title: "Error",
          description: "Failed to create private chat. Please try again.",
          variant: "destructive"
        });
      }
    };

    createPrivateChannel();
  }, [user, member, createChannel, toast]);

  // Mark messages as read when channel changes
  useEffect(() => {
    if (privateChannel?.id) {
      markAsRead(privateChannel.id);
    }
  }, [privateChannel?.id, markAsRead]);

  // Handle typing indicators
  useEffect(() => {
    if (isTyping) {
      startTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        stopTyping();
      }, 3000);
    } else {
      stopTyping();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, startTyping, stopTyping]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !privateChannel) return;

    try {
      const mentions = extractMentions(newMessage);
      const metadata = {
        mentions,
        hashtags: extractHashtags(newMessage),
        links: extractLinks(newMessage)
      };

      await sendMessage(newMessage, 'text', metadata);
      
      setNewMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(match => match.substring(1)) : [];
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(match => match.substring(1)) : [];
  };

  const extractLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches.map(url => ({ url })) : [];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      return;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (e.target.value && !isTyping) {
      setIsTyping(true);
    } else if (!e.target.value) {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !privateChannel) return;

    try {
      const attachment = await uploadFile(file);
      
      const metadata = {
        custom_data: {
          attachments: [attachment.id],
          file_name: file.name,
          file_size: file.size,
          file_type: file.type
        }
      };

      await sendMessage(`📎 ${file.name}`, 'file', metadata);
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been shared.`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVoiceNote = async () => {
    if (!isRecording && privateChannel) {
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Hold to record a voice note...",
      });
      
      // Simulate recording
      setTimeout(async () => {
        setIsRecording(false);
        
        try {
          await sendMessage("🎤 Voice note", 'voice');
          
          toast({
            title: "Voice note sent",
            description: "Your voice note has been shared.",
          });
        } catch (error) {
          console.error('Error sending voice note:', error);
          toast({
            title: "Error",
            description: "Failed to send voice note.",
            variant: "destructive"
          });
        }
      }, 3000);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getReadStatus = (message: ChatMessage) => {
    const readCount = message.read_receipts?.length || 0;
    
    if (readCount > 0) {
      return <CheckCheck className="h-3 w-3 text-blue-400" />;
    } else {
      return <Check className="h-3 w-3 text-gray-400" />;
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      const existingReaction = message?.reactions?.find(r => r.user_id === user?.id && r.emoji === emoji);
      
      if (existingReaction) {
        await removeReaction(messageId, emoji);
      } else {
        await reactToMessage(messageId, emoji);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  if (loading) {
    return (
      <Card className={`bg-black/40 backdrop-blur-sm border-white/10 h-[600px] flex flex-col ${className || ''}`}>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-black/40 backdrop-blur-sm border-white/10 h-[600px] flex flex-col ${className || ''}`}>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">Error loading chat: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-black/40 backdrop-blur-sm border-white/10 h-[600px] flex flex-col ${className || ''}`}>
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
            
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-green-500 text-white">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                {member.name}
                {member.status === 'online' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </CardTitle>
              <p className="text-sm text-gray-400">
                {member.status === 'online' ? 'Online' : 'Offline'}
                {member.role && ` • ${member.role}`}
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/80 border-white/10">
                <DropdownMenuItem onClick={() => onStartCall('audio', member.id)}>
                  <Phone className="h-4 w-4 mr-2" />
                  Start Audio Call
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStartCall('video', member.id)}>
                  <Video className="h-4 w-4 mr-2" />
                  Start Video Call
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Chat Settings
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem>
                      <Shield className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Lock className="h-4 w-4 mr-2" />
                      Block User
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 bg-black/20 border border-white/10 rounded text-white placeholder-gray-400"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.sender_id === user?.id;
              
              return (
                <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                    {!isCurrentUser && (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-green-500 text-white text-xs">
                            {message.sender?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-white">{message.sender?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">{formatTime(message.created_at)}</span>
                      </div>
                    )}
                    
                    <div className={`rounded-lg p-3 ${
                      isCurrentUser 
                        ? 'bg-green-500/20 text-white' 
                        : 'bg-white/10 text-white'
                    }`}>
                      {message.message_type === 'file' && message.attachments && message.attachments.length > 0 && (
                        <div className="mb-2">
                          <a 
                            href={message.attachments[0].file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 underline"
                          >
                            {message.attachments[0].file_name}
                          </a>
                          <p className="text-xs text-gray-400 mt-1">
                            {(message.attachments[0].file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      )}
                      
                      {message.message_type === 'voice' && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                          <span>Voice note</span>
                        </div>
                      )}
                      
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {message.metadata?.mentions && message.metadata.mentions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.metadata.mentions.map((mention, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              @{mention}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {message.edited_at && (
                        <p className="text-xs text-gray-400 mt-1 italic">(edited)</p>
                      )}
                      
                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(
                            message.reactions.reduce((acc, reaction) => {
                              acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([emoji, count]) => (
                            <Button
                              key={emoji}
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs hover:bg-white/10"
                              onClick={() => handleReaction(message.id, emoji)}
                            >
                              {emoji} {count}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {isCurrentUser && (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs text-gray-400">{formatTime(message.created_at)}</span>
                        {getReadStatus(message)}
                      </div>
                    )}
                  </div>
                  
                  {!isCurrentUser && (
                    <div className="order-2 ml-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-green-500 text-white">
                          {message.sender?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400 italic">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>
                {typingUsers.map(typing => typing.user?.name || 'Someone').join(', ')} 
                {typingUsers.length === 1 ? ' is' : ' are'} typing...
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message... (Use @username to mention someone)"
                className="bg-black/20 border-white/10 text-white resize-none min-h-[40px] max-h-[120px]"
                rows={1}
              />
            </div>
            
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.txt"
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
                onClick={handleVoiceNote}
                disabled={isRecording}
                className={`text-gray-400 hover:text-white ${isRecording ? 'text-red-400' : ''}`}
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
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mt-2 p-2 bg-black/20 rounded-lg">
              <div className="grid grid-cols-8 gap-1">
                {['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '👏', '🙌'].map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNewMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-lg hover:bg-white/10"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IndividualChat;