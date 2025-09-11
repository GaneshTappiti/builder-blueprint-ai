"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  TeamMember, 
  TeamRole, 
  Department, 
  TeamSettings, 
  TeamInvitation, 
  TeamActivity,
  TeamStats,
  DEFAULT_ROLES,
  DEFAULT_DEPARTMENTS,
  SYSTEM_PERMISSIONS
} from '@/types/teamManagement';
import { useToast } from '@/hooks/use-toast';

interface TeamManagementContextType {
  // State
  teamMembers: TeamMember[];
  roles: TeamRole[];
  departments: Department[];
  settings: TeamSettings | null;
  invitations: TeamInvitation[];
  activities: TeamActivity[];
  stats: TeamStats | null;
  loading: boolean;
  error: string | null;

  // Actions
  addMember: (memberData: Partial<TeamMember>) => Promise<void>;
  updateMember: (memberId: string, updates: Partial<TeamMember>) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, roleId: string) => Promise<void>;
  updateMemberDepartment: (memberId: string, departmentId: string) => Promise<void>;
  
  // Department management
  createDepartment: (departmentData: Omit<Department, 'id' | 'memberCount' | 'createdBy' | 'createdAt'>) => Promise<void>;
  updateDepartment: (departmentId: string, updates: Partial<Department>) => Promise<void>;
  deleteDepartment: (departmentId: string) => Promise<void>;
  
  // Role management
  createRole: (roleData: Omit<TeamRole, 'id'>) => Promise<void>;
  updateRole: (roleId: string, updates: Partial<TeamRole>) => Promise<void>;
  deleteRole: (roleId: string) => Promise<void>;
  
  // Invitation management
  inviteMember: (invitationData: Omit<TeamInvitation, 'id' | 'invitedAt' | 'status'>) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  
  // Settings management
  updateSettings: (settings: Partial<TeamSettings>) => Promise<void>;
  
  // Utility functions
  getMemberById: (memberId: string) => TeamMember | undefined;
  getRoleById: (roleId: string) => TeamRole | undefined;
  getDepartmentById: (departmentId: string) => Department | undefined;
  getMembersByDepartment: (departmentId: string) => TeamMember[];
  getMembersByRole: (roleId: string) => TeamMember[];
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const TeamManagementContext = createContext<TeamManagementContextType | undefined>(undefined);

