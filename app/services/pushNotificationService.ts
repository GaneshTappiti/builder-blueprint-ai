// Push Notification Service
// This service handles browser push notifications for mobile and desktop

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class PushNotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission = 'default';

  constructor() {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
      this.permission = Notification.permission;
    } else {
      this.isSupported = false;
      this.permission = 'default';
    }
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return this.isSupported;
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    return this.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported in this browser');
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      throw error;
    }
  }

  // Show a push notification
  async showNotification(data: PushNotificationData): Promise<Notification | null> {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Push notifications not available or permission not granted');
      return null;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: data.badge || '/favicon.ico',
        tag: data.tag,
        data: data.data,
        actions: data.actions,
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!data.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Failed to show push notification:', error);
      return null;
    }
  }

  // Create notification data for different categories
  createNotificationData(
    category: 'meeting' | 'task' | 'idea' | 'chat' | 'system' | 'team',
    data: any
  ): PushNotificationData {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    switch (category) {
      case 'meeting':
        return {
          title: `🔔 ${data.userName} started a meeting`,
          body: `${data.userName} started a ${data.meetingType} meeting. Tap to join.`,
          icon: '/favicon.ico',
          tag: `meeting-${data.meetingId}`,
          data: {
            url: `${baseUrl}/workspace/teamspace?meeting=${data.meetingId}`,
            category: 'meeting',
            meetingId: data.meetingId
          },
          actions: [
            {
              action: 'join',
              title: 'Join Meeting',
              icon: '/favicon.ico'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/favicon.ico'
            }
          ],
          requireInteraction: true
        };

      case 'task':
        return {
          title: `📋 Task Update: ${data.taskTitle}`,
          body: `${data.userName} updated "${data.taskTitle}" to ${data.progress}% complete.`,
          icon: '/favicon.ico',
          tag: `task-${data.taskId}`,
          data: {
            url: `${baseUrl}/workspace/teamspace?tab=tasks&task=${data.taskId}`,
            category: 'task',
            taskId: data.taskId
          },
          actions: [
            {
              action: 'view',
              title: 'View Task',
              icon: '/favicon.ico'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/favicon.ico'
            }
          ]
        };

      case 'idea':
        return {
          title: `💡 New Idea: ${data.ideaTitle}`,
          body: `${data.userName} shared "${data.ideaTitle}" in the team idea vault.`,
          icon: '/favicon.ico',
          tag: `idea-${data.ideaId}`,
          data: {
            url: `${baseUrl}/workspace/idea-vault/${data.ideaId}`,
            category: 'idea',
            ideaId: data.ideaId
          },
          actions: [
            {
              action: 'view',
              title: 'View Idea',
              icon: '/favicon.ico'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/favicon.ico'
            }
          ]
        };

      case 'chat':
        return {
          title: `💬 ${data.userName} sent a message`,
          body: data.messagePreview.length > 50 
            ? `${data.messagePreview.substring(0, 50)}...` 
            : data.messagePreview,
          icon: '/favicon.ico',
          tag: `chat-${data.messageId}`,
          data: {
            url: `${baseUrl}/workspace/teamspace?tab=messages&message=${data.messageId}`,
            category: 'chat',
            messageId: data.messageId
          },
          actions: [
            {
              action: 'reply',
              title: 'Reply',
              icon: '/favicon.ico'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/favicon.ico'
            }
          ]
        };

      case 'team':
        return {
          title: `👥 Team Update`,
          body: data.message,
          icon: '/favicon.ico',
          tag: `team-${Date.now()}`,
          data: {
            url: data.actionUrl ? `${baseUrl}${data.actionUrl}` : `${baseUrl}/workspace/teamspace`,
            category: 'team'
          },
          actions: data.actionUrl ? [
            {
              action: 'view',
              title: data.actionText || 'View Details',
              icon: '/favicon.ico'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/favicon.ico'
            }
          ] : [
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/favicon.ico'
            }
          ]
        };

      case 'system':
      default:
        return {
          title: `🔔 ${data.title}`,
          body: data.message,
          icon: '/favicon.ico',
          tag: `system-${Date.now()}`,
          data: {
            url: data.actionUrl ? `${baseUrl}${data.actionUrl}` : `${baseUrl}/workspace`,
            category: 'system'
          },
          actions: data.actionUrl ? [
            {
              action: 'view',
              title: data.actionText || 'View Details',
              icon: '/favicon.ico'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/favicon.ico'
            }
          ] : [
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/favicon.ico'
            }
          ]
        };
    }
  }

  // Handle notification click
  handleNotificationClick(notification: Notification) {
    if (typeof window === 'undefined') return;
    
    const data = notification.data;
    if (data && data.url) {
      // Focus the window if it's already open
      if (window.focus) {
        window.focus();
      }
      // Navigate to the URL
      window.location.href = data.url;
    }
    notification.close();
  }

  // Handle notification action click
  handleNotificationAction(notification: Notification, action: string) {
    if (typeof window === 'undefined') return;
    
    const data = notification.data;
    
    switch (action) {
      case 'join':
      case 'view':
      case 'reply':
        if (data && data.url) {
          window.location.href = data.url;
        }
        break;
      case 'dismiss':
        // Just close the notification
        break;
    }
    
    notification.close();
  }

  // Setup notification event listeners
  setupEventListeners() {
    if (typeof window === 'undefined' || !this.isSupported) return;

    // Handle notification click
    window.addEventListener('notificationclick', (event) => {
      event.preventDefault();
      this.handleNotificationClick(event.notification);
    });

    // Handle notification action click
    window.addEventListener('notificationaction', (event) => {
      event.preventDefault();
      this.handleNotificationAction(event.notification, event.action);
    });
  }

  // Check if push notifications are enabled for a category
  isPushEnabledForCategory(category: string, preferences: any): boolean {
    if (!this.isSupported || this.permission !== 'granted' || !preferences.pushNotifications) {
      return false;
    }
    
    switch (category) {
      case 'meeting':
        return preferences.meetingNotifications;
      case 'task':
        return preferences.taskReminders;
      case 'idea':
        return preferences.ideaSharingNotifications;
      case 'chat':
        return preferences.chatNotifications;
      case 'team':
        return preferences.teamUpdates;
      case 'system':
        return preferences.systemUpdates;
      default:
        return true;
    }
  }

  // Show notification with fallback handling
  async showNotificationWithFallback(data: PushNotificationData): Promise<Notification | null> {
    try {
      return await this.showNotification(data);
    } catch (error) {
      console.error('Failed to show push notification:', error);
      
      // Fallback: try to show a simpler notification
      try {
        const fallbackData = {
          ...data,
          actions: undefined, // Remove actions for fallback
          requireInteraction: false
        };
        return await this.showNotification(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback notification also failed:', fallbackError);
        return null;
      }
    }
  }

  // Check if notifications are supported and permission is granted
  isReady(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  // Get permission status with detailed info
  getPermissionStatus(): { status: NotificationPermission; supported: boolean; ready: boolean } {
    return {
      status: this.permission,
      supported: this.isSupported,
      ready: this.isReady()
    };
  }
}

export const pushNotificationService = new PushNotificationService();
