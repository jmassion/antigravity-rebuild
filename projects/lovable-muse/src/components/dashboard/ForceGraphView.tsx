import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ForceGraph3D from 'react-force-graph-3d';
import type { GraphNode, GraphEdge, NodeType } from '@/pages/Connections';

const TYPE_COLORS: Record<string, string> = {
  project: '#3b82f6',
  asset: '#10b981',
  tag: '#f59e0b',
  storyboard: '#a855f7',
  task: '#ef4444',
  team: '#06b6d4',
  doc: '#ec4899',
  link: '#84cc16',
};

const TYPE_ICONS: Record<string, string> = {
  project: '📁',
  asset: '🖼️',
  tag: '🏷️',
  storyboard: '🎬',
  task: '✅',
  team: '👤',
  doc: '📝',
  link: '🔗',
};

const NODE_SIZE: Record<string, number> = {
  project: 8,
  storyboard: 7,
  asset: 6,
  task: 5,
  team: 6,
  doc: 5,
  link: 5,
  tag: 4,
};

interface FGNode {
  id: string;
  label: string;
  type: NodeType;
  entityId?: string;
  meta?: Record<string, any>;
  color: string;
  val: number;
  fx?: number;
  fy?: number;
}

interface FGLink {
  source: string;
  target: string;
  label?: string;
}

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightIds?: Set<string>;
  selectedId?: string | null;
  onSelectNode?: (id: string | null) => void;
  onNodeRightClick?: (nodeId: string, event: MouseEvent) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  mode: '2d' | '3d';
  width: number;
  height: number;
  freezePhysics?: boolean;
  pinnedNodes?: Record<string, { x: number; y: number }>;
  linkThicknessMultiplier?: number;
  theme?: 'light' | 'dark';
}

