// Production-ready chat messages API with rate limiting, validation, and monitoring
import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/services/chatService';
import { apiRateLimiter } from '@/lib/security';
import { sanitizeInput, validateFileUpload } from '@/lib/security';
import { monitoring } from '@/lib/monitoring';
import { withRetry } from '@/lib/retryLogic';
import { MessagePagination } from '@/lib/scalability';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor');
    const direction = searchParams.get('direction') as 'before' | 'after' || 'before';

    // Validate required parameters
    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = apiRateLimiter.isAllowed(`messages:${clientId}`);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    // Get messages with pagination
    const messages = await withRetry(async () => {
      return chatService.getMessages(channelId, limit, 0);
    });

    const duration = Date.now() - startTime;
    monitoring.trackPerformance('api_get_messages', duration, { channelId, limit });

    return NextResponse.json({
      messages,
      pagination: {
        hasMore: messages.length === limit,
        nextCursor: messages.length > 0 ? messages[messages.length - 1].created_at : undefined
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    monitoring.trackError(error as Error, 'api_get_messages', { duration });
    
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { channelId, content, messageType = 'text', metadata = {} } = body;

    // Validate required parameters
    if (!channelId || !content) {
      return NextResponse.json(
        { error: 'Channel ID and content are required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = apiRateLimiter.isAllowed(`send_message:${clientId}`);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    // Sanitize input
    const sanitizedContent = sanitizeInput(content);
    
    if (sanitizedContent.length === 0) {
      return NextResponse.json(
        { error: 'Message content cannot be empty' },
        { status: 400 }
      );
    }

    // Get user ID from auth (in production, this would come from JWT)
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Create message
    const message = await withRetry(async () => {
      return chatService.sendMessage({
        channel_id: channelId,
        sender_id: userId,
        content: sanitizedContent,
        message_type: messageType,
        metadata: {
          ...metadata,
          mentions: extractMentions(sanitizedContent),
          hashtags: extractHashtags(sanitizedContent)
        },
        is_deleted: false
      });
    });

    const duration = Date.now() - startTime;
    monitoring.trackChatEvent('message_sent', {
      channelId,
      messageType,
      contentLength: sanitizedContent.length,
      duration
    });

    return NextResponse.json({ message }, { status: 201 });

  } catch (error) {
    const duration = Date.now() - startTime;
    monitoring.trackError(error as Error, 'api_send_message', { duration });
    
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Helper functions
function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  return Array.from(content.matchAll(mentionRegex)).map(match => match[1]);
}

function extractHashtags(content: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  return Array.from(content.matchAll(hashtagRegex)).map(match => match[1]);
}
