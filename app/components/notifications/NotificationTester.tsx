"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { notificationService } from '@/services/notificationService';
import { pushNotificationService } from '@/services/pushNotificationService';
import { emailNotificationService } from '@/services/emailNotificationService';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TestTube,
  Settings,
  Mail,
  Smartphone
} from 'lucide-react';

interface NotificationTesterProps {
  onClose?: () => void;
}

const NotificationTester: React.FC<NotificationTesterProps> = ({ onClose }) => {
  const { preferences, updatePreferences } = useRealtimeNotifications();
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});

  const testNotification = async (category: 'meeting' | 'task' | 'idea' | 'chat' | 'team' | 'system') => {
    const testData = {
      meeting: { userName: 'Test User', meetingId: 'test-123', meetingType: 'video' as const },
      task: { userName: 'Test User', taskTitle: 'Test Task', progress: 75, taskId: 'test-123' },
      idea: { userName: 'Test User', ideaTitle: 'Test Idea', ideaId: 'test-123' },
      chat: { userName: 'Test User', messagePreview: 'This is a test message', messageId: 'test-123', isGroup: true },
      team: { title: 'Team Update', message: 'This is a test team update' },
      system: { title: 'System Test', message: 'This is a test system notification' }
    };

    const data = testData[category];
    const results: { [key: string]: boolean } = {};

    try {
      // Test in-app notification
      const shouldShowInApp = notificationService.shouldShowNotification(category);
      if (shouldShowInApp) {
        notificationService.addNotification({
          title: `Test ${category} notification`,
          message: `This is a test ${category} notification to verify preferences are working.`,
          type: 'info',
          category,
          actionUrl: '/workspace',
          actionText: 'View'
        });
        results.inApp = true;
      } else {
        results.inApp = false;
      }

      // Test push notification
      const shouldSendPush = notificationService.shouldSendPush(category);
      if (shouldSendPush && pushNotificationService.isReady()) {
        const pushData = pushNotificationService.createNotificationData(category, data);
        const pushResult = await pushNotificationService.showNotificationWithFallback(pushData);
        results.push = pushResult !== null;
      } else {
        results.push = false;
      }

      // Test email notification
      const shouldSendEmail = notificationService.shouldSendEmail(category);
      if (shouldSendEmail) {
        const emailResult = await emailNotificationService.sendEmailNotification({
          to: 'test@example.com',
          subject: `Test ${category} notification`,
          html: `<h1>Test ${category} notification</h1><p>This is a test email notification.</p>`,
          text: `Test ${category} notification: This is a test email notification.`,
          category
        });
        results.email = emailResult;
      } else {
        results.email = false;
      }

      setTestResults(prev => ({ ...prev, [category]: results }));
    } catch (error) {
      console.error(`Test failed for ${category}:`, error);
      setTestResults(prev => ({ ...prev, [category]: { inApp: false, push: false, email: false } }));
    }
  };

  const testAllCategories = async () => {
    const categories: ('meeting' | 'task' | 'idea' | 'chat' | 'team' | 'system')[] = 
      ['meeting', 'task', 'idea', 'chat', 'team', 'system'];
    
    for (const category of categories) {
      await testNotification(category);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-400" />
    ) : (
      <XCircle className="h-4 w-4 text-red-400" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="default" className="bg-green-600">Working</Badge>
    ) : (
      <Badge variant="destructive">Disabled</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TestTube className="h-6 w-6" />
            Notification Tester
          </h2>
          <p className="text-gray-400">Test all notification preferences and channels</p>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </Button>
        )}
      </div>

      {/* Current Preferences Status */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Preferences Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-white">In-app notifications</span>
              {getStatusIcon(preferences.inAppNotifications)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Email notifications</span>
              {getStatusIcon(preferences.emailNotifications)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Push notifications</span>
              {getStatusIcon(preferences.pushNotifications && pushNotificationService.isReady())}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Meeting notifications</span>
              {getStatusIcon(preferences.meetingNotifications)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Task reminders</span>
              {getStatusIcon(preferences.taskReminders)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Idea sharing</span>
              {getStatusIcon(preferences.ideaSharingNotifications)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Chat notifications</span>
              {getStatusIcon(preferences.chatNotifications)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Team updates</span>
              {getStatusIcon(preferences.teamUpdates)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">System updates</span>
              {getStatusIcon(preferences.systemUpdates)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Test Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => testNotification('meeting')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Test Meeting
            </Button>
            <Button
              onClick={() => testNotification('task')}
              className="bg-green-600 hover:bg-green-700"
            >
              Test Task
            </Button>
            <Button
              onClick={() => testNotification('idea')}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Test Idea
            </Button>
            <Button
              onClick={() => testNotification('chat')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Test Chat
            </Button>
            <Button
              onClick={() => testNotification('team')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Test Team
            </Button>
            <Button
              onClick={() => testNotification('system')}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Test System
            </Button>
          </div>
          
          <Button
            onClick={testAllCategories}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Test All Categories
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(testResults).map(([category, results]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium capitalize">{category}</span>
                    {getStatusBadge(results.inApp || results.push || results.email)}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Bell className="h-4 w-4 text-blue-400" />
                      {getStatusIcon(results.inApp)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Smartphone className="h-4 w-4 text-green-400" />
                      {getStatusIcon(results.push)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-orange-400" />
                      {getStatusIcon(results.email)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permission Status */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Permission Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white">Push Notifications Supported</span>
              {getStatusIcon(pushNotificationService.isSupported())}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Push Permission Granted</span>
              {getStatusIcon(pushNotificationService.getPermission().status === 'granted')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Ready to Send Push</span>
              {getStatusIcon(pushNotificationService.isReady())}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTester;
