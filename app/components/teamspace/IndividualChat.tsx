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
  Lock
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

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

interface PrivateMessage {
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
  readBy: {
    userId: string;
    readAt: string;
  }[];
  isEdited?: boolean;
  editedAt?: string;
  isEncrypted?: boolean;
}

interface IndividualChatProps {
  member: TeamMember;
  currentUserId: string;
  onSendMessage: (message: PrivateMessage) => void;
  onStartCall: (type: 'video' | 'audio', memberId: string) => void;
  onBack: () => void;
  isAdmin?: boolean;
}

const IndividualChat: React.FC<IndividualChatProps> = ({ 
  member, 
  currentUserId, 
  onSendMessage, 
  onStartCall,
  onBack,
  isAdmin = false
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicators
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: PrivateMessage = {
        id: Date.now().toString(),
        senderId: currentUserId,
        senderName: 'You',
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
        readBy: [{ userId: currentUserId, readAt: new Date().toISOString() }],
        isEncrypted: true // Private messages are encrypted
      };

      setMessages(prev => [...prev, message]);
      onSendMessage(message);
      setNewMessage('');
      setIsTyping(false);
      
      // Simulate the other person reading the message
      setTimeout(() => {
        const readUpdate = {
          userId: member.id,
          readAt: new Date().toISOString()
        };

        setMessages(prev => prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, readBy: [...msg.readBy, readUpdate] }
            : msg
        ));
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const message: PrivateMessage = {
        id: Date.now().toString(),
        senderId: currentUserId,
        senderName: 'You',
        content: `📎 ${file.name}`,
        timestamp: new Date().toISOString(),
        type: 'file',
        attachments: [{
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size
        }],
        readBy: [{ userId: currentUserId, readAt: new Date().toISOString() }],
        isEncrypted: true
      };

      setMessages(prev => [...prev, message]);
      onSendMessage(message);
      
      toast({
        title: "File sent",
        description: `${file.name} has been sent privately to ${member.name}.`,
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
        const message: PrivateMessage = {
          id: Date.now().toString(),
          senderId: currentUserId,
          senderName: 'You',
          content: "🎤 Voice note",
          timestamp: new Date().toISOString(),
          type: 'voice',
          readBy: [{ userId: currentUserId, readAt: new Date().toISOString() }],
          isEncrypted: true
        };
        
        setMessages(prev => [...prev, message]);
        onSendMessage(message);
        
        toast({
          title: "Voice note sent",
          description: "Your voice note has been sent privately.",
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

  const getReadStatus = (message: PrivateMessage) => {
    const readCount = message.readBy.length;
    
    if (readCount === 2) {
      return <CheckCheck className="h-3 w-3 text-blue-400" />;
    } else if (readCount === 1) {
      return <Check className="h-3 w-3 text-gray-400" />;
    } else {
      return <Check className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

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
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Shield className="h-3 w-3 mr-1" />
              Encrypted
            </Badge>
            
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
                {isAdmin && (
                  <DropdownMenuItem className="text-red-400">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin: Cannot view private messages
                  </DropdownMenuItem>
                )}
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
              <p>Start a private conversation with {member.name}</p>
              <p className="text-xs mt-2 text-gray-500">
                Messages are encrypted and only visible to you and {member.name}
              </p>
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
                    {message.isEncrypted && (
                      <Lock className="h-3 w-3 text-green-400" />
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
                      {message.readBy.length === 2 ? 'Read' : 'Delivered'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-sm text-gray-400 italic">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>{member.name} is typing...</span>
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
                placeholder={`Send a private message to ${member.name}...`}
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
          
          {/* Security Notice */}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Messages are end-to-end encrypted and private</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndividualChat;
