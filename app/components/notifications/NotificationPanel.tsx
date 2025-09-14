"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Settings, 
  Check, 
  X, 
  Trash2, 
  Video, 
  MessageSquare, 
  Lightbulb, 
  CheckCircle2,
  AlertCircle,
  Info,
  XCircle,
  Users,
  Calendar,
  TestTube
} from 'lucide-react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { notificationService } from '@/services/notificationService';
import { ChatNotification } from '@/types/chat';
import NotificationTester from './NotificationTester';
import NotificationPreferences from './NotificationPreferences';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByCategory,
    formatTimeAgo
  } = useRealtimeNotifications();

  const [showTester, setShowTester] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChatNotification['type'] | 'all'>('all');

  if (!isOpen) return null;

  const getCategoryIcon = (category: ChatNotification['type']) => {
    switch (category) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'mention':
        return <Users className="h-4 w-4" />;
      case 'reaction':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'file_upload':
        return <Video className="h-4 w-4" />;
      case 'channel_invite':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: ChatNotification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'mention':
        return <Users className="h-4 w-4 text-green-400" />;
      case 'reaction':
        return <CheckCircle2 className="h-4 w-4 text-yellow-400" />;
      case 'file_upload':
        return <Video className="h-4 w-4 text-purple-400" />;
      case 'channel_invite':
        return <Settings className="h-4 w-4 text-orange-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getTypeColors = (type: ChatNotification['type']) => {
    switch (type) {
      case 'message':
        return 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20';
      case 'mention':
        return 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20';
      case 'reaction':
        return 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20';
      case 'file_upload':
        return 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20';
      case 'channel_invite':
        return 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20';
    }
  };

  const filteredNotifications = selectedCategory === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === selectedCategory);

  const categories = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
    { key: 'mention', label: 'Mentions', count: notifications.filter(n => n.type === 'mention').length },
    { key: 'reaction', label: 'Reactions', count: notifications.filter(n => n.type === 'reaction').length },
    { key: 'file_upload', label: 'File Uploads', count: notifications.filter(n => n.type === 'file_upload').length },
    { key: 'channel_invite', label: 'Channel Invites', count: notifications.filter(n => n.type === 'channel_invite').length }
  ];

  const handleNotificationClick = (notification: ChatNotification) => {
    markAsRead(notification.id);
    if (notification.data?.actionUrl) {
      window.location.href = notification.data.actionUrl;
    }
  };

  if (showPreferences) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 pt-16 sm:pt-20">
        <Card className="w-full max-w-[95vw] sm:max-w-2xl max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)] overflow-hidden bg-black/90 border-white/20">
          <CardContent className="p-4 sm:p-6 h-full overflow-y-auto">
            <NotificationPreferences onClose={() => setShowPreferences(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showTester) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 pt-16 sm:pt-20">
        <Card className="w-full max-w-[95vw] sm:max-w-4xl max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)] overflow-hidden bg-black/90 border-white/20">
          <CardContent className="p-4 sm:p-6 h-full overflow-y-auto">
            <NotificationTester onClose={() => setShowTester(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 pt-20 sm:pt-24"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full h-full bg-black/90 border-white/20 flex flex-col shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTester(true)}
                className="text-purple-400 hover:text-purple-300 text-xs"
              >
                <TestTube className="h-3 w-3 mr-1" />
                Test
              </Button>
              <Link href="/account">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="flex-shrink-0 px-4 sm:px-6 pb-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.key as any)}
                className={`whitespace-nowrap text-xs sm:text-sm ${
                  selectedCategory === category.key 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {category.key !== 'all' && getCategoryIcon(category.key as ChatNotification['type'])}
                <span className="ml-1 hidden sm:inline">{category.label}</span>
                <span className="ml-1 sm:hidden">{category.label.charAt(0)}</span>
                {category.count > 0 && (
                  <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                    {category.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 px-4 sm:px-6 pb-4">
          <div className="flex gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm"
            >
              <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Mark All Read</span>
              <span className="sm:hidden">Read</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${getTypeColors(notification.type)} ${
                    !notification.read ? 'border-l-4 border-l-green-400' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(notification.type)}
                        <p className="text-sm font-medium text-white truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-green-400 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 line-clamp-2 mb-2">
                        {notification.body}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-red-400 p-1 h-auto"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No notifications</p>
              <p className="text-sm text-gray-500">
                {selectedCategory === 'all' 
                  ? "You're all caught up!" 
                  : `No ${selectedCategory} notifications`}
              </p>
            </div>
          )}
        </div>
        </Card>
      </div>
    </div>
  );
};

export default NotificationPanel;
