import { CSSProperties, FC, ReactNode } from 'react';

export interface TopBtnProps {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}

export const TopBtn: FC<TopBtnProps> = ({ children, style, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1d1d1d',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 10,
      cursor: 'pointer',
      color: 'rgba(255,255,255,0.82)',
      fontSize: 14,
      fontWeight: 400,
      letterSpacing: '0.01em',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      height: 36,
      padding: '0 12px',
      gap: 7,
      ...style,
    }}
  >
    {children}
  </button>
);

export interface ToolBtnProps {
  children: ReactNode;
  highlighted: boolean;
  onClick: () => void;
  onHoverChange: (isHovered: boolean) => void;
  tooltip?: {
    title: string;
    hint?: string;
  };
  showTooltip: boolean;
}

export const ToolBtn: FC<ToolBtnProps> = ({ children, highlighted, onClick, onHoverChange, tooltip, showTooltip }) => (
  <button
    onClick={onClick}
    style={{
      width: 46,
      height: 46,
      borderRadius: 10,
      border: 'none',
      background: highlighted ? 'rgba(255,255,255,0.14)' : 'transparent',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background 0.12s',
    }}
    onMouseEnter={() => onHoverChange(true)}
    onMouseLeave={() => onHoverChange(false)}
  >
    {showTooltip && tooltip && (
      <div style={{
        position: 'absolute',
        bottom: 58,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#f7f7f7',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 12,
        padding: '8px 10px',
        color: '#0c0c0c',
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
        zIndex: 50,
        pointerEvents: 'none',
      }}>
        <span>{tooltip.title}</span>
        {tooltip.hint && (
          <span style={{
            background: 'rgba(0,0,0,0.12)',
            color: '#0c0c0c',
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 8,
          }}>
            {tooltip.hint}
          </span>
        )}
        <span style={{
          position: 'absolute',
          left: '50%',
          bottom: -4,
          width: 8,
          height: 8,
          background: '#f7f7f7',
          borderLeft: '1px solid rgba(0,0,0,0.12)',
          borderBottom: '1px solid rgba(0,0,0,0.12)',
          transform: 'translateX(-50%) rotate(-45deg)',
        }} />
      </div>
    )}
    {children}
  </button>
);
