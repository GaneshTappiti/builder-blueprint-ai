"use client";

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TeamMember, TeamRole, Permission, SYSTEM_PERMISSIONS } from '@/types/teamManagement';

interface UseTeamPermissionsReturn {
  // Permission checking
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Role checking
  isAdmin: boolean;
  isMember: boolean;
  isViewer: boolean;
  hasRole: (role: string) => boolean;
  
  // Team management permissions
  canManageMembers: boolean;
  canManageDepartments: boolean;
  canManageSettings: boolean;
  canInviteMembers: boolean;
  canViewAnalytics: boolean;
  
  // Task permissions
  canCreateTasks: boolean;
  canEditAllTasks: boolean;
  canEditOwnTasks: boolean;
  canDeleteTasks: boolean;
  canViewAllTasks: boolean;
  
  // Meeting permissions
  canCreateMeetings: boolean;
  canEditAllMeetings: boolean;
  canDeleteMeetings: boolean;
  canStartInstantMeetings: boolean;
  
  // Message permissions
  canSendMessages: boolean;
  canManageChannels: boolean;
  
  // Project permissions
  canCreateProjects: boolean;
  canEditAllProjects: boolean;
  canDeleteProjects: boolean;
  
  // Utility functions
  getAvailablePermissions: () => Permission[];
  getRolePermissions: (role: string) => Permission[];
  canPerformAction: (action: string, resource?: string) => boolean;
}

export function useTeamPermissions(
  currentUser?: TeamMember,
  teamMembers: TeamMember[] = []
): UseTeamPermissionsReturn {
  const { user } = useAuth();
  
  // Get current user's team member data
  const userMember = useMemo(() => {
    if (currentUser) return currentUser;
    if (!user) return null;
    
    // Find user in team members
    return teamMembers.find(member => member.email === user.email) || null;
  }, [currentUser, user, teamMembers]);

  // Get user's role and permissions
  const userRole = useMemo(() => {
    if (!userMember) return null;
    return userMember.role;
  }, [userMember]);

  const userPermissions = useMemo(() => {
    if (!userMember) return [];
    return userMember.permissions || [];
  }, [userMember]);

  // Permission checking functions
  const hasPermission = (permission: string): boolean => {
    if (!userMember) return false;
    return userPermissions.some(p => p.id === permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Role checking functions
  const isAdmin = useMemo(() => {
    return userRole?.name === 'Admin';
  }, [userRole]);

  const isMember = useMemo(() => {
    return userRole?.name === 'Member';
  }, [userRole]);

  const isViewer = useMemo(() => {
    return userRole?.name === 'Viewer';
  }, [userRole]);

  const hasRole = (role: string): boolean => {
    return userRole?.name === role;
  };

  // Specific permission checks
  const canManageMembers = hasPermission('team.manage_members');
  const canManageDepartments = hasPermission('team.manage_departments');
  const canManageSettings = hasPermission('team.manage_settings');
  const canInviteMembers = hasPermission('team.invite_members');
  const canViewAnalytics = hasPermission('team.view_analytics');

  const canCreateTasks = hasPermission('tasks.create');
  const canEditAllTasks = hasPermission('tasks.edit_all');
  const canEditOwnTasks = hasPermission('tasks.edit_own');
  const canDeleteTasks = hasPermission('tasks.delete');
  const canViewAllTasks = hasPermission('tasks.view_all');

  const canCreateMeetings = hasPermission('meetings.create');
  const canEditAllMeetings = hasPermission('meetings.edit_all');
  const canDeleteMeetings = hasPermission('meetings.delete');
  const canStartInstantMeetings = hasPermission('meetings.start_instant');

  const canSendMessages = hasPermission('messages.send');
  const canManageChannels = hasPermission('messages.manage_channels');

  const canCreateProjects = hasPermission('projects.create');
  const canEditAllProjects = hasPermission('projects.edit_all');
  const canDeleteProjects = hasPermission('projects.delete');

  // Utility functions
  const getAvailablePermissions = (): Permission[] => {
    return SYSTEM_PERMISSIONS;
  };

  const getRolePermissions = (role: string): Permission[] => {
    // This would typically fetch from a role definition
    // For now, return based on role name
    switch (role) {
      case 'Admin':
        return SYSTEM_PERMISSIONS;
      case 'Member':
        return SYSTEM_PERMISSIONS.filter(p => 
          ['tasks.create', 'tasks.edit_own', 'tasks.view_all', 'meetings.create', 'meetings.start_instant', 'messages.send', 'projects.create'].includes(p.id)
        );
      case 'Viewer':
        return SYSTEM_PERMISSIONS.filter(p => 
          ['tasks.view_all'].includes(p.id)
        );
      default:
        return [];
    }
  };

  const canPerformAction = (action: string, resource?: string): boolean => {
    // Map common actions to permissions
    const actionPermissionMap: Record<string, string> = {
      'add_member': 'team.manage_members',
      'remove_member': 'team.manage_members',
      'edit_member_role': 'team.manage_members',
      'create_department': 'team.manage_departments',
      'edit_department': 'team.manage_departments',
      'delete_department': 'team.manage_departments',
      'create_task': 'tasks.create',
      'edit_task': 'tasks.edit_all',
      'delete_task': 'tasks.delete',
      'create_meeting': 'meetings.create',
      'edit_meeting': 'meetings.edit_all',
      'delete_meeting': 'meetings.delete',
      'start_meeting': 'meetings.start_instant',
      'send_message': 'messages.send',
      'create_project': 'projects.create',
      'edit_project': 'projects.edit_all',
      'delete_project': 'projects.delete',
      'view_analytics': 'team.view_analytics',
      'manage_settings': 'team.manage_settings'
    };

    const permission = actionPermissionMap[action];
    if (!permission) return false;

    return hasPermission(permission);
  };

  return {
    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Role checking
    isAdmin,
    isMember,
    isViewer,
    hasRole,
    
    // Team management permissions
    canManageMembers,
    canManageDepartments,
    canManageSettings,
    canInviteMembers,
    canViewAnalytics,
    
    // Task permissions
    canCreateTasks,
    canEditAllTasks,
    canEditOwnTasks,
    canDeleteTasks,
    canViewAllTasks,
    
    // Meeting permissions
    canCreateMeetings,
    canEditAllMeetings,
    canDeleteMeetings,
    canStartInstantMeetings,
    
    // Message permissions
    canSendMessages,
    canManageChannels,
    
    // Project permissions
    canCreateProjects,
    canEditAllProjects,
    canDeleteProjects,
    
    // Utility functions
    getAvailablePermissions,
    getRolePermissions,
    canPerformAction
  };
}
