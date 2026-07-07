import { useState, useMemo } from 'react';
import { Search, Upload, Loader2, Tag, Clock, FolderOpen, Link2, X, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import FileDropZone from '@/components/shared/FileDropZone';
import AssetDetailPanel from '@/components/dashboard/AssetDetailPanel';
import VideoThumbnail from '@/components/dashboard/VideoThumbnail';
import VideoPreviewModal from '@/components/dashboard/VideoPreviewModal';
import ViewToolbar, { ViewMode, groupItems, sortItems } from '@/components/shared/ViewToolbar';
import ListView, { Column } from '@/components/shared/ListView';
import KanbanView from '@/components/shared/KanbanView';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BulkAttachDialog from '@/components/shared/BulkAttachDialog';
import { useI18n } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

const typeIcons: Record<string, string> = {
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  document: '📄',
  model: '🎮',
};

export default function Assets() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [videoPreview, setVideoPreview] = useState<{ src: string; name: string } | null>(null);
  const [showBulkAttach, setShowBulkAttach] = useState(false);
  const [filterProjects, setFilterProjects] = useState<Set<string>>(new Set());
  const [filterTags, setFilterTags] = useState<Set<string>>(new Set());
  const [filterTypes, setFilterTypes] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const vp = useViewPreferences('assets');

  const isVideo = (fileType: string) => fileType === 'video';

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*, asset_projects(project_id, projects(name))')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Extract all available facets from loaded data
  const facets = useMemo(() => {
    const projects = new Map<string, string>(); // id -> name
    const tags = new Set<string>();
    const types = new Set<string>();
    for (const a of assets) {
      types.add(a.file_type);
      for (const t of (a.tags || [])) tags.add(t);
      for (const t of (a.ai_tags || [])) tags.add(t);
      for (const ap of (a.asset_projects || [])) {
        if (ap.projects?.name) projects.set(ap.project_id, ap.projects.name);
      }
    }
    return {
      projects: Array.from(projects.entries()).sort((a, b) => a[1].localeCompare(b[1])),
      tags: Array.from(tags).sort(),
      types: Array.from(types).sort(),
    };
  }, [assets]);

  const activeFilterCount = filterProjects.size + filterTags.size + filterTypes.size;

  const filtered = assets.filter(a => {
    // Text search
    if (search) {
      const q = search.toLowerCase();
      const match = a.name.toLowerCase().includes(q) ||
        (a.tags || []).some((t: string) => t.includes(q)) ||
        (a.ai_tags || []).some((t: string) => t.includes(q)) ||
        (a.ai_description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    // Facet: project
    if (filterProjects.size > 0) {
      const assetProjectIds = (a.asset_projects || []).map((ap: any) => ap.project_id);
      if (!assetProjectIds.some((pid: string) => filterProjects.has(pid))) return false;
    }
    // Facet: tag
    if (filterTags.size > 0) {
      const allTags = [...(a.tags || []), ...(a.ai_tags || [])];
      if (!allTags.some(t => filterTags.has(t))) return false;
    }
    // Facet: content type
    if (filterTypes.size > 0) {
      if (!filterTypes.has(a.file_type)) return false;
    }
    return true;
  });

  const sortKeyFn = (a: any) => {
    if (vp.sortBy === 'name') return a.name;
    if (vp.sortBy === 'file_size') return a.file_size || 0;
    if (vp.sortBy === 'file_type') return a.file_type;
    return a.updated_at;
  };
  const sorted = sortItems(filtered, sortKeyFn, vp.sortDir);

  const groupKeyFn = (a: any) => {
    if (vp.groupBy === 'file_type') return typeIcons[a.file_type] ? `${typeIcons[a.file_type]} ${a.file_type}` : a.file_type;
    if (vp.groupBy === 'project') {
      const names = (a.asset_projects || []).map((ap: any) => ap.projects?.name).filter(Boolean);
      return names.length > 0 ? names[0] : 'Unlinked';
    }
    return '';
  };
  const grouped = vp.groupBy ? groupItems(sorted, groupKeyFn) : undefined;

  const subGroupKeyFn = (a: any) => {
    if (vp.subGroupBy === 'file_type') return a.file_type;
    if (vp.subGroupBy === 'project') {
      const names = (a.asset_projects || []).map((ap: any) => ap.projects?.name).filter(Boolean);
      return names[0] || 'Unlinked';
    }
    return '';
  };

  const subGrouped = vp.groupBy && vp.subGroupBy ? (() => {
    const result: Record<string, Record<string, any[]>> = {};
    if (grouped) {
      for (const [gName, gItems] of Object.entries(grouped)) {
        result[gName] = groupItems(gItems, subGroupKeyFn);
      }
    }
    return result;
  })() : undefined;

  const columns: Column<any>[] = [
    {
      key: 'thumb',
      label: '',
      className: 'w-10',
      render: (a) => (
        <div className="w-8 h-8 rounded bg-muted overflow-hidden flex items-center justify-center text-xs">
          {a.thumbnail_url ? <img src={a.thumbnail_url} className="w-full h-full object-cover" /> : typeIcons[a.file_type] || '📄'}
        </div>
      ),
    },
    { key: 'name', label: 'Name', render: (a) => <span className="text-foreground font-medium truncate">{a.name}</span> },
    { key: 'file_type', label: 'Type', className: 'w-[80px]', render: (a) => <span className="text-muted-foreground">{typeIcons[a.file_type]} {a.file_type}</span> },
    {
      key: 'tags', label: 'Tags', className: 'w-[100px]',
      render: (a) => <span className="text-muted-foreground">{(a.tags || []).length + (a.ai_tags || []).length}</span>,
    },
    { key: 'updated_at', label: 'Updated', className: 'w-[100px]', render: (a) => <span className="text-muted-foreground">{new Date(a.updated_at).toLocaleDateString()}</span> },
  ];

  const renderGridCard = (asset: any, i: number) => {
    const projectNames = (asset.asset_projects || []).map((ap: any) => ap.projects?.name).filter(Boolean);
    return (
      <motion.div
        key={asset.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.03 }}
        className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
        onClick={() => setSelectedAsset(asset)}
      >
        <div className="aspect-square overflow-hidden relative bg-muted">
          {isVideo(asset.file_type) ? (
            <VideoThumbnail
              src={asset.file_url}
              poster={asset.thumbnail_url}
              alt={asset.name}
              className="w-full h-full"
              onClickPlay={() => setVideoPreview({ src: asset.file_url, name: asset.name })}
            />
          ) : asset.thumbnail_url ? (
            <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-2xl">{typeIcons[asset.file_type] || '📄'}</div>
          )}
          <div className="absolute top-2 left-2 text-sm">{typeIcons[asset.file_type]}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
        <div className="p-2.5">
          <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Tag className="w-3 h-3" />{(asset.tags || []).length + (asset.ai_tags || []).length}</span>
            {projectNames.length > 0 && <span className="flex items-center gap-0.5"><FolderOpen className="w-3 h-3" />{projectNames.length}</span>}
            <span className="flex items-center gap-0.5 ml-auto"><Clock className="w-3 h-3" />{new Date(asset.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderKanbanCard = (asset: any, i: number) => (
    <div
      key={asset.id}
      onClick={() => setSelectedAsset(asset)}
      className="rounded-lg border border-border bg-card p-2.5 hover:border-primary/30 transition-all cursor-pointer"
    >
      {asset.thumbnail_url && (
        <div className="aspect-video rounded overflow-hidden mb-2 bg-muted">
          <img src={asset.thumbnail_url} className="w-full h-full object-cover" />
        </div>
      )}
      <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
      <span className="text-[10px] text-muted-foreground">{new Date(asset.updated_at).toLocaleDateString()}</span>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-foreground">{t('assets.title')}</h1>
          <div className="flex items-center gap-2">
            {assets.length > 0 && (
              <button onClick={() => setShowBulkAttach(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border text-sm font-medium text-foreground hover:bg-secondary/80 transition-opacity">
                <Link2 className="w-4 h-4" /> Bulk Attach
              </button>
            )}
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        </div>

        {showUpload && <div className="mb-6"><FileDropZone /></div>}

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border max-w-sm flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets by name, tag, or description..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
              activeFilterCount > 0
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 ml-0.5">{activeFilterCount}</Badge>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setFilterProjects(new Set()); setFilterTags(new Set()); setFilterTypes(new Set()); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
          <ViewToolbar
            views={['grid', 'list', 'kanban']}
            view={vp.view}
            onViewChange={vp.setView}
            groupByOptions={[
              { value: 'file_type', label: 'Type' },
              { value: 'project', label: 'Project' },
            ]}
            groupBy={vp.groupBy}
            onGroupByChange={vp.setGroupBy}
            subGroupByOptions={vp.groupBy ? [
              { value: 'file_type', label: 'Type' },
              { value: 'project', label: 'Project' },
            ].filter(o => o.value !== vp.groupBy) : []}
            subGroupBy={vp.subGroupBy}
            onSubGroupByChange={vp.setSubGroupBy}
            sortOptions={[
              { value: 'updated_at', label: 'Date' },
              { value: 'name', label: 'Name' },
              { value: 'file_size', label: 'Size' },
              { value: 'file_type', label: 'Type' },
            ]}
            sortBy={vp.sortBy}
            onSortByChange={vp.setSortBy}
            sortDir={vp.sortDir}
            onSortDirChange={vp.setSortDir}
          />
        </div>

        {/* Faceted filter panel */}
        {showFilters && (
          <div className="mb-4 rounded-lg border border-border bg-secondary/30 p-4 space-y-4">
            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Array.from(filterProjects).map(pid => {
                  const name = facets.projects.find(([id]) => id === pid)?.[1] || pid;
                  return (
                    <Badge key={`fp-${pid}`} variant="outline" className="text-xs gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => {
                      const next = new Set(filterProjects); next.delete(pid); setFilterProjects(next);
                    }}>
                      <FolderOpen className="w-3 h-3" /> {name} <X className="w-3 h-3" />
                    </Badge>
                  );
                })}
                {Array.from(filterTags).map(tag => (
                  <Badge key={`ft-${tag}`} variant="outline" className="text-xs gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => {
                    const next = new Set(filterTags); next.delete(tag); setFilterTags(next);
                  }}>
                    <Tag className="w-3 h-3" /> {tag} <X className="w-3 h-3" />
                  </Badge>
                ))}
                {Array.from(filterTypes).map(ft => (
                  <Badge key={`fty-${ft}`} variant="outline" className="text-xs gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => {
                    const next = new Set(filterTypes); next.delete(ft); setFilterTypes(next);
                  }}>
                    {typeIcons[ft] || '📄'} {ft} <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Project facet */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" /> Projects
                </p>
                <div className="space-y-0.5 max-h-[140px] overflow-y-auto">
                  {facets.projects.map(([id, name]) => {
                    const active = filterProjects.has(id);
                    const count = assets.filter(a => (a.asset_projects || []).some((ap: any) => ap.project_id === id)).length;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          const next = new Set(filterProjects);
                          active ? next.delete(id) : next.add(id);
                          setFilterProjects(next);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                          active ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        <span className="truncate">{name}</span>
                        <span className="text-muted-foreground text-[10px] ml-1">{count}</span>
                      </button>
                    );
                  })}
                  {facets.projects.length === 0 && <p className="text-[10px] text-muted-foreground">No projects linked</p>}
                </div>
              </div>

              {/* Content type facet */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Content Type
                </p>
                <div className="space-y-0.5 max-h-[140px] overflow-y-auto">
                  {facets.types.map(ft => {
                    const active = filterTypes.has(ft);
                    const count = assets.filter(a => a.file_type === ft).length;
                    return (
                      <button
                        key={ft}
                        onClick={() => {
                          const next = new Set(filterTypes);
                          active ? next.delete(ft) : next.add(ft);
                          setFilterTypes(next);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                          active ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        <span>{typeIcons[ft] || '📄'} {ft}</span>
                        <span className="text-muted-foreground text-[10px]">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag facet */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Tags
                </p>
                <div className="space-y-0.5 max-h-[140px] overflow-y-auto">
                  {facets.tags.slice(0, 30).map(tag => {
                    const active = filterTags.has(tag);
                    const count = assets.filter(a => [...(a.tags || []), ...(a.ai_tags || [])].includes(tag)).length;
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          const next = new Set(filterTags);
                          active ? next.delete(tag) : next.add(tag);
                          setFilterTags(next);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                          active ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        <span className="truncate">{tag}</span>
                        <span className="text-muted-foreground text-[10px] ml-1">{count}</span>
                      </button>
                    );
                  })}
                  {facets.tags.length > 30 && <p className="text-[10px] text-muted-foreground px-2 py-1">+{facets.tags.length - 30} more</p>}
                  {facets.tags.length === 0 && <p className="text-[10px] text-muted-foreground">No tags yet</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : vp.view === 'list' ? (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">{sorted.length} Assets</h2>
            <ListView
              items={sorted}
              columns={columns}
              keyFn={a => a.id}
              onItemClick={setSelectedAsset}
              groups={grouped}
              subGroups={subGrouped}
            />
          </div>
        ) : vp.view === 'kanban' ? (
          <KanbanView
            columns={grouped || groupItems(sorted, a => `${typeIcons[a.file_type]} ${a.file_type}`)}
            renderCard={renderKanbanCard}
            keyFn={a => a.id}
          />
        ) : (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">{sorted.length} Assets</h2>
            {subGrouped ? (
              Object.entries(subGrouped).map(([gName, subs]) => (
                <div key={gName} className="mb-6">
                  <h3 className="text-xs font-semibold text-foreground mb-2">{gName} ({Object.values(subs).flat().length})</h3>
                  {Object.entries(subs).map(([subName, items]) => (
                    <div key={subName} className="ml-4 mb-4">
                      <h4 className="text-[11px] font-medium text-muted-foreground mb-2">{subName} ({items.length})</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {items.map((asset: any, i: number) => renderGridCard(asset, i))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : grouped ? (
              Object.entries(grouped).map(([gName, items]) => (
                <div key={gName} className="mb-6">
                  <h3 className="text-xs font-semibold text-foreground mb-2">{gName} ({items.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {items.map((asset: any, i: number) => renderGridCard(asset, i))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {sorted.map((asset, i) => renderGridCard(asset, i))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedAsset && <AssetDetailPanel asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
      {videoPreview && <VideoPreviewModal src={videoPreview.src} name={videoPreview.name} onClose={() => setVideoPreview(null)} />}

      {showBulkAttach && (
        <BulkAttachDialog
          sources={assets.map((a: any) => ({ id: a.id, type: 'asset', label: a.name }))}
          defaultTargetType="storyboard"
          onClose={() => setShowBulkAttach(false)}
        />
      )}
    </AppLayout>
  );
}
