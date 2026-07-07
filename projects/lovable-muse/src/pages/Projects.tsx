import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Loader2, FolderOpen, Clock, X, ChevronRight, ChevronDown, MoveRight, Upload, Download, Link2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import ProjectSelect from '@/components/shared/ProjectSelect';
import ThumbnailSettings from '@/components/dashboard/ThumbnailSettings';
import TagInput from '@/components/shared/TagInput';
import ContentTypeSelect, { CONTENT_TYPES } from '@/components/shared/ContentTypeSelect';
import ViewToolbar, { ViewMode, groupItems, sortItems } from '@/components/shared/ViewToolbar';
import ListView, { Column } from '@/components/shared/ListView';
import KanbanView from '@/components/shared/KanbanView';
import ProjectDetailPanel from '@/components/dashboard/ProjectDetailPanel';
import NestedProjectRow, { countDescendants, groupByPhase, PHASE_ORDER } from '@/components/dashboard/NestedProjectRow';
import ExportDialog from '@/components/shared/ExportDialog';
import BulkAttachDialog from '@/components/shared/BulkAttachDialog';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const phaseColors: Record<string, string> = {
  start: 'bg-phase-start/20 text-phase-start',
  build: 'bg-phase-build/20 text-phase-build',
  grow: 'bg-phase-grow/20 text-phase-grow',
};

interface Project {
  id: string;
  name: string;
  description: string | null;
  phase: string;
  thumbnail_url: string | null;
  thumbnail_fit: string;
  thumbnail_focus_x: number;
  thumbnail_focus_y: number;
  updated_at: string;
  created_at: string;
  owner_id: string;
  parent_id: string | null;
}

interface TreeNode extends Project {
  children: TreeNode[];
  depth: number;
}

