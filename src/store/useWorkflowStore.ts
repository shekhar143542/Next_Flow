import type { Edge, Node } from 'reactflow';
import { create } from 'zustand';

export type WorkflowMode = 'add' | 'select' | 'pan' | 'cut' | 'connect';

export type WorkflowNodeData = {
  label: string;
  kind: string;
  text?: string;
  systemPrompt?: string;
  userMessage?: string;
  output?: string;
  executionOutput?: unknown;
  image?: string;
  imageUrl?: string;
  imagePreviewUrl?: string;
  croppedImage?: string;
  outputImage?: string;
  videoUrl?: string;
  videoPreviewUrl?: string;
  extractedFrame?: string;
  frameTime?: number;
};

export type WorkflowNode = Node<WorkflowNodeData>;

export type WorkflowEdge = Edge;

type WorkflowSnapshot = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

const HISTORY_LIMIT = 50;

const cloneNodes = (nodes: WorkflowNode[]) => nodes.map((node) => ({
  ...node,
  position: node.position ? { ...node.position } : node.position,
  positionAbsolute: node.positionAbsolute ? { ...node.positionAbsolute } : node.positionAbsolute,
  data: node.data ? { ...node.data } : node.data,
  style: node.style ? { ...node.style } : node.style,
}));

const cloneEdges = (edges: WorkflowEdge[]) => edges.map((edge) => ({
  ...edge,
  style: edge.style ? { ...edge.style } : edge.style,
}));

const snapshotState = (state: Pick<WorkflowState, 'nodes' | 'edges'>): WorkflowSnapshot => ({
  nodes: cloneNodes(state.nodes),
  edges: cloneEdges(state.edges),
});

