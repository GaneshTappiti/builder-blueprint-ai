"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  Award, 
  Lightbulb, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Calendar,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ProfileTimelineEvent } from '@/types/profile';

interface ProfileTimelineProps {
  userId?: string;
  className?: string;
}

export function ProfileTimeline({ userId, className = '' }: ProfileTimelineProps) {
  const { profile } = useProfile();
  const [timelineEvents, setTimelineEvents] = useState<ProfileTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showPrivate, setShowPrivate] = useState(false);

  useEffect(() => {
    loadTimelineEvents();
  }, [userId, showPrivate]);

  const loadTimelineEvents = async () => {
    try {
      setLoading(true);
      // This would be implemented in ProfileService
      // const events = await ProfileService.getTimelineEvents(userId, { showPrivate });
      // setTimelineEvents(events);
      
      // Mock data for now
      const mockEvents: ProfileTimelineEvent[] = [
        {
          id: '1',
          type: 'achievement',
          title: 'Earned "Innovation Champion" Badge',
          description: 'Successfully implemented 5 innovative ideas this quarter',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          icon: '🏆',
          isPublic: true,
          metadata: { points: 100, category: 'innovation' }
        },
        {
          id: '2',
          type: 'skill_added',
          title: 'Added React Native Skill',
          description: 'Completed advanced React Native course and added to profile',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          icon: '⚛️',
          isPublic: true,
          metadata: { skill: 'React Native', level: 'intermediate' }
        },
        {
          id: '3',
          type: 'project_completed',
          title: 'Completed "Mobile App Redesign" Project',
          description: 'Led the redesign of the company mobile application',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          icon: '📱',
          isPublic: true,
          metadata: { projectId: 'proj-123', teamSize: 5 }
        },
        {
          id: '4',
          type: 'idea_submitted',
          title: 'Submitted "AI-Powered Analytics" Idea',
          description: 'Proposed new AI analytics feature for better insights',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          icon: '💡',
          isPublic: true,
          metadata: { ideaId: 'idea-456', votes: 12 }
        },
        {
          id: '5',
          type: 'collaboration',
          title: 'Collaborated with Sarah Johnson',
          description: 'Worked together on the Q4 planning initiative',
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          icon: '🤝',
          isPublic: false,
          metadata: { collaboratorId: 'user-789', project: 'Q4 Planning' }
        }
      ];
      
      setTimelineEvents(mockEvents);
    } catch (error) {
      console.error('Error loading timeline events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="h-5 w-5" />;
      case 'skill_added': return <TrendingUp className="h-5 w-5" />;
      case 'project_completed': return <CheckCircle className="h-5 w-5" />;
      case 'idea_submitted': return <Lightbulb className="h-5 w-5" />;
      case 'collaboration': return <Users className="h-5 w-5" />;
      case 'status_change': return <Clock className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'skill_added': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'project_completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'idea_submitted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'collaboration': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'status_change': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredEvents = timelineEvents.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'public') return event.isPublic;
    if (filter === 'private') return !event.isPublic;
    return event.type === filter;
  });

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Activity Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Recent activities and achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrivate(!showPrivate)}
          >
            {showPrivate ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPrivate ? 'Hide Private' : 'Show Private'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'achievement', 'skill_added', 'project_completed', 'idea_submitted', 'collaboration'].map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filterType)}
            className="capitalize"
          >
            {filterType.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No timeline events found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event, index) => (
            <Card key={event.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Timeline line */}
                  {index < filteredEvents.length - 1 && (
                    <div className="absolute left-8 top-16 w-0.5 h-16 bg-border"></div>
                  )}
                  
                  {/* Event icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={event.isPublic ? "default" : "secondary"}>
                          {event.isPublic ? 'Public' : 'Private'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(event.timestamp), 'MMM d, yyyy')}
                      </div>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="flex items-center gap-1">
                          <MoreHorizontal className="h-3 w-3" />
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <span key={key} className="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
