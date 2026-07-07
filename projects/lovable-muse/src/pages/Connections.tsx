import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Network, Eye, EyeOff, Box, Square, Lock, Unlock, List, Grid3x3, Sun, Moon, Monitor } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import ForceGraphView from '@/components/dashboard/ForceGraphView';
import ConnectionListView from '@/components/dashboard/ConnectionListView';
import ConnectionMatrixView from '@/components/dashboard/ConnectionMatrixView';
import NodeDetailPanel from '@/components/dashboard/NodeDetailPanel';
import GraphContextMenu from '@/components/dashboard/GraphContextMenu';
import GraphPresetManager, { type PresetConfig } from '@/components/dashboard/GraphPresetManager';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useI18n } from '@/lib/i18n';

export type GraphTheme = 'system' | 'light' | 'dark';

export type NodeType = 'project' | 'asset' | 'tag' | 'storyboard' | 'task' | 'team' | 'doc' | 'link';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  entityId?: string;
  meta?: Record<string, any>;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

const NODE_TYPE_CONFIG: Record<NodeType, { color: string; label: string; emoji: string }> = {
  project:    { color: '#3b82f6', label: 'Projects',    emoji: '📁' },
  asset:      { color: '#10b981', label: 'Assets',      emoji: '🖼️' },
  tag:        { color: '#f59e0b', label: 'Tags',        emoji: '🏷️' },
  storyboard: { color: '#a855f7', label: 'Storyboards', emoji: '🎬' },
  task:       { color: '#ef4444', label: 'Tasks',       emoji: '✅' },
  team:       { color: '#06b6d4', label: 'Team',        emoji: '👤' },
  doc:        { color: '#ec4899', label: 'Docs',        emoji: '📝' },
  link:       { color: '#84cc16', label: 'Links',       emoji: '🔗' },
};

export { NODE_TYPE_CONFIG };

type GraphViewMode = 'graph' | 'list' | 'matrix';

