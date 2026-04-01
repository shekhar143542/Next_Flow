'use client';

import { useEffect } from 'react';
import { useWorkflowStore, type WorkflowNode, type WorkflowEdge } from '@/store/useWorkflowStore';

export function useLoadWorkflow(workflowId: string | null, skipIfNew = false) {
  const { setIsLoading, loadWorkflow, setWorkflowId, setWorkflowName } = useWorkflowStore();

  useEffect(() => {
    if (!workflowId || workflowId === 'undefined') return;

    let shouldSkip = false;

    if (skipIfNew) {
      try {
        const draftId = sessionStorage.getItem('draftWorkflowId');
        if (draftId && draftId === workflowId) {
          shouldSkip = true;
          loadWorkflow([], []);
          setWorkflowName(null);
        }
      } catch {
      }
    }

    if (skipIfNew && !shouldSkip) {
      try {
        const isNew = sessionStorage.getItem('newWorkflowId') === workflowId;
        const { nodes, edges } = useWorkflowStore.getState();
        if (isNew && (nodes.length > 0 || edges.length > 0)) {
          shouldSkip = true;
          sessionStorage.removeItem('newWorkflowId');
        }
      } catch {
      }
    }

    if (shouldSkip) {
      setWorkflowId(workflowId);
      setIsLoading(false);
      return;
    }

    setWorkflowId(workflowId);
    setIsLoading(true);

    const loadData = async () => {
      try {
        const response = await fetch(`/api/workflows/${workflowId}`);

        if (!response.ok) {
          const errorText = await response.text();
          const details = errorText || response.statusText || 'Unknown error';
          throw new Error(`Failed to load workflow (${response.status}): ${details}`);
        }

        const data = await response.json();
        loadWorkflow(data.nodes as WorkflowNode[], data.edges as WorkflowEdge[]);
        setWorkflowName(typeof data.name === 'string' ? data.name : null);
      } catch (error) {
        console.error('Error loading workflow:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [workflowId, skipIfNew, setIsLoading, loadWorkflow, setWorkflowId, setWorkflowName]);
}
