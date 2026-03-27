import { test as base } from '@playwright/test';

export type TestUser = {
  email: string;
  password: string;
  name: string;
};

export const test = base.extend<{ testUser: TestUser }>({
  testUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
  },
});

export { expect } from '@playwright/test';