function buildTree(projects: Project[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  for (const p of projects) map.set(p.id, { ...p, children: [], depth: 0 });
  const roots: TreeNode[] = [];
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const setDepth = (nodes: TreeNode[], d: number) => {
    for (const n of nodes) { n.depth = d; setDepth(n.children, d + 1); }
  };
  setDepth(roots, 0);
  return roots;
}

const SEED_WORKSPACES = [
  'MANRIQUE', 'PIXEL', 'VIRTUOS', 'GAME OF LIFE', 'MAGIC TIGER STUDIO',
  'GARFIELD', 'LEGEND UNITE', 'Vamperros', 'ALUZINA', 'CLIENTS',
  'BLUE FAIRY', 'Christy Fairy & Doctorita', 'My Magic Mentor',
  'Justin OS', 'Loraine OS', 'Marine Aquarium',
];

export default function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterPhase, setFilterPhase] = useState<string | null>(null);
  const [filterContentType, setFilterContentType] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPhase, setNewPhase] = useState<'start' | 'build' | 'grow'>('start');
  const [newParentId, setNewParentId] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newContentType, setNewContentType] = useState('general');
  const [movingProject, setMovingProject] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showBulkAttach, setShowBulkAttach] = useState(false);
  const vp = useViewPreferences('projects');

  // Persistent collapse state
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('projects-collapsed');
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set<string>();
    } catch { return new Set<string>(); }
  });

  useEffect(() => {
    localStorage.setItem('projects-collapsed', JSON.stringify([...collapsed]));
  }, [collapsed]);

  const expandedIds = new Set(
    Array.from(collapsed).length === 0 ? [] : []
  );
  // Invert logic: we track which are *collapsed*, so expanded = NOT in collapsed
  const isExpanded = (id: string) => !collapsed.has(id);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as unknown as Project[];
    },
    enabled: !!user,
  });

  // Seed workspaces once if DB is empty
  const seedOnce = useCallback(async () => {
    if (!user || projects.length > 0 || isLoading) return;
    const inserts = SEED_WORKSPACES.map(name => ({ name, owner_id: user.id, phase: 'start' }));
    const { error } = await supabase.from('projects').insert(inserts);
    if (!error) queryClient.invalidateQueries({ queryKey: ['projects'] });
  }, [user, projects.length, isLoading, queryClient]);

  useEffect(() => { seedOnce(); }, [seedOnce]);

  const createProject = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('projects').insert({
        name: newName, description: newDesc, phase: newPhase, owner_id: user.id, parent_id: newParentId || null, tags: newTags, content_type: newContentType,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreate(false); setNewName(''); setNewDesc(''); setNewParentId(''); setNewTags([]); setNewContentType('general');
      toast({ title: 'Project created' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); toast({ title: 'Project deleted' }); },
  });

  const moveProject = useMutation({
    mutationFn: async ({ id, parentId }: { id: string; parentId: string | null }) => {
      const { error } = await supabase.from('projects').update({ parent_id: parentId }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setMovingProject(null); toast({ title: 'Project moved' }); },
  });

  const updateThumbnail = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase.from('projects').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const handleThumbnailUpload = async (projectId: string, file: File) => {
    if (!user) return;
    const ext = file.name.split('.').pop() || 'png';
    const path = `${user.id}/project-thumbs/${projectId}.${ext}`;
    const { error } = await supabase.storage.from('assets').upload(path, file, { upsert: true });
    if (error) { toast({ title: 'Upload failed', variant: 'destructive' }); return; }
    const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(path);
    updateThumbnail.mutate({ id: projectId, updates: { thumbnail_url: publicUrl } });
  };

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  // Collect available tags from all projects for the filter dropdown
  const availableTags = Array.from(new Set(projects.flatMap((p: any) => (p as any).tags || []))).sort();

  const filtered = projects.filter(p => {
    if (filterPhase && p.phase !== filterPhase) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterContentType && (p as any).content_type !== filterContentType) return false;
    if (filterTags.length > 0 && !filterTags.some(ft => ((p as any).tags || []).includes(ft))) return false;
    return true;
  });

  const sortKeyFn = (p: Project) => {
    if (vp.sortBy === 'name') return p.name;
    return p.updated_at;
  };
  const sorted = sortItems(filtered, sortKeyFn, vp.sortDir);
  const tree = buildTree(vp.view === 'grid' && !vp.groupBy ? sorted : []);

  const flatGroupKeyFn = (p: Project) => {
    if (vp.groupBy === 'phase') return p.phase.toUpperCase();
    if (vp.groupBy === 'parent') return p.parent_id ? 'Nested' : 'Top-level';
    if (vp.groupBy === 'content_type') {
      const ct = CONTENT_TYPES.find(c => c.value === (p as any).content_type);
      return ct ? `${ct.icon} ${ct.label}` : '📁 General';
    }
    return '';
  };
  const grouped = vp.groupBy ? groupItems(sorted, flatGroupKeyFn) : undefined;

  // Build expanded set for NestedProjectRow (all IDs NOT in collapsed)
  const expandedSet = new Set(
    projects.filter(p => !collapsed.has(p.id)).map(p => p.id)
  );

  const listColumns: Column<Project>[] = [
    { key: 'name', label: 'Name', render: (p) => <span className="text-foreground font-medium">{p.name}</span> },
    { key: 'phase', label: 'Phase', className: 'w-[80px]', render: (p) => <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${phaseColors[p.phase]}`}>{p.phase}</span> },
    { key: 'tags', label: 'Tags', render: (p) => (
      <div className="flex flex-wrap gap-1">
        {((p as any).tags || []).slice(0, 3).map((t: string) => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
        ))}
        {((p as any).tags || []).length > 3 && <span className="text-[10px] text-muted-foreground">+{(p as any).tags.length - 3}</span>}
      </div>
    )},
    { key: 'description', label: 'Description', render: (p) => <span className="text-muted-foreground truncate max-w-[200px] block">{p.description || '—'}</span> },
    { key: 'updated_at', label: 'Updated', className: 'w-[100px]', render: (p) => <span className="text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</span> },
  ];

  // List view with tree indentation
  const allTree = buildTree(sorted);
  const flattenTreeForList = (nodes: TreeNode[], depth = 0): (Project & { _depth: number; _hasChildren: boolean; _descendantCount: number })[] => {
    const result: (Project & { _depth: number; _hasChildren: boolean; _descendantCount: number })[] = [];
    for (const node of nodes) {
      result.push({ ...node, _depth: depth, _hasChildren: node.children.length > 0, _descendantCount: countDescendants(node) });
      if (!collapsed.has(node.id) && node.children.length > 0) {
        result.push(...flattenTreeForList(node.children, depth + 1));
      }
    }
    return result;
  };

  const treeListColumns: Column<Project & { _depth: number; _hasChildren: boolean; _descendantCount: number }>[] = [
    {
      key: 'name', label: 'Name', render: (p) => (
        <div className="flex items-center gap-1.5" style={{ paddingLeft: `${p._depth * 20}px` }}>
          {p._hasChildren ? (
            <button onClick={e => { e.stopPropagation(); toggleCollapse(p.id); }} className="text-muted-foreground hover:text-foreground shrink-0">
              {collapsed.has(p.id) ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : <span className="w-3.5 shrink-0" />}
          <span className="text-foreground font-medium">{p.name}</span>
          {p._descendantCount > 0 && (
            <span className="text-[10px] text-muted-foreground">({p._descendantCount})</span>
          )}
        </div>
      ),
    },
    { key: 'phase', label: 'Phase', className: 'w-[80px]', render: (p) => <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${phaseColors[p.phase]}`}>{p.phase}</span> },
    { key: 'description', label: 'Description', render: (p) => <span className="text-muted-foreground truncate max-w-[200px] block">{p.description || '—'}</span> },
    { key: 'updated_at', label: 'Updated', className: 'w-[100px]', render: (p) => <span className="text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</span> },
  ];

  const renderCard = (project: TreeNode, i: number) => {
    const hasChildren = project.children.length > 0;
    const isCollapsedState = collapsed.has(project.id);
    const fitMode = (project.thumbnail_fit || 'cover') as 'cover' | 'contain' | 'fill' | 'auto';
    const descendantCount = countDescendants(project);
    const phaseGroups = groupByPhase(project.children);

    return (
      <div key={project.id}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="group relative rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-all">
          <div className="aspect-video overflow-hidden bg-muted relative">
            {project.thumbnail_url ? (
              <img src={project.thumbnail_url} alt={project.name} className="w-full h-full"
                style={{ objectFit: fitMode === 'auto' ? 'scale-down' : fitMode, objectPosition: `${project.thumbnail_focus_x ?? 50}% ${project.thumbnail_focus_y ?? 50}%` }} />
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground/40 mb-1" />
                <span className="text-[10px] text-muted-foreground/40">Add thumbnail</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleThumbnailUpload(project.id, f); }} />
              </label>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent pointer-events-none" />
            {project.thumbnail_url && (
              <ThumbnailSettings thumbnailUrl={project.thumbnail_url} fit={fitMode} focusX={project.thumbnail_focus_x ?? 50} focusY={project.thumbnail_focus_y ?? 50}
                onFitChange={fit => updateThumbnail.mutate({ id: project.id, updates: { thumbnail_fit: fit } })}
                onFocusChange={(x, y) => updateThumbnail.mutate({ id: project.id, updates: { thumbnail_focus_x: x, thumbnail_focus_y: y } })} />
            )}
          </div>
          <div className="p-3">
            <div className="flex items-center gap-2 mb-1">
              {hasChildren && (
                <button onClick={() => toggleCollapse(project.id)} className="text-muted-foreground hover:text-foreground">
                  {isCollapsedState ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
              <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${phaseColors[project.phase]}`}>{project.phase}</span>
              {descendantCount > 0 && (
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {descendantCount} sub-project{descendantCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h3 onClick={() => setSelectedProjectId(project.id)} className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors cursor-pointer">{project.name}</h3>
            {project.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{project.description}</p>}
            {(project as any).tags && (project as any).tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(project as any).tags.slice(0, 4).map((tag: string) => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/80">{tag}</span>
                ))}
                {(project as any).tags.length > 4 && <span className="text-[9px] text-muted-foreground">+{(project as any).tags.length - 4}</span>}
              </div>
            )}
            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(project.updated_at).toLocaleDateString()}</span>
              <button onClick={() => setMovingProject(project.id)} className="flex items-center gap-1 text-primary/60 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <MoveRight className="w-3 h-3" /> Move
              </button>
              <button onClick={() => deleteProject.mutate(project.id)} className="ml-auto text-destructive/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
            </div>
          </div>
        </motion.div>

        {/* Phase-grouped nested children */}
        {hasChildren && !isCollapsedState && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="ml-4 mt-2 mb-3 rounded-lg border border-border/50 bg-secondary/20 p-2"
          >
            {PHASE_ORDER.filter(p => phaseGroups[p]?.length).map(phase => (
              <div key={phase} className="mb-1 last:mb-0">
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${phaseColors[phase]?.split(' ')[1] || 'text-muted-foreground'}`}>
                    {phase}
                  </span>
                  <span className="text-[9px] text-muted-foreground">({phaseGroups[phase].length})</span>
                </div>
                {phaseGroups[phase].map(child => (
                  <NestedProjectRow
                    key={child.id}
                    project={child}
                    isExpanded={!collapsed.has(child.id)}
                    onToggle={toggleCollapse}
                    onSelect={setSelectedProjectId}
                    expandedIds={expandedSet}
                  />
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  const renderKanbanCard = (p: Project) => {
    const pTree = buildTree(projects.filter(pp => pp.parent_id === p.id || pp.id === p.id));
    const node = pTree.find(n => n.id === p.id);
    const desc = node ? countDescendants(node) : 0;
    return (
      <div onClick={() => setSelectedProjectId(p.id)} className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-all cursor-pointer">
        <h4 className="text-xs font-semibold text-foreground truncate">{p.name}</h4>
        {p.description && <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{p.description}</p>}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</span>
          {desc > 0 && <span className="text-[10px] text-muted-foreground">({desc} sub)</span>}
        </div>
      </div>
    );
  };

  const flatTreeList = flattenTreeForList(allTree);

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-foreground">All Projects</h1>
          <div className="flex items-center gap-2">
            {projects.length > 0 && (
              <button onClick={() => setShowBulkAttach(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-opacity border border-border">
                <Link2 className="w-4 h-4" /> Bulk Attach
              </button>
            )}
            <button onClick={() => setShowExport(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-opacity border border-border">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        </div>

        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">New Project</h3>
              <button onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Project name"
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <ProjectSelect value={newParentId} onChange={setNewParentId} placeholder="Parent project (optional)" />
              <div className="flex gap-2">
                {(['start', 'build', 'grow'] as const).map(phase => (
                  <button key={phase} onClick={() => setNewPhase(phase)}
                    className={`px-3 py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition-colors ${newPhase === phase ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground border border-border'}`}>{phase}</button>
                ))}
              </div>
              <button onClick={() => createProject.mutate()} disabled={!newName.trim() || createProject.isPending}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                {createProject.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Create Project
              </button>
            </div>
          </motion.div>
        )}

        {movingProject && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-lg border border-primary/30 bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Move "{projects.find(p => p.id === movingProject)?.name}"</h3>
              <button onClick={() => setMovingProject(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="flex gap-2">
              <ProjectSelect value="" onChange={id => moveProject.mutate({ id: movingProject, parentId: id || null })} placeholder="Select new parent..." excludeIds={new Set([movingProject])} className="flex-1" />
              <button onClick={() => moveProject.mutate({ id: movingProject, parentId: null })}
                className="px-3 py-2 rounded-md bg-secondary text-xs font-medium text-foreground hover:bg-secondary/80 border border-border">Move to top level</button>
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
          </div>
          {['start', 'build', 'grow'].map(phase => (
            <button key={phase} onClick={() => setFilterPhase(filterPhase === phase ? null : phase)}
              className={`px-3 py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition-colors ${filterPhase === phase ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground border border-border hover:text-foreground'}`}>{phase}</button>
          ))}
          <ViewToolbar
            views={['grid', 'list', 'kanban']}
            view={vp.view}
            onViewChange={vp.setView}
            contentTypeOptions={CONTENT_TYPES.map(ct => ({ value: ct.value, label: ct.label, icon: ct.icon }))}
            filterContentType={filterContentType}
            onFilterContentTypeChange={setFilterContentType}
            tagOptions={availableTags}
            filterTags={filterTags}
            onFilterTagsChange={setFilterTags}
            groupByOptions={[
              { value: 'phase', label: 'Phase' },
              { value: 'parent', label: 'Nesting' },
              { value: 'content_type', label: 'Content Type' },
            ]}
            groupBy={vp.groupBy}
            onGroupByChange={vp.setGroupBy}
            sortOptions={[
              { value: 'updated_at', label: 'Date' },
              { value: 'name', label: 'Name' },
            ]}
            sortBy={vp.sortBy}
            onSortByChange={vp.setSortBy}
            sortDir={vp.sortDir}
            onSortDirChange={vp.setSortDir}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : vp.view === 'list' ? (
          <ListView items={flatTreeList} columns={treeListColumns} keyFn={p => p.id} onItemClick={p => setSelectedProjectId(p.id)} groups={grouped} />
        ) : vp.view === 'kanban' ? (
          <KanbanView
            columns={grouped || groupItems(sorted, p => p.phase.toUpperCase())}
            renderCard={renderKanbanCard}
            keyFn={p => p.id}
            columnOrder={['START', 'BUILD', 'GROW']}
          />
        ) : tree.length === 0 && !vp.groupBy ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Filter className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm">{projects.length === 0 ? 'Create your first project above' : 'No projects match your filters'}</p>
          </div>
        ) : vp.groupBy && grouped ? (
          Object.entries(grouped).map(([gName, items]) => (
            <div key={gName} className="mb-6">
              <h3 className="text-xs font-semibold text-foreground mb-3">{gName} ({items.length})</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                {buildTree(items).map((node, i) => renderCard(node, i))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {tree.map((node, i) => renderCard(node, i))}
          </div>
        )}
      </div>
      {selectedProjectId && (
        <ProjectDetailPanel projectId={selectedProjectId} onClose={() => setSelectedProjectId(null)} />
      )}
      <ExportDialog open={showExport} onClose={() => setShowExport(false)} />

      {showBulkAttach && (
        <BulkAttachDialog
          sources={projects.map((p: any) => ({ id: p.id, type: 'project', label: p.name }))}
          defaultTargetType="plan"
          onClose={() => setShowBulkAttach(false)}
        />
      )}
    </AppLayout>
  );
}
