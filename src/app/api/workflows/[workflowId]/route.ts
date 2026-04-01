import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const resolveWorkflowId = async (
  params: { workflowId?: string } | Promise<{ workflowId?: string }> | undefined,
  request: NextRequest
) => {
  const resolvedParams = await params;
  const paramId = resolvedParams?.workflowId;
  const pathId = request.nextUrl.pathname.split('/').filter(Boolean).pop();
  const workflowId = paramId ?? pathId;

  if (!workflowId || workflowId === 'undefined') {
    return null;
  }

  return workflowId;
};

/**
 * GET /api/workflows/[workflowId]
 * Fetch workflow with all nodes and edges
 */
export async function GET(
  request: NextRequest,
  { params }: { params?: { workflowId?: string } }
) {
  try {
    const workflowId = await resolveWorkflowId(params, request);

    if (!workflowId) {
      return NextResponse.json({ error: 'Missing workflowId' }, { status: 400 });
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Verify ownership
    if (workflow.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Convert nodes and edges to React Flow format
    const nodes = workflow.nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: { x: node.positionX, y: node.positionY },
      data: node.data,
    }));

    const edges = workflow.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      style: edge.style,
    }));

    return NextResponse.json({ nodes, edges, workflowId: workflow.id, name: workflow.name });
  } catch (error) {
    console.error('GET /api/workflows/[workflowId] error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch workflow', details }, { status: 500 });
  }
}

/**
 * POST /api/workflows/[workflowId]
 * Save nodes and edges for a workflow (replaces existing ones)
 */
export async function POST(
  request: NextRequest,
  { params }: { params?: { workflowId?: string } }
) {
  try {
    const workflowId = await resolveWorkflowId(params, request);

    if (!workflowId) {
      return NextResponse.json({ error: 'Missing workflowId' }, { status: 400 });
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nodes, edges } = body;

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Verify workflow exists and belongs to user
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (workflow.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.node.deleteMany({ where: { workflowId } });
    await prisma.edge.deleteMany({ where: { workflowId } });

    if (nodes.length > 0) {
      await prisma.node.createMany({
        data: nodes.map(node => ({
          id: node.id,
          workflowId,
          type: node.type,
          positionX: node.position.x,
          positionY: node.position.y,
          data: node.data,
        })),
      });
    }

    if (edges.length > 0) {
      await prisma.edge.createMany({
        data: edges.map(edge => ({
          id: edge.id,
          workflowId,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null,
          style: edge.style || null,
        })),
      });
    }

    await prisma.workflow.update({
      where: { id: workflowId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/workflows/[workflowId] error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to save workflow', details }, { status: 500 });
  }
}

/**
 * PATCH /api/workflows/[workflowId]
 * Update workflow name
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params?: { workflowId?: string } }
) {
  try {
    const workflowId = await resolveWorkflowId(params, request);

    if (!workflowId) {
      return NextResponse.json({ error: 'Missing workflowId' }, { status: 400 });
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (workflow.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.workflow.update({
      where: { id: workflowId },
      data: { name },
    });

    return NextResponse.json({ success: true, name: updated.name });
  } catch (error) {
    console.error('PATCH /api/workflows/[workflowId] error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update workflow', details }, { status: 500 });
  }
}

/**
 * DELETE /api/workflows/[workflowId]
 * Delete a workflow and its nodes/edges
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params?: { workflowId?: string } }
) {
  try {
    const workflowId = await resolveWorkflowId(params, request);

    if (!workflowId) {
      return NextResponse.json({ error: 'Missing workflowId' }, { status: 400 });
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { userId: true },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (workflow.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.workflow.delete({ where: { id: workflowId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/workflows/[workflowId] error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete workflow', details }, { status: 500 });
  }
}
