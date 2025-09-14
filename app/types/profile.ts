// Enhanced Profile System Types
// Building on existing User and TeamMember interfaces

import { TeamMember, TeamRole, Department, Permission } from './teamManagement';

// Extended User interface for comprehensive profile data
export interface UserProfile {
  // Basic Information (extends existing User)
  id: string;
  universalId: string; // Universal profile ID for cross-integration safety
  email: string;
  name: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  
  // Versioning and Audit Trail
  version: number;
  lastVersionAt?: string;
  versionHistory: ProfileVersion[];
  
  // Personal Information
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  phone?: string;
  location?: string;
  timezone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  
  // Professional Information
  jobTitle?: string;
  department?: Department;
  manager?: string;
  directReports?: string[];
  hireDate?: string;
  employeeId?: string;
  workLocation?: 'remote' | 'hybrid' | 'office';
  
  // Skills and Expertise
  skills: UserSkill[];
  certifications: UserCertification[];
  languages: UserLanguage[];
  interests: string[];
  
  // Availability and Status
  status: 'online' | 'offline' | 'busy' | 'away';
  availability: UserAvailability;
  workingHours: WorkingHours;
  
  // Preferences
  preferences: UserPreferences;
  privacy: PrivacySettings;
  
  // Performance and Activity
  performance: UserPerformance;
  activity: UserActivity;
  
  // Team Integration
  teamMember?: TeamMember;
  teamRole?: TeamRole;
  permissions?: Permission[];
  
  // Social and Collaboration
  connections: UserConnection[];
  collaborations: Collaboration[];
  achievements: Achievement[];
  
  // System Fields
  isActive: boolean;
  lastLogin?: string;
  profileCompletion: number; // 0-100
  onboardingCompleted: boolean;
  
  // Media Storage Strategy
  mediaStorage: MediaStorageInfo;
  
  // GDPR and Data Management
  dataRetention: DataRetentionSettings;
  gdprConsent: GDPRConsentSettings;
  
  // Profile Deletion/Deactivation
  deletionStatus: 'active' | 'pending_deletion' | 'deactivated' | 'deleted';
  deletionRequestedAt?: string;
  deletionScheduledFor?: string;
  deletionReason?: string;
  
  // Merge Strategy
  mergedFrom?: string[]; // Array of profile IDs that were merged into this one
  mergedTo?: string; // Profile ID this was merged into
  mergeHistory: ProfileMerge[];
}

// Skills and Expertise
export interface UserSkill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool' | 'framework' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  endorsements: number;
  endorsers: string[];
  isPublic: boolean;
}

export interface UserCertification {
  id: string;
  name: string;
  issuer: string;
  credentialId?: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  isVerified: boolean;
  isPublic: boolean;
}

export interface UserLanguage {
  id: string;
  language: string;
  proficiency: 'elementary' | 'limited' | 'professional' | 'full' | 'native';
  isPublic: boolean;
}

// Availability and Working Hours
export interface UserAvailability {
  isAvailable: boolean;
  statusMessage?: string;
  nextAvailable?: string;
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  workingHours: WorkingHours;
  timezone: string;
  vacationMode: boolean;
  vacationStart?: string;
  vacationEnd?: string;
}

export interface WorkingHours {
  start: string; // HH:MM format
  end: string;   // HH:MM format
  days: number[]; // 0-6 (Sunday-Saturday)
  timezone: string;
}

// User Preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
  communication: CommunicationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  desktop: boolean;
  marketing: boolean;
  types: {
    mentions: boolean;
    tasks: boolean;
    meetings: boolean;
    ideas: boolean;
    projects: boolean;
    teamUpdates: boolean;
    achievements: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface DashboardPreferences {
  layout: 'compact' | 'comfortable' | 'spacious';
  widgets: string[];
  defaultView: 'overview' | 'activity' | 'projects' | 'ideas';
  showMetrics: boolean;
  showRecentActivity: boolean;
  showUpcomingDeadlines: boolean;
}

export interface CommunicationPreferences {
  preferredMethod: 'email' | 'slack' | 'teams' | 'discord' | 'other';
  responseTime: 'immediate' | 'within_hour' | 'within_day' | 'flexible';
  meetingPreferences: {
    maxDuration: number; // minutes
    preferredTimes: string[];
    bufferTime: number; // minutes
  };
}

// Privacy Settings
export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  contactInfoVisibility: 'public' | 'team' | 'private';
  activityVisibility: 'public' | 'team' | 'private';
  skillsVisibility: 'public' | 'team' | 'private';
  availabilityVisibility: 'public' | 'team' | 'private';
  allowDirectMessages: boolean;
  allowMeetingInvites: boolean;
  showOnlineStatus: boolean;
  showLastActive: boolean;
}

