import { useRef, useEffect, useCallback, useState } from 'react';
import type { GraphNode, GraphEdge, NODE_TYPE_CONFIG } from '@/pages/Connections';

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

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightIds?: Set<string>;
  selectedId?: string | null;
  onSelectNode?: (id: string | null) => void;
  zoomAction?: 'in' | 'out' | 'fit' | null;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function ConnectionGraph({ nodes, edges, highlightIds, selectedId, onSelectNode, zoomAction }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<SimNode[]>([]);
  const edgesRef = useRef(edges);
  const animRef = useRef<number>(0);
  const [hovered, setHovered] = useState<SimNode | null>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const dragRef = useRef<{ dragging: boolean; nodeId: string | null; startX: number; startY: number; isPan: boolean; moved: boolean }>({
    dragging: false, nodeId: null, startX: 0, startY: 0, isPan: false, moved: false,
  });

  // Handle zoom actions from parent
  useEffect(() => {
    if (!zoomAction) return;
    if (zoomAction === 'in') zoomRef.current = Math.min(4, zoomRef.current * 1.3);
    else if (zoomAction === 'out') zoomRef.current = Math.max(0.2, zoomRef.current / 1.3);
    else if (zoomAction === 'fit') {
      zoomRef.current = 1;
      panRef.current = { x: 0, y: 0 };
    }
  }, [zoomAction]);

  // Init simulation nodes
  useEffect(() => {
    const existing = new Map(simRef.current.map(n => [n.id, n]));
    simRef.current = nodes.map(n => {
      if (existing.has(n.id)) {
        const e = existing.get(n.id)!;
        return { ...n, x: e.x, y: e.y, vx: 0, vy: 0, radius: getRadius(n.type) };
      }
      return { ...n, x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 600, vx: 0, vy: 0, radius: getRadius(n.type) };
    });
    edgesRef.current = edges;
  }, [nodes, edges]);

  const toScreen = useCallback((x: number, y: number, canvas: HTMLCanvasElement) => {
    const cx = canvas.width / 2 + panRef.current.x;
    const cy = canvas.height / 2 + panRef.current.y;
    return { sx: cx + x * zoomRef.current, sy: cy + y * zoomRef.current };
  }, []);

  const toWorld = useCallback((sx: number, sy: number, canvas: HTMLCanvasElement) => {
    const cx = canvas.width / 2 + panRef.current.x;
    const cy = canvas.height / 2 + panRef.current.y;
    return { x: (sx - cx) / zoomRef.current, y: (sy - cy) / zoomRef.current };
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let running = true;

    const tick = () => {
      if (!running) return;
      const sNodes = simRef.current;
      const sEdges = edgesRef.current;
      const nodeMap = new Map(sNodes.map(n => [n.id, n]));

      // Force: repulsion
      for (let i = 0; i < sNodes.length; i++) {
        for (let j = i + 1; j < sNodes.length; j++) {
          const a = sNodes[i], b = sNodes[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1000 / (dist * dist);
          const fx = (dx / dist) * force, fy = (dy / dist) * force;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }
      // Force: attraction along edges
      for (const e of sEdges) {
        const a = nodeMap.get(e.from), b = nodeMap.get(e.to);
        if (!a || !b) continue;
        let dx = b.x - a.x, dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 120) * 0.004;
        const fx = (dx / dist) * force, fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
      // Force: center gravity
      for (const n of sNodes) {
        n.vx -= n.x * 0.0008;
        n.vy -= n.y * 0.0008;
      }
      // Apply velocity with damping
      for (const n of sNodes) {
        if (dragRef.current.dragging && dragRef.current.nodeId === n.id) continue;
        n.vx *= 0.85; n.vy *= 0.85;
        n.x += n.vx; n.y += n.vy;
      }

      // Draw
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.clearRect(0, 0, w, h);

      const connectedToSelected = new Set<string>();
      if (selectedId) {
        for (const e of sEdges) {
          if (e.from === selectedId) connectedToSelected.add(e.to);
          if (e.to === selectedId) connectedToSelected.add(e.from);
        }
      }

      // Draw edges
      for (const e of sEdges) {
        const a = nodeMap.get(e.from), b = nodeMap.get(e.to);
        if (!a || !b) continue;
        const { sx: ax, sy: ay } = toScreen(a.x, a.y, canvas);
        const { sx: bx, sy: by } = toScreen(b.x, b.y, canvas);
        const isHL = selectedId && (e.from === selectedId || e.to === selectedId);
        const dimmed = selectedId && !isHL;

        ctx.beginPath();
        ctx.moveTo(ax / dpr, ay / dpr);
        ctx.lineTo(bx / dpr, by / dpr);
        ctx.strokeStyle = isHL ? 'rgba(168,85,247,0.6)' : dimmed ? 'rgba(128,128,128,0.06)' : 'rgba(128,128,128,0.12)';
        ctx.lineWidth = isHL ? 2 : 1;
        ctx.stroke();

        // Edge label
        if (isHL && e.label && zoomRef.current > 0.6) {
          const mx = (ax / dpr + bx / dpr) / 2;
          const my = (ay / dpr + by / dpr) / 2;
          ctx.font = `${Math.max(8, 9 * zoomRef.current)}px sans-serif`;
          ctx.fillStyle = 'rgba(168,85,247,0.7)';
          ctx.textAlign = 'center';
          ctx.fillText(e.label, mx, my - 4);
        }
      }

      // Draw nodes
      for (const n of sNodes) {
        const { sx, sy } = toScreen(n.x, n.y, canvas);
        const screenX = sx / dpr, screenY = sy / dpr;
        const r = n.radius * zoomRef.current;
        const dimmed = selectedId && n.id !== selectedId && !connectedToSelected.has(n.id);
        const isHl = highlightIds && highlightIds.has(n.id);
        const isSel = n.id === selectedId;
        const isHov = hovered?.id === n.id;

        // Glow for selected
        if (isSel) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, r + 4, 0, Math.PI * 2);
          ctx.fillStyle = `${TYPE_COLORS[n.type]}33`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, r, 0, Math.PI * 2);
        ctx.fillStyle = dimmed ? `${TYPE_COLORS[n.type]}33` : TYPE_COLORS[n.type];
        ctx.fill();

        if (isHl || isHov || isSel) {
          ctx.strokeStyle = isSel ? 'white' : isHov ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)';
          ctx.lineWidth = isSel ? 2.5 : 2;
          ctx.stroke();
        }

        // Label
        if (zoomRef.current > 0.4 || isHov || isSel) {
          ctx.fillStyle = dimmed ? 'rgba(200,200,200,0.2)' : 'rgba(240,240,240,0.9)';
          ctx.font = `${isSel ? 'bold ' : ''}${Math.max(9, 11 * zoomRef.current)}px sans-serif`;
          ctx.textAlign = 'center';
          const label = n.label.length > 20 ? n.label.slice(0, 18) + '…' : n.label;
          ctx.fillText(label, screenX, screenY + r + 12 * zoomRef.current);
        }
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [hovered, selectedId, highlightIds, toScreen]);

  // Mouse: find node
  const findNode = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mx = (e.clientX - rect.left) * dpr;
    const my = (e.clientY - rect.top) * dpr;
    for (const n of simRef.current) {
      const { sx, sy } = toScreen(n.x, n.y, canvas);
      const dx = mx - sx, dy = my - sy;
      if (dx * dx + dy * dy < (n.radius * zoomRef.current * dpr + 4) ** 2) return n;
    }
    return null;
  }, [toScreen]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = findNode(e);
    if (node) {
      dragRef.current = { dragging: true, nodeId: node.id, startX: e.clientX, startY: e.clientY, isPan: false, moved: false };
    } else {
      dragRef.current = { dragging: true, nodeId: null, startX: e.clientX, startY: e.clientY, isPan: true, moved: false };
    }
  }, [findNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (d.dragging && d.isPan) {
      panRef.current.x += e.clientX - d.startX;
      panRef.current.y += e.clientY - d.startY;
      d.startX = e.clientX;
      d.startY = e.clientY;
      d.moved = true;
    } else if (d.dragging && d.nodeId) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = toWorld((e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr, canvas);
      const node = simRef.current.find(n => n.id === d.nodeId);
      if (node) { node.x = w.x; node.y = w.y; node.vx = 0; node.vy = 0; }
      d.moved = true;
    } else {
      const h = findNode(e);
      setHovered(h);
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = h ? 'pointer' : 'grab';
    }
  }, [findNode, toWorld]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d.moved && !d.isPan) {
      // Click without drag = select
      const node = findNode(e);
      onSelectNode?.(node ? (selectedId === node.id ? null : node.id) : null);
    } else if (!d.moved && d.isPan) {
      // Click on empty = deselect
      onSelectNode?.(null);
    }
    dragRef.current = { dragging: false, nodeId: null, startX: 0, startY: 0, isPan: false, moved: false };
  }, [findNode, selectedId, onSelectNode]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    zoomRef.current = Math.max(0.2, Math.min(4, zoomRef.current - e.deltaY * 0.001));
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        dragRef.current = { dragging: false, nodeId: null, startX: 0, startY: 0, isPan: false, moved: false };
        setHovered(null);
      }}
      onWheel={handleWheel}
    />
  );
}

function getRadius(type: string) {
  switch (type) {
    case 'project': return 16;
    case 'storyboard': return 13;
    case 'asset': return 11;
    case 'task': return 10;
    case 'team': return 12;
    case 'doc': return 10;
    case 'link': return 9;
    case 'tag': return 7;
    default: return 8;
  }
}
