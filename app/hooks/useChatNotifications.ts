"use client";

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage, ChatNotification } from '@/types/chat';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export function useChatNotifications() {
  const { user } = useAuth();
  const { messages, currentChannel } = useChat();
  const { toast } = useToast();

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return { granted: false, denied: false, default: true };
    }

    if (Notification.permission === 'granted') {
      return { granted: true, denied: false, default: false };
    }

    if (Notification.permission === 'denied') {
      return { granted: false, denied: true, default: false };
    }

    const permission = await Notification.requestPermission();
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }, []);

  // Show browser notification
  const showNotification = useCallback((message: ChatMessage, channelName?: string) => {
    if (!user || message.sender_id === user.id) return;

    const notification = new Notification(`${channelName || 'New Message'}`, {
      body: message.content,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `chat-${message.channel_id}`,
      requireInteraction: false,
      silent: false
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }, [user]);

  // Show toast notification
  const showToastNotification = useCallback((message: ChatMessage, channelName?: string) => {
    if (!user || message.sender_id === user.id) return;

    toast({
      title: `New message in ${channelName || 'chat'}`,
      description: `${message.sender?.name || 'Someone'}: ${message.content}`,
      duration: 5000,
    });
  }, [user, toast]);

  // Check for mentions
  const checkForMentions = useCallback((message: ChatMessage) => {
    if (!user || message.sender_id === user.id) return false;

    const mentions = message.metadata?.mentions || [];
    const userMention = mentions.find(mention => 
      mention.toLowerCase() === user.name?.toLowerCase() ||
      mention.toLowerCase() === user.email?.toLowerCase()
    );

    return !!userMention;
  }, [user]);

  // Handle new message notifications
  const handleNewMessage = useCallback(async (message: ChatMessage) => {
    if (!user || message.sender_id === user.id) return;

    const isMention = checkForMentions(message);
    const channelName = currentChannel?.name || 'Unknown Channel';

    // Always show toast for new messages
    showToastNotification(message, channelName);

    // Show browser notification for mentions or if user is not focused
    if (isMention || document.hidden) {
      const permission = await requestNotificationPermission();
      
      if (permission.granted) {
        showNotification(message, channelName);
      }
    }
  }, [user, currentChannel, checkForMentions, showToastNotification, showNotification, requestNotificationPermission]);

  // Monitor new messages
  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender_id !== user?.id) {
      handleNewMessage(lastMessage);
    }
  }, [messages, user, handleNewMessage]);

  // Setup service worker for push notifications (if available)
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Service worker is ready for push notifications
        console.log('Service worker ready for push notifications');
      });
    }
  }, []);

  // Subscribe to push notifications
  const subscribeToPushNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userId: user?.id
        })
      });

      if (response.ok) {
        console.log('Successfully subscribed to push notifications');
        return subscription;
      } else {
        console.error('Failed to subscribe to push notifications');
        return null;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }, [user]);

  // Unsubscribe from push notifications
  const unsubscribeFromPushNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id
          })
        });

        console.log('Successfully unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  }, [user]);

  return {
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    showNotification,
    showToastNotification
  };
}
