"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  Filter, 
  Calendar, 
  User, 
  Hash, 
  Clock,
  ArrowUp,
  ArrowDown,
  MessageSquare
} from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";

interface MessageSearchProps {
  channelId?: string;
  onMessageSelect?: (message: ChatMessage) => void;
  className?: string;
}

interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  messageType?: string;
  hasAttachments?: boolean;
  hasMentions?: boolean;
}

const MessageSearch: React.FC<MessageSearchProps> = ({
  channelId,
  onMessageSelect,
  className
}) => {
  const { user } = useAuth();
  const { searchMessages, messages } = useChat();
  
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  const [filters, setFilters] = useState<SearchFilters>({});
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchMessages(query, channelId);
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching messages:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, channelId, searchMessages]);

  // Apply additional filters
  const filteredResults = searchResults.filter(message => {
    if (filters.dateFrom && new Date(message.created_at) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(message.created_at) > new Date(filters.dateTo)) {
      return false;
    }
    if (filters.userId && message.sender_id !== filters.userId) {
      return false;
    }
    if (filters.messageType && message.message_type !== filters.messageType) {
      return false;
    }
    if (filters.hasAttachments && (!message.attachments || message.attachments.length === 0)) {
      return false;
    }
    if (filters.hasMentions && (!message.metadata?.mentions || message.metadata.mentions.length === 0)) {
      return false;
    }
    return true;
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  const handleMessageClick = (message: ChatMessage) => {
    setSelectedMessage(message.id);
    onMessageSelect?.(message);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setSelectedMessage(null);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-black px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'file':
        return '📎';
      case 'voice':
        return '🎤';
      case 'image':
        return '🖼️';
      case 'system':
        return '⚙️';
      default:
        return '💬';
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Card className={`bg-black/40 backdrop-blur-sm border-white/10 ${className || ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Messages
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-400 hover:text-white"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 bg-black/20 border-white/10 text-white"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-black/20 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white mb-2 block">From Date</label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-white mb-2 block">Message Type</label>
              <select
                value={filters.messageType || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, messageType: e.target.value || undefined }))}
                className="w-full p-2 bg-black/20 border border-white/10 rounded text-white"
              >
                <option value="">All Types</option>
                <option value="text">Text</option>
                <option value="file">File</option>
                <option value="voice">Voice</option>
                <option value="image">Image</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={filters.hasAttachments || false}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasAttachments: e.target.checked || undefined }))}
                  className="rounded"
                />
                Has Attachments
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={filters.hasMentions || false}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasMentions: e.target.checked || undefined }))}
                  className="rounded"
                />
                Has Mentions
              </label>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Search Results */}
        {isSearching ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Searching...</p>
            </div>
          </div>
        ) : query && sortedResults.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages found</p>
            <p className="text-sm">Try adjusting your search terms or filters</p>
          </div>
        ) : sortedResults.length > 0 ? (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {/* Sort Controls */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="text-sm text-gray-400">
                {sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''} found
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                  className="text-gray-400 hover:text-white"
                >
                  {sortOrder === 'newest' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                  {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                </Button>
              </div>
            </div>
            
            {/* Results */}
            {sortedResults.map((message) => (
              <div
                key={message.id}
                className={`p-3 hover:bg-white/5 cursor-pointer border-l-2 transition-colors ${
                  selectedMessage === message.id 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-transparent'
                }`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-gray-400 mt-1">
                    {getMessageTypeIcon(message.message_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {message.sender?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatMessageTime(message.created_at)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {message.message_type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {highlightText(message.content, query)}
                    </p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs text-gray-500">
                          📎 {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    
                    {message.metadata?.mentions && message.metadata.mentions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.metadata.mentions.map((mention, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            @{mention}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Enter a search term to find messages</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageSearch;