// Performance and Activity Tracking
export interface UserPerformance {
  // Task Performance
  tasksCompleted: number;
  tasksAssigned: number;
  taskCompletionRate: number;
  averageTaskTime: number; // hours
  onTimeCompletionRate: number;
  
  // Idea Performance
  ideasSubmitted: number;
  ideasImplemented: number;
  ideasVotedOn: number;
  ideaSuccessRate: number;
  
  // Project Performance
  projectsInvolved: number;
  projectsLed: number;
  projectSuccessRate: number;
  
  // Collaboration Performance
  collaborationsCount: number;
  teamSatisfactionScore: number;
  communicationScore: number;
  
  // Learning and Growth
  skillsAdded: number;
  certificationsEarned: number;
  learningHours: number;
  
  // Recognition
  achievementsEarned: number;
  peerRecognition: number;
  managerRecognition: number;
}

export interface UserActivity {
  // Recent Activity
  lastActive: string;
  lastLogin: string;
  loginCount: number;
  sessionDuration: number; // average in minutes
  
  // Activity Patterns
  mostActiveHours: number[];
  mostActiveDays: number[];
  activityStreak: number; // consecutive days
  longestStreak: number;
  
  // Feature Usage
  featuresUsed: string[];
  mostUsedFeatures: string[];
  featureUsageStats: Record<string, number>;
  
  // Collaboration Activity
  messagesSent: number;
  meetingsAttended: number;
  meetingsHosted: number;
  commentsPosted: number;
  filesShared: number;
}

// Social and Collaboration
export interface UserConnection {
  id: string;
  userId: string;
  connectionType: 'colleague' | 'mentor' | 'mentee' | 'collaborator' | 'friend';
  status: 'pending' | 'accepted' | 'blocked';
  connectedAt: string;
  mutualConnections: number;
  collaborationCount: number;
}

export interface Collaboration {
  id: string;
  type: 'project' | 'idea' | 'task' | 'meeting' | 'other';
  title: string;
  description?: string;
  participants: string[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  outcome?: string;
  rating?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'collaboration' | 'innovation' | 'leadership' | 'learning';
  icon: string;
  earnedAt: string;
  points: number;
  isPublic: boolean;
  verifiedBy?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'auto_approved';
  validationRequired: boolean;
}

// Profile Analytics and Insights
export interface ProfileAnalytics {
  // Personal Insights
  productivityScore: number;
  collaborationScore: number;
  innovationScore: number;
  leadershipScore: number;
  
  // Trends
  productivityTrend: 'increasing' | 'stable' | 'decreasing';
  skillGrowthRate: number;
  activityTrend: 'increasing' | 'stable' | 'decreasing';
  
  // Comparisons
  teamRanking: number;
  departmentRanking: number;
  skillRankings: Record<string, number>;
  
  // Recommendations
  skillRecommendations: string[];
  collaborationRecommendations: string[];
  goalRecommendations: string[];
}

// Profile View Modes
export type ProfileViewMode = 'self' | 'team_member' | 'admin' | 'public';

// Profile Update Types
export interface ProfileUpdate {
  field: keyof UserProfile;
  value: any;
  timestamp: string;
  updatedBy: string;
}

// Profile Search and Filtering
export interface ProfileSearchFilters {
  skills?: string[];
  departments?: string[];
  roles?: string[];
  availability?: 'online' | 'offline' | 'busy' | 'away';
  location?: string;
  experienceLevel?: 'junior' | 'mid' | 'senior' | 'lead';
  timezone?: string;
}

// Profile Export/Import
export interface ProfileExport {
  userProfile: UserProfile;
  activities: UserActivity[];
  performance: UserPerformance;
  achievements: Achievement[];
  exportDate: string;
  version: string;
}

// Versioning and Audit Trail
export interface ProfileVersion {
  version: number;
  timestamp: string;
  changes: ProfileChange[];
  updatedBy: string;
  reason?: string;
  rollbackAvailable: boolean;
}

export interface ProfileChange {
  field: keyof UserProfile;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
}

// Media Storage Strategy
export interface MediaStorageInfo {
  avatarStorage: 'supabase' | 'cdn' | 'local';
  avatarUrl?: string;
  avatarThumbnailUrl?: string;
  certificatesStorage: 'supabase' | 'cdn' | 'local';
  portfolioStorage: 'supabase' | 'cdn' | 'local';
  portfolioFiles: MediaFile[];
  storageQuota: number; // in MB
  storageUsed: number; // in MB
}

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'certificate' | 'portfolio';
  url: string;
  thumbnailUrl?: string;
  size: number; // in bytes
  uploadedAt: string;
  isPublic: boolean;
}

