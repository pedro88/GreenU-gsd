import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/user/language
 * Sets the preferred language for the authenticated user.
 * Validates the language is one of the supported options (en, fr, es).
 * @param request - The incoming Next.js request object containing the language preference
 * @returns JSON response with success status and the updated language, or an error response
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { language } = await request.json();

    if (!['en', 'fr', 'es'].includes(language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { language },
    });

    return NextResponse.json({ success: true, language });
  } catch (error) {
    console.error('Failed to update language:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
