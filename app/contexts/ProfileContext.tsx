"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { UserProfile, UserSkill, UserCertification, UserLanguage, UserPerformance, UserActivity, ProfileAnalytics, ProfileSearchFilters, DEFAULT_USER_PREFERENCES, DEFAULT_PRIVACY_SETTINGS } from '@/types/profile';
import ProfileService from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';

interface ProfileContextType {
  // State
  profile: UserProfile | null;
  performance: UserPerformance | null;
  activity: UserActivity | null;
  analytics: ProfileAnalytics | null;
  loading: boolean;
  error: string | null;

  // Profile Management
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  
  // Skills Management
  updateSkills: (skills: UserSkill[]) => Promise<boolean>;
  addSkill: (skill: Omit<UserSkill, 'id'>) => Promise<boolean>;
  removeSkill: (skillId: string) => Promise<boolean>;
  
  // Certifications Management
  updateCertifications: (certifications: UserCertification[]) => Promise<boolean>;
  addCertification: (certification: Omit<UserCertification, 'id'>) => Promise<boolean>;
  removeCertification: (certificationId: string) => Promise<boolean>;
  
  // Languages Management
  updateLanguages: (languages: UserLanguage[]) => Promise<boolean>;
  addLanguage: (language: Omit<UserLanguage, 'id'>) => Promise<boolean>;
  removeLanguage: (languageId: string) => Promise<boolean>;
  
  // Status and Availability
  updateStatus: (status: 'online' | 'offline' | 'busy' | 'away', statusMessage?: string) => Promise<boolean>;
  updateAvailability: (availability: Partial<UserProfile['availability']>) => Promise<boolean>;
  
  // Preferences and Settings
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<boolean>;
  updatePrivacySettings: (privacy: Partial<UserProfile['privacy']>) => Promise<boolean>;
  
  // Search and Discovery
  searchProfiles: (filters: ProfileSearchFilters, limit?: number, offset?: number) => Promise<UserProfile[]>;
  
  // Analytics and Insights
  refreshAnalytics: () => Promise<void>;
  refreshPerformance: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  
  // Profile Management (Advanced)
  mergeProfile: (sourceProfileId: string, targetProfileId: string, reason: string) => Promise<boolean>;
  deleteProfile: (reason: string, scheduledFor?: string) => Promise<boolean>;
  deactivateProfile: (reason: string) => Promise<boolean>;
  restoreProfile: () => Promise<boolean>;
  exportProfileData: () => Promise<any>;
  
