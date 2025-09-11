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
  Shield
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
import MeetingNotificationSystem from "@/components/teamspace/MeetingNotificationSystem";
import TeamMemberManagement from "@/components/teamspace/TeamMemberManagement";
import DepartmentManagement from "@/components/teamspace/DepartmentManagement";
import RolePermissionsManagement from "@/components/teamspace/RolePermissionsManagement";
import TeamSettings from "@/components/teamspace/TeamSettings";
import TeamManagementErrorBoundary from "@/components/teamspace/TeamManagementErrorBoundary";
import TeamManagementTest from "@/components/teamspace/TeamManagementTest";
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
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
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
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string;
  tags: string[];
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Chat states
  const [chatMode, setChatMode] = useState<'group' | 'individual' | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [currentUserId] = useState('1'); // Mock current user ID

  // Mock data - in production, this would come from your database
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@startup.com",
      role: DEFAULT_ROLES.find(r => r.id === 'admin')!,
      department: DEFAULT_DEPARTMENTS.find(d => d.name === 'Product') || DEFAULT_DEPARTMENTS[0],
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
      department: DEFAULT_DEPARTMENTS.find(d => d.name === 'Engineering') || DEFAULT_DEPARTMENTS[0],
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
      department: DEFAULT_DEPARTMENTS.find(d => d.name === 'Design') || DEFAULT_DEPARTMENTS[0],
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
      department: memberData.department || DEFAULT_DEPARTMENTS[0],
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
    toast({
      title: "Video call ended",
      description: "The video call has been ended.",
    });
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
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Link
                  href="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
              <Button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 workspace-content-spacing">
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
                      variant="outline"
                      className="bg-black/20 border-white/10 hover:bg-black/30 h-16 text-left justify-start"
                      onClick={handleStartGroupChat}
                    >
                      <MessageSquare className="h-6 w-6 mr-3 text-blue-400" />
                      <div>
                        <div className="font-medium text-white">Team Chat</div>
                        <div className="text-sm text-gray-400">Group messaging</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="bg-black/20 border-white/10 hover:bg-black/30 h-16 text-left justify-start"
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
                  teamMembers={teamMembers}
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
                   </div>

                   {/* Two Session Tabs */}
                   <Tabs value={chatMode || 'group'} onValueChange={(value) => {
                     if (value === 'group') {
                       setChatMode('group');
                     } else if (value === 'individual') {
                       setChatMode('individual');
                     }
                   }} className="space-y-4">
                     <TabsList className="bg-black/40 backdrop-blur-sm border-white/10">
                       <TabsTrigger value="group" className="data-[state=active]:bg-green-600">
                         <MessageSquare className="h-4 w-4 mr-2" />
                         Team Chat
                       </TabsTrigger>
                       <TabsTrigger value="individual" className="data-[state=active]:bg-green-600">
                         <Users className="h-4 w-4 mr-2" />
                         Private Chats
                       </TabsTrigger>
                     </TabsList>

                     {/* Team Chat Session */}
                     <TabsContent value="group" className="space-y-4">
                       <GroupChat
                         teamMembers={teamMembers}
                         currentUserId={currentUserId}
                         onSendMessage={handleSendGroupMessage}
                         onStartCall={handleStartCall}
                       />
                     </TabsContent>

                     {/* Individual Chats Session */}
                     <TabsContent value="individual" className="space-y-4">
                       {selectedMember ? (
                         <IndividualChat
                           member={selectedMember}
                           currentUserId={currentUserId}
                           onSendMessage={handleSendPrivateMessage}
                           onStartCall={handleStartCall}
                           onBack={() => setSelectedMember(null)}
                           isAdmin={false} // You can determine this based on user role
                         />
                       ) : (
                         <div className="space-y-6">
                           {/* Team Members List for Private Chat */}
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {teamMembers.map((member) => (
                               <Card 
                                 key={member.id} 
                                 className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors cursor-pointer"
                                 onClick={() => setSelectedMember(member)}
                               >
                                 <CardContent className="p-4">
                                   <div className="flex items-center gap-3">
                                     <div className="relative">
                                       <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                         <span className="text-white font-medium">
                                           {member.name.split(' ').map(n => n[0]).join('')}
                                         </span>
                                       </div>
                                       <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${
                                         member.status === 'online' ? 'bg-green-500' : 
                                         member.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                                       }`} />
                                     </div>
                                     <div className="flex-1">
                                       <h4 className="font-medium text-white">{member.name}</h4>
                                       <p className="text-sm text-gray-400">{member.role.displayName}</p>
                                       <p className="text-xs text-gray-500 capitalize">{member.status}</p>
                                     </div>
                                     <MessageSquare className="h-5 w-5 text-gray-400" />
                                   </div>
                                 </CardContent>
                               </Card>
                             ))}
                           </div>
                         </div>
                       )}
                     </TabsContent>
                   </Tabs>
                 </div>
               </TabsContent>

              <TabsContent value="meetings">
                <MeetingsList 
                  meetings={meetings} 
                  onScheduleMeeting={setMeetings}
                  teamMembers={teamMembers}
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
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg p-6 max-w-4xl w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Team Video Call</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEndVideoCall}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Video Grid Placeholder */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {teamMembers.filter(m => m.status === 'online').map((member) => (
                  <div key={member.id} className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-medium">{member.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <p className="text-white text-sm">{member.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Video Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="bg-black/20 border-white/10"
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <Button
                  variant={isVideoOff ? "destructive" : "outline"}
                  size="icon"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className="bg-black/20 border-white/10"
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>

                <Button
                  variant={isScreenSharing ? "default" : "outline"}
                  size="icon"
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className="bg-black/20 border-white/10"
                >
                  <ScreenShare className="h-5 w-5" />
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleEndVideoCall}
                  className="px-6"
                >
                  End Call
                </Button>
              </div>
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
      </main>
    </div>
  );
}

export default function TeamSpacePage() {
  return (
    <TeamManagementProvider>
      <TeamSpacePageContent />
    </TeamManagementProvider>
  );
}