// GDPR and Data Management
export interface DataRetentionSettings {
  retentionPeriod: number; // in days
  autoDeleteAfter: number; // in days
  anonymizeAfter: number; // in days
  exportBeforeDeletion: boolean;
  notifyBeforeDeletion: boolean;
}

export interface GDPRConsentSettings {
  dataProcessing: boolean;
  marketing: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
  consentGivenAt: string;
  consentVersion: string;
  withdrawalRequestedAt?: string;
}

// Profile Merge Strategy
export interface ProfileMerge {
  id: string;
  sourceProfileId: string;
  targetProfileId: string;
  mergedAt: string;
  mergedBy: string;
  mergeReason: string;
  dataConflicts: DataConflict[];
  resolutionStrategy: 'source_wins' | 'target_wins' | 'manual' | 'latest_wins';
}

export interface DataConflict {
  field: keyof UserProfile;
  sourceValue: any;
  targetValue: any;
  resolution: any;
  resolvedBy: string;
  resolvedAt: string;
}

// Timeline and Activity Feed
export interface ProfileTimelineEvent {
  id: string;
  type: 'achievement' | 'skill_added' | 'project_completed' | 'idea_submitted' | 'collaboration' | 'status_change';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  isPublic: boolean;
  metadata?: Record<string, any>;
}

