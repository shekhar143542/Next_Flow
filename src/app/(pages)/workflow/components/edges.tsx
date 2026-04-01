'use client';

import { FC, useState } from 'react';
import {
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from 'reactflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export const RemovableEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}) => {
  const { setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const activeEdgeId = useWorkflowStore((state) => state.executionState.activeEdgeId);
  const isActive = activeEdgeId === id;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const strokeColor = (style?.stroke as string) ?? 'rgba(255,255,255,0.55)';
  const animatedStyle = isActive
    ? {
      strokeDasharray: '6 6',
      strokeDashoffset: 12,
      animation: 'edge-flow 1s linear infinite',
      filter: `drop-shadow(0 0 6px ${strokeColor})`,
    }
    : {};

  return (
    <>
      <style>{`
        @keyframes edge-flow {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      <path
        d={edgePath}
        style={{ ...style, stroke: strokeColor, ...animatedStyle }}
        className="react-flow__edge-path"
        markerEnd={markerEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.12s ease',
            zIndex: 5,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setEdges((edges) => edges.filter((edge) => edge.id !== id));
            }}
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              border: `1px solid ${strokeColor}`,
              background: '#141414',
              color: strokeColor,
              fontSize: 12,
              lineHeight: '16px',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label="Remove connection"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export const edgeTypes = {
  removable: RemovableEdge,
};

export const getNodeWireColor = (nodeType?: string) => {
  switch (nodeType) {
    case 'text':
      return '#f0a500';
    case 'image':
      return '#2f92ff';
    case 'video':
      return '#1eea6a';
    case 'frame':
      return '#2f92ff';
    case 'llm':
      return '#f3a855';
    case 'crop':
      return '#58d0ff';
    default:
      return 'rgba(255,255,255,0.55)';
  }
};
