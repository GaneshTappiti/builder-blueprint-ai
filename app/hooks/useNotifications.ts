import { useState, useEffect } from 'react';
import { notificationService, Notification } from '@/services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
        setUnreadCount(notificationService.getUnreadCount());
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();

    // Subscribe to changes
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(notificationService.getUnreadCount());
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

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
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