  // Utility Functions
  clearError: () => void;
  getProfileCompletion: () => number;
  isProfileComplete: () => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [performance, setPerformance] = useState<UserPerformance | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize profile when user changes
  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setPerformance(null);
      setActivity(null);
      setAnalytics(null);
    }
  }, [user]);

  // Load user profile
  const loadProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const profileData = await ProfileService.getCurrentProfile();
      if (profileData) {
        setProfile(profileData);
      } else {
        // Create profile if it doesn't exist
        const created = await ProfileService.createProfile(user.id, {
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          bio: user.bio,
          phone: user.phone,
          location: user.location,
          timezone: user.timezone,
          jobTitle: user.jobTitle,
          department: typeof user.department === 'string' ? { id: '', name: user.department, description: '', color: '', icon: '', memberCount: 0, isActive: true, createdBy: '', createdAt: '' } : user.department,
          status: user.status || 'offline',
          profileCompletion: user.profileCompletion || 0,
          lastLogin: user.lastLogin
        });

        if (created) {
          const newProfile = await ProfileService.getCurrentProfile();
          setProfile(newProfile);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user || !profile) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.updateProfile(user.id, updates);
      if (success) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        return true;
      } else {
        setError('Failed to update profile');
        return false;
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, profile, toast]);

  // Refresh profile data
  const refreshProfile = useCallback(async (): Promise<void> => {
    await loadProfile();
  }, [loadProfile]);

  // Skills Management
  const updateSkills = useCallback(async (skills: UserSkill[]): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.updateSkills(user.id, skills);
      if (success) {
        setProfile(prev => prev ? { ...prev, skills } : null);
        toast({
          title: "Skills Updated",
          description: "Your skills have been updated successfully.",
        });
        return true;
      } else {
        setError('Failed to update skills');
        return false;
      }
    } catch (err) {
      console.error('Error updating skills:', err);
      setError('Failed to update skills');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addSkill = useCallback(async (skill: Omit<UserSkill, 'id'>): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.addSkill(user.id, skill);
      if (success) {
        await refreshProfile(); // Refresh to get updated skills
        toast({
          title: "Skill Added",
          description: "Your skill has been added successfully.",
        });
        return true;
      } else {
        setError('Failed to add skill');
        return false;
      }
    } catch (err) {
      console.error('Error adding skill:', err);
      setError('Failed to add skill');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, refreshProfile, toast]);

  const removeSkill = useCallback(async (skillId: string): Promise<boolean> => {
    if (!user || !profile) return false;

    const updatedSkills = profile.skills.filter(skill => skill.id !== skillId);
    return await updateSkills(updatedSkills);
  }, [user, profile, updateSkills]);

  // Certifications Management
  const updateCertifications = useCallback(async (certifications: UserCertification[]): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.updateCertifications(user.id, certifications);
      if (success) {
        setProfile(prev => prev ? { ...prev, certifications } : null);
        toast({
          title: "Certifications Updated",
          description: "Your certifications have been updated successfully.",
        });
        return true;
      } else {
        setError('Failed to update certifications');
        return false;
      }
    } catch (err) {
      console.error('Error updating certifications:', err);
      setError('Failed to update certifications');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addCertification = useCallback(async (certification: Omit<UserCertification, 'id'>): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.addCertification?.(user.id, certification);
      if (success) {
        await refreshProfile();
        toast({
          title: "Certification Added",
          description: "Your certification has been added successfully.",
        });
        return true;
      } else {
        setError('Failed to add certification');
        return false;
      }
    } catch (err) {
      console.error('Error adding certification:', err);
      setError('Failed to add certification');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, refreshProfile, toast]);

  const removeCertification = useCallback(async (certificationId: string): Promise<boolean> => {
    if (!user || !profile) return false;

    const updatedCertifications = profile.certifications.filter(cert => cert.id !== certificationId);
    return await updateCertifications(updatedCertifications);
  }, [user, profile, updateCertifications]);

  // Languages Management
  const updateLanguages = useCallback(async (languages: UserLanguage[]): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.updateLanguages(user.id, languages);
      if (success) {
        setProfile(prev => prev ? { ...prev, languages } : null);
        toast({
          title: "Languages Updated",
          description: "Your languages have been updated successfully.",
        });
        return true;
      } else {
        setError('Failed to update languages');
        return false;
      }
    } catch (err) {
      console.error('Error updating languages:', err);
      setError('Failed to update languages');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addLanguage = useCallback(async (language: Omit<UserLanguage, 'id'>): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.addLanguage?.(user.id, language);
      if (success) {
        await refreshProfile();
        toast({
          title: "Language Added",
          description: "Your language has been added successfully.",
        });
        return true;
      } else {
        setError('Failed to add language');
        return false;
      }
    } catch (err) {
      console.error('Error adding language:', err);
      setError('Failed to add language');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, refreshProfile, toast]);

  const removeLanguage = useCallback(async (languageId: string): Promise<boolean> => {
    if (!user || !profile) return false;

    const updatedLanguages = profile.languages.filter(lang => lang.id !== languageId);
    return await updateLanguages(updatedLanguages);
  }, [user, profile, updateLanguages]);

  // Status and Availability
  const updateStatus = useCallback(async (status: 'online' | 'offline' | 'busy' | 'away', statusMessage?: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.updateStatus(user.id, status, statusMessage);
      if (success) {
        setProfile(prev => prev ? { ...prev, status } : null);
        return true;
      } else {
        setError('Failed to update status');
        return false;
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateAvailability = useCallback(async (availability: Partial<UserProfile['availability']>): Promise<boolean> => {
    if (!user || !profile) return false;

    const updatedAvailability = { ...profile.availability, ...availability };
    return await updateProfile({ availability: updatedAvailability });
  }, [user, profile, updateProfile]);

  // Preferences and Settings
  const updatePreferences = useCallback(async (preferences: Partial<UserProfile['preferences']>): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.updatePreferences(user.id, preferences);
      if (success) {
        setProfile(prev => prev ? { 
          ...prev, 
          preferences: { ...prev.preferences, ...preferences }
        } : null);
        toast({
          title: "Preferences Updated",
          description: "Your preferences have been updated successfully.",
        });
        return true;
      } else {
        setError('Failed to update preferences');
        return false;
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updatePrivacySettings = useCallback(async (privacy: Partial<UserProfile['privacy']>): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.updatePrivacySettings(user.id, privacy);
      if (success) {
        setProfile(prev => prev ? { 
          ...prev, 
          privacy: { ...prev.privacy, ...privacy }
        } : null);
        toast({
          title: "Privacy Settings Updated",
          description: "Your privacy settings have been updated successfully.",
        });
        return true;
      } else {
        setError('Failed to update privacy settings');
        return false;
      }
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      setError('Failed to update privacy settings');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Search and Discovery
  const searchProfiles = useCallback(async (filters: ProfileSearchFilters, limit: number = 20, offset: number = 0): Promise<UserProfile[]> => {
    try {
      return await ProfileService.searchProfiles(filters, limit, offset);
    } catch (err) {
      console.error('Error searching profiles:', err);
      setError('Failed to search profiles');
      return [];
    }
  }, []);

  // Analytics and Insights
  const refreshAnalytics = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const analyticsData = await ProfileService.getProfileAnalytics(user.id);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error refreshing analytics:', err);
    }
  }, [user]);

  const refreshPerformance = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const performanceData = await ProfileService.getPerformanceAnalytics(user.id);
      setPerformance(performanceData);
    } catch (err) {
      console.error('Error refreshing performance:', err);
    }
  }, [user]);

  const refreshActivity = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const activityData = await ProfileService.getActivityData(user.id);
      setActivity(activityData);
    } catch (err) {
      console.error('Error refreshing activity:', err);
    }
  }, [user]);

  // Utility Functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getProfileCompletion = useCallback((): number => {
    return profile?.profileCompletion || 0;
  }, [profile]);

  const isProfileComplete = useCallback((): boolean => {
    return (profile?.profileCompletion || 0) >= 80;
  }, [profile]);

  // Profile Management (Advanced)
  const mergeProfile = useCallback(async (sourceProfileId: string, targetProfileId: string, reason: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.mergeProfiles(sourceProfileId, targetProfileId, reason, user.id);
      if (success) {
        toast({
          title: "Profiles Merged",
          description: "The profiles have been successfully merged.",
        });
        await refreshProfile(); // Refresh to get updated profile
      } else {
        setError('Failed to merge profiles');
      }
      return success;
    } catch (err) {
      console.error('Error merging profiles:', err);
      setError('Failed to merge profiles');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, refreshProfile, toast]);

  const deleteProfile = useCallback(async (reason: string, scheduledFor?: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.deleteProfile(user.id, reason, scheduledFor);
      if (success) {
        toast({
          title: "Profile Deletion Requested",
          description: "Your profile deletion has been scheduled.",
        });
        // Clear profile data
        setProfile(null);
        setPerformance(null);
        setActivity(null);
        setAnalytics(null);
      } else {
        setError('Failed to delete profile');
      }
      return success;
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError('Failed to delete profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const deactivateProfile = useCallback(async (reason: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.deactivateProfile(user.id, reason);
      if (success) {
        toast({
          title: "Profile Deactivated",
          description: "Your profile has been deactivated.",
        });
        // Update profile status
        setProfile(prev => prev ? { ...prev, isActive: false, deletionStatus: 'deactivated' } : null);
      } else {
        setError('Failed to deactivate profile');
      }
      return success;
    } catch (err) {
      console.error('Error deactivating profile:', err);
      setError('Failed to deactivate profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const restoreProfile = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await ProfileService.restoreProfile(user.id);
      if (success) {
        toast({
          title: "Profile Restored",
          description: "Your profile has been restored.",
        });
        await refreshProfile(); // Refresh to get updated profile
      } else {
        setError('Failed to restore profile');
      }
      return success;
    } catch (err) {
      console.error('Error restoring profile:', err);
      setError('Failed to restore profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, refreshProfile, toast]);

  const exportProfileData = useCallback(async (): Promise<any> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const exportData = await ProfileService.exportProfileData(user.id);
      toast({
        title: "Data Export Complete",
        description: "Your profile data has been exported successfully.",
      });
      return exportData;
    } catch (err) {
      console.error('Error exporting profile data:', err);
      setError('Failed to export profile data');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const value = {
    // State
    profile,
    performance,
    activity,
    analytics,
    loading,
    error,

    // Profile Management
    updateProfile,
    refreshProfile,

    // Skills Management
    updateSkills,
    addSkill,
    removeSkill,

    // Certifications Management
    updateCertifications,
    addCertification,
    removeCertification,

    // Languages Management
    updateLanguages,
    addLanguage,
    removeLanguage,

    // Status and Availability
    updateStatus,
    updateAvailability,

    // Preferences and Settings
    updatePreferences,
    updatePrivacySettings,

    // Search and Discovery
    searchProfiles,

    // Analytics and Insights
    refreshAnalytics,
    refreshPerformance,
    refreshActivity,

    // Profile Management (Advanced)
    mergeProfile,
    deleteProfile,
    deactivateProfile,
    restoreProfile,
    exportProfileData,

    // Utility Functions
    clearError,
    getProfileCompletion,
    isProfileComplete
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
