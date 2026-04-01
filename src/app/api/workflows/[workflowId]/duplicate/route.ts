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
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  const pathId = segments.length >= 2 ? segments[segments.length - 2] : undefined;
  const workflowId = paramId ?? pathId;

  if (!workflowId || workflowId === 'duplicate') {
    return null;
  }

  return workflowId;
};

/**
 * POST /api/workflows/[workflowId]/duplicate
 * Duplicate a workflow with nodes and edges
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

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (workflow.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newWorkflowId = crypto.randomUUID();
    const newName = workflow.name
      ? `${workflow.name} Copy`
      : 'Untitled Workflow Copy';

    const nodeIdMap = new Map<string, string>();
    const newNodes = workflow.nodes.map((node) => {
      const newNodeId = crypto.randomUUID();
      nodeIdMap.set(node.id, newNodeId);
      return {
        id: newNodeId,
        workflowId: newWorkflowId,
        type: node.type,
        positionX: node.positionX,
        positionY: node.positionY,
        data: node.data,
      };
    });

    const newEdges = workflow.edges
      .map((edge) => {
        const source = nodeIdMap.get(edge.source);
        const target = nodeIdMap.get(edge.target);
        if (!source || !target) return null;
        return {
          id: crypto.randomUUID(),
          workflowId: newWorkflowId,
          source,
          target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          style: edge.style,
        };
      })
      .filter((edge): edge is NonNullable<typeof edge> => Boolean(edge));

    const created = await prisma.$transaction(async (tx) => {
      const createdWorkflow = await tx.workflow.create({
        data: {
          id: newWorkflowId,
          userId,
          name: newName,
        },
      });

      if (newNodes.length > 0) {
        await tx.node.createMany({ data: newNodes });
      }

      if (newEdges.length > 0) {
        await tx.edge.createMany({ data: newEdges });
      }

      return createdWorkflow;
    });

    return NextResponse.json({
      workflow: {
        id: created.id,
        name: created.name ?? 'Untitled Workflow',
        updatedAt: created.updatedAt.toISOString(),
        nodes: newNodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: {
            x: Number.isFinite(node.positionX) ? node.positionX : 0,
            y: Number.isFinite(node.positionY) ? node.positionY : 0,
          },
        })),
        edges: newEdges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle ?? null,
          targetHandle: edge.targetHandle ?? null,
          style: edge.style,
        })),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/workflows/[workflowId]/duplicate error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to duplicate workflow', details }, { status: 500 });
  }
}
