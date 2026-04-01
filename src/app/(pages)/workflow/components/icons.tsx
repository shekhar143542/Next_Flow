import { FC } from 'react';

export const Logo: FC = () => (
  <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" />
    <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" opacity="0.45" />
    <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" opacity="0.45" />
    <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" opacity="0.2" />
  </svg>
);

export const ChevronDown: FC = () => (
  <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Moon: FC = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
    <path
      d="M13.5 9.8A5.8 5.8 0 016.2 2.5a5.8 5.8 0 100 11.6 5.8 5.8 0 007.3-4.3z"
      fill="white"
    />
  </svg>
);

export const Diamond: FC = () => (
  <svg width="18" height="18" viewBox="0 0 15 15" fill="none">
    <path d="M4.5 2h6l2.5 3.5H2L4.5 2z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.15" strokeLinejoin="round" />
    <path d="M2 5.5L7.5 13.5L13 5.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.15" strokeLinejoin="round" />
  </svg>
);

export const Wrench: FC = () => (
  <svg width="18" height="18" viewBox="0 0 15 15" fill="none">
    <path
      d="M9 2a3.5 3.5 0 00-3.3 4.6L2 10.5A1.3 1.3 0 103.8 12.4l3.7-3.7A3.5 3.5 0 0013 5a3.5 3.5 0 00-.5-1.8L10.8 5l-.1.1a1 1 0 01-1.4-1.4L11.8 2A3.5 3.5 0 009 2z"
      stroke="rgba(255,255,255,0.88)"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const ExportIcon: FC = () => (
  <svg width="20" height="20" viewBox="0 0 17 17" fill="none">
    <rect x="4.5" y="1.5" width="11" height="11" rx="2.2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.25" fill="none" />
    <rect x="1.5" y="4.5" width="11" height="11" rx="2.2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.25" fill="#1e1e1e" />
    <path d="M3 13.5l2.5-3 2 2.5 1.5-2 2 2.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="4.8" cy="8.2" r="0.9" fill="rgba(255,255,255,0.8)" />
  </svg>
);

export const ChevronDownSm: FC = () => (
  <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
    <path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Undo: FC = () => (
  <svg width="22" height="22" viewBox="0 0 17 17" fill="none">
    <path d="M3.5 7H11a3.5 3.5 0 010 7H7" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 4.5L3.5 7 6 9.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Redo: FC = () => (
  <svg width="22" height="22" viewBox="0 0 17 17" fill="none">
    <path d="M13.5 7H6a3.5 3.5 0 000 7h4" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 4.5L13.5 7 11 9.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CmdKey: FC = () => (
  <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
    <path
      d="M4.5 4.5V3a1.5 1.5 0 10-1.5 1.5h1.5zm0 0h5m0 0V3a1.5 1.5 0 111.5 1.5H9.5zm0 0v5m0 0h1.5a1.5 1.5 0 11-1.5 1.5V9.5zm0 0h-5m0 0v1.5a1.5 1.5 0 11-1.5-1.5H4.5zm0 0v-5"
      stroke="rgba(255,255,255,0.75)"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PlusIcon: FC = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
    <path d="M8 2.5v11M2.5 8h11" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const CursorIcon: FC = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
    <path d="M3.5 2L13 8.5l-5 1.2L5.5 14.5 3.5 2z" fill="white" strokeWidth="0.3" strokeLinejoin="round" />
  </svg>
);

export const HandIcon: FC = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
    <path d="M6 6.5V4a1 1 0 012 0v2.5M8 6.5V3.2a1 1 0 012 0v3.3M10 6.5V5a1 1 0 012 0v4.5a4 4 0 01-4 4 4 4 0 01-4-4V8a1 1 0 012 0v1M6 6.5V5a1 1 0 00-2 0v3"
      stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ScissorsIcon: FC = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
    <circle cx="4.5" cy="4.5" r="2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
    <circle cx="4.5" cy="11.5" r="2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
    <path d="M6.2 5.8L13.5 12M6.2 10.2L13.5 4" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const ConnectIcon: FC = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
    <circle cx="3.5" cy="8" r="2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
    <circle cx="12.5" cy="3.5" r="2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
    <circle cx="12.5" cy="12.5" r="2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
    <path d="M5.5 8h2.5l2-4M8 8l2 4" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const GridIcon: FC = () => (
  <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
    <path d="M2 6.5h14M2 11.5h14M6.5 2v14M11.5 2v14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
  </svg>
);

export const TextCursorIcon: FC = () => (
  <svg width="10" height="15" viewBox="0 0 14 18" fill="none">
    <rect x="0" y="0" width="14" height="2.5" rx="1.25" fill="#f0a500" />
    <rect x="5.5" y="2.5" width="3" height="13" rx="1.25" fill="#f0a500" />
    <rect x="0" y="15.5" width="14" height="2.5" rx="1.25" fill="#f0a500" />
  </svg>
);

export const PencilIcon: FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const CopyIcon: FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const ImageBadgeIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="3" stroke="#2f92ff" strokeWidth="1.6" />
    <circle cx="9" cy="10" r="2" fill="#2f92ff" />
    <path d="M5 18l5-5 4 4 3-3 2 4" stroke="#2f92ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const VideoBadgeIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="14" height="14" rx="3" fill="#1eea6a" stroke="#1eea6a" strokeWidth="1.6" />
    <path d="M17 9l4-2v10l-4-2z" fill="#1eea6a" stroke="#1eea6a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FrameBadgeIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="3" stroke="#2f92ff" strokeWidth="1.6" />
    <rect x="8" y="9" width="8" height="6" rx="1.5" fill="#2f92ff" />
  </svg>
);

export const LlmBadgeIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 4l1.7 4.1L18 10l-4.3 1.9L12 16l-1.7-4.1L6 10l4.3-1.9L12 4z"
      fill="#f3a855"
    />
  </svg>
);

export const UploadIcon: FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
