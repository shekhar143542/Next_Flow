'use client';

import {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  addEdge as addReactFlowEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type Viewport,
  useReactFlow,
} from 'reactflow';
import { WorkflowMode, useWorkflowStore } from '@/store/useWorkflowStore';
import { NODE_HEIGHT, NODE_WIDTH } from './constants';
import { edgeTypes, getNodeWireColor } from './components/edges';
import { nodeTypes } from './components/nodes';
import { StarField } from './components/StarField';
import { TopBtn, ToolBtn } from './components/buttons';
import {
  ChevronDown,
  ChevronDownSm,
  CmdKey,
  ConnectIcon,
  CursorIcon,
  Diamond,
  ExportIcon,
  GridIcon,
  HandIcon,
  Logo,
  Moon,
  PlusIcon,
  Redo,
  ScissorsIcon,
  Undo,
  Wrench,
} from './components/icons';
import { updateWorkflowName } from '@/lib/workflowApi';

/* ─────────────────────────── Workflow logic ─────────────────────────── */

type ToolId = 'plus' | 'cursor' | 'hand' | 'scissors' | 'connect';

type ToolTooltip = {
  title: string;
  hint?: string;
};

type NodeTemplate = {
  type: string;
  label: string;
  Icon: FC;
};

type Point = {
  x: number;
  y: number;
};

const CUT_HANDLE_RADIUS = 6;
const CUT_HANDLE_OFFSETS: Record<
  string,
  { source?: Record<string, number>; target?: Record<string, number> }
> = {
  frame: {
    target: { video: 92 },
    source: { image: 92 },
  },
  llm: {
    target: { text: 264, image: 394, system: 570 },
  },
  crop: {
    target: { image: 88 },
    source: { default: 88 },
  },
};

const MenuTextIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 3h10M8 3v10M5.5 13h5" stroke="rgba(255,255,255,0.88)" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const MenuImageIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="10" rx="2" stroke="rgba(255,255,255,0.88)" strokeWidth="1.4" />
    <path d="M4 11l3-3 3 3 2-2 2 3" stroke="rgba(255,255,255,0.88)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="5" cy="6" r="1" fill="rgba(255,255,255,0.88)" />
  </svg>
);

const MenuVideoIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="4" width="9" height="8" rx="2" stroke="rgba(255,255,255,0.88)" strokeWidth="1.4" />
    <path d="M11 6l3-2v8l-3-2" stroke="rgba(255,255,255,0.88)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MenuFrameIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="10" rx="2" stroke="rgba(255,255,255,0.88)" strokeWidth="1.4" />
    <rect x="5.5" y="6" width="5" height="4" rx="1" fill="rgba(255,255,255,0.88)" />
  </svg>
);

const MenuLlmIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2.5l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2L8 2.5z" fill="rgba(255,255,255,0.88)" />
  </svg>
);

const MenuCropIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M5 2v8a2 2 0 002 2h7" stroke="rgba(255,255,255,0.88)" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M2 5h8a2 2 0 012 2v7" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const tools: { id: ToolId; Icon: FC; tooltip?: ToolTooltip }[] = [
  { id: 'plus', Icon: PlusIcon, tooltip: { title: 'Add node' } },
  { id: 'cursor', Icon: CursorIcon, tooltip: { title: 'Draw Selection', hint: 'Ctrl Drag' } },
  { id: 'hand', Icon: HandIcon, tooltip: { title: 'Pan canvas', hint: 'Drag' } },
  { id: 'scissors', Icon: ScissorsIcon, tooltip: { title: 'Cut', hint: 'Click' } },
  { id: 'connect', Icon: ConnectIcon, tooltip: { title: 'Connect', hint: 'Drag' } },
];

const toolToMode: Record<ToolId, WorkflowMode> = {
  plus: 'add',
  cursor: 'select',
  hand: 'pan',
  scissors: 'cut',
  connect: 'connect',
};

