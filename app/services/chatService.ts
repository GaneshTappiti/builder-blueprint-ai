import { supabase } from '@/lib/supabase';
import { 
  ChatChannel, 
  ChatMessage, 
  MessageReaction, 
  MessageReadReceipt, 
  TypingIndicator, 
  FileAttachment, 
  ChatService as IChatService,
  MessageMetadata 
} from '@/types/chat';
import { withRetry, chatCircuitBreaker } from '@/lib/retryLogic';
import { handleChatError, ErrorCodes } from '@/lib/errorHandling';
import { monitoring } from '@/lib/monitoring';

class ChatService implements IChatService {
  // Channel operations
  async getChannels(teamId?: string): Promise<ChatChannel[]> {
    return withRetry(async () => {
      return chatCircuitBreaker.execute(async () => {
        monitoring.track('chat_get_channels', { teamId });
        
        let query = supabase
          .from('chat_channels')
          .select('*')
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        if (teamId) {
          query = query.eq('team_id', teamId);
        }

        const { data, error } = await query;
        if (error) {
          const appError = handleChatError(error, 'getChannels');
          monitoring.trackError(error, 'getChannels', { teamId });
          throw appError;
        }
        
        monitoring.track('chat_get_channels_success', { 
          teamId, 
          channelCount: data?.length || 0 
        });
        
        return data || [];
      });
    });
  }

