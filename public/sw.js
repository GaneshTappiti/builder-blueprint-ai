// Service Worker for Push Notifications
const CACHE_NAME = 'chat-notifications-v1';
const NOTIFICATION_TAG = 'chat-notification';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);
    
    const options = {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      data: data.data || {},
      tag: data.data?.channel_id || NOTIFICATION_TAG,
      requireInteraction: true,
      silent: false,
      actions: data.actions || [
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
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'view' || !action) {
    // Open or focus the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        // Check if there's already a window/tab open with the app
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Focus existing window and navigate to the channel
            if (data.channelId) {
              client.postMessage({
                type: 'NAVIGATE_TO_CHANNEL',
                channelId: data.channelId,
                messageId: data.messageId
              });
            }
            return client.focus();
          }
        }
        
        // If no existing window, open a new one
        if (self.clients.openWindow) {
          let url = self.location.origin;
          if (data.channelId) {
            url += `/workspace/teamspace?channel=${data.channelId}`;
          }
          return self.clients.openWindow(url);
        }
      })
    );
  } else if (action === 'mark_read') {
    // Mark notification as read
    if (data.notificationId) {
      event.waitUntil(
        fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationId: data.notificationId
          })
        }).catch(error => {
          console.error('Error marking notification as read:', error);
        })
      );
    }
  }
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

// Message event for communication with the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper function to sync notifications
async function syncNotifications() {
  try {
    // Get pending notifications from IndexedDB
    const pendingNotifications = await getPendingNotifications();
    
    for (const notification of pendingNotifications) {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notification)
        });
        
        // Remove from pending list
        await removePendingNotification(notification.id);
      } catch (error) {
        console.error('Error syncing notification:', error);
      }
    }
  } catch (error) {
    console.error('Error in syncNotifications:', error);
  }
}

// IndexedDB helper functions
async function getPendingNotifications() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('chat-notifications', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['notifications'], 'readonly');
      const store = transaction.objectStore('notifications');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', { keyPath: 'id' });
      }
    };
  });
}

async function removePendingNotification(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('chat-notifications', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Initialize IndexedDB
self.addEventListener('install', (event) => {
  event.waitUntil(
    new Promise((resolve, reject) => {
      const request = indexedDB.open('chat-notifications', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id' });
        }
      };
    })
  );
});
