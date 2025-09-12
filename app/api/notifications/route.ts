import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { notificationService } from '@/services/notificationService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const channelId = searchParams.get('channelId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const notifications = await notificationService.getNotifications(
      userId,
      limit,
      offset
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      channelId,
      messageId,
      senderId,
      recipientId,
      title,
      body: notificationBody,
      data
    } = body;

    if (!type || !channelId || !senderId || !recipientId || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notificationId = await notificationService.createChatNotification(
      type,
      channelId,
      messageId,
      senderId,
      recipientId,
      title,
      notificationBody,
      data
    );

    return NextResponse.json({ notificationId });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
