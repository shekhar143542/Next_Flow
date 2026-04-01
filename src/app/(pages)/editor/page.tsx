import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import type { WorkflowCardData } from '@/components/WorkflowCard';
import NodeEditor from './NodeEditor';

export const dynamic = 'force-dynamic';

type EdgeStyle = {
  stroke?: string;
  strokeWidth?: number;
};

const VALID_TABS = new Set(['projects', 'apps', 'examples', 'templates']);

const resolveTab = (tab?: string) => (
  tab && VALID_TABS.has(tab) ? tab : 'projects'
);

const normalizeEdgeStyle = (value: unknown): EdgeStyle | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const stroke = typeof record.stroke === 'string' ? record.stroke : undefined;
  const strokeWidth = typeof record.strokeWidth === 'number' ? record.strokeWidth : undefined;
  if (typeof stroke === 'undefined' && typeof strokeWidth === 'undefined') return null;
  return { stroke, strokeWidth };
};

export default async function EditorPage({
  searchParams,
}: {
  searchParams?: { tab?: string } | Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialTab = resolveTab(resolvedParams?.tab);
  const { userId } = await auth();

  if (!userId) {
    return <NodeEditor initialWorkflows={[]} initialTab={initialTab} />;
  }

  let mapped: WorkflowCardData[] = [];

  try {
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

    mapped = workflows.map((workflow) => ({
      id: workflow.id,
      name: workflow.name ?? 'Untitled Workflow',
      updatedAt: workflow.updatedAt.toISOString(),
      nodes: (workflow.nodes ?? []).map((node) => ({
        id: node.id,
        type: node.type,
        position: {
          x: Number.isFinite(node.positionX) ? node.positionX : 0,
          y: Number.isFinite(node.positionY) ? node.positionY : 0,
        },
      })),
      edges: (workflow.edges ?? []).map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
        style: normalizeEdgeStyle(edge.style),
      })),
    }));
  } catch (error) {
    console.error('Failed to load workflows:', error);
  }

  return <NodeEditor initialWorkflows={mapped} initialTab={initialTab} />;
}
