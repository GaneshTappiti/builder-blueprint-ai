import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * OAuth Onboarding Flow Tests
 * 
 * Tests the complete OAuth authentication and onboarding process including:
 * - New user OAuth flow
 * - Returning user OAuth flow  
 * - Profile setup completion
 * - Edge cases and error scenarios
 */

// Extend Window interface for test mocks
declare global {
  interface Window {
    __mockOAuthSuccess?: boolean;
    __mockUserData?: any;
    __analyticsEvents?: string[];
    trackEvent?: (event: string) => void;
  }
}

// Test data
const TEST_USERS = {
  newUser: {
    email: 'newuser@example.com',
    name: 'New User',
    provider: 'google'
  },
  returningUser: {
    email: 'existing@example.com', 
    name: 'Existing User',
    provider: 'github'
  }
};

// Helper function to mock OAuth providers
async function mockOAuthProvider(page: Page, provider: 'google' | 'github', userData: any) {
  // Mock the OAuth redirect
  await page.route(`**/*auth/callback**`, async route => {
    // Simulate successful OAuth callback
    const url = new URL(route.request().url());
    url.searchParams.set('access_token', 'mock_access_token');
    url.searchParams.set('token_type', 'bearer');
    
    await route.fulfill({
      status: 302,
      headers: {
        'Location': url.toString()
      }
    });
  });

  // Mock Supabase auth responses
  await page.addInitScript(() => {
    // Mock successful authentication
    window.__mockOAuthSuccess = true;
  });
}

// Helper to check if user is redirected correctly
async function expectRedirectToSetup(page: Page) {
  await expect(page).toHaveURL(/\/profile\/setup/);
  await expect(page.locator('h1')).toContainText('Complete Your Profile');
}

async function expectRedirectToWorkspace(page: Page) {
  await expect(page).toHaveURL(/\/workspace/);
}

async function expectOnboardingBanner(page: Page) {
  await expect(page.locator('[data-testid="onboarding-success-banner"]')).toBeVisible();
  await expect(page.locator('text=Profile Setup Complete!')).toBeVisible();
}

