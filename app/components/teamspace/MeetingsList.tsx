"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Video, Users, Plus, Edit, Trash2, Play, Bell, Mic, MicOff, VideoOff, ScreenShare, CheckCircle, AlertCircle, X, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  type: 'video' | 'audio' | 'screen-share';
  status: 'upcoming' | 'ongoing' | 'completed';
  description?: string;
  meetingLink?: string;
  startedBy?: string;
  startedAt?: string;
  participants?: {
    userId: string;
    name: string;
    status: 'joined' | 'pending' | 'declined';
    joinedAt?: string;
    isMuted?: boolean;
    isVideoOff?: boolean;
  }[];
  isInstant?: boolean;
  agenda?: string[];
  linkedTasks?: number[];
}

interface MeetingsListProps {
  meetings: Meeting[];
  onScheduleMeeting: (meetings: Meeting[]) => void;
  teamMembers?: Array<{ id: string; name: string; role: string }>;
  onJoinMeeting?: (meetingId: number) => void;
  onStartInstantMeeting?: (type: 'video' | 'audio') => void;
  onEndMeeting?: (meetingId: number) => void;
  onToggleMute?: (meetingId: number) => void;
  onToggleVideo?: (meetingId: number) => void;
  onToggleScreenShare?: (meetingId: number) => void;
  currentUserId?: string;
}

