'use client';

import {
  CSSProperties,
  ChangeEvent,
  FC,
  MouseEvent as ReactMouseEvent,
  TouchEvent,
  WheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Handle, NodeProps, Position, useEdges, useNodes } from 'reactflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import type { WorkflowNodeData } from '@/store/useWorkflowStore';
import {
  CopyIcon,
  FrameBadgeIcon,
  ImageBadgeIcon,
  LlmBadgeIcon,
  PencilIcon,
  TextCursorIcon,
  VideoBadgeIcon,
  UploadIcon,
} from './icons';
import { getNodeWireColor } from './edges';

type RunWorkflowButtonProps = {
  isVisible: boolean;
};

const RunWorkflowButton: FC<RunWorkflowButtonProps> = ({ isVisible }) => {
  const workflowId = useWorkflowStore((state) => state.workflowId);
  const [isRunning, setIsRunning] = useState(false);

  const handleClick = useCallback(async (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!workflowId || isRunning) return;
    setIsRunning(true);
    try {
      await fetch('/api/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId }),
      });
    } catch (error) {
      console.error('Failed to trigger workflow job:', error);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, workflowId]);

  if (!isVisible || !workflowId) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      style={{
        position: 'absolute',
        top: 6,
        right: 6,
        zIndex: 3,
        background: '#101217',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#f3f4f8',
        fontSize: 11,
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: 999,
        cursor: isRunning ? 'progress' : 'pointer',
        boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
        transition: 'transform 0.12s, background 0.12s, border-color 0.12s',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = 'translateY(-1px)';
        event.currentTarget.style.background = '#161a21';
        event.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = 'translateY(0)';
        event.currentTarget.style.background = '#101217';
        event.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
      }}
      aria-label="Run workflow"
    >
      {isRunning ? 'Running' : 'Run'}
    </button>
  );
};

/* ─────────────────────────── Text Node (custom design) ─────────────────────────── */

