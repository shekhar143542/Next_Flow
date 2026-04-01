import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * POST /api/workflows
 * Create a new empty workflow
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { id?: string } = {};
    try {
      body = (await request.json()) as { id?: string };
    } catch {
      body = {};
    }

    const workflow = await prisma.workflow.create({
      data: {
        id: body.id ?? undefined,
        userId,
        name: 'Untitled Workflow',
      },
    });

    return NextResponse.json({ workflowId: workflow.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/workflows error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create workflow', details }, { status: 500 });
  }
}

/**
 * GET /api/workflows
 * Get all workflows for authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        nodes: {
          select: {
            id: true,
            type: true,
            positionX: true,
            positionY: true,
          },
        },
        edges: {
          select: {
            id: true,
            source: true,
            target: true,
            sourceHandle: true,
            targetHandle: true,
            style: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error('GET /api/workflows error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch workflows', details }, { status: 500 });
  }
}
