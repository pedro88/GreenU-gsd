import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * PATCH /api/tasks/[id]
 * Update a task (status, dueDate, title, etc.).
 * Accessible by: task creator (via client owner) or assignee.
 * @param request - The incoming HTTP request with update data
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the task ID
 * @returns The updated task, or an error response
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        client: { select: { userId: true } },
        garden: { select: { userId: true, collaborators: { select: { userId: true } } } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Allow update if: user is client owner OR user is assignee
    const isClientOwner = task.client?.userId === session.user.id;
    const isAssignee = task.assigneeId === session.user.id;

    if (!isClientOwner && !isAssignee) {
      return NextResponse.json({ error: 'Not authorized to update this task' }, { status: 403 });
    }

    // Non-assignees can only change status; assignees can update their own tasks
    const updateSchema = z.object({
      status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
      dueDate: z
        .string()
        .optional()
        .transform((s) => (s ? new Date(s) : null)),
      title: z.string().min(1).max(200).optional(),
      description: z.string().max(2000).optional().or(z.literal('')),
    });

    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    // Non-client-owner: restrict to status-only updates
    if (
      !isClientOwner &&
      (validation.data.title !== undefined || validation.data.description !== undefined)
    ) {
      return NextResponse.json(
        { error: 'Only the task creator can update title and description' },
        { status: 403 }
      );
    }

    const updated = await prisma.task.update({
      where: { id },
      data: validation.data,
      include: {
        garden: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task (client owner or task creator only).
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the task ID
 * @returns A success message, or an error response
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        client: { select: { userId: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const isClientOwner = task.client?.userId === session.user.id;
    if (!isClientOwner) {
      return NextResponse.json(
        { error: 'Only the task creator can delete this task' },
        { status: 403 }
      );
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
