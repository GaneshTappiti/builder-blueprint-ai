import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { ProfileService } from '@/services/profileService';

// Test database configuration
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'test-key';
const supabase = createClient(supabaseUrl, supabaseKey);

describe('Profile Integration Tests', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    if (authError) {
      throw new Error(`Failed to create test user: ${authError.message}`);
    }

    testUserId = authData.user?.id || '';
  });

  afterAll(async () => {
    // Clean up test user
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  beforeEach(async () => {
    // Clean up any existing test data
    if (testUserId) {
      await supabase.from('user_profiles').delete().eq('id', testUserId);
    }
  });

  describe('Profile CRUD Operations', () => {
    it('should create a new profile', async () => {
      const initialData = {
        email: 'test@example.com',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        bio: 'Test bio',
        jobTitle: 'Developer',
        location: 'Test City',
        timezone: 'UTC'
      };

      const result = await ProfileService.createProfile(testUserId, initialData);
      expect(result).toBe(true);

      // Verify profile was created
      const profile = await ProfileService.getProfile(testUserId);
      expect(profile).toBeDefined();
      expect(profile?.email).toBe('test@example.com');
      expect(profile?.name).toBe('Test User');
    });

    it('should update profile information', async () => {
      // First create a profile
      await ProfileService.createProfile(testUserId, {
        email: 'test@example.com',
        name: 'Test User'
      });

      const updates = {
        bio: 'Updated bio',
        jobTitle: 'Senior Developer',
        location: 'New City'
      };

      const result = await ProfileService.updateProfile(testUserId, updates);
      expect(result).toBe(true);

      // Verify updates
      const profile = await ProfileService.getProfile(testUserId);
      expect(profile?.bio).toBe('Updated bio');
      expect(profile?.jobTitle).toBe('Senior Developer');
      expect(profile?.location).toBe('New City');
    });

    it('should add skills to profile', async () => {
      await ProfileService.createProfile(testUserId, {
        email: 'test@example.com',
        name: 'Test User'
      });

      const skill = {
        name: 'JavaScript',
        category: 'technical' as const,
        level: 'advanced' as const,
        yearsOfExperience: 5,
        verified: false,
        endorsements: 0,
        endorsers: [],
        isPublic: true
      };

      const result = await ProfileService.addSkill(testUserId, skill);
      expect(result).toBe(true);

      // Verify skill was added
      const profile = await ProfileService.getProfile(testUserId);
      expect(profile?.skills).toHaveLength(1);
      expect(profile?.skills[0].name).toBe('JavaScript');
    });

    it('should add certifications to profile', async () => {
      await ProfileService.createProfile(testUserId, {
        email: 'test@example.com',
        name: 'Test User'
      });

      const certification = {
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        issueDate: '2023-01-01',
        isVerified: true,
        isPublic: true
      };

      const result = await ProfileService.addCertification(testUserId, certification);
      expect(result).toBe(true);

      // Verify certification was added
      const profile = await ProfileService.getProfile(testUserId);
      expect(profile?.certifications).toHaveLength(1);
      expect(profile?.certifications[0].name).toBe('AWS Certified Developer');
    });

    it('should add languages to profile', async () => {
      await ProfileService.createProfile(testUserId, {
        email: 'test@example.com',
        name: 'Test User'
      });

      const language = {
        language: 'Spanish',
        proficiency: 'professional' as const,
        isPublic: true
      };

      const result = await ProfileService.addLanguage(testUserId, language);
      expect(result).toBe(true);

      // Verify language was added
      const profile = await ProfileService.getProfile(testUserId);
      expect(profile?.languages).toHaveLength(1);
      expect(profile?.languages[0].language).toBe('Spanish');
    });
  });

  describe('Profile Search', () => {
    beforeEach(async () => {
      // Create test profiles with different skills
      const profiles = [
        {
          id: 'user1',
          email: 'user1@example.com',
          name: 'User One',
          skills: [{ name: 'JavaScript', category: 'technical', level: 'advanced', yearsOfExperience: 5, verified: false, endorsements: 0, endorsers: [], isPublic: true }]
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          name: 'User Two',
          skills: [{ name: 'Python', category: 'technical', level: 'intermediate', yearsOfExperience: 3, verified: false, endorsements: 0, endorsers: [], isPublic: true }]
        }
      ];

      for (const profileData of profiles) {
        await ProfileService.createProfile(profileData.id, profileData);
        if (profileData.skills) {
          await ProfileService.updateSkills(profileData.id, profileData.skills);
        }
      }
    });

    it('should search profiles by skills', async () => {
      const filters = { skills: ['JavaScript'] };
      const results = await ProfileService.searchProfiles(filters, 10, 0);
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('User One');
    });

    it('should search profiles by multiple criteria', async () => {
      const filters = { 
        skills: ['Python'],
        availability: 'online' as const
      };
      const results = await ProfileService.searchProfiles(filters, 10, 0);
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('User Two');
    });
  });

  describe('Profile Deletion and GDPR', () => {
    beforeEach(async () => {
      await ProfileService.createProfile(testUserId, {
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Test bio'
      });
    });

    it('should soft delete profile', async () => {
      const result = await ProfileService.deleteProfile(testUserId, 'User requested deletion');
      expect(result).toBe(true);

      // Verify profile is marked for deletion
      const profile = await ProfileService.getProfile(testUserId);
      expect(profile?.deletionStatus).toBe('pending_deletion');
      expect(profile?.isActive).toBe(false);
    });

    it('should deactivate profile', async () => {
      const result = await ProfileService.deactivateProfile(testUserId, 'Temporary suspension');
      expect(result).toBe(true);

      // Verify profile is deactivated
      const profile = await ProfileService.getProfile(testUserId);
      expect(profile?.deletionStatus).toBe('deactivated');
      expect(profile?.isActive).toBe(false);
    });

    it('should restore profile', async () => {
      // First deactivate
      await ProfileService.deactivateProfile(testUserId, 'Temporary suspension');
      
      // Then restore
      const result = await ProfileService.restoreProfile(testUserId);
      expect(result).toBe(true);

      // Verify profile is restored
      const profile = await ProfileService.getProfile(testUserId);
      expect(profile?.deletionStatus).toBe('active');
      expect(profile?.isActive).toBe(true);
    });

    it('should export profile data', async () => {
      // Add some data to export
      await ProfileService.addSkill(testUserId, {
        name: 'JavaScript',
        category: 'technical',
        level: 'advanced',
        yearsOfExperience: 5,
        verified: false,
        endorsements: 0,
        endorsers: [],
        isPublic: true
      });

      const exportData = await ProfileService.exportProfileData(testUserId);
      
      expect(exportData).toBeDefined();
      expect(exportData.profile).toBeDefined();
      expect(exportData.skills).toHaveLength(1);
      expect(exportData.exportDate).toBeDefined();
      expect(exportData.version).toBe('1.0');
    });
  });

  describe('Profile Merge', () => {
    let sourceUserId: string;
    let targetUserId: string;

    beforeEach(async () => {
      // Create source profile
      const { data: sourceAuth } = await supabase.auth.signUp({
        email: 'source@example.com',
        password: 'testpassword123'
      });
      sourceUserId = sourceAuth.user?.id || '';

      // Create target profile
      const { data: targetAuth } = await supabase.auth.signUp({
        email: 'target@example.com',
        password: 'testpassword123'
      });
      targetUserId = targetAuth.user?.id || '';

      // Create profiles
      await ProfileService.createProfile(sourceUserId, {
        email: 'source@example.com',
        name: 'Source User',
        bio: 'Source bio'
      });

      await ProfileService.createProfile(targetUserId, {
        email: 'target@example.com',
        name: 'Target User',
        bio: 'Target bio'
      });
    });

    afterEach(async () => {
      // Clean up test users
      if (sourceUserId) await supabase.auth.admin.deleteUser(sourceUserId);
      if (targetUserId) await supabase.auth.admin.deleteUser(targetUserId);
    });

    it('should merge profiles', async () => {
      const result = await ProfileService.mergeProfiles(
        sourceUserId, 
        targetUserId, 
        'Duplicate accounts', 
        testUserId
      );
      
      expect(result).toBe(true);

      // Verify source profile is marked as merged
      const sourceProfile = await ProfileService.getProfile(sourceUserId);
      expect(sourceProfile?.mergedTo).toBe(targetUserId);
      expect(sourceProfile?.isActive).toBe(false);

      // Verify target profile has merge history
      const targetProfile = await ProfileService.getProfile(targetUserId);
      expect(targetProfile?.mergedFrom).toContain(sourceUserId);
      expect(targetProfile?.mergeHistory).toHaveLength(1);
    });
  });
});
