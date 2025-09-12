"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Calendar,
  User,
  Hash,
  FileText,
  Image,
  Mic,
  Search,
  Filter,
  X,
  Clock,
  CheckCircle2,
  Star,
  StarOff,
  Download,
  ExternalLink
} from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useTeamManagement } from "@/contexts/TeamManagementContext";
import { ChatMessage, ChatChannel } from "@/types/chat";
import { TeamMember } from "@/types/teamManagement";
import { cn } from "@/lib/utils";

interface SearchFilters {
  channel?: string;
  user?: string;
  dateFrom?: string;
  dateTo?: string;
  messageType?: 'text' | 'file' | 'voice' | 'image' | 'system';
  hasAttachments?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
}

interface SearchResult extends ChatMessage {
  channel?: ChatChannel;
  highlightedContent: string;
  relevanceScore: number;
}

interface AdvancedSearchProps {
  onResultSelect?: (message: ChatMessage) => void;
  onClose?: () => void;
  className?: string;
}

export function AdvancedSearch({ 
  onResultSelect, 
  onClose, 
  className 
}: AdvancedSearchProps) {
  const { channels, searchMessages } = useChat();
  const { teamMembers } = useTeamManagement();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<Array<{
    id: string;
    name: string;
    query: string;
    filters: SearchFilters;
  }>>([]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string, filters: SearchFilters) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (query.trim()) {
            await performSearch(query, filters);
          } else {
            setResults([]);
          }
        }, 300);
      };
    })(),
    []
  );

  const performSearch = async (query: string, searchFilters: SearchFilters) => {
    setIsSearching(true);
    try {
      const searchResults = await searchMessages(query, searchFilters.channel);
      
      // Process results with highlighting and relevance scoring
      const processedResults: SearchResult[] = searchResults.map((message, index) => ({
        ...message,
        highlightedContent: highlightSearchTerm(message.content, query),
        relevanceScore: calculateRelevanceScore(message, query, searchFilters),
        channel: channels.find(c => c.id === message.channel_id)
      }));

      // Sort by relevance score
      processedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      setResults(processedResults);
      
      // Add to search history
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const highlightSearchTerm = (content: string, query: string): string => {
    if (!query.trim()) return content;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return content.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
  };

  const calculateRelevanceScore = (message: ChatMessage, query: string, filters: SearchFilters): number => {
    let score = 0;
    const queryLower = query.toLowerCase();
    const contentLower = message.content.toLowerCase();
    
    // Exact match gets highest score
    if (contentLower.includes(queryLower)) {
      score += 100;
    }
    
    // Word boundary matches
    const wordRegex = new RegExp(`\\b${queryLower}\\b`, 'gi');
    const wordMatches = (message.content.match(wordRegex) || []).length;
    score += wordMatches * 50;
    
    // Recent messages get higher score
    const messageAge = Date.now() - new Date(message.created_at).getTime();
    const ageInDays = messageAge / (1000 * 60 * 60 * 24);
    score += Math.max(0, 30 - ageInDays);
    
    // Pinned messages get higher score
    if (message.is_pinned) score += 20;
    
    // Filter matches
    if (filters.channel && message.channel_id === filters.channel) score += 10;
    if (filters.user && message.sender_id === filters.user) score += 10;
    if (filters.messageType && message.message_type === filters.messageType) score += 10;
    
    return score;
  };

  const handleSearch = (query: string, searchFilters: SearchFilters) => {
    setSearchQuery(query);
    setFilters(searchFilters);
    debouncedSearch(query, searchFilters);
  };

  const clearFilters = () => {
    setFilters({});
    if (searchQuery) {
      performSearch(searchQuery, {});
    }
  };

  const saveSearch = () => {
    if (!searchQuery.trim()) return;
    
    const newSearch = {
      id: Date.now().toString(),
      name: searchQuery.slice(0, 30),
      query: searchQuery,
      filters
    };
    
    setSavedSearches(prev => [newSearch, ...prev.slice(0, 9)]);
  };

  const loadSavedSearch = (savedSearch: typeof savedSearches[0]) => {
    setSearchQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    performSearch(savedSearch.query, savedSearch.filters);
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'file': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'system': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={cn("bg-gray-900 rounded-lg border border-gray-700", className)}>
      {/* Search Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Search Messages</h3>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value, filters)}
            className="pl-10 pr-20 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-6 px-2 text-xs",
                showFilters ? "bg-blue-600 text-white" : "text-gray-400"
              )}
            >
              <Filter className="h-3 w-3 mr-1" />
              Filters
            </Button>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={saveSearch}
                className="h-6 px-2 text-xs text-gray-400"
              >
                <Star className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && !searchQuery && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-2">Recent searches</p>
            <div className="flex flex-wrap gap-1">
              {searchHistory.slice(0, 5).map((term, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearch(term, filters)}
                  className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && !searchQuery && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-2">Saved searches</p>
            <div className="space-y-1">
              {savedSearches.slice(0, 3).map((saved) => (
                <Button
                  key={saved.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => loadSavedSearch(saved)}
                  className="h-8 w-full justify-start text-sm text-gray-300 hover:text-white"
                >
                  <Star className="h-3 w-3 mr-2 text-yellow-400" />
                  {saved.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Channel Filter */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Channel</label>
              <Select
                value={filters.channel || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, channel: value || undefined }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="All channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All channels</SelectItem>
                  {channels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Filter */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">User</label>
              <Select
                value={filters.user || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, user: value || undefined }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All users</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message Type Filter */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Type</label>
              <Select
                value={filters.messageType || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, messageType: value as any || undefined }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date Range</label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value || undefined }))}
                  className="bg-gray-700 border-gray-600 text-xs"
                />
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value || undefined }))}
                  className="bg-gray-700 border-gray-600 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.hasAttachments || false}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasAttachments: e.target.checked || undefined }))}
                  className="rounded border-gray-600 bg-gray-700"
                />
                <span>Has attachments</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.isPinned || false}
                  onChange={(e) => setFilters(prev => ({ ...prev, isPinned: e.target.checked || undefined }))}
                  className="rounded border-gray-600 bg-gray-700"
                />
                <span>Pinned messages</span>
              </label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-400 hover:text-white"
            >
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="max-h-96 overflow-y-auto">
        {isSearching && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-400">Searching...</p>
          </div>
        )}

        {!isSearching && results.length === 0 && searchQuery && (
          <div className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No messages found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search terms or filters</p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="p-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">
                {results.length} {results.length === 1 ? 'result' : 'results'} found
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>

            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => onResultSelect?.(result)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {result.sender?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {result.sender?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-400">
                          in {result.channel?.name || 'Unknown Channel'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(result.created_at)}
                        </span>
                        {result.is_pinned && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        {getMessageTypeIcon(result.message_type)}
                        <div 
                          className="text-sm text-gray-300 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: result.highlightedContent }}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Relevance: {Math.round(result.relevanceScore)}%</span>
                        {result.attachments && result.attachments.length > 0 && (
                          <span>{result.attachments.length} attachment(s)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
