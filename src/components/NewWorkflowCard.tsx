"use client";

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * NewWorkflowCard Component
 * Reusable component for creating a new workflow
 */
export function NewWorkflowCard() {
  const router = useRouter();

  const handleCreate = async () => {
    const draftId = crypto.randomUUID();
    try {
      sessionStorage.setItem('draftWorkflowId', draftId);
    } catch {
    }
    router.push(`/workflow/${draftId}`);
  };

  return (
    <div
      className="group cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => void handleCreate()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          void handleCreate();
        }
      }}
      aria-label="Create new workflow"
    >
      <div className="relative w-full h-44 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden transition-all duration-200 flex items-center justify-center max-w-xs">
        <div className="absolute inset-0 bg-linear-to-br from-[#2a2a2a] to-[#1a1a1a]" />
        <button
          type="button"
          className="relative z-10 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            void handleCreate();
          }}
          aria-label="Open workflow canvas"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">New Workflow</h3>
    </div>
  );
}
