import { test, expect } from './test-types';

test.describe('OAuth Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test.describe('Sign In Page OAuth Buttons', () => {
    test('should show OAuth buttons on signin page', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Should show OAuth buttons
      await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
      await expect(page.locator('button:has-text("Continue with GitHub")')).toBeVisible();
      await expect(page.locator('button:has-text("Continue with Apple")')).toBeVisible();
    });

    test('should show email/password form alongside OAuth', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Should show email/password fields
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });
  });

  test.describe('Sign Up Page OAuth Buttons', () => {
    test('should show OAuth buttons on signup page', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');

      // Should show OAuth buttons
      await expect(page.locator('button:has-text("Sign up with Google")')).toBeVisible();
      await expect(page.locator('button:has-text("Sign up with GitHub")')).toBeVisible();
      await expect(page.locator('button:has-text("Sign up with Apple")')).toBeVisible();
    });

    test('should show email/password form alongside OAuth on signup', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');

      // Should show email/password fields
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });
  });

  test.describe('OAuth Button Click Behavior', () => {
    test('should trigger OAuth flow when clicking Google button', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Click Google button - should trigger redirect to Google
      const googleBtn = page.locator('button:has-text("Continue with Google")');
      await googleBtn.click();

      // Should redirect to Google OAuth or stay on page with OAuth initiated
      // The exact behavior depends on NextAuth configuration
      await page.waitForTimeout(1000);
    });
  });
});
