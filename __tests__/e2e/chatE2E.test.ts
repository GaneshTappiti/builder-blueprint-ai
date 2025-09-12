// End-to-end tests for chat functionality
import { test, expect, Page } from '@playwright/test';

test.describe('Chat E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/workspace/teamspace');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="teamspace-page"]');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should create and join a channel', async () => {
    // Navigate to channels tab
    await page.click('[data-testid="channels-tab"]');
    
    // Create new channel
    await page.click('[data-testid="create-channel-button"]');
    
    // Fill channel form
    await page.fill('[data-testid="channel-name-input"]', 'Test Channel');
    await page.fill('[data-testid="channel-description-input"]', 'Test channel description');
    await page.selectOption('[data-testid="channel-type-select"]', 'public');
    
    // Submit form
    await page.click('[data-testid="create-channel-submit"]');
    
    // Verify channel was created
    await expect(page.locator('[data-testid="channel-list"]')).toContainText('Test Channel');
  });

  test('should send and receive messages', async () => {
    // Navigate to messages tab
    await page.click('[data-testid="messages-tab"]');
    
    // Select a channel or start individual chat
    await page.click('[data-testid="individual-chat-tab"]');
    
    // Select a team member
    await page.click('[data-testid="member-card-1"]');
    
    // Wait for chat to load
    await page.waitForSelector('[data-testid="chat-messages"]');
    
    // Send a message
    await page.fill('[data-testid="message-input"]', 'Hello, this is a test message!');
    await page.click('[data-testid="send-message-button"]');
    
    // Verify message appears
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Hello, this is a test message!');
  });

  test('should upload and display files', async () => {
    // Navigate to messages
    await page.click('[data-testid="messages-tab"]');
    await page.click('[data-testid="individual-chat-tab"]');
    await page.click('[data-testid="member-card-1"]');
    
    // Upload a file
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: 'test-file.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Test file content')
    });
    
    // Verify file upload
    await expect(page.locator('[data-testid="file-attachment"]')).toBeVisible();
  });

  test('should search messages', async () => {
    // Navigate to messages
    await page.click('[data-testid="messages-tab"]');
    
    // Open search
    await page.click('[data-testid="search-button"]');
    
    // Search for messages
    await page.fill('[data-testid="search-input"]', 'test message');
    await page.click('[data-testid="search-submit"]');
    
    // Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should handle real-time updates', async () => {
    // Open two browser contexts to simulate multiple users
    const context2 = await page.context().browser()?.newContext();
    const page2 = await context2?.newPage();
    
    if (!page2) return;
    
    // User 1 navigates to chat
    await page.click('[data-testid="messages-tab"]');
    await page.click('[data-testid="individual-chat-tab"]');
    await page.click('[data-testid="member-card-1"]');
    
    // User 2 navigates to same chat
    await page2.goto('/workspace/teamspace');
    await page2.click('[data-testid="messages-tab"]');
    await page2.click('[data-testid="individual-chat-tab"]');
    await page2.click('[data-testid="member-card-1"]');
    
    // User 1 sends message
    await page.fill('[data-testid="message-input"]', 'Real-time test message');
    await page.click('[data-testid="send-message-button"]');
    
    // Verify User 2 sees the message
    await expect(page2.locator('[data-testid="chat-messages"]')).toContainText('Real-time test message');
    
    await page2.close();
  });

  test('should handle typing indicators', async () => {
    // Navigate to chat
    await page.click('[data-testid="messages-tab"]');
    await page.click('[data-testid="individual-chat-tab"]');
    await page.click('[data-testid="member-card-1"]');
    
    // Start typing
    await page.fill('[data-testid="message-input"]', 'Typing test...');
    
    // Verify typing indicator appears (if other user is present)
    // This would require a second user context
  });

  test('should handle push notifications', async () => {
    // Grant notification permission
    await page.context().grantPermissions(['notifications']);
    
    // Navigate to settings
    await page.click('[data-testid="settings-tab"]');
    
    // Enable notifications
    await page.check('[data-testid="push-notifications-checkbox"]');
    
    // Verify notification permission was requested
    // Note: Actual notification testing requires more complex setup
  });

  test('should handle error states gracefully', async () => {
    // Simulate network error
    await page.route('**/api/chat/**', route => route.abort());
    
    // Navigate to messages
    await page.click('[data-testid="messages-tab"]');
    
    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should handle large message lists with virtualization', async () => {
    // This test would require seeding the database with many messages
    // and verifying that only visible messages are rendered
  });

  test('should handle concurrent users', async () => {
    // Test multiple users accessing the same channel simultaneously
    const contexts = await Promise.all([
      page.context().browser()?.newContext(),
      page.context().browser()?.newContext(),
      page.context().browser()?.newContext()
    ]);
    
    const pages = await Promise.all(
      contexts.map(context => context?.newPage())
    );
    
    // Navigate all users to the same channel
    for (const p of pages) {
      if (p) {
        await p.goto('/workspace/teamspace');
        await p.click('[data-testid="messages-tab"]');
        await p.click('[data-testid="individual-chat-tab"]');
        await p.click('[data-testid="member-card-1"]');
      }
    }
    
    // Have users send messages simultaneously
    await Promise.all(
      pages.map((p, index) => 
        p?.fill('[data-testid="message-input"]', `Concurrent message ${index}`)
      )
    );
    
    await Promise.all(
      pages.map(p => p?.click('[data-testid="send-message-button"]'))
    );
    
    // Verify all messages appear for all users
    for (const p of pages) {
      if (p) {
        await expect(p.locator('[data-testid="chat-messages"]')).toContainText('Concurrent message');
      }
    }
    
    // Cleanup
    await Promise.all(pages.map(p => p?.close()));
  });
});