// Gamification
export interface GamificationData {
  totalPoints: number;
  level: number;
  badges: Badge[];
  streaks: Streak[];
  progressRings: ProgressRing[];
  leaderboardPosition: number;
  nextMilestone: Milestone;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Streak {
  type: 'daily_login' | 'task_completion' | 'idea_submission' | 'collaboration';
  current: number;
  longest: number;
  lastActivity: string;
}

export interface ProgressRing {
  type: 'profile_completion' | 'skill_development' | 'collaboration' | 'innovation';
  current: number;
  target: number;
  unit: 'percentage' | 'count' | 'points';
}

export interface Milestone {
  name: string;
  description: string;
  target: number;
  current: number;
  reward: string;
  estimatedCompletion: string;
}

// Quick Contact Actions
export interface QuickContactAction {
  id: string;
  type: 'message' | 'call' | 'meeting' | 'email' | 'slack' | 'teams';
  label: string;
  icon: string;
  url?: string;
  isAvailable: boolean;
  availabilityMessage?: string;
}

// Enhanced Analytics
export interface TrendAnalytics {
  period: 'week' | 'month' | 'quarter' | 'year';
  skillsGrowth: SkillGrowthTrend[];
  projectContributions: ProjectContributionTrend[];
  collaborationPatterns: CollaborationTrend[];
  productivityMetrics: ProductivityTrend[];
}

export interface SkillGrowthTrend {
  skill: string;
  currentLevel: number;
  previousLevel: number;
  growthRate: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface ProjectContributionTrend {
  projectId: string;
  projectName: string;
  contributions: number;
  period: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface CollaborationTrend {
  collaboratorId: string;
  collaboratorName: string;
  interactionCount: number;
  lastInteraction: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface ProductivityTrend {
  metric: string;
  value: number;
  previousValue: number;
  change: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

// Benchmarking
export interface BenchmarkingData {
  teamAverage: Record<string, number>;
  departmentAverage: Record<string, number>;
  companyAverage: Record<string, number>;
  industryAverage: Record<string, number>;
  percentileRankings: Record<string, number>;
  recommendations: BenchmarkingRecommendation[];
}

export interface BenchmarkingRecommendation {
  area: string;
  currentValue: number;
  benchmarkValue: number;
  gap: number;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
}

// Engagement Sentiment
export interface EngagementSentiment {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  collaborationSentiment: number; // -1 to 1
  recognitionSentiment: number; // -1 to 1
  ideaAdoptionSentiment: number; // -1 to 1
  patterns: SentimentPattern[];
  recommendations: SentimentRecommendation[];
}

export interface SentimentPattern {
  type: 'collaboration' | 'recognition' | 'idea_adoption';
  pattern: string;
  frequency: number;
  impact: 'positive' | 'negative';
}

export interface SentimentRecommendation {
  area: string;
  issue: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
}

// Admin Override Rules
export interface AdminOverrideRule {
  id: string;
  name: string;
  description: string;
  conditions: AdminOverrideCondition[];
  permissions: AdminOverridePermission[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface AdminOverrideCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface AdminOverridePermission {
  action: 'view' | 'edit' | 'delete' | 'export';
  fields: string[];
  justification: string;
  expiresAt?: string;
}

// MFA and Security
export interface SecuritySettings {
  mfaEnabled: boolean;
  mfaMethods: MFAMethod[];
  sensitiveFieldsMfa: string[];
  lastSecurityReview: string;
  securityScore: number;
}

export interface MFAMethod {
  type: 'totp' | 'sms' | 'email' | 'hardware_key';
  isEnabled: boolean;
  lastUsed?: string;
  backupCodes?: string[];
}

// Default values and constants
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  notifications: {
    email: true,
    push: true,
    sms: false,
    desktop: true,
    marketing: false,
    types: {
      mentions: true,
      tasks: true,
      meetings: true,
      ideas: true,
      projects: true,
      teamUpdates: true,
      achievements: true,
    },
    frequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  },
  dashboard: {
    layout: 'comfortable',
    widgets: ['recent_activity', 'upcoming_tasks', 'team_activity'],
    defaultView: 'overview',
    showMetrics: true,
    showRecentActivity: true,
    showUpcomingDeadlines: true,
  },
  communication: {
    preferredMethod: 'email',
    responseTime: 'within_hour',
    meetingPreferences: {
      maxDuration: 60,
      preferredTimes: ['09:00', '10:00', '14:00', '15:00'],
      bufferTime: 15,
    },
  },
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'team',
  contactInfoVisibility: 'team',
  activityVisibility: 'team',
  skillsVisibility: 'team',
  availabilityVisibility: 'team',
  allowDirectMessages: true,
  allowMeetingInvites: true,
  showOnlineStatus: true,
  showLastActive: true,
};

export const DEFAULT_MEDIA_STORAGE: MediaStorageInfo = {
  avatarStorage: 'supabase',
  certificatesStorage: 'supabase',
  portfolioStorage: 'supabase',
  portfolioFiles: [],
  storageQuota: 100, // 100MB default
  storageUsed: 0,
};

export const DEFAULT_DATA_RETENTION: DataRetentionSettings = {
  retentionPeriod: 2555, // 7 years
  autoDeleteAfter: 3650, // 10 years
  anonymizeAfter: 1095, // 3 years
  exportBeforeDeletion: true,
  notifyBeforeDeletion: true,
};

export const DEFAULT_GDPR_CONSENT: GDPRConsentSettings = {
  dataProcessing: true,
  marketing: false,
  analytics: true,
  thirdPartySharing: false,
  consentGivenAt: new Date().toISOString(),
  consentVersion: '1.0',
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  mfaEnabled: false,
  mfaMethods: [],
  sensitiveFieldsMfa: ['phone', 'email', 'personalInfo'],
  lastSecurityReview: new Date().toISOString(),
  securityScore: 0,
};

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  start: '09:00',
  end: '17:00',
  days: [1, 2, 3, 4, 5], // Monday to Friday
  timezone: 'UTC',
};

// Profile completion calculation
export const calculateProfileCompletion = (profile: Partial<UserProfile>): number => {
  const requiredFields = [
    'firstName', 'lastName', 'bio', 'jobTitle', 'skills', 'location', 'timezone'
  ];
  
  const completedFields = requiredFields.filter(field => {
    const value = profile[field as keyof UserProfile];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  });
  
  return Math.round((completedFields.length / requiredFields.length) * 100);
};
