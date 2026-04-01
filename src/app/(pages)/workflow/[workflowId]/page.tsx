'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useLoadWorkflow } from '@/hooks/useLoadWorkflow';
import { useAutoSaveWorkflow } from '@/hooks/useAutoSaveWorkflow';
import WorkflowEditor from '../workflowEditor';

export default function WorkflowPage() {
  const params = useParams();
  const workflowId = params?.workflowId as string;
  const { isLoading } = useWorkflowStore();
  const [suppressLoading, setSuppressLoading] = useState(false);

  // Load workflow from API on mount
  useLoadWorkflow(workflowId, true);

  // Auto-save when nodes/edges change
  useAutoSaveWorkflow();

  useEffect(() => {
    if (!workflowId) return;
    let isNew = false;
    let isReload = false;
    try {
      isNew = sessionStorage.getItem('newWorkflowId') === workflowId;
      if (isNew) {
        sessionStorage.removeItem('newWorkflowId');
      }
    } catch {
      isNew = false;
    }
    try {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      isReload = navEntry?.type === 'reload';
    } catch {
      isReload = false;
    }
    setSuppressLoading(isNew && !isReload);
  }, [workflowId]);

  if (isLoading && !suppressLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-white">
        <div className="flex flex-col items-center gap-5">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#2f92ff] animate-spin" />
            <div className="absolute inset-2 rounded-full bg-white/5 animate-pulse" />
          </div>
          <div className="text-sm font-medium text-white/80">Loading workflow</div>
          <div className="flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-white/10 animate-pulse" />
            <span className="h-1 w-8 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="h-1 w-8 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return <WorkflowEditor />;
}
