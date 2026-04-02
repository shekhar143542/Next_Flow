'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { BrainCircuit, Clapperboard, Crop, FileText, ImageUp, Video } from 'lucide-react';



interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
}

// Custom SVG Icons
const HomeIcon = () => (
  <Image
    src="/home.ico"
    alt=""
    width={28}
    height={28}
    className="object-contain"
    aria-hidden="true"
  />
);

const NodeEditorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Blue rounded square background */}
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#2563EB" />
    {/* Top-left node - white square */}
    <rect x="5" y="5" width="4" height="4" rx="0.5" fill="white" />
    {/* Bottom-right node - white square */}
    <rect x="15" y="15" width="4" height="4" rx="0.5" fill="white" />
    {/* Connection lines */}
    <line x1="9" y1="7" x2="15" y2="17" stroke="white" strokeWidth="1" />
    <line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="1" />
  </svg>
);

const SidebarToggleIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="1" y="2" width="16" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
    {collapsed ? (
      <>
        <rect x="3.5" y="4.5" width="3" height="9" rx="1.2" fill="currentColor" opacity="0.35" />
        <line x1="8" y1="4" x2="8" y2="14" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
      </>
    ) : (
      <>
        <rect x="3.5" y="4.5" width="3" height="9" rx="1.2" fill="currentColor" />
        <line x1="8" y1="4" x2="8" y2="14" stroke="currentColor" strokeWidth="1.2" opacity="0.9" />
      </>
    )}
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname() || '/';
  const isWorkflowRoute = pathname === '/workflow' || pathname.startsWith('/workflow/');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    setIsCollapsed(isWorkflowRoute);
  }, [isWorkflowRoute]);

  const displayName = user?.fullName || user?.username || 'User';
  const displayEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || '';

  const isHomeActive = pathname === '/home' || pathname.startsWith('/home/');
  const isEditorActive = pathname === '/editor' || pathname.startsWith('/editor/');

  const mainNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <HomeIcon />, href: '/home', isActive: isHomeActive },
    { id: 'editor', label: 'Node Editor', icon: <NodeEditorIcon />, href: '/editor', isActive: isEditorActive },
  ];

  const quickActionItems = [
    {
      id: 'text',
      label: 'Text Node',
      icon: <FileText size={16} strokeWidth={2} className="text-sky-200" />,
      badgeClass: 'bg-sky-500/20 border border-sky-400/30',
    },
    {
      id: 'image',
      label: 'Image Node',
      icon: <ImageUp size={16} strokeWidth={2} className="text-emerald-200" />,
      badgeClass: 'bg-emerald-500/20 border border-emerald-400/30',
    },
    {
      id: 'video',
      label: 'Video Node',
      icon: <Video size={16} strokeWidth={2} className="text-violet-200" />,
      badgeClass: 'bg-violet-500/20 border border-violet-400/30',
    },
    {
      id: 'llm',
      label: 'LLM Node',
      icon: <BrainCircuit size={16} strokeWidth={2} className="text-amber-200" />,
      badgeClass: 'bg-amber-500/20 border border-amber-400/30',
    },
    {
      id: 'crop',
      label: 'Crop Image Node',
      icon: <Crop size={16} strokeWidth={2} className="text-cyan-200" />,
      badgeClass: 'bg-cyan-500/20 border border-cyan-400/30',
    },
    {
      id: 'frame',
      label: 'Frame Extractor',
      icon: <Clapperboard size={16} strokeWidth={2} className="text-rose-200" />,
      badgeClass: 'bg-rose-500/20 border border-rose-400/30',
    },
  ];

  const handleQuickAction = (nodeType: string) => {
    if (!isWorkflowRoute) return;
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('workflow:add-node', { detail: { type: nodeType } }));
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#0f0f0f] z-40 transition-all duration-300 ease-out ${
          isCollapsed ? 'w-20' : 'w-[16rem]'
        }`}
        style={{ fontFamily: '"Inter", sans-serif' }}
      >
        <div className="flex flex-col h-full">
          {/* Header with Collapse Button */}
          <div className="p-4 flex items-center">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-[#111111] text-white hover:bg-[#1a1a1a] transition-colors duration-200 cursor-pointer"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <SidebarToggleIcon collapsed={isCollapsed} />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="p-3 space-y-2">
            {mainNavItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`flex h-10 items-center gap-3 px-4 rounded-lg transition-all duration-200 ${
                  item.isActive
                    ? 'bg-[#2a2a2a] text-white'
                    : 'text-[#b3b3b3] hover:bg-[#1a1a1a] hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <div className="w-7 h-7 shrink-0 flex items-center justify-center">{item.icon}</div>
                {!isCollapsed && <span className="text-[14px] font-medium tracking-[-0.01em]">{item.label}</span>}
              </a>
            ))}
          </nav>

          {/* Quick Actions Section */}
          <div className={`px-3 py-3 flex-1 min-h-0 overflow-y-auto ${isCollapsed ? '' : 'border-t border-[#1a1a1a]'}`}>
            {!isCollapsed && (
              <h3 className="px-4 text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
                Quick Actions
              </h3>
            )}
            <div className={`space-y-1.5 ${isCollapsed ? 'flex flex-col items-center gap-1.5' : ''}`}>
              {quickActionItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleQuickAction(item.id)}
                  className={`flex items-center gap-3 rounded-lg transition-all duration-200 text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] group ${
                    isCollapsed ? 'h-10 w-10 justify-center' : 'h-10 w-full px-4'
                  } cursor-pointer`}
                  title={item.label}
                >
                  <div className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center transition-all duration-200 ${item.badgeClass}`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && <span className="text-[14px] font-medium tracking-[-0.01em]">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Sessions Section */}
          <div className={`p-3 space-y-2.5 ${isCollapsed ? '' : 'border-t border-[#1a1a1a]'}`}>
            {!isCollapsed && (
              <>
                <h3 className="px-4 text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Sessions
                </h3>

                {/* Credits Card */}
                <div className="px-4 py-3 bg-[#1a1a1a] rounded-lg hover:bg-[#252525] transition-colors duration-200 cursor-pointer">
                  <p className="text-white text-sm font-medium">Earn 3,000 Credits</p>
                </div>

                {/* Upgrade Button */}
                <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all duration-200 active:scale-95 cursor-pointer">
                  Upgrade
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#1a1a1a] transition-all duration-200">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'w-8 h-8',
                        userButtonTrigger: 'focus:shadow-none',
                      },
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[14px] font-medium tracking-[-0.01em] truncate">
                      {isLoaded ? displayName : 'Loading...'}
                    </p>
                    <p className="text-[#666666] text-xs truncate">
                      {isLoaded ? displayEmail || 'No email available' : ''}
                    </p>
                  </div>
                </div>
              </>
            )}

            {isCollapsed && (
              <div className="flex flex-col items-center gap-2">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8',
                      userButtonTrigger: 'focus:shadow-none',
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Offset */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-[16rem]'}`}>
        {/* Content goes here */}
      </div>
    </>
  );
}
