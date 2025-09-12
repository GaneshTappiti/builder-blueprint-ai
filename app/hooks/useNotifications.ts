import { useState, useEffect } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import { ChatNotification } from '@/types/chat';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial load - we'll need to get userId from context or props
    // For now, we'll use a placeholder or get it from auth context
    const loadNotifications = async () => {
      try {
        // This should be replaced with actual user ID from auth context
        const userId = 'current-user-id'; // TODO: Get from auth context
        const notifications = await notificationService.getNotifications(userId);
        setNotifications(notifications);
        const count = await notificationService.getUnreadCount(userId);
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();

    // Subscribe to changes
    const unsubscribe = notificationService.subscribe(async (updatedNotifications) => {
      setNotifications(updatedNotifications);
      const userId = 'current-user-id'; // TODO: Get from auth context
      const count = await notificationService.getUnreadCount(userId);
      setUnreadCount(count);
    });

    return unsubscribe;
  }, []);

  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const removeNotification = (notificationId: string) => {
    notificationService.removeNotification(notificationId);
  };

  const clearAll = () => {
    notificationService.clearAll();
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    notificationService.addNotification(notification);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    addNotification,
    formatTimeAgo: notificationService.formatTimeAgo.bind(notificationService)
  };
};
