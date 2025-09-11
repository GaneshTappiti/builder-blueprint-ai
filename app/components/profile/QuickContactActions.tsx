"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Phone, 
  Video, 
  Mail, 
  Calendar,
  Clock,
  Users,
  Slack,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { QuickContactAction } from '@/types/profile';

interface QuickContactActionsProps {
  userId: string;
  userName: string;
  userStatus: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

export function QuickContactActions({ 
  userId, 
  userName, 
  userStatus, 
  className = '' 
}: QuickContactActionsProps) {
  const [contactActions, setContactActions] = useState<QuickContactAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactActions();
  }, [userId, userStatus]);

  const loadContactActions = async () => {
    try {
      setLoading(true);
      // This would be implemented in ProfileService
      // const actions = await ProfileService.getQuickContactActions(userId);
      // setContactActions(actions);
      
      // Mock data for now
      const mockActions: QuickContactAction[] = [
        {
          id: '1',
          type: 'message',
          label: 'Send Message',
          icon: '💬',
          url: `/messages/compose?to=${userId}`,
          isAvailable: userStatus !== 'offline',
          availabilityMessage: userStatus === 'offline' ? 'User is offline' : undefined
        },
        {
          id: '2',
          type: 'call',
          label: 'Voice Call',
          icon: '📞',
          url: `/calls/start?to=${userId}`,
          isAvailable: userStatus === 'online',
          availabilityMessage: userStatus !== 'online' ? 'User is not available for calls' : undefined
        },
        {
          id: '3',
          type: 'meeting',
          label: 'Video Meeting',
          icon: '📹',
          url: `/meetings/schedule?with=${userId}`,
          isAvailable: userStatus !== 'offline',
          availabilityMessage: userStatus === 'offline' ? 'User is offline' : undefined
        },
        {
          id: '4',
          type: 'email',
          label: 'Send Email',
          icon: '📧',
          url: `mailto:${userId}@company.com`,
          isAvailable: true,
          availabilityMessage: undefined
        },
        {
          id: '5',
          type: 'slack',
          label: 'Slack DM',
          icon: '💬',
          url: `slack://user?team=T123&id=${userId}`,
          isAvailable: userStatus !== 'offline',
          availabilityMessage: userStatus === 'offline' ? 'User is offline' : undefined
        },
        {
          id: '6',
          type: 'meeting',
          label: 'Schedule Meeting',
          icon: '📅',
          url: `/calendar/schedule?with=${userId}`,
          isAvailable: true,
          availabilityMessage: undefined
        }
      ];
      
      setContactActions(mockActions);
    } catch (error) {
      console.error('Error loading contact actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'away': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'busy': return 'bg-red-100 text-red-800 border-red-200';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-3 w-3" />;
      case 'away': return <Clock className="h-3 w-3" />;
      case 'busy': return <XCircle className="h-3 w-3" />;
      case 'offline': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'meeting': return <Video className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'slack': return <Slack className="h-4 w-4" />;
      case 'teams': return <Users className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const handleActionClick = (action: QuickContactAction) => {
    if (!action.isAvailable) {
      return;
    }

    if (action.url) {
      if (action.type === 'email') {
        window.location.href = action.url;
      } else if (action.type === 'slack' || action.type === 'teams') {
        // Handle external app links
        window.open(action.url, '_blank');
      } else {
        // Handle internal navigation
        window.location.href = action.url;
      }
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quick Contact</span>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(userStatus)} flex items-center gap-1`}
          >
            {getStatusIcon(userStatus)}
            {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contactActions.map((action) => (
            <div key={action.id} className="space-y-2">
              <Button
                variant={action.isAvailable ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleActionClick(action)}
                disabled={!action.isAvailable}
              >
                <div className="flex items-center gap-3">
                  {getActionIcon(action.type)}
                  <span>{action.label}</span>
                  {action.url && action.isAvailable && (
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  )}
                </div>
              </Button>
              {action.availabilityMessage && (
                <p className="text-xs text-muted-foreground ml-7">
                  {action.availabilityMessage}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Availability Info */}
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Availability</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            {userStatus === 'online' && (
              <p>• Available for immediate contact</p>
            )}
            {userStatus === 'away' && (
              <p>• May respond with delay</p>
            )}
            {userStatus === 'busy' && (
              <p>• Currently busy, try later</p>
            )}
            {userStatus === 'offline' && (
              <p>• Last seen recently, will respond when online</p>
            )}
            <p>• Response time: Usually within 2 hours</p>
            <p>• Preferred contact: Email or Slack</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
