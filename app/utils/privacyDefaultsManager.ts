/**
 * Privacy Defaults Utility
 * Ensures sensible privacy defaults are applied to new and existing profiles
 */

import { PrivacySettings, DEFAULT_PRIVACY_SETTINGS, UserPreferences, DEFAULT_USER_PREFERENCES } from '@/types/profile';
import { ProfileService } from '@/services/profileService';

export class PrivacyDefaultsManager {
  
  /**
   * Apply privacy defaults to a new user profile
   */
  static getPrivacyDefaults(): PrivacySettings {
    return {
      ...DEFAULT_PRIVACY_SETTINGS,
      // Override with more conservative defaults for new users
      contactInfoVisibility: 'team', // Contact info → team only
      activityVisibility: 'team',    // Activity logs → team  
      notesVisibility: 'private',    // Notes → private
      showLastActive: false,         // Don't show last active by default
      allowSearchIndexing: false,    // Privacy-first for new users
    };
  }

  /**
   * Apply notification preferences defaults optimized for user experience
   */
  static getNotificationDefaults() {
    return {
      ...DEFAULT_USER_PREFERENCES.notifications,
      // Optimize for less noise
      frequency: 'daily' as const, // Daily digest instead of immediate
      marketing: false, // No marketing emails by default
      types: {
        mentions: true,      // Important for collaboration
        tasks: true,         // Important for work
        meetings: true,      // Important for scheduling
        ideas: false,        // Can be overwhelming for new users
        projects: true,      // Important for project work
        teamUpdates: false,  // Can be overwhelming initially
        achievements: true,  // Positive reinforcement
      },
      quietHours: {
        enabled: true,
        start: '18:00',     // Default quiet hours 6 PM to 8 AM
        end: '08:00',
      },
    };
  }

  /**
   * Apply dashboard preferences defaults for new users
   */
  static getDashboardDefaults() {
    return {
      ...DEFAULT_USER_PREFERENCES.dashboard,
      layout: 'comfortable' as const,
      widgets: [
        'profile_completion',
        'recent_activity', 
        'upcoming_tasks',
        'team_updates'
      ], // Essential widgets for new users
      showMetrics: false, // Don't overwhelm new users with metrics
    };
  }

  /**
   * Get complete user preferences with privacy-conscious defaults
   */
  static getUserPreferencesDefaults(): UserPreferences {
    return {
      ...DEFAULT_USER_PREFERENCES,
      notifications: this.getNotificationDefaults(),
      dashboard: this.getDashboardDefaults(),
      communication: {
        ...DEFAULT_USER_PREFERENCES.communication,
        responseTime: 'within_day' as const, // More realistic default
      }
    };
  }

  /**
   * Update existing profiles to use improved privacy defaults
   * This can be used for migration or user-initiated privacy updates
   */
  static async updateProfilePrivacyDefaults(userId: string): Promise<boolean> {
    try {
      const currentProfile = await ProfileService.getProfile(userId);
      if (!currentProfile) {
        return false;
      }

      // Only update if user hasn't customized their privacy settings
      const hasCustomPrivacy = currentProfile.privacy && 
        (currentProfile.privacy.contactInfoVisibility !== 'team' ||
         currentProfile.privacy.activityVisibility !== 'team' ||
         currentProfile.privacy.showLastActive !== true);

      if (!hasCustomPrivacy) {
        // Apply updated privacy defaults
        const updatedPrivacy = this.getPrivacyDefaults();
        const success = await ProfileService.updateProfile(userId, {
          privacy: updatedPrivacy,
          preferences: this.getUserPreferencesDefaults()
        });

        if (success) {
          console.log('✅ Privacy defaults updated for user', userId);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Failed to update privacy defaults for user', userId, error);
      return false;
    }
  }

  /**
   * Batch update privacy defaults for multiple users
   * Useful for system-wide privacy improvements
   */
  static async batchUpdatePrivacyDefaults(userIds: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = userIds.map(async (userId) => {
      try {
        const updated = await this.updateProfilePrivacyDefaults(userId);
        if (updated) {
          success++;
        }
      } catch (error) {
        console.error(`Failed to update privacy for user ${userId}:`, error);
        failed++;
      }
    });

    await Promise.allSettled(promises);

    console.log(`Privacy defaults batch update complete: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Validate privacy settings against current best practices
   */
  static validatePrivacySettings(privacy: PrivacySettings): {
    isSecure: boolean;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let isSecure = true;

    // Check for overly permissive settings
    if (privacy.contactInfoVisibility === 'public') {
      recommendations.push('Consider setting contact info visibility to "team" for better privacy');
      isSecure = false;
    }

    if (privacy.activityVisibility === 'public') {
      recommendations.push('Consider setting activity visibility to "team" to limit exposure');
      isSecure = false;
    }

    if (privacy.notesVisibility !== 'private') {
      recommendations.push('Consider setting notes visibility to "private" for maximum privacy');
      isSecure = false;
    }

    if (privacy.showLastActive && privacy.profileVisibility === 'public') {
      recommendations.push('Consider hiding last active status for public profiles');
    }

    if (privacy.allowSearchIndexing && privacy.profileVisibility !== 'public') {
      recommendations.push('Search indexing is enabled but profile is not public - consider disabling');
    }

    return { isSecure, recommendations };
  }
}

export default PrivacyDefaultsManager;