/**
 * Auth Flow Edge Case Utilities
 * Handles retry logic for profile creation failures and OAuth refresh token scenarios
 */

import { supabase } from '@/lib/supabase';
import { ProfileService } from '@/services/profileService';
import { PrivacyDefaultsManager } from './privacyDefaultsManager';

export interface AuthEventInfo {
  event: string;
  session: any;
  isNewUser: boolean;
  isOAuthRefresh: boolean;
  needsProfileSetup: boolean;
}

export class AuthFlowManager {
  private static readonly NEW_USER_WINDOW_MS = 300000; // 5 minutes
  private static readonly PROFILE_CREATION_RETRY_ATTEMPTS = 3;
  private static readonly PROFILE_CREATION_RETRY_DELAY = 2000; // 2 seconds

  /**
   * Analyzes auth event to determine user state and required actions
   */
  static async analyzeAuthEvent(event: string, session: any): Promise<AuthEventInfo> {
    const authEventInfo: AuthEventInfo = {
      event,
      session,
      isNewUser: false,
      isOAuthRefresh: false,
      needsProfileSetup: false
    };

    if (!session?.user) {
      return authEventInfo;
    }

    const user = session.user;
    const now = new Date();
    const userCreatedAt = new Date(user.created_at);
    const lastSignInAt = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;

    // Determine if this is a new user vs OAuth refresh
    const timeSinceCreation = now.getTime() - userCreatedAt.getTime();
    const timeSinceLastSignIn = lastSignInAt ? now.getTime() - lastSignInAt.getTime() : Infinity;

    // Check if this is truly a new user (created recently) vs OAuth refresh token
    authEventInfo.isNewUser = timeSinceCreation < this.NEW_USER_WINDOW_MS;
    
    // OAuth refresh is when:
    // 1. User was created more than 5 minutes ago, AND
    // 2. Last sign-in was recent (less than 1 hour), AND
    // 3. Time since creation is much larger than time since last sign-in
    authEventInfo.isOAuthRefresh = !authEventInfo.isNewUser && 
                                   timeSinceLastSignIn < 3600000 && // Less than 1 hour since last sign-in
                                   timeSinceCreation > timeSinceLastSignIn * 10; // Much older account

    console.log('🔍 AuthFlowManager: Analyzing auth event', {
      event,
      userEmail: user.email,
      userCreatedAt: userCreatedAt.toISOString(),
      lastSignInAt: lastSignInAt?.toISOString(),
      timeSinceCreation,
      timeSinceLastSignIn,
      isNewUser: authEventInfo.isNewUser,
      isOAuthRefresh: authEventInfo.isOAuthRefresh
    });

    // Check if profile setup is needed
    if (authEventInfo.isNewUser || (!authEventInfo.isOAuthRefresh && event === 'SIGNED_IN')) {
      authEventInfo.needsProfileSetup = await this.checkProfileSetupRequired(user.id);
    }

    return authEventInfo;
  }

  /**
   * Checks if user profile setup is required with retry logic
   */
  static async checkProfileSetupRequired(userId: string): Promise<boolean> {
    try {
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('onboardingCompleted, profile_creation_status')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('⚠️ AuthFlowManager: Could not check profile status', error);
        
        // If profile doesn't exist, trigger creation with retry
        const profileCreated = await this.ensureProfileExists(userId);
        return !profileCreated; // If profile creation failed, user needs setup
      }

      // Check if onboarding is completed and profile creation was successful
      const needsSetup = !profileData?.onboardingCompleted || 
                        profileData?.profile_creation_status === 'failed';

      console.log('🔍 AuthFlowManager: Profile setup check', {
        userId,
        onboardingCompleted: profileData?.onboardingCompleted,
        profileCreationStatus: profileData?.profile_creation_status,
        needsSetup
      });

      return needsSetup;
    } catch (error) {
      console.error('❌ AuthFlowManager: Error checking profile setup', error);
      return true; // Assume setup is needed if we can't check
    }
  }

  /**
   * Ensures user profile exists with retry logic for failed creations
   */
  static async ensureProfileExists(userId: string): Promise<boolean> {
    for (let attempt = 1; attempt <= this.PROFILE_CREATION_RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`🔄 AuthFlowManager: Profile creation attempt ${attempt}/${this.PROFILE_CREATION_RETRY_ATTEMPTS} for user ${userId}`);

        // Check if profile already exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('user_profiles')
          .select('id, profile_creation_status')
          .eq('id', userId)
          .single();

        if (!checkError && existingProfile) {
          console.log('✅ AuthFlowManager: Profile already exists', {
            userId,
            profileCreationStatus: existingProfile.profile_creation_status
          });
          return existingProfile.profile_creation_status !== 'failed';
        }

        // Get user details for profile creation
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('❌ AuthFlowManager: Could not get user for profile creation', userError);
          continue;
        }

        // Create profile with retry logic
        const success = await ProfileService.createProfile(userId, {
          firstName: user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          displayName: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          avatar_url: user.user_metadata?.avatar_url,
          onboardingCompleted: false,
          // Apply privacy-conscious defaults from the start
          privacy: PrivacyDefaultsManager.getPrivacyDefaults(),
          preferences: PrivacyDefaultsManager.getUserPreferencesDefaults()
        });

        if (success) {
          console.log('✅ AuthFlowManager: Profile created successfully', { userId, attempt });
          return true;
        } else {
          console.warn(`⚠️ AuthFlowManager: Profile creation failed on attempt ${attempt}`, { userId });
        }

      } catch (error) {
        console.error(`❌ AuthFlowManager: Profile creation error on attempt ${attempt}`, error);
      }

      // Wait before retry (except on last attempt)
      if (attempt < this.PROFILE_CREATION_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, this.PROFILE_CREATION_RETRY_DELAY));
      }
    }

    console.error('❌ AuthFlowManager: All profile creation attempts failed', { userId });
    
    // Mark profile as failed if it exists
    try {
      await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          profile_creation_error: 'Failed to create profile after multiple attempts',
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('❌ AuthFlowManager: Could not mark profile as failed', error);
    }

    return false;
  }

  /**
   * Determines appropriate redirect based on auth event analysis
   */
  static getRedirectPath(authEventInfo: AuthEventInfo, defaultRedirect: string = '/workspace'): string {
    if (authEventInfo.isOAuthRefresh) {
      console.log('🔄 AuthFlowManager: OAuth refresh detected, redirecting to workspace');
      return defaultRedirect;
    }

    if (authEventInfo.needsProfileSetup) {
      console.log('🆕 AuthFlowManager: Profile setup needed, redirecting to setup');
      return '/profile/setup';
    }

    console.log('✅ AuthFlowManager: User ready, redirecting to workspace');
    return defaultRedirect;
  }

  /**
   * Forces profile setup redirect for edge cases
   */
  static forceProfileSetup(): string {
    console.log('🚨 AuthFlowManager: Forcing profile setup due to edge case');
    return '/profile/setup';
  }
}