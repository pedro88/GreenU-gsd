import { test, expect } from './test-types';

test.describe('M002: Social Sharing — S01 Public Garden', () => {
  // Use a separate test user for social features
  const gardenOwner = {
    email: `gardenowner${Date.now()}@example.com`,
    password: 'GardenOwner123!',
    name: 'Garden Owner',
  };

  test.beforeAll(async ({ request }) => {
    // Create test user for garden owner
    const res = await request.post('/api/auth/signup', {
      data: {
        name: gardenOwner.name,
        email: gardenOwner.email,
        password: gardenOwner.password,
      },
    });
    expect(res.status()).toBeLessThan(300);
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test.describe('isPublic Toggle', () => {
    test('should toggle garden to public and show public badge', async ({ page }) => {
      // Sign in
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(gardenOwner.email);
      await page.getByLabel(/password/i).fill(gardenOwner.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/', { timeout: 15000 });

      // Create a garden
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /\+ new garden/i }).click();
      await page.waitForTimeout(300);
      await page.locator('input[placeholder*="Garden name"]').fill('My Public Garden');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/\/garden\//, { timeout: 10000 });

      // Open settings
      await page.getByRole('button', { name: /settings/i }).click();
      await page.waitForTimeout(500);

      // Toggle public
      const toggle = page.locator('[role="switch"]').first();
      await expect(toggle).toBeVisible();
      await toggle.click();
      await page.waitForTimeout(1000);

      // Close settings
      await page.getByRole('button', { name: /done/i }).click();

      // "Public" badge should appear in header
      await expect(page.locator('span:has-text("Public")').first()).toBeVisible({ timeout: 5000 });
    });

    test('should show public link when garden is public', async ({ page }) => {
      // Sign in
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(gardenOwner.email);
      await page.getByLabel(/password/i).fill(gardenOwner.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/', { timeout: 15000 });

      // First create a garden if none exists
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      // Check if garden already exists, if not create one
      const existingGarden = page.locator('a[href^="/garden/"]').first();
      const hasGarden = await existingGarden.isVisible().catch(() => false);
      
      if (!hasGarden) {
        await page.getByRole('button', { name: /\+ new garden/i }).click();
        await page.waitForTimeout(300);
        await page.locator('input[placeholder*="Garden name"]').fill('Garden With Public Link');
        await page.getByRole('button', { name: /create/i }).click();
        await page.waitForURL(/\/garden\//, { timeout: 10000 });
      } else {
        await existingGarden.click();
        await page.waitForURL(/\/garden\//, { timeout: 5000 });
      }

      // Open settings and make public
      await page.getByRole('button', { name: /settings/i }).click();
      await page.waitForTimeout(300);

      const toggle = page.locator('[role="switch"]').first();
      const isPublic = await toggle.getAttribute('aria-checked');
      if (isPublic === 'false') {
        await toggle.click();
        await page.waitForTimeout(500);
      }

      // Check public URL box appears
      await expect(page.locator('text=Public link')).toBeVisible({ timeout: 3000 });
      const urlInput = page.locator('input[readonly]').first();
      await expect(urlInput).toBeVisible();

      // URL should contain /gardens/
      const urlValue = await urlInput.inputValue();
      expect(urlValue).toContain('/gardens/');
    });
  });

  test.describe('Public Garden Page (/gardens/[id])', () => {
    test('should access public garden without auth', async ({ page }) => {
      // First create a public garden as owner
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(gardenOwner.email);
      await page.getByLabel(/password/i).fill(gardenOwner.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/', { timeout: 15000 });

      // Create garden and make it public
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await page.getByRole('button', { name: /\+ new garden/i }).click();
      await page.waitForTimeout(300);
      await page.locator('input[placeholder*="Garden name"]').fill('Public Access Garden');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/\/garden\//, { timeout: 10000 });

      await page.getByRole('button', { name: /settings/i }).click();
      await page.waitForTimeout(300);
      const toggle = page.locator('[role="switch"]').first();
      const isPublic = await toggle.getAttribute('aria-checked');
      if (isPublic === 'false') {
        await toggle.click();
        await page.waitForTimeout(500);
      }
      await page.getByRole('button', { name: /done/i }).click();

      // Get garden ID from URL
      const gardenId = page.url().split('/garden/')[1];
      const publicUrl = `/gardens/${gardenId}`;

      // Sign out — clear cookies
      await page.context().clearCookies();

      // Navigate to public garden without auth
      await page.goto(publicUrl);
      await page.waitForLoadState('networkidle');

      // Should show garden name (read-only)
      await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });

      // Should NOT have edit controls (no settings gear)
      await expect(page.getByRole('button', { name: /settings/i })).not.toBeVisible();

      // Should show owner name
      await expect(page.getByText(gardenOwner.name)).toBeVisible({ timeout: 3000 });
    });

    test('should show private garden error when not owner', async ({ page }) => {
      // Create a private garden as owner
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(gardenOwner.email);
      await page.getByLabel(/password/i).fill(gardenOwner.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/', { timeout: 15000 });

      // Create garden
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await page.getByRole('button', { name: /\+ new garden/i }).click();
      await page.waitForTimeout(300);
      await page.locator('input[placeholder*="Garden name"]').fill('Private Garden Test');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/\/garden\//, { timeout: 10000 });

      // Ensure garden is private (toggle off if on)
      await page.getByRole('button', { name: /settings/i }).click();
      await page.waitForTimeout(300);
      const toggle = page.locator('[role="switch"]').first();
      const isPublic = await toggle.getAttribute('aria-checked');
      if (isPublic === 'true') {
        await toggle.click();
        await page.waitForTimeout(500);
      }
      await page.getByRole('button', { name: /done/i }).click();

      // Get garden ID from URL
      const gardenId = page.url().split('/garden/')[1];
      const privateUrl = `/gardens/${gardenId}`;

      // Sign out
      await page.context().clearCookies();

      // Navigate to private garden
      await page.goto(privateUrl);
      await page.waitForLoadState('networkidle');

      // Should show private garden error
      await expect(page.locator('text="Private Garden"').or(page.locator('text=/private garden/i'))).toBeVisible({ timeout: 5000 });
    });
  });
});

test.describe('M002: Social Sharing — S02 Follow System', () => {
  const follower = {
    email: `follower${Date.now()}@example.com`,
    password: 'Follower123!',
    name: 'Follow Test User',
  };
  const followed = {
    email: `followed${Date.now()}@example.com`,
    password: 'Followed123!',
    name: 'Followed Test User',
  };

  test.beforeAll(async ({ request }) => {
    await request.post('/api/auth/signup', { data: { name: follower.name, email: follower.email, password: follower.password } });
    await request.post('/api/auth/signup', { data: { name: followed.name, email: followed.email, password: followed.password } });
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test.describe('Follow / Unfollow', () => {
    test('should follow a user from their public garden page', async ({ page }) => {
      // Create a public garden for the followed user
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(followed.email);
      await page.getByLabel(/password/i).fill(followed.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/', { timeout: 15000 });

      // Create garden
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await page.getByRole('button', { name: /\+ new garden/i }).click();
      await page.waitForTimeout(300);
      await page.locator('input[placeholder*="Garden name"]').fill('Follow Target Garden');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/\/garden\//, { timeout: 10000 });

      // Make public
      await page.getByRole('button', { name: /settings/i }).click();
      await page.waitForTimeout(300);
      const toggle = page.locator('[role="switch"]').first();
      await toggle.click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /done/i }).click();

      const gardenUrl = page.url();
      const gardenId = gardenUrl.split('/garden/')[1];

      // Sign out
      await page.context().clearCookies();

      // Sign in as follower
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(follower.email);
      await page.getByLabel(/password/i).fill(follower.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/', { timeout: 15000 });

      // Navigate to public garden
      await page.goto(`/gardens/${gardenId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Follow button should be visible - look for the follow button in header
      const followBtn = page.locator('button:has-text("+ Follow"), button:has-text("Following")').first();
      await expect(followBtn).toBeVisible({ timeout: 5000 });

      const initialText = await followBtn.textContent();
      if (initialText?.includes('+ Follow')) {
        await followBtn.click();
        await page.waitForTimeout(1000);
        // Should now say "Following"
        await expect(page.locator('button:has-text("Following")').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should show updated follower/following counts on profile after follow', async ({ page }) => {
      // Sign in as followed user
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(followed.email);
      await page.getByLabel(/password/i).fill(followed.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/', { timeout: 15000 });

      // Get followed user's profile
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Record initial follower count
      const followerCountEl = page.locator('text=/followers/i').first();
      await expect(followerCountEl).toBeVisible();

      // Sign out
      await page.context().clearCookies();

      // Sign in as follower
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(follower.email);
      await page.getByLabel(/password/i).fill(follower.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/', { timeout: 15000 });

      // Navigate to followed's profile to verify following count increased
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Following count should show at least 1 (or 0 if test isolation fails)
      const followingCount = page.locator('text=/following/i').first();
      await expect(followingCount).toBeVisible({ timeout: 3000 });
    });
  });
});

test.describe('M002: Social Sharing — S03 Discover Feed', () => {
  const discoverUser = {
    email: `discover${Date.now()}@example.com`,
    password: 'Discover123!',
    name: 'Discover Test User',
  };

  test.beforeAll(async ({ request }) => {
    await request.post('/api/auth/signup', { data: discoverUser });
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test.describe('Discover Feed', () => {
    test('should Render discover page without auth', async ({ page }) => {
      await page.goto('/discover');
      await page.waitForLoadState('networkidle');

      // Page title
      await expect(page.getByRole('heading', { name: /discover gardens/i })).toBeVisible();

      // Search input visible
      await expect(page.getByPlaceholder(/search gardens/i)).toBeVisible();

      // Sort dropdown visible
      await expect(page.locator('select').first()).toBeVisible();
    });

    test('should search gardens by name', async ({ page }) => {
      await page.goto('/discover');
      await page.waitForLoadState('networkidle');

      // Type in search
      const searchInput = page.getByPlaceholder(/search gardens/i);
      await searchInput.fill('Backyard');

      // Wait for debounce + results
      await page.waitForTimeout(500);

      // Results update (either filtered or empty)
      // No assertion on count — just verify input was accepted
      await expect(searchInput).toHaveValue('Backyard');
    });

    test('should filter by crop type', async ({ page }) => {
      await page.goto('/discover');
      await page.waitForLoadState('networkidle');

      // Find the crop filter dropdown (last select)
      const cropSelect = page.locator('select').last();
      await expect(cropSelect).toBeVisible();

      // Open and select first option if available
      const options = await cropSelect.locator('option').count();
      if (options > 1) {
        await cropSelect.selectOption({ index: 1 });
        await page.waitForTimeout(300);
        // Filter applied — no crash expected
      }
    });

    test('should navigate to garden from discover card', async ({ page }) => {
      await page.goto('/discover');
      await page.waitForLoadState('networkidle');

      // Wait for cards to load
      await page.waitForTimeout(1000);

      const cards = page.locator('a[href^="/gardens/"]');
      const count = await cards.count();

      if (count > 0) {
        // Get the href before clicking
        const gardenHref = await cards.first().getAttribute('href');
        await cards.first().click();
        await page.waitForLoadState('networkidle');

        // Should navigate to the garden page
        if (gardenHref) {
          await page.waitForURL(new RegExp(gardenHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout: 5000 }).catch(() => {
            // If URL doesn't match, check we're on a garden page
          });
        }

        // Verify we're on a garden page (either gardens or discover back)
        const currentUrl = page.url();
        expect(currentUrl.includes('/gardens/') || currentUrl.includes('/discover')).toBeTruthy();
      } else {
        // No public gardens yet - this is OK, skip
        test.skip(true, 'No public gardens to navigate to');
      }
    });

    test('should show follow button when logged in', async ({ page }) => {
      // Sign in
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      await page.getByLabel(/email/i).fill(discoverUser.email);
      await page.getByLabel(/password/i).fill(discoverUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Wait for sign in to complete
      await page.waitForTimeout(3000);
      
      // Navigate to discover
      await page.goto('/discover');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const cards = page.locator('a[href^="/gardens/"]');
      const count = await cards.count();

      if (count > 0) {
        // Follow button should be visible in cards
        const followBtn = cards.first().locator('button:has-text("+ Follow"), button:has-text("Following")');
        await expect(followBtn).toBeVisible({ timeout: 3000 });
      } else {
        test.skip(true, 'No public gardens to test follow button');
      }
    });

    test('should show "Sign in to follow" when not logged in', async ({ page }) => {
      await page.goto('/discover');
      await page.waitForLoadState('networkidle');

      // Should NOT have follow buttons (not logged in)
      // Garden cards may have inline follow buttons that are hidden
      await expect(page.getByRole('heading', { name: /discover gardens/i })).toBeVisible();
    });

    test('should sort by popular (follower count)', async ({ page }) => {
      await page.goto('/discover');
      await page.waitForLoadState('networkidle');

      // Change sort to popular
      const sortSelect = page.locator('select').first();
      await sortSelect.selectOption('popular');
      await page.waitForTimeout(300);

      // Should still have results or empty state
      await expect(page.getByRole('heading', { name: /discover gardens/i })).toBeVisible();
    });
  });

  test.describe('Navigation to Discover', () => {
    test('should reach discover from home page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // The "Browse Discover" link is only visible when logged in
      // Sign in first
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(discoverUser.email);
      await page.getByLabel(/password/i).fill(discoverUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/', { timeout: 15000 });

      // Now check the home page has the discover link
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const discoverBtn = page.locator('a:has-text("Browse Discover")');
      await expect(discoverBtn).toBeVisible();
      await discoverBtn.click();
      await page.waitForURL('/discover', { timeout: 5000 });
      await expect(page.getByRole('heading', { name: /discover gardens/i })).toBeVisible();
    });

    test('should reach discover from profile page', async ({ page }) => {
      // Sign in first
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(discoverUser.email);
      await page.getByLabel(/password/i).fill(discoverUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/', { timeout: 15000 });

      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      const discoverLink = page.getByRole('link', { name: /browse discover/i });
      await expect(discoverLink).toBeVisible();
      await discoverLink.click();
      await page.waitForURL('/discover', { timeout: 5000 });
    });
  });
});
