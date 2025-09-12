"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Reply, 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  Smile, 
  Send,
  Clock,
  Check,
  CheckCheck
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChatMessage, MessageReaction } from "@/types/chat";
import { cn } from "@/lib/utils";

interface MessageThreadProps {
  rootMessage: ChatMessage;
  replies: ChatMessage[];
  onReply: (content: string, threadId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  currentUserId: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface ThreadReplyInputProps {
  threadId: string;
  onReply: (content: string, threadId: string) => void;
  placeholder?: string;
}

function ThreadReplyInput({ threadId, onReply, placeholder = "Reply in thread..." }: ThreadReplyInputProps) {
  const [replyContent, setReplyContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(replyContent.trim(), threadId);
      setReplyContent('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className={cn(
        "flex items-end space-x-2 p-2 rounded-lg border transition-colors",
        isFocused ? "border-blue-500 bg-blue-500/5" : "border-gray-600 bg-gray-800"
      )}>
        <Textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none text-sm resize-none"
          rows={1}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!replyContent.trim()}
          className="h-8 w-8 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function MessageBubble({ 
  message, 
  isReply = false, 
  currentUserId, 
  onReact, 
  onRemoveReaction 
}: {
  message: ChatMessage;
  isReply?: boolean;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const isOwnMessage = message.sender_id === currentUserId;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getReadStatus = () => {
    if (!isOwnMessage) return null;
    
    const readCount = message.read_receipts?.length || 0;
    if (readCount === 0) return <Clock className="h-3 w-3 text-gray-400" />;
    if (readCount === 1) return <Check className="h-3 w-3 text-gray-400" />;
    return <CheckCheck className="h-3 w-3 text-blue-400" />;
  };

  return (
    <div className={cn(
      "group flex space-x-2 py-2",
      isReply && "ml-4"
    )}>
      {!isReply && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs">
            {message.sender?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex-1 min-w-0">
        {!isReply && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-white">
              {message.sender?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-400">
              {formatTime(message.created_at)}
            </span>
            {getReadStatus()}
          </div>
        )}
        
        <div className="flex items-start space-x-2">
          {isReply && (
            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
              <Reply className="h-3 w-3 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1">
            <p className="text-gray-100 text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
            
            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-0.5 cursor-pointer hover:bg-gray-600"
                    onClick={() => onRemoveReaction(message.id, reaction.emoji)}
                  >
                    {reaction.emoji} {reaction.user?.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onReact(message.id, '👍')}>
              <Smile className="h-4 w-4 mr-2" />
              Add Reaction
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function MessageThread({ 
  rootMessage, 
  replies, 
  onReply, 
  onReact, 
  onRemoveReaction, 
  currentUserId,
  isCollapsed = false,
  onToggleCollapse
}: MessageThreadProps) {
  const [showReplies, setShowReplies] = useState(!isCollapsed);
  const repliesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showReplies && repliesEndRef.current) {
      repliesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [replies, showReplies]);

  const handleReply = (content: string, threadId: string) => {
    onReply(content, threadId);
  };

  const handleReact = (messageId: string, emoji: string) => {
    onReact(messageId, emoji);
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    onRemoveReaction(messageId, emoji);
  };

  return (
    <div className="border-l-2 border-gray-600 ml-4 pl-4 bg-gray-800/50 rounded-r-lg">
      {/* Root Message */}
      <div className="bg-gray-800 rounded-lg p-3 mb-3">
        <MessageBubble
          message={rootMessage}
          currentUserId={currentUserId}
          onReact={handleReact}
          onRemoveReaction={handleRemoveReaction}
        />
      </div>

      {/* Thread Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowReplies(!showReplies);
              onToggleCollapse?.();
            }}
            className="text-gray-400 hover:text-white p-1 h-6"
          >
            {showReplies ? 
              <ChevronDown className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </Button>
          <span className="text-sm text-gray-400">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReplies(!showReplies)}
          className="text-gray-400 hover:text-white text-xs"
        >
          {showReplies ? 'Hide' : 'Show'} replies
        </Button>
      </div>

      {/* Thread Replies */}
      {showReplies && (
        <div className="space-y-2">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-gray-700/50 rounded-lg p-2">
              <MessageBubble
                message={reply}
                isReply
                currentUserId={currentUserId}
                onReact={handleReact}
                onRemoveReaction={handleRemoveReaction}
              />
            </div>
          ))}
          
          {/* Reply Input */}
          <ThreadReplyInput
            threadId={rootMessage.id}
            onReply={handleReply}
          />
          
          <div ref={repliesEndRef} />
        </div>
      )}

      {/* Collapsed State Reply Input */}
      {!showReplies && (
        <div className="mt-2">
          <ThreadReplyInput
            threadId={rootMessage.id}
            onReply={handleReply}
            placeholder={`Reply to ${rootMessage.sender?.name || 'this message'}...`}
          />
        </div>
      )}
    </div>
  );
}

// Thread List Component for showing all threads in a channel
export function ThreadList({ 
  threads, 
  onThreadSelect, 
  currentUserId 
}: {
  threads: Array<{
    rootMessage: ChatMessage;
    replyCount: number;
    lastReplyAt: string;
  }>;
  onThreadSelect: (threadId: string) => void;
  currentUserId: string;
}) {
  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <div
          key={thread.rootMessage.id}
          className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={() => onThreadSelect(thread.rootMessage.id)}
        >
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs">
                {thread.rootMessage.sender?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-white">
                  {thread.rootMessage.sender?.name || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(thread.rootMessage.created_at).toLocaleTimeString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                {thread.rootMessage.content}
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span className="flex items-center space-x-1">
                  <Reply className="h-3 w-3" />
                  <span>{thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}</span>
                </span>
                <span>
                  Last reply {new Date(thread.lastReplyAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
