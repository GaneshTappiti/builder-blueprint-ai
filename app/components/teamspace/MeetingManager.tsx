"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Video, 
  Phone, 
  Users, 
  Clock, 
  Calendar,
  Plus,
  Settings,
  Mic,
  MicOff,
  VideoOff,
  ScreenShare,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
}

interface ActiveMeeting {
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
    isMuted?: boolean;
    isVideoOff?: boolean;
  }[];
  meetingLink?: string;
  isScreenSharing?: boolean;
  screenSharer?: string;
}

interface MeetingManagerProps {
  teamMembers: TeamMember[];
  currentUserId: string;
  onStartMeeting: (meeting: Omit<ActiveMeeting, 'id' | 'startedAt'>) => void;
  onEndMeeting: (meetingId: string) => void;
  onJoinMeeting: (meetingId: string) => void;
  onLeaveMeeting: (meetingId: string) => void;
  onToggleMute: (meetingId: string) => void;
  onToggleVideo: (meetingId: string) => void;
  onToggleScreenShare: (meetingId: string) => void;
}

const MeetingManager: React.FC<MeetingManagerProps> = ({
  teamMembers,
  currentUserId,
  onStartMeeting,
  onEndMeeting,
  onJoinMeeting,
  onLeaveMeeting,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare
}) => {
  const { toast } = useToast();
  const [activeMeetings, setActiveMeetings] = useState<ActiveMeeting[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const currentUser = teamMembers.find(member => member.id === currentUserId);
  const onlineMembers = teamMembers.filter(member => member.status === 'online');

  const handleStartInstantMeeting = (type: 'video' | 'audio') => {
    const meeting: Omit<ActiveMeeting, 'id' | 'startedAt'> = {
      title: `${type === 'video' ? 'Video' : 'Audio'} Meeting`,
      type,
      startedBy: currentUserId,
      participants: onlineMembers.map(member => ({
        userId: member.id,
        name: member.name,
        status: member.id === currentUserId ? 'joined' : 'pending'
      })),
      meetingLink: `https://meet.example.com/${Date.now()}`
    };

    onStartMeeting(meeting);
    
    toast({
      title: "Meeting started",
      description: `Your ${type} meeting has been started. Team members will be notified.`,
    });
  };

  const handleJoinMeeting = (meetingId: string) => {
    setActiveMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId 
        ? {
            ...meeting,
            participants: meeting.participants.map(p => 
              p.userId === currentUserId 
                ? { ...p, status: 'joined' as const, joinedAt: new Date().toISOString() }
                : p
            )
          }
        : meeting
    ));
    
    onJoinMeeting(meetingId);
  };

  const handleLeaveMeeting = (meetingId: string) => {
    setActiveMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId 
        ? {
            ...meeting,
            participants: meeting.participants.map(p => 
              p.userId === currentUserId 
                ? { ...p, status: 'pending' as const }
                : p
            )
          }
        : meeting
    ));
    
    onLeaveMeeting(meetingId);
  };

  const handleEndMeeting = (meetingId: string) => {
    setActiveMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
    onEndMeeting(meetingId);
  };

  const handleToggleMute = (meetingId: string) => {
    setIsMuted(!isMuted);
    onToggleMute(meetingId);
  };

  const handleToggleVideo = (meetingId: string) => {
    setIsVideoOff(!isVideoOff);
    onToggleVideo(meetingId);
  };

  const handleToggleScreenShare = (meetingId: string) => {
    setIsScreenSharing(!isScreenSharing);
    onToggleScreenShare(meetingId);
  };

  const formatTime = (startedAt: string) => {
    const startTime = new Date(startedAt).getTime();
    const now = new Date().getTime();
    const elapsed = Math.floor((now - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getParticipantStatus = (participant: ActiveMeeting['participants'][0]) => {
    switch (participant.status) {
      case 'joined':
        return { color: 'bg-green-500', icon: CheckCircle, text: 'Joined' };
      case 'pending':
        return { color: 'bg-yellow-500', icon: Clock, text: 'Pending' };
      case 'declined':
        return { color: 'bg-red-500', icon: X, text: 'Declined' };
      default:
        return { color: 'bg-gray-500', icon: AlertCircle, text: 'Unknown' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Start Meeting Section */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="h-5 w-5" />
            Start Instant Meeting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              onClick={() => handleStartInstantMeeting('video')}
              className="bg-blue-600 hover:bg-blue-700 flex-1"
            >
              <Video className="h-4 w-4 mr-2" />
              Start Video Call
            </Button>
            <Button
              onClick={() => handleStartInstantMeeting('audio')}
              className="bg-green-600 hover:bg-green-700 flex-1"
            >
              <Phone className="h-4 w-4 mr-2" />
              Start Audio Call
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Online team members will receive instant notifications
          </p>
        </CardContent>
      </Card>

      {/* Active Meetings */}
      {activeMeetings.length > 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeMeetings.map((meeting) => {
              const isStartedByCurrentUser = meeting.startedBy === currentUserId;
              const currentUserParticipant = meeting.participants.find(p => p.userId === currentUserId);
              const hasJoined = currentUserParticipant?.status === 'joined';
              const joinedCount = meeting.participants.filter(p => p.status === 'joined').length;
              const pendingCount = meeting.participants.filter(p => p.status === 'pending').length;

              return (
                <div key={meeting.id} className="p-4 rounded-lg bg-black/20 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        {meeting.type === 'video' ? (
                          <Video className="h-5 w-5 text-white" />
                        ) : (
                          <Phone className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{meeting.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(meeting.startedAt)}</span>
                          <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                            Live
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {joinedCount} joined, {pendingCount} pending
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-black/80 border-white/10">
                          <DropdownMenuItem onClick={() => handleEndMeeting(meeting.id)}>
                            <X className="h-4 w-4 mr-2" />
                            End Meeting
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="mb-4">
                    <div className="flex -space-x-2 mb-2">
                      {meeting.participants.map((participant) => {
                        const member = teamMembers.find(m => m.id === participant.userId);
                        const status = getParticipantStatus(participant);
                        const StatusIcon = status.icon;
                        
                        return (
                          <div key={participant.userId} className="relative group">
                            <Avatar className="h-8 w-8 border-2 border-black">
                              <AvatarFallback className="bg-gray-600 text-white text-xs">
                                {member?.name.split(' ').map(n => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-black ${status.color}`} />
                            
                            {/* Participant Info Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              <div className="flex items-center gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {participant.name} - {status.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Meeting Controls */}
                  <div className="flex items-center gap-2">
                    {hasJoined ? (
                      <>
                        <Button
                          size="sm"
                          variant={isMuted ? "destructive" : "outline"}
                          onClick={() => handleToggleMute(meeting.id)}
                          className="border-white/10"
                        >
                          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant={isVideoOff ? "destructive" : "outline"}
                          onClick={() => handleToggleVideo(meeting.id)}
                          className="border-white/10"
                        >
                          {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant={isScreenSharing ? "default" : "outline"}
                          onClick={() => handleToggleScreenShare(meeting.id)}
                          className="border-white/10"
                        >
                          <ScreenShare className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLeaveMeeting(meeting.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 ml-auto"
                        >
                          Leave
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleJoinMeeting(meeting.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeetingManager;
