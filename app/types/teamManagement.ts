export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  department: Department;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  joinedAt: string;
  lastActive: string;
  skills: string[];
  currentTask?: string;
  tasksCompleted: number;
  totalTasks: number;
  permissions: Permission[];
  isActive: boolean;
  invitedBy?: string;
  invitationStatus: 'pending' | 'accepted' | 'declined';
  invitationExpiresAt?: string;
}

export interface TeamRole {
  id: string;
  name: 'Admin' | 'Member' | 'Viewer';
  displayName: string;
  description: string;
  permissions: Permission[];
  color: string;
  isSystemRole: boolean;
  canBeAssigned: boolean;
  order: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  memberCount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
  isSystemPermission: boolean;
}

export type PermissionCategory = 
  | 'team_management'
  | 'task_management' 
  | 'meeting_management'
  | 'message_management'
  | 'project_management'
  | 'settings_management'
  | 'analytics_management';

export interface TeamSettings {
  id: string;
  teamName: string;
  teamDescription: string;
  allowMemberInvites: boolean;
  allowSelfRegistration: boolean;
  requireApprovalForNewMembers: boolean;
  defaultRole: string;
  maxMembers: number;
  isPublic: boolean;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
  notificationSettings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    meetingReminders: boolean;
    taskAssignments: boolean;
    mentions: boolean;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  department: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  teamId: string;
}

export interface TeamActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
  type: 'member_management' | 'task_management' | 'meeting_management' | 'settings_change' | 'permission_change';
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  onlineMembers: number;
  departments: number;
  totalTasks: number;
  completedTasks: number;
  upcomingMeetings: number;
  recentActivity: TeamActivity[];
}

// Permission definitions
export const SYSTEM_PERMISSIONS: Permission[] = [
  // Team Management
  {
    id: 'team.manage_members',
    name: 'Manage Team Members',
    description: 'Add, remove, and modify team member roles and permissions',
    category: 'team_management',
    isSystemPermission: true
  },
  {
    id: 'team.manage_departments',
    name: 'Manage Departments',
    description: 'Create, edit, and delete departments',
    category: 'team_management',
    isSystemPermission: true
  },
  {
    id: 'team.manage_settings',
    name: 'Manage Team Settings',
    description: 'Modify team configuration and settings',
    category: 'team_management',
    isSystemPermission: true
  },
  {
    id: 'team.view_analytics',
    name: 'View Team Analytics',
    description: 'Access team performance and activity analytics',
    category: 'analytics_management',
    isSystemPermission: true
  },
  {
    id: 'team.invite_members',
    name: 'Invite Members',
    description: 'Send invitations to new team members',
    category: 'team_management',
    isSystemPermission: true
  },

  // Task Management
  {
    id: 'tasks.create',
    name: 'Create Tasks',
    description: 'Create new tasks and assign them to team members',
    category: 'task_management',
    isSystemPermission: true
  },
  {
    id: 'tasks.edit_all',
    name: 'Edit All Tasks',
    description: 'Edit any task in the team',
    category: 'task_management',
    isSystemPermission: true
  },
  {
    id: 'tasks.edit_own',
    name: 'Edit Own Tasks',
    description: 'Edit only tasks assigned to you',
    category: 'task_management',
    isSystemPermission: true
  },
  {
    id: 'tasks.delete',
    name: 'Delete Tasks',
    description: 'Delete tasks from the team',
    category: 'task_management',
    isSystemPermission: true
  },
  {
    id: 'tasks.view_all',
    name: 'View All Tasks',
    description: 'View all tasks in the team',
    category: 'task_management',
    isSystemPermission: true
  },

  // Meeting Management
  {
    id: 'meetings.create',
    name: 'Create Meetings',
    description: 'Schedule and create new meetings',
    category: 'meeting_management',
    isSystemPermission: true
  },
  {
    id: 'meetings.edit_all',
    name: 'Edit All Meetings',
    description: 'Edit any meeting in the team',
    category: 'meeting_management',
    isSystemPermission: true
  },
  {
    id: 'meetings.delete',
    name: 'Delete Meetings',
    description: 'Delete meetings from the team',
    category: 'meeting_management',
    isSystemPermission: true
  },
  {
    id: 'meetings.start_instant',
    name: 'Start Instant Meetings',
    description: 'Start immediate video/audio meetings',
    category: 'meeting_management',
    isSystemPermission: true
  },

  // Message Management
  {
    id: 'messages.send',
    name: 'Send Messages',
    description: 'Send messages in team and private chats',
    category: 'message_management',
    isSystemPermission: true
  },
  {
    id: 'messages.manage_channels',
    name: 'Manage Message Channels',
    description: 'Create and manage team communication channels',
    category: 'message_management',
    isSystemPermission: true
  },

  // Project Management
  {
    id: 'projects.create',
    name: 'Create Projects',
    description: 'Create new projects and initiatives',
    category: 'project_management',
    isSystemPermission: true
  },
  {
    id: 'projects.edit_all',
    name: 'Edit All Projects',
    description: 'Edit any project in the team',
    category: 'project_management',
    isSystemPermission: true
  },
  {
    id: 'projects.delete',
    name: 'Delete Projects',
    description: 'Delete projects from the team',
    category: 'project_management',
    isSystemPermission: true
  }
];

// Default role definitions
export const DEFAULT_ROLES: TeamRole[] = [
  {
    id: 'admin',
    name: 'Admin',
    displayName: 'Administrator',
    description: 'Full control over team management, settings, and all features',
    permissions: SYSTEM_PERMISSIONS,
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    isSystemRole: true,
    canBeAssigned: true,
    order: 1
  },
  {
    id: 'member',
    name: 'Member',
    displayName: 'Team Member',
    description: 'Can add tasks/ideas, start meetings, and collaborate with the team',
    permissions: SYSTEM_PERMISSIONS.filter(p => 
      ['tasks.create', 'tasks.edit_own', 'tasks.view_all', 'meetings.create', 'meetings.start_instant', 'messages.send', 'projects.create'].includes(p.id)
    ),
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    isSystemRole: true,
    canBeAssigned: true,
    order: 2
  },
  {
    id: 'viewer',
    name: 'Viewer',
    displayName: 'Viewer',
    description: 'Read-only access to team content and activities',
    permissions: SYSTEM_PERMISSIONS.filter(p => 
      ['tasks.view_all'].includes(p.id)
    ),
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    isSystemRole: true,
    canBeAssigned: true,
    order: 3
  }
];

// Default departments
export const DEFAULT_DEPARTMENTS: Omit<Department, 'id' | 'memberCount' | 'createdBy' | 'createdAt'>[] = [
  {
    name: 'Engineering',
    description: 'Software development and technical implementation',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: 'Code',
    isActive: true
  },
  {
    name: 'Design',
    description: 'User experience and visual design',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: 'Palette',
    isActive: true
  },
  {
    name: 'Marketing',
    description: 'Brand promotion and customer acquisition',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: 'Megaphone',
    isActive: true
  },
  {
    name: 'Product',
    description: 'Product strategy and management',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    icon: 'Target',
    isActive: true
  },
  {
    name: 'Sales',
    description: 'Customer acquisition and revenue generation',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: 'TrendingUp',
    isActive: true
  },
  {
    name: 'Operations',
    description: 'Business operations and administration',
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    icon: 'Settings',
    isActive: true
  }
];
