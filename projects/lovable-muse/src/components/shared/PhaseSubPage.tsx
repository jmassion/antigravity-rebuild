import { useState } from 'react';
import { Search, Plus, Loader2, Clock, Upload, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import ViewToolbar, { ViewMode, groupItems, sortItems } from '@/components/shared/ViewToolbar';
import ListView, { Column } from '@/components/shared/ListView';
import KanbanView from '@/components/shared/KanbanView';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PhaseSubPageProps {
  title: string;
  description: string;
  phase: string;
  /** Filter assets by these file types (optional) */
  fileTypes?: string[];
  /** Tags to auto-assign to new assets uploaded here */
  autoTags?: string[];
  icon: string;
}

const typeIcons: Record<string, string> = { image: '🖼️', video: '🎬', audio: '🎵', document: '📄', model: '🎮' };

export default function PhaseSubPage({ title, description, phase, fileTypes, autoTags = [], icon }: PhaseSubPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [groupBy, setGroupBy] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Get projects in this phase
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.id, phase],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, thumbnail_url, updated_at, phase')
        .eq('phase', phase)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get assets linked to these projects, optionally filtered by type
  const projectIds = projects.map(p => p.id);
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['phase-assets', user?.id, phase, fileTypes],
    queryFn: async () => {
      if (projectIds.length === 0) return [];
      let query = supabase
        .from('assets')
        .select('*, asset_projects(project_id, projects(name))')
        .order('updated_at', { ascending: false });

      // Filter by tags matching the autoTags if present
      if (autoTags.length > 0) {
        query = query.overlaps('tags', autoTags);
      }

      if (fileTypes && fileTypes.length > 0) {
        query = query.in('file_type', fileTypes);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter to assets that are in projects of this phase or have matching tags
      return data.filter((a: any) => {
        const assetProjectIds = (a.asset_projects || []).map((ap: any) => ap.project_id);
        const inPhaseProject = assetProjectIds.some((id: string) => projectIds.includes(id));
        const hasTag = autoTags.some(t => (a.tags || []).includes(t) || (a.ai_tags || []).includes(t));
        return inPhaseProject || hasTag;
      });
    },
    enabled: !!user && projectIds.length > 0,
  });

  // Also show projects themselves
  const allItems = [
    ...projects.map(p => ({ ...p, _type: 'project' as const })),
    ...assets.map(a => ({ ...a, _type: 'asset' as const })),
  ];

  const filtered = allItems.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return item.name.toLowerCase().includes(q) ||
      ('description' in item && (item.description || '').toLowerCase().includes(q));
  });

  const sortKeyFn = (item: any) => {
    if (sortBy === 'name') return item.name;
    if (sortBy === 'type') return item._type;
    return item.updated_at;
  };
  const sorted = sortItems(filtered, sortKeyFn, sortDir);

  const groupKeyFn = (item: any) => {
    if (groupBy === 'type') return item._type === 'project' ? '📂 Projects' : `${typeIcons[item.file_type] || '📄'} ${item.file_type || 'Assets'}`;
    if (groupBy === 'project') {
      if (item._type === 'project') return `📂 ${item.name}`;
      const names = (item.asset_projects || []).map((ap: any) => ap.projects?.name).filter(Boolean);
      return names[0] ? `📂 ${names[0]}` : 'Unlinked';
    }
    return '';
  };
  const grouped = groupBy ? groupItems(sorted, groupKeyFn) : undefined;

  const listColumns: Column<any>[] = [
    {
      key: 'icon', label: '', className: 'w-10',
      render: (item) => item._type === 'project'
        ? <span className="text-lg">📂</span>
        : <div className="w-8 h-8 rounded bg-muted overflow-hidden flex items-center justify-center text-xs">
            {item.thumbnail_url ? <img src={item.thumbnail_url} className="w-full h-full object-cover" /> : typeIcons[item.file_type] || '📄'}
          </div>,
    },
    { key: 'name', label: 'Name', render: (item) => <span className="text-foreground font-medium">{item.name}</span> },
    { key: 'type', label: 'Type', className: 'w-[80px]', render: (item) => <span className="text-muted-foreground">{item._type === 'project' ? 'Project' : item.file_type}</span> },
    { key: 'date', label: 'Updated', className: 'w-[100px]', render: (item) => <span className="text-muted-foreground">{new Date(item.updated_at).toLocaleDateString()}</span> },
  ];

  const renderGridCard = (item: any, i: number) => {
    if (item._type === 'project') {
      return (
        <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-all cursor-pointer group">
          <div className="aspect-video bg-muted overflow-hidden">
            {item.thumbnail_url
              ? <img src={item.thumbnail_url} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground/30">📂</div>}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold text-foreground truncate">{item.name}</h3>
            {item.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.description}</p>}
          </div>
        </motion.div>
      );
    }
    return (
      <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
        className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-all cursor-pointer group">
        <div className="aspect-square bg-muted overflow-hidden relative">
          {item.thumbnail_url
            ? <img src={item.thumbnail_url} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground/40">{typeIcons[item.file_type] || '📄'}</div>}
          <div className="absolute top-2 left-2 text-sm">{typeIcons[item.file_type]}</div>
        </div>
        <div className="p-2.5">
          <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
          <span className="text-[10px] text-muted-foreground">{new Date(item.updated_at).toLocaleDateString()}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-xl">{icon}</span> {title}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border max-w-sm flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`}
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
          </div>
          <ViewToolbar
            views={['grid', 'list']}
            view={view}
            onViewChange={setView}
            groupByOptions={[
              { value: 'type', label: 'Type' },
              { value: 'project', label: 'Project' },
            ]}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            sortOptions={[
              { value: 'updated_at', label: 'Date' },
              { value: 'name', label: 'Name' },
              { value: 'type', label: 'Type' },
            ]}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortDir={sortDir}
            onSortDirChange={setSortDir}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <span className="text-3xl mb-3">{icon}</span>
            <p className="text-sm">No {title.toLowerCase()} yet</p>
            <p className="text-xs mt-1">Create a project with the "{phase}" phase and upload assets to get started</p>
          </div>
        ) : view === 'list' ? (
          <ListView items={sorted} columns={listColumns} keyFn={i => i.id} groups={grouped} />
        ) : grouped ? (
          Object.entries(grouped).map(([gName, items]) => (
            <div key={gName} className="mb-6">
              <h3 className="text-xs font-semibold text-foreground mb-3">{gName} ({items.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {items.map((item: any, i: number) => renderGridCard(item, i))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {sorted.map((item, i) => renderGridCard(item, i))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
