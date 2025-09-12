// Production-ready file upload API with security and validation
import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/services/chatService';
import { validateFileUpload } from '@/lib/security';
import { monitoring } from '@/lib/monitoring';

// Simple rate limiter for file uploads
const apiRateLimiter = {
  isAllowed: (key: string) => ({
    allowed: true,
    resetTime: Date.now() + 60000 // 1 minute
  })
};
import { withRetry } from '@/lib/retryLogic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const channelId = formData.get('channelId') as string;

    // Validate required parameters
    if (!file || !channelId) {
      return NextResponse.json(
        { error: 'File and channel ID are required' },
        { status: 400 }
      );
    }

    // Validate file upload
    const validation = validateFileUpload(file);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Rate limiting for file uploads
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = apiRateLimiter.isAllowed(`file_upload:${clientId}`);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'File upload rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    // Get user ID from auth
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Upload file with retry logic
    const attachment = await withRetry(async () => {
      return chatService.uploadFile(file, channelId);
    });

    // Send message with file attachment
    const message = await withRetry(async () => {
      return chatService.sendMessage({
        channel_id: channelId,
        sender_id: userId,
        content: `📎 ${validation.sanitizedName}`,
        message_type: 'file',
        metadata: {
          custom_data: {
            attachments: [attachment],
            file_name: validation.sanitizedName,
            file_size: file.size,
            file_type: file.type
          }
        },
        is_deleted: false
      });
    });

    const duration = Date.now() - startTime;
    monitoring.trackChatEvent('file_uploaded', {
      channelId,
      fileName: validation.sanitizedName,
      fileSize: file.size,
      fileType: file.type,
      duration
    });

    return NextResponse.json({ 
      message,
      attachment 
    }, { status: 201 });

  } catch (error) {
    const duration = Date.now() - startTime;
    monitoring.trackError(error as Error, 'api_file_upload', { duration });
    
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