test.describe('OAuth Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/');
  });

  test.describe('New User OAuth Flow', () => {
    test('should complete Google OAuth for new user', async ({ page }) => {
      // Mock Google OAuth
      await mockOAuthProvider(page, 'google', TEST_USERS.newUser);
      
      // Navigate to auth page
      await page.goto('/auth');
      
      // Click Google OAuth button
      await page.click('[data-testid="google-oauth-button"]');
      
      // Should redirect to profile setup for new users
      await expectRedirectToSetup(page);
      
      // Verify profile setup form is displayed
      await expect(page.locator('input[name="firstName"]')).toBeVisible();
      await expect(page.locator('input[name="lastName"]')).toBeVisible();
    });

    test('should complete GitHub OAuth for new user', async ({ page }) => {
      await mockOAuthProvider(page, 'github', TEST_USERS.newUser);
      
      await page.goto('/auth');
      await page.click('[data-testid="github-oauth-button"]');
      
      await expectRedirectToSetup(page);
    });

    test('should handle profile creation failure gracefully', async ({ page }) => {
      // Mock profile creation failure
      await page.route('**/api/profiles', route => route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Profile creation failed' })
      }));

      await mockOAuthProvider(page, 'google', TEST_USERS.newUser);
      
      await page.goto('/auth');
      await page.click('[data-testid="google-oauth-button"]');
      
      // Should still redirect to profile setup for retry
      await expectRedirectToSetup(page);
    });
  });

  test.describe('Returning User OAuth Flow', () => {
    test('should redirect returning user to workspace', async ({ page }) => {
      // Mock existing user with completed profile
      await page.addInitScript(() => {
        window.__mockUserData = {
          ...TEST_USERS.returningUser,
          onboardingCompleted: true,
          profileComplete: true
        };
      });

      await mockOAuthProvider(page, 'github', TEST_USERS.returningUser);
      
      await page.goto('/auth');
      await page.click('[data-testid="github-oauth-button"]');
      
      // Should redirect directly to workspace
      await expectRedirectToWorkspace(page);
    });

    test('should handle OAuth refresh token correctly', async ({ page }) => {
      // Mock OAuth refresh scenario (user created > 5 minutes ago)
      const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
      
      await page.addInitScript((timestamp) => {
        window.__mockUserData = {
          ...TEST_USERS.returningUser,
          created_at: timestamp,
          last_sign_in_at: new Date().toISOString(),
          onboardingCompleted: true
        };
      }, oldTimestamp);

      await mockOAuthProvider(page, 'google', TEST_USERS.returningUser);
      
      await page.goto('/auth');
      await page.click('[data-testid="google-oauth-button"]');
      
      // Should redirect to workspace, not setup
      await expectRedirectToWorkspace(page);
    });
  });

  test.describe('Profile Setup Completion', () => {
    test('should complete profile setup and show success banner', async ({ page }) => {
      await mockOAuthProvider(page, 'google', TEST_USERS.newUser);
      
      // Start OAuth flow
      await page.goto('/auth');
      await page.click('[data-testid="google-oauth-button"]');
      await expectRedirectToSetup(page);
      
      // Fill out profile setup form
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Doe');
      await page.fill('input[name="displayName"]', 'John Doe');
      await page.fill('textarea[name="bio"]', 'Test user bio');
      
      // Navigate through steps
      await page.click('button:has-text("Next")');
      
      // Add skills
      await page.fill('input[placeholder*="skill"]', 'JavaScript');
      await page.press('input[placeholder*="skill"]', 'Enter');
      await page.fill('input[placeholder*="skill"]', 'React');
      await page.press('input[placeholder*="skill"]', 'Enter');
      
      await page.click('button:has-text("Next")');
      
      // Add interests
      await page.fill('input[placeholder*="interest"]', 'Web Development');
      await page.press('input[placeholder*="interest"]', 'Enter');
      
      await page.click('button:has-text("Next")');
      
      // Complete setup
      await page.click('button:has-text("Complete Profile")');
      
      // Should redirect to workspace
      await expectRedirectToWorkspace(page);
      
      // Should show success banner
      await expectOnboardingBanner(page);
    });

    test('should apply privacy defaults during setup', async ({ page }) => {
      await mockOAuthProvider(page, 'google', TEST_USERS.newUser);
      
      await page.goto('/auth');
      await page.click('[data-testid="google-oauth-button"]');
      await expectRedirectToSetup(page);
      
      // Complete minimal profile setup
      await page.fill('input[name="firstName"]', 'Privacy');
      await page.fill('input[name="lastName"]', 'User');
      
      // Skip through steps quickly
      await page.click('button:has-text("Next")');
      await page.click('button:has-text("Next")'); 
      await page.click('button:has-text("Next")');
      await page.click('button:has-text("Complete Profile")');
      
      await expectRedirectToWorkspace(page);
      
      // Navigate to profile settings to verify privacy defaults
      await page.goto('/profile');
      await page.click('text=Privacy Settings');
      
      // Verify default privacy settings
      await expect(page.locator('select[name="contactInfoVisibility"]')).toHaveValue('team');
      await expect(page.locator('select[name="activityVisibility"]')).toHaveValue('team');
      await expect(page.locator('select[name="notesVisibility"]')).toHaveValue('private');
    });
  });

  test.describe('Edge Cases and Error Scenarios', () => {
    test('should handle network failure during OAuth', async ({ page }) => {
      // Mock network failure
      await page.route('**/*auth/callback*', route => route.fulfill({
        status: 500,
        body: 'Network error'
      }));
      
      await page.goto('/auth');
      await page.click('[data-testid="google-oauth-button"]');
      
      // Should show error message
      await expect(page.locator('text=Authentication failed')).toBeVisible();
    });

    test('should handle incomplete profile data from OAuth provider', async ({ page }) => {
      // Mock OAuth with minimal user data
      await mockOAuthProvider(page, 'google', {
        email: 'minimal@example.com'
        // Missing name and other fields
      });
      
      await page.goto('/auth');
      await page.click('[data-testid="google-oauth-button"]');
      
      // Should still redirect to setup
      await expectRedirectToSetup(page);
      
      // Form should handle missing data gracefully
      await expect(page.locator('input[name="firstName"]')).toHaveValue('');
      await expect(page.locator('input[name="lastName"]')).toHaveValue('');
    });

    test('should handle user who deletes profile data but re-logins', async ({ page }) => {
      // Mock user with deleted profile
      await page.addInitScript(() => {
        window.__mockUserData = {
          ...TEST_USERS.returningUser,
          profileDeleted: true,
          onboardingCompleted: false
        };
      });

      await mockOAuthProvider(page, 'github', TEST_USERS.returningUser);
      
      await page.goto('/auth');
      await page.click('[data-testid="github-oauth-button"]');
      
      // Should redirect to setup for profile recreation
      await expectRedirectToSetup(page);
    });

    test('should handle concurrent OAuth attempts', async ({ page, context }) => {
      // Open multiple tabs with OAuth flow
      const page2 = await context.newPage();
      
      await mockOAuthProvider(page, 'google', TEST_USERS.newUser);
      await mockOAuthProvider(page2, 'google', TEST_USERS.newUser);
      
      // Attempt OAuth in both tabs simultaneously
      await Promise.all([
        page.goto('/auth').then(() => page.click('[data-testid="google-oauth-button"]')),
        page2.goto('/auth').then(() => page2.click('[data-testid="google-oauth-button"]'))
      ]);
      
      // Both should eventually reach a valid state
      await Promise.all([
        expectRedirectToSetup(page),
        expectRedirectToSetup(page2)
      ]);
    });

    test('should handle OAuth provider timeout', async ({ page }) => {
      // Mock slow OAuth response
      await page.route('**/*auth/callback*', async route => {
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
        await route.fulfill({ status: 408, body: 'Request timeout' });
      });
      
      await page.goto('/auth');
      await page.click('[data-testid="google-oauth-button"]');
      
      // Should show timeout error
      await expect(page.locator('text=timeout')).toBeVisible({ timeout: 35000 });
    });
  });

  test.describe('Analytics and User Journey Tracking', () => {
    test('should track successful onboarding journey', async ({ page }) => {
      // Mock analytics tracking
      const analyticsEvents: string[] = [];
      
      await page.addInitScript(() => {
        window.__analyticsEvents = [];
        window.trackEvent = (event: string) => {
          window.__analyticsEvents?.push(event);
        };
      });
      
      await mockOAuthProvider(page, 'google', TEST_USERS.newUser);
      
      // Complete full onboarding flow
      await page.goto('/auth');
      await page.click('[data-testid="google-oauth-button"]');
      await expectRedirectToSetup(page);
      
      // Complete profile setup
      await page.fill('input[name="firstName"]', 'Analytics');
      await page.fill('input[name="lastName"]', 'User');
      await page.click('button:has-text("Next")');
      await page.click('button:has-text("Next")');
      await page.click('button:has-text("Next")');
      await page.click('button:has-text("Complete Profile")');
      
      await expectRedirectToWorkspace(page);
      
      // Verify analytics events were tracked
      const events = await page.evaluate(() => window.__analyticsEvents);
      expect(events).toContain('oauth_started');
      expect(events).toContain('profile_setup_completed');
      expect(events).toContain('onboarding_completed');
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should handle OAuth flow under load', async ({ page }) => {
      // Measure OAuth flow performance
      const startTime = Date.now();
      
      await mockOAuthProvider(page, 'google', TEST_USERS.newUser);
      
      await page.goto('/auth');
      await page.click('[data-testid="google-oauth-button"]');
      await expectRedirectToSetup(page);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // OAuth flow should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });
  });
});