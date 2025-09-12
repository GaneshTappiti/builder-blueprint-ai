import { supabase } from '@/lib/supabase';
import { ChatNotification, NotificationSettings } from '@/types/chat';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class NotificationService {
  protected permission: NotificationPermission = 'default';
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      this.permission = 'denied';
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  async sendPushNotification(payload: PushNotificationPayload): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if (this.serviceWorkerRegistration) {
      // Send to service worker for background handling
      this.serviceWorkerRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/favicon.ico',
        data: payload.data,
        // actions: payload.actions, // Not supported in all browsers
        tag: payload.data?.channel_id || 'chat-notification',
        requireInteraction: true,
        silent: false
      });
    } else {
      // Fallback to browser notification
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        data: payload.data
      });
    }
  }

  async createChatNotification(
    type: ChatNotification['type'],
    channelId: string,
    messageId: string,
    senderId: string,
    recipientId: string,
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<string> {
    try {
      const { data: notification, error } = await supabase
        .from('chat_notifications')
        .insert([{
          type,
          channel_id: channelId,
          message_id: messageId,
          sender_id: senderId,
          recipient_id: recipientId,
          title,
          body,
          data
        }])
        .select()
        .single();

      if (error) throw error;

      // Send push notification if user has it enabled
      await this.sendPushNotification({
        title,
        body,
        data: {
          ...data,
          notificationId: notification.id,
          channelId,
          messageId,
          type
        },
        actions: [
          {
            action: 'view',
            title: 'View Message',
            icon: '/icons/view.svg'
          },
          {
            action: 'mark_read',
            title: 'Mark as Read',
            icon: '/icons/check.svg'
          }
        ]
      });

      return notification.id;
    } catch (error) {
      console.error('Error creating chat notification:', error);
      throw error;
    }
  }

  async getNotifications(userId: string, limit = 50, offset = 0): Promise<ChatNotification[]> {
    try {
      const { data, error } = await supabase
        .from('chat_notifications')
        .select(`
          *,
          channel:chat_channels(id, name, type),
          sender:profiles!chat_notifications_sender_id_fkey(id, name, avatar_url)
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string, channelId?: string): Promise<void> {
    try {
      let query = supabase
        .from('chat_notifications')
        .update({ read: true })
        .eq('recipient_id', userId);

      if (channelId) {
        query = query.eq('channel_id', channelId);
      }

      const { error } = await query;
      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string, channelId?: string): Promise<number> {
    try {
      let query = supabase
        .from('chat_notifications')
        .select('id', { count: 'exact' })
        .eq('recipient_id', userId)
        .eq('read', false);

      if (channelId) {
        query = query.eq('channel_id', channelId);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  async updateNotificationSettings(
    userId: string,
    channelId: string,
    settings: Partial<NotificationSettings>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert([{
          user_id: userId,
          channel_id: channelId,
          ...settings
        }], {
          onConflict: 'user_id,channel_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  async getNotificationSettings(
    userId: string,
    channelId: string
  ): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('channel_id', channelId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }

  async subscribeToNotifications(
    userId: string,
    callback: (notification: ChatNotification) => void
  ): Promise<() => void> {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_notifications',
        filter: `recipient_id=eq.${userId}`
      }, async (payload) => {
        try {
          const notification = await this.getNotificationById(payload.new.id);
          if (notification) {
            callback(notification);
          }
        } catch (error) {
          console.error('Error fetching notification in subscription:', error);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  private async getNotificationById(notificationId: string): Promise<ChatNotification | null> {
    try {
      const { data, error } = await supabase
        .from('chat_notifications')
        .select(`
          *,
          channel:chat_channels(id, name, type),
          sender:profiles!chat_notifications_sender_id_fkey(id, name, avatar_url)
        `)
        .eq('id', notificationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification by ID:', error);
      return null;
    }
  }

  // Utility methods for different notification types
  async notifyMention(
    channelId: string,
    messageId: string,
    senderId: string,
    recipientId: string,
    channelName: string,
    senderName: string,
    messageContent: string
  ): Promise<string> {
    return this.createChatNotification(
      'mention',
      channelId,
      messageId,
      senderId,
      recipientId,
      `You were mentioned in #${channelName}`,
      `${senderName}: ${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}`,
      {
        channelName,
        senderName,
        messageContent
      }
    );
  }

  async notifyNewMessage(
    channelId: string,
    messageId: string,
    senderId: string,
    recipientId: string,
    channelName: string,
    senderName: string,
    messageContent: string
  ): Promise<string> {
    return this.createChatNotification(
      'message',
      channelId,
      messageId,
      senderId,
      recipientId,
      `New message in #${channelName}`,
      `${senderName}: ${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}`,
      {
        channelName,
        senderName,
        messageContent
      }
    );
  }

  async notifyReaction(
    channelId: string,
    messageId: string,
    senderId: string,
    recipientId: string,
    channelName: string,
    senderName: string,
    emoji: string
  ): Promise<string> {
    return this.createChatNotification(
      'reaction',
      channelId,
      messageId,
      senderId,
      recipientId,
      `Reaction in #${channelName}`,
      `${senderName} reacted with ${emoji}`,
      {
        channelName,
        senderName,
        emoji
      }
    );
  }

  async notifyFileUpload(
    channelId: string,
    messageId: string,
    senderId: string,
    recipientId: string,
    channelName: string,
    senderName: string,
    fileName: string
  ): Promise<string> {
    return this.createChatNotification(
      'file_upload',
      channelId,
      messageId,
      senderId,
      recipientId,
      `File shared in #${channelName}`,
      `${senderName} shared ${fileName}`,
      {
        channelName,
        senderName,
        fileName
      }
    );
  }

  async notifyChannelInvite(
    channelId: string,
    senderId: string,
    recipientId: string,
    channelName: string,
    senderName: string
  ): Promise<string> {
    return this.createChatNotification(
      'channel_invite',
      channelId,
      '',
      senderId,
      recipientId,
      `Invited to #${channelName}`,
      `${senderName} invited you to join #${channelName}`,
      {
        channelName,
        senderName
      }
    );
  }
}

// Additional interfaces for compatibility
export interface Notification {
  id: string;
  type: string;
  category: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  desktop: boolean;
  types: {
    mentions: boolean;
    tasks: boolean;
    meetings: boolean;
    ideas: boolean;
    projects: boolean;
    teamUpdates: boolean;
    achievements: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

// Extend NotificationService with missing methods
class ExtendedNotificationService extends NotificationService {
  private notifications: Notification[] = [];
  private subscribers: ((notifications: ChatNotification[]) => void)[] = [];

  // Missing methods that are being used in hooks
  async addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
      category: notification.category || 'general'
    };
    
    this.notifications.unshift(newNotification);
    this.notifySubscribers();
  }

  async getNotifications(userId: string, limit = 50, offset = 0): Promise<ChatNotification[]> {
    // For now, return local notifications converted to ChatNotification format
    return this.notifications.slice(offset, offset + limit).map(notification => ({
      id: notification.id,
      channel_id: 'local',
      sender_id: 'system',
      recipient_id: userId,
      type: notification.type as 'message' | 'mention' | 'reaction' | 'file_upload' | 'channel_invite',
      title: notification.title,
      body: notification.body,
      data: notification.data,
      read: notification.read,
      created_at: notification.createdAt,
      updated_at: notification.createdAt
    }));
  }

  async getUnreadCount(userId: string, channelId?: string): Promise<number> {
    return this.notifications.filter(n => !n.read).length;
  }

  subscribe(callback: (notifications: ChatNotification[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifySubscribers();
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(n => n.read = true);
    this.notifySubscribers();
  }

  async removeNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifySubscribers();
  }

  async clearAll(): Promise<void> {
    this.notifications = [];
    this.notifySubscribers();
  }

  shouldShowNotification(category: string): boolean {
    // Simple implementation - always show for now
    return true;
  }

  shouldSendPush(category: string): boolean {
    return this.permission === 'granted';
  }

  shouldSendEmail(category: string): boolean {
    return true;
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    return {
      email: true,
      push: true,
      sms: false,
      desktop: true,
      types: {
        mentions: true,
        tasks: true,
        meetings: true,
        ideas: true,
        projects: true,
        teamUpdates: true,
        achievements: true,
      },
      frequency: 'immediate',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    };
  }

  async saveNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    // Store preferences in localStorage for now
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }

  async getNotificationsByCategory(category: string): Promise<Notification[]> {
    return this.notifications.filter(n => n.type === category);
  }

  formatTimeAgo(date: string): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  // Notification methods for different types
  async notifyMeetingStarted(userName: string, meetingId: string, meetingType: string): Promise<void> {
    await this.addNotification({
      type: 'meeting',
      category: 'meeting',
      title: 'Meeting Started',
      body: `${userName} started a ${meetingType} meeting`,
      data: { meetingId, userName, meetingType }
    });
  }

  async notifyTaskUpdated(userName: string, taskTitle: string, progress: number, taskId: string): Promise<void> {
    await this.addNotification({
      type: 'task',
      category: 'task',
      title: 'Task Updated',
      body: `${userName} updated "${taskTitle}" to ${progress}% complete`,
      data: { taskId, userName, taskTitle, progress }
    });
  }

  async notifyIdeaShared(userName: string, ideaTitle: string, ideaId: string): Promise<void> {
    await this.addNotification({
      type: 'idea',
      category: 'idea',
      title: 'New Idea Shared',
      body: `${userName} shared "${ideaTitle}"`,
      data: { ideaId, userName, ideaTitle }
    });
  }

  async notifyMessageSent(userName: string, messagePreview: string, messageId: string, isGroup: boolean): Promise<void> {
    await this.addNotification({
      type: 'chat',
      category: 'chat',
      title: isGroup ? 'New Group Message' : 'New Message',
      body: `${userName}: ${messagePreview}`,
      data: { messageId, userName, messagePreview, isGroup }
    });
  }

  private notifySubscribers(): void {
    const chatNotifications = this.notifications.map(notification => ({
      id: notification.id,
      channel_id: 'local',
      sender_id: 'system',
      recipient_id: 'current-user', // TODO: Get actual user ID
      type: notification.type as 'message' | 'mention' | 'reaction' | 'file_upload' | 'channel_invite',
      title: notification.title,
      body: notification.body,
      data: notification.data,
      read: notification.read,
      created_at: notification.createdAt,
      updated_at: notification.createdAt
    }));
    this.subscribers.forEach(callback => callback(chatNotifications));
  }
}

export const notificationService = new ExtendedNotificationService();