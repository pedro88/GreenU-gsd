import { test, expect } from './test-types';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies();
  });

  test.describe('Sign Up Flow', () => {
    test('should show signup page', async ({ page }) => {
      await page.goto('/auth/signup');
      await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    });

    test('should validate signup form', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Wait for form to be ready
      await page.waitForLoadState('networkidle');
      
      // Submit without filling form
      await page.getByRole('button', { name: /create account/i }).click();
      
      // Should show validation errors - HTML5 validation prevents submission
      // At least email and password fields should be invalid
      await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    });

    test('should show error for existing email', async ({ page, testUser }) => {
      await page.goto('/auth/signup');
      
      await page.getByLabel(/name/i).fill('Another User');
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/^password$/i).fill('NewPassword123!');
      await page.getByLabel(/confirm password/i).fill('NewPassword123!');
      
      await page.getByRole('button', { name: /create account/i }).click();
      
      await expect(page.getByText(/account.*already.*exists/i)).toBeVisible();
    });

    test('should signup with valid credentials', async ({ page }) => {
      const uniqueEmail = `newuser${Date.now()}@example.com`;
      
      await page.goto('/auth/signup');
      
      await page.getByLabel(/name/i).fill('New Test User');
      await page.getByLabel(/email/i).fill(uniqueEmail);
      await page.getByLabel(/^password$/i).fill('SecurePass123!');
      await page.getByLabel(/confirm password/i).fill('SecurePass123!');
      
      await page.getByRole('button', { name: /create account/i }).click();
      
      // Should redirect to signin page with success message
      await expect(page).toHaveURL(/\/auth\/signin/);
    });
  });

  test.describe('Sign In Flow', () => {
    test('should show signin page', async ({ page }) => {
      await page.goto('/auth/signin');
      await expect(page.getByRole('heading', { name: /sign in to greenu/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });

    test('should redirect to signin when accessing protected route', async ({ page }) => {
      await page.goto('/profile');
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('should sign in with valid credentials', async ({ page, testUser }) => {
      await page.goto('/auth/signin');
      
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).fill(testUser.password);
      
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Should redirect to home page
      await page.waitForURL('/', { timeout: 15000 });
      
      // Should show welcome message with user name
      await expect(page.getByText(new RegExp(`Welcome,.*${testUser.name}`))).toBeVisible({ timeout: 10000 });
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/auth/signin');
      
      await page.getByLabel(/email/i).fill('wrong@example.com');
      await page.getByLabel(/password/i).fill('WrongPassword123!');
      
      await page.getByRole('button', { name: /sign in/i }).click();
      
      await expect(page.getByText(/invalid.*email.*password/i)).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should access profile when authenticated', async ({ page, testUser }) => {
      // Sign in first
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).fill(testUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/');
      
      // Navigate to profile
      await page.goto('/profile');
      await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
    });

    test('should redirect to signin when accessing protected route unauthenticated', async ({ page }) => {
      await page.goto('/profile');
      await expect(page).toHaveURL(/\/auth\/signin/);
    });
  });

  test.describe('Log Out Flow', () => {
    test('should logout and redirect to signin', async ({ page, testUser }) => {
      // Sign in first
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).fill(testUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/');
      
      // Should see welcome message with user name
      await expect(page.getByText(new RegExp(`Welcome,.*${testUser.name}`))).toBeVisible();
      
      // Navigate to profile
      await page.goto('/profile');
      await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
      
      // Find and click sign out button in profile page
      const signOutButton = page.getByRole('button', { name: /sign out/i });
      if (await signOutButton.isVisible()) {
        await signOutButton.click();
      }
      
      // Wait for redirect to signin
      await page.waitForURL(/\/auth\/signin/, { timeout: 10000 });
    });
  });

  test.describe('Profile Update', () => {
    test('should update location fields', async ({ page, testUser }) => {
      // Sign in first
      await page.goto('/auth/signin');
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).fill(testUser.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/');
      
      // Navigate to profile
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      // Wait for form to load
      await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
      
      // Fill latitude and longitude fields
      const latitudeInput = page.locator('input[name="latitude"]');
      const longitudeInput = page.locator('input[name="longitude"]');
      
      await expect(latitudeInput).toBeVisible();
      await expect(longitudeInput).toBeVisible();
      
      // Clear and fill with new values
      await latitudeInput.clear();
      await latitudeInput.fill('45.5017');
      await latitudeInput.blur();
      
      await longitudeInput.clear();
      await longitudeInput.fill('-73.5673');
      await longitudeInput.blur();
      
      // Wait for form state to update
      await page.waitForTimeout(500);
      
      // Save button should be enabled
      const saveButton = page.getByRole('button', { name: /save location/i });
      await expect(saveButton).toBeEnabled({ timeout: 5000 });
      
      // Save
      await saveButton.click();
      
      // Should show success message
      await expect(page.getByText(/location updated/i)).toBeVisible({ timeout: 10000 });
    });
  });
});
