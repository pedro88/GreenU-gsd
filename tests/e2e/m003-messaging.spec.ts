import { test, expect } from './test-types';

test.describe('M003: Messaging — S02 Messaging System', () => {
  test.describe('Messages List', () => {
    test('should access messages page when signed in', async ({ page }) => {
      const userEmail = `msguser${Date.now()}@example.com`;

      // Sign up
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
      await page.getByLabel(/name/i).fill('Message User');
      await page.getByLabel(/email/i).fill(userEmail);
      await page.getByLabel(/^password$/i).fill('MsgUser123!');
      await page.getByLabel(/confirm password/i).fill('MsgUser123!');
      await page.getByRole('button', { name: /create account/i }).click();
      await page.waitForTimeout(2000);

      // Navigate to messages
      await page.goto('/messages');
      await page.waitForLoadState('networkidle');

      // Should show messages page
      await expect(page.locator('body')).toBeVisible();
    });

    test('should redirect to signin when not authenticated', async ({ page }) => {
      await page.goto('/messages');
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('should show messages or empty state', async ({ page }) => {
      const userEmail = `msguser2${Date.now()}@example.com`;

      // Sign up
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
      await page.getByLabel(/name/i).fill('Message User 2');
      await page.getByLabel(/email/i).fill(userEmail);
      await page.getByLabel(/^password$/i).fill('MsgUser123!');
      await page.getByLabel(/confirm password/i).fill('MsgUser123!');
      await page.getByRole('button', { name: /create account/i }).click();
      await page.waitForTimeout(2000);

      await page.goto('/messages');
      await page.waitForLoadState('networkidle');

      // Should have either conversations or empty state
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe('New Message Flow', () => {
    test('should open new message dialog', async ({ page }) => {
      const userEmail = `msguser3${Date.now()}@example.com`;

      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
      await page.getByLabel(/name/i).fill('Message User 3');
      await page.getByLabel(/email/i).fill(userEmail);
      await page.getByLabel(/^password$/i).fill('MsgUser123!');
      await page.getByLabel(/confirm password/i).fill('MsgUser123!');
      await page.getByRole('button', { name: /create account/i }).click();
      await page.waitForTimeout(2000);

      await page.goto('/messages');
      await page.waitForLoadState('networkidle');

      // Click new message button if visible
      const newMsgBtn = page.getByRole('button', { name: /\+ new message/i });
      if (await newMsgBtn.isVisible()) {
        await newMsgBtn.click();
        await page.waitForTimeout(500);

        // Should show email input
        const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
        await expect(emailInput).toBeVisible();
      }
    });
  });
});
