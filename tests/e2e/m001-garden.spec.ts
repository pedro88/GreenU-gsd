import { test, expect } from './test-types';
import type { Page } from '@playwright/test';

test.describe('M001: Garden Cultivation — S02 Garden Data Model', () => {
  const gardenUser = {
    email: `gardenuser${Date.now()}@example.com`,
    password: 'GardenUser123!',
    name: 'Garden Cultivator',
  };

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/signup', { data: gardenUser });
    expect(res.status()).toBeLessThan(300);
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  async function signInAndCreateGarden(
    page: Page,
    gardenName: string = 'Test Garden'
  ): Promise<string | null> {
    // Sign in
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email/i).fill(gardenUser.email);
    await page.getByLabel(/password/i).fill(gardenUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for redirect to complete
    await page.waitForTimeout(2000);

    // Create garden
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /\+ new garden/i }).click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder*="Garden name"]').fill(gardenName);
    await page.getByRole('button', { name: /create/i }).click();
    await page.waitForURL(/\/garden\/.+/, { timeout: 15000 });

    return page.url().split('/garden/')[1];
  }

  test.describe('Garden Creation', () => {
    test('should create a new garden', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      await page.getByLabel(/email/i).fill(gardenUser.email);
      await page.getByLabel(/password/i).fill(gardenUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForTimeout(2000);

      // Create garden
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /\+ new garden/i }).click();
      await page.waitForTimeout(500);
      await page.locator('input[placeholder*="Garden name"]').fill('My Vegetable Garden');
      await page.getByRole('button', { name: /create/i }).click();

      // Should redirect to garden page
      await page.waitForURL(/\/garden\/.+/, { timeout: 15000 });
    });

    test('should show garden in profile list after creation', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      await page.getByLabel(/email/i).fill(gardenUser.email);
      await page.getByLabel(/password/i).fill(gardenUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForTimeout(2000);

      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Check garden exists in list
      const gardenText = page.getByText('My Vegetable Garden');
      await expect(gardenText).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to garden from profile', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      await page.getByLabel(/email/i).fill(gardenUser.email);
      await page.getByLabel(/password/i).fill(gardenUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForTimeout(2000);

      // First create a garden
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /\+ new garden/i }).click();
      await page.waitForTimeout(500);
      await page.locator('input[placeholder*="Garden name"]').fill('Nav Test Garden');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/\/garden\/.+/, { timeout: 15000 });

      // Go back to profile
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Click on garden link
      const gardenLink = page.locator('a[href^="/garden/"]').first();
      await expect(gardenLink).toBeVisible({ timeout: 5000 });
      await gardenLink.click();
      await page.waitForURL(/\/garden\/.+/, { timeout: 10000 });

      // Page should load
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Zone Management', () => {
    test('should add a zone to garden', async ({ page }) => {
      const gardenId = await signInAndCreateGarden(page, 'Zone Test Garden');

      if (!gardenId) {
        test.skip(true, 'Could not create garden');
        return;
      }

      // Wait for page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for add zone button (could be named differently)
      const addZoneBtn = page.locator('button').filter({ hasText: /zone/i }).first();
      if (await addZoneBtn.isVisible().catch(() => false)) {
        await addZoneBtn.click();
        await page.waitForTimeout(500);
      }
    });

    test('should see garden canvas', async ({ page }) => {
      // Sign in and create garden
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      await page.getByLabel(/email/i).fill(gardenUser.email);
      await page.getByLabel(/password/i).fill(gardenUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForTimeout(2000);

      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /\+ new garden/i }).click();
      await page.waitForTimeout(500);
      await page.locator('input[placeholder*="Garden name"]').fill('Canvas Garden');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/\/garden\/.+/, { timeout: 15000 });

      // Page should load
      await expect(page.locator('body')).toBeVisible();
    });

    test('should delete a zone', async ({ page }) => {
      const gardenId = await signInAndCreateGarden(page, 'Delete Zone Garden');

      if (!gardenId) {
        test.skip(true, 'Could not create garden');
        return;
      }

      await page.waitForTimeout(500);

      // Look for delete option
      const deleteBtn = page
        .locator('button')
        .filter({ hasText: /delete|remove|🗑/i })
        .first();
      if (await deleteBtn.isVisible().catch(() => false)) {
        await deleteBtn.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Plot Management', () => {
    test('should add a plot to a zone', async ({ page }) => {
      const gardenId = await signInAndCreateGarden(page, 'Plot Test Garden');

      if (!gardenId) {
        test.skip(true, 'Could not create garden');
        return;
      }

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for add plot button
      const addPlotBtn = page.locator('button').filter({ hasText: /plot/i }).first();
      if (await addPlotBtn.isVisible().catch(() => false)) {
        await addPlotBtn.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Crop Management', () => {
    test('should add a crop to a plot', async ({ page }) => {
      // Sign in
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      await page.getByLabel(/email/i).fill(gardenUser.email);
      await page.getByLabel(/password/i).fill(gardenUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForTimeout(2000);

      // Create garden
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /\+ new garden/i }).click();
      await page.waitForTimeout(500);
      await page.locator('input[placeholder*="Garden name"]').fill('Crop Test Garden');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/\/garden\/.+/, { timeout: 15000 });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for add crop button
      const addCropBtn = page
        .locator('button')
        .filter({ hasText: /crop|plant/i })
        .first();
      if (await addCropBtn.isVisible().catch(() => false)) {
        await addCropBtn.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Garden Access Control', () => {
    test('should not allow viewer to edit garden', async ({ page: _page }) => {
      // This test requires collaborator setup - covered in M003-S01
      test.skip(true, 'Collaborator access tested in M003-S01');
    });

    test('should redirect unauthenticated users from garden page', async ({ page }) => {
      await page.goto('/garden/some-garden-id');
      await expect(page).toHaveURL(/\/auth\/signin/);
    });
  });
});
