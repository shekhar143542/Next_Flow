"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getBezierPath, Position } from 'reactflow';
import { Copy, ExternalLink, Pencil, Trash2, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type PreviewNodeInput = {
  id: string;
  type?: string;
  position: {
    x: number;
    y: number;
  };
};

type PreviewEdgeInput = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  style?: {
    stroke?: string;
    strokeWidth?: number;
  } | null;
};

export type WorkflowCardData = {
  id: string;
  name?: string | null;
  updatedAt: string;
  nodes: PreviewNodeInput[];
  edges: PreviewEdgeInput[];
};

type WorkflowCardProps = {
  workflow: WorkflowCardData;
  onRename?: (workflowId: string, name: string) => Promise<void> | void;
  onDuplicate?: (workflowId: string) => Promise<void> | void;
  onDelete?: (workflowId: string) => Promise<void> | void;
};

type PreviewNode = {
  id: string;
  type?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  accent: string;
  headerHeight: number;
  bodyLines: number;
};

type PreviewEdge = {
  id: string;
  path: string;
  color?: string;
  strokeWidth?: number;
};

const PREVIEW_SCALE = 0.2;
const PREVIEW_PADDING = 12;
const HANDLE_SIZE = 12;
const HANDLE_RADIUS = HANDLE_SIZE / 2;
const DEFAULT_HANDLE_ID = 'default';

const DEFAULT_NODE_STYLE = {
  width: 190,
  height: 150,
  accent: '#5b5b5b',
  headerHeight: 18,
  bodyLines: 2,
};

const NODE_STYLE_MAP: Record<string, typeof DEFAULT_NODE_STYLE> = {
  text: { width: 190, height: 150, accent: '#f0a500', headerHeight: 18, bodyLines: 2 },
  image: { width: 190, height: 120, accent: '#2f92ff', headerHeight: 18, bodyLines: 1 },
  video: { width: 200, height: 120, accent: '#1eea6a', headerHeight: 18, bodyLines: 1 },
  frame: { width: 250, height: 280, accent: '#2f92ff', headerHeight: 20, bodyLines: 3 },
  llm: { width: 250, height: 260, accent: '#f3a855', headerHeight: 20, bodyLines: 3 },
  crop: { width: 250, height: 280, accent: '#58d0ff', headerHeight: 20, bodyLines: 2 },
};

const HANDLE_OFFSETS: Record<
  string,
  { source?: Record<string, number>; target?: Record<string, number> }
> = {
  frame: {
    target: { video: 92 },
    source: { image: 92 },
  },
  llm: {
    target: { text: 78, image: 140 },
    source: { [DEFAULT_HANDLE_ID]: 110 },
  },
  crop: {
    target: { image: 88 },
    source: { [DEFAULT_HANDLE_ID]: 88 },
  },
};

const getNodeStyle = (type?: string) => {
  if (!type) return DEFAULT_NODE_STYLE;
  return NODE_STYLE_MAP[type] ?? DEFAULT_NODE_STYLE;
};

