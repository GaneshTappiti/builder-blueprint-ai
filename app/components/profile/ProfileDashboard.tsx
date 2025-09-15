"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, ProfileViewMode } from '@/types/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Globe, 
  Linkedin, 
  Twitter, 
  Github,
  Edit,
  Settings,
  Activity,
  Award,
  Users,
  TrendingUp,
  Star,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import TeamProfileIntegration from './TeamProfileIntegration';
import IdeaVaultProfileIntegration from './IdeaVaultProfileIntegration';
import ProjectTaskProfileIntegration from './ProjectTaskProfileIntegration';
import ProfileAnalytics from './ProfileAnalytics';
import { ProfileTimeline } from './ProfileTimeline';
import { ProfileGamification } from './ProfileGamification';
import { QuickContactActions } from './QuickContactActions';
import { ProfileTrendAnalytics } from './ProfileTrendAnalytics';
import { ProfileBenchmarking } from './ProfileBenchmarking';
import { ProfileEngagementSentiment } from './ProfileEngagementSentiment';
import { ProfileGDPRExport } from './ProfileGDPRExport';
import EnhancedProfileAnalytics from './EnhancedProfileAnalytics';

interface ProfileDashboardProps {
  userId?: string;
  viewMode?: ProfileViewMode;
  className?: string;
}

export function ProfileDashboard({ 
  userId, 
  viewMode = 'self', 
  className = '' 
}: ProfileDashboardProps) {
  const { user: currentUser } = useAuth();
  const { 
    profile, 
    performance, 
    activity, 
    analytics, 
    loading, 
    error,
    updateStatus,
    refreshProfile 
  } = useProfile();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Determine if this is the current user's profile
  const isOwnProfile = !userId || userId === currentUser?.id;
  const displayProfile = profile;

  useEffect(() => {
    if (userId && userId !== currentUser?.id) {
      // Load other user's profile
      // This would need to be implemented in the ProfileService
    } else {
      refreshProfile();
    }
  }, [userId, currentUser?.id, refreshProfile]);

  if (loading && !displayProfile) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">{error}</p>
          <Button onClick={refreshProfile} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!displayProfile) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-3 w-3" />;
      case 'busy': return <AlertCircle className="h-3 w-3" />;
      case 'away': return <Clock className="h-3 w-3" />;
      default: return <Circle className="h-3 w-3" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={displayProfile.avatar_url} alt={displayProfile.name} />
                  <AvatarFallback className="text-lg">
                    {displayProfile.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background ${getStatusColor(displayProfile.status)} flex items-center justify-center`}>
                  {getStatusIcon(displayProfile.status)}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold">{displayProfile.displayName || displayProfile.name}</h1>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-2">
                  {displayProfile.jobTitle} {displayProfile.department && `• ${displayProfile.department}`}
                </p>
                
                {displayProfile.bio && (
                  <p className="text-sm text-muted-foreground mb-3">{displayProfile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {displayProfile.skills?.slice(0, 5).map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                  {displayProfile.skills && displayProfile.skills.length > 5 && (
                    <Badge variant="outline">
                      +{displayProfile.skills.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {isOwnProfile && (
              <div className="flex flex-col items-end space-y-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Profile Completion</p>
                  <Progress value={displayProfile.profileCompletion} className="w-24 h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {displayProfile.profileCompletion}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{displayProfile.email}</span>
            </div>
            
            {displayProfile.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{displayProfile.phone}</span>
              </div>
            )}
            
            {displayProfile.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{displayProfile.location}</span>
              </div>
            )}
            
            {displayProfile.timezone && (
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{displayProfile.timezone}</span>
              </div>
            )}
            
            {displayProfile.website && (
              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={displayProfile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {displayProfile.website}
                </a>
              </div>
            )}
            
            {displayProfile.linkedin && (
              <div className="flex items-center space-x-3">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={displayProfile.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}
            
            {displayProfile.github && (
              <div className="flex items-center space-x-3">
                <Github className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={displayProfile.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  GitHub Profile
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Quick Contact Actions for other users */}
          {!isOwnProfile && (
            <div className="mb-6">
              <QuickContactActions 
                userId={userId || ''} 
                userName={displayProfile.name}
                userStatus={displayProfile.status}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tasks Completed</span>
                    <span className="font-medium">{performance?.tasksCompleted || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ideas Submitted</span>
                    <span className="font-medium">{performance?.ideasSubmitted || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Projects Involved</span>
                    <span className="font-medium">{performance?.projectsInvolved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Collaborations</span>
                    <span className="font-medium">{performance?.collaborationsCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Last active: {displayProfile.lastLogin ? formatDistanceToNow(new Date(displayProfile.lastLogin), { addSuffix: true }) : 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: <span className="capitalize">{displayProfile.status}</span>
                  </p>
                  {displayProfile.availability?.statusMessage && (
                    <p className="text-sm text-muted-foreground">
                      Status: {displayProfile.availability.statusMessage}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Team Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Team Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {displayProfile.teamMember && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Role</span>
                        <span className="font-medium">{displayProfile.teamMember.role?.displayName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Department</span>
                        <span className="font-medium">{displayProfile.teamMember.department?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Joined</span>
                        <span className="font-medium">
                          {displayProfile.teamMember.joinedAt ? 
                            formatDistanceToNow(new Date(displayProfile.teamMember.joinedAt), { addSuffix: true }) : 
                            'Unknown'
                          }
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <TeamProfileIntegration />
        </TabsContent>

        {/* Ideas Tab */}
        <TabsContent value="ideas" className="space-y-4">
          <IdeaVaultProfileIntegration />
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <ProjectTaskProfileIntegration />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <ProfileTimeline userId={userId} />
        </TabsContent>

        {/* Gamification Tab */}
        <TabsContent value="gamification" className="space-y-4">
          <ProfileGamification userId={userId} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="space-y-6">
            <EnhancedProfileAnalytics />
            <ProfileAnalytics />
            <ProfileTrendAnalytics userId={userId} />
            <ProfileBenchmarking userId={userId} />
            <ProfileEngagementSentiment userId={userId} />
          </div>
        </TabsContent>

        {/* Privacy & GDPR Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <div className="space-y-6">
            <ProfileGDPRExport userId={userId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProfileDashboard;