  async createChannel(channelData: Omit<ChatChannel, 'id' | 'created_at' | 'updated_at'>): Promise<ChatChannel> {
    try {
      const { data, error } = await supabase
        .from('chat_channels')
        .insert([channelData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  }

  async updateChannel(channelId: string, updates: Partial<ChatChannel>): Promise<ChatChannel> {
    try {
      const { data, error } = await supabase
        .from('chat_channels')
        .update(updates)
        .eq('id', channelId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating channel:', error);
      throw error;
    }
  }

  async deleteChannel(channelId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting channel:', error);
      throw error;
    }
  }

  async joinChannel(channelId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('channel_members')
        .insert([{
          channel_id: channelId,
          user_id: userId,
          role: 'member',
          notification_settings: {
            mentions: true,
            all_messages: true,
            reactions: true,
            file_uploads: true,
            system_messages: true
          }
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error joining channel:', error);
      throw error;
    }
  }

  async leaveChannel(channelId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving channel:', error);
      throw error;
    }
  }

  // Message operations
  async getMessages(channelId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(id, name, email, avatar_url),
          attachments:file_attachments(*),
          reactions:message_reactions(*, user:profiles!message_reactions_user_id_fkey(id, name, avatar_url)),
          mentions:message_mentions(*, mentioned_user:profiles!message_mentions_mentioned_user_id_fkey(id, name, email, avatar_url)),
          read_receipts:message_read_receipts(*, user:profiles!message_read_receipts_user_id_fkey(id, name, avatar_url))
        `)
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      // Convert JSONB metadata back to MessageMetadata type for each message
      const messages: ChatMessage[] = (data || []).map(msg => ({
        ...msg,
        metadata: typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata || {}
      }));
      
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(messageData: Omit<ChatMessage, 'id' | 'created_at' | 'updated_at'>): Promise<ChatMessage> {
    try {
      // Convert metadata to JSONB format for database storage
      const dbMessageData = {
        ...messageData,
        metadata: messageData.metadata ? JSON.stringify(messageData.metadata) : '{}'
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([dbMessageData])
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(id, name, email, avatar_url),
          attachments:file_attachments(*),
          reactions:message_reactions(*, user:profiles!message_reactions_user_id_fkey(id, name, avatar_url)),
          mentions:message_mentions(*, mentioned_user:profiles!message_mentions_mentioned_user_id_fkey(id, name, email, avatar_url)),
          read_receipts:message_read_receipts(*, user:profiles!message_read_receipts_user_id_fkey(id, name, avatar_url))
        `)
        .single();

      if (error) throw error;
      
      // Convert JSONB metadata back to MessageMetadata type
      const message: ChatMessage = {
        ...data,
        metadata: typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata || {}
      };
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async editMessage(messageId: string, content: string): Promise<ChatMessage> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .update({ 
          content,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(id, name, email, avatar_url),
          attachments:file_attachments(*),
          reactions:message_reactions(*, user:profiles!message_reactions_user_id_fkey(id, name, avatar_url)),
          mentions:message_mentions(*, mentioned_user:profiles!message_mentions_mentioned_user_id_fkey(id, name, email, avatar_url)),
          read_receipts:message_read_receipts(*, user:profiles!message_read_receipts_user_id_fkey(id, name, avatar_url))
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  async getMessage(messageId: string): Promise<ChatMessage> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(id, name, email, avatar_url),
          attachments:file_attachments(*),
          reactions:message_reactions(*, user:profiles!message_reactions_user_id_fkey(id, name, avatar_url)),
          mentions:message_mentions(*, mentioned_user:profiles!message_mentions_mentioned_user_id_fkey(id, name, email, avatar_url)),
          read_receipts:message_read_receipts(*, user:profiles!message_read_receipts_user_id_fkey(id, name, avatar_url))
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  }

  // Reactions
  async addReaction(messageId: string, userId: string, emoji: string): Promise<MessageReaction> {
    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .insert([{
          message_id: messageId,
          user_id: userId,
          emoji
        }])
        .select(`
          *,
          user:profiles!message_reactions_user_id_fkey(id, name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  async getReactions(messageId: string): Promise<MessageReaction[]> {
    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select(`
          *,
          user:profiles!message_reactions_user_id_fkey(id, name, avatar_url)
        `)
        .eq('message_id', messageId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reactions:', error);
      throw error;
    }
  }

  // Read receipts
  async markAsRead(channelId: string, userId: string): Promise<void> {
    try {
      // Update last_read_at for the channel member
      await supabase
        .from('channel_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      // Insert read receipts for unread messages
      await supabase.rpc('mark_messages_as_read', {
        channel_uuid: channelId,
        user_uuid: userId
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('message_read_receipts')
        .upsert([{
          message_id: messageId,
          user_id: userId,
          read_at: new Date().toISOString()
        }], {
          onConflict: 'message_id,user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async getReadReceipts(messageId: string): Promise<MessageReadReceipt[]> {
    try {
      const { data, error } = await supabase
        .from('message_read_receipts')
        .select(`
          *,
          user:profiles!message_read_receipts_user_id_fkey(id, name, avatar_url)
        `)
        .eq('message_id', messageId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching read receipts:', error);
      throw error;
    }
  }

  // Typing indicators
  async startTyping(channelId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('typing_indicators')
        .upsert([{
          channel_id: channelId,
          user_id: userId,
          started_at: new Date().toISOString()
        }], {
          onConflict: 'channel_id,user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error starting typing:', error);
      throw error;
    }
  }

  async stopTyping(channelId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('typing_indicators')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error stopping typing:', error);
      throw error;
    }
  }

  async getTypingUsers(channelId: string): Promise<TypingIndicator[]> {
    try {
      const { data, error } = await supabase
        .from('typing_indicators')
        .select(`
          *,
          user:profiles!typing_indicators_user_id_fkey(id, name, avatar_url)
        `)
        .eq('channel_id', channelId)
        .gte('started_at', new Date(Date.now() - 30000).toISOString()); // Last 30 seconds

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching typing users:', error);
      throw error;
    }
  }

  // File operations
  async uploadFile(file: File, channelId: string): Promise<FileAttachment> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `chat-files/${channelId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // Create file attachment record
      const { data, error } = await supabase
        .from('file_attachments')
        .insert([{
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_url: urlData.publicUrl,
          storage_path: filePath
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(attachmentId: string): Promise<void> {
    try {
      // Get file info first
      const { data: attachment, error: fetchError } = await supabase
        .from('file_attachments')
        .select('storage_path')
        .eq('id', attachmentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('chat-files')
        .remove([attachment.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getFile(attachmentId: string): Promise<FileAttachment> {
    try {
      const { data, error } = await supabase
        .from('file_attachments')
        .select('*')
        .eq('id', attachmentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }

  // Search
  async searchMessages(query: string, channelId?: string, limit = 20): Promise<ChatMessage[]> {
    try {
      let searchQuery = supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(id, name, email, avatar_url),
          attachments:file_attachments(*),
          reactions:message_reactions(*, user:profiles!message_reactions_user_id_fkey(id, name, avatar_url)),
          mentions:message_mentions(*, mentioned_user:profiles!message_mentions_mentioned_user_id_fkey(id, name, email, avatar_url)),
          read_receipts:message_read_receipts(*, user:profiles!message_read_receipts_user_id_fkey(id, name, avatar_url))
        `)
        .textSearch('content', query)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (channelId) {
        searchQuery = searchQuery.eq('channel_id', channelId);
      }

      const { data, error } = await searchQuery;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToMessages(channelId: string, callback: (message: ChatMessage) => void): () => void {
    const subscription = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          try {
            const message = await this.getMessage(payload.new.id);
            callback(message);
          } catch (error) {
            console.error('Error fetching message in subscription:', error);
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  subscribeToTyping(channelId: string, callback: (typing: TypingIndicator) => void): () => void {
    const subscription = supabase
      .channel(`typing:${channelId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          try {
            const typing = await this.getTypingUsers(channelId);
            typing.forEach(t => callback(t));
          } catch (error) {
            console.error('Error fetching typing in subscription:', error);
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  subscribeToReactions(channelId: string, callback: (reaction: MessageReaction) => void): () => void {
    const subscription = supabase
      .channel(`reactions:${channelId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
        filter: `message_id=in.(${channelId})`
      }, async (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
          try {
            const messageId = (payload.new as any)?.message_id || (payload.old as any)?.message_id;
            if (messageId) {
              const reaction = await this.getReactions(messageId);
              reaction.forEach(r => callback(r));
            }
          } catch (error) {
            console.error('Error fetching reactions in subscription:', error);
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  subscribeToReadReceipts(channelId: string, callback: (receipt: MessageReadReceipt) => void): () => void {
    const subscription = supabase
      .channel(`read_receipts:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'message_read_receipts',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        try {
          const receipt = await this.getReadReceipts(payload.new.message_id);
          receipt.forEach(r => callback(r));
        } catch (error) {
          console.error('Error fetching read receipts in subscription:', error);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

export const chatService = new ChatService();