const nodeTemplates: NodeTemplate[] = [
  { type: 'video', label: 'Video', Icon: MenuVideoIcon },
  { type: 'image', label: 'Image', Icon: MenuImageIcon },
  { type: 'text', label: 'Text', Icon: MenuTextIcon },
  { type: 'frame', label: 'Frame Extractor', Icon: MenuFrameIcon },
  { type: 'llm', label: 'LLM', Icon: MenuLlmIcon },
  { type: 'crop', label: 'Crop', Icon: MenuCropIcon },
];

const defaultEdgeOptions = {
  type: 'removable',
  style: { stroke: 'rgba(255,255,255,0.55)', strokeWidth: 1.5 },
};

const getOutputTypeForNode = (nodeType?: string) => {
  switch (nodeType) {
    case 'text':
    case 'llm':
      return 'text';
    case 'image':
    case 'crop':
    case 'frame':
      return 'image';
    default:
      return nodeType;
  }
};

const getInputTypesForNode = (nodeType?: string) => {
  switch (nodeType) {
    case 'llm':
      return ['text', 'image'];
    case 'text':
      return ['text'];
    case 'image':
    case 'crop':
      return ['image'];
    case 'frame':
      return ['video'];
    default:
      return nodeType ? [nodeType] : [];
  }
};

function WorkflowCanvasInner() {
  const {
    nodes,
    edges,
    past,
    future,
    mode,
    popupOpen,
    setMode,
    setPopupOpen,
    addNode,
    setNodes,
    setEdges,
    undo,
    redo,
    workflowId,
    workflowName,
    setWorkflowName,
  } = useWorkflowStore();

  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [hoveredTool, setHoveredTool] = useState<ToolId | null>(null);
  const [hoveredAction, setHoveredAction] = useState<'undo' | 'redo' | null>(null);
  const undoButtonRef = useRef<HTMLButtonElement | null>(null);
  const redoButtonRef = useRef<HTMLButtonElement | null>(null);
  const isDraggingRef = useRef(false);
  const [connectionColor, setConnectionColor] = useState('rgba(255,255,255,0.55)');
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('Untitled');
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const memoNodeTypes = useMemo(() => nodeTypes, []);
  const memoEdgeTypes = useMemo(() => edgeTypes, []);
  const [isCutting, setIsCutting] = useState(false);
  const [cutPathScreen, setCutPathScreen] = useState<Point[]>([]);
  const [cutCursor, setCutCursor] = useState<Point | null>(null);
  const [cutAngle, setCutAngle] = useState(0);
  const cutPointsRef = useRef<{ screen: Point[]; flow: Point[] }>({ screen: [], flow: [] });
  const [cutPreviewIds, setCutPreviewIds] = useState<Set<string>>(new Set());
  const cutPreviewRef = useRef<Set<string>>(new Set());

  const flowWrapperRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition, getNode } = useReactFlow();

  useEffect(() => {
    setMode('select');
  }, [setMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModKey = event.ctrlKey || event.metaKey;
      if (!isModKey) return;

      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
      }

      if (event.key.toLowerCase() !== 'z') return;

      event.preventDefault();
      if (event.shiftKey) {
        if (future.length > 0) redo();
      } else {
        if (past.length > 0) undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [future.length, past.length, redo, undo]);

  useEffect(() => {
    const nextName = workflowName?.trim() || 'Untitled';
    setDraftName(nextName);
  }, [workflowName]);

  const activeTool = useMemo<ToolId>(() => {
    if (mode === 'add') return 'plus';
    if (mode === 'pan') return 'hand';
    if (mode === 'cut') return 'scissors';
    if (mode === 'connect') return 'connect';
    return 'cursor';
  }, [mode]);

  const closePopupAndReturnToSelect = useCallback(() => {
    setPopupOpen(false);
  }, [setPopupOpen]);

  const handleToolClick = useCallback((toolId: ToolId) => {
    if (toolId === 'plus') {
      setPopupOpen(true);
      return;
    }
    const nextMode = toolToMode[toolId];
    setMode(nextMode);
    setPopupOpen(false);
  }, [setMode, setPopupOpen]);

  const renderActionTooltip = useCallback((
    action: 'undo' | 'redo',
    label: string,
    keys: string[],
    anchorRef: React.RefObject<HTMLButtonElement | null>,
  ) => {
    if (hoveredAction !== action) return null;
    if (typeof document === 'undefined') return null;
    const anchor = anchorRef.current;
    if (!anchor) return null;
    const rect = anchor.getBoundingClientRect();

    return createPortal(
      <div style={{
        position: 'fixed',
        left: rect.left + rect.width / 2,
        top: rect.top - 12,
        transform: 'translate(-50%, -100%)',
        background: '#f7f7f7',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 12,
        padding: '8px 10px',
        color: '#0c0c0c',
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
        zIndex: 1000,
        pointerEvents: 'none',
      }}>
        <span>{label}</span>
        {keys.map((key) => (
          <span
            key={`${action}-${key}`}
            style={{
              background: 'rgba(0,0,0,0.12)',
              color: '#0c0c0c',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 8,
            }}
          >
            {key}
          </span>
        ))}
      </div>,
      document.body,
    );
  }, [hoveredAction]);

  const handleTemplateSelect = useCallback((template: NodeTemplate) => {
    const wrapper = flowWrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const center = screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    const position = {
      x: center.x - NODE_WIDTH / 2,
      y: center.y - NODE_HEIGHT / 2,
    };

    addNode({
      id: crypto.randomUUID(),
      type: template.type,
      position,
      data: {
        label: template.label,
        kind: template.type,
      },
    });

    setPopupOpen(false);
  }, [addNode, screenToFlowPosition, setPopupOpen]);

  useEffect(() => {
    const handleQuickAdd = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string }>).detail;
      const nodeType = detail?.type;
      if (!nodeType) return;
      const template = nodeTemplates.find((item) => item.type === nodeType);
      if (!template) return;
      handleTemplateSelect(template);
    };

    window.addEventListener('workflow:add-node', handleQuickAdd as EventListener);
    return () => {
      window.removeEventListener('workflow:add-node', handleQuickAdd as EventListener);
    };
  }, [handleTemplateSelect]);

  const handleNameCommit = useCallback(async () => {
    const trimmed = draftName.trim();
    const nextName = trimmed.length > 0 ? trimmed : 'Untitled';
    setIsEditingName(false);
    setDraftName(nextName);
    if (!workflowId) return;
    if (workflowName?.trim() === nextName) return;
    try {
      await updateWorkflowName(workflowId, nextName);
      setWorkflowName(nextName);
    } catch (error) {
      console.error('Failed to rename workflow:', error);
    }
  }, [draftName, setWorkflowName, workflowId, workflowName]);

  const handleNodesChange = useCallback<OnNodesChange>((changes) => {
    const isPositionChange = changes.some((change) => change.type === 'position');
    const isDragging = changes.some((change) => change.type === 'position' && change.dragging);
    const isSelectionOrDimensions = changes.every(
      (change) => change.type === 'select' || change.type === 'dimensions',
    );

    if (isPositionChange) {
      if (isDragging && !isDraggingRef.current) {
        setNodes((current) => current);
        isDraggingRef.current = true;
      }

      if (!isDragging && isDraggingRef.current) {
        isDraggingRef.current = false;
      }

      setNodes((current) => applyNodeChanges(changes, current), { skipHistory: true });
      return;
    }

    if (isSelectionOrDimensions) {
      setNodes((current) => applyNodeChanges(changes, current), { skipHistory: true });
      return;
    }

    setNodes((current) => applyNodeChanges(changes, current));
  }, [setNodes]);

  const handleEdgesChange = useCallback<OnEdgesChange>((changes) => {
    const isSelectionOnly = changes.every((change) => change.type === 'select');
    if (isSelectionOnly) {
      setEdges((current) => applyEdgeChanges(changes, current), { skipHistory: true });
      return;
    }
    setEdges((current) => applyEdgeChanges(changes, current));
  }, [setEdges]);

  const handleConnectStart = useCallback((_: unknown, params: { nodeId?: string | null }) => {
    const sourceNode = nodes.find((node) => node.id === params.nodeId);
    setConnectionColor(getNodeWireColor(sourceNode?.type));
  }, [nodes]);

  const handleConnectEnd = useCallback(() => {
    setConnectionColor('rgba(255,255,255,0.55)');
  }, []);

  const isValidConnection = useCallback((connection: {
    source?: string | null;
    target?: string | null;
    targetHandle?: string | null;
  }) => {
    if (mode === 'cut') return false;
    if (!connection.source || !connection.target) return false;
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);
    if (!sourceNode || !targetNode) return false;
    const outputType = getOutputTypeForNode(sourceNode.type);
    const inputTypes = getInputTypesForNode(targetNode.type);
    if (!outputType || inputTypes.length === 0) return false;
    if (targetNode.type === 'llm' && connection.targetHandle) {
      if (connection.targetHandle === 'image') return outputType === 'image';
      if (connection.targetHandle === 'text') return outputType === 'text';
    }
    return inputTypes.includes(outputType);
  }, [mode, nodes]);

  const handleConnect = useCallback<OnConnect>((connection) => {
    if (mode === 'cut') return;
    if (!isValidConnection(connection)) return;
    const sourceNode = nodes.find((node) => node.id === connection.source);
    if (!sourceNode) return;
    const wireColor = getNodeWireColor(sourceNode.type);
    setEdges((current) => addReactFlowEdge({
      ...connection,
      type: 'removable',
      style: { stroke: wireColor, strokeWidth: 1.5 },
    }, current));
  }, [isValidConnection, mode, nodes, setEdges]);

  const connectionLineStyle = useMemo(() => ({
    stroke: connectionColor,
    strokeWidth: 1.5,
  }), [connectionColor]);

  useEffect(() => {
    if (!popupOpen) return;
    const onMouseDown = (event: MouseEvent) => {
      const popup = popupRef.current;
      if (!popup) return;
      if (!popup.contains(event.target as Node)) {
        closePopupAndReturnToSelect();
      }
    };
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, [closePopupAndReturnToSelect, popupOpen]);

  const canvasCursor = useMemo(() => {
    if (mode === 'pan') return 'grab';
    if (mode === 'cut') return 'none';
    if (mode === 'add') return 'copy';
    if (mode === 'connect') return 'crosshair';
    return 'default';
  }, [mode]);

  const cutPathD = useMemo(() => {
    if (cutPathScreen.length === 0) return '';
    return cutPathScreen
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
  }, [cutPathScreen]);

  useEffect(() => {
    if (mode === 'cut') return;
    setIsCutting(false);
    setCutPathScreen([]);
    setCutCursor(null);
    cutPointsRef.current = { screen: [], flow: [] };
    setCutPreviewIds(new Set());
  }, [mode]);

  useEffect(() => {
    cutPreviewRef.current = cutPreviewIds;
  }, [cutPreviewIds]);

  const getRelativePoint = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = flowWrapperRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  const getHandleTop = useCallback((nodeType?: string, handleType?: 'source' | 'target', handleId?: string | null) => {
    if (!nodeType || !handleType) return null;
    const offsets = CUT_HANDLE_OFFSETS[nodeType]?.[handleType];
    if (!offsets) return null;
    if (handleId && typeof offsets[handleId] === 'number') return offsets[handleId];
    if (typeof offsets.default === 'number') return offsets.default;
    return null;
  }, []);

  const getHandlePoint = useCallback((node: { position: Point; positionAbsolute?: Point; width?: number | null; height?: number | null; type?: string }, handleType: 'source' | 'target', handleId?: string | null) => {
    const position = node.positionAbsolute ?? node.position;
    const width = node.width ?? NODE_WIDTH;
    const height = node.height ?? NODE_HEIGHT;
    const x = handleType === 'source' ? position.x + width : position.x;
    let y = position.y + height / 2;
    const top = getHandleTop(node.type, handleType, handleId);
    if (typeof top === 'number') {
      y = position.y + top + CUT_HANDLE_RADIUS;
    }
    return { x, y };
  }, [getHandleTop]);

  const segmentIntersects = useCallback((a: Point, b: Point, c: Point, d: Point, tolerance: number) => {
    const cross = (p1: Point, p2: Point, p3: Point) => (
      (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)
    );

    const onSegment = (p1: Point, p2: Point, p3: Point) => (
      Math.min(p1.x, p2.x) <= p3.x + tolerance &&
      Math.max(p1.x, p2.x) + tolerance >= p3.x &&
      Math.min(p1.y, p2.y) <= p3.y + tolerance &&
      Math.max(p1.y, p2.y) + tolerance >= p3.y
    );

    const d1 = cross(a, b, c);
    const d2 = cross(a, b, d);
    const d3 = cross(c, d, a);
    const d4 = cross(c, d, b);

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      return true;
    }

    if (Math.abs(d1) <= tolerance && onSegment(a, b, c)) return true;
    if (Math.abs(d2) <= tolerance && onSegment(a, b, d)) return true;
    if (Math.abs(d3) <= tolerance && onSegment(c, d, a)) return true;
    if (Math.abs(d4) <= tolerance && onSegment(c, d, b)) return true;

    return false;
  }, []);

  const edgeIntersectsCut = useCallback((edge: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }, segmentStart: Point, segmentEnd: Point) => {
    const sourceNode = getNode(edge.source);
    const targetNode = getNode(edge.target);
    if (!sourceNode || !targetNode) return false;
    const sourcePoint = getHandlePoint(sourceNode, 'source', edge.sourceHandle);
    const targetPoint = getHandlePoint(targetNode, 'target', edge.targetHandle);
    const tolerance = Math.max(8 / Math.max(viewport.zoom, 0.1), 2);
    return segmentIntersects(segmentStart, segmentEnd, sourcePoint, targetPoint, tolerance);
  }, [getHandlePoint, getNode, segmentIntersects, viewport.zoom]);

  const previewEdgesWithSegment = useCallback((segmentStart: Point, segmentEnd: Point) => {
    if (edges.length === 0) return;
    const matched = edges.filter((edge) => edgeIntersectsCut(edge, segmentStart, segmentEnd));
    if (matched.length === 0) return;
    setCutPreviewIds((current) => {
      const next = new Set(current);
      matched.forEach((edge) => next.add(edge.id));
      return next;
    });
  }, [edgeIntersectsCut, edges]);

  const handleCutStart = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (mode !== 'cut') return;
    event.preventDefault();
    event.stopPropagation();
    const screenPoint = getRelativePoint(event);
    const flowPoint = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    cutPointsRef.current = { screen: [screenPoint], flow: [flowPoint] };
    setCutPathScreen([screenPoint]);
    setCutCursor(screenPoint);
    setCutPreviewIds(new Set());
    setIsCutting(true);
  }, [getRelativePoint, mode, screenToFlowPosition]);

  const handleCutMove = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (mode !== 'cut') return;
    const screenPoint = getRelativePoint(event);
    setCutCursor(screenPoint);

    if (!isCutting) return;

    const { screen, flow } = cutPointsRef.current;
    const lastScreen = screen[screen.length - 1];
    const dx = screenPoint.x - lastScreen.x;
    const dy = screenPoint.y - lastScreen.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 6) return;

    const nextFlow = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const nextScreenPoints = [...screen, screenPoint];
    const nextFlowPoints = [...flow, nextFlow];
    cutPointsRef.current = { screen: nextScreenPoints, flow: nextFlowPoints };
    setCutPathScreen(nextScreenPoints);
    setCutAngle(Math.atan2(dy, dx) * (180 / Math.PI));

    previewEdgesWithSegment(flow[flow.length - 1], nextFlow);
  }, [getRelativePoint, isCutting, mode, previewEdgesWithSegment, screenToFlowPosition]);

  const finishCut = useCallback(() => {
    const idsToRemove = cutPreviewRef.current;
    if (idsToRemove.size > 0) {
      setEdges((current) => current.filter((edge) => !idsToRemove.has(edge.id)));
    }
    setIsCutting(false);
    setCutPathScreen([]);
    cutPointsRef.current = { screen: [], flow: [] };
    setCutPreviewIds(new Set());
  }, []);

  const handleCutEnd = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (mode !== 'cut') return;
    event.preventDefault();
    event.stopPropagation();
    finishCut();
  }, [finishCut, mode]);

  const handleCutLeave = useCallback(() => {
    setCutCursor(null);
    if (isCutting) {
      finishCut();
    }
  }, [finishCut, isCutting]);

  const renderEdges = useMemo(() => {
    if (mode !== 'cut' || cutPreviewIds.size === 0) return edges;
    return edges.map((edge) => {
      if (!cutPreviewIds.has(edge.id)) return edge;
      const baseStyle = edge.style && typeof edge.style === 'object' ? edge.style : {};
      return {
        ...edge,
        style: {
          ...baseStyle,
          stroke: '#ff4d4d',
          strokeWidth: 2,
        },
      };
    });
  }, [cutPreviewIds, edges, mode]);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      height: '100vh',
      background: '#141414',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StarField offset={{ x: viewport.x, y: viewport.y }} />

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#1d1d1d',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 12,
            padding: '6px 12px',
            color: 'rgba(255,255,255,0.9)',
            fontSize: 16,
            fontWeight: 500,
            transition: 'border-color 160ms ease, box-shadow 160ms ease',
          }}
          onClick={() => {
            setIsEditingName(true);
            requestAnimationFrame(() => titleInputRef.current?.focus());
          }}
        >
          <Logo />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isEditingName ? (
              <input
                ref={titleInputRef}
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onBlur={handleNameCommit}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void handleNameCommit();
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    setDraftName(workflowName?.trim() || 'Untitled');
                    setIsEditingName(false);
                  }
                }}
                style={{
                  width: 200,
                  maxWidth: 240,
                  background: '#111111',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  padding: '6px 10px',
                  color: 'rgba(255,255,255,0.95)',
                  fontSize: 16,
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 160ms ease',
                }}
                onClick={(event) => event.stopPropagation()}
              />
            ) : (
              <span style={{ transition: 'opacity 160ms ease' }}>{draftName}</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, transform: 'translateX(4px)' }}>
          <TopBtn style={{ width: 36, padding: 0 }}><Moon /></TopBtn>
          <TopBtn><Diamond /><span>Share</span></TopBtn>
          <TopBtn><Wrench /><span>Turn workflow into app</span></TopBtn>
          <div style={{ display: 'flex', height: 36 }}>
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#1d1d1d',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px 0 0 10px',
              width: 34,
              cursor: 'pointer',
            }}>
              <ExportIcon />
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#1d1d1d',
              border: '1px solid rgba(255,255,255,0.09)',
              borderLeft: 'none',
              borderRadius: '0 10px 10px 0',
              width: 22,
              cursor: 'pointer',
            }}>
              <ChevronDownSm />
            </button>
          </div>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div
        ref={flowWrapperRef}
        style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', position: 'relative', overflow: 'hidden', cursor: canvasCursor }}
        onMouseDown={handleCutStart}
        onMouseMove={handleCutMove}
        onMouseUp={handleCutEnd}
        onMouseLeave={handleCutLeave}
      >
        {mode === 'cut' && (
          <style>{`
            .react-flow__pane {
              cursor: none !important;
            }
          `}</style>
        )}
        <style>{`
          @keyframes cut-dash {
            to { stroke-dashoffset: -24; }
          }
        `}</style>
        <ReactFlow
          nodes={nodes}
          edges={renderEdges}
          nodeTypes={memoNodeTypes}
          edgeTypes={memoEdgeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
          isValidConnection={isValidConnection}
          onMove={(_, nextViewport) => setViewport(nextViewport)}
          panOnDrag={mode === 'pan'}
          panOnScroll={mode === 'pan'}
          nodesDraggable={mode === 'select' || mode === 'pan'}
          nodesConnectable={mode !== 'cut'}
          elementsSelectable={mode !== 'cut'}
          selectionOnDrag={mode === 'select'}
          selectionMode={SelectionMode.Partial}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineStyle={connectionLineStyle}
          proOptions={{ hideAttribution: true }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          style={{ width: '100%', height: '100%', background: 'transparent', cursor: canvasCursor }}
        />

        {mode === 'cut' && cutPathD && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
            style={{ zIndex: 5 }}
          >
            <path
              d={cutPathD}
              fill="none"
              stroke="#ff4d4d"
              strokeWidth={2}
              strokeDasharray="6 6"
              strokeLinecap="round"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(255,77,77,0.5))',
                animation: 'cut-dash 0.8s linear infinite',
              }}
            />
          </svg>
        )}

        {mode === 'cut' && cutCursor && (
          <div
            style={{
              position: 'absolute',
              left: cutCursor.x,
              top: cutCursor.y,
              transform: `translate(-50%, -50%) rotate(${cutAngle}deg)`,
              pointerEvents: 'none',
              zIndex: 6,
            }}
          >
            <ScissorsIcon />
          </div>
        )}

        {nodes.length === 0 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ textAlign: 'center', userSelect: 'none' }}>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 20, fontWeight: 500, margin: 0, marginBottom: 12 }}>
                Add a node
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 16 }}>
                  Double click, right click, or press
                </span>
                <kbd style={{
                  background: 'rgba(255,255,255,0.11)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 6,
                  padding: '3px 9px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: 'monospace',
                }}>N</kbd>
              </div>
            </div>
          </div>
        )}

        {popupOpen && (
          <div
            ref={popupRef}
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 58,
              transform: 'translateX(-50%)',
              background: 'rgba(18,18,18,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              minWidth: 210,
              zIndex: 20,
              boxShadow: '0 18px 46px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              backdropFilter: 'blur(6px)',
            }}
          >
            <style>{`
              @keyframes dropdown-fade {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div style={{ padding: 8, animation: 'dropdown-fade 0.16s ease-out' }}>
              {nodeTemplates.map((template) => (
                <button
                  key={`${template.type}-${template.label}`}
                  onClick={() => handleTemplateSelect(template)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.9)',
                    textAlign: 'left',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.06)',
                  }}>
                    <template.Icon />
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.01em' }}>{template.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 16px 18px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <div
            style={{ position: 'relative', display: 'flex' }}
            onMouseEnter={() => setHoveredAction('undo')}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <button
              ref={undoButtonRef}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40,
                background: 'transparent', border: 'none', borderRadius: 10, cursor: 'pointer',
              }}
              onClick={() => {
                if (past.length > 0) undo();
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Undo />
            </button>
            {renderActionTooltip('undo', 'Undo', ['Ctrl', 'Z'], undoButtonRef)}
          </div>
          <div
            style={{ position: 'relative', display: 'flex' }}
            onMouseEnter={() => setHoveredAction('redo')}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <button
              ref={redoButtonRef}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40,
                background: 'transparent', border: 'none', borderRadius: 10, cursor: 'pointer',
              }}
              onClick={() => {
                if (future.length > 0) redo();
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Redo />
            </button>
            {renderActionTooltip('redo', 'Redo', ['Ctrl', 'Shift', 'Z'], redoButtonRef)}
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#1d1d1d',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 10,
            padding: '0 14px',
            height: 40,
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.72)',
            fontSize: 15,
            fontWeight: 400,
            letterSpacing: '0.01em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            marginLeft: 4,
          }}>
            <CmdKey />
            <span>Keyboard shortcuts</span>
          </button>
        </div>

        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: '#1d1d1d',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 15,
          padding: '5px 6px',
          overflow: 'visible',
        }}>
          {tools.map(({ id, Icon, tooltip }) => (
            <ToolBtn
              key={id}
              highlighted={(id !== 'plus' && activeTool === id) || hoveredTool === id}
              onClick={() => handleToolClick(id)}
              onHoverChange={(isHovered) => setHoveredTool(isHovered ? id : null)}
              tooltip={tooltip}
              showTooltip={hoveredTool === id}
            >
              <Icon />
            </ToolBtn>
          ))}
        </div>

        <button style={{
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#1d1d1d',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 10,
          width: 42, height: 42,
          cursor: 'pointer',
        }}>
          <GridIcon />
        </button>
      </div>
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
