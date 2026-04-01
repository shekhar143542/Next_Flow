'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export default function EditorPage() {
  const router = useRouter();
  const { clearWorkflow } = useWorkflowStore();
  const hasRoutedRef = useRef(false);

  useEffect(() => {
    if (hasRoutedRef.current) return;
    hasRoutedRef.current = true;

    clearWorkflow();

    const draftId = crypto.randomUUID();
    try {
      sessionStorage.setItem('draftWorkflowId', draftId);
      sessionStorage.removeItem('newWorkflowId');
    } catch {
    }

    router.replace(`/workflow/${draftId}`);
  }, [clearWorkflow, router]);

  return null;
}
