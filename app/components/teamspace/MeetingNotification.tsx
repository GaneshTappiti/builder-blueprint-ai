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
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
}

interface MeetingNotificationProps {
  meeting: {
    id: string;
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
  };
  currentUserId: string;
  teamMembers: TeamMember[];
  onJoinMeeting: (meetingId: string) => void;
  onDeclineMeeting: (meetingId: string) => void;
  onEndMeeting: (meetingId: string) => void;
  onDismiss: (meetingId: string) => void;
}

const MeetingNotification: React.FC<MeetingNotificationProps> = ({
  meeting,
  currentUserId,
  teamMembers,
  onJoinMeeting,
  onDeclineMeeting,
  onEndMeeting,
  onDismiss
}) => {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const currentUser = teamMembers.find(member => member.id === currentUserId);
  const isStartedByCurrentUser = meeting.startedBy === currentUserId;
  const currentUserParticipant = meeting.participants.find(p => p.userId === currentUserId);
  const hasJoined = currentUserParticipant?.status === 'joined';

  useEffect(() => {
    const interval = setInterval(() => {
      const startTime = new Date(meeting.startedAt).getTime();
      const now = new Date().getTime();
      setTimeElapsed(Math.floor((now - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [meeting.startedAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoin = () => {
    onJoinMeeting(meeting.id);
    toast({
      title: "Joining meeting",
      description: `Joining ${meeting.title}...`,
    });
  };

  const handleDecline = () => {
    onDeclineMeeting(meeting.id);
    toast({
      title: "Meeting declined",
      description: "You declined the meeting invitation.",
    });
  };

  const handleEnd = () => {
    onEndMeeting(meeting.id);
    toast({
      title: "Meeting ended",
      description: "The meeting has been ended.",
    });
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(meeting.id), 300);
  };

  if (!isVisible) return null;

  const joinedCount = meeting.participants.filter(p => p.status === 'joined').length;
  const pendingCount = meeting.participants.filter(p => p.status === 'pending').length;

  return (
    <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {meeting.type === 'video' ? (
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
                  {meeting.title}
                </h4>
                <p className="text-xs text-gray-300">
                  Started by {teamMembers.find(m => m.id === meeting.startedBy)?.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {formatTime(timeElapsed)}
                  </span>
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                    Live
                  </Badge>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
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
                {meeting.participants.slice(0, 5).map((participant) => {
                  const member = teamMembers.find(m => m.id === participant.userId);
                  return (
                    <div key={participant.userId} className="relative">
                      <Avatar className="h-6 w-6 border-2 border-black">
                        <AvatarFallback className="bg-gray-600 text-white text-xs">
                          {member?.name.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-black ${
                        participant.status === 'joined' ? 'bg-green-500' :
                        participant.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                  );
                })}
                {meeting.participants.length > 5 && (
                  <div className="h-6 w-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-black">
                    +{meeting.participants.length - 5}
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
                    onClick={handleJoin}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Join Now
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDecline}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Decline
                  </Button>
                </>
              )}
              
              {hasJoined && (
                <Button
                  size="sm"
                  onClick={handleJoin}
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
                  onClick={handleEnd}
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
};

export default MeetingNotification;
