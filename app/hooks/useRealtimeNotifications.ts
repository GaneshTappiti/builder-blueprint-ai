import { useState, useEffect, useCallback } from 'react';
import { notificationService, type Notification, NotificationPreferences } from '@/services/notificationService';
import { emailNotificationService } from '@/services/emailNotificationService';
import { pushNotificationService } from '@/services/pushNotificationService';

export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => 
    notificationService.getNotificationPreferences()
  );

  useEffect(() => {
    // Initial load
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());

    // Subscribe to changes
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    });

    // Setup push notification event listeners
    pushNotificationService.setupEventListeners();

    return unsubscribe;
  }, []);

  // Real-time notification triggers
  const triggerMeetingStarted = useCallback(async (userName: string, meetingId: string, meetingType: 'video' | 'audio' = 'video') => {
    // Always check current preferences
    const currentPreferences = notificationService.getNotificationPreferences();
    
    if (notificationService.shouldShowNotification('meeting')) {
      notificationService.notifyMeetingStarted(userName, meetingId, meetingType);
      
      // Send push notification
      if (pushNotificationService.isPushEnabledForCategory('meeting', currentPreferences)) {
        const pushData = pushNotificationService.createNotificationData('meeting', {
          userName,
          meetingId,
          meetingType
        });
        await pushNotificationService.showNotification(pushData);
      }
      
      // Send email notification (in a real app, you'd get the user's email)
      if (emailNotificationService.isEmailEnabledForCategory('meeting', currentPreferences)) {
        // This would typically get the user's email from auth context
        const userEmail = 'user@example.com'; // Replace with actual user email
        await emailNotificationService.sendEmailNotification({
          to: userEmail,
          subject: `🔔 ${userName} started a meeting`,
          html: '',
          text: '',
          category: 'meeting'
        });
      }
    }
  }, []);

  const triggerTaskUpdated = useCallback(async (userName: string, taskTitle: string, progress: number, taskId: string) => {
    const currentPreferences = notificationService.getNotificationPreferences();
    
    if (notificationService.shouldShowNotification('task')) {
      notificationService.notifyTaskUpdated(userName, taskTitle, progress, taskId);
      
      // Send push notification
      if (pushNotificationService.isPushEnabledForCategory('task', currentPreferences)) {
        const pushData = pushNotificationService.createNotificationData('task', {
          userName,
          taskTitle,
          progress,
          taskId
        });
        await pushNotificationService.showNotification(pushData);
      }
    }
  }, []);

  const triggerIdeaShared = useCallback(async (userName: string, ideaTitle: string, ideaId: string) => {
    const currentPreferences = notificationService.getNotificationPreferences();
    
    if (notificationService.shouldShowNotification('idea')) {
      notificationService.notifyIdeaShared(userName, ideaTitle, ideaId);
      
      // Send push notification
      if (pushNotificationService.isPushEnabledForCategory('idea', currentPreferences)) {
        const pushData = pushNotificationService.createNotificationData('idea', {
          userName,
          ideaTitle,
          ideaId
        });
        await pushNotificationService.showNotification(pushData);
      }
    }
  }, []);

  const triggerMessageSent = useCallback(async (userName: string, messagePreview: string, messageId: string, isGroup: boolean = true) => {
    const currentPreferences = notificationService.getNotificationPreferences();
    
    if (notificationService.shouldShowNotification('chat')) {
      notificationService.notifyMessageSent(userName, messagePreview, messageId, isGroup);
      
      // Send push notification
      if (pushNotificationService.isPushEnabledForCategory('chat', currentPreferences)) {
        const pushData = pushNotificationService.createNotificationData('chat', {
          userName,
          messagePreview,
          messageId,
          isGroup
        });
        await pushNotificationService.showNotification(pushData);
      }
    }
  }, []);

  // Notification management
  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    notificationService.removeNotification(notificationId);
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clearAll();
  }, []);

  // Preferences management
  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    notificationService.saveNotificationPreferences(updatedPreferences);
  }, [preferences]);

  // Get notifications by category
  const getNotificationsByCategory = useCallback((category: Notification['category']) => {
    return notificationService.getNotificationsByCategory(category);
  }, []);

  // Browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return typeof window !== 'undefined' && Notification.permission === 'granted';
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }, []);

  return {
    notifications,
    unreadCount,
    preferences,
    triggerMeetingStarted,
    triggerTaskUpdated,
    triggerIdeaShared,
    triggerMessageSent,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updatePreferences,
    getNotificationsByCategory,
    requestNotificationPermission,
    showBrowserNotification,
    formatTimeAgo: notificationService.formatTimeAgo.bind(notificationService)
  };
};
