import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import TeamInvitationService from '@/services/teamInvitationService';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { teamId, invitations } = body;

    // Validate required fields
    if (!teamId || !invitations || !Array.isArray(invitations)) {
      return NextResponse.json(
        { error: 'Missing required fields or invalid format' },
        { status: 400 }
      );
    }

    // Validate invitations array
    if (invitations.length === 0) {
      return NextResponse.json(
        { error: 'No invitations provided' },
        { status: 400 }
      );
    }

    if (invitations.length > 50) {
      return NextResponse.json(
        { error: 'Too many invitations. Maximum 50 per request.' },
        { status: 400 }
      );
    }

    // Validate each invitation
    for (const invitation of invitations) {
      if (!invitation.email || !invitation.role || !invitation.department) {
        return NextResponse.json(
          { error: 'Each invitation must have email, role, and department' },
          { status: 400 }
        );
      }
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const inviterName = profile?.name || user.email || 'Unknown User';

    // Send bulk invitations
    const result = await TeamInvitationService.sendBulkInvitations(
      {
        teamId,
        invitations
      },
      user.id,
      inviterName
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in bulk invitation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
