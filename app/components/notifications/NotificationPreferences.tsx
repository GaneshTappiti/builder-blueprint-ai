"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Smartphone, Settings } from 'lucide-react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferencesProps {
  onClose?: () => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ onClose }) => {
  const { preferences, updatePreferences, requestNotificationPermission } = useRealtimeNotifications();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePreferenceChange = async (key: string, value: boolean) => {
    setIsLoading(true);
    try {
      if (key.startsWith('types.')) {
        const typeKey = key.split('.')[1] as keyof typeof preferences.types;
        updatePreferences({ 
          types: { 
            ...preferences.types, 
            [typeKey]: value 
          } 
        });
      } else {
        updatePreferences({ [key]: value });
      }
      
      // Request browser notification permission if enabling push notifications
      if (key === 'push' && value) {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
          toast({
            title: "Permission Required",
            description: "Please enable browser notifications to receive push notifications.",
            variant: "destructive"
          });
          updatePreferences({ [key]: false });
        }
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const preferenceSections = [
    {
      title: "General Notifications",
      icon: Bell,
      items: [
        {
          key: 'desktop' as const,
          label: 'In-app notifications',
          description: 'Show notifications within the application'
        },
        {
          key: 'email' as const,
          label: 'Email notifications',
          description: 'Receive notifications via email'
        },
        {
          key: 'push' as const,
          label: 'Push notifications',
          description: 'Receive browser push notifications'
        }
      ]
    },
    {
      title: "Team & Collaboration",
      icon: Settings,
      items: [
        {
          key: 'types.meetings' as const,
          label: 'Meeting notifications',
          description: 'Get notified when team members start meetings'
        },
        {
          key: 'types.mentions' as const,
          label: 'Chat notifications',
          description: 'Get notified about new messages in team chat'
        },
        {
          key: 'types.ideas' as const,
          label: 'Idea sharing notifications',
          description: 'Get notified when ideas are shared in team vault'
        },
        {
          key: 'types.teamUpdates' as const,
          label: 'Team updates',
          description: 'Get notified about team member changes'
        }
      ]
    },
    {
      title: "Work & Tasks",
      icon: Settings,
      items: [
        {
          key: 'types.tasks' as const,
          label: 'Task reminders',
          description: 'Get reminded about upcoming and overdue tasks'
        },
        {
          key: 'types.achievements' as const,
          label: 'Idea validation alerts',
          description: 'Get notified when idea validation completes'
        },
        {
          key: 'types.projects' as const,
          label: 'System updates',
          description: 'Get notified about new features and updates'
        }
      ]
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Notification Preferences</h2>
          <p className="text-sm sm:text-base text-gray-400">Customize how you receive notifications</p>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </Button>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6">
        {preferenceSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-lg">
                <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 pr-4">
                      <Label htmlFor={item.key} className="text-white font-medium text-sm sm:text-base">
                        {item.label}
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-400">{item.description}</p>
                    </div>
                    <Switch
                      id={item.key}
                      checked={item.key.startsWith('types.') 
                        ? preferences.types[item.key.split('.')[1] as keyof typeof preferences.types]
                        : typeof preferences[item.key as keyof typeof preferences] === 'boolean' 
                          ? preferences[item.key as keyof typeof preferences] as boolean
                          : false
                      }
                      onCheckedChange={(checked) => handlePreferenceChange(item.key, checked)}
                      disabled={isLoading}
                    />
                  </div>
                  {itemIndex < section.items.length - 1 && (
                    <Separator className="mt-4 bg-white/10" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-white/10">
        <Button
          variant="outline"
          onClick={() => {
            // Reset to defaults
            updatePreferences({
              email: true,
              push: true,
              desktop: true,
              sms: false,
              types: {
                mentions: true,
                tasks: true,
                meetings: true,
                ideas: true,
                projects: true,
                teamUpdates: true,
                achievements: true
              },
              frequency: 'immediate',
              quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
              }
            });
            toast({
              title: "Preferences Reset",
              description: "Notification preferences have been reset to defaults."
            });
          }}
          className="border-white/20 text-white hover:bg-white/10 text-sm px-6 py-2"
        >
          Reset to Defaults
        </Button>
        {onClose && (
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-sm px-6 py-2">
            Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotificationPreferences;
