import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, GitBranchPlus, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import NodeDetailPanel from '@/components/dashboard/NodeDetailPanel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { NODE_TYPE_CONFIG } from '@/pages/Connections';
import type { GraphNode, GraphEdge, NodeType } from '@/pages/Connections';
import { useI18n } from '@/lib/i18n';

interface DagNode extends GraphNode {
  x: number;
  y: number;
  layer: number;
}

const LAYER_LABELS = ['Prompts / Sources', 'Plans', 'Derived Items'];

export default function Provenance() {
  const { user } = useAuth();
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ['provenance-full', user?.id],
    queryFn: async () => {
      const [edgesRes, assetsRes, storyboardsRes, projectsRes, plansRes, docsRes, linksRes, tasksRes] = await Promise.all([
        supabase.from('provenance_edges').select('*'),
        supabase.from('assets').select('id, name, tags, file_type'),
        supabase.from('storyboards').select('id, name, project_id'),
        supabase.from('projects').select('id, name, phase'),
        supabase.from('plans').select('id, title, status, project_id'),
        supabase.from('docs').select('id, title, category, tags'),
        supabase.from('links').select('id, title, url'),
        supabase.from('tasks').select('id, title, status'),
      ]);
      return {
        edges: edgesRes.data || [],
        assets: assetsRes.data || [],
        storyboards: storyboardsRes.data || [],
        projects: projectsRes.data || [],
        plans: plansRes.data || [],
        docs: docsRes.data || [],
        links: linksRes.data || [],
        tasks: tasksRes.data || [],
      };
    },
    enabled: !!user,
  });

  // Build entity lookup
  const entityMap = useMemo(() => {
    if (!data) return new Map<string, { label: string; type: NodeType }>();
    const m = new Map<string, { label: string; type: NodeType }>();
    for (const a of data.assets) m.set(a.id, { label: a.name, type: 'asset' });
    for (const s of data.storyboards) m.set(s.id, { label: s.name, type: 'storyboard' });
    for (const p of data.projects) m.set(p.id, { label: p.name, type: 'project' });
    for (const p of data.plans) m.set(p.id, { label: p.title, type: 'project' }); // plans shown as project-type nodes
    for (const d of data.docs) m.set(d.id, { label: d.title, type: 'doc' });
    for (const l of data.links) m.set(l.id, { label: l.title, type: 'link' });
    for (const t of data.tasks) m.set(t.id, { label: t.title, type: 'task' });
    return m;
  }, [data]);

  // Build DAG from provenance edges
  const { dagNodes, dagEdges, allNodes, allEdges } = useMemo(() => {
    if (!data || data.edges.length === 0) return { dagNodes: [] as DagNode[], dagEdges: [] as GraphEdge[], allNodes: [] as GraphNode[], allEdges: [] as GraphEdge[] };

    const nodeIds = new Set<string>();
    const gEdges: GraphEdge[] = [];
    const gNodes: GraphNode[] = [];

    for (const e of data.edges) {
      const sourceKey = `${e.source_type}-${e.source_id}`;
      const targetKey = `${e.target_type}-${e.target_id}`;

      if (!nodeIds.has(sourceKey)) {
        nodeIds.add(sourceKey);
        const info = entityMap.get(e.source_id);
        const nodeType = e.source_type === 'plan' ? 'project' : (e.source_type as NodeType);
        gNodes.push({ id: sourceKey, label: info?.label || e.source_id.slice(0, 8), type: nodeType, entityId: e.source_id, meta: { entityType: e.source_type } });
      }
      if (!nodeIds.has(targetKey)) {
        nodeIds.add(targetKey);
        const info = entityMap.get(e.target_id);
        const nodeType = e.target_type === 'plan' ? 'project' : (e.target_type as NodeType);
        gNodes.push({ id: targetKey, label: info?.label || e.target_id.slice(0, 8), type: nodeType, entityId: e.target_id, meta: { entityType: e.target_type } });
      }
      gEdges.push({ from: sourceKey, to: targetKey, label: e.relationship });
    }

    // Topological sort for layers
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();
    for (const n of gNodes) { inDegree.set(n.id, 0); adj.set(n.id, []); }
    for (const e of gEdges) {
      inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
      adj.get(e.from)?.push(e.to);
    }

    const layers = new Map<string, number>();
    const queue = [...gNodes.filter(n => (inDegree.get(n.id) || 0) === 0).map(n => n.id)];
    for (const id of queue) layers.set(id, 0);

    let idx = 0;
    while (idx < queue.length) {
      const cur = queue[idx++];
      for (const next of adj.get(cur) || []) {
        layers.set(next, Math.max(layers.get(next) || 0, (layers.get(cur) || 0) + 1));
        inDegree.set(next, (inDegree.get(next) || 0) - 1);
        if (inDegree.get(next) === 0) queue.push(next);
      }
    }

    // Position nodes in layers
    const layerGroups = new Map<number, string[]>();
    for (const [id, layer] of layers) {
      if (!layerGroups.has(layer)) layerGroups.set(layer, []);
      layerGroups.get(layer)!.push(id);
    }

    const LAYER_H = 160;
    const NODE_W = 160;
    const dagN: DagNode[] = [];

    for (const [layer, ids] of layerGroups) {
      const totalW = ids.length * NODE_W;
      const startX = -totalW / 2 + NODE_W / 2;
      ids.forEach((id, i) => {
        const node = gNodes.find(n => n.id === id);
        if (node) {
          dagN.push({ ...node, x: startX + i * NODE_W, y: layer * LAYER_H + 60, layer });
        }
      });
    }

    return { dagNodes: dagN, dagEdges: gEdges, allNodes: gNodes, allEdges: gEdges };
  }, [data, entityMap]);

  // Canvas rendering
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2 + offset.x;
    const cy = 40 + offset.y;

    // Draw layer labels
    const maxLayer = Math.max(0, ...dagNodes.map(n => n.layer));
    ctx.font = '11px system-ui';
    ctx.fillStyle = 'rgba(128,128,128,0.5)';
    for (let l = 0; l <= maxLayer; l++) {
      const label = LAYER_LABELS[l] || `Layer ${l}`;
      ctx.fillText(label, 12, (l * 160 + 50) * zoom + cy);
    }

    // Draw edges
    ctx.strokeStyle = 'rgba(128,128,128,0.3)';
    ctx.lineWidth = 1.5;
    for (const e of dagEdges) {
      const from = dagNodes.find(n => n.id === e.from);
      const to = dagNodes.find(n => n.id === e.to);
      if (!from || !to) continue;

      const fx = from.x * zoom + cx;
      const fy = from.y * zoom + cy + 16;
      const tx = to.x * zoom + cx;
      const ty = to.y * zoom + cy - 16;

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.bezierCurveTo(fx, fy + 40 * zoom, tx, ty - 40 * zoom, tx, ty);
      ctx.stroke();

      // Arrow
      const angle = Math.atan2(ty - (ty - 40 * zoom), tx - tx);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(0, 0);
      ctx.lineTo(-6, 4);
      ctx.strokeStyle = 'rgba(128,128,128,0.5)';
      ctx.stroke();
      ctx.restore();
    }

    // Draw nodes
    for (const node of dagNodes) {
      const x = node.x * zoom + cx;
      const y = node.y * zoom + cy;
      const cfg = NODE_TYPE_CONFIG[node.type] || NODE_TYPE_CONFIG.project;
      const isSelected = node.id === selectedNodeId;

      ctx.fillStyle = isSelected ? cfg.color : `${cfg.color}33`;
      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.roundRect(x - 60, y - 16, 120, 32, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = `${isSelected ? 'bold ' : ''}11px system-ui`;
      ctx.fillStyle = isSelected ? '#fff' : cfg.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = node.label.length > 16 ? node.label.slice(0, 15) + '…' : node.label;
      ctx.fillText(label, x, y);
    }
  }, [dagNodes, dagEdges, offset, zoom, selectedNodeId]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    const obs = new ResizeObserver(() => draw());
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [draw]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = rect.width / 2 + offset.x;
    const cy = 40 + offset.y;

    for (const node of dagNodes) {
      const nx = node.x * zoom + cx;
      const ny = node.y * zoom + cy;
      if (Math.abs(mx - nx) < 60 && Math.abs(my - ny) < 16) {
        setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
        return;
      }
    }
    setSelectedNodeId(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  const selectedNode = selectedNodeId ? allNodes.find(n => n.id === selectedNodeId) || null : null;

  return (
    <AppLayout>
      <div className="p-6 h-[calc(100vh-0px)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <GitBranchPlus className="w-5 h-5 text-primary" /> {t('provenance.title')}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {t('provenance.subtitle')} · {dagNodes.length} nodes · {dagEdges.length} edges
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border bg-secondary p-0.5">
            <button onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.3))} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : dagNodes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <GitBranchPlus className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm">No provenance links yet</p>
            <p className="text-xs mt-1">Create plans and link them to prompts and deliverables to see the flow</p>
          </div>
        ) : (
          <div className="flex-1 flex gap-0 rounded-lg border border-border bg-card overflow-hidden">
            <div ref={containerRef} className={`${selectedNode ? 'flex-1' : 'w-full'} relative transition-all`}>
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
            {selectedNode && (
              <NodeDetailPanel
                node={selectedNode}
                edges={allEdges}
                allNodes={allNodes}
                onClose={() => setSelectedNodeId(null)}
                onNavigate={setSelectedNodeId}
              />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