const formatRelativeTime = (updatedAt: string) => {
  const updated = new Date(updatedAt);
  const diffMs = Date.now() - updated.getTime();
  const diffSeconds = Math.max(1, Math.floor(diffMs / 1000));

  if (diffSeconds < 45) return 'Edited just now';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Edited ${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Edited ${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Edited ${diffDays}d ago`;

  return `Edited ${updated.toLocaleDateString()}`;
};

const getHandleTop = (
  nodeType: string | undefined,
  handleType: 'source' | 'target',
  handleId?: string | null
) => {
  const offsets = HANDLE_OFFSETS[nodeType ?? '']?.[handleType];
  if (!offsets) return null;
  if (handleId && typeof offsets[handleId] === 'number') return offsets[handleId];
  if (typeof offsets[DEFAULT_HANDLE_ID] === 'number') return offsets[DEFAULT_HANDLE_ID];
  return null;
};

const getHandleAnchor = (
  node: PreviewNode,
  handleType: 'source' | 'target',
  handleId?: string | null
) => {
  const x = handleType === 'source' ? node.x + node.width : node.x;
  const top = getHandleTop(node.type, handleType, handleId);
  if (typeof top === 'number') {
    return {
      x,
      y: node.y + (top + HANDLE_RADIUS) * PREVIEW_SCALE,
    };
  }

  return {
    x,
    y: node.y + node.height / 2,
  };
};

const buildPreview = (nodes: PreviewNodeInput[], edges: PreviewEdgeInput[]) => {
  if (nodes.length === 0) {
    return { nodes: [] as PreviewNode[], edges: [] as PreviewEdge[] };
  }

  const positions = nodes.map((node) => ({
    x: Number.isFinite(node.position.x) ? node.position.x : 0,
    y: Number.isFinite(node.position.y) ? node.position.y : 0,
  }));

  const minX = Math.min(...positions.map((pos) => pos.x));
  const minY = Math.min(...positions.map((pos) => pos.y));

  const offsetX = PREVIEW_PADDING - minX * PREVIEW_SCALE;
  const offsetY = PREVIEW_PADDING - minY * PREVIEW_SCALE;

  const previewNodes = nodes.map((node) => {
    const style = getNodeStyle(node.type);
    return {
      id: node.id,
      type: node.type,
      x: node.position.x * PREVIEW_SCALE + offsetX,
      y: node.position.y * PREVIEW_SCALE + offsetY,
      width: style.width * PREVIEW_SCALE,
      height: style.height * PREVIEW_SCALE,
      accent: style.accent,
      headerHeight: style.headerHeight * PREVIEW_SCALE,
      bodyLines: style.bodyLines,
    };
  });

  const nodeMap = new Map(previewNodes.map((node) => [node.id, node]));

  const previewEdges = edges
    .map((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) return null;
      const sourceAnchor = getHandleAnchor(source, 'source', edge.sourceHandle);
      const targetAnchor = getHandleAnchor(target, 'target', edge.targetHandle);
      const [path] = getBezierPath({
        sourceX: sourceAnchor.x,
        sourceY: sourceAnchor.y,
        targetX: targetAnchor.x,
        targetY: targetAnchor.y,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
      const color = typeof edge.style?.stroke === 'string'
        ? edge.style.stroke
        : source.accent;
      const strokeWidth = typeof edge.style?.strokeWidth === 'number'
        ? edge.style.strokeWidth
        : 1.5;
      return {
        id: edge.id,
        path,
        color,
        strokeWidth,
      } as PreviewEdge;
    })
    .filter((edge): edge is PreviewEdge => Boolean(edge));

  return { nodes: previewNodes, edges: previewEdges };
};

export function WorkflowCard({
  workflow,
  onRename,
  onDuplicate,
  onDelete,
}: WorkflowCardProps) {
  const router = useRouter();
  const preview = useMemo(
    () => buildPreview(workflow.nodes, workflow.edges),
    [workflow.nodes, workflow.edges]
  );
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const markEditorStale = () => {
    try {
      sessionStorage.setItem('editorNeedsRefresh', '1');
    } catch {
    }
  };

  const handleOpen = (options?: { fromMenu?: boolean }) => {
    if (!options?.fromMenu && (menuOpen || deleteOpen || renameOpen)) {
      return;
    }
    setMenuOpen(false);
    markEditorStale();
    router.push(`/workflow/${workflow.id}`);
  };

  const handleMenuToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleRename = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuOpen(false);
    setRenameValue(workflowName);
    setIsRenaming(false);
    setRenameOpen(true);
  };

  const handleDuplicate = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuOpen(false);
    await onDuplicate?.(workflow.id);
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuOpen(false);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    setDeleteOpen(false);
    await onDelete?.(workflow.id);
  };

  const handleConfirmRename = async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    if (trimmed === workflowName) return;
    setIsRenaming(true);
    try {
      await onRename?.(workflow.id, trimmed);
      setRenameOpen(false);
    } finally {
      setIsRenaming(false);
    }
  };

  const workflowName = workflow.name?.trim() || 'Untitled Workflow';
  const updatedLabel = formatRelativeTime(workflow.updatedAt);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div
      className="group cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => handleOpen()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
      aria-label={`Open workflow ${workflowName}`}
    >
      <div className="relative w-full h-44 max-w-xs">
        <div ref={menuRef} className="absolute right-3 top-3 z-20">
          <button
            type="button"
            className={`h-7 w-7 text-white/70 transition-opacity duration-200 ${
              menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
            } cursor-pointer`}
            onClick={handleMenuToggle}
            aria-label="Workflow options"
            aria-expanded={menuOpen}
          >
            <span className="block text-lg leading-none">⋮</span>
          </button>
          <div
            className={`absolute right-0 mt-2 w-40 origin-top-right rounded-xl border border-[#1f1f1f] bg-[#0e0e0e] py-1 shadow-2xl transition-all duration-150 ${
              menuOpen
                ? 'pointer-events-auto scale-100 translate-y-0 opacity-100'
                : 'pointer-events-none scale-95 -translate-y-1 opacity-0'
            }`}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white/90 hover:bg-white/5"
              onClick={(event) => {
                event.stopPropagation();
                handleOpen({ fromMenu: true });
              }}
            >
              <ExternalLink size={14} className="text-white/80" />
              Open
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white/90 hover:bg-white/5"
              onClick={handleRename}
            >
              <Pencil size={14} className="text-white/80" />
              Rename
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white/90 hover:bg-white/5"
              onClick={handleDuplicate}
            >
              <Copy size={14} className="text-white/80" />
              Duplicate
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
              onClick={handleDelete}
            >
              <Trash2 size={14} className="text-red-400" />
              Delete
            </button>
          </div>
        </div>
        <div className="relative h-44 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden transition-all duration-200">
          <div className="absolute inset-0 bg-linear-to-br from-[#2a2a2a] to-[#1a1a1a]" />
          <div className="absolute inset-0 pointer-events-none">
            <svg className="absolute inset-0" width="100%" height="100%">
              {preview.edges.map((edge) => (
                <path
                  key={edge.id}
                  d={edge.path}
                  fill="none"
                  stroke={edge.color ?? 'rgba(255,255,255,0.25)'}
                  strokeWidth={edge.strokeWidth ?? 1.5}
                />
              ))}
            </svg>
            {preview.nodes.map((node) => (
              <div
                key={node.id}
                className="absolute rounded-md bg-[#1b1b1b]"
                style={{
                  width: node.width,
                  height: node.height,
                  transform: `translate(${node.x}px, ${node.y}px)`,
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  height: node.headerHeight,
                  background: 'rgba(255,255,255,0.06)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }} />
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  padding: 4,
                }}>
                  {Array.from({ length: node.bodyLines }).map((_, index) => (
                    <div
                      key={`${node.id}-line-${index}`}
                      style={{
                        height: 3,
                        width: `${70 - index * 10}%`,
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.14)',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white truncate">{workflowName}</h3>
      <p className="text-xs text-gray-400">{updatedLabel}</p>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent
          overlayClassName="bg-black/60 backdrop-blur-sm"
          className="w-full max-w-md rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 text-white shadow-2xl"
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10"
            onClick={() => setDeleteOpen(false)}
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <AlertDialogHeader className="gap-2 text-left">
            <AlertDialogTitle className="text-lg font-semibold">Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-white/60">
              Are you sure you want to delete "{workflowName}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel className="rounded-full border border-white/10 !bg-white px-6 py-2 text-sm font-semibold !text-black hover:!bg-white/90">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-500"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={renameOpen}
        onOpenChange={(open) => {
          if (!open && isRenaming) return;
          setRenameOpen(open);
        }}
      >
        <AlertDialogContent
          overlayClassName="bg-black/60 backdrop-blur-sm"
          className="w-full max-w-md rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 text-white shadow-2xl"
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10"
            onClick={() => setRenameOpen(false)}
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <AlertDialogHeader className="gap-2 text-left">
            <AlertDialogTitle className="text-lg font-semibold">Rename Workflow</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-white/60">
              Enter a new name for your workflow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <input
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleConfirmRename();
                }
              }}
              autoFocus
              disabled={isRenaming}
              className="w-full rounded-xl border border-[#2b2b2b] bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none ring-0 focus:border-[#2f7cf5]"
            />
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel
              className="rounded-full border border-white/10 !bg-white px-6 py-2 text-sm font-semibold !text-black hover:!bg-white/90"
              disabled={isRenaming}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full !bg-[#2563eb] px-6 py-2 text-sm font-semibold text-white hover:!bg-[#1d4ed8] disabled:opacity-70"
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmRename();
              }}
              disabled={isRenaming}
            >
              {isRenaming ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                  Renaming
                </span>
              ) : (
                'Rename'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
