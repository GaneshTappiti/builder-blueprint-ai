// Email Notification Service
// This service handles sending email notifications based on user preferences

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  text: string;
  category: 'meeting' | 'task' | 'idea' | 'chat' | 'system' | 'team';
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailNotificationService {
  private readonly API_ENDPOINT = '/api/notifications/email';

  // Email templates for different notification types
  private getEmailTemplate(
    category: EmailNotificationData['category'],
    data: any
  ): EmailTemplate {
    switch (category) {
      case 'meeting':
        return {
          subject: `🔔 ${data.userName} started a meeting`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Meeting Started</h1>
              </div>
              <div style="padding: 20px; background: #f8f9fa;">
                <h2 style="color: #333;">${data.userName} started a ${data.meetingType} meeting</h2>
                <p style="color: #666;">Click the button below to join the meeting.</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${data.meetingUrl}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Join Meeting
                  </a>
                </div>
              </div>
              <div style="background: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p>This notification was sent because you have email notifications enabled for meetings.</p>
              </div>
            </div>
          `,
          text: `${data.userName} started a ${data.meetingType} meeting. Join at: ${data.meetingUrl}`
        };

      case 'task':
        return {
          subject: `📋 Task Update: ${data.taskTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Task Updated</h1>
              </div>
              <div style="padding: 20px; background: #f8f9fa;">
                <h2 style="color: #333;">${data.userName} updated "${data.taskTitle}"</h2>
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #666;">Progress:</span>
                    <span style="font-weight: bold; color: #28a745;">${data.progress}%</span>
                  </div>
                  <div style="background: #e9ecef; height: 8px; border-radius: 4px; margin-top: 8px;">
                    <div style="background: #28a745; height: 100%; width: ${data.progress}%; border-radius: 4px;"></div>
                  </div>
                </div>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${data.taskUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    View Task
                  </a>
                </div>
              </div>
            </div>
          `,
          text: `${data.userName} updated "${data.taskTitle}" to ${data.progress}% complete. View at: ${data.taskUrl}`
        };

      case 'idea':
        return {
          subject: `💡 New Idea Shared: ${data.ideaTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 20px; text-align: center;">
                <h1 style="color: #333; margin: 0;">New Idea Shared</h1>
              </div>
              <div style="padding: 20px; background: #f8f9fa;">
                <h2 style="color: #333;">${data.userName} shared "${data.ideaTitle}"</h2>
                <p style="color: #666;">A new idea has been shared in your team's idea vault.</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${data.ideaUrl}" style="background: #ffc107; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    View Idea
                  </a>
                </div>
              </div>
            </div>
          `,
          text: `${data.userName} shared "${data.ideaTitle}" in the team idea vault. View at: ${data.ideaUrl}`
        };

      case 'chat':
        return {
          subject: `💬 New Message from ${data.userName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 20px; text-align: center;">
                <h1 style="color: #333; margin: 0;">New Message</h1>
              </div>
              <div style="padding: 20px; background: #f8f9fa;">
                <h2 style="color: #333;">${data.userName} sent a message in ${data.isGroup ? 'Team Chat' : 'Private Chat'}</h2>
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #007bff;">
                  <p style="margin: 0; color: #333;">"${data.messagePreview}"</p>
                </div>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${data.messageUrl}" style="background: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reply
                  </a>
                </div>
              </div>
            </div>
          `,
          text: `${data.userName} sent a message: "${data.messagePreview}". Reply at: ${data.messageUrl}`
        };

      case 'team':
        return {
          subject: `👥 Team Update`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Team Update</h1>
              </div>
              <div style="padding: 20px; background: #f8f9fa;">
                <h2 style="color: #333;">${data.title}</h2>
                <p style="color: #666;">${data.message}</p>
                ${data.actionUrl ? `
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${data.actionUrl}" style="background: #6f42c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      ${data.actionText || 'View Details'}
                    </a>
                  </div>
                ` : ''}
              </div>
            </div>
          `,
          text: `${data.title}: ${data.message}${data.actionUrl ? ` View at: ${data.actionUrl}` : ''}`
        };

      case 'system':
      default:
        return {
          subject: `🔔 ${data.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">System Notification</h1>
              </div>
              <div style="padding: 20px; background: #f8f9fa;">
                <h2 style="color: #333;">${data.title}</h2>
                <p style="color: #666;">${data.message}</p>
                ${data.actionUrl ? `
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${data.actionUrl}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      ${data.actionText || 'View Details'}
                    </a>
                  </div>
                ` : ''}
              </div>
            </div>
          `,
          text: `${data.title}: ${data.message}${data.actionUrl ? ` View at: ${data.actionUrl}` : ''}`
        };
    }
  }

  // Send email notification
  async sendEmailNotification(data: EmailNotificationData): Promise<boolean> {
    try {
      const template = this.getEmailTemplate(data.category, data);
      
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.to,
          subject: template.subject,
          html: template.html,
          text: template.text,
          category: data.category
        }),
      });

      if (!response.ok) {
        throw new Error(`Email service responded with status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  // Check if email notifications are enabled for a category
  isEmailEnabledForCategory(category: EmailNotificationData['category'], preferences: any): boolean {
    if (!preferences.emailNotifications) return false;
    
    switch (category) {
      case 'meeting':
        return preferences.meetingNotifications;
      case 'task':
        return preferences.taskReminders;
      case 'idea':
        return preferences.ideaSharingNotifications;
      case 'chat':
        return preferences.chatNotifications;
      case 'team':
        return preferences.teamUpdates;
      case 'system':
        return preferences.systemUpdates;
      default:
        return true;
    }
  }

  // Send email notification with proper error handling
  async sendEmailNotificationWithRetry(data: EmailNotificationData, maxRetries: number = 3): Promise<boolean> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const success = await this.sendEmailNotification(data);
        if (success) return true;
        
        retries++;
        if (retries < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
      } catch (error) {
        console.error(`Email send attempt ${retries + 1} failed:`, error);
        retries++;
        
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
      }
    }
    
    console.error(`Failed to send email after ${maxRetries} attempts`);
    return false;
  }
}

export const emailNotificationService = new EmailNotificationService();