export function TeamManagementProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<TeamRole[]>(DEFAULT_ROLES);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [settings, setSettings] = useState<TeamSettings | null>(null);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize default departments
  useEffect(() => {
    if (departments.length === 0 && user) {
      const defaultDepts = DEFAULT_DEPARTMENTS.map((dept, index) => ({
        ...dept,
        id: `dept-${index + 1}`,
        memberCount: 0,
        createdBy: user.id,
        createdAt: new Date().toISOString()
      }));
      setDepartments(defaultDepts);
    }
  }, [departments.length, user]);

  // Initialize default settings
  useEffect(() => {
    if (!settings && user) {
      const defaultSettings: TeamSettings = {
        id: 'team-settings-1',
        teamName: 'My Team',
        teamDescription: 'A collaborative workspace for our team',
        allowMemberInvites: true,
        allowSelfRegistration: false,
        requireApprovalForNewMembers: false,
        defaultRole: 'member',
        maxMembers: 50,
        isPublic: false,
        timezone: 'UTC',
        workingHours: {
          start: '09:00',
          end: '17:00',
          days: [1, 2, 3, 4, 5] // Monday to Friday
        },
        notificationSettings: {
          emailNotifications: true,
          pushNotifications: true,
          meetingReminders: true,
          taskAssignments: true,
          mentions: true
        },
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setSettings(defaultSettings);
    }
  }, [settings, user]);

  // Add activity log entry
  const addActivity = useCallback((activity: Omit<TeamActivity, 'id' | 'timestamp'>) => {
    if (!user) return;
    
    const newActivity: TeamActivity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
  }, [user]);

  // Member management
  const addMember = useCallback(async (memberData: Partial<TeamMember>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        name: memberData.name || '',
        email: memberData.email || '',
        role: memberData.role || roles.find(r => r.id === 'member')!,
        department: memberData.department || departments[0],
        avatar: memberData.avatar,
        status: 'offline',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        skills: memberData.skills || [],
        currentTask: memberData.currentTask,
        tasksCompleted: memberData.tasksCompleted || 0,
        totalTasks: memberData.totalTasks || 0,
        permissions: memberData.role?.permissions || roles.find(r => r.id === 'member')!.permissions,
        isActive: true,
        invitedBy: user.id,
        invitationStatus: 'accepted'
      };

      setTeamMembers(prev => [...prev, newMember]);
      
      // Update department member count
      setDepartments(prev => prev.map(dept => 
        dept.id === newMember.department.id 
          ? { ...dept, memberCount: dept.memberCount + 1 }
          : dept
      ));

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'member_added',
        description: `Added ${newMember.name} to the team`,
        type: 'member_management',
        metadata: { memberId: newMember.id, role: newMember.role.name }
      });

      toast({
        title: "Member added successfully",
        description: `${newMember.name} has been added to the team.`,
      });
    } catch (err) {
      setError('Failed to add member');
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, roles, departments, addActivity, toast]);

  const updateMember = useCallback(async (memberId: string, updates: Partial<TeamMember>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      setTeamMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, ...updates } : member
      ));

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'member_updated',
        description: `Updated ${updates.name || 'member'} information`,
        type: 'member_management',
        metadata: { memberId, updates }
      });

      toast({
        title: "Member updated",
        description: "Member information has been updated successfully.",
      });
    } catch (err) {
      setError('Failed to update member');
      toast({
        title: "Error",
        description: "Failed to update member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, addActivity, toast]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const member = teamMembers.find(m => m.id === memberId);
      if (!member) return;

      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
      
      // Update department member count
      setDepartments(prev => prev.map(dept => 
        dept.id === member.department.id 
          ? { ...dept, memberCount: Math.max(0, dept.memberCount - 1) }
          : dept
      ));

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'member_removed',
        description: `Removed ${member.name} from the team`,
        type: 'member_management',
        metadata: { memberId, memberName: member.name }
      });

      toast({
        title: "Member removed",
        description: `${member.name} has been removed from the team.`,
      });
    } catch (err) {
      setError('Failed to remove member');
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, teamMembers, addActivity, toast]);

  const updateMemberRole = useCallback(async (memberId: string, roleId: string) => {
    if (!user) return;
    
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    setLoading(true);
    try {
      setTeamMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, role, permissions: role.permissions }
          : member
      ));

      const member = teamMembers.find(m => m.id === memberId);
      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'member_role_changed',
        description: `Changed ${member?.name || 'member'}'s role to ${role.displayName}`,
        type: 'permission_change',
        metadata: { memberId, newRole: role.name, oldRole: member?.role.name }
      });

      toast({
        title: "Role updated",
        description: `Member role has been changed to ${role.displayName}.`,
      });
    } catch (err) {
      setError('Failed to update role');
      toast({
        title: "Error",
        description: "Failed to update member role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, roles, teamMembers, addActivity, toast]);

  const updateMemberDepartment = useCallback(async (memberId: string, departmentId: string) => {
    if (!user) return;
    
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;

    setLoading(true);
    try {
      const member = teamMembers.find(m => m.id === memberId);
      if (!member) return;

      // Update member's department
      setTeamMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, department } : m
      ));

      // Update department member counts
      setDepartments(prev => prev.map(dept => {
        if (dept.id === departmentId) {
          return { ...dept, memberCount: dept.memberCount + 1 };
        } else if (dept.id === member.department.id) {
          return { ...dept, memberCount: Math.max(0, dept.memberCount - 1) };
        }
        return dept;
      }));

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'member_department_changed',
        description: `Moved ${member.name} to ${department.name} department`,
        type: 'member_management',
        metadata: { memberId, newDepartment: department.name, oldDepartment: member.department.name }
      });

      toast({
        title: "Department updated",
        description: `Member has been moved to ${department.name} department.`,
      });
    } catch (err) {
      setError('Failed to update department');
      toast({
        title: "Error",
        description: "Failed to update member department. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, departments, teamMembers, addActivity, toast]);

  // Department management
  const createDepartment = useCallback(async (departmentData: Omit<Department, 'id' | 'memberCount' | 'createdBy' | 'createdAt'>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newDepartment: Department = {
        ...departmentData,
        id: `dept-${Date.now()}`,
        memberCount: 0,
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };

      setDepartments(prev => [...prev, newDepartment]);

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'department_created',
        description: `Created ${newDepartment.name} department`,
        type: 'member_management',
        metadata: { departmentId: newDepartment.id, departmentName: newDepartment.name }
      });

      toast({
        title: "Department created",
        description: `${newDepartment.name} department has been created successfully.`,
      });
    } catch (err) {
      setError('Failed to create department');
      toast({
        title: "Error",
        description: "Failed to create department. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, addActivity, toast]);

  const updateDepartment = useCallback(async (departmentId: string, updates: Partial<Department>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      setDepartments(prev => prev.map(dept => 
        dept.id === departmentId ? { ...dept, ...updates } : dept
      ));

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'department_updated',
        description: `Updated department information`,
        type: 'member_management',
        metadata: { departmentId, updates }
      });

      toast({
        title: "Department updated",
        description: "Department information has been updated successfully.",
      });
    } catch (err) {
      setError('Failed to update department');
      toast({
        title: "Error",
        description: "Failed to update department. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, addActivity, toast]);

  const deleteDepartment = useCallback(async (departmentId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const department = departments.find(d => d.id === departmentId);
      if (!department) return;

      // Move members to default department
      const defaultDept = departments.find(d => d.name === 'Operations') || departments[0];
      if (defaultDept) {
        setTeamMembers(prev => prev.map(member => 
          member.department.id === departmentId 
            ? { ...member, department: defaultDept }
            : member
        ));
      }

      setDepartments(prev => prev.filter(d => d.id !== departmentId));

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'department_deleted',
        description: `Deleted ${department.name} department`,
        type: 'member_management',
        metadata: { departmentId, departmentName: department.name }
      });

      toast({
        title: "Department deleted",
        description: `${department.name} department has been deleted.`,
      });
    } catch (err) {
      setError('Failed to delete department');
      toast({
        title: "Error",
        description: "Failed to delete department. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, departments, addActivity, toast]);

  // Role management
  const createRole = useCallback(async (roleData: Omit<TeamRole, 'id'>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newRole: TeamRole = {
        ...roleData,
        id: `role-${Date.now()}`
      };

      setRoles(prev => [...prev, newRole]);

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'role_created',
        description: `Created ${newRole.displayName} role`,
        type: 'member_management',
        metadata: { roleId: newRole.id, roleName: newRole.name }
      });

      toast({
        title: "Role created",
        description: `${newRole.displayName} role has been created successfully.`,
      });
    } catch (err) {
      setError('Failed to create role');
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, addActivity, toast]);

  const updateRole = useCallback(async (roleId: string, updates: Partial<TeamRole>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      setRoles(prev => prev.map(role => 
        role.id === roleId ? { ...role, ...updates } : role
      ));

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'role_updated',
        description: `Updated role information`,
        type: 'member_management',
        metadata: { roleId, updates }
      });

      toast({
        title: "Role updated",
        description: "Role information has been updated successfully.",
      });
    } catch (err) {
      setError('Failed to update role');
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, addActivity, toast]);

  const deleteRole = useCallback(async (roleId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role || role.isSystemRole) return;

      // Move members with this role to default role
      const defaultRole = roles.find(r => r.id === 'member');
      if (defaultRole) {
        setTeamMembers(prev => prev.map(member => 
          member.role.id === roleId 
            ? { ...member, role: defaultRole, permissions: defaultRole.permissions }
            : member
        ));
      }

      setRoles(prev => prev.filter(r => r.id !== roleId));

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'role_deleted',
        description: `Deleted ${role.displayName} role`,
        type: 'member_management',
        metadata: { roleId, roleName: role.name }
      });

      toast({
        title: "Role deleted",
        description: `${role.displayName} role has been deleted.`,
      });
    } catch (err) {
      setError('Failed to delete role');
      toast({
        title: "Error",
        description: "Failed to delete role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, roles, addActivity, toast]);

  // Invitation management
  const inviteMember = useCallback(async (invitationData: Omit<TeamInvitation, 'id' | 'invitedAt' | 'status'>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newInvitation: TeamInvitation = {
        ...invitationData,
        id: `invitation-${Date.now()}`,
        invitedAt: new Date().toISOString(),
        status: 'pending'
      };

      setInvitations(prev => [...prev, newInvitation]);

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'member_invited',
        description: `Invited ${newInvitation.email} to join the team`,
        type: 'member_management',
        metadata: { invitationId: newInvitation.id, email: newInvitation.email }
      });

      toast({
        title: "Invitation sent",
        description: `Invitation has been sent to ${newInvitation.email}.`,
      });
    } catch (err) {
      setError('Failed to send invitation');
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, addActivity, toast]);

  const acceptInvitation = useCallback(async (invitationId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const invitation = invitations.find(i => i.id === invitationId);
      if (!invitation) return;

      setInvitations(prev => prev.map(inv => 
        inv.id === invitationId ? { ...inv, status: 'accepted' } : inv
      ));

      // Add member to team
      const role = roles.find(r => r.id === invitation.role);
      const department = departments.find(d => d.id === invitation.department);
      
      if (role && department) {
        const newMember: TeamMember = {
          id: `member-${Date.now()}`,
          name: user.name || 'New Member',
          email: invitation.email,
          role,
          department,
          status: 'offline',
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          skills: [],
          tasksCompleted: 0,
          totalTasks: 0,
          permissions: role.permissions,
          isActive: true,
          invitedBy: invitation.invitedBy,
          invitationStatus: 'accepted'
        };

        setTeamMembers(prev => [...prev, newMember]);
      }

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'invitation_accepted',
        description: `Accepted invitation to join the team`,
        type: 'member_management',
        metadata: { invitationId }
      });

      toast({
        title: "Welcome to the team!",
        description: "You have successfully joined the team.",
      });
    } catch (err) {
      setError('Failed to accept invitation');
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, invitations, roles, departments, addActivity, toast]);

  const declineInvitation = useCallback(async (invitationId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      setInvitations(prev => prev.map(inv => 
        inv.id === invitationId ? { ...inv, status: 'declined' } : inv
      ));

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'invitation_declined',
        description: `Declined invitation to join the team`,
        type: 'member_management',
        metadata: { invitationId }
      });

      toast({
        title: "Invitation declined",
        description: "You have declined the team invitation.",
      });
    } catch (err) {
      setError('Failed to decline invitation');
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, addActivity, toast]);

  const cancelInvitation = useCallback(async (invitationId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'invitation_cancelled',
        description: `Cancelled team invitation`,
        type: 'member_management',
        metadata: { invitationId }
      });

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled.",
      });
    } catch (err) {
      setError('Failed to cancel invitation');
      toast({
        title: "Error",
        description: "Failed to cancel invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, addActivity, toast]);

  // Settings management
  const updateSettings = useCallback(async (settingsUpdates: Partial<TeamSettings>) => {
    if (!user || !settings) return;
    
    setLoading(true);
    try {
      setSettings(prev => prev ? { ...prev, ...settingsUpdates, updatedAt: new Date().toISOString() } : null);

      addActivity({
        userId: user.id,
        userName: user.name || 'Unknown',
        action: 'settings_updated',
        description: `Updated team settings`,
        type: 'settings_change',
        metadata: { updates: settingsUpdates }
      });

      toast({
        title: "Settings updated",
        description: "Team settings have been updated successfully.",
      });
    } catch (err) {
      setError('Failed to update settings');
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, settings, addActivity, toast]);

  // Utility functions
  const getMemberById = useCallback((memberId: string) => {
    return teamMembers.find(member => member.id === memberId);
  }, [teamMembers]);

  const getRoleById = useCallback((roleId: string) => {
    return roles.find(role => role.id === roleId);
  }, [roles]);

  const getDepartmentById = useCallback((departmentId: string) => {
    return departments.find(department => department.id === departmentId);
  }, [departments]);

  const getMembersByDepartment = useCallback((departmentId: string) => {
    return teamMembers.filter(member => member.department.id === departmentId);
  }, [teamMembers]);

  const getMembersByRole = useCallback((roleId: string) => {
    return teamMembers.filter(member => member.role.id === roleId);
  }, [teamMembers]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch data from the server
      // For now, we'll just update the stats
      const newStats: TeamStats = {
        totalMembers: teamMembers.length,
        activeMembers: teamMembers.filter(m => m.isActive).length,
        onlineMembers: teamMembers.filter(m => m.status === 'online').length,
        departments: departments.length,
        totalTasks: teamMembers.reduce((sum, m) => sum + m.totalTasks, 0),
        completedTasks: teamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0),
        upcomingMeetings: 0, // This would be calculated from meetings data
        recentActivity: activities.slice(0, 10)
      };
      setStats(newStats);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [teamMembers, departments, activities]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update stats when data changes
  useEffect(() => {
    refreshData();
  }, [teamMembers, departments, activities]);

  const value: TeamManagementContextType = {
    // State
    teamMembers,
    roles,
    departments,
    settings,
    invitations,
    activities,
    stats,
    loading,
    error,

    // Actions
    addMember,
    updateMember,
    removeMember,
    updateMemberRole,
    updateMemberDepartment,
    
    // Department management
    createDepartment,
    updateDepartment,
    deleteDepartment,
    
    // Role management
    createRole,
    updateRole,
    deleteRole,
    
    // Invitation management
    inviteMember,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    
    // Settings management
    updateSettings,
    
    // Utility functions
    getMemberById,
    getRoleById,
    getDepartmentById,
    getMembersByDepartment,
    getMembersByRole,
    refreshData,
    clearError
  };

  return (
    <TeamManagementContext.Provider value={value}>
      {children}
    </TeamManagementContext.Provider>
  );
}

export function useTeamManagement() {
  const context = useContext(TeamManagementContext);
  if (context === undefined) {
    throw new Error('useTeamManagement must be used within a TeamManagementProvider');
  }
  return context;
}
