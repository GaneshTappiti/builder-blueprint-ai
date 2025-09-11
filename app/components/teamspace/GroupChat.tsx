"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Users,
  Bell,
  BellOff
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  joinedAt: string;
  skills: string[];
  currentTask?: string;
  tasksCompleted: number;
  totalTasks: number;
  lastActive: string;
}

interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'voice' | 'system';
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  mentions?: string[];
  readBy: {
    userId: string;
    readAt: string;
  }[];
  isEdited?: boolean;
  editedAt?: string;
}

interface GroupChatProps {
  teamMembers: TeamMember[];
  currentUserId: string;
  onSendMessage: (message: GroupMessage) => void;
  onStartCall: (type: 'video' | 'audio') => void;
}

const GroupChat: React.FC<GroupChatProps> = ({ 
  teamMembers, 
  currentUserId, 
  onSendMessage, 
  onStartCall 
}) => {
  const { toast } = useToast();
  const { triggerMessageSent } = useRealtimeNotifications();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = teamMembers.find(member => member.id === currentUserId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicators
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
        setTypingUsers(prev => prev.filter(id => id !== currentUserId));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping, currentUserId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const currentUser = teamMembers.find(member => member.id === currentUserId);
      const userName = currentUser?.name || 'You';
      
      const message: GroupMessage = {
        id: Date.now().toString(),
        senderId: currentUserId,
        senderName: userName,
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
        mentions: extractMentions(newMessage),
        readBy: [{ userId: currentUserId, readAt: new Date().toISOString() }]
      };

      setMessages(prev => [...prev, message]);
      onSendMessage(message);
      
      // Trigger notification for other team members
      triggerMessageSent(userName, newMessage, message.id, true);
      
      setNewMessage('');
      setIsTyping(false);
      
      // Simulate other users reading the message
      setTimeout(() => {
        const otherUsers = teamMembers
          .filter(member => member.id !== currentUserId && member.status === 'online')
          .slice(0, 2); // Simulate 2 users reading
        
        const readUpdates = otherUsers.map(user => ({
          userId: user.id,
          readAt: new Date().toISOString()
        }));

        setMessages(prev => prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, readBy: [...msg.readBy, ...readUpdates] }
            : msg
        ));
      }, 2000);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(match => match.substring(1)) : [];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Allow new line with Shift+Enter
      return;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (e.target.value && !isTyping) {
      setIsTyping(true);
      setTypingUsers(prev => [...prev.filter(id => id !== currentUserId), currentUserId]);
    } else if (!e.target.value) {
      setIsTyping(false);
      setTypingUsers(prev => prev.filter(id => id !== currentUserId));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const message: GroupMessage = {
        id: Date.now().toString(),
        senderId: currentUserId,
        senderName: currentUser?.name || 'You',
        content: `📎 ${file.name}`,
        timestamp: new Date().toISOString(),
        type: 'file',
        attachments: [{
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size
        }],
        readBy: [{ userId: currentUserId, readAt: new Date().toISOString() }]
      };

      setMessages(prev => [...prev, message]);
      onSendMessage(message);
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been shared in the group chat.`,
      });
    }
  };

  const handleVoiceNote = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Hold to record a voice note...",
      });
      
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false);
        const message: GroupMessage = {
          id: Date.now().toString(),
          senderId: currentUserId,
          senderName: currentUser?.name || 'You',
          content: "🎤 Voice note",
          timestamp: new Date().toISOString(),
          type: 'voice',
          readBy: [{ userId: currentUserId, readAt: new Date().toISOString() }]
        };
        
        setMessages(prev => [...prev, message]);
        onSendMessage(message);
        
        toast({
          title: "Voice note sent",
          description: "Your voice note has been shared.",
        });
      }, 3000);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getReadStatus = (message: GroupMessage) => {
    const readCount = message.readBy.length;
    const totalOnline = teamMembers.filter(m => m.status === 'online').length;
    
    if (readCount === totalOnline) {
      return <CheckCheck className="h-3 w-3 text-blue-400" />;
    } else if (readCount > 1) {
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    } else {
      return <Check className="h-3 w-3 text-gray-400" />;
    }
  };

  const onlineMembers = teamMembers.filter(member => member.status === 'online');

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/10 h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Users className="h-6 w-6 text-green-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
            </div>
            <div>
              <CardTitle className="text-white text-lg">Group Chat</CardTitle>
              <p className="text-sm text-gray-400">
                {onlineMembers.length} of {teamMembers.length} members online
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className="text-gray-400 hover:text-white"
            >
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/80 border-white/10">
                <DropdownMenuItem onClick={() => onStartCall('audio')}>
                  <Phone className="h-4 w-4 mr-2" />
                  Start Audio Call
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStartCall('video')}>
                  <Video className="h-4 w-4 mr-2" />
                  Start Video Call
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
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
            messages.map((message) => (
              <div key={message.id} className="flex items-start gap-3 group">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-green-600 text-white text-xs">
                    {message.senderName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {message.senderName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.isEdited && (
                      <span className="text-xs text-gray-500">(edited)</span>
                    )}
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3 max-w-md">
                    <p className="text-sm text-gray-100 whitespace-pre-wrap">
                      {message.content}
                    </p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-black/30 rounded">
                            <Paperclip className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-300">{attachment.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(attachment.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1">
                    {getReadStatus(message)}
                    <span className="text-xs text-gray-500">
                      {message.readBy.length} read
                    </span>
                  </div>
                </div>
              </div>
            ))
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
                {typingUsers.map(id => teamMembers.find(m => m.id === id)?.name).join(', ')} 
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
          
          {/* Online Members */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">Online:</span>
            <div className="flex -space-x-2">
              {onlineMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="relative">
                  <Avatar className="h-6 w-6 border-2 border-black">
                    <AvatarFallback className="bg-green-600 text-white text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black"></div>
                </div>
              ))}
              {onlineMembers.length > 5 && (
                <div className="h-6 w-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white">
                  +{onlineMembers.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupChat;
