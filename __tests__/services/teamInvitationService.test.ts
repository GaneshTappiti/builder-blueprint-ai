import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import TeamInvitationService from '@/services/teamInvitationService';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}));

describe('TeamInvitationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache and rate limit maps
    (TeamInvitationService as any).cache.clear();
    (TeamInvitationService as any).rateLimitMap.clear();
  });

  describe('sendInvitation', () => {
    it('should send invitation successfully', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'test@example.com',
        role: 'Developer',
        department: 'Engineering',
        status: 'pending'
      };

      const mockRpc = require('@/lib/supabase').supabase.rpc;
      mockRpc.mockResolvedValue({
        data: {
          success: true,
          invitationId: 'inv-123'
        },
        error: null
      });

      const result = await TeamInvitationService.sendInvitation(
        {
          teamId: 'team-123',
          inviteeEmail: 'test@example.com',
          role: 'Developer',
          department: 'Engineering'
        },
        'user-123',
        'John Doe'
      );

      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith('send_team_invitation', expect.any(Object));
    });

    it('should handle rate limiting', async () => {
      // Simulate rate limit exceeded
      const mockRpc = require('@/lib/supabase').supabase.rpc;
      mockRpc.mockResolvedValue({
        data: { success: false, error: 'Rate limit exceeded' },
        error: null
      });

      // Send multiple requests to trigger rate limiting
      for (let i = 0; i < 12; i++) {
        await TeamInvitationService.sendInvitation(
          {
            teamId: 'team-123',
            inviteeEmail: `test${i}@example.com`,
            role: 'Developer',
            department: 'Engineering'
          },
          'user-123',
          'John Doe'
        );
      }

      // The 11th request should be rate limited
      const result = await TeamInvitationService.sendInvitation(
        {
          teamId: 'team-123',
          inviteeEmail: 'test11@example.com',
          role: 'Developer',
          department: 'Engineering'
        },
        'user-123',
        'John Doe'
      );

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should validate email format', async () => {
      const result = await TeamInvitationService.sendInvitation(
        {
          teamId: 'team-123',
          inviteeEmail: 'invalid-email',
          role: 'Developer',
          department: 'Engineering'
        },
        'user-123',
        'John Doe'
      );

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_EMAIL');
    });

    it('should validate role', async () => {
      const result = await TeamInvitationService.sendInvitation(
        {
          teamId: 'team-123',
          inviteeEmail: 'test@example.com',
          role: 'Invalid Role',
          department: 'Engineering'
        },
        'user-123',
        'John Doe'
      );

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_ROLE');
    });

    it('should validate department', async () => {
      const result = await TeamInvitationService.sendInvitation(
        {
          teamId: 'team-123',
          inviteeEmail: 'test@example.com',
          role: 'Developer',
          department: 'Invalid Department'
        },
        'user-123',
        'John Doe'
      );

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_DEPARTMENT');
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation successfully', async () => {
      const mockRpc = require('@/lib/supabase').supabase.rpc;
      mockRpc.mockResolvedValue({
        data: {
          success: true,
          invitation: {
            id: 'inv-123',
            status: 'accepted'
          }
        },
        error: null
      });

      const result = await TeamInvitationService.acceptInvitation('inv-123', 'user-123');

      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith('accept_team_invitation', expect.any(Object));
    });

    it('should handle acceptance failure', async () => {
      const mockRpc = require('@/lib/supabase').supabase.rpc;
      mockRpc.mockResolvedValue({
        data: {
          success: false,
          error: 'User already in another team'
        },
        error: null
      });

      const result = await TeamInvitationService.acceptInvitation('inv-123', 'user-123');

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('ACCEPT_FAILED');
    });
  });

  describe('declineInvitation', () => {
    it('should decline invitation successfully', async () => {
      const mockRpc = require('@/lib/supabase').supabase.rpc;
      mockRpc.mockResolvedValue({
        data: {
          success: true,
          invitation: {
            id: 'inv-123',
            status: 'declined'
          }
        },
        error: null
      });

      const result = await TeamInvitationService.declineInvitation('inv-123', 'user-123');

      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith('decline_team_invitation', expect.any(Object));
    });
  });

  describe('getPendingInvitations', () => {
    it('should return cached invitations when available', async () => {
      const mockInvitations = [
        {
          id: 'inv-1',
          email: 'test1@example.com',
          role: 'Developer',
          department: 'Engineering',
          status: 'pending'
        }
      ];

      // Set cache
      (TeamInvitationService as any).setCache('invitations_user-123', mockInvitations);

      const result = await TeamInvitationService.getPendingInvitations('user-123');

      expect(result).toEqual(mockInvitations);
    });

    it('should fetch from database when cache is empty', async () => {
      const mockInvitations = [
        {
          id: 'inv-1',
          email: 'test1@example.com',
          role: 'Developer',
          department: 'Engineering',
          status: 'pending'
        }
      ];

      const mockFrom = require('@/lib/supabase').supabase.from;
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockInvitations,
                error: null
              }))
            }))
          }))
        }))
      });

      const result = await TeamInvitationService.getPendingInvitations('user-123');

      expect(result).toHaveLength(1);
      expect(mockFrom).toHaveBeenCalledWith('team_invitations');
    });
  });

  describe('sendBulkInvitations', () => {
    it('should send bulk invitations successfully', async () => {
      const mockRpc = require('@/lib/supabase').supabase.rpc;
      mockRpc.mockResolvedValue({
        data: { success: true, invitationId: 'inv-123' },
        error: null
      });

      const result = await TeamInvitationService.sendBulkInvitations(
        {
          teamId: 'team-123',
          invitations: [
            {
              email: 'test1@example.com',
              role: 'Developer',
              department: 'Engineering'
            },
            {
              email: 'test2@example.com',
              role: 'Designer',
              department: 'Design'
            }
          ]
        },
        'user-123',
        'John Doe'
      );

      expect(result.success).toBe(true);
      expect(result.summary.total).toBe(2);
      expect(result.summary.successful).toBe(2);
      expect(result.summary.failed).toBe(0);
    });

    it('should handle partial failures in bulk invitations', async () => {
      const mockRpc = require('@/lib/supabase').supabase.rpc;
      mockRpc
        .mockResolvedValueOnce({
          data: { success: true, invitationId: 'inv-1' },
          error: null
        })
        .mockResolvedValueOnce({
          data: { success: false, error: 'User not found' },
          error: null
        });

      const result = await TeamInvitationService.sendBulkInvitations(
        {
          teamId: 'team-123',
          invitations: [
            {
              email: 'test1@example.com',
              role: 'Developer',
              department: 'Engineering'
            },
            {
              email: 'test2@example.com',
              role: 'Designer',
              department: 'Design'
            }
          ]
        },
        'user-123',
        'John Doe'
      );

      expect(result.success).toBe(false);
      expect(result.summary.total).toBe(2);
      expect(result.summary.successful).toBe(1);
      expect(result.summary.failed).toBe(1);
    });
  });

  describe('getInvitationAnalytics', () => {
    it('should return analytics data', async () => {
      const mockFrom = require('@/lib/supabase').supabase.from;
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [
              { status: 'pending', created_at: '2023-01-01', updated_at: '2023-01-01' },
              { status: 'accepted', created_at: '2023-01-01', updated_at: '2023-01-02' },
              { status: 'declined', created_at: '2023-01-01', updated_at: '2023-01-03' }
            ],
            error: null
          }))
        }))
      });

      const result = await TeamInvitationService.getInvitationAnalytics('team-123');

      expect(result.totalInvitations).toBe(3);
      expect(result.pendingInvitations).toBe(1);
      expect(result.acceptedInvitations).toBe(1);
      expect(result.declinedInvitations).toBe(1);
      expect(result.acceptanceRate).toBe(33.33);
    });
  });

  describe('health status', () => {
    it('should return health status', () => {
      const health = (TeamInvitationService as any).getHealthStatus();

      expect(health.isHealthy).toBe(true);
      expect(typeof health.cacheSize).toBe('number');
      expect(typeof health.rateLimitEntries).toBe('number');
      expect(typeof health.uptime).toBe('number');
    });
  });
});