const buildSignature = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
  const serializedNodes = nodes
    .map((node) => ({
      id: node.id,
      type: node.type ?? null,
      position: {
        x: Number.isFinite(node.position?.x) ? node.position.x : 0,
        y: Number.isFinite(node.position?.y) ? node.position.y : 0,
      },
      data: node.data ?? null,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const serializedEdges = edges
    .map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
      style: edge.style ?? null,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return JSON.stringify({ nodes: serializedNodes, edges: serializedEdges });
};

interface WorkflowState {
  workflowId: string | null;
  workflowName: string | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  past: WorkflowSnapshot[];
  future: WorkflowSnapshot[];
  mode: WorkflowMode;
  popupOpen: boolean;
  selectedNodeIds: string[];
  connectSourceId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  executionState: {
    runningNodeId: string | null;
    activeEdgeId: string | null;
    completedNodes: string[];
    pendingNodeIds: string[];
  };
  
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string | null) => void;
  setMode: (mode: WorkflowMode) => void;
  togglePopup: () => void;
  setPopupOpen: (isOpen: boolean) => void;
  addNode: (node: WorkflowNode) => void;
  setNodes: (
    nodes: WorkflowNode[] | ((nodes: WorkflowNode[]) => WorkflowNode[]),
    options?: { skipHistory?: boolean }
  ) => void;
  setEdges: (
    edges: WorkflowEdge[] | ((edges: WorkflowEdge[]) => WorkflowEdge[]),
    options?: { skipHistory?: boolean }
  ) => void;
  addEdge: (edge: WorkflowEdge) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  removeNodesByIds: (ids: string[]) => void;
  setConnectSourceId: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setRunningNode: (id: string | null) => void;
  setActiveEdge: (id: string | null) => void;
  setPendingNodeIds: (ids: string[]) => void;
  markNodeComplete: (id: string) => void;
  resetExecution: () => void;
  loadWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  clearWorkflow: () => void;
  undo: () => void;
  redo: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  workflowId: null,
  workflowName: null,
  nodes: [],
  edges: [],
  past: [],
  future: [],
  mode: 'select',
  popupOpen: false,
  selectedNodeIds: [],
  connectSourceId: null,
  isLoading: false,
  isSaving: false,
  executionState: {
    runningNodeId: null,
    activeEdgeId: null,
    completedNodes: [],
    pendingNodeIds: [],
  },

  setWorkflowId: (id) => set({ workflowId: id }),
  setWorkflowName: (name) => set({ workflowName: name }),
  setMode: (mode) => set({ mode }),
  togglePopup: () => set((state) => ({ popupOpen: !state.popupOpen })),
  setPopupOpen: (isOpen) => set({ popupOpen: isOpen }),

  addNode: (node) => set((state) => ({
    past: [...state.past, snapshotState(state)].slice(-HISTORY_LIMIT),
    future: [],
    nodes: [...state.nodes, node],
  })),
  setNodes: (nodes, options) => set((state) => {
    const nextNodes = typeof nodes === 'function' ? nodes(state.nodes) : nodes;
    if (options?.skipHistory) {
      return { nodes: nextNodes };
    }
    return {
      past: [...state.past, snapshotState(state)].slice(-HISTORY_LIMIT),
      future: [],
      nodes: nextNodes,
    };
  }),
  setEdges: (edges, options) => set((state) => {
    const nextEdges = typeof edges === 'function' ? edges(state.edges) : edges;
    if (options?.skipHistory) {
      return { edges: nextEdges };
    }
    return {
      past: [...state.past, snapshotState(state)].slice(-HISTORY_LIMIT),
      future: [],
      edges: nextEdges,
    };
  }),
  addEdge: (edge) => set((state) => ({
    past: [...state.past, snapshotState(state)].slice(-HISTORY_LIMIT),
    future: [],
    edges: [...state.edges, edge],
  })),

  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
  removeNodesByIds: (ids) =>
    set((state) => ({
      past: [...state.past, snapshotState(state)].slice(-HISTORY_LIMIT),
      future: [],
      nodes: state.nodes.filter((node) => !ids.includes(node.id)),
      edges: state.edges.filter((edge) => !ids.includes(edge.source) && !ids.includes(edge.target)),
      selectedNodeIds: state.selectedNodeIds.filter((id) => !ids.includes(id)),
      connectSourceId: state.connectSourceId && ids.includes(state.connectSourceId) ? null : state.connectSourceId,
    })),
  setConnectSourceId: (id) => set({ connectSourceId: id }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsSaving: (saving) => set({ isSaving: saving }),
  setRunningNode: (id) => set((state) => ({
    executionState: { ...state.executionState, runningNodeId: id },
  })),
  setActiveEdge: (id) => set((state) => ({
    executionState: { ...state.executionState, activeEdgeId: id },
  })),
  setPendingNodeIds: (ids) => set((state) => ({
    executionState: { ...state.executionState, pendingNodeIds: ids },
  })),
  markNodeComplete: (id) => set((state) => {
    if (state.executionState.completedNodes.includes(id)) return state;
    return {
      executionState: {
        ...state.executionState,
        completedNodes: [...state.executionState.completedNodes, id],
      },
    };
  }),
  resetExecution: () => set((state) => ({
    executionState: {
      ...state.executionState,
      runningNodeId: null,
      activeEdgeId: null,
      completedNodes: [],
      pendingNodeIds: [],
    },
  })),
  loadWorkflow: (nodes, edges) => set({
    nodes,
    edges,
    past: [],
    future: [],
  }),
  clearWorkflow: () => set({
    workflowId: null,
    workflowName: null,
    nodes: [],
    edges: [],
    selectedNodeIds: [],
    connectSourceId: null,
    isLoading: false,
    isSaving: false,
    past: [],
    future: [],
  }),
  undo: () => set((state) => {
    if (state.past.length === 0) return state;
    const currentSignature = buildSignature(state.nodes, state.edges);
    const newPast = [...state.past];
    let previous: WorkflowSnapshot | undefined;

    while (newPast.length > 0) {
      const candidate = newPast[newPast.length - 1];
      const candidateSignature = buildSignature(candidate.nodes, candidate.edges);
      if (candidateSignature !== currentSignature) {
        previous = candidate;
        break;
      }
      newPast.pop();
    }

    if (!previous) return state;
    newPast.pop();
    const newFuture = [snapshotState(state), ...state.future];
    return {
      past: newPast,
      future: newFuture,
      nodes: previous.nodes,
      edges: previous.edges,
    };
  }),
  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const currentSignature = buildSignature(state.nodes, state.edges);
    const newFuture = [...state.future];
    let next: WorkflowSnapshot | undefined;

    while (newFuture.length > 0) {
      const candidate = newFuture[0];
      const candidateSignature = buildSignature(candidate.nodes, candidate.edges);
      if (candidateSignature !== currentSignature) {
        next = candidate;
        break;
      }
      newFuture.shift();
    }

    if (!next) return state;
    newFuture.shift();
    const newPast = [...state.past, snapshotState(state)].slice(-HISTORY_LIMIT);
    return {
      past: newPast,
      future: newFuture,
      nodes: next.nodes,
      edges: next.edges,
    };
  }),
}));
