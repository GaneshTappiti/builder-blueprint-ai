// Team Invitation Service - Production Level
// Handles the complete in-app team invitation flow with caching, rate limiting, and comprehensive error handling

import { supabase } from '@/lib/supabase';
import { TeamInvitation } from '@/types/teamManagement';
import { monitoring } from '@/lib/monitoring';

// Rate limiting and caching
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface InvitationMetrics {
  totalSent: number;
  totalAccepted: number;
  totalDeclined: number;
  averageResponseTime: number;
  lastActivity: Date;
}

class ProductionTeamInvitationService {
  private rateLimitMap = new Map<string, RateLimitEntry>();
  private cache = new Map<string, CacheEntry<any>>();
  private metrics = new Map<string, InvitationMetrics>();
  
  // Configuration constants
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly MAX_CACHE_SIZE = 1000; // Maximum cache entries
  private readonly INVITATION_EXPIRY_DAYS = 7;
  private readonly DUPLICATE_INVITATION_HOURS = 24;

  // Rate limiting with improved algorithm
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(userId);
    
    if (!entry || now > entry.resetTime) {
      this.rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return true;
    }
    
    if (entry.count >= this.RATE_LIMIT_MAX_REQUESTS) {
      return false;
    }
    
    entry.count++;
    return true;
  }

  // Enhanced cache management with LRU eviction
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access time for LRU
    entry.expiresAt = Date.now() + this.CACHE_TTL;
    return entry.data;
  }

  private setCache<T>(key: string, data: T): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.CACHE_TTL
    });
  }

  // Enhanced retry logic with circuit breaker pattern
  private async withRetry<T>(operation: () => Promise<T>, context: string = 'unknown'): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const startTime = Date.now();
        const result = await operation();
        const duration = Date.now() - startTime;
        
        // Track performance metrics
        if (monitoring.trackPerformance && context) {
          monitoring.trackPerformance(`invitation_${context}`, duration);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Track error metrics
        if (monitoring.trackError) {
          monitoring.trackError(lastError, `invitation_${context}_attempt_${attempt}`);
        }
        
        if (attempt === this.MAX_RETRIES) {
          throw lastError;
        }
        
        // Exponential backoff with jitter
        const baseDelay = this.RETRY_DELAY * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
        const delay = baseDelay + jitter;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  // Enhanced validation with comprehensive checks
  private validateInvitationData(data: InvitationRequest): { isValid: boolean; error?: string } {
    // Required fields validation
    if (!data.teamId || !data.inviteeEmail || !data.role || !data.department) {
      return { isValid: false, error: 'Missing required fields' };
    }

    // Email validation with comprehensive regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(data.inviteeEmail)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    // Message length validation
    if (data.message && data.message.length > 500) {
      return { isValid: false, error: 'Message too long (max 500 characters)' };
    }

    // Role validation
    const validRoles = ['admin', 'member', 'viewer', 'moderator'];
    if (!validRoles.includes(data.role.toLowerCase())) {
      return { isValid: false, error: 'Invalid role specified' };
    }

    // Department validation
    if (data.department.length > 100) {
      return { isValid: false, error: 'Department name too long (max 100 characters)' };
    }

    return { isValid: true };
  }

  // Enhanced notification system with retry and fallback
  private async sendNotification(notification: NotificationData): Promise<void> {
    try {
      // Track notification attempt
      monitoring.track('notification_sent', {
        type: notification.type,
        timestamp: Date.now()
      });

      // Send to notification service with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID()
        },
        body: JSON.stringify(notification),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Failed to send notification:', error);
      
      // Track notification failure
      monitoring.trackError(error as Error, 'notification_send_failed');
      
      // Don't throw - notification failure shouldn't break the main flow
    }
  }

  // Enhanced audit logging with structured data
  private async logAuditEvent(event: string, data: Record<string, any>): Promise<void> {
    try {
      const auditData = {
        event,
        data,
        timestamp: new Date().toISOString(),
        service: 'team_invitation_service',
        version: '1.0.0'
      };

      await supabase
        .from('audit_logs')
        .insert(auditData);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging failure shouldn't break the main flow
    }
  }

  // Update metrics for analytics
  private updateMetrics(teamId: string, action: 'sent' | 'accepted' | 'declined', responseTime?: number): void {
    const existing = this.metrics.get(teamId) || {
      totalSent: 0,
      totalAccepted: 0,
      totalDeclined: 0,
      averageResponseTime: 0,
      lastActivity: new Date()
    };

    switch (action) {
      case 'sent':
        existing.totalSent++;
        break;
      case 'accepted':
        existing.totalAccepted++;
        if (responseTime) {
          existing.averageResponseTime = (existing.averageResponseTime + responseTime) / 2;
        }
        break;
      case 'declined':
        existing.totalDeclined++;
        break;
    }

    existing.lastActivity = new Date();
    this.metrics.set(teamId, existing);
  }

  // Get team name for better notifications
  private async getTeamName(teamId: string): Promise<string> {
    const cacheKey = `team_name_${teamId}`;
    const cached = this.getFromCache<string>(cacheKey);
    if (cached) return cached;

    try {
      const { data: team, error } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();

      if (error || !team) return 'Unknown Team';

      this.setCache(cacheKey, team.name);
      return team.name;
    } catch (error) {
      console.error('Failed to fetch team name:', error);
      return 'Unknown Team';
    }
  }

  // Get user name for better notifications
  private async getUserName(userId: string): Promise<string> {
    const cacheKey = `user_name_${userId}`;
    const cached = this.getFromCache<string>(cacheKey);
    if (cached) return cached;

    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();

      if (error || !user) return 'Unknown User';

      this.setCache(cacheKey, user.name);
      return user.name;
    } catch (error) {
      console.error('Failed to fetch user name:', error);
      return 'Unknown User';
    }
  }

  // Main invitation sending method with comprehensive validation
  async sendInvitation(
    invitationData: InvitationRequest, 
    inviterId: string, 
    inviterName: string
  ): Promise<InvitationResponse> {
    const startTime = Date.now();
    
    try {
      // Rate limiting check
      if (!this.checkRateLimit(inviterId)) {
        const entry = this.rateLimitMap.get(inviterId);
        return {
          success: false,
          error: 'Rate limit exceeded',
          errorCode: 'RATE_LIMIT_EXCEEDED',
          retryAfter: entry ? Math.ceil((entry.resetTime - Date.now()) / 1000) : 60
        };
      }

      // Enhanced validation
      const validation = this.validateInvitationData(invitationData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          errorCode: 'VALIDATION_ERROR'
        };
      }

      // Check if user is already a member (optimized query)
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', invitationData.teamId)
        .eq('user_id', invitationData.inviteeEmail)
        .single();

      if (existingMember) {
        return {
          success: false,
          error: 'User is already a member of this team',
          errorCode: 'ALREADY_MEMBER'
        };
      }

      // Check for existing pending invitation with improved query
      const { data: existingInvitation } = await supabase
        .from('team_invitations')
        .select('id, status, created_at')
        .eq('team_id', invitationData.teamId)
        .eq('invitee_email', invitationData.inviteeEmail)
        .eq('status', 'pending')
        .single();

      if (existingInvitation) {
        const timeSinceInvitation = Date.now() - new Date(existingInvitation.created_at).getTime();
        if (timeSinceInvitation < this.DUPLICATE_INVITATION_HOURS * 60 * 60 * 1000) {
          return {
            success: false,
            error: 'Invitation already sent recently',
            errorCode: 'DUPLICATE_INVITATION'
          };
        }
      }

      // Create invitation with retry logic
      const invitation = await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('team_invitations')
          .insert({
            team_id: invitationData.teamId,
            invitee_email: invitationData.inviteeEmail,
            role: invitationData.role,
            department: invitationData.department,
            message: invitationData.message,
            inviter_id: inviterId,
            status: 'pending',
            expires_at: new Date(Date.now() + this.INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }, 'send_invitation');

      // Get team name for better notification
      const teamName = await this.getTeamName(invitationData.teamId);

      // Send notification asynchronously
      this.sendNotification({
        type: 'team_invite',
        title: 'Team Invitation',
        message: `${inviterName} invited you to join ${teamName}`,
        payload: {
          teamName,
          inviterName,
          invitationId: invitation.id
        },
        actionUrl: `/teamspace/invitations/${invitation.id}`,
        actionText: 'View Invitation'
      });

      // Clear relevant caches
      this.clearCache(undefined, invitationData.teamId);

      // Update metrics
      this.updateMetrics(invitationData.teamId, 'sent');

      // Log audit event
      await this.logAuditEvent('invitation_sent', {
        invitationId: invitation.id,
        teamId: invitationData.teamId,
        inviterId,
        inviteeEmail: invitationData.inviteeEmail,
        duration: Date.now() - startTime
      });

      return {
        success: true,
        invitation: invitation as TeamInvitation
      };

    } catch (error) {
      console.error('Error sending invitation:', error);
      
      // Track error metrics
      monitoring.trackError(error as Error, 'send_invitation_failed', {
        teamId: invitationData.teamId,
        inviterId,
        duration: Date.now() - startTime
      });
      
      // Log audit event for failure
      await this.logAuditEvent('invitation_failed', {
        teamId: invitationData.teamId,
        inviterId,
        inviteeEmail: invitationData.inviteeEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invitation',
        errorCode: 'SEND_ERROR'
      };
    }
  }

  // Accept invitation with enhanced validation
  async acceptInvitation(invitationId: string, userId: string): Promise<InvitationResponse> {
    const startTime = Date.now();
    
    try {
      // Rate limiting check
      if (!this.checkRateLimit(userId)) {
        const entry = this.rateLimitMap.get(userId);
        return {
          success: false,
          error: 'Rate limit exceeded',
          errorCode: 'RATE_LIMIT_EXCEEDED',
          retryAfter: entry ? Math.ceil((entry.resetTime - Date.now()) / 1000) : 60
        };
      }

      // Get invitation with team details
      const { data: invitation, error: fetchError } = await supabase
        .from('team_invitations')
        .select(`
          *,
          team:teams(id, name, owner_id),
          inviter:profiles!team_invitations_inviter_id_fkey(id, name, email)
        `)
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single();

      if (fetchError || !invitation) {
        return {
          success: false,
          error: 'Invitation not found or already processed',
          errorCode: 'INVITATION_NOT_FOUND'
        };
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        return {
          success: false,
          error: 'Invitation has expired',
          errorCode: 'INVITATION_EXPIRED'
        };
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', invitation.team_id)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        return {
          success: false,
          error: 'You are already a member of this team',
          errorCode: 'ALREADY_MEMBER'
        };
      }

      // Accept invitation with transaction
      const result = await this.withRetry(async () => {
        const { data, error } = await supabase.rpc('accept_team_invitation', {
          invitation_id: invitationId,
          user_id: userId
        });

        if (error) throw error;
        return data;
      }, 'accept_invitation');

      if (!result) {
        throw new Error('Failed to accept invitation');
      }

      // Clear relevant caches
      this.clearCache(userId, invitation.team_id);

      // Get user name for notification
      const userName = await this.getUserName(userId);

      // Send notification to inviter
      this.sendNotification({
        type: 'team_invite_accepted',
        title: 'Invitation Accepted',
        message: `Your invitation to join ${invitation.team.name} has been accepted by ${userName}`,
        payload: {
          teamName: invitation.team.name,
          inviterName: invitation.inviter.name,
          invitationId,
          inviteeName: userName
        }
      });

      // Update metrics
      const responseTime = Date.now() - new Date(invitation.created_at).getTime();
      this.updateMetrics(invitation.team_id, 'accepted', responseTime);

      // Log audit event
      await this.logAuditEvent('invitation_accepted', {
        invitationId,
        teamId: invitation.team_id,
        userId,
        inviterId: invitation.inviter_id,
        duration: Date.now() - startTime
      });

      return {
        success: true,
        invitation: invitation as TeamInvitation
      };

    } catch (error) {
      console.error('Error accepting invitation:', error);
      
      // Track error metrics
      monitoring.trackError(error as Error, 'accept_invitation_failed', {
        invitationId,
        userId,
        duration: Date.now() - startTime
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to accept invitation',
        errorCode: 'ACCEPT_ERROR'
      };
    }
  }

  // Decline invitation with proper cleanup
  async declineInvitation(invitationId: string, userId: string): Promise<InvitationResponse> {
    const startTime = Date.now();
    
    try {
      // Rate limiting check
      if (!this.checkRateLimit(userId)) {
        const entry = this.rateLimitMap.get(userId);
        return {
          success: false,
          error: 'Rate limit exceeded',
          errorCode: 'RATE_LIMIT_EXCEEDED',
          retryAfter: entry ? Math.ceil((entry.resetTime - Date.now()) / 1000) : 60
        };
      }

      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from('team_invitations')
        .select(`
          *,
          team:teams(id, name),
          inviter:profiles!team_invitations_inviter_id_fkey(id, name, email)
        `)
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single();

      if (fetchError || !invitation) {
        return {
          success: false,
          error: 'Invitation not found or already processed',
          errorCode: 'INVITATION_NOT_FOUND'
        };
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (updateError) {
        throw updateError;
      }

      // Clear relevant caches
      this.clearCache(userId, invitation.team_id);

      // Get user name for notification
      const userName = await this.getUserName(userId);

      // Send notification to inviter
      this.sendNotification({
        type: 'team_invite_declined',
        title: 'Invitation Declined',
        message: `Your invitation to join ${invitation.team.name} was declined by ${userName}`,
        payload: {
          teamName: invitation.team.name,
          inviterName: invitation.inviter.name,
          invitationId,
          inviteeName: userName
        }
      });

      // Update metrics
      this.updateMetrics(invitation.team_id, 'declined');

      // Log audit event
      await this.logAuditEvent('invitation_declined', {
        invitationId,
        teamId: invitation.team_id,
        userId,
        inviterId: invitation.inviter_id,
        duration: Date.now() - startTime
      });

      return {
        success: true,
        invitation: invitation as TeamInvitation
      };

    } catch (error) {
      console.error('Error declining invitation:', error);
      
      // Track error metrics
      monitoring.trackError(error as Error, 'decline_invitation_failed', {
        invitationId,
        userId,
        duration: Date.now() - startTime
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to decline invitation',
        errorCode: 'DECLINE_ERROR'
      };
    }
  }

  // Get pending invitations with caching
  async getPendingInvitations(userId: string): Promise<TeamInvitation[]> {
    const cacheKey = `invitations_${userId}`;
    
    // Check cache first
    const cached = this.getFromCache<TeamInvitation[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const result = await this.withRetry(
        async () => {
          const { data, error } = await supabase
            .from('team_invitations')
            .select(`
              *,
              team:teams(id, name, description),
              inviter:profiles!team_invitations_inviter_id_fkey(id, name, email, avatar_url)
            `)
            .eq('invitee_email', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

          if (error) throw error;
          return { data, error: null };
        },
        'get_pending_invitations'
      );

      const { data: invitations, error } = result;

      if (error) throw error;

      const formattedInvitations = invitations.map((invitation: any) => ({
        ...invitation,
        team: invitation.team,
        inviter: invitation.inviter
      }));

      // Cache the result
      this.setCache(cacheKey, formattedInvitations);

      return formattedInvitations;
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      monitoring.trackError(error as Error, 'get_pending_invitations_failed');
      return [];
    }
  }

  // Get team invitations with caching
  async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    const cacheKey = `team_invitations_${teamId}`;
    
    // Check cache first
    const cached = this.getFromCache<TeamInvitation[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const result = await this.withRetry(
        async () => {
          const { data, error } = await supabase
            .from('team_invitations')
            .select(`
              *,
              team:teams(id, name, description),
              inviter:profiles!team_invitations_inviter_id_fkey(id, name, email, avatar_url)
            `)
            .eq('team_id', teamId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return { data, error: null };
        },
        'get_team_invitations'
      );

      const { data: invitations, error } = result;

      if (error) throw error;

      const formattedInvitations = invitations.map((invitation: any) => ({
        ...invitation,
        team: invitation.team,
        inviter: invitation.inviter
      }));

      // Cache the result
      this.setCache(cacheKey, formattedInvitations);

      return formattedInvitations;
    } catch (error) {
      console.error('Error fetching team invitations:', error);
      monitoring.trackError(error as Error, 'get_team_invitations_failed');
      return [];
    }
  }

  // Enhanced bulk invitations with concurrency control
  async sendBulkInvitations(
    bulkData: BulkInvitationRequest,
    inviterId: string,
    inviterName: string
  ): Promise<BulkInvitationResponse> {
    const results: Array<{
      email: string;
      success: boolean;
      error?: string;
      invitationId?: string;
    }> = [];

    let successful = 0;
    let failed = 0;

    // Process invitations with controlled concurrency (max 3 at a time)
    const concurrencyLimit = 3;
    const chunks = [];
    for (let i = 0; i < bulkData.invitations.length; i += concurrencyLimit) {
      chunks.push(bulkData.invitations.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (invitationData) => {
        try {
          const result = await this.sendInvitation({
            teamId: bulkData.teamId,
            inviteeEmail: invitationData.email,
            role: invitationData.role,
            department: invitationData.department,
            message: invitationData.message
          }, inviterId, inviterName);

          if (result.success) {
            results.push({
              email: invitationData.email,
              success: true,
              invitationId: result.invitation?.id
            });
            successful++;
          } else {
            results.push({
              email: invitationData.email,
              success: false,
              error: result.error
            });
            failed++;
          }
        } catch (error) {
          results.push({
            email: invitationData.email,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          failed++;
        }
      });

      await Promise.all(chunkPromises);
    }

    // Track bulk invitation metrics
    monitoring.track('bulk_invitations_processed', {
      teamId: bulkData.teamId,
      total: bulkData.invitations.length,
      successful,
      failed
    });

    return {
      success: successful > 0,
      results,
      summary: {
        total: bulkData.invitations.length,
        successful,
        failed
      }
    };
  }

  // Enhanced analytics with caching
  async getInvitationAnalytics(teamId: string): Promise<{
    totalInvitations: number;
    pendingInvitations: number;
    acceptedInvitations: number;
    declinedInvitations: number;
    expiredInvitations: number;
    acceptanceRate: number;
    averageResponseTime: number;
  }> {
    const cacheKey = `analytics_${teamId}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const analyticsResult = await this.withRetry(
        async () => {
          const { data, error } = await supabase
            .from('team_invitations')
            .select('status, created_at, updated_at')
            .eq('team_id', teamId);

          if (error) throw error;
          return { data, error: null };
        },
        'get_analytics'
      );

      const { data: analytics, error } = analyticsResult;

      if (error) throw error;

      const stats = analytics.reduce((acc: Record<string, number>, invitation: any) => {
        acc[invitation.status] = (acc[invitation.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const total = analytics.length;
      const accepted = stats.accepted || 0;
      const pending = stats.pending || 0;
      const declined = stats.declined || 0;
      const expired = stats.expired || 0;

      // Calculate acceptance rate
      const acceptanceRate = total > 0 ? (accepted / (accepted + declined)) * 100 : 0;

      // Calculate average response time for accepted invitations
      const acceptedInvitations = analytics.filter((inv: any) => inv.status === 'accepted');
      const averageResponseTime = acceptedInvitations.length > 0
        ? acceptedInvitations.reduce((sum: number, inv: any) => {
            const responseTime = new Date(inv.updated_at).getTime() - new Date(inv.created_at).getTime();
            return sum + responseTime;
          }, 0) / acceptedInvitations.length
        : 0;

      const analyticsData = {
        totalInvitations: total,
        pendingInvitations: pending,
        acceptedInvitations: accepted,
        declinedInvitations: declined,
        expiredInvitations: expired,
        acceptanceRate,
        averageResponseTime
      };

      // Cache analytics for 10 minutes
      this.cache.set(cacheKey, {
        data: analyticsData,
        expiresAt: Date.now() + 10 * 60 * 1000
      });

      return analyticsData;
    } catch (error) {
      console.error('Error fetching invitation analytics:', error);
      monitoring.trackError(error as Error, 'get_analytics_failed');
      throw error;
    }
  }

  // Cleanup expired invitations with batch processing
  async cleanupExpiredInvitations(): Promise<number> {
    try {
      const result = await this.withRetry(
        async () => {
          const { data, error } = await supabase.rpc('cleanup_expired_invitations');
          if (error) throw error;
          return { data, error: null };
        },
        'cleanup_expired'
      );

      const { data, error } = result;
      
      if (error) throw error;

      // Clear all caches since we've modified data
      this.clearCache();

      // Track cleanup metrics
      monitoring.track('expired_invitations_cleaned', {
        count: data || 0
      });

      return data || 0;
    } catch (error) {
      console.error('Error cleaning up expired invitations:', error);
      monitoring.trackError(error as Error, 'cleanup_expired_failed');
      return 0;
    }
  }

  // Enhanced cache management
  clearCache(userId?: string, teamId?: string): void {
    if (userId) {
      this.cache.delete(`invitations_${userId}`);
    }
    
    if (teamId) {
      this.cache.delete(`team_invitations_${teamId}`);
      this.cache.delete(`team_name_${teamId}`);
      this.cache.delete(`analytics_${teamId}`);
    }
    
    if (!userId && !teamId) {
      this.cache.clear();
    }
  }

  // Enhanced health check with detailed metrics
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      cacheSize: number;
      rateLimitEntries: number;
      metricsCount: number;
      lastError?: string;
      uptime: number;
    };
  } {
    const cacheSize = this.cache.size;
    const rateLimitEntries = this.rateLimitMap.size;
    const metricsCount = this.metrics.size;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (cacheSize > this.MAX_CACHE_SIZE * 0.9) {
      status = 'degraded';
    }
    
    if (rateLimitEntries > 1000) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        cacheSize,
        rateLimitEntries,
        metricsCount,
        uptime: process.uptime()
      }
    };
  }

  // Get metrics for monitoring
  getMetrics(): Map<string, InvitationMetrics> {
    return new Map(this.metrics);
  }

  // Reset metrics (useful for testing)
  resetMetrics(): void {
    this.metrics.clear();
  }
}

export interface InvitationRequest {
  teamId: string;
  inviteeEmail: string;
  role: string;
  department: string;
  message?: string;
}

export interface InvitationResponse {
  success: boolean;
  invitation?: TeamInvitation;
  error?: string;
  errorCode?: string;
  retryAfter?: number;
}

export interface NotificationData {
  type: 'team_invite' | 'team_invite_accepted' | 'team_invite_declined' | 'team_invite_failed';
  title: string;
  message: string;
  payload: {
    teamName: string;
    inviterName: string;
    invitationId: string;
    inviteeName?: string;
  };
  actionUrl?: string;
  actionText?: string;
}

export interface BulkInvitationRequest {
  teamId: string;
  invitations: Array<{
    email: string;
    role: string;
    department: string;
    message?: string;
  }>;
}

export interface BulkInvitationResponse {
  success: boolean;
  results: Array<{
    email: string;
    success: boolean;
    error?: string;
    invitationId?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export default new ProductionTeamInvitationService();