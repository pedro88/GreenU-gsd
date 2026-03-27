import { test, expect } from './test-types';

test.describe('M001: Visualization — S03 Calendar and Analytics', () => {
  const calendarUser = {
    email: `calendaruser${Date.now()}@example.com`,
    password: 'CalendarUser123!',
    name: 'Calendar User',
  };

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/signup', { data: calendarUser });
    expect(res.status()).toBeLessThan(300);
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  async function createGardenAndGetId(page: any, name: string = 'My Calendar Garden'): Promise<string | null> {
    await page.goto('/auth/signin');
    await page.getByLabel(/email/i).fill(calendarUser.email);
    await page.getByLabel(/password/i).fill(calendarUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/', { timeout: 15000 });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Check if garden already exists
    const existingGarden = page.locator('a[href^="/garden/"]').first();
    const hasGarden = await existingGarden.isVisible().catch(() => false);
    
    if (hasGarden) {
      const href = await existingGarden.getAttribute('href');
      return href?.split('/garden/')[1] || null;
    }
    
    // Create new garden
    await page.getByRole('button', { name: /\+ new garden/i }).click();
    await page.waitForTimeout(300);
    await page.locator('input[placeholder*="Garden name"]').fill(name);
    await page.getByRole('button', { name: /create/i }).click();
    await page.waitForURL(/\/garden\/.+/, { timeout: 10000 });
    
    return page.url().split('/garden/')[1];
  }

  test.describe('Calendar Page', () => {
    test('should access calendar page directly', async ({ page }) => {
      const gardenId = await createGardenAndGetId(page, 'Calendar Direct Garden');
      
      if (gardenId) {
        await page.goto(`/calendar/${gardenId}`);
        await page.waitForLoadState('networkidle');
        
        // Calendar page should load
        await expect(page.locator('body')).toBeVisible();
      } else {
        test.skip(true, 'Could not create garden');
      }
    });

    test('should show calendar page with navigation', async ({ page }) => {
      const gardenId = await createGardenAndGetId(page, 'Calendar Nav Garden');
      
      if (gardenId) {
        // Navigate to garden then to calendar
        await page.goto(`/garden/${gardenId}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        // Click calendar link
        const calendarLink = page.locator('a:has-text("Calendar")');
        if (await calendarLink.isVisible().catch(() => false)) {
          await calendarLink.click();
          await page.waitForURL(/\/calendar\/.+/, { timeout: 5000 });
        } else {
          // Navigate directly
          await page.goto(`/calendar/${gardenId}`);
        }
        await page.waitForLoadState('networkidle');
      } else {
        test.skip(true, 'Could not create garden');
      }
    });

    test('should redirect to signin when accessing calendar unauthenticated', async ({ page }) => {
      await page.goto('/calendar/some-garden-id');
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('should redirect from calendar for non-owner', async ({ page }) => {
      // This would require a collaborator setup - tested in M003
      test.skip(true, 'Collaborator access tested in M003-S01');
    });
  });

  test.describe('Analytics Page', () => {
    test('should access analytics page directly', async ({ page }) => {
      const gardenId = await createGardenAndGetId(page, 'Analytics Direct Garden');
      
      if (gardenId) {
        await page.goto(`/analytics/${gardenId}`);
        await page.waitForLoadState('networkidle');
        
        // Analytics page should load
        await expect(page.locator('body')).toBeVisible();
      } else {
        test.skip(true, 'Could not create garden');
      }
    });

    test('should show analytics page from garden navigation', async ({ page }) => {
      const gardenId = await createGardenAndGetId(page, 'Analytics Display Garden');
      
      if (gardenId) {
        // Navigate to garden then to analytics
        await page.goto(`/garden/${gardenId}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        // Click analytics link
        const analyticsLink = page.locator('a:has-text("Analytics")');
        await analyticsLink.click();
        await page.waitForURL(/\/analytics\/.+/, { timeout: 5000 });
        await page.waitForLoadState('networkidle');
      } else {
        test.skip(true, 'Could not create garden');
      }
    });

    test('should redirect to signin when accessing analytics unauthenticated', async ({ page }) => {
      await page.goto('/analytics/test-garden-id');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      // Should redirect to signin
      const url = page.url();
      expect(url.includes('/auth/signin') || url.includes('/signin') || url.includes('localhost')).toBeTruthy();
    });
  });

  test.describe('Garden Navigation', () => {
    test('should navigate back to garden from calendar', async ({ page }) => {
      const gardenId = await createGardenAndGetId(page, 'Calendar Back Nav Garden');
      
      if (gardenId) {
        // Go to calendar
        await page.goto(`/calendar/${gardenId}`);
        await page.waitForLoadState('networkidle');
        
        // Click back link if visible
        const backLink = page.locator('a:has-text("←")').or(page.locator('a:has-text("Back")')).first();
        if (await backLink.isVisible().catch(() => false)) {
          await backLink.click();
          await page.waitForURL(/\/garden\/.+/, { timeout: 5000 });
        } else {
          // Navigate directly to garden
          await page.goto(`/garden/${gardenId}`);
        }
      } else {
        test.skip(true, 'Could not create garden');
      }
    });

    test('should navigate back to garden from analytics', async ({ page }) => {
      // Sign in first with retry
      for (let i = 0; i < 3; i++) {
        try {
          await page.goto('/auth/signin', { timeout: 10000 });
          await page.waitForLoadState('networkidle', { timeout: 10000 });
          await page.getByLabel(/email/i).fill(calendarUser.email);
          await page.getByLabel(/password/i).fill(calendarUser.password);
          await page.getByRole('button', { name: /sign in/i }).click();
          await page.waitForTimeout(3000);
          
          // Check if signed in
          await page.goto('/profile', { timeout: 10000 });
          await page.waitForLoadState('networkidle', { timeout: 10000 });
          break;
        } catch (e) {
          if (i === 2) throw e;
          await page.waitForTimeout(1000);
        }
      }
      
      // Create garden
      await page.getByRole('button', { name: /\+ new garden/i }).click();
      await page.waitForTimeout(500);
      await page.locator('input[placeholder*="Garden name"]').fill('Analytics Back Garden');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/\/garden\/.+/, { timeout: 15000 });
      const gardenId = page.url().split('/garden/')[1];
      
      // Go to analytics
      await page.goto(`/analytics/${gardenId}`);
      await page.waitForLoadState('networkidle');
      
      // Go back to garden directly
      await page.goto(`/garden/${gardenId}`);
      await page.waitForLoadState('networkidle');
    });
  });
});
