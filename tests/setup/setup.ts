import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

async function globalSetup() {
  const prisma = new PrismaClient();

  try {
    // Create test user if it doesn't exist
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);

    await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: { password: hashedPassword },
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
      },
    });

    console.log('Test user created/updated successfully');
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
