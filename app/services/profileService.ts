// Profile Service
// Handles all profile-related data operations and business logic

import { supabase } from '@/lib/supabase';
import { UserProfile, UserSkill, UserCertification, UserLanguage, UserPerformance, UserActivity, Achievement, ProfileAnalytics, ProfileSearchFilters, DEFAULT_USER_PREFERENCES, DEFAULT_PRIVACY_SETTINGS, DEFAULT_WORKING_HOURS, calculateProfileCompletion } from '@/types/profile';
import { profileCache, getCacheKey, CACHE_TTL } from './profileCache';

export class ProfileService {
  // Get user profile by ID
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check cache first
      const cacheKey = getCacheKey.profile(userId);
      const cachedProfile = profileCache.get<UserProfile>(cacheKey);
      if (cachedProfile) {
        return cachedProfile;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          skills:user_skills(*),
          certifications:user_certifications(*),
          languages:user_languages(*),
          achievements:user_achievements(*),
          team_member:team_members(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      const profile = this.transformProfileData(data);
      
      // Cache the result
      profileCache.set(cacheKey, profile, CACHE_TTL.PROFILE);
      
      return profile;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  // Get current user's profile
  static async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return await this.getProfile(user.id);
    } catch (error) {
      console.error('Error getting current profile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      // Calculate profile completion
      const currentProfile = await this.getProfile(userId);
      const updatedProfile = { ...currentProfile, ...updates };
      const completion = calculateProfileCompletion(updatedProfile);

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          profile_completion: completion,
          // If onboardingCompleted is being set to true, ensure it's properly saved
          onboarding_completed: updates.onboardingCompleted !== undefined ? updates.onboardingCompleted : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      // Invalidate cache
      profileCache.clearUser(userId);

      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  }

  // Create or initialize user profile
  static async createProfile(userId: string, initialData: Partial<UserProfile> = {}): Promise<boolean> {
    try {
      const profileData = {
        id: userId,
        ...initialData,
        preferences: initialData.preferences || DEFAULT_USER_PREFERENCES,
        privacy: initialData.privacy || DEFAULT_PRIVACY_SETTINGS,
        working_hours: initialData.workingHours || DEFAULT_WORKING_HOURS,
        status: initialData.status || 'offline',
        profile_completion: calculateProfileCompletion(initialData),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .insert(profileData);

      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return false;
    }
  }

  // Update user skills
  static async updateSkills(userId: string, skills: UserSkill[]): Promise<boolean> {
    try {
      // Delete existing skills
      await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', userId);

      // Insert new skills
      if (skills.length > 0) {
        const { error } = await supabase
          .from('user_skills')
          .insert(skills.map(skill => ({
            ...skill,
            user_id: userId
          })));

        if (error) {
          console.error('Error updating skills:', error);
          return false;
        }
      }

      // Invalidate cache
      profileCache.clearUser(userId);

      return true;
    } catch (error) {
      console.error('Error in updateSkills:', error);
      return false;
    }
  }

  // Add or update a single skill
  static async addSkill(userId: string, skill: Omit<UserSkill, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_skills')
        .insert({
          ...skill,
          user_id: userId,
          id: crypto.randomUUID()
        });

      if (error) {
        console.error('Error adding skill:', error);
        return false;
      }

      // Invalidate cache
      profileCache.clearUser(userId);

      return true;
    } catch (error) {
      console.error('Error in addSkill:', error);
      return false;
    }
  }

  // Update user certifications
  static async updateCertifications(userId: string, certifications: UserCertification[]): Promise<boolean> {
    try {
      // Delete existing certifications
      await supabase
        .from('user_certifications')
        .delete()
        .eq('user_id', userId);

      // Insert new certifications
      if (certifications.length > 0) {
        const { error } = await supabase
          .from('user_certifications')
          .insert(certifications.map(cert => ({
            ...cert,
            user_id: userId
          })));

        if (error) {
          console.error('Error updating certifications:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in updateCertifications:', error);
      return false;
    }
  }

  // Update user languages
  static async updateLanguages(userId: string, languages: UserLanguage[]): Promise<boolean> {
    try {
      // Delete existing languages
      await supabase
        .from('user_languages')
        .delete()
        .eq('user_id', userId);

      // Insert new languages
      if (languages.length > 0) {
        const { error } = await supabase
          .from('user_languages')
          .insert(languages.map(lang => ({
            ...lang,
            user_id: userId
          })));

        if (error) {
          console.error('Error updating languages:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in updateLanguages:', error);
      return false;
    }
  }

  // Add or update a single certification
  static async addCertification(userId: string, certification: Omit<UserCertification, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_certifications')
        .insert({
          ...certification,
          user_id: userId,
          id: crypto.randomUUID()
        });

      if (error) {
        console.error('Error adding certification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addCertification:', error);
      return false;
    }
  }

  // Add or update a single language
  static async addLanguage(userId: string, language: Omit<UserLanguage, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_languages')
        .insert({
          ...language,
          user_id: userId,
          id: crypto.randomUUID()
        });

      if (error) {
        console.error('Error adding language:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addLanguage:', error);
      return false;
    }
  }

  // Update user status
  static async updateStatus(userId: string, status: 'online' | 'offline' | 'busy' | 'away', statusMessage?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          status,
          status_message: statusMessage,
          last_active: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateStatus:', error);
      return false;
    }
  }

  // Search profiles
  static async searchProfiles(filters: ProfileSearchFilters, limit: number = 20, offset: number = 0): Promise<UserProfile[]> {
    try {
      // Check cache first
      const cacheKey = getCacheKey.search(filters, limit, offset);
      const cachedResults = profileCache.get<UserProfile[]>(cacheKey);
      if (cachedResults) {
        return cachedResults;
      }

      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          skills:user_skills(*),
          certifications:user_certifications(*),
          languages:user_languages(*),
          team_member:team_members(*)
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters.skills && filters.skills.length > 0) {
        query = query.in('skills.name', filters.skills);
      }

      if (filters.departments && filters.departments.length > 0) {
        query = query.in('department', filters.departments);
      }

      if (filters.roles && filters.roles.length > 0) {
        query = query.in('role', filters.roles);
      }

      if (filters.availability) {
        query = query.eq('status', filters.availability);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.timezone) {
        query = query.eq('timezone', filters.timezone);
      }

      const { data, error } = await query
        .range(offset, offset + limit - 1)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error searching profiles:', error);
        return [];
      }

      const results = data.map(profile => this.transformProfileData(profile));
      
      // Cache the results
      profileCache.set(cacheKey, results, CACHE_TTL.SEARCH);
      
      return results;
    } catch (error) {
      console.error('Error in searchProfiles:', error);
      return [];
    }
  }

  // Get user performance analytics
  static async getPerformanceAnalytics(userId: string): Promise<UserPerformance | null> {
    try {
      // This would typically aggregate data from multiple tables
      // For now, we'll return a basic structure
      const { data, error } = await supabase
        .from('user_profiles')
        .select('performance_data')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching performance analytics:', error);
        return null;
      }

      return data.performance_data || {
        tasksCompleted: 0,
        tasksAssigned: 0,
        taskCompletionRate: 0,
        averageTaskTime: 0,
        onTimeCompletionRate: 0,
        ideasSubmitted: 0,
        ideasImplemented: 0,
        ideasVotedOn: 0,
        ideaSuccessRate: 0,
        projectsInvolved: 0,
        projectsLed: 0,
        projectSuccessRate: 0,
        collaborationsCount: 0,
        teamSatisfactionScore: 0,
        communicationScore: 0,
        skillsAdded: 0,
        certificationsEarned: 0,
        learningHours: 0,
        achievementsEarned: 0,
        peerRecognition: 0,
        managerRecognition: 0
      };
    } catch (error) {
      console.error('Error in getPerformanceAnalytics:', error);
      return null;
    }
  }

  // Get user activity data
  static async getActivityData(userId: string): Promise<UserActivity | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('activity_data')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching activity data:', error);
        return null;
      }

      return data.activity_data || {
        lastActive: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 0,
        sessionDuration: 0,
        mostActiveHours: [],
        mostActiveDays: [],
        activityStreak: 0,
        longestStreak: 0,
        featuresUsed: [],
        mostUsedFeatures: [],
        featureUsageStats: {},
        messagesSent: 0,
        meetingsAttended: 0,
        meetingsHosted: 0,
        commentsPosted: 0,
        filesShared: 0
      };
    } catch (error) {
      console.error('Error in getActivityData:', error);
      return null;
    }
  }

  // Get profile analytics and insights
  static async getProfileAnalytics(userId: string): Promise<ProfileAnalytics | null> {
    try {
      // This would typically calculate analytics based on user data
      // For now, we'll return a basic structure
      return {
        productivityScore: 0,
        collaborationScore: 0,
        innovationScore: 0,
        leadershipScore: 0,
        productivityTrend: 'stable',
        skillGrowthRate: 0,
        activityTrend: 'stable',
        teamRanking: 0,
        departmentRanking: 0,
        skillRankings: {},
        skillRecommendations: [],
        collaborationRecommendations: [],
        goalRecommendations: []
      };
    } catch (error) {
      console.error('Error in getProfileAnalytics:', error);
      return null;
    }
  }

  // Update user preferences
  static async updatePreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      return false;
    }
  }

  // Update privacy settings
  static async updatePrivacySettings(userId: string, privacy: Partial<UserProfile['privacy']>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          privacy: privacy,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating privacy settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePrivacySettings:', error);
      return false;
    }
  }

  // Merge profiles (for handling duplicate accounts)
  static async mergeProfiles(sourceProfileId: string, targetProfileId: string, mergeReason: string, mergedBy: string): Promise<boolean> {
    try {
      // Get both profiles
      const sourceProfile = await this.getProfile(sourceProfileId);
      const targetProfile = await this.getProfile(targetProfileId);

      if (!sourceProfile || !targetProfile) {
        console.error('Source or target profile not found');
        return false;
      }

      // Start transaction
      const { error: mergeError } = await supabase.rpc('merge_profiles', {
        source_id: sourceProfileId,
        target_id: targetProfileId,
        merge_reason: mergeReason,
        merged_by: mergedBy
      });

      if (mergeError) {
        console.error('Error merging profiles:', mergeError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in mergeProfiles:', error);
      return false;
    }
  }

  // Soft delete profile (GDPR compliance)
  static async deleteProfile(userId: string, reason: string, scheduledFor?: string): Promise<boolean> {
    try {
      const deletionData = {
        deletion_status: 'pending_deletion',
        deletion_requested_at: new Date().toISOString(),
        deletion_reason: reason,
        is_active: false,
        deletion_scheduled_for: scheduledFor || null
      };


      const { error } = await supabase
        .from('user_profiles')
        .update(deletionData)
        .eq('id', userId);

      if (error) {
        console.error('Error deleting profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProfile:', error);
      return false;
    }
  }

  // Deactivate profile (temporary suspension)
  static async deactivateProfile(userId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          deletion_status: 'deactivated',
          deletion_requested_at: new Date().toISOString(),
          deletion_reason: reason,
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error deactivating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deactivateProfile:', error);
      return false;
    }
  }

  // Restore profile (undo deletion/deactivation)
  static async restoreProfile(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          deletion_status: 'active',
          deletion_requested_at: null,
          deletion_reason: null,
          deletion_scheduled_for: null,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error restoring profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in restoreProfile:', error);
      return false;
    }
  }

  // Export profile data (GDPR compliance)
  static async exportProfileData(userId: string): Promise<any> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      const performance = await this.getPerformanceAnalytics(userId);
      const activity = await this.getActivityData(userId);
      const analytics = await this.getProfileAnalytics(userId);

      // Get all related data
      const { data: skills } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId);

      const { data: certifications } = await supabase
        .from('user_certifications')
        .select('*')
        .eq('user_id', userId);

      const { data: languages } = await supabase
        .from('user_languages')
        .select('*')
        .eq('user_id', userId);

      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      const { data: timelineEvents } = await supabase
        .from('profile_timeline_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      return {
        profile,
        performance,
        activity,
        analytics,
        skills: skills || [],
        certifications: certifications || [],
        languages: languages || [],
        achievements: achievements || [],
        timelineEvents: timelineEvents || [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Error in exportProfileData:', error);
      throw error;
    }
  }

  // Permanently delete profile (after retention period)
  static async permanentlyDeleteProfile(userId: string): Promise<boolean> {
    try {
      // This should only be called after the retention period
      const { error } = await supabase
        .from('user_profiles')
        .update({
          deletion_status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('deletion_status', 'pending_deletion');

      if (error) {
        console.error('Error permanently deleting profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in permanentlyDeleteProfile:', error);
      return false;
    }
  }

  // Get profiles pending deletion (for cleanup job)
  static async getProfilesPendingDeletion(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('deletion_status', 'pending_deletion')
        .lte('deletion_scheduled_for', new Date().toISOString());

      if (error) {
        console.error('Error fetching profiles pending deletion:', error);
        return [];
      }

      return data.map(profile => this.transformProfileData(profile));
    } catch (error) {
      console.error('Error in getProfilesPendingDeletion:', error);
      return [];
    }
  }

  // Helper method to transform database data to UserProfile
  private static transformProfileData(data: any): UserProfile {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatar_url: data.avatar_url,
      role: data.role,
      created_at: data.created_at,
      updated_at: data.updated_at,
      firstName: data.first_name,
      lastName: data.last_name,
      displayName: data.display_name,
      bio: data.bio,
      phone: data.phone,
      location: data.location,
      timezone: data.timezone,
      website: data.website,
      linkedin: data.linkedin,
      twitter: data.twitter,
      github: data.github,
      jobTitle: data.job_title,
      department: data.department,
      manager: data.manager,
      directReports: data.direct_reports || [],
      hireDate: data.hire_date,
      employeeId: data.employee_id,
      workLocation: data.work_location,
      skills: data.skills || [],
      certifications: data.certifications || [],
      languages: data.languages || [],
      interests: data.interests || [],
      status: data.status || 'offline',
      availability: data.availability || { isAvailable: true, workingDays: [1, 2, 3, 4, 5], workingHours: DEFAULT_WORKING_HOURS, timezone: data.timezone || 'UTC', vacationMode: false },
      workingHours: data.working_hours || DEFAULT_WORKING_HOURS,
      preferences: data.preferences || DEFAULT_USER_PREFERENCES,
      privacy: data.privacy || DEFAULT_PRIVACY_SETTINGS,
      performance: data.performance_data || {},
      activity: data.activity_data || {},
      teamMember: data.team_member,
      teamRole: data.team_role,
      permissions: data.permissions || [],
      connections: data.connections || [],
      collaborations: data.collaborations || [],
      achievements: data.achievements || [],
      isActive: data.is_active || true,
      lastLogin: data.last_login,
      profileCompletion: data.profile_completion || 0,
      onboardingCompleted: data.onboarding_completed || false,
      universalId: data.universal_id || data.id,
      version: data.version || 1,
      versionHistory: data.version_history || [],
      mediaStorage: data.media_storage || { used: 0, limit: 1000000000, files: [] },
      dataRetention: data.data_retention || { policy: 'standard', retentionPeriod: 365, autoDelete: false },
      gdprConsent: data.gdpr_consent || { given: false, date: null, version: '1.0' },
      deletionStatus: data.deletion_status || { status: 'active', requestedAt: null, scheduledFor: null, reason: null },
      mergeHistory: data.merge_history || []
    };
  }
}

export default ProfileService;
