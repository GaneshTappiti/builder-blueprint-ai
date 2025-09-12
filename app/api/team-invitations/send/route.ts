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
    const { teamId, inviteeEmail, role, department, message } = body;

    // Validate required fields
    if (!teamId || !inviteeEmail || !role || !department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const inviterName = profile?.name || user.email || 'Unknown User';

    // Send invitation
    const result = await TeamInvitationService.sendInvitation(
      {
        teamId,
        inviteeEmail,
        role,
        department,
        message
      },
      user.id,
      inviterName
    );

    if (!result.success) {
      const statusCode = result.errorCode === 'RATE_LIMIT_EXCEEDED' ? 429 : 400;
      return NextResponse.json(
        { 
          error: result.error,
          errorCode: result.errorCode,
          retryAfter: result.retryAfter
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: result.invitation
    });

  } catch (error) {
    console.error('Error in send invitation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
