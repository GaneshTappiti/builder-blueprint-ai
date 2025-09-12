export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'group' | 'private' | 'public';
  team_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  settings: ChannelSettings;
}

export interface ChannelSettings {
  allowFileUploads: boolean;
  allowReactions: boolean;
  allowMentions: boolean;
  maxMessageLength: number;
  slowMode?: number; // seconds between messages
  autoDelete?: number; // hours before auto-delete
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'voice' | 'system' | 'image';
  metadata: MessageMetadata;
  reply_to?: string;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_pinned?: boolean;
  // Populated fields
  sender?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  attachments?: FileAttachment[];
  reactions?: MessageReaction[];
  mentions?: MessageMention[];
  read_receipts?: MessageReadReceipt[];
}

export interface MessageMetadata {
  mentions?: string[];
  hashtags?: string[];
  links?: Array<{
    url: string;
    title?: string;
    description?: string;
    image?: string;
  }>;
  code_blocks?: Array<{
    language: string;
    content: string;
  }>;
  custom_data?: Record<string, any>;
}

export interface FileAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  storage_path: string;
  created_at: string;
  // Populated fields
  thumbnail_url?: string;
  download_count?: number;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  // Populated fields
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface MessageMention {
  id: string;
  message_id: string;
  mentioned_user_id: string;
  created_at: string;
  // Populated fields
  mentioned_user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface MessageReadReceipt {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
  // Populated fields
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface TypingIndicator {
  id: string;
  channel_id: string;
  user_id: string;
  started_at: string;
  // Populated fields
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'moderator';
  joined_at: string;
  last_read_at: string;
  notification_settings: NotificationSettings;
  // Populated fields
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status: 'online' | 'offline' | 'busy';
  };
}

export interface NotificationSettings {
  mentions: boolean;
  all_messages: boolean;
  reactions: boolean;
  file_uploads: boolean;
  system_messages: boolean;
  quiet_hours?: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
}

export interface ChatContextType {
  // State
  channels: ChatChannel[];
  currentChannel: ChatChannel | null;
  messages: ChatMessage[];
  typingUsers: TypingIndicator[];
  unreadCounts: Record<string, number>;
  loading: boolean;
  error: string | null;

  // Channel management
  createChannel: (channelData: Omit<ChatChannel, 'id' | 'created_at' | 'updated_at'>) => Promise<ChatChannel | undefined>;
  updateChannel: (channelId: string, updates: Partial<ChatChannel>) => Promise<void>;
  deleteChannel: (channelId: string) => Promise<void>;
  joinChannel: (channelId: string) => Promise<void>;
  leaveChannel: (channelId: string) => Promise<void>;
  setCurrentChannel: (channel: ChatChannel | null) => void;

  // Message management
  sendMessage: (content: string, messageType?: ChatMessage['message_type'], metadata?: MessageMetadata) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  replyToMessage: (messageId: string, content: string) => Promise<void>;

  // File management
  uploadFile: (file: File, messageId?: string) => Promise<FileAttachment>;
  deleteFile: (attachmentId: string) => Promise<void>;

  // Typing indicators
  startTyping: () => void;
  stopTyping: () => void;

  // Read receipts
  markAsRead: (channelId: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;

  // Search and filtering
  searchMessages: (query: string, channelId?: string) => Promise<ChatMessage[]>;
  getMessagesByDate: (channelId: string, date: string) => Promise<ChatMessage[]>;
  getMessagesByUser: (channelId: string, userId: string) => Promise<ChatMessage[]>;

  // Real-time subscriptions
  subscribeToChannel: (channelId: string) => void;
  unsubscribeFromChannel: (channelId: string) => void;
  subscribeToTyping: (channelId: string) => void;
  unsubscribeFromTyping: (channelId: string) => void;

  // Utility functions
  getChannelById: (channelId: string) => ChatChannel | undefined;
  getChannelMembers: (channelId: string) => ChannelMember[];
  getUserPermissions: (channelId: string, userId: string) => string[];
  canUserPerformAction: (channelId: string, action: string) => boolean;
}

export interface ChatService {
  // Channel operations
  getChannels: (teamId?: string) => Promise<ChatChannel[]>;
  createChannel: (channelData: Omit<ChatChannel, 'id' | 'created_at' | 'updated_at'>) => Promise<ChatChannel>;
  updateChannel: (channelId: string, updates: Partial<ChatChannel>) => Promise<ChatChannel>;
  deleteChannel: (channelId: string) => Promise<void>;
  joinChannel: (channelId: string, userId: string) => Promise<void>;
  leaveChannel: (channelId: string, userId: string) => Promise<void>;

  // Message operations
  getMessages: (channelId: string, limit?: number, offset?: number) => Promise<ChatMessage[]>;
  sendMessage: (messageData: Omit<ChatMessage, 'id' | 'created_at' | 'updated_at'>) => Promise<ChatMessage>;
  editMessage: (messageId: string, content: string) => Promise<ChatMessage>;
  deleteMessage: (messageId: string) => Promise<void>;
  getMessage: (messageId: string) => Promise<ChatMessage>;

  // Reactions
  addReaction: (messageId: string, userId: string, emoji: string) => Promise<MessageReaction>;
  removeReaction: (messageId: string, userId: string, emoji: string) => Promise<void>;
  getReactions: (messageId: string) => Promise<MessageReaction[]>;

  // Read receipts
  markAsRead: (channelId: string, userId: string) => Promise<void>;
  markMessageAsRead: (messageId: string, userId: string) => Promise<void>;
  getReadReceipts: (messageId: string) => Promise<MessageReadReceipt[]>;

  // Typing indicators
  startTyping: (channelId: string, userId: string) => Promise<void>;
  stopTyping: (channelId: string, userId: string) => Promise<void>;
  getTypingUsers: (channelId: string) => Promise<TypingIndicator[]>;

  // File operations
  uploadFile: (file: File, channelId: string) => Promise<FileAttachment>;
  deleteFile: (attachmentId: string) => Promise<void>;
  getFile: (attachmentId: string) => Promise<FileAttachment>;

  // Search
  searchMessages: (query: string, channelId?: string, limit?: number) => Promise<ChatMessage[]>;

  // Real-time subscriptions
  subscribeToMessages: (channelId: string, callback: (message: ChatMessage) => void) => () => void;
  subscribeToTyping: (channelId: string, callback: (typing: TypingIndicator) => void) => () => void;
  subscribeToReactions: (channelId: string, callback: (reaction: MessageReaction) => void) => () => void;
  subscribeToReadReceipts: (channelId: string, callback: (receipt: MessageReadReceipt) => void) => () => void;
}

export interface ChatPermissions {
  canSendMessages: boolean;
  canEditMessages: boolean;
  canDeleteMessages: boolean;
  canAddReactions: boolean;
  canUploadFiles: boolean;
  canCreateChannels: boolean;
  canManageChannels: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canManageRoles: boolean;
  canViewHistory: boolean;
  canMentionEveryone: boolean;
  canPinMessages: boolean;
  canDeleteChannel: boolean;
}

export interface ChatNotification {
  id: string;
  type: 'message' | 'mention' | 'reaction' | 'file_upload' | 'channel_invite';
  channel_id: string;
  message_id?: string;
  sender_id: string;
  recipient_id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  // Populated fields
  channel?: ChatChannel;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ChatStats {
  totalMessages: number;
  totalChannels: number;
  activeUsers: number;
  messagesToday: number;
  filesShared: number;
  mostActiveChannel: string;
  averageResponseTime: number; // in minutes
}

// Utility types
export type MessageType = ChatMessage['message_type'];
export type ChannelType = ChatChannel['type'];
export type MemberRole = ChannelMember['role'];
export type UserStatus = 'online' | 'offline' | 'busy' | 'away';

// Event types for real-time updates
export interface ChatEvent {
  type: 'message_created' | 'message_updated' | 'message_deleted' | 'reaction_added' | 'reaction_removed' | 'typing_started' | 'typing_stopped' | 'user_joined' | 'user_left' | 'channel_updated';
  channel_id: string;
  data: any;
  timestamp: string;
}
