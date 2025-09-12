import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/services/notificationService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, channelId } = body;

    if (notificationId) {
      await notificationService.markNotificationAsRead(notificationId);
    } else if (userId) {
      await notificationService.markAllNotificationsAsRead(userId, channelId);
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or userId is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
