// Tests for LocalStorageMigration service

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { localStorageMigration } from '@/services/LocalStorageMigration';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: { code: 'PGRST116' } // No rows returned
        }))
      }))
    })),
    upsert: vi.fn(() => ({
      data: { id: 'test-id' },
      error: null
    }))
  })),
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: 'test-user-id' } },
      error: null
    }))
  }
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
  getCurrentUser: vi.fn(() => Promise.resolve({ id: 'test-user-id' }))
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('LocalStorageMigration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isMigrationComplete', () => {
    it('should return false when migration flag is not set', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: 'PGRST116' }
            }))
          }))
        }))
      });

      const result = await localStorageMigration.isMigrationComplete();
      expect(result).toBe(false);
    });

    it('should return true when migration flag is set', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { value: true },
              error: null
            }))
          }))
        }))
      });

      const result = await localStorageMigration.isMigrationComplete();
      expect(result).toBe(true);
    });
  });

  describe('migrateAllData', () => {
    it('should skip migration if already complete', async () => {
      // Mock migration already complete
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { value: true },
              error: null
            }))
          }))
        }))
      });

      const result = await localStorageMigration.migrateAllData();
      
      expect(result.success).toBe(true);
      expect(result.migrated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should migrate localStorage data to Supabase', async () => {
      // Mock migration not complete
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: 'PGRST116' }
            }))
          }))
        })),
        upsert: vi.fn(() => ({
          data: { id: 'test-id' },
          error: null
        }))
      });

      // Mock localStorage data
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'ideaVault') {
          return JSON.stringify([
            { id: 'idea-1', title: 'Test Idea', description: 'Test Description' }
          ]);
        }
        return null;
      });

      const result = await localStorageMigration.migrateAllData();
      
      expect(result.success).toBe(true);
      expect(result.migrated).toBeGreaterThan(0);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ideaVault');
    });

    it('should handle migration errors gracefully', async () => {
      // Mock migration not complete
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: 'PGRST116' }
            }))
          }))
        })),
        upsert: vi.fn(() => ({
          data: null,
          error: new Error('Database error')
        }))
      });

      // Mock localStorage data
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'ideaVault') {
          return JSON.stringify([
            { id: 'idea-1', title: 'Test Idea', description: 'Test Description' }
          ]);
        }
        return null;
      });

      const result = await localStorageMigration.migrateAllData();
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getMigrationStatus', () => {
    it('should return correct status when user is authenticated', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: 'PGRST116' }
            }))
          }))
        }))
      });

      const status = await localStorageMigration.getMigrationStatus();
      
      expect(status.isComplete).toBe(false);
      expect(status.canMigrate).toBe(true);
      expect(status.error).toBeUndefined();
    });

    it('should return error when user is not authenticated', async () => {
      // Mock getCurrentUser to throw error
      const { getCurrentUser } = await import('@/lib/supabase');
      vi.mocked(getCurrentUser).mockRejectedValue(new Error('Not authenticated'));

      const status = await localStorageMigration.getMigrationStatus();
      
      expect(status.isComplete).toBe(false);
      expect(status.canMigrate).toBe(false);
      expect(status.error).toBe('Not authenticated');
    });
  });
});
