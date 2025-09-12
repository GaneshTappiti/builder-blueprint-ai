"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChatNotifications } from "@/hooks/useChatNotifications";

interface NotificationSettingsProps {
  className?: string;
}

interface NotificationPreferences {
  browserNotifications: boolean;
  toastNotifications: boolean;
  soundNotifications: boolean;
  mentionNotifications: boolean;
  messageNotifications: boolean;
  callNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className }) => {
  const { toast } = useToast();
  const { 
    requestNotificationPermission, 
    subscribeToPushNotifications, 
    unsubscribeFromPushNotifications 
  } = useChatNotifications();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    browserNotifications: false,
    toastNotifications: true,
    soundNotifications: true,
    mentionNotifications: true,
    messageNotifications: true,
    callNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'default'>('unknown');
  const [isLoading, setIsLoading] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat-notification-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('chat-notification-preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Check notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission as any);
    }
  }, []);

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedPreferenceChange = (parentKey: keyof NotificationPreferences, childKey: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value
      }
    }));
  };

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const permission = await requestNotificationPermission();
      
      if (permission.granted) {
        setPermissionStatus('granted');
        handlePreferenceChange('browserNotifications', true);
        toast({
          title: "Permission granted",
          description: "You'll now receive browser notifications for new messages.",
        });
      } else if (permission.denied) {
        setPermissionStatus('denied');
        toast({
          title: "Permission denied",
          description: "Browser notifications are blocked. You can enable them in your browser settings.",
          variant: "destructive"
        });
      } else {
        setPermissionStatus('default');
        toast({
          title: "Permission required",
          description: "Please allow notifications to receive message alerts.",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribeToPush = async () => {
    setIsLoading(true);
    try {
      const subscription = await subscribeToPushNotifications();
      
      if (subscription) {
        toast({
          title: "Subscribed",
          description: "You'll now receive push notifications on this device.",
        });
      } else {
        toast({
          title: "Subscription failed",
          description: "Could not subscribe to push notifications.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe to push notifications.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPushNotifications();
      toast({
        title: "Unsubscribed",
        description: "You'll no longer receive push notifications on this device.",
      });
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: "Error",
        description: "Failed to unsubscribe from push notifications.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionIcon = () => {
    switch (permissionStatus) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'denied':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <BellOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPermissionText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Notifications enabled';
      case 'denied':
        return 'Notifications blocked';
      default:
        return 'Permission required';
    }
  };

  return (
    <Card className={`bg-black/40 backdrop-blur-sm border-white/10 ${className || ''}`}>
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Browser Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <Label className="text-white font-medium">Browser Notifications</Label>
                <p className="text-sm text-gray-400">
                  Show desktop notifications for new messages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getPermissionIcon()}
              <span className="text-sm text-gray-400">{getPermissionText()}</span>
              {permissionStatus !== 'granted' && (
                <Button
                  size="sm"
                  onClick={handleRequestPermission}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Requesting...' : 'Enable'}
                </Button>
              )}
            </div>
          </div>

          <div className="ml-8 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white">Push Notifications</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSubscribeToPush}
                disabled={isLoading || permissionStatus !== 'granted'}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-gray-400" />
            <div>
              <Label className="text-white font-medium">Toast Notifications</Label>
              <p className="text-sm text-gray-400">
                Show in-app toast notifications
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.toastNotifications}
            onCheckedChange={(checked) => handlePreferenceChange('toastNotifications', checked)}
          />
        </div>

        {/* Sound Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {preferences.soundNotifications ? (
              <Volume2 className="h-5 w-5 text-gray-400" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <Label className="text-white font-medium">Sound Notifications</Label>
              <p className="text-sm text-gray-400">
                Play sound for new messages
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.soundNotifications}
            onCheckedChange={(checked) => handlePreferenceChange('soundNotifications', checked)}
          />
        </div>

        {/* Message Types */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Message Types</h4>
          
          <div className="space-y-3 ml-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">All Messages</Label>
              <Switch
                checked={preferences.messageNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('messageNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-white">Mentions Only</Label>
              <Switch
                checked={preferences.mentionNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('mentionNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-white">Call Notifications</Label>
              <Switch
                checked={preferences.callNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('callNotifications', checked)}
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-medium">Quiet Hours</Label>
              <p className="text-sm text-gray-400">
                Disable notifications during specified hours
              </p>
            </div>
            <Switch
              checked={preferences.quietHours.enabled}
              onCheckedChange={(checked) => handleNestedPreferenceChange('quietHours', 'enabled', checked)}
            />
          </div>

          {preferences.quietHours.enabled && (
            <div className="ml-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white text-sm">Start Time</Label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => handleNestedPreferenceChange('quietHours', 'start', e.target.value)}
                    className="w-full p-2 bg-black/20 border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <Label className="text-white text-sm">End Time</Label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => handleNestedPreferenceChange('quietHours', 'end', e.target.value)}
                    className="w-full p-2 bg-black/20 border border-white/10 rounded text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test Notifications */}
        <div className="pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: "Test Notification",
                description: "This is a test notification to verify your settings.",
              });
            }}
            className="w-full"
          >
            Test Notification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