const MeetingsList: React.FC<MeetingsListProps> = ({ 
  meetings, 
  onScheduleMeeting, 
  teamMembers = [],
  onJoinMeeting,
  onStartInstantMeeting,
  onEndMeeting,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  currentUserId = '1'
}) => {
  const { toast } = useToast();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '30',
    type: 'video' as 'video' | 'audio' | 'screen-share',
    attendees: [] as string[],
    agenda: [] as string[],
    linkedTasks: [] as number[]
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const handleScheduleMeeting = () => {
    if (!newMeeting.title.trim() || !newMeeting.date || !newMeeting.time) {
      toast({
        title: "Missing information",
        description: "Please fill in the title, date, and time fields.",
        variant: "destructive"
      });
      return;
    }

    const meeting: Meeting = {
      id: Date.now(),
      title: newMeeting.title,
      description: newMeeting.description,
      date: newMeeting.date,
      time: newMeeting.time,
      duration: `${newMeeting.duration} min`,
      attendees: newMeeting.attendees,
      type: newMeeting.type,
      status: 'upcoming',
      meetingLink: `https://meet.example.com/${Date.now()}`
    };

    onScheduleMeeting([...meetings, meeting]);
    setIsScheduleOpen(false);
    setNewMeeting({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '30',
      type: 'video',
      attendees: [],
      agenda: [],
      linkedTasks: []
    });

    toast({
      title: "Meeting scheduled",
      description: `${meeting.title} has been scheduled for ${new Date(meeting.date).toLocaleDateString()}.`,
    });
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setNewMeeting({
      title: meeting.title,
      description: meeting.description || '',
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration.replace(' min', ''),
      type: meeting.type,
      attendees: meeting.attendees,
      agenda: meeting.agenda || [],
      linkedTasks: meeting.linkedTasks || []
    });
    setIsScheduleOpen(true);
  };

  const handleUpdateMeeting = () => {
    if (!editingMeeting || !newMeeting.title.trim() || !newMeeting.date || !newMeeting.time) {
      toast({
        title: "Missing information",
        description: "Please fill in the title, date, and time fields.",
        variant: "destructive"
      });
      return;
    }

    const updatedMeeting: Meeting = {
      ...editingMeeting,
      title: newMeeting.title,
      description: newMeeting.description,
      date: newMeeting.date,
      time: newMeeting.time,
      duration: `${newMeeting.duration} min`,
      attendees: newMeeting.attendees,
      type: newMeeting.type
    };

    onScheduleMeeting(meetings.map(meeting => 
      meeting.id === editingMeeting.id ? updatedMeeting : meeting
    ));
    setIsScheduleOpen(false);
    setEditingMeeting(null);
    setNewMeeting({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '30',
      type: 'video',
      attendees: [],
      agenda: [],
      linkedTasks: []
    });

    toast({
      title: "Meeting updated",
      description: `${updatedMeeting.title} has been updated.`,
    });
  };

  const handleDeleteMeeting = (meetingId: number) => {
    onScheduleMeeting(meetings.filter(meeting => meeting.id !== meetingId));
    toast({
      title: "Meeting deleted",
      description: "The meeting has been removed.",
    });
  };

  const toggleAttendee = (memberName: string) => {
    setNewMeeting(prev => ({
      ...prev,
      attendees: prev.attendees.includes(memberName)
        ? prev.attendees.filter(name => name !== memberName)
        : [...prev.attendees, memberName]
    }));
  };

  const handleStartInstantMeeting = (type: 'video' | 'audio') => {
    const instantMeeting: Meeting = {
      id: Date.now(),
      title: `Instant ${type === 'video' ? 'Video' : 'Audio'} Meeting`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: 'Ongoing',
      attendees: teamMembers.map(member => member.name),
      type,
      status: 'ongoing',
      startedBy: currentUserId,
      startedAt: new Date().toISOString(),
      participants: teamMembers.map(member => ({
        userId: member.id,
        name: member.name,
        status: member.id === currentUserId ? 'joined' : 'pending'
      })),
      meetingLink: `https://meet.example.com/${Date.now()}`,
      isInstant: true
    };

    onScheduleMeeting([...meetings, instantMeeting]);
    
    toast({
      title: "Meeting started",
      description: `Your ${type} meeting has been started. Team members will be notified.`,
    });

    if (onStartInstantMeeting) {
      onStartInstantMeeting(type);
    }
  };

  const handleJoinMeeting = (meetingId: number) => {
    onScheduleMeeting(meetings.map(meeting => 
      meeting.id === meetingId 
        ? {
            ...meeting,
            participants: meeting.participants?.map(p => 
              p.userId === currentUserId 
                ? { ...p, status: 'joined' as const, joinedAt: new Date().toISOString() }
                : p
            ) || []
          }
        : meeting
    ));
    
    if (onJoinMeeting) {
      onJoinMeeting(meetingId);
    } else {
      toast({
        title: "Joining meeting",
        description: "Meeting link will be opened in a new tab.",
      });
    }
  };

  const handleEndMeeting = (meetingId: number) => {
    onScheduleMeeting(meetings.filter(meeting => meeting.id !== meetingId));
    
    if (onEndMeeting) {
      onEndMeeting(meetingId);
    }
    
    toast({
      title: "Meeting ended",
      description: "The meeting has been ended.",
    });
  };

  const handleToggleMute = (meetingId: number) => {
    setIsMuted(!isMuted);
    if (onToggleMute) {
      onToggleMute(meetingId);
    }
  };

  const handleToggleVideo = (meetingId: number) => {
    setIsVideoOff(!isVideoOff);
    if (onToggleVideo) {
      onToggleVideo(meetingId);
    }
  };

  const handleToggleScreenShare = (meetingId: number) => {
    setIsScreenSharing(!isScreenSharing);
    if (onToggleScreenShare) {
      onToggleScreenShare(meetingId);
    }
  };

  const formatTime = (startedAt: string) => {
    const startTime = new Date(startedAt).getTime();
    const now = new Date().getTime();
    const elapsed = Math.floor((now - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getParticipantStatus = (participant: NonNullable<Meeting['participants']>[0]) => {
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

  const ongoingMeetings = meetings.filter(meeting => meeting.status === 'ongoing');
  const upcomingMeetings = meetings.filter(meeting => meeting.status === 'upcoming');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'audio': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'screen-share': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      {/* Instant Meeting Section */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10 mb-4">
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

      {/* Ongoing Meetings */}
      {ongoingMeetings.length > 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border-white/10 mb-4">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-400" />
              Live Meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ongoingMeetings.map((meeting) => {
              const isStartedByCurrentUser = meeting.startedBy === currentUserId;
              const currentUserParticipant = meeting.participants?.find(p => p.userId === currentUserId);
              const hasJoined = currentUserParticipant?.status === 'joined';
              const joinedCount = meeting.participants?.filter(p => p.status === 'joined').length || 0;
              const pendingCount = meeting.participants?.filter(p => p.status === 'pending').length || 0;

              return (
                <div key={meeting.id} className="p-4 rounded-lg bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30">
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
                          <span>{meeting.startedAt ? formatTime(meeting.startedAt) : '0:00'}</span>
                          <Badge variant="outline" className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                            Live
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {joinedCount} joined, {pendingCount} pending
                      </span>
                    </div>
                  </div>

                  {/* Participants */}
                  {meeting.participants && meeting.participants.length > 0 && (
                    <div className="mb-4">
                      <div className="flex -space-x-2 mb-2">
                        {meeting.participants.slice(0, 5).map((participant) => {
                          const member = teamMembers.find(m => m.id === participant.userId);
                          const status = getParticipantStatus(participant);
                          const StatusIcon = status.icon;
                          
                          return (
                            <div key={participant.userId} className="relative group">
                              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center border-2 border-black">
                                <span className="text-white text-xs font-medium">
                                  {member?.name.split(' ').map(n => n[0]).join('') || 'U'}
                                </span>
                              </div>
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
                        {meeting.participants.length > 5 && (
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-black">
                            +{meeting.participants.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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
                          onClick={() => handleEndMeeting(meeting.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 ml-auto"
                        >
                          End Meeting
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

      {/* Scheduled Meetings */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Meetings
          </CardTitle>
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsScheduleOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No meetings scheduled yet. Schedule your first meeting!</p>
            </div>
          ) : (
            upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="p-4 rounded-lg bg-black/20 border border-white/10 hover:bg-black/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-2">{meeting.title}</h4>
                    {meeting.description && (
                      <p className="text-sm text-gray-300 mb-2">{meeting.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meeting.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(meeting.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {meeting.attendees.length} attendees
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meeting.duration}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(meeting.type)}>
                      {meeting.type}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMeeting(meeting)}
                        className="text-gray-400 hover:text-white h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleJoinMeeting(meeting.id)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Join Meeting
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-white/10 hover:bg-white/5"
                    onClick={() => {
                      if (meeting.meetingLink) {
                        window.open(meeting.meetingLink, '_blank');
                      }
                    }}
                  >
                    <Video className="h-3 w-3 mr-1" />
                    Link
                  </Button>
                </div>
                
                {meeting.attendees.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">Attendees:</p>
                    <div className="flex flex-wrap gap-1">
                      {meeting.attendees.map((attendee, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-gray-800/50 border-gray-600 text-gray-300">
                          {attendee}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Schedule Meeting Modal */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-[600px] bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Meeting Title *</Label>
              <Input
                id="title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
                placeholder="Enter meeting title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
                placeholder="Enter meeting description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-white">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-white">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-white">Duration (minutes)</Label>
                <Select value={newMeeting.duration} onValueChange={(value) => setNewMeeting(prev => ({ ...prev, duration: value }))}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10">
                    <SelectItem value="15" className="text-white hover:bg-white/10">15 min</SelectItem>
                    <SelectItem value="30" className="text-white hover:bg-white/10">30 min</SelectItem>
                    <SelectItem value="60" className="text-white hover:bg-white/10">1 hour</SelectItem>
                    <SelectItem value="90" className="text-white hover:bg-white/10">1.5 hours</SelectItem>
                    <SelectItem value="120" className="text-white hover:bg-white/10">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">Meeting Type</Label>
                <Select value={newMeeting.type} onValueChange={(value: 'video' | 'audio' | 'screen-share') => setNewMeeting(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10">
                    <SelectItem value="video" className="text-white hover:bg-white/10">Video Call</SelectItem>
                    <SelectItem value="audio" className="text-white hover:bg-white/10">Audio Call</SelectItem>
                    <SelectItem value="screen-share" className="text-white hover:bg-white/10">Screen Share</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Attendees</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`attendee-${member.id}`}
                      checked={newMeeting.attendees.includes(member.name)}
                      onChange={() => toggleAttendee(member.name)}
                      className="rounded border-white/20 bg-black/20 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor={`attendee-${member.id}`} className="text-sm text-gray-300">
                      {member.name} ({member.role})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsScheduleOpen(false);
              setEditingMeeting(null);
              setNewMeeting({
                title: '',
                description: '',
                date: '',
                time: '',
                duration: '30',
                type: 'video',
                attendees: [],
                agenda: [],
                linkedTasks: []
              });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingMeeting ? handleUpdateMeeting : handleScheduleMeeting}
              className="bg-green-600 hover:bg-green-700"
            >
              {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MeetingsList;
