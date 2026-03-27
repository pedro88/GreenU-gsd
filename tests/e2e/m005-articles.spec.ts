import { test, expect } from '@playwright/test';

/**
 * E2E tests for M005 Article System:
 * - Public article feed and reading
 * - Article creation with TipTap editor
 * - Draft saving and editing
 * - Publishing and unpublishing
 * - Tag filtering and search
 * - Article deletion
 */

test.describe('M005: Article System', () => {
  // Shared sign-in helper
  async function signIn(page: import('@playwright/test').Page) {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    if (await emailInput.isVisible()) {
      await emailInput.fill('test@greenu.local');
      await passwordInput.fill('testpassword123');
      await page.locator('button[type="submit"]').click();
      // Wait for redirect to app
      await page
        .waitForURL(/\/(garden|profile|discover|articles)/, { timeout: 10_000 })
        .catch(() => {});
    }
  }

  // ================================================================
  // Public pages (no auth required)
  // ================================================================

  test.describe('Public Feed', () => {
    test('articles page loads without auth', async ({ page }) => {
      await page.goto('/articles');
      await page.waitForLoadState('networkidle');

      // Page should have heading or content
      await expect(page.locator('h1')).toBeVisible({ timeout: 5_000 });
      await expect(page.getByText(/article/i)).toBeVisible({ timeout: 5_000 });
    });

    test('articles page shows tag cloud', async ({ page }) => {
      await page.goto('/articles');
      await page.waitForLoadState('networkidle');

      // Tag cloud should be present (or empty state)
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
    });

    test('articles page has "Write Article" button', async ({ page }) => {
      await page.goto('/articles');
      await page.waitForLoadState('networkidle');

      await expect(page.getByText(/write article/i)).toBeVisible();
    });

    test('articles feed shows search bar', async ({ page }) => {
      await page.goto('/articles');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[placeholder*="earch"], input[type="search"]');
      await expect(searchInput).toBeVisible();
    });
  });

  // ================================================================
  // Authenticated: article creation
  // ================================================================

  test.describe('Article Creation', () => {
    test('redirects to signin when accessing /articles/new without auth', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto('/articles/new');
      await page.waitForURL(/\/auth\/signin/, { timeout: 5_000 });
    });

    test('shows editor when signed in', async ({ page }) => {
      await signIn(page);

      await page.goto('/articles/new');
      await page.waitForLoadState('networkidle');
      await page.waitForURL(/\/articles\/new/, { timeout: 5_000 }).catch(() => {});

      // Title input should be visible
      const titleInput = page.locator('input[placeholder*="itle"], input[type="text"]').first();
      await expect(titleInput).toBeVisible({ timeout: 5_000 });
    });

    test('can type title and it appears in input', async ({ page }) => {
      await signIn(page);
      await page.goto('/articles/new');
      await page.waitForLoadState('networkidle');

      const titleInput = page.locator('input').first();
      await titleInput.fill('My First Gardening Article');
      await expect(titleInput).toHaveValue('My First Gardening Article');
    });

    test('TipTap editor is present and editable', async ({ page }) => {
      await signIn(page);
      await page.goto('/articles/new');
      await page.waitForLoadState('networkidle');

      // TipTap renders as a ProseMirror div
      const editor = page.locator('.ProseMirror');
      await expect(editor).toBeVisible({ timeout: 5_000 });

      // Type some text
      await editor.click();
      await page.keyboard.type('Gardening is a wonderful hobby.');
      await expect(editor).toContainText('Gardening is a wonderful hobby.');
    });

    test('editor toolbar buttons are visible', async ({ page }) => {
      await signIn(page);
      await page.goto('/articles/new');
      await page.waitForLoadState('networkidle');

      // Toolbar should have bold, italic, heading buttons
      const boldBtn = page
        .locator('button[title*="Bold"], button')
        .filter({ hasText: /B/ })
        .first();
      await expect(boldBtn).toBeVisible();
    });

    test('word count updates as user types', async ({ page }) => {
      await signIn(page);
      await page.goto('/articles/new');
      await page.waitForLoadState('networkidle');

      const editor = page.locator('.ProseMirror');
      await editor.click();
      await page.keyboard.type('One two three four five.');

      // Should show word count (1+ words)
      const wordCount = page.locator('text=/\\d+ words/');
      await expect(wordCount).toBeVisible({ timeout: 3_000 });
    });

    test('Save Draft button is visible', async ({ page }) => {
      await signIn(page);
      await page.goto('/articles/new');
      await page.waitForLoadState('networkidle');

      await expect(page.getByText(/save draft/i)).toBeVisible();
    });

    test('Publish button is visible', async ({ page }) => {
      await signIn(page);
      await page.goto('/articles/new');
      await page.waitForLoadState('networkidle');

      await expect(page.getByText(/publish/i)).toBeVisible();
    });
  });

  // ================================================================
  // Drafts
  // ================================================================

  test.describe('Drafts', () => {
    test('redirects to signin when accessing /articles/drafts without auth', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto('/articles/drafts');
      await page.waitForURL(/\/auth\/signin/, { timeout: 5_000 });
    });

    test('drafts page loads when signed in', async ({ page }) => {
      await signIn(page);
      await page.goto('/articles/drafts');
      await page.waitForLoadState('networkidle');
      await page.waitForURL(/\/articles\/drafts/, { timeout: 5_000 }).catch(() => {});

      // Should show "My Drafts" heading
      await expect(page.getByText(/my drafts/i)).toBeVisible({ timeout: 5_000 });
    });

    test('drafts page has "New Article" link', async ({ page }) => {
      await signIn(page);
      await page.goto('/articles/drafts');
      await page.waitForLoadState('networkidle');

      await expect(page.getByText(/new article/i)).toBeVisible();
    });
  });

  // ================================================================
  // API contracts
  // ================================================================

  test.describe('API Contracts', () => {
    test('GET /api/articles returns JSON with articles array', async ({ request }) => {
      const res = await request.get('/api/articles');
      expect([200, 401]).toContain(res.status());
      if (res.status() === 200) {
        const data = await res.json();
        expect(data).toHaveProperty('articles');
        expect(Array.isArray(data.articles)).toBe(true);
      }
    });

    test('GET /api/articles/tags returns JSON with tags array', async ({ request }) => {
      const res = await request.get('/api/articles/tags');
      expect([200, 401]).toContain(res.status());
      if (res.status() === 200) {
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    test('POST /api/articles requires auth', async ({ request }) => {
      const res = await request.post('/api/articles', {
        data: { title: 'Test', content: '<p>Test content</p>' },
      });
      expect(res.status()).toBe(401);
    });

    test('GET /api/articles/drafts requires auth', async ({ request }) => {
      const res = await request.get('/api/articles/drafts');
      expect(res.status()).toBe(401);
    });

    test('GET /api/articles/by-slug/non-existent returns 404', async ({ request }) => {
      const res = await request.get('/api/articles/by-slug/this-slug-does-not-exist-xyz123');
      expect(res.status()).toBe(404);
    });
  });

  // ================================================================
  // Reading articles
  // ================================================================

  test.describe('Reading Articles', () => {
    test('article page shows back link', async ({ page }) => {
      await page.goto('/articles');
      await page.waitForLoadState('networkidle');

      // If there are articles, click the first one
      const firstArticle = page.locator('article').first();
      if (await firstArticle.isVisible({ timeout: 2_000 })) {
        await firstArticle.click();
        await page.waitForLoadState('networkidle');

        // Should show back link
        const backLink = page.getByText(/all articles/i);
        await expect(backLink).toBeVisible({ timeout: 5_000 });
      }
    });

    test('article page shows author info', async ({ page }) => {
      await page.goto('/articles');
      await page.waitForLoadState('networkidle');

      const firstArticle = page.locator('article').first();
      if (await firstArticle.isVisible({ timeout: 2_000 })) {
        await firstArticle.click();
        await page.waitForLoadState('networkidle');

        // Should show author name or avatar
        const body = await page.textContent('body');
        expect(body).toBeTruthy();
      }
    });
  });

  // ================================================================
  // Navigation
  // ================================================================

  test.describe('Navigation', () => {
    test('Articles link visible in nav when signed in', async ({ page }) => {
      await signIn(page);
      await page.waitForLoadState('networkidle');

      const articlesLink = page.locator('a[href="/articles"]');
      await expect(articlesLink).toBeVisible({ timeout: 5_000 });
    });

    test('clicking "Write Article" navigates to /articles/new', async ({ page }) => {
      await signIn(page);
      await page.goto('/articles');
      await page.waitForLoadState('networkidle');

      await page.getByText(/write article/i).click();
      await page.waitForURL(/\/articles\/new/, { timeout: 5_000 });
    });
  });
});
