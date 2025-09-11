"use client";

import React from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useTeamPermissions } from '@/hooks/useTeamPermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Crown, 
  Shield, 
  Eye, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  Clock,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TeamProfileIntegrationProps {
  className?: string;
}

export function TeamProfileIntegration({ className = '' }: TeamProfileIntegrationProps) {
  const { profile } = useProfile();
  const { isAdmin, canManageMembers, canViewAnalytics } = useTeamPermissions();

  if (!profile) {
    return null;
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Admin': return <Crown className="h-4 w-4 text-red-500" />;
      case 'Member': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'Viewer': return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

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
    <div className={`space-y-4 ${className}`}>
      {/* Team Role & Permissions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Role & Permissions
          </CardTitle>
          <CardDescription>
            Your current role and permissions in the team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Role Information */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getRoleIcon(profile.teamMember?.role?.name || 'Member')}
                <div>
                  <p className="font-medium">{profile.teamMember?.role?.displayName || 'Team Member'}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.teamMember?.role?.description || 'Team member with standard permissions'}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={profile.teamMember?.role?.color || 'bg-blue-500/20 text-blue-400 border-blue-500/30'}
              >
                {profile.teamMember?.role?.name || 'Member'}
              </Badge>
            </div>

            {/* Department Information */}
            {profile.teamMember?.department && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {profile.teamMember.department.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{profile.teamMember.department.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.teamMember.department.description}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={profile.teamMember.department.color}
                >
                  {profile.teamMember.department.memberCount} members
                </Badge>
              </div>
            )}

            {/* Permissions Summary */}
            {profile.permissions && profile.permissions.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Your Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {profile.permissions.slice(0, 5).map((permission) => (
                    <Badge key={permission.id} variant="secondary" className="text-xs">
                      {permission.name}
                    </Badge>
                  ))}
                  {profile.permissions.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.permissions.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Admin Actions */}
            {isAdmin && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Admin Actions:</p>
                <div className="flex space-x-2">
                  {canManageMembers && (
                    <Button variant="outline" size="sm">
                      Manage Team
                    </Button>
                  )}
                  {canViewAnalytics && (
                    <Button variant="outline" size="sm">
                      View Analytics
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Status & Availability Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Status & Availability
          </CardTitle>
          <CardDescription>
            Your current status and availability to the team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(profile.status)} flex items-center justify-center`}>
                  {getStatusIcon(profile.status)}
                </div>
                <div>
                  <p className="font-medium capitalize">{profile.status}</p>
                  {profile.availability?.statusMessage && (
                    <p className="text-sm text-muted-foreground">
                      {profile.availability.statusMessage}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {profile.status}
              </Badge>
            </div>

            {/* Working Hours */}
            {profile.workingHours && (
              <div>
                <p className="text-sm font-medium mb-1">Working Hours:</p>
                <p className="text-sm text-muted-foreground">
                  {profile.workingHours.start} - {profile.workingHours.end} 
                  {' '}({profile.workingHours.timezone})
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile.workingHours.days.map(day => {
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    return days[day];
                  }).join(', ')}
                </p>
              </div>
            )}

            {/* Last Active */}
            <div>
              <p className="text-sm font-medium mb-1">Last Active:</p>
              <p className="text-sm text-muted-foreground">
                {profile.lastLogin ? 
                  formatDistanceToNow(new Date(profile.lastLogin), { addSuffix: true }) : 
                  'Unknown'
                }
              </p>
            </div>

            {/* Team Join Date */}
            {profile.teamMember?.joinedAt && (
              <div>
                <p className="text-sm font-medium mb-1">Team Member Since:</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(profile.teamMember.joinedAt), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Contact Information
          </CardTitle>
          <CardDescription>
            How team members can reach you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profile.email}</span>
            </div>
            
            {profile.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.phone}</span>
              </div>
            )}
            
            {profile.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance Card */}
      {profile.teamMember && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Team Performance
            </CardTitle>
            <CardDescription>
              Your contribution to the team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{profile.teamMember.tasksCompleted || 0}</p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{profile.teamMember.totalTasks || 0}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
            
            {profile.teamMember.totalTasks > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Rate</span>
                  <span>
                    {Math.round((profile.teamMember.tasksCompleted / profile.teamMember.totalTasks) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(profile.teamMember.tasksCompleted / profile.teamMember.totalTasks) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TeamProfileIntegration;
