import { test, expect } from '@playwright/test';

test.describe('Profile System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the profile page
    await page.goto('/profile');
  });

  test('should display profile page with loading state', async ({ page }) => {
    // Check if loading spinner is displayed
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for profile to load
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible({ timeout: 10000 });
  });

  test('should allow editing profile information', async ({ page }) => {
    // Wait for profile to load
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible({ timeout: 10000 });
    
    // Click edit button
    await page.click('[data-testid="edit-profile-button"]');
    
    // Fill in profile form
    await page.fill('[data-testid="bio-input"]', 'Updated bio for testing');
    await page.fill('[data-testid="job-title-input"]', 'Senior Developer');
    await page.fill('[data-testid="location-input"]', 'San Francisco, CA');
    
    // Save changes
    await page.click('[data-testid="save-profile-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Profile Updated');
    
    // Verify changes are reflected
    await expect(page.locator('[data-testid="bio-display"]')).toContainText('Updated bio for testing');
    await expect(page.locator('[data-testid="job-title-display"]')).toContainText('Senior Developer');
  });

  test('should add skills to profile', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible({ timeout: 10000 });
    
    // Navigate to skills tab
    await page.click('[data-testid="skills-tab"]');
    
    // Click add skill button
    await page.click('[data-testid="add-skill-button"]');
    
    // Fill skill form
    await page.fill('[data-testid="skill-name-input"]', 'React');
    await page.selectOption('[data-testid="skill-category-select"]', 'technical');
    await page.selectOption('[data-testid="skill-level-select"]', 'advanced');
    await page.fill('[data-testid="skill-experience-input"]', '3');
    
    // Save skill
    await page.click('[data-testid="save-skill-button"]');
    
    // Verify skill was added
    await expect(page.locator('[data-testid="skill-item"]')).toContainText('React');
    await expect(page.locator('[data-testid="skill-level"]')).toContainText('Advanced');
  });

  test('should add certifications to profile', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible({ timeout: 10000 });
    
    // Navigate to certifications tab
    await page.click('[data-testid="certifications-tab"]');
    
    // Click add certification button
    await page.click('[data-testid="add-certification-button"]');
    
    // Fill certification form
    await page.fill('[data-testid="cert-name-input"]', 'AWS Certified Developer');
    await page.fill('[data-testid="cert-issuer-input"]', 'Amazon Web Services');
    await page.fill('[data-testid="cert-issue-date-input"]', '2023-01-01');
    
    // Save certification
    await page.click('[data-testid="save-certification-button"]');
    
    // Verify certification was added
    await expect(page.locator('[data-testid="certification-item"]')).toContainText('AWS Certified Developer');
    await expect(page.locator('[data-testid="certification-issuer"]')).toContainText('Amazon Web Services');
  });

  test('should search and filter profiles', async ({ page }) => {
    // Navigate to profile search
    await page.goto('/profile/search');
    
    // Wait for search page to load
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    
    // Search for profiles with specific skills
    await page.fill('[data-testid="search-input"]', 'JavaScript');
    await page.click('[data-testid="search-button"]');
    
    // Wait for results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Verify results contain the search term
    const results = page.locator('[data-testid="profile-card"]');
    await expect(results.first()).toBeVisible();
  });

  test('should update privacy settings', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible({ timeout: 10000 });
    
    // Navigate to settings
    await page.click('[data-testid="settings-button"]');
    
    // Update privacy settings
    await page.selectOption('[data-testid="profile-visibility-select"]', 'team');
    await page.selectOption('[data-testid="contact-visibility-select"]', 'private');
    await page.check('[data-testid="allow-direct-messages-checkbox"]');
    
    // Save settings
    await page.click('[data-testid="save-settings-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Privacy Settings Updated');
  });

  test('should export profile data (GDPR)', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible({ timeout: 10000 });
    
    // Navigate to settings
    await page.click('[data-testid="settings-button"]');
    
    // Click export data button
    await page.click('[data-testid="export-data-button"]');
    
    // Confirm export
    await page.click('[data-testid="confirm-export-button"]');
    
    // Wait for download to start
    const downloadPromise = page.waitForEvent('download');
    await downloadPromise;
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Data Export Complete');
  });

  test('should handle profile deletion workflow', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible({ timeout: 10000 });
    
    // Navigate to settings
    await page.click('[data-testid="settings-button"]');
    
    // Click delete profile button
    await page.click('[data-testid="delete-profile-button"]');
    
    // Fill deletion reason
    await page.fill('[data-testid="deletion-reason-input"]', 'Testing profile deletion');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-deletion-button"]');
    
    // Verify confirmation dialog
    await expect(page.locator('[data-testid="deletion-confirmation-dialog"]')).toBeVisible();
    
    // Final confirmation
    await page.click('[data-testid="final-confirm-deletion-button"]');
    
    // Verify profile is marked for deletion
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Profile Deletion Requested');
  });

  test('should display profile completion progress', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible({ timeout: 10000 });
    
    // Check if profile completion is displayed
    await expect(page.locator('[data-testid="profile-completion-progress"]')).toBeVisible();
    
    // Check completion percentage
    const completionText = await page.locator('[data-testid="profile-completion-text"]').textContent();
    expect(completionText).toMatch(/\d+%/);
  });

  test('should show profile timeline and activities', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible({ timeout: 10000 });
    
    // Navigate to timeline tab
    await page.click('[data-testid="timeline-tab"]');
    
    // Check if timeline is displayed
    await expect(page.locator('[data-testid="timeline-feed"]')).toBeVisible();
    
    // Check for timeline events
    const events = page.locator('[data-testid="timeline-event"]');
    await expect(events.first()).toBeVisible();
  });

  test('should display gamification elements', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible({ timeout: 10000 });
    
    // Navigate to achievements tab
    await page.click('[data-testid="achievements-tab"]');
    
    // Check if gamification elements are displayed
    await expect(page.locator('[data-testid="badges-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="points-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="level-display"]')).toBeVisible();
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible({ timeout: 10000 });
    
    // Check if mobile navigation is working
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Test mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Test mobile tabs
    await page.click('[data-testid="mobile-skills-tab"]');
    await expect(page.locator('[data-testid="skills-section"]')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/profile/**', route => route.abort());
    
    await page.goto('/profile');
    
    // Check if error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 10000 });
    
    // Check if retry button is available
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
});
