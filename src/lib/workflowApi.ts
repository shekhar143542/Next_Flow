import type { WorkflowCardData } from '@/components/WorkflowCard';

type CreateWorkflowInput = {
  id?: string;
};

/**
 * Create a new empty workflow and return its ID
 */
export async function createNewWorkflow(input?: CreateWorkflowInput): Promise<string> {
  const hasBody = Boolean(input?.id);
  const response = await fetch('/api/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: hasBody ? JSON.stringify(input) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    const details = errorText || response.statusText || 'Unknown error';
    throw new Error(`Failed to create workflow (${response.status}): ${details}`);
  }

  const data = await response.json();
  return data.workflowId;
}

/**
 * Update workflow name in the database
 */
export async function updateWorkflowName(workflowId: string, name: string): Promise<void> {
  const response = await fetch(`/api/workflows/${workflowId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const details = errorText || response.statusText || 'Unknown error';
    throw new Error(`Failed to update workflow name (${response.status}): ${details}`);
  }
}

/**
 * Delete a workflow by ID
 */
export async function deleteWorkflow(workflowId: string): Promise<void> {
  const response = await fetch(`/api/workflows/${workflowId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    const details = errorText || response.statusText || 'Unknown error';
    throw new Error(`Failed to delete workflow (${response.status}): ${details}`);
  }
}

/**
 * Duplicate a workflow and return the new workflow data
 */
export async function duplicateWorkflow(workflowId: string): Promise<WorkflowCardData> {
  const response = await fetch(`/api/workflows/${workflowId}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    const details = errorText || response.statusText || 'Unknown error';
    throw new Error(`Failed to duplicate workflow (${response.status}): ${details}`);
  }

  const data = await response.json();
  return data.workflow as WorkflowCardData;
}