const TextNode: FC<NodeProps<WorkflowNodeData>> = ({ id, data, selected, isConnectable }) => {
  const [title, setTitle] = useState('Text');
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaWrapperRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setNodes = useWorkflowStore((state) => state.setNodes);
  const edges = useEdges();
  const nodes = useNodes<WorkflowNodeData>();
  const textValue = data?.text ?? '';
  const { hasTextParent, parentText } = useMemo(() => {
    for (const edge of edges) {
      if (edge.target !== id) continue;
      const sourceNode = nodes.find((node) => node.id === edge.source);
      if (sourceNode?.type !== 'text') continue;
      return {
        hasTextParent: true,
        parentText: sourceNode?.data?.text ?? '',
      };
    }
    return { hasTextParent: false, parentText: '' };
  }, [edges, nodes, id]);
  const displayText = hasTextParent ? parentText : textValue;
  const isConnected = useMemo(() => (
    edges.some((edge) => edge.source === id || edge.target === id)
  ), [edges, id]);

  const handleCopy = useCallback(() => {
    if (!displayText.trim()) return;
    navigator.clipboard.writeText(displayText).then(() => {
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
    });
  }, [displayText]);

  const handleEdit = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  // prevent ReactFlow drag when interacting with textarea
  const stopPropagation = useCallback((e: ReactMouseEvent | TouchEvent) => {
    e.stopPropagation();
  }, []);

  const stopWheelPropagation = useCallback((event: WheelEvent) => {
    event.stopPropagation();
  }, []);

  const handleTextChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    if (hasTextParent) return;
    const value = event.target.value;
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...(node.data ?? {}), text: value } }
          : node,
      ),
    );
  }, [hasTextParent, id, setNodes]);

  return (
    <div
      style={{
        width: 190,
        background: '#151515',
        borderRadius: 14,
        border: selected
          ? '2px solid rgba(240,165,0,0.9)'
          : '1px solid #2a2d38',
        boxShadow: selected
          ? '0 0 0 2px rgba(240,165,0,0.12), 0 8px 32px rgba(0,0,0,0.5)'
          : '0 8px 32px rgba(0,0,0,0.5)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        userSelect: 'none',
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RunWorkflowButton isVisible={isHovered && isConnected} />
      <style>{`
        .text-node-textarea::-webkit-scrollbar {
          width: 6px;
        }
        .text-node-textarea::-webkit-scrollbar-thumb {
          background-color: rgba(122,125,140,0.7);
          border-radius: 999px;
        }
        .text-node-textarea::-webkit-scrollbar-track {
          background: rgba(120,120,120,0.4);
          border-radius: 999px;
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: -20,
          left: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: 0,
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          boxShadow: 'none',
          zIndex: 2,
        }}
        onMouseDown={stopPropagation}
        onTouchStart={stopPropagation}
      >
        <TextCursorIcon />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Text"
          style={{
            width: 84,
            background: 'transparent',
            border: 'none',
            color: '#c8cad4',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.01em',
            outline: 'none',
          }}
        />
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '4px 9px 8px 9px' }}>
        {/* Port labels row — handles are positioned at node edges by ReactFlow */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#7a7d8c', letterSpacing: '0.01em', textTransform: 'none' }}>
            Input
          </span>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#7a7d8c', letterSpacing: '0.01em', textTransform: 'none' }}>
            Output
          </span>
        </div>

        {/* Action buttons row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <button
            onClick={handleEdit}
            title="Edit"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#55586a',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#a0a3b5'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#55586a'; }}
          >
            <PencilIcon />
          </button>

          <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copied ? '#f0a500' : '#55586a',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = '#a0a3b5'; }}
            onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = '#55586a'; }}
          >
            <CopyIcon />
          </button>
        </div>

        {/* Textarea */}
        <div
          ref={textareaWrapperRef}
          style={{
            position: 'relative',
            background: '#0b0b0b',
            border: '1px solid #23262f',
            borderRadius: 8,
            overflow: 'hidden',
            transition: 'border-color 0.18s',
            boxSizing: 'border-box',
          }}
          onMouseDown={stopPropagation}
          onWheel={stopWheelPropagation}
          onWheelCapture={stopWheelPropagation}
        >
          <textarea
            ref={textareaRef}
            className="text-node-textarea"
            value={displayText}
            onChange={handleTextChange}
            placeholder="Write something..."
            readOnly={hasTextParent}
            rows={4}
            onWheel={stopWheelPropagation}
            style={{
              width: '100%',
              minHeight: 62,
              background: 'transparent',
              border: 'none',
              color: hasTextParent ? 'rgba(200,200,200,0.35)' : '#c8cad4',
              fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
              fontSize: 11,
              lineHeight: 1.55,
              padding: '8px 10px',
              resize: 'vertical',
              outline: 'none',
              caretColor: hasTextParent ? 'transparent' : '#f0a500',
              textShadow: hasTextParent ? '0 0 6px rgba(0,0,0,0.6)' : 'none',
              boxSizing: 'border-box',
              position: 'relative',
              zIndex: 1,
              scrollbarWidth: 'thin',
              scrollbarColor: '#6a6d7a transparent',
            }}
            onFocus={(e) => {
              if (textareaWrapperRef.current) {
                textareaWrapperRef.current.style.borderColor = 'rgba(240,165,0,0.4)';
              }
            }}
            onBlur={(e) => {
              if (textareaWrapperRef.current) {
                textareaWrapperRef.current.style.borderColor = '#23262f';
              }
            }}
          />
          {/* Char count */}
          <span style={{
            position: 'absolute',
            bottom: 6,
            right: 8,
            fontSize: 9,
            color: displayText.length > 0 ? '#6a6d7a' : '#3a3d4d',
            fontFamily: 'monospace',
            pointerEvents: 'none',
            transition: 'color 0.2s',
            zIndex: 2,
          }}>
            {displayText.length}
          </span>
        </div>
      </div>

      {/* ── ReactFlow Handles ── */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: '#f0a500',
          border: '2px solid #1a1d24',
          borderRadius: '50%',
          boxShadow: '0 0 0 1.5px #f0a500',
          left: -6,
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: '#f0a500',
          border: '2px solid #1a1d24',
          borderRadius: '50%',
          boxShadow: '0 0 0 1.5px #f0a500',
          left: -6,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: '#f0a500',
          border: '2px solid #1a1d24',
          borderRadius: '50%',
          boxShadow: '0 0 0 1.5px #f0a500',
          right: -6,
        }}
      />
    </div>
  );
};

/* ─────────────────────────── Other node shells (unchanged) ─────────────────────────── */

const handleStyle: CSSProperties = {
  width: 10,
  height: 10,
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(0,0,0,0.5)',
  borderRadius: 999,
};

const nodeShellStyle: CSSProperties = {
  position: 'relative',
  width: 220,
  height: 84,
  background: '#1d1d1d',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 14px',
  color: 'rgba(255,255,255,0.88)',
  fontSize: 14,
  fontWeight: 500,
  userSelect: 'none',
};

const WorkflowNodeShell: FC<NodeProps<WorkflowNodeData>> = ({ data, selected, isConnectable }) => {
  const selectionColor = getNodeWireColor(data?.kind);
  return (
    <div
      style={{
        ...nodeShellStyle,
        border: selected ? `2px solid ${selectionColor}` : '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={handleStyle} />
      <span>{data?.label ?? 'Untitled node'}</span>
      <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12 }}>{data?.kind ?? 'node'}</span>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={handleStyle} />
    </div>
  );
};

const ImageNode: FC<NodeProps<WorkflowNodeData>> = ({ id, data, selected, isConnectable }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setNodes = useWorkflowStore((state) => state.setNodes);
  const [title, setTitle] = useState(() => (data?.label || 'Image').replace(' Node', ''));
  const [isHovered, setIsHovered] = useState(false);
  const edges = useEdges();
  const hasIncoming = useMemo(() => edges.some((edge) => edge.target === id), [edges, id]);
  const isConnected = useMemo(() => (
    edges.some((edge) => edge.source === id || edge.target === id)
  ), [edges, id]);
  const imagePreview = data?.imageUrl || data?.imagePreviewUrl || data?.image || '';

  const stopPropagation = useCallback((e: ReactMouseEvent | TouchEvent) => {
    e.stopPropagation();
  }, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const updateNodeData = useCallback((patch: Partial<WorkflowNodeData>) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...(node.data ?? {}), ...patch } }
          : node,
      ),
    );
  }, [id, setNodes]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;
      updateNodeData({
        image: result,
        imageUrl: result,
        imagePreviewUrl: result,
      });
    };
    reader.onerror = () => {
      console.error('Failed to read image file');
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  }, [updateNodeData]);

  return (
    <div
      style={{
        width: 190,
        minHeight: 120,
        background: '#151515',
        borderRadius: 16,
        border: selected
          ? '2px solid rgba(47,146,255,0.9)'
          : '1px solid #2a2d38',
        boxShadow: selected
          ? '0 0 0 2px rgba(47,146,255,0.18), 0 8px 32px rgba(0,0,0,0.5)'
          : '0 8px 32px rgba(0,0,0,0.5)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        userSelect: 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '14px 16px',
      }}
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RunWorkflowButton isVisible={isHovered && isConnected} />
      <style>{`
        @keyframes image-receiving-sweep {
          0% { background-position: 180% 0; }
          100% { background-position: -180% 0; }
        }
      `}</style>
      <div style={{
        position: 'absolute',
        top: -24,
        left: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#9aa3ad',
        fontSize: 12,
        fontWeight: 500,
      }}>
        <ImageBadgeIcon />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Image"
          style={{
            width: 120,
            background: 'transparent',
            border: 'none',
            color: '#9aa3ad',
            fontSize: 12,
            fontWeight: 500,
            outline: 'none',
          }}
          onMouseDown={stopPropagation}
          onTouchStart={stopPropagation}
        />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {hasIncoming && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.02em',
              color: 'transparent',
              backgroundImage: 'linear-gradient(90deg, rgba(180,180,180,0.25), rgba(220,220,220,0.85), rgba(180,180,180,0.25))',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              animation: 'image-receiving-sweep 4.5s linear infinite',
            }}>
              Receiving input
            </span>
          </div>
        )}
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Uploaded"
            style={{
              width: '100%',
              height: 84,
              objectFit: 'cover',
              borderRadius: 10,
            }}
            draggable={false}
          />
        ) : !hasIncoming ? (
          <button
            type="button"
            onClick={handleUploadClick}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7c828a',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              fontWeight: 500,
              padding: '10px 14px',
              borderRadius: 12,
              transition: 'background 0.18s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <UploadIcon />
            <span>Upload Image</span>
          </button>
        ) : null}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: '#2f92ff',
          border: '2px solid #151515',
          borderRadius: '50%',
          boxShadow: '0 0 0 1.5px rgba(47,146,255,0.9)',
          left: -6,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: '#2f92ff',
          border: '2px solid #151515',
          borderRadius: '50%',
          boxShadow: '0 0 0 1.5px rgba(47,146,255,0.9)',
          right: -6,
        }}
      />
    </div>
  );
};

const VideoNode: FC<NodeProps<WorkflowNodeData>> = ({ id, data, selected, isConnectable }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(() => (data?.label || 'Video').replace(' Node', ''));
  const [isHovered, setIsHovered] = useState(false);
  const edges = useEdges();
  const hasIncoming = useMemo(() => edges.some((edge) => edge.target === id), [edges, id]);
  const isConnected = useMemo(() => (
    edges.some((edge) => edge.source === id || edge.target === id)
  ), [edges, id]);

  const stopPropagation = useCallback((e: ReactMouseEvent | TouchEvent) => {
    e.stopPropagation();
  }, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      style={{
        width: 200,
        minHeight: 120,
        background: '#151515',
        borderRadius: 16,
        border: selected
          ? '2px solid rgba(30,234,106,0.9)'
          : '1px solid #2a2d38',
        boxShadow: selected
          ? '0 0 0 2px rgba(30,234,106,0.2), 0 8px 32px rgba(0,0,0,0.5)'
          : '0 8px 32px rgba(0,0,0,0.5)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        userSelect: 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '14px 16px',
      }}
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RunWorkflowButton isVisible={isHovered && isConnected} />
      <style>{`
        @keyframes video-receiving-sweep {
          0% { background-position: 180% 0; }
          100% { background-position: -180% 0; }
        }
      `}</style>
      <div style={{
        position: 'absolute',
        top: -24,
        left: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#9aa3ad',
        fontSize: 12,
        fontWeight: 500,
      }}>
        <VideoBadgeIcon />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Video"
          style={{
            width: 120,
            background: 'transparent',
            border: 'none',
            color: '#9aa3ad',
            fontSize: 12,
            fontWeight: 500,
            outline: 'none',
          }}
          onMouseDown={stopPropagation}
          onTouchStart={stopPropagation}
        />
      </div>

      {hasIncoming && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.02em',
            color: 'transparent',
            backgroundImage: 'linear-gradient(90deg, rgba(180,180,180,0.25), rgba(220,220,220,0.85), rgba(180,180,180,0.25))',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            animation: 'video-receiving-sweep 4.5s linear infinite',
          }}>
            Receiving input
          </span>
        </div>
      )}

      {!hasIncoming && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <button
            type="button"
            onClick={handleUploadClick}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7c828a',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              fontWeight: 500,
              padding: '10px 14px',
              borderRadius: 12,
              transition: 'background 0.18s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <UploadIcon />
            <span>Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
          />
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: '#1eea6a',
          border: '2px solid #151515',
          borderRadius: '50%',
          boxShadow: '0 0 0 1.5px rgba(30,234,106,0.9)',
          left: -6,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: '#1eea6a',
          border: '2px solid #151515',
          borderRadius: '50%',
          boxShadow: '0 0 0 1.5px rgba(30,234,106,0.9)',
          right: -6,
        }}
      />
    </div>
  );
};
const FrameExtractorNode: FC<NodeProps<WorkflowNodeData>> = ({ id, data, selected, isConnectable }) => {
  const setNodes = useWorkflowStore((state) => state.setNodes);
  const edges = useEdges();
  const nodes = useNodes<WorkflowNodeData>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [duration, setDuration] = useState(0);
  const [frameTime, setFrameTime] = useState(() => data?.frameTime ?? 0);
  const extractedFrame = data?.extractedFrame ?? '';
  const frameAccent = '#2f92ff';
  const inputAccent = '#1eea6a';
  const isConnected = useMemo(() => (
    edges.some((edge) => edge.source === id || edge.target === id)
  ), [edges, id]);

  const stopPropagation = useCallback((e: ReactMouseEvent | TouchEvent) => {
    e.stopPropagation();
  }, []);

  const stopWheelPropagation = useCallback((event: WheelEvent) => {
    event.stopPropagation();
  }, []);

  const updateNodeData = useCallback((patch: Partial<WorkflowNodeData>) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...(node.data ?? {}), ...patch } }
          : node,
      ),
    );
  }, [id, setNodes]);

  const { inputVideoUrl, hasVideoInput } = useMemo(() => {
    const incomingEdges = edges.filter((edge) => edge.target === id);
    let previewUrl = '';
    let hasInput = false;

    for (const edge of incomingEdges) {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      if (!sourceNode) continue;

      if (sourceNode.type === 'video') {
        hasInput = true;
        previewUrl = previewUrl
          || sourceNode.data?.videoUrl
          || sourceNode.data?.videoPreviewUrl
          || '';
        continue;
      }
    }

    return { inputVideoUrl: previewUrl, hasVideoInput: hasInput };
  }, [edges, nodes, id]);

  useEffect(() => {
    if (typeof data?.frameTime === 'number') {
      setFrameTime(data.frameTime);
    }
  }, [data?.frameTime]);

  const handleTimeChange = useCallback((nextValue: number) => {
    const safeValue = Number.isFinite(nextValue) ? nextValue : 0;
    const clamped = duration ? Math.min(Math.max(safeValue, 0), duration) : Math.max(safeValue, 0);
    setFrameTime(clamped);
    updateNodeData({ frameTime: clamped });
  }, [duration, updateNodeData]);

  const handleSliderChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    handleTimeChange(parseFloat(event.target.value));
  }, [handleTimeChange]);

  const handleTimeInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === '' ? 0 : parseFloat(event.target.value);
    handleTimeChange(value);
  }, [handleTimeChange]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) {
      setDuration(0);
      return;
    }
    setDuration(video.duration);
    if (frameTime > video.duration) {
      handleTimeChange(video.duration);
    }
  }, [frameTime, handleTimeChange]);

  const handleExtractFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!inputVideoUrl) {
      const width = 320;
      const height = 180;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#1b2430');
      gradient.addColorStop(1, '#0b0b0b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#2f92ff';
      ctx.fillRect(0, height - 6, width, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '12px "SF Pro Text", Segoe UI, sans-serif';
      ctx.fillText(`Frame @ ${frameTime.toFixed(1)}s`, 12, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText('No video preview available', 12, 44);
      updateNodeData({ extractedFrame: canvas.toDataURL('image/png') });
      return;
    }

    if (!video) return;

    if (video.readyState < 2) {
      await new Promise<void>((resolve) => {
        const onLoaded = () => resolve();
        video.addEventListener('loadeddata', onLoaded, { once: true });
      });
    }

    const targetTime = duration ? Math.min(frameTime, duration) : frameTime;
    const shouldSeek = Number.isFinite(targetTime) && Math.abs(video.currentTime - targetTime) > 0.05;

    if (shouldSeek) {
      await new Promise<void>((resolve) => {
        const onSeeked = () => resolve();
        video.addEventListener('seeked', onSeeked, { once: true });
        video.currentTime = targetTime;
      });
    }

    const width = video.videoWidth || 320;
    const height = video.videoHeight || 180;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    updateNodeData({ extractedFrame: canvas.toDataURL('image/png') });
  }, [duration, frameTime, inputVideoUrl, updateNodeData]);

  return (
    <div
      style={{
        width: 250,
        minHeight: 340,
        background: '#151515',
        borderRadius: 16,
        border: selected
          ? `2px solid ${frameAccent}`
          : '1px solid #2a2d38',
        boxShadow: selected
          ? '0 0 0 2px rgba(47,146,255,0.18), 0 8px 32px rgba(0,0,0,0.5)'
          : '0 8px 32px rgba(0,0,0,0.5)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        userSelect: 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '18px 16px 16px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RunWorkflowButton isVisible={isHovered && isConnected} />
      <style>{`
        .frame-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 999px;
          background: linear-gradient(90deg, #1eea6a 0%, #2f92ff 100%);
          outline: none;
          opacity: 0.9;
        }
        .frame-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f2f4f8;
          border: 2px solid #2f92ff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          cursor: pointer;
        }
        .frame-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f2f4f8;
          border: 2px solid #2f92ff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          cursor: pointer;
        }
        .frame-slider::-moz-range-track {
          height: 6px;
          border-radius: 999px;
          background: linear-gradient(90deg, #1eea6a 0%, #2f92ff 100%);
        }
        .frame-time-input {
          background: #0b0b0b;
          border: 1px solid #23262f;
          border-radius: 8px;
          color: #c8cad4;
          font-size: 11px;
          padding: 4px 6px;
          outline: none;
        }
        .frame-time-input:focus {
          border-color: rgba(47,146,255,0.55);
        }
      `}</style>
      <div style={{
        position: 'absolute',
        top: -24,
        left: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#9aa3ad',
        fontSize: 12,
        fontWeight: 500,
      }}>
        <FrameBadgeIcon />
        <span>Frame Extractor</span>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 500, color: '#7a7d8c', marginBottom: 6 }}>
          Input Video
        </div>
        <div
          style={{
            height: 80,
            borderRadius: 10,
            border: '1px solid #23262f',
            background: '#0b0b0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5b5f6d',
            fontSize: 11,
            overflow: 'hidden',
          }}
          onWheel={stopWheelPropagation}
        >
          {hasVideoInput ? (
            inputVideoUrl ? (
              <video
                ref={videoRef}
                src={inputVideoUrl}
                controls
                muted
                playsInline
                crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onLoadedMetadata={handleLoadedMetadata}
                className="nodrag"
                onPointerDown={stopPropagation}
              />
            ) : (
              <span>Video connected</span>
            )
          ) : (
            <span>No video connected</span>
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 500, color: '#7a7d8c', marginBottom: 6 }}>
          Frame Selection
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            className="nodrag frame-slider"
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={frameTime}
            onChange={handleSliderChange}
            disabled={!hasVideoInput}
            onPointerDown={stopPropagation}
            style={{ width: '100%' }}
            aria-label="Frame time selector"
            title="Select frame time"
            data-role="frame-slider"
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <input
              className="nodrag frame-time-input"
              type="number"
              min={0}
              max={duration || undefined}
              step={0.1}
              value={Number.isFinite(frameTime) ? frameTime : 0}
              onChange={handleTimeInputChange}
              disabled={!hasVideoInput}
              onPointerDown={stopPropagation}
              style={{ width: 80 }}
            />
            <span style={{ fontSize: 11, color: '#5b5f6d' }}>
              {duration > 0 ? `${frameTime.toFixed(1)}s / ${duration.toFixed(1)}s` : `${frameTime.toFixed(1)}s`}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleExtractFrame}
          onMouseDown={stopPropagation}
          disabled={!hasVideoInput}
          style={{
            flex: 1,
            background: frameAccent,
            border: 'none',
            color: '#1a1d24',
            fontSize: 12,
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: 10,
            cursor: !hasVideoInput ? 'not-allowed' : 'pointer',
            opacity: !hasVideoInput ? 0.5 : 1,
          }}
        >
          Extract Frame
        </button>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 500, color: '#7a7d8c', marginBottom: 6 }}>
          Extracted Frame
        </div>
        <div
          style={{
            height: 110,
            borderRadius: 10,
            border: '1px solid #23262f',
            background: '#0b0b0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5b5f6d',
            fontSize: 11,
            overflow: 'hidden',
          }}
          onWheel={stopWheelPropagation}
        >
          {extractedFrame ? (
            <img
              src={extractedFrame}
              alt="Extracted frame"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>No frame extracted</span>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <Handle
        id="video"
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: inputAccent,
          border: '2px solid #151515',
          borderRadius: '50%',
          boxShadow: `0 0 0 1.5px ${inputAccent}`,
          left: -6,
          top: 92,
        }}
      />
      <Handle
        id="image"
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: frameAccent,
          border: '2px solid #151515',
          borderRadius: '50%',
          boxShadow: `0 0 0 1.5px ${frameAccent}`,
          right: -6,
          top: 92,
        }}
      />
    </div>
  );
};
const LlmNode: FC<NodeProps<WorkflowNodeData>> = ({ id, data, selected, isConnectable }) => {
  const setNodes = useWorkflowStore((state) => state.setNodes);
  const graphEdges = useEdges();
  const edges = useWorkflowStore((state) => state.edges);
  const nodes = useWorkflowStore((state) => state.nodes);
  const [isHovered, setIsHovered] = useState(false);
  const systemPrompt = data?.systemPrompt ?? '';
  const userMessage = data?.userMessage ?? '';
  const output = data?.output ?? '';
  const llmAccent = '#f3a855';
  const imageAccent = '#2f92ff';
  const llmHandleOffsets = {
    text: 264,
    image: 394,
    system: 570,
  };
  const isConnected = useMemo(() => (
    graphEdges.some((edge) => edge.source === id || edge.target === id)
  ), [graphEdges, id]);

  const stopPropagation = useCallback((e: ReactMouseEvent | TouchEvent) => {
    e.stopPropagation();
  }, []);

  const stopWheelPropagation = useCallback((event: WheelEvent) => {
    event.stopPropagation();
  }, []);

  const updateNodeData = useCallback((patch: Partial<WorkflowNodeData>) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...(node.data ?? {}), ...patch } }
          : node,
      ),
    );
  }, [id, setNodes]);

  const { hasPromptInput, incomingPromptText, hasImageInput, imageUrl } = useMemo(() => {
    const incomingEdges = edges.filter((edge) => edge.target === id);
    if (incomingEdges.length === 0) {
      return {
        hasPromptInput: false,
        incomingPromptText: '',
        hasImageInput: false,
        imageUrl: '',
      };
    }

    const resolveTextDisplay = (nodeId: string) => {
      const node = nodes.find((item) => item.id === nodeId);
      if (!node || node.type !== 'text') return '';

      const parentEdge = edges.find((edge) => edge.target === nodeId);
      if (parentEdge) {
        const parentNode = nodes.find((item) => item.id === parentEdge.source);
        if (parentNode?.type === 'text') {
          return parentNode.data?.text ?? '';
        }
      }

      return node.data?.text ?? '';
    };

    const textParts: string[] = [];
    let promptInput = false;
    let imageInput = false;
    let previewUrl = '';

    for (const edge of incomingEdges) {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      if (!sourceNode) continue;

      if (sourceNode.type === 'image') {
        imageInput = true;
        previewUrl = previewUrl
          || sourceNode.data?.imageUrl
          || sourceNode.data?.imagePreviewUrl
          || '';
        continue;
      }

      if (edge.targetHandle && edge.targetHandle !== 'text') {
        continue;
      }

      if (sourceNode.type === 'text') {
        promptInput = true;
        const resolvedText = resolveTextDisplay(sourceNode.id);
        if (resolvedText) textParts.push(resolvedText);
        continue;
      }

      if (sourceNode.type === 'llm') {
        promptInput = true;
        if (sourceNode.data?.output) textParts.push(sourceNode.data.output);
        continue;
      }
    }

    return {
      hasPromptInput: promptInput,
      incomingPromptText: textParts.filter(Boolean).join('\n'),
      hasImageInput: imageInput,
      imageUrl: previewUrl,
    };
  }, [edges, nodes, id]);

  const handleSystemChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData({ systemPrompt: event.target.value });
  }, [updateNodeData]);

  const handleUserChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData({ userMessage: event.target.value });
  }, [updateNodeData]);

  const promptValue = hasPromptInput ? incomingPromptText : userMessage;

  const containerStyle = {
    width: 264,
    minHeight: 420,
    background: 'linear-gradient(180deg, #17181f 0%, #0f1116 100%)',
    borderRadius: 18,
    border: selected
      ? `2px solid ${llmAccent}`
      : '1px solid #2a2d38',
    boxShadow: selected
      ? '0 0 0 2px rgba(243,168,85,0.18), 0 10px 30px rgba(0,0,0,0.6)'
      : '0 10px 30px rgba(0,0,0,0.55)',
    fontFamily: "'Sora', 'Segoe UI', sans-serif",
    color: 'var(--llm-text)',
    userSelect: 'none',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '18px 16px 16px',
    ['--llm-text' as any]: '#e6e8ee',
    ['--llm-muted' as any]: '#9aa3ad',
    ['--llm-border' as any]: '#262a33',
    ['--llm-panel' as any]: '#0b0d12',
    ['--llm-soft' as any]: '#131722',
  } as CSSProperties;

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RunWorkflowButton isVisible={isHovered && isConnected} />
      <div style={{
        position: 'absolute',
        top: -24,
        left: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--llm-muted)',
        fontSize: 12,
        fontWeight: 600,
      }}>
        <LlmBadgeIcon />
        <span>LLM Node</span>
      </div>

      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--llm-muted)',
          marginBottom: 6,
        }}>
          Output
        </div>
        <textarea
          className="nodrag"
          value={output}
          placeholder="No output yet."
          readOnly
          rows={7}
          onWheel={stopWheelPropagation}
          onPointerDown={stopPropagation}
          style={{
            width: '100%',
            minHeight: 140,
            background: 'var(--llm-panel)',
            border: '1px solid var(--llm-border)',
            borderRadius: 12,
            color: output ? 'var(--llm-text)' : 'var(--llm-muted)',
            fontFamily: "'Sora', 'Segoe UI', sans-serif",
            fontSize: 12,
            lineHeight: 1.6,
            padding: '10px 12px',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            userSelect: 'text',
          }}
          onMouseDown={stopPropagation}
        />
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--llm-muted)', marginBottom: 6 }}>
          Prompt
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            className="nodrag"
            value={promptValue}
            onChange={handleUserChange}
            placeholder="Write a prompt..."
            readOnly={hasPromptInput}
            rows={5}
            onWheel={stopWheelPropagation}
            onPointerDown={stopPropagation}
            style={{
              width: '100%',
              minHeight: 110,
              background: 'var(--llm-panel)',
              border: '1px solid var(--llm-border)',
              borderRadius: 12,
              color: hasPromptInput ? 'rgba(200,200,200,0.35)' : 'var(--llm-text)',
              fontFamily: "'Sora', 'Segoe UI', sans-serif",
              fontSize: 12,
              lineHeight: 1.5,
              padding: '9px 10px',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              userSelect: 'text',
              caretColor: hasPromptInput ? 'transparent' : llmAccent,
              textShadow: hasPromptInput ? '0 0 6px rgba(0,0,0,0.6)' : 'none',
            }}
            onMouseDown={stopPropagation}
          />
        </div>
      </div>

      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--llm-muted)' }}>
            Image
          </span>
          <button
            type="button"
            onMouseDown={stopPropagation}
            onPointerDown={stopPropagation}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--llm-soft)',
              border: '1px solid var(--llm-border)',
              color: 'var(--llm-text)',
              fontSize: 10,
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 999,
              cursor: 'pointer',
            }}
          >
            <UploadIcon />
            <span>Add file</span>
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              height: 76,
              borderRadius: 12,
              border: '1px solid var(--llm-border)',
              background: 'var(--llm-panel)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hasImageInput ? 'var(--llm-text)' : 'var(--llm-muted)',
              fontSize: 11,
              overflow: 'hidden',
            }}
          >
            {hasImageInput ? (
              imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Connected input"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span>Image input connected</span>
              )
            ) : (
              <span>No image connected</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--llm-muted)', marginTop: 2 }}>
        Settings
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--llm-muted)' }}>
          Model
        </span>
        <div
          style={{
            background: 'var(--llm-panel)',
            border: '1px solid var(--llm-border)',
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: 11,
            color: 'var(--llm-text)',
          }}
        >
          GPT-4o Mini
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--llm-muted)', marginBottom: 6 }}>
          System Prompt
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            className="nodrag"
            value={systemPrompt}
            onChange={handleSystemChange}
            placeholder="You are a friendly and helpful assistant."
            rows={3}
            onWheel={stopWheelPropagation}
            onPointerDown={stopPropagation}
            style={{
              width: '100%',
              minHeight: 70,
              background: 'var(--llm-panel)',
              border: '1px solid var(--llm-border)',
              borderRadius: 12,
              color: 'var(--llm-text)',
              fontFamily: "'Sora', 'Segoe UI', sans-serif",
              fontSize: 12,
              lineHeight: 1.5,
              padding: '9px 10px',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              userSelect: 'text',
            }}
            onMouseDown={stopPropagation}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          type="button"
          onMouseDown={stopPropagation}
          onPointerDown={stopPropagation}
          style={{
            background: 'var(--llm-soft)',
            border: '1px solid var(--llm-border)',
            color: 'var(--llm-text)',
            fontSize: 11,
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: 999,
            cursor: 'pointer',
          }}
        >
          Presets
        </button>
      </div>

      <Handle
        id="text"
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: llmAccent,
          border: '2px solid #151515',
          borderRadius: '50%',
          boxShadow: `0 0 0 1.5px ${llmAccent}`,
          left: -6,
          top: llmHandleOffsets.text,
        }}
      />
      <Handle
        id="image"
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: imageAccent,
          border: '2px solid #151515',
          borderRadius: '50%',
          boxShadow: `0 0 0 1.5px ${imageAccent}`,
          left: -6,
          top: llmHandleOffsets.image,
        }}
      />
      <Handle
        id="system"
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: llmAccent,
          border: '2px solid #151515',
          borderRadius: '50%',
          boxShadow: `0 0 0 1.5px ${llmAccent}`,
          left: -6,
          top: llmHandleOffsets.system,
        }}
      />

    </div>
  );
};
const CropNode: FC<NodeProps<WorkflowNodeData>> = ({ id, data, selected, isConnectable }) => {
  const setNodes = useWorkflowStore((state) => state.setNodes);
  const edges = useEdges();
  const nodes = useNodes<WorkflowNodeData>();
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const croppedImage = data?.croppedImage ?? '';
  const outputImage = data?.outputImage ?? '';
  const cropAccent = '#58d0ff';
  const isConnected = useMemo(() => (
    edges.some((edge) => edge.source === id || edge.target === id)
  ), [edges, id]);

  const stopPropagation = useCallback((e: ReactMouseEvent | TouchEvent) => {
    e.stopPropagation();
  }, []);

  const stopWheelPropagation = useCallback((event: WheelEvent) => {
    event.stopPropagation();
  }, []);

  const updateNodeData = useCallback((patch: Partial<WorkflowNodeData>) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...(node.data ?? {}), ...patch } }
          : node,
      ),
    );
  }, [id, setNodes]);

  const { inputImageUrl, hasImageInput } = useMemo(() => {
    const incomingEdges = edges.filter((edge) => edge.target === id);
    let previewUrl = '';
    let hasInput = false;

    for (const edge of incomingEdges) {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      if (!sourceNode) continue;

      if (sourceNode.type === 'image') {
        hasInput = true;
        previewUrl = previewUrl
          || sourceNode.data?.imageUrl
          || sourceNode.data?.imagePreviewUrl
          || '';
        continue;
      }

      if (sourceNode.type === 'crop') {
        hasInput = true;
        previewUrl = previewUrl || sourceNode.data?.croppedImage || '';
        continue;
      }
    }

    return { inputImageUrl: previewUrl, hasImageInput: hasInput };
  }, [edges, nodes, id]);

  const startCropSelection = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (!inputImageUrl || !cropAreaRef.current) return;
    event.preventDefault();
    event.stopPropagation();

    const bounds = cropAreaRef.current.getBoundingClientRect();
    const offsetX = Number.isFinite(event.nativeEvent.offsetX)
      ? event.nativeEvent.offsetX
      : event.clientX - bounds.left;
    const offsetY = Number.isFinite(event.nativeEvent.offsetY)
      ? event.nativeEvent.offsetY
      : event.clientY - bounds.top;
    const startX = Math.min(Math.max(offsetX, 0), bounds.width);
    const startY = Math.min(Math.max(offsetY, 0), bounds.height);

    dragStartRef.current = { x: startX, y: startY };
    setCropRect({ x: startX, y: startY, width: 0, height: 0 });
    setIsDragging(true);
  }, [inputImageUrl]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: globalThis.MouseEvent) => {
      const start = dragStartRef.current;
      const bounds = cropAreaRef.current?.getBoundingClientRect();
      if (!start || !bounds) return;

      const currentX = Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width);
      const currentY = Math.min(Math.max(event.clientY - bounds.top, 0), bounds.height);
      const x = Math.min(start.x, currentX);
      const y = Math.min(start.y, currentY);
      const width = Math.abs(currentX - start.x);
      const height = Math.abs(currentY - start.y);

      setCropRect({ x, y, width, height });
    };

    const handleUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging]);

  const handleCrop = useCallback(() => {
    if (!inputImageUrl || !cropRect) return;
    if (!cropAreaRef.current) return;
    if (cropRect.width < 4 || cropRect.height < 4) return;

    const runCrop = async () => {
      try {
        const image = new Image();
        image.src = inputImageUrl;

        if (!image.complete) {
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('Failed to load image'));
          });
        }

        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;
        if (!naturalWidth || !naturalHeight) return;

        const cropArea = cropAreaRef.current;
        if (!cropArea) return;
        const bounds = cropArea.getBoundingClientRect();
        const displayWidth = bounds.width;
        const displayHeight = bounds.height;
        if (displayWidth <= 0 || displayHeight <= 0) return;

        const scale = Math.max(displayWidth / naturalWidth, displayHeight / naturalHeight);
        const renderedWidth = naturalWidth * scale;
        const renderedHeight = naturalHeight * scale;
        const offsetX = (renderedWidth - displayWidth) / 2;
        const offsetY = (renderedHeight - displayHeight) / 2;

        const scaleX = naturalWidth / renderedWidth;
        const scaleY = naturalHeight / renderedHeight;

        const sourceX = (cropRect.x + offsetX) * scaleX;
        const sourceY = (cropRect.y + offsetY) * scaleY;
        const sourceW = cropRect.width * scaleX;
        const sourceH = cropRect.height * scaleY;

        const clampedX = Math.max(0, Math.min(sourceX, naturalWidth));
        const clampedY = Math.max(0, Math.min(sourceY, naturalHeight));
        const clampedW = Math.max(0, Math.min(sourceW, naturalWidth - clampedX));
        const clampedH = Math.max(0, Math.min(sourceH, naturalHeight - clampedY));

        if (clampedW < 1 || clampedH < 1) return;

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(clampedW));
        canvas.height = Math.max(1, Math.round(clampedH));
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
          image,
          clampedX,
          clampedY,
          clampedW,
          clampedH,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        const cropped = canvas.toDataURL('image/png');
        updateNodeData({ croppedImage: cropped, outputImage: cropped });
      } catch (error) {
        console.error('Crop failed:', error);
      }
    };

    void runCrop();
  }, [cropRect, inputImageUrl, updateNodeData]);

  const handleReset = useCallback(() => {
    setCropRect(null);
    setIsDragging(false);
    dragStartRef.current = null;
    updateNodeData({ croppedImage: '', outputImage: '' });
  }, [updateNodeData]);

  return (
    <div
      style={{
        width: 250,
        minHeight: 380,
        background: '#151515',
        borderRadius: 16,
        border: selected
          ? `2px solid ${cropAccent}`
          : '1px solid #2a2d38',
        boxShadow: selected
          ? '0 0 0 2px rgba(88,208,255,0.18), 0 8px 32px rgba(0,0,0,0.5)'
          : '0 8px 32px rgba(0,0,0,0.5)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        userSelect: 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '18px 16px 16px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RunWorkflowButton isVisible={isHovered && isConnected} />
      <div style={{
        position: 'absolute',
        top: -24,
        left: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#9aa3ad',
        fontSize: 12,
        fontWeight: 500,
      }}>
        <ImageBadgeIcon />
        <span>Crop Image</span>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 500, color: '#7a7d8c', marginBottom: 6 }}>
          Input Image
        </div>
        <div
          style={{
            height: 62,
            borderRadius: 10,
            border: '1px solid #23262f',
            background: '#0b0b0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5b5f6d',
            fontSize: 11,
            overflow: 'hidden',
          }}
          onWheel={stopWheelPropagation}
        >
          {hasImageInput ? (
            inputImageUrl ? (
              <img
                src={inputImageUrl}
                alt="Input"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span>Image connected</span>
            )
          ) : (
            <span>No image connected</span>
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 500, color: '#7a7d8c', marginBottom: 6 }}>
          Crop Area
        </div>
        <div
          ref={cropAreaRef}
          className="nodrag"
          style={{
            height: 150,
            borderRadius: 12,
            border: '1px solid #23262f',
            background: '#0b0b0b',
            position: 'relative',
            overflow: 'hidden',
            cursor: inputImageUrl ? 'crosshair' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5b5f6d',
            fontSize: 11,
          }}
          onMouseDown={startCropSelection}
          onWheel={stopWheelPropagation}
        >
          {inputImageUrl ? (
            <img
              src={inputImageUrl}
              alt="Crop preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              draggable={false}
            />
          ) : (
            <span>Connect an image to crop</span>
          )}

          {inputImageUrl && cropRect && (
            <div
              style={{
                position: 'absolute',
                left: cropRect.x,
                top: cropRect.y,
                width: cropRect.width,
                height: cropRect.height,
                border: `1px solid ${cropAccent}`,
                background: 'rgba(88,208,255,0.12)',
                boxShadow: '0 0 0 999px rgba(0,0,0,0.35)',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={handleCrop}
          onMouseDown={stopPropagation}
          disabled={!inputImageUrl || !cropRect}
          style={{
            flex: 1,
            background: cropAccent,
            border: 'none',
            color: '#1a1d24',
            fontSize: 12,
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: 10,
            cursor: !inputImageUrl || !cropRect ? 'not-allowed' : 'pointer',
            opacity: !inputImageUrl || !cropRect ? 0.5 : 1,
          }}
        >
          Crop
        </button>
        <button
          type="button"
          onClick={handleReset}
          onMouseDown={stopPropagation}
          style={{
            flex: 1,
            background: 'transparent',
            border: `1px solid ${cropAccent}`,
            color: cropAccent,
            fontSize: 12,
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: 10,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 500, color: '#7a7d8c', marginBottom: 6 }}>
          Cropped Image
        </div>
        <div
          style={{
            height: 150,
            borderRadius: 10,
            border: '1px solid #23262f',
            background: '#0b0b0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5b5f6d',
            fontSize: 11,
            overflow: 'hidden',
            padding: 6,
            boxSizing: 'border-box',
          }}
          onWheel={stopWheelPropagation}
        >
          {outputImage || croppedImage ? (
            <img
              src={outputImage || croppedImage}
              alt="Cropped output"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <span>No output yet</span>
          )}
        </div>
      </div>

      <Handle
        id="image"
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: cropAccent,
          border: '2px solid #151515',
          borderRadius: '50%',
          boxShadow: `0 0 0 1.5px ${cropAccent}`,
          left: -6,
          top: 88,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: cropAccent,
          border: '2px solid #151515',
          borderRadius: '50%',
          boxShadow: `0 0 0 1.5px ${cropAccent}`,
          right: -6,
          top: 88,
        }}
      />
    </div>
  );
};

export const nodeTypes = {
  text: TextNode,
  image: ImageNode,
  video: VideoNode,
  frame: FrameExtractorNode,
  llm: LlmNode,
  crop: CropNode,
};
