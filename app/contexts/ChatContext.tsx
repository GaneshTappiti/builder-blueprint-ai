"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useTeamManagement } from './TeamManagementContext';
import { chatService } from '@/services/chatService';
import { 
  ChatChannel, 
  ChatMessage, 
  TypingIndicator, 
  FileAttachment, 
  ChatContextType,
  MessageMetadata,
  ChannelMember,
  ChatNotification
} from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { teamMembers } = useTeamManagement();
  const { toast } = useToast();

  // State
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for subscriptions
  const subscriptions = useRef<Map<string, () => void>>(new Map());
  const typingTimeout = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Initialize channels on mount
  useEffect(() => {
    if (user) {
      loadChannels();
    }
  }, [user]);

  // Load channels
  const loadChannels = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const channelsData = await chatService.getChannels();
      setChannels(channelsData);
      
      // Calculate unread counts
      const counts: Record<string, number> = {};
      for (const channel of channelsData) {
        // This would be calculated based on last_read_at vs message timestamps
        counts[channel.id] = 0; // Placeholder
      }
      setUnreadCounts(counts);
    } catch (err) {
      setError('Failed to load channels');
      console.error('Error loading channels:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Channel management
  const createChannel = useCallback(async (channelData: Omit<ChatChannel, 'id' | 'created_at' | 'updated_at'>): Promise<ChatChannel | undefined> => {
    if (!user) return;

    try {
      const newChannel = await chatService.createChannel({
        ...channelData,
        created_by: user.id
      });
      setChannels(prev => [newChannel, ...prev]);
      
      // Auto-join the channel
      await joinChannel(newChannel.id);
      
      toast({
        title: "Channel created",
        description: `${newChannel.name} has been created successfully.`,
      });
      
      return newChannel;
    } catch (err) {
      setError('Failed to create channel');
      console.error('Error creating channel:', err);
      return undefined;
    }
  }, [user, toast]);

  const updateChannel = useCallback(async (channelId: string, updates: Partial<ChatChannel>) => {
    try {
      const updatedChannel = await chatService.updateChannel(channelId, updates);
      setChannels(prev => prev.map(ch => ch.id === channelId ? updatedChannel : ch));
      
      if (currentChannel?.id === channelId) {
        setCurrentChannel(updatedChannel);
      }
    } catch (err) {
      setError('Failed to update channel');
      console.error('Error updating channel:', err);
    }
  }, [currentChannel]);

  const deleteChannel = useCallback(async (channelId: string) => {
    try {
      await chatService.deleteChannel(channelId);
      setChannels(prev => prev.filter(ch => ch.id !== channelId));
      
      if (currentChannel?.id === channelId) {
        setCurrentChannel(null);
        setMessages([]);
      }
    } catch (err) {
      setError('Failed to delete channel');
      console.error('Error deleting channel:', err);
    }
  }, [currentChannel]);

  const joinChannel = useCallback(async (channelId: string) => {
    if (!user) return;

    try {
      await chatService.joinChannel(channelId, user.id);
      toast({
        title: "Joined channel",
        description: "You have successfully joined the channel.",
      });
    } catch (err) {
      setError('Failed to join channel');
      console.error('Error joining channel:', err);
    }
  }, [user, toast]);

  const leaveChannel = useCallback(async (channelId: string) => {
    if (!user) return;

    try {
      await chatService.leaveChannel(channelId, user.id);
      setChannels(prev => prev.filter(ch => ch.id !== channelId));
      
      if (currentChannel?.id === channelId) {
        setCurrentChannel(null);
        setMessages([]);
      }
    } catch (err) {
      setError('Failed to leave channel');
      console.error('Error leaving channel:', err);
    }
  }, [user, currentChannel]);

  const setCurrentChannelHandler = useCallback((channel: ChatChannel | null) => {
    setCurrentChannel(channel);
    
    if (channel) {
      loadMessages(channel.id);
      subscribeToChannel(channel.id);
    } else {
      setMessages([]);
      setTypingUsers([]);
    }
  }, []);

  // Message management
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      const messagesData = await chatService.getMessages(channelId);
      setMessages(messagesData.reverse()); // Reverse to show oldest first
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, messageType: ChatMessage['message_type'] = 'text', metadata: MessageMetadata = {}) => {
    if (!user || !currentChannel) return;

    try {
      const messageData = {
        channel_id: currentChannel.id,
        sender_id: user.id,
        content,
        message_type: messageType,
        metadata,
        is_deleted: false
      };

      const newMessage = await chatService.sendMessage(messageData);
      setMessages(prev => [...prev, newMessage]);
      
      // Stop typing indicator
      stopTyping();
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  }, [user, currentChannel]);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const updatedMessage = await chatService.editMessage(messageId, content);
      setMessages(prev => prev.map(msg => msg.id === messageId ? updatedMessage : msg));
    } catch (err) {
      setError('Failed to edit message');
      console.error('Error editing message:', err);
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError('Failed to delete message');
      console.error('Error deleting message:', err);
    }
  }, []);

  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const reaction = await chatService.addReaction(messageId, user.id, emoji);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
          : msg
      ));
    } catch (err) {
      setError('Failed to add reaction');
      console.error('Error adding reaction:', err);
    }
  }, [user]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      await chatService.removeReaction(messageId, user.id, emoji);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              reactions: msg.reactions?.filter(r => !(r.user_id === user.id && r.emoji === emoji)) || []
            }
          : msg
      ));
    } catch (err) {
      setError('Failed to remove reaction');
      console.error('Error removing reaction:', err);
    }
  }, [user]);

  const replyToMessage = useCallback(async (messageId: string, content: string) => {
    if (!user || !currentChannel) return;

    try {
      const messageData = {
        channel_id: currentChannel.id,
        sender_id: user.id,
        content,
        message_type: 'text' as const,
        metadata: { custom_data: { reply_to: messageId } },
        is_deleted: false
      };

      const newMessage = await chatService.sendMessage(messageData);
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError('Failed to send reply');
      console.error('Error sending reply:', err);
    }
  }, [user, currentChannel]);

  // File management
  const uploadFile = useCallback(async (file: File, messageId?: string): Promise<FileAttachment> => {
    if (!currentChannel) throw new Error('No channel selected');

    try {
      const attachment = await chatService.uploadFile(file, currentChannel.id);
      
      // If messageId is provided, associate the file with the message
      if (messageId) {
        // This would require updating the message with the attachment
        // For now, we'll just return the attachment
      }
      
      return attachment;
    } catch (err) {
      setError('Failed to upload file');
      console.error('Error uploading file:', err);
      throw err;
    }
  }, [currentChannel]);

  const deleteFile = useCallback(async (attachmentId: string) => {
    try {
      await chatService.deleteFile(attachmentId);
    } catch (err) {
      setError('Failed to delete file');
      console.error('Error deleting file:', err);
    }
  }, []);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!user || !currentChannel) return;

    chatService.startTyping(currentChannel.id, user.id);
    
    // Set timeout to stop typing
    const timeout = setTimeout(() => {
      stopTyping();
    }, 3000);
    
    typingTimeout.current.set(user.id, timeout);
  }, [user, currentChannel]);

  const stopTyping = useCallback(() => {
    if (!user || !currentChannel) return;

    chatService.stopTyping(currentChannel.id, user.id);
    
    // Clear timeout
    const timeout = typingTimeout.current.get(user.id);
    if (timeout) {
      clearTimeout(timeout);
      typingTimeout.current.delete(user.id);
    }
  }, [user, currentChannel]);

  // Read receipts
  const markAsRead = useCallback(async (channelId: string) => {
    if (!user) return;

    try {
      await chatService.markAsRead(channelId, user.id);
      setUnreadCounts(prev => ({ ...prev, [channelId]: 0 }));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [user]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    if (!user) return;

    try {
      await chatService.markMessageAsRead(messageId, user.id);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, [user]);

  // Search and filtering
  const searchMessages = useCallback(async (query: string, channelId?: string) => {
    try {
      return await chatService.searchMessages(query, channelId);
    } catch (err) {
      setError('Failed to search messages');
      console.error('Error searching messages:', err);
      return [];
    }
  }, []);

  const getMessagesByDate = useCallback(async (channelId: string, date: string) => {
    try {
      const messages = await chatService.getMessages(channelId);
      return messages.filter(msg => msg.created_at.startsWith(date));
    } catch (err) {
      console.error('Error getting messages by date:', err);
      return [];
    }
  }, []);

  const getMessagesByUser = useCallback(async (channelId: string, userId: string) => {
    try {
      const messages = await chatService.getMessages(channelId);
      return messages.filter(msg => msg.sender_id === userId);
    } catch (err) {
      console.error('Error getting messages by user:', err);
      return [];
    }
  }, []);

  // Real-time subscriptions
  const subscribeToChannel = useCallback((channelId: string) => {
    // Unsubscribe from previous channel
    if (currentChannel) {
      unsubscribeFromChannel(currentChannel.id);
    }

    // Subscribe to messages
    const unsubscribeMessages = chatService.subscribeToMessages(channelId, (message) => {
      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(msg => msg.id === message.id);
        if (exists) {
          return prev.map(msg => msg.id === message.id ? message : msg);
        }
        return [...prev, message];
      });
    });

    // Subscribe to typing indicators
    const unsubscribeTyping = chatService.subscribeToTyping(channelId, (typing) => {
      setTypingUsers(prev => {
        const exists = prev.some(t => t.user_id === typing.user_id);
        if (exists) {
          return prev.map(t => t.user_id === typing.user_id ? typing : t);
        }
        return [...prev, typing];
      });
    });

    // Subscribe to reactions
    const unsubscribeReactions = chatService.subscribeToReactions(channelId, (reaction) => {
      setMessages(prev => prev.map(msg => 
        msg.id === reaction.message_id 
          ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
          : msg
      ));
    });

    // Store subscriptions
    subscriptions.current.set(channelId, () => {
      unsubscribeMessages();
      unsubscribeTyping();
      unsubscribeReactions();
    });
  }, [currentChannel]);

  const unsubscribeFromChannel = useCallback((channelId: string) => {
    const unsubscribe = subscriptions.current.get(channelId);
    if (unsubscribe) {
      unsubscribe();
      subscriptions.current.delete(channelId);
    }
  }, []);

  const subscribeToTyping = useCallback((channelId: string) => {
    // This is handled in subscribeToChannel
  }, []);

  const unsubscribeFromTyping = useCallback((channelId: string) => {
    // This is handled in unsubscribeFromChannel
  }, []);

  // Utility functions
  const getChannelById = useCallback((channelId: string) => {
    return channels.find(ch => ch.id === channelId);
  }, [channels]);

  const getChannelMembers = useCallback((channelId: string): ChannelMember[] => {
    // This would need to be implemented with actual data
    return [];
  }, []);

  const getUserPermissions = useCallback((channelId: string, userId: string): string[] => {
    // This would need to be implemented based on user roles
    return ['send_messages', 'read_messages'];
  }, []);

  const canUserPerformAction = useCallback((channelId: string, action: string): boolean => {
    if (!user) return false;
    const permissions = getUserPermissions(channelId, user.id);
    return permissions.includes(action);
  }, [user, getUserPermissions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup all subscriptions
      subscriptions.current.forEach(unsubscribe => unsubscribe());
      subscriptions.current.clear();
      
      // Cleanup typing timeouts
      typingTimeout.current.forEach(timeout => clearTimeout(timeout));
      typingTimeout.current.clear();
    };
  }, []);

  const value: ChatContextType = {
    // State
    channels,
    currentChannel,
    messages,
    typingUsers,
    unreadCounts,
    loading,
    error,

    // Channel management
    createChannel,
    updateChannel,
    deleteChannel,
    joinChannel,
    leaveChannel,
    setCurrentChannel: setCurrentChannelHandler,

    // Message management
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    removeReaction,
    replyToMessage,

    // File management
    uploadFile,
    deleteFile,

    // Typing indicators
    startTyping,
    stopTyping,

    // Read receipts
    markAsRead,
    markMessageAsRead,

    // Search and filtering
    searchMessages,
    getMessagesByDate,
    getMessagesByUser,

    // Real-time subscriptions
    subscribeToChannel,
    unsubscribeFromChannel,
    subscribeToTyping,
    unsubscribeFromTyping,

    // Utility functions
    getChannelById,
    getChannelMembers,
    getUserPermissions,
    canUserPerformAction
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