export default function ForceGraphView({
  nodes, edges, highlightIds, selectedId, onSelectNode,
  onNodeRightClick, onNodeDoubleClick,
  mode, width, height,
  freezePhysics = false, pinnedNodes = {}, linkThicknessMultiplier = 1,
  theme = 'dark',
}: Props) {
  const fgRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<FGNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const graphData = useMemo(() => {
    const nodeIds = new Set(nodes.map(n => n.id));
    const fgNodes: FGNode[] = nodes.map(n => {
      const pinned = pinnedNodes[n.id];
      return {
        id: n.id,
        label: n.label,
        type: n.type,
        entityId: n.entityId,
        meta: n.meta,
        color: TYPE_COLORS[n.type] || '#888',
        val: NODE_SIZE[n.type] || 5,
        ...(pinned ? { fx: pinned.x, fy: pinned.y } : {}),
      };
    });
    const fgLinks: FGLink[] = edges
      .filter(e => nodeIds.has(e.from) && nodeIds.has(e.to))
      .map(e => ({ source: e.from, target: e.to, label: e.label }));
    return { nodes: fgNodes, links: fgLinks };
  }, [nodes, edges, pinnedNodes]);

  const connectedToSelected = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const s = new Set<string>();
    for (const e of edges) {
      if (e.from === selectedId) s.add(e.to);
      if (e.to === selectedId) s.add(e.from);
    }
    return s;
  }, [selectedId, edges]);

  const handleNodeClick = useCallback((node: any) => {
    onSelectNode?.(selectedId === node.id ? null : node.id);
  }, [selectedId, onSelectNode]);

  const handleBackgroundClick = useCallback(() => {
    onSelectNode?.(null);
  }, [onSelectNode]);

  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node || null);
  }, []);

  const handleNodeRightClick = useCallback((node: any, event: MouseEvent) => {
    event.preventDefault();
    onNodeRightClick?.(node.id, event);
  }, [onNodeRightClick]);

  const handleNodeDoubleClick = useCallback((node: any) => {
    onNodeDoubleClick?.(node.id);
  }, [onNodeDoubleClick]);

  // Freeze/unfreeze physics
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    if (freezePhysics) {
      fg.pauseAnimation?.();
      // For 2D, stop the d3 simulation
      if (fg.d3Force) {
        fg.d3Force('charge')?.strength(0);
        fg.d3Force('link')?.strength(0);
        fg.d3Force('center', null);
      }
      fg.cooldownTicks?.(0);
    } else {
      fg.resumeAnimation?.();
      fg.d3ReheatSimulation?.();
    }
  }, [freezePhysics]);

  // Zoom to fit on data change
  useEffect(() => {
    const fg = fgRef.current;
    if (fg && graphData.nodes.length > 0) {
      const timer = setTimeout(() => {
        if (fg.zoomToFit) fg.zoomToFit(400, 60);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [graphData]);

  const isLight = theme === 'light';

  const paintNode2D = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSel = node.id === selectedId;
    const isConn = connectedToSelected.has(node.id);
    const isHighlighted = highlightIds?.has(node.id);
    const isHov = hoveredNode?.id === node.id;
    const dimmed = selectedId && !isSel && !isConn;
    const isPinned = !!pinnedNodes[node.id];
    const r = (node.val || 5) * (isSel ? 1.4 : isHov ? 1.2 : 1);
    const color = node.color || '#888';

    if (isSel || isHov) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 3, 0, 2 * Math.PI);
      ctx.fillStyle = `${color}33`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = dimmed ? `${color}44` : color;
    ctx.fill();

    if (isSel || isHov || isHighlighted) {
      ctx.strokeStyle = isSel
        ? (isLight ? '#000000' : '#ffffff')
        : isHov
          ? (isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)')
          : (isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)');
      ctx.lineWidth = isSel ? 2 / globalScale : 1.5 / globalScale;
      ctx.stroke();
    }

    if (globalScale > 0.5) {
      const iconSize = Math.max(r * 1.2, 8 / globalScale);
      ctx.font = `${iconSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(TYPE_ICONS[node.type] || '●', node.x, node.y);
    }

    // Pin indicator
    if (isPinned && globalScale > 0.3) {
      const pinSize = Math.max(6 / globalScale, 3);
      ctx.font = `${pinSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('📌', node.x + r, node.y - r);
    }

    if (globalScale > 0.4 || isSel || isHov) {
      const fontSize = Math.max(10 / globalScale, 3);
      ctx.font = `${isSel ? 'bold ' : ''}${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = dimmed
        ? (isLight ? 'rgba(60,60,60,0.2)' : 'rgba(200,200,200,0.2)')
        : (isLight ? 'rgba(30,30,30,0.9)' : 'rgba(240,240,240,0.9)');
      const label = node.label.length > 22 ? node.label.slice(0, 20) + '…' : node.label;
      ctx.fillText(label, node.x, node.y + r + 2);
    }
  }, [selectedId, connectedToSelected, highlightIds, hoveredNode, pinnedNodes, isLight]);

  const linkColor = useCallback((link: any) => {
    const srcId = typeof link.source === 'object' ? link.source.id : link.source;
    const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
    const isHL = selectedId && (srcId === selectedId || tgtId === selectedId);
    const dimmed = selectedId && !isHL;
    if (isHL) return isLight ? 'rgba(124,58,237,0.7)' : 'rgba(168,85,247,0.7)';
    if (dimmed) return isLight ? 'rgba(0,0,0,0.06)' : 'rgba(128,128,128,0.10)';
    return isLight ? 'rgba(0,0,0,0.22)' : 'rgba(180,180,180,0.30)';
  }, [selectedId, isLight]);

  const linkWidth = useCallback((link: any) => {
    const srcId = typeof link.source === 'object' ? link.source.id : link.source;
    const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
    const isHL = selectedId && (srcId === selectedId || tgtId === selectedId);
    return (isHL ? 3 : 1.5) * linkThicknessMultiplier;
  }, [selectedId, linkThicknessMultiplier]);

  const nodeLabel3D = useCallback((node: any) => {
    const icon = TYPE_ICONS[node.type] || '●';
    const meta = node.meta || {};
    const metaStr = Object.entries(meta).slice(0, 2).map(([k, v]) => `<br/><span style="color:#999;font-size:10px">${k}: ${v}</span>`).join('');
    return `<div style="background:rgba(20,20,30,0.92);border:1px solid ${node.color};border-radius:8px;padding:6px 10px;font-family:sans-serif;max-width:200px;">
      <div style="font-size:14px;margin-bottom:2px">${icon} <b style="color:#fff">${node.label}</b></div>
      <div style="font-size:11px;color:${node.color}">${node.type}</div>
      ${metaStr}
    </div>`;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const commonProps = {
    ref: fgRef,
    graphData,
    width,
    height,
    onNodeClick: handleNodeClick,
    onBackgroundClick: handleBackgroundClick,
    onNodeHover: handleNodeHover,
    onNodeRightClick: handleNodeRightClick,
    onNodeDragEnd: handleNodeDoubleClick ? undefined : undefined,
    linkColor,
    linkWidth,
    linkDirectionalParticles: (link: any) => {
      const srcId = typeof link.source === 'object' ? link.source.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
      return selectedId && (srcId === selectedId || tgtId === selectedId) ? 2 : 0;
    },
    linkDirectionalParticleWidth: 2,
    linkDirectionalParticleSpeed: 0.005,
    d3VelocityDecay: 0.3,
    cooldownTicks: freezePhysics ? 0 : 200,
    backgroundColor: 'rgba(0,0,0,0)',
  };

  return (
    <div className="relative w-full h-full" onMouseMove={handleMouseMove} onDoubleClick={(e) => {
      // double click on canvas -> find node from force graph ref
    }}>
      {mode === '2d' ? (
        <ForceGraph2D
          {...commonProps}
          nodeCanvasObject={paintNode2D}
          nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
            const r = (node.val || 5) * 1.5;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          linkLabel={(link: any) => link.label || ''}
          onNodeDragEnd={(node: any) => {
            // When manually dragged, report position for pinning
            if (node && node.id) {
              onNodeDoubleClick?.(node.id);
            }
          }}
        />
      ) : (
        <ForceGraph3D
          {...commonProps}
          nodeLabel={nodeLabel3D}
          nodeColor={(node: any) => {
            const isSel = node.id === selectedId;
            const isConn = connectedToSelected.has(node.id);
            const dimmed = selectedId && !isSel && !isConn;
            return dimmed ? '#333333' : (node.color || '#888');
          }}
          nodeOpacity={0.9}
          nodeResolution={16}
          linkLabel={(link: any) => link.label || ''}
          linkOpacity={0.3}
        />
      )}

      {hoveredNode && (
        <div
          className="fixed z-[9999] pointer-events-none bg-popover border border-border rounded-lg shadow-xl px-3 py-2 max-w-[240px]"
          style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 10 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{TYPE_ICONS[hoveredNode.type]}</span>
            <span className="text-sm font-semibold text-foreground truncate">{hoveredNode.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: hoveredNode.color }} />
            <span className="text-xs text-muted-foreground capitalize">{hoveredNode.type}</span>
          </div>
          {hoveredNode.meta && Object.keys(hoveredNode.meta).length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-border space-y-0.5">
              {Object.entries(hoveredNode.meta).slice(0, 3).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground capitalize">{k.replace('_', ' ')}</span>
                  <span className="text-foreground font-medium truncate max-w-[100px] ml-2">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground mt-1.5 italic">Click to select · Double-click to pin</p>
        </div>
      )}
    </div>
  );
}
