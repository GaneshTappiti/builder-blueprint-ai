"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Video, 
  Phone, 
  X, 
  Users, 
  Clock, 
  Bell,
  CheckCircle,
  AlertCircle,
  Play,
  Mic,
  MicOff,
  VideoOff,
  ScreenShare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { TeamMember } from '@/types/teamManagement';

interface MeetingNotification {
  id: string;
  meetingId: number;
  title: string;
  type: 'video' | 'audio';
  startedBy: string;
  startedAt: string;
  participants: {
    userId: string;
    name: string;
    status: 'joined' | 'pending' | 'declined';
    joinedAt?: string;
  }[];
  meetingLink?: string;
  isDismissed?: boolean;
}

interface MeetingNotificationSystemProps {
  teamMembers: TeamMember[];
  currentUserId: string;
  onJoinMeeting: (meetingId: number) => void;
  onDeclineMeeting: (meetingId: number) => void;
  onEndMeeting: (meetingId: number) => void;
  onDismissNotification: (notificationId: string) => void;
}

const MeetingNotificationSystem: React.FC<MeetingNotificationSystemProps> = ({
  teamMembers,
  currentUserId,
  onJoinMeeting,
  onDeclineMeeting,
  onEndMeeting,
  onDismissNotification
}) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<MeetingNotification[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Simulate receiving meeting notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random meeting notifications for demo
      if (Math.random() > 0.95) { // 5% chance every interval
        const randomMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
        if (randomMember && randomMember.id !== currentUserId) {
          const newNotification: MeetingNotification = {
            id: Date.now().toString(),
            meetingId: Date.now(),
            title: `${randomMember.name} started a ${Math.random() > 0.5 ? 'Video' : 'Audio'} Meeting`,
            type: Math.random() > 0.5 ? 'video' : 'audio',
            startedBy: randomMember.id,
            startedAt: new Date().toISOString(),
            participants: teamMembers.map(member => ({
              userId: member.id,
              name: member.name,
              status: member.id === randomMember.id ? 'joined' : 'pending'
            })),
            meetingLink: `https://meet.example.com/${Date.now()}`,
            isDismissed: false
          };

          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
          
          // Show browser notification if permission granted
          if (typeof window !== 'undefined' && Notification.permission === 'granted') {
            new Notification(`🔔 ${randomMember.name} started a meeting`, {
              body: 'Click to join the meeting',
              icon: '/favicon.ico'
            });
          }
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [teamMembers, currentUserId]);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleJoin = (notification: MeetingNotification) => {
    onJoinMeeting(notification.meetingId);
    handleDismiss(notification.id);
    toast({
      title: "Joining meeting",
      description: `Joining ${notification.title}...`,
    });
  };

  const handleDecline = (notification: MeetingNotification) => {
    onDeclineMeeting(notification.meetingId);
    handleDismiss(notification.id);
    toast({
      title: "Meeting declined",
      description: "You declined the meeting invitation.",
    });
  };

  const handleEnd = (notification: MeetingNotification) => {
    onEndMeeting(notification.meetingId);
    handleDismiss(notification.id);
    toast({
      title: "Meeting ended",
      description: "The meeting has been ended.",
    });
  };

  const handleDismiss = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    onDismissNotification(notificationId);
  };

  const formatTime = (timestamp: string) => {
    const startTime = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const elapsed = Math.floor((now - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'joined': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'declined': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isVisible || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => {
        const startedByMember = teamMembers.find(m => m.id === notification.startedBy);
        const isStartedByCurrentUser = notification.startedBy === currentUserId;
        const currentUserParticipant = notification.participants.find(p => p.userId === currentUserId);
        const hasJoined = currentUserParticipant?.status === 'joined';
        const joinedCount = notification.participants.filter(p => p.status === 'joined').length;
        const pendingCount = notification.participants.filter(p => p.status === 'pending').length;

        return (
          <Card 
            key={notification.id} 
            className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300 shadow-lg"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      {notification.type === 'video' ? (
                        <Video className="h-6 w-6 text-white" />
                      ) : (
                        <Phone className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <Bell className="h-2 w-2 text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-gray-300">
                        Started by {startedByMember?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.startedAt)}
                        </span>
                        <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          Live
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(notification.id)}
                      className="text-gray-400 hover:text-white h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Participants Status */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-300">
                        {joinedCount} joined, {pendingCount} pending
                      </span>
                    </div>
                    
                    <div className="flex -space-x-2">
                      {notification.participants.slice(0, 5).map((participant) => {
                        const member = teamMembers.find(m => m.id === participant.userId);
                        return (
                          <div key={participant.userId} className="relative">
                            <Avatar className="h-6 w-6 border-2 border-black">
                              <AvatarFallback className="bg-gray-600 text-white text-xs">
                                {member?.name.split(' ').map(n => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-black ${getStatusColor(participant.status)}`} />
                          </div>
                        );
                      })}
                      {notification.participants.length > 5 && (
                        <div className="h-6 w-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-black">
                          +{notification.participants.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!hasJoined && !isStartedByCurrentUser && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleJoin(notification)}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Join Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecline(notification)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    
                    {hasJoined && (
                      <Button
                        size="sm"
                        onClick={() => handleJoin(notification)}
                        className="bg-blue-600 hover:bg-blue-700 flex-1"
                      >
                        <Video className="h-3 w-3 mr-1" />
                        Rejoin
                      </Button>
                    )}
                    
                    {isStartedByCurrentUser && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEnd(notification)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        End Meeting
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MeetingNotificationSystem;
