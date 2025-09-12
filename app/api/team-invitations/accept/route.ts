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
    const { invitationId } = body;

    // Validate required fields
    if (!invitationId) {
      return NextResponse.json(
        { error: 'Missing invitation ID' },
        { status: 400 }
      );
    }

    // Accept invitation
    const result = await TeamInvitationService.acceptInvitation(
      invitationId,
      user.id
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
    console.error('Error in accept invitation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
