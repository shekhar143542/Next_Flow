'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Search, Settings2 } from 'lucide-react';
import { NewWorkflowCard } from '@/components/NewWorkflowCard';
import { WorkflowCard, type WorkflowCardData } from '@/components/WorkflowCard';
import {
  deleteWorkflow,
  duplicateWorkflow,
  updateWorkflowName,
} from '@/lib/workflowApi';


// Node Editor Icon SVG
const NodeEditorHeroIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#2563EB" />
    <rect x="5" y="5" width="4" height="4" rx="0.5" fill="white" />
    <rect x="15" y="15" width="4" height="4" rx="0.5" fill="white" />
    <line x1="9" y1="7" x2="15" y2="17" stroke="white" strokeWidth="1" />
    <line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="1" />
  </svg>
);

// Large Node Editor Icon for empty state
const NodeEditorEmptyIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#2563EB" />
    <rect x="5" y="5" width="4" height="4" rx="0.5" fill="white" />
    <rect x="15" y="15" width="4" height="4" rx="0.5" fill="white" />
    <line x1="9" y1="7" x2="15" y2="17" stroke="white" strokeWidth="1" />
    <line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="1" />
  </svg>
);

type TabType = 'projects' | 'apps' | 'examples' | 'templates';

const VALID_TABS: TabType[] = ['projects', 'apps', 'examples', 'templates'];

const resolveTab = (tab?: string | null) => {
  if (tab && VALID_TABS.includes(tab as TabType)) {
    return tab as TabType;
  }
  return 'projects';
};

interface Tab {
  id: TabType;
  label: string;
}

type NodeEditorProps = {
  initialWorkflows?: WorkflowCardData[];
  initialTab?: string;
};

export default function NodeEditor({
  initialWorkflows = [],
  initialTab,
}: NodeEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(() => resolveTab(initialTab));
  const [workflows, setWorkflows] = useState<WorkflowCardData[]>(initialWorkflows);
  const [isRefreshing, setIsRefreshing] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('editorNeedsRefresh') === '1';
    } catch {
      return false;
    }
  });
  const [isPending, startTransition] = useTransition();

  const tabs: Tab[] = [
    { id: 'projects', label: 'Projects' },
    { id: 'apps', label: 'Apps'},
    { id: 'examples', label: 'Examples'},
    { id: 'templates', label: 'Templates'},
  ];

  // Initialize tab from URL query parameter after hydration
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const nextTab = resolveTab(tabParam);
    setActiveTab((current) => (current === nextTab ? current : nextTab));
  }, [searchParams]);

  useEffect(() => {
    setWorkflows(initialWorkflows);
  }, [initialWorkflows]);

  useEffect(() => {
    if (!isRefreshing) return;

    try {
      sessionStorage.removeItem('editorNeedsRefresh');
    } catch {
    }

    startTransition(() => {
      router.refresh();
    });
  }, [isRefreshing, router, startTransition]);

  useEffect(() => {
    if (isRefreshing && !isPending) {
      setIsRefreshing(false);
    }
  }, [isPending, isRefreshing]);

  // Handle tab change and update URL
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    router.push(`?tab=${tabId}`);
  };

  const handleCreateWorkflow = async () => {
    const draftId = crypto.randomUUID();
    try {
      sessionStorage.setItem('draftWorkflowId', draftId);
    } catch {
    }
    router.push(`/workflow/${draftId}`);
  };

  const sortWorkflows = (items: WorkflowCardData[]) => (
    items.slice().sort((a, b) => (
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ))
  );

  const skeletonCards = Array.from({ length: 8 });

  const handleRenameWorkflow = async (workflowId: string, name: string) => {
    try {
      await updateWorkflowName(workflowId, name);
      setWorkflows((current) => sortWorkflows(current.map((workflow) => (
        workflow.id === workflowId
          ? { ...workflow, name, updatedAt: new Date().toISOString() }
          : workflow
      ))));
    } catch (error) {
      console.error('Failed to rename workflow:', error);
    }
  };

  const handleDuplicateWorkflow = async (workflowId: string) => {
    try {
      const duplicated = await duplicateWorkflow(workflowId);
      setWorkflows((current) => sortWorkflows([duplicated, ...current]));
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await deleteWorkflow(workflowId);
      setWorkflows((current) => current.filter((workflow) => workflow.id !== workflowId));
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  if (isRefreshing) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="fixed top-0 left-0 right-0 h-1 bg-[#0b0b0b] overflow-hidden z-50">
          <div
            style={{
              height: '100%',
              width: '35%',
              background:
                'linear-gradient(90deg, rgba(47,146,255,0), rgba(47,146,255,0.9), rgba(30,234,106,0.9), rgba(240,165,0,0.9))',
              animation: 'editor-loading 1.1s ease-in-out infinite',
            }}
          />
        </div>
        <div className="px-10 pt-24">
          <div className="h-6 w-52 rounded-full bg-white/10" />
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {skeletonCards.map((_, index) => (
              <div
                key={`workflow-skeleton-${index}`}
                className="relative h-44 rounded-xl border border-[#1f1f1f] bg-[#121212] overflow-hidden"
              >
                <div className="absolute inset-0 shimmer-overlay" />
                <div className="absolute bottom-4 left-4 h-3 w-24 rounded-full bg-white/10" />
                <div className="absolute bottom-2 left-4 h-2 w-16 rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes editor-loading {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(320%); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-40%); opacity: 0.2; }
            50% { opacity: 0.6; }
            100% { transform: translateX(40%); opacity: 0.2; }
          }
          .shimmer-overlay {
            background-image: linear-gradient(
              90deg,
              rgba(255,255,255,0.02) 0%,
              rgba(255,255,255,0.08) 50%,
              rgba(255,255,255,0.02) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Hero Section */}
      <div className="relative h-100 overflow-hidden">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-linear-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#0a0a0a]">
          {/* Placeholder for background image - user can replace with actual image */}
          <div className="absolute inset-0 bg-cover opacity-120" style={{
            backgroundImage: 'url("/NextflowBG.png")',
            backgroundPosition: 'center 30%',
          }} />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Hero Content */}
        <div className="relative h-full flex flex-col justify-center items-start px-12 max-w-6xl mx-auto">
          {/* Icon and Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-10">
              <NodeEditorHeroIcon />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Node Editor</h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg text-gray-300 max-w-2xl mb-8 leading-relaxed font-light">
            Nodes is the most powerful way to operate Krea. Connect every tool and model into complex automated pipelines.
          </p>

          {/* CTA Button */}
          <button
            type="button"
            onClick={() => void handleCreateWorkflow()}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 active:scale-95 shadow-lg"
          >
            New Workflow
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

       {/* Main Content Area with proper spacing */}
      <div className="px-10 mt-7">
        {/* Top Bar: Tabs and Search */}
        <div className="flex items-center justify-between gap-8 py-6">
          {/* Tab Navigation - Pill Style */}
          <div className="flex items-center gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-3 rounded-md font-medium text-sm group cursor-pointer transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#2a2a2a] text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors w-64"
              />
            </div>

            {/* Filter Dropdown */}
            <button className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white hover:border-gray-500 transition-colors flex items-center gap-2">
              Last viewed
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Settings Icon */}
            <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors group cursor-pointer">
              <Settings2 size={18} className="text-gray-500 hover:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Divider Line */}
        <div className="h-px bg-[#333333] mb-8" />

        {/* Workflow Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          {/* New Workflow Card */}
          <NewWorkflowCard />
          {workflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onRename={handleRenameWorkflow}
              onDuplicate={handleDuplicateWorkflow}
              onDelete={handleDeleteWorkflow}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
