// Load testing for chat functionality
import { test, expect } from '@playwright/test';

test.describe('Chat Load Tests', () => {
  test('should handle high message volume', async ({ page }) => {
    await page.goto('/workspace/teamspace');
    await page.click('[data-testid="messages-tab"]');
    await page.click('[data-testid="individual-chat-tab"]');
    await page.click('[data-testid="member-card-1"]');
    
    // Send many messages rapidly
    const messageCount = 100;
    const startTime = Date.now();
    
    for (let i = 0; i < messageCount; i++) {
      await page.fill('[data-testid="message-input"]', `Load test message ${i}`);
      await page.click('[data-testid="send-message-button"]');
      
      // Small delay to prevent overwhelming the system
      await page.waitForTimeout(10);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Verify all messages were sent
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText(`Load test message ${messageCount - 1}`);
    
    // Verify performance (should complete within reasonable time)
    expect(duration).toBeLessThan(30000); // 30 seconds
    
    console.log(`Sent ${messageCount} messages in ${duration}ms`);
  });

  test('should handle concurrent users', async ({ browser }) => {
    const userCount = 10;
    const contexts = await Promise.all(
      Array.from({ length: userCount }, () => browser.newContext())
    );
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    // Navigate all users to the same channel
    await Promise.all(
      pages.map(page => page.goto('/workspace/teamspace'))
    );
    
    await Promise.all(
      pages.map(page => page.click('[data-testid="messages-tab"]'))
    );
    
    await Promise.all(
      pages.map(page => page.click('[data-testid="individual-chat-tab"]'))
    );
    
    await Promise.all(
      pages.map(page => page.click('[data-testid="member-card-1"]'))
    );
    
    // Have all users send messages simultaneously
    const startTime = Date.now();
    
    await Promise.all(
      pages.map((page, index) => 
        page.fill('[data-testid="message-input"]', `Concurrent user ${index} message`)
      )
    );
    
    await Promise.all(
      pages.map(page => page.click('[data-testid="send-message-button"]'))
    );
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Verify all users can see all messages
    for (const page of pages) {
      await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Concurrent user');
    }
    
    console.log(`${userCount} concurrent users completed in ${duration}ms`);
    
    // Cleanup
    await Promise.all(pages.map(page => page.close()));
  });

  test('should handle large file uploads', async ({ page }) => {
    await page.goto('/workspace/teamspace');
    await page.click('[data-testid="messages-tab"]');
    await page.click('[data-testid="individual-chat-tab"]');
    await page.click('[data-testid="member-card-1"]');
    
    // Create a large file (5MB)
    const largeFile = Buffer.alloc(5 * 1024 * 1024, 'A');
    
    const startTime = Date.now();
    
    await page.setInputFiles('[data-testid="file-upload-input"]', {
      name: 'large-file.txt',
      mimeType: 'text/plain',
      buffer: largeFile
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Verify file was uploaded
    await expect(page.locator('[data-testid="file-attachment"]')).toBeVisible();
    
    // Verify upload completed within reasonable time
    expect(duration).toBeLessThan(60000); // 1 minute
    
    console.log(`Uploaded 5MB file in ${duration}ms`);
  });

  test('should handle rapid channel switching', async ({ page }) => {
    await page.goto('/workspace/teamspace');
    await page.click('[data-testid="channels-tab"]');
    
    // Create multiple channels
    const channelCount = 5;
    for (let i = 0; i < channelCount; i++) {
      await page.click('[data-testid="create-channel-button"]');
      await page.fill('[data-testid="channel-name-input"]', `Load Test Channel ${i}`);
      await page.click('[data-testid="create-channel-submit"]');
    }
    
    // Rapidly switch between channels
    const startTime = Date.now();
    
    for (let i = 0; i < 20; i++) {
      const channelIndex = i % channelCount;
      await page.click(`[data-testid="channel-${channelIndex}"]`);
      await page.waitForLoadState('networkidle');
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Verify performance
    expect(duration).toBeLessThan(10000); // 10 seconds
    
    console.log(`Switched between ${channelCount} channels 20 times in ${duration}ms`);
  });

  test('should handle search under load', async ({ page }) => {
    await page.goto('/workspace/teamspace');
    await page.click('[data-testid="messages-tab"]');
    
    // Perform multiple searches rapidly
    const searchTerms = ['test', 'message', 'hello', 'world', 'chat'];
    const startTime = Date.now();
    
    for (const term of searchTerms) {
      await page.click('[data-testid="search-button"]');
      await page.fill('[data-testid="search-input"]', term);
      await page.click('[data-testid="search-submit"]');
      await page.waitForSelector('[data-testid="search-results"]');
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Verify performance
    expect(duration).toBeLessThan(5000); // 5 seconds
    
    console.log(`Performed ${searchTerms.length} searches in ${duration}ms`);
  });
});