export default function Connections() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hiddenTypes, setHiddenTypes] = useState<Set<NodeType>>(new Set());
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [graphViewMode, setGraphViewMode] = useState<GraphViewMode>('graph');
  const [freezePhysics, setFreezePhysics] = useState(false);
  const [pinnedNodes, setPinnedNodes] = useState<Record<string, { x: number; y: number }>>({});
  const [linkThickness, setLinkThickness] = useState(1);
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const [graphTheme, setGraphTheme] = useState<GraphTheme>('system');

  // Resolve graph theme - 'system' follows site preference (which is dark-only currently based on CSS)
  const resolvedGraphTheme = useMemo(() => {
    if (graphTheme !== 'system') return graphTheme;
    // Check if system prefers light
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  }, [graphTheme]);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = graphContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['connection-graph-full', user?.id],
    queryFn: async () => {
      const [projectsRes, assetsRes, storyboardsRes, framesRes, assetProjectsRes, storyboardProjectsRes, tasksRes, teamRes, docsRes, linksRes, ptmRes, plansRes, provEdgesRes] = await Promise.all([
        supabase.from('projects').select('id, name, phase, parent_id, tags, thumbnail_url'),
        supabase.from('assets').select('id, name, tags, ai_tags, file_type, thumbnail_url'),
        supabase.from('storyboards').select('id, name, project_id, tags'),
        supabase.from('storyboard_frames').select('storyboard_id, asset_id, assignee_id').not('asset_id', 'is', null),
        supabase.from('asset_projects').select('asset_id, project_id'),
        supabase.from('storyboard_projects').select('storyboard_id, project_id'),
        supabase.from('tasks').select('id, title, status, priority, project_id, assignee_id'),
        supabase.from('team_members').select('id, display_name, member_type, role, primary_project_id, avatar_url').eq('is_active', true),
        supabase.from('docs').select('id, title, category, tags'),
        supabase.from('links').select('id, title, url, tool_name, project_id, tags'),
        supabase.from('project_team_members').select('project_id, team_member_id'),
        supabase.from('plans').select('id, title, status, project_id, tags'),
        supabase.from('provenance_edges').select('source_type, source_id, target_type, target_id, relationship'),
      ]);
      return {
        projects: projectsRes.data || [], assets: assetsRes.data || [], storyboards: storyboardsRes.data || [],
        frames: framesRes.data || [], assetProjects: assetProjectsRes.data || [],
        storyboardProjects: storyboardProjectsRes.data || [], tasks: tasksRes.data || [],
        team: teamRes.data || [], docs: docsRes.data || [], links: linksRes.data || [],
        ptm: ptmRes.data || [], plans: plansRes.data || [], provEdges: provEdgesRes.data || [],
      };
    },
    enabled: !!user,
  });

  // Build graph
  const { allNodes, allEdges } = useMemo(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const tagSet = new Set<string>();
    if (!data) return { allNodes: nodes, allEdges: edges };

    for (const p of data.projects) {
      nodes.push({ id: `p-${p.id}`, label: p.name, type: 'project', entityId: p.id, meta: { phase: p.phase, thumbnail_url: p.thumbnail_url } });
      if (p.parent_id) edges.push({ from: `p-${p.id}`, to: `p-${p.parent_id}`, label: 'child of' });
      for (const t of ((p as any).tags || [])) {
        if (!tagSet.has(t)) { tagSet.add(t); nodes.push({ id: `t-${t}`, label: t, type: 'tag' }); }
        edges.push({ from: `p-${p.id}`, to: `t-${t}` });
      }
    }
    for (const a of data.assets) {
      nodes.push({ id: `a-${a.id}`, label: a.name, type: 'asset', entityId: a.id, meta: { file_type: a.file_type, thumbnail_url: a.thumbnail_url } });
      for (const t of [...(a.tags || []), ...(a.ai_tags || [])]) {
        if (!tagSet.has(t)) { tagSet.add(t); nodes.push({ id: `t-${t}`, label: t, type: 'tag' }); }
        edges.push({ from: `a-${a.id}`, to: `t-${t}` });
      }
    }
    for (const s of data.storyboards) {
      nodes.push({ id: `s-${s.id}`, label: s.name, type: 'storyboard', entityId: s.id });
      edges.push({ from: `s-${s.id}`, to: `p-${s.project_id}`, label: 'in project' });
      for (const t of ((s as any).tags || [])) {
        if (!tagSet.has(t)) { tagSet.add(t); nodes.push({ id: `t-${t}`, label: t, type: 'tag' }); }
        edges.push({ from: `s-${s.id}`, to: `t-${t}` });
      }
    }
    for (const f of data.frames) {
      if (f.asset_id) edges.push({ from: `s-${f.storyboard_id}`, to: `a-${f.asset_id}`, label: 'uses' });
      if (f.assignee_id) edges.push({ from: `s-${f.storyboard_id}`, to: `m-${f.assignee_id}`, label: 'assigned' });
    }
    for (const ap of data.assetProjects) edges.push({ from: `a-${ap.asset_id}`, to: `p-${ap.project_id}`, label: 'in project' });
    for (const sp of data.storyboardProjects) edges.push({ from: `s-${sp.storyboard_id}`, to: `p-${sp.project_id}`, label: 'linked to' });
    for (const t of data.tasks) {
      nodes.push({ id: `k-${t.id}`, label: t.title, type: 'task', entityId: t.id, meta: { status: t.status, priority: t.priority } });
      if (t.project_id) edges.push({ from: `k-${t.id}`, to: `p-${t.project_id}`, label: 'in project' });
      if (t.assignee_id) edges.push({ from: `k-${t.id}`, to: `m-${t.assignee_id}`, label: 'assigned to' });
    }
    for (const m of data.team) {
      nodes.push({ id: `m-${m.id}`, label: m.display_name, type: 'team', entityId: m.id, meta: { member_type: m.member_type, role: m.role, thumbnail_url: m.avatar_url } });
      if (m.primary_project_id) edges.push({ from: `m-${m.id}`, to: `p-${m.primary_project_id}`, label: 'primary' });
    }
    for (const ptm of data.ptm) edges.push({ from: `m-${ptm.team_member_id}`, to: `p-${ptm.project_id}`, label: 'member of' });
    for (const d of data.docs) {
      nodes.push({ id: `d-${d.id}`, label: d.title, type: 'doc', entityId: d.id, meta: { category: d.category } });
      for (const t of (d.tags || [])) {
        if (!tagSet.has(t)) { tagSet.add(t); nodes.push({ id: `t-${t}`, label: t, type: 'tag' }); }
        edges.push({ from: `d-${d.id}`, to: `t-${t}` });
      }
    }
    for (const l of data.links) {
      nodes.push({ id: `l-${l.id}`, label: l.title, type: 'link', entityId: l.id, meta: { tool_name: l.tool_name, url: l.url } });
      if (l.project_id) edges.push({ from: `l-${l.id}`, to: `p-${l.project_id}`, label: 'in project' });
      for (const t of (l.tags || [])) {
        if (!tagSet.has(t)) { tagSet.add(t); nodes.push({ id: `t-${t}`, label: t, type: 'tag' }); }
        edges.push({ from: `l-${l.id}`, to: `t-${t}` });
      }
    }
    for (const pl of data.plans) {
      nodes.push({ id: `pl-${pl.id}`, label: pl.title, type: 'project', entityId: pl.id, meta: { status: pl.status, entityType: 'plan' } });
      if (pl.project_id) edges.push({ from: `pl-${pl.id}`, to: `p-${pl.project_id}`, label: 'plan for' });
      for (const t of (pl.tags || [])) {
        if (!tagSet.has(t)) { tagSet.add(t); nodes.push({ id: `t-${t}`, label: t, type: 'tag' }); }
        edges.push({ from: `pl-${pl.id}`, to: `t-${t}` });
      }
    }
    const prefixMap: Record<string, string> = { asset: 'a', storyboard: 's', project: 'p', plan: 'pl', doc: 'd', link: 'l', task: 'k', team: 'm' };
    for (const pe of data.provEdges) {
      const fromKey = `${prefixMap[pe.source_type] || pe.source_type}-${pe.source_id}`;
      const toKey = `${prefixMap[pe.target_type] || pe.target_type}-${pe.target_id}`;
      edges.push({ from: fromKey, to: toKey, label: pe.relationship });
    }
    return { allNodes: nodes, allEdges: edges };
  }, [data]);

  // Filter
  const lowerSearch = search.toLowerCase();
  const filteredIds = new Set(
    allNodes.filter(n => !hiddenTypes.has(n.type) && (!search || n.label.toLowerCase().includes(lowerSearch))).map(n => n.id)
  );
  const expandedIds = new Set(filteredIds);
  if (search) {
    for (const e of allEdges) {
      if (filteredIds.has(e.from)) expandedIds.add(e.to);
      if (filteredIds.has(e.to)) expandedIds.add(e.from);
    }
  }
  const visibleNodes = allNodes.filter(n => !hiddenTypes.has(n.type) && (search ? expandedIds.has(n.id) : true));
  const visibleEdges = allEdges.filter(e => {
    const fromNode = allNodes.find(n => n.id === e.from);
    const toNode = allNodes.find(n => n.id === e.to);
    if (fromNode && hiddenTypes.has(fromNode.type)) return false;
    if (toNode && hiddenTypes.has(toNode.type)) return false;
    return search ? expandedIds.has(e.from) && expandedIds.has(e.to) : true;
  });

  const selectedNode = selectedNodeId ? allNodes.find(n => n.id === selectedNodeId) || null : null;

  const toggleType = (type: NodeType) => {
    setHiddenTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const handlePinToggle = useCallback((nodeId: string) => {
    setPinnedNodes(prev => {
      const next = { ...prev };
      if (next[nodeId]) delete next[nodeId];
      else next[nodeId] = { x: 0, y: 0 };
      return next;
    });
  }, []);

  const handleNodeRightClick = useCallback((nodeId: string, event: MouseEvent) => {
    setContextMenu({ nodeId, x: event.clientX, y: event.clientY });
  }, []);

  const handleShowOnlyConnected = useCallback((nodeId: string) => {
    const connected = new Set<string>([nodeId]);
    for (const e of allEdges) {
      if (e.from === nodeId) connected.add(e.to);
      if (e.to === nodeId) connected.add(e.from);
    }
    const connectedNodes = allNodes.filter(n => connected.has(n.id));
    const typesToHide = new Set<NodeType>(Object.keys(NODE_TYPE_CONFIG) as NodeType[]);
    for (const n of connectedNodes) typesToHide.delete(n.type);
    // Don't hide types that have connected nodes, but set search to filter
    setSearch(allNodes.find(n => n.id === nodeId)?.label || '');
  }, [allNodes, allEdges]);

  const handleLoadPreset = useCallback((config: PresetConfig) => {
    setHiddenTypes(new Set(config.hiddenTypes || []));
    setSearch(config.search || '');
    setViewMode(config.viewMode || '2d');
    setGraphViewMode(config.graphViewMode || 'graph');
    setPinnedNodes(config.pinnedNodes || {});
    setLinkThickness(config.linkThickness || 1);
  }, []);

  const currentPresetConfig: PresetConfig = {
    hiddenTypes: Array.from(hiddenTypes),
    search,
    viewMode,
    graphViewMode,
    pinnedNodes,
    linkThickness,
  };

  const ToolbarToggle = ({ options, value, onChange }: { options: { value: string; icon: React.ReactNode; label: string }[]; value: string; onChange: (v: any) => void }) => (
    <div className="flex items-center gap-0.5 rounded-md border border-border bg-secondary p-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
            value === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
          title={opt.label}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 h-[calc(100vh-0px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" /> {t('connections.title')}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {visibleNodes.length} nodes · {visibleEdges.length} connections
              {Object.keys(pinnedNodes).length > 0 && ` · ${Object.keys(pinnedNodes).length} pinned`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Graph / List / Matrix */}
            <ToolbarToggle
              value={graphViewMode}
              onChange={setGraphViewMode}
              options={[
                { value: 'graph', icon: <Network className="w-3.5 h-3.5" />, label: 'Graph' },
                { value: 'list', icon: <List className="w-3.5 h-3.5" />, label: 'List' },
                { value: 'matrix', icon: <Grid3x3 className="w-3.5 h-3.5" />, label: 'Matrix' },
              ]}
            />
            {/* 2D / 3D (only for graph mode) */}
            {graphViewMode === 'graph' && (
              <>
                <ToolbarToggle
                  value={viewMode}
                  onChange={setViewMode}
                  options={[
                    { value: '2d', icon: <Square className="w-3.5 h-3.5" />, label: '2D' },
                    { value: '3d', icon: <Box className="w-3.5 h-3.5" />, label: '3D' },
                  ]}
                />
                {/* Auto / Manual */}
                <ToolbarToggle
                  value={freezePhysics ? 'manual' : 'auto'}
                  onChange={(v: string) => setFreezePhysics(v === 'manual')}
                  options={[
                    { value: 'auto', icon: <Unlock className="w-3.5 h-3.5" />, label: 'Auto' },
                    { value: 'manual', icon: <Lock className="w-3.5 h-3.5" />, label: 'Manual' },
                  ]}
                />
                {/* Link Thickness */}
                <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-border bg-secondary">
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">Thickness</span>
                  <Slider
                    value={[linkThickness]}
                    onValueChange={v => setLinkThickness(v[0])}
                    min={0.3}
                    max={3}
                    step={0.1}
                    className="w-16"
                  />
                </div>
                {/* Graph Theme */}
                <ToolbarToggle
                  value={graphTheme}
                  onChange={setGraphTheme}
                  options={[
                    { value: 'system', icon: <Monitor className="w-3.5 h-3.5" />, label: 'Auto' },
                    { value: 'light', icon: <Sun className="w-3.5 h-3.5" />, label: 'Light' },
                    { value: 'dark', icon: <Moon className="w-3.5 h-3.5" />, label: 'Dark' },
                  ]}
                />
              </>
            )}
            <GraphPresetManager currentConfig={currentPresetConfig} onLoadPreset={handleLoadPreset} />
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border max-w-xs">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter nodes..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
              />
            </div>
          </div>
        </div>

        {/* Type filter toggles */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {(Object.entries(NODE_TYPE_CONFIG) as [NodeType, typeof NODE_TYPE_CONFIG[NodeType]][]).map(([type, cfg]) => {
            const hidden = hiddenTypes.has(type);
            const count = allNodes.filter(n => n.type === type).length;
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                  hidden
                    ? 'border-border bg-secondary/50 text-muted-foreground opacity-50'
                    : 'border-border bg-secondary text-foreground'
                }`}
              >
                {hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hidden ? 'gray' : cfg.color }} />
                {cfg.label}
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 ml-0.5">{count}</Badge>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : visibleNodes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Network className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm">No data to visualize yet</p>
          </div>
        ) : (
          <div className={`flex-1 flex gap-0 rounded-lg border border-border overflow-hidden ${resolvedGraphTheme === 'light' ? 'bg-white' : 'bg-card'}`}>
            <div ref={graphContainerRef} className={`${selectedNode ? 'flex-1' : 'w-full'} transition-all relative`}>
              {graphViewMode === 'graph' && (
                <ForceGraphView
                  nodes={visibleNodes}
                  edges={visibleEdges}
                  highlightIds={search ? filteredIds : undefined}
                  selectedId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  onNodeRightClick={handleNodeRightClick}
                  onNodeDoubleClick={handlePinToggle}
                  mode={viewMode}
                  width={dimensions.width}
                  height={dimensions.height}
                  freezePhysics={freezePhysics}
                  pinnedNodes={pinnedNodes}
                  linkThicknessMultiplier={linkThickness}
                  theme={resolvedGraphTheme}
                />
              )}
              {graphViewMode === 'list' && (
                <ConnectionListView
                  nodes={visibleNodes}
                  edges={visibleEdges}
                  selectedId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                />
              )}
              {graphViewMode === 'matrix' && (
                <ConnectionMatrixView
                  nodes={visibleNodes}
                  edges={visibleEdges}
                  selectedId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                />
              )}
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

        {/* Context menu */}
        {contextMenu && (
          <GraphContextMenu
            nodeId={contextMenu.nodeId}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            allNodes={allNodes}
            allEdges={allEdges}
            pinnedNodes={pinnedNodes}
            onClose={() => setContextMenu(null)}
            onPinToggle={handlePinToggle}
            onHideType={toggleType}
            onShowOnlyConnected={handleShowOnlyConnected}
          />
        )}
      </div>
    </AppLayout>
  );
}
