'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowStore, type WorkflowEdge, type WorkflowNode } from '@/store/useWorkflowStore';
import { createNewWorkflow } from '@/lib/workflowApi';

const DEBOUNCE_DELAY = 1500; // 1.5 seconds

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

export function useAutoSaveWorkflow() {
  const { workflowId, nodes, edges, setIsSaving, isLoading, setWorkflowId } = useWorkflowStore();
  const router = useRouter();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedSignatureRef = useRef<string | null>(null);
  const hasEverHadContentRef = useRef(false);
  const createInFlightRef = useRef(false);
  const saveStateRef = useRef({
    inFlight: false,
    pending: false,
    nodes,
    edges,
    prevNodesCount: nodes.length,
    skipNextSave: true,
  });

  useEffect(() => {
    saveStateRef.current.nodes = nodes;
    saveStateRef.current.edges = edges;
  }, [nodes, edges]);

  useEffect(() => {
    saveStateRef.current.inFlight = false;
    saveStateRef.current.pending = false;
    saveStateRef.current.prevNodesCount = nodes.length;
    saveStateRef.current.skipNextSave = true;
    lastSavedSignatureRef.current = null;
    hasEverHadContentRef.current = false;
    createInFlightRef.current = false;
  }, [workflowId]);

  const getDraftWorkflowId = () => {
    try {
      return sessionStorage.getItem('draftWorkflowId');
    } catch {
      return null;
    }
  };

  const clearDraftWorkflowId = (id?: string | null) => {
    try {
      const draftId = sessionStorage.getItem('draftWorkflowId');
      if (!id || draftId === id) {
        sessionStorage.removeItem('draftWorkflowId');
      }
    } catch {
    }
  };

  const createWorkflowIfNeeded = async () => {
    if (createInFlightRef.current) return null;

    const hasContent =
      saveStateRef.current.nodes.length > 0 ||
      saveStateRef.current.edges.length > 0;
    if (!hasContent) return null;

    const currentId = workflowId && workflowId !== 'undefined' ? workflowId : null;
    const draftId = getDraftWorkflowId();
    const shouldCreateWithDraft = Boolean(currentId && draftId && draftId === currentId);

    createInFlightRef.current = true;

    try {
      if (shouldCreateWithDraft && currentId) {
        await createNewWorkflow({ id: currentId });
        clearDraftWorkflowId(currentId);
        try {
          sessionStorage.setItem('newWorkflowId', currentId);
          sessionStorage.setItem('editorNeedsRefresh', '1');
        } catch {
        }
        return currentId;
      }

      const newWorkflowId = await createNewWorkflow();
      setWorkflowId(newWorkflowId);
      try {
        sessionStorage.setItem('newWorkflowId', newWorkflowId);
        sessionStorage.setItem('editorNeedsRefresh', '1');
      } catch {
      }
      router.replace(`/workflow/${newWorkflowId}`);
      return newWorkflowId;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      return null;
    } finally {
      createInFlightRef.current = false;
    }
  };

  const saveNow = async () => {
    if (isLoading) return;

    const isEmpty =
      saveStateRef.current.nodes.length === 0 &&
      saveStateRef.current.edges.length === 0;
    if (isEmpty && !hasEverHadContentRef.current) return;

    const draftId = getDraftWorkflowId();
    const isDraft = Boolean(draftId && workflowId === draftId);
    const activeWorkflowId =
      workflowId && workflowId !== 'undefined' && !isDraft
        ? workflowId
        : await createWorkflowIfNeeded();
    if (!activeWorkflowId) return;

    const signature = buildSignature(
      saveStateRef.current.nodes,
      saveStateRef.current.edges,
    );

    if (lastSavedSignatureRef.current === signature) return;
    if (saveStateRef.current.inFlight) {
      saveStateRef.current.pending = true;
      return;
    }

    saveStateRef.current.inFlight = true;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/workflows/${activeWorkflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: saveStateRef.current.nodes,
          edges: saveStateRef.current.edges,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const details = errorText || response.statusText || 'Unknown error';
        console.error('Auto-save failed:', details);
      } else {
        lastSavedSignatureRef.current = signature;
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
      saveStateRef.current.inFlight = false;

      if (saveStateRef.current.pending) {
        saveStateRef.current.pending = false;
        void saveNow();
      }
    }
  };

  useEffect(() => {
    const draftId = getDraftWorkflowId();
    const isDraft = Boolean(draftId && workflowId === draftId);
    const hasWorkflowId = Boolean(workflowId && workflowId !== 'undefined' && !isDraft);
    const hasContent = nodes.length > 0 || edges.length > 0;

    if (!hasWorkflowId && !hasContent) return;

    if (hasWorkflowId && isLoading) {
      saveStateRef.current.skipNextSave = true;
      return;
    }

    const previousCount = saveStateRef.current.prevNodesCount;
    const currentCount = nodes.length;
    const isFirstNodeAdded = previousCount === 0 && currentCount > 0;

    saveStateRef.current.prevNodesCount = currentCount;
    const signature = buildSignature(nodes, edges);
    if (hasContent) {
      hasEverHadContentRef.current = true;
    }

    if (saveStateRef.current.skipNextSave && hasWorkflowId) {
      saveStateRef.current.skipNextSave = false;
      lastSavedSignatureRef.current = signature;
      return;
    }

    if (saveStateRef.current.skipNextSave && !hasWorkflowId) {
      saveStateRef.current.skipNextSave = false;
    }

    if (signature === lastSavedSignatureRef.current) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (isFirstNodeAdded) {
      void saveNow();
      return;
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      void saveNow();
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [workflowId, nodes, edges, isLoading, setIsSaving]);
}
