"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  ChevronLeft,
  Menu,
  X,
  Video,
  Phone,
  MessageSquare,
  Calendar,
  Settings,
  Monitor,
  Mic,
  MicOff,
  VideoOff,
  Volume2,
  VolumeX,
  ScreenShare,
  MoreHorizontal,
  Clock,
  Target,
  Zap,
  Brain,
  FileText,
  CheckCircle2,
  AlertCircle,
  Star,
  Building,
  Shield,
  Search,
  BarChart3,
  Paperclip,
  Send,
  Hash
} from "lucide-react";
import Link from "next/link";
import TeamMemberCard from "@/components/teamspace/TeamMemberCard";
import AddTeamMemberModal from "@/components/teamspace/AddTeamMemberModal";
import TeamRoles from "@/components/teamspace/TeamRoles";
import TaskList from "@/components/teamspace/TaskList";
import MessagesPanel from "@/components/teamspace/MessagesPanel";
import MeetingsList from "@/components/teamspace/MeetingsList";
import GroupChat from "@/components/teamspace/GroupChat";
import IndividualChat from "@/components/teamspace/IndividualChat";
import EnhancedIndividualChat from "@/components/teamspace/EnhancedIndividualChat";
import ChannelManagement from "@/components/teamspace/ChannelManagement";
import MeetingNotificationSystem from "@/components/teamspace/MeetingNotificationSystem";
import TeamMemberManagement from "@/components/teamspace/TeamMemberManagement";
import DepartmentManagement from "@/components/teamspace/DepartmentManagement";
import RolePermissionsManagement from "@/components/teamspace/RolePermissionsManagement";
import TeamSettings from "@/components/teamspace/TeamSettings";
import TeamManagementErrorBoundary from "@/components/teamspace/TeamManagementErrorBoundary";
import TeamManagementTest from "@/components/teamspace/TeamManagementTest";
import JitsiVideoCall from "@/components/teamspace/JitsiVideoCall";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { TeamManagementProvider } from "@/contexts/TeamManagementContext";
import { ChatProvider, useChat } from "@/contexts/ChatContext";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import ChannelManager from "@/components/teamspace/ChannelManager";
import MessageSearch from "@/components/teamspace/MessageSearch";
import FileUpload from "@/components/teamspace/FileUpload";
import { SlackStyleSidebar } from "@/components/teamspace/SlackStyleSidebar";
import { MessageThread } from "@/components/teamspace/MessageThread";
import { AdvancedSearch } from "@/components/teamspace/AdvancedSearch";
import { VoiceMessage } from "@/components/teamspace/VoiceMessage";
import { ChatMetrics } from "@/components/admin/ChatMetrics";
import { TeamMember, TeamRole, Department, DEFAULT_ROLES, DEFAULT_DEPARTMENTS } from "@/types/teamManagement";
import { supabase } from "@/lib/supabase";


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

interface Task {
  id: number;
  title: string;
  description: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string;
  tags?: string[];
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'system' | 'voice';
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  readBy?: string[];
  isEdited?: boolean;
}

interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'voice' | 'system';
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  mentions?: string[];
  readBy: {
    userId: string;
    readAt: string;
  }[];
  isEdited?: boolean;
  editedAt?: string;
}

interface PrivateMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'voice' | 'system';
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  readBy: {
    userId: string;
    readAt: string;
  }[];
  isEdited?: boolean;
  editedAt?: string;
  isEncrypted?: boolean;
}

function TeamSpacePageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, isMember, isViewer, canManageMembers, canInviteMembers } = useTeamPermissions();
  const { channels, messages: chatMessages, sendMessage, createChannel, joinChannel, leaveChannel } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [currentRoomName, setCurrentRoomName] = useState('');
  
  // Chat states
  const [chatMode, setChatMode] = useState<'group' | 'individual' | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [currentUserId] = useState('1'); // Mock current user ID
  
  // New UI states
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showVoiceMessage, setShowVoiceMessage] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Mock data - in production, this would come from your database
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@startup.com",
      role: DEFAULT_ROLES.find(r => r.id === 'admin')!,
      department: {
        ...(DEFAULT_DEPARTMENTS.find(d => d.name === 'Product') || DEFAULT_DEPARTMENTS[0]),
        id: 'product-dept',
        memberCount: 0,
        createdBy: 'system',
        createdAt: new Date().toISOString()
      },
      avatar: "/api/placeholder/40/40",
      status: 'online',
      joinedAt: "2024-01-15",
      lastActive: "2024-01-20T10:30:00Z",
      skills: ["Product Strategy", "User Research", "Agile"],
      currentTask: "Define MVP features",
      tasksCompleted: 12,
      totalTasks: 15,
      permissions: DEFAULT_ROLES.find(r => r.id === 'admin')!.permissions,
      isActive: true,
      invitationStatus: 'accepted'
    },
    {
      id: "2",
      name: "Sarah Chen",
      email: "sarah@startup.com",
      role: DEFAULT_ROLES.find(r => r.id === 'member')!,
      department: {
        ...(DEFAULT_DEPARTMENTS.find(d => d.name === 'Engineering') || DEFAULT_DEPARTMENTS[0]),
        id: 'engineering-dept',
        memberCount: 0,
        createdBy: 'system',
        createdAt: new Date().toISOString()
      },
      avatar: "/api/placeholder/40/40",
      status: 'online',
      joinedAt: "2024-01-10",
      lastActive: "2024-01-20T11:15:00Z",
      skills: ["React", "Node.js", "AWS"],
      currentTask: "Backend API development",
      tasksCompleted: 8,
      totalTasks: 12,
      permissions: DEFAULT_ROLES.find(r => r.id === 'member')!.permissions,
      isActive: true,
      invitationStatus: 'accepted'
    },
    {
      id: "3",
      name: "Mike Rodriguez",
      email: "mike@startup.com",
      role: DEFAULT_ROLES.find(r => r.id === 'member')!,
      department: {
        ...(DEFAULT_DEPARTMENTS.find(d => d.name === 'Design') || DEFAULT_DEPARTMENTS[0]),
        id: 'design-dept',
        memberCount: 0,
        createdBy: 'system',
        createdAt: new Date().toISOString()
      },
      avatar: "/api/placeholder/40/40",
      status: 'busy',
      joinedAt: "2024-01-20",
      lastActive: "2024-01-20T09:45:00Z",
      skills: ["Figma", "User Testing", "Prototyping"],
      currentTask: "Mobile app wireframes",
      tasksCompleted: 5,
      totalTasks: 8,
      permissions: DEFAULT_ROLES.find(r => r.id === 'member')!.permissions,
      isActive: true,
      invitationStatus: 'accepted'
    }
  ]);

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      title: "Daily Standup",
      date: "2024-01-25",
      time: "09:00",
      duration: "30 min",
      attendees: ["Alex Johnson", "Sarah Chen", "Mike Rodriguez"],
      type: 'video',
      status: 'upcoming'
    },
    {
      id: 2,
      title: "Sprint Planning",
      date: "2024-01-26",
      time: "14:00",
      duration: "2 hours",
      attendees: ["Alex Johnson", "Sarah Chen"],
      type: 'video',
      status: 'upcoming'
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Implement user authentication",
      description: "Set up secure login and registration system",
      assignee: "Sarah Chen",
      priority: 'high',
      status: 'in-progress',
      dueDate: "2024-01-30",
      tags: ["backend", "security"]
    },
    {
      id: 2,
      title: "Design onboarding flow",
      description: "Create user-friendly onboarding experience",
      assignee: "Mike Rodriguez",
      priority: 'medium',
      status: 'todo',
      dueDate: "2024-02-05",
      tags: ["design", "ux"]
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Alex Johnson",
      content: "Great progress on the authentication system, Sarah!",
      timestamp: "10:30 AM",
      type: 'text'
    },
    {
      id: 2,
      sender: "Sarah Chen",
      content: "Thanks! Should have it ready for testing by tomorrow.",
      timestamp: "10:32 AM",
      type: 'text'
    }
  ]);

  const handleAddMember = (memberData: Partial<TeamMember>) => {
    const newMember: TeamMember = {
      id: (teamMembers.length + 1).toString(),
      name: memberData.name || '',
      email: memberData.email || '',
      role: memberData.role || DEFAULT_ROLES.find(r => r.id === 'member')!,
      department: memberData.department || {
        ...DEFAULT_DEPARTMENTS[0],
        id: 'default-dept',
        memberCount: 0,
        createdBy: 'system',
        createdAt: new Date().toISOString()
      },
      avatar: "/api/placeholder/40/40",
      status: 'offline',
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
      skills: memberData.skills || [],
      currentTask: undefined,
      tasksCompleted: 0,
      totalTasks: 0,
      permissions: memberData.role?.permissions || DEFAULT_ROLES.find(r => r.id === 'member')!.permissions,
      isActive: true,
      invitationStatus: 'accepted'
    };

    setTeamMembers([...teamMembers, newMember]);
    setIsAddMemberModalOpen(false);
    
    toast({
      title: "Team member added!",
      description: `${newMember.name} has been added to your team.`,
    });
  };

  const handleStartVideoCall = () => {
    const roomName = `team-${Date.now()}`;
    setCurrentRoomName(roomName);
    setIsVideoCallActive(true);
    toast({
      title: "Video call started",
      description: "You're now in a video call with your team.",
    });
  };

  const handleEndVideoCall = () => {
    setIsVideoCallActive(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setCurrentRoomName('');
    toast({
      title: "Video call ended",
      description: "The video call has been ended.",
    });
  };

  const handleMuteToggle = (muted: boolean) => {
    setIsMuted(muted);
  };

  const handleVideoToggle = (videoOff: boolean) => {
    setIsVideoOff(videoOff);
  };

  const handleScreenShareToggle = (sharing: boolean) => {
    setIsScreenSharing(sharing);
  };

  // Chat handling functions
  const handleStartGroupChat = () => {
    setChatMode('group');
    setActiveTab('messages');
  };

  const handleStartIndividualChat = (member: TeamMember) => {
    setSelectedMember(member);
    setChatMode('individual');
    setActiveTab('messages');
  };

  const handleBackToMessages = () => {
    setChatMode(null);
    setSelectedMember(null);
  };

  const handleSendGroupMessage = (message: GroupMessage) => {
    setGroupMessages(prev => [...prev, message]);
  };

  const handleSendPrivateMessage = (message: PrivateMessage) => {
    setPrivateMessages(prev => [...prev, message]);
  };

  const handleStartCall = (type: 'video' | 'audio', memberId?: string) => {
    if (type === 'video') {
      setIsVideoCallActive(true);
      toast({
        title: `${type === 'video' ? 'Video' : 'Audio'} call started`,
        description: memberId 
          ? `Calling ${teamMembers.find(m => m.id === memberId)?.name}...`
          : "Starting team call...",
      });
    } else {
      toast({
        title: "Audio call started",
        description: memberId 
          ? `Calling ${teamMembers.find(m => m.id === memberId)?.name}...`
          : "Starting team audio call...",
      });
    }
  };

  const handleJoinMeeting = (meetingId: number) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting?.meetingLink) {
      window.open(meeting.meetingLink, '_blank');
    }
    toast({
      title: "Joining meeting",
      description: `Joining ${meeting?.title}...`,
    });
  };

  const handleStartInstantMeeting = (type: 'video' | 'audio') => {
    // This will be handled by the MeetingsList component
    toast({
      title: "Starting instant meeting",
      description: `Starting ${type} meeting...`,
    });
  };

  const handleEndMeeting = (meetingId: number) => {
    setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
    toast({
      title: "Meeting ended",
      description: "The meeting has been ended.",
    });
  };

  const handleToggleMute = (meetingId: number) => {
    // Handle mute toggle
    toast({
      title: "Microphone toggled",
      description: "Microphone status changed.",
    });
  };

  const handleToggleVideo = (meetingId: number) => {
    // Handle video toggle
    toast({
      title: "Video toggled",
      description: "Video status changed.",
    });
  };

  const handleToggleScreenShare = (meetingId: number) => {
    // Handle screen share toggle
    toast({
      title: "Screen sharing toggled",
      description: "Screen sharing status changed.",
    });
  };

  const handleDeclineMeeting = (meetingId: number) => {
    // Handle meeting decline
    toast({
      title: "Meeting declined",
      description: "You declined the meeting invitation.",
    });
  };

  const handleDismissNotification = (notificationId: string) => {
    // Handle notification dismissal
    console.log('Notification dismissed:', notificationId);
  };

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  className="text-gray-400 hover:text-white hover:bg-black/30 mobile-touch-target"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Link
                  href="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mobile-touch-target"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Workspace</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </div>
              <Button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 mobile-touch-target text-xs sm:text-sm"
                size="sm"
              >
                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Member</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-3 sm:px-6 py-4 sm:py-8 workspace-content-spacing">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">TeamSpace</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Collaborate with your team, manage tasks, and stay connected
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-black/40 backdrop-blur-sm border-white/10">
                <TabsTrigger value="overview" className="data-[state=active]:bg-green-600">
                  <Users className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="members" className="data-[state=active]:bg-green-600">
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="departments" className="data-[state=active]:bg-green-600">
                  <Building className="h-4 w-4 mr-2" />
                  Departments
                </TabsTrigger>
                <TabsTrigger value="roles" className="data-[state=active]:bg-green-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Roles
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="messages" className="data-[state=active]:bg-green-600">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="channels" className="data-[state=active]:bg-green-600">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Channels
                </TabsTrigger>
                <TabsTrigger value="meetings" className="data-[state=active]:bg-green-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Meetings
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-green-600">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                {/* System Test */}
                <TeamManagementTest />
                
                {/* Team Members Grid */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Team Members</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map((member) => (
                      <TeamMemberCard 
                        key={member.id} 
                        member={member} 
                        onMessage={(memberId) => {
                          const member = teamMembers.find(m => m.id === memberId);
                          if (member) handleStartIndividualChat(member);
                        }}
                        onEmail={(memberId) => {
                          const member = teamMembers.find(m => m.id === memberId);
                          if (member) {
                            window.open(`mailto:${member.email}`, '_blank');
                            toast({
                              title: "Opening email",
                              description: `Opening email client for ${member.name}`,
                            });
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      onClick={handleStartVideoCall}
                      className="bg-green-600 hover:bg-green-700 h-16 text-left justify-start"
                    >
                      <Video className="h-6 w-6 mr-3" />
                      <div>
                        <div className="font-medium">Start Video Call</div>
                        <div className="text-sm opacity-80">Connect with your team</div>
                      </div>
                    </Button>

                    <Button
                      className="bg-black/20 border border-white/10 hover:bg-black/30 h-16 text-left justify-start"
                      onClick={handleStartGroupChat}
                    >
                      <MessageSquare className="h-6 w-6 mr-3 text-blue-400" />
                      <div>
                        <div className="font-medium text-white">Team Chat</div>
                        <div className="text-sm text-gray-400">Group messaging</div>
                      </div>
                    </Button>

                    <Button
                      className="bg-black/20 border border-white/10 hover:bg-black/30 h-16 text-left justify-start"
                      onClick={() => setActiveTab('tasks')}
                    >
                      <Target className="h-6 w-6 mr-3 text-purple-400" />
                      <div>
                        <div className="font-medium text-white">Assign Task</div>
                        <div className="text-sm text-gray-400">Create new task</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="members">
                <TeamMemberManagement />
              </TabsContent>

              <TabsContent value="departments">
                <DepartmentManagement />
              </TabsContent>

              <TabsContent value="roles">
                <RolePermissionsManagement />
              </TabsContent>

              <TabsContent value="tasks">
                <TaskList
                  tasks={tasks}
                  onTaskUpdate={setTasks}
                  teamMembers={teamMembers.map(member => ({
                    id: member.id,
                    name: member.name,
                    role: member.role.displayName
                  }))}
                  currentUserId={currentUserId}
                />
              </TabsContent>

               <TabsContent value="messages">
                 <div className="space-y-6">
                   {/* Messages Header */}
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="text-2xl font-bold text-white">Messages</h3>
                       <p className="text-gray-400">Communicate with your team</p>
                     </div>
                     <div className="flex items-center space-x-2">
                       <Button
                         onClick={() => setShowAdvancedSearch(true)}
                         className="border border-gray-600 text-gray-300 hover:bg-gray-700"
                       >
                         <Search className="h-4 w-4 mr-2" />
                         Advanced Search
                       </Button>
                       <Button
                         onClick={() => setShowMetrics(true)}
                         className="border border-gray-600 text-gray-300 hover:bg-gray-700"
                       >
                         <BarChart3 className="h-4 w-4 mr-2" />
                         Metrics
                       </Button>
                     </div>
                   </div>

                   {/* Enhanced Chat Layout with Slack-style Sidebar */}
                   <div className="flex h-[600px] bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                     {/* Slack-style Sidebar */}
                     <SlackStyleSidebar
                       onChannelSelect={(channel: any) => {
                         setSelectedChannel(channel);
                         setChatMode('group');
                       }}
                       onDirectMessageSelect={(member: any) => {
                         setSelectedMember(member);
                         setChatMode('individual');
                       }}
                       onStartCall={handleStartCall}
                       className="w-64 flex-shrink-0"
                     />

                     {/* Main Chat Area */}
                     <div className="flex-1 flex flex-col">
                       {chatMode === 'group' ? (
                         <div className="flex-1 flex flex-col">
                           {/* Channel Header */}
                           {selectedChannel && (
                             <div className="p-4 border-b border-gray-700 bg-gray-800">
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center space-x-3">
                                   <Hash className="h-5 w-5 text-gray-400" />
                                   <h4 className="text-white font-medium">{selectedChannel.name}</h4>
                                   <Badge className="bg-green-900 text-green-400">
                                     {selectedChannel.type}
                                   </Badge>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                   <Button
                                     onClick={() => setShowVoiceMessage(true)}
                                     className="text-gray-400 hover:text-white"
                                   >
                                     <Mic className="h-4 w-4" />
                                   </Button>
                                   <Button
                                     onClick={() => setShowAdvancedSearch(true)}
                                     className="text-gray-400 hover:text-white"
                                   >
                                     <Search className="h-4 w-4" />
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           )}
                           
                           {/* Messages Area */}
                           <div className="flex-1 overflow-y-auto p-4">
                             <GroupChat
                               teamMembers={teamMembers}
                               onStartCall={handleStartCall}
                             />
                           </div>
                           
                           {/* Message Input Area */}
                           <div className="p-4 border-t border-gray-700 bg-gray-800">
                             <div className="flex items-center space-x-2">
                               <Button
                                 onClick={() => setShowVoiceMessage(true)}
                                 className="text-gray-400 hover:text-white"
                               >
                                 <Mic className="h-4 w-4" />
                               </Button>
                               <Input
                                 placeholder="Type a message..."
                                 className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                               />
                               <Button
                                 className="text-gray-400 hover:text-white"
                               >
                                 <Paperclip className="h-4 w-4" />
                               </Button>
                               <Button
                                 className="bg-green-600 hover:bg-green-700"
                               >
                                 <Send className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                         </div>
                       ) : chatMode === 'individual' ? (
                         <div className="flex-1 flex flex-col">
                           {selectedMember ? (
                             <IndividualChat
                               member={selectedMember}
                               onStartCall={handleStartCall}
                               onBack={() => setSelectedMember(null)}
                               isAdmin={false}
                               className="flex-1"
                             />
                           ) : (
                             <div className="flex-1 flex items-center justify-center">
                               <div className="text-center">
                                 <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                 <h3 className="text-lg font-medium text-white mb-2">Select a team member</h3>
                                 <p className="text-gray-400">Choose someone to start a private conversation</p>
                               </div>
                             </div>
                           )}
                         </div>
                       ) : (
                         <div className="flex-1 flex items-center justify-center">
                           <div className="text-center">
                             <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                             <h3 className="text-lg font-medium text-white mb-2">Welcome to Messages</h3>
                             <p className="text-gray-400">Select a channel or team member to start chatting</p>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               </TabsContent>

              <TabsContent value="channels">
                <ChannelManagement 
                  teamMembers={teamMembers}
                  onChannelSelect={(channel) => {
                    console.log('Selected channel:', channel);
                    // Handle channel selection - could switch to messages tab with specific channel
                  }}
                />
              </TabsContent>

              <TabsContent value="meetings">
                <MeetingsList 
                  meetings={meetings} 
                  onScheduleMeeting={setMeetings}
                  teamMembers={teamMembers.map(member => ({
                    id: member.id,
                    name: member.name,
                    role: member.role.displayName
                  }))}
                  onJoinMeeting={handleJoinMeeting}
                  onStartInstantMeeting={handleStartInstantMeeting}
                  onEndMeeting={handleEndMeeting}
                  onToggleMute={handleToggleMute}
                  onToggleVideo={handleToggleVideo}
                  onToggleScreenShare={handleToggleScreenShare}
                  currentUserId={currentUserId}
                />
              </TabsContent>

              <TabsContent value="settings">
                <TeamSettings />
              </TabsContent>

            </Tabs>
          </div>
        </div>

        {/* Video Call Overlay */}
        {isVideoCallActive && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="max-w-6xl w-full mx-4">
              <JitsiVideoCall
                roomName={currentRoomName}
                displayName={user?.name || 'User'}
                isActive={isVideoCallActive}
                onEndCall={handleEndVideoCall}
                onMuteToggle={handleMuteToggle}
                onVideoToggle={handleVideoToggle}
                onScreenShareToggle={handleScreenShareToggle}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Add Team Member Modal */}
        <AddTeamMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          onAddMember={handleAddMember}
        />

        {/* Meeting Notification System */}
        <MeetingNotificationSystem
          teamMembers={teamMembers}
          currentUserId={currentUserId}
          onJoinMeeting={handleJoinMeeting}
          onDeclineMeeting={handleDeclineMeeting}
          onEndMeeting={handleEndMeeting}
          onDismissNotification={handleDismissNotification}
        />

        {/* Advanced Search Modal */}
        {showAdvancedSearch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <AdvancedSearch
                onResultSelect={(message: any) => {
                  console.log('Selected message:', message);
                  setSearchResults([message]);
                }}
                onClose={() => setShowAdvancedSearch(false)}
                className="h-full"
              />
            </div>
          </div>
        )}

        {/* Voice Message Modal */}
        {showVoiceMessage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-md">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Record Voice Message</h3>
                  <Button
                    onClick={() => setShowVoiceMessage(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <VoiceMessage
                  onSend={(audioBlob: any) => {
                    console.log('Voice message recorded:', audioBlob);
                    setShowVoiceMessage(false);
                    // Handle sending voice message
                  }}
                  onCancel={() => setShowVoiceMessage(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Metrics Modal */}
        {showMetrics && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Chat Performance Metrics</h3>
                  <Button
                    onClick={() => setShowMetrics(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <ChatMetrics />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TeamSpacePage() {
  return (
    <TeamManagementProvider>
      <ChatProvider>
        <TeamManagementErrorBoundary>
          <TeamSpacePageContent />
        </TeamManagementErrorBoundary>
      </ChatProvider>
    </TeamManagementProvider>
  );
}
