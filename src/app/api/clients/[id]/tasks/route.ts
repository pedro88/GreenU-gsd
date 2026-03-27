import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { canWriteGarden } from '@/lib/gardenAccess';

/**
 * GET /api/clients/[id]/tasks
 * List all tasks for a client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const tasks = await prisma.task.findMany({
      where: { clientId: id },
      include: {
        garden: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to list tasks:', error);
    return NextResponse.json({ error: 'Failed to list tasks' }, { status: 500 });
  }
}

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  gardenId: z.string().optional(),
  assigneeId: z.string().min(1),
  dueDate: z.string().optional().transform((s) => (s ? new Date(s) : null)),
});

/**
 * POST /api/clients/[id]/tasks
 * Create a task for a client
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, description, gardenId, assigneeId, dueDate } = validation.data;

    // If gardenId provided, verify assignee is a garden collaborator
    if (gardenId) {
      const canWrite = await canWriteGarden(assigneeId, gardenId);
      if (!canWrite) {
        return NextResponse.json(
          { error: 'Assignee is not a collaborator on this garden' },
          { status: 400 }
        );
      }
    }

    const task = await prisma.task.create({
      data: {
        clientId: id,
        gardenId: gardenId || null,
        assigneeId,
        title,
        description: description || null,
        dueDate: dueDate || null,
        status: 'PENDING',
      },
      include: {
        garden: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
