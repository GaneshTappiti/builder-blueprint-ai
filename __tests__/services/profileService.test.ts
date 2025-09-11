import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ProfileService } from '@/services/profileService';
import { UserProfile, UserSkill, UserCertification, UserLanguage } from '@/types/profile';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    insert: jest.fn(() => ({
      data: null,
      error: null
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: null,
        error: null
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: null,
        error: null
      }))
    })),
    rpc: jest.fn(() => ({
      data: null,
      error: null
    }))
  }))
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return profile data when successful', async () => {
      const mockProfile = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        first_name: 'Test',
        last_name: 'User',
        bio: 'Test bio',
        job_title: 'Developer',
        location: 'Test City',
        timezone: 'UTC',
        status: 'online',
        is_active: true,
        profile_completion: 80,
        onboarding_completed: true,
        skills: [],
        certifications: [],
        languages: [],
        achievements: [],
        team_member: null
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockProfile,
        error: null
      });

      const result = await ProfileService.getProfile('test-id');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-id');
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when profile not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' }
      });

      const result = await ProfileService.getProfile('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('createProfile', () => {
    it('should create profile with default values', async () => {
      const initialData = {
        email: 'test@example.com',
        name: 'Test User'
      };

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await ProfileService.createProfile('test-id', initialData);
      expect(result).toBe(true);
    });

    it('should handle creation errors', async () => {
      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' }
      });

      const result = await ProfileService.createProfile('test-id', {});
      expect(result).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updates = {
        bio: 'Updated bio',
        job_title: 'Senior Developer'
      };

      // Mock getProfile for profile completion calculation
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          id: 'test-id',
          first_name: 'Test',
          last_name: 'User',
          bio: 'Old bio',
          job_title: 'Developer',
          location: 'Test City',
          timezone: 'UTC',
          skills: [{ name: 'JavaScript' }]
        },
        error: null
      });

      mockSupabase.from().update().eq.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await ProfileService.updateProfile('test-id', updates);
      expect(result).toBe(true);
    });
  });

  describe('addSkill', () => {
    it('should add skill successfully', async () => {
      const skill: Omit<UserSkill, 'id'> = {
        name: 'JavaScript',
        category: 'technical',
        level: 'advanced',
        yearsOfExperience: 5,
        verified: false,
        endorsements: 0,
        endorsers: [],
        isPublic: true
      };

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await ProfileService.addSkill('test-id', skill);
      expect(result).toBe(true);
    });
  });

  describe('addCertification', () => {
    it('should add certification successfully', async () => {
      const certification: Omit<UserCertification, 'id'> = {
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        issueDate: '2023-01-01',
        isVerified: true,
        isPublic: true
      };

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await ProfileService.addCertification('test-id', certification);
      expect(result).toBe(true);
    });
  });

  describe('addLanguage', () => {
    it('should add language successfully', async () => {
      const language: Omit<UserLanguage, 'id'> = {
        language: 'Spanish',
        proficiency: 'professional',
        isPublic: true
      };

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await ProfileService.addLanguage('test-id', language);
      expect(result).toBe(true);
    });
  });

  describe('deleteProfile', () => {
    it('should soft delete profile successfully', async () => {
      mockSupabase.from().update().eq.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await ProfileService.deleteProfile('test-id', 'User requested deletion');
      expect(result).toBe(true);
    });
  });

  describe('deactivateProfile', () => {
    it('should deactivate profile successfully', async () => {
      mockSupabase.from().update().eq.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await ProfileService.deactivateProfile('test-id', 'Temporary suspension');
      expect(result).toBe(true);
    });
  });

  describe('restoreProfile', () => {
    it('should restore profile successfully', async () => {
      mockSupabase.from().update().eq.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await ProfileService.restoreProfile('test-id');
      expect(result).toBe(true);
    });
  });

  describe('exportProfileData', () => {
    it('should export all profile data', async () => {
      const mockProfile = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User'
      };

      // Mock all the data fetching calls
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockProfile,
        error: null
      });

      mockSupabase.from().select().eq.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await ProfileService.exportProfileData('test-id');
      
      expect(result).toBeDefined();
      expect(result.profile).toBeDefined();
      expect(result.exportDate).toBeDefined();
      expect(result.version).toBe('1.0');
    });
  });

  describe('mergeProfiles', () => {
    it('should merge profiles successfully', async () => {
      const sourceProfile = { id: 'source-id', name: 'Source User' };
      const targetProfile = { id: 'target-id', name: 'Target User' };

      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: sourceProfile, error: null })
        .mockResolvedValueOnce({ data: targetProfile, error: null });

      mockSupabase.from().rpc.mockResolvedValue({
        data: true,
        error: null
      });

      const result = await ProfileService.mergeProfiles('source-id', 'target-id', 'Duplicate accounts', 'admin-id');
      expect(result).toBe(true);
    });
  });

  describe('searchProfiles', () => {
    it('should search profiles with filters', async () => {
      const mockProfiles = [
        { id: '1', name: 'User 1', skills: [{ name: 'JavaScript' }] },
        { id: '2', name: 'User 2', skills: [{ name: 'Python' }] }
      ];

      mockSupabase.from().select().eq().in().range().order.mockResolvedValue({
        data: mockProfiles,
        error: null
      });

      const filters = { skills: ['JavaScript'] };
      const result = await ProfileService.searchProfiles(filters, 10, 0);
      
      expect(result).toHaveLength(2);
    });
  });
});
