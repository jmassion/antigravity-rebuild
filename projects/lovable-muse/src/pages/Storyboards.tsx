import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, Loader2, X, Link2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import AssetPicker from '@/components/dashboard/AssetPicker';
import StoryboardCard from '@/components/dashboard/StoryboardCard';
import ProjectSelect from '@/components/shared/ProjectSelect';
import TagInput from '@/components/shared/TagInput';
import ContentTypeSelect, { CONTENT_TYPES } from '@/components/shared/ContentTypeSelect';
import ViewToolbar, { groupItems, sortItems } from '@/components/shared/ViewToolbar';
import ListView, { Column } from '@/components/shared/ListView';
import KanbanView from '@/components/shared/KanbanView';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import BulkAttachDialog from '@/components/shared/BulkAttachDialog';
import { useI18n } from '@/lib/i18n';

export default function Storyboards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newContentType, setNewContentType] = useState('general');
  const [pickerFrameId, setPickerFrameId] = useState<string | null>(null);
  const [bulkPickerStoryboardId, setBulkPickerStoryboardId] = useState<string | null>(null);
  const [showBulkAttach, setShowBulkAttach] = useState(false);
  const [filterContentType, setFilterContentType] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const vp = useViewPreferences('storyboards');

  const { data: storyboards = [], isLoading } = useQuery({
    queryKey: ['storyboards', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storyboards')
        .select('*, storyboard_frames(*, assets(id, thumbnail_url, name, file_type), assignee:team_members!storyboard_frames_assignee_team_member_fkey(id, display_name, avatar_url, member_type)), projects(name)')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createStoryboard = useMutation({
    mutationFn: async () => {
      if (!user || !selectedProjectId) throw new Error('Select a project');
      const { error } = await supabase.from('storyboards').insert({ name: newName, project_id: selectedProjectId, owner_id: user.id, tags: newTags, content_type: newContentType } as any);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['storyboards'] }); setShowCreate(false); setNewName(''); setNewTags([]); setNewContentType('general'); toast({ title: 'Storyboard created' }); },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteStoryboard = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('storyboards').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['storyboards'] }); toast({ title: 'Storyboard deleted' }); },
  });

  const assignAsset = useMutation({
    mutationFn: async ({ frameId, assetId }: { frameId: string; assetId: string }) => {
      const { error } = await supabase.from('storyboard_frames').update({ asset_id: assetId }).eq('id', frameId);
      if (error) throw error;
    },
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['storyboards'] });
      setPickerFrameId(null);
      toast({ title: 'Asset assigned to frame' });
      // Auto-tag in background
      try {
        const { data: asset } = await supabase
          .from('assets')
          .select('name, file_url, thumbnail_url, file_type')
          .eq('id', variables.assetId)
          .single();
        if (asset) {
          const imageUrl = asset.thumbnail_url || asset.file_url;
          const isImage = ['image', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].some(
            t => asset.file_type?.includes(t) || imageUrl?.toLowerCase().includes(`.${t}`)
          );
          if (isImage && imageUrl) {
            const { data, error } = await supabase.functions.invoke('analyze-asset', {
              body: { imageUrl, fileName: asset.name },
            });
            if (!error && data && !data.error) {
              await supabase.from('storyboard_frames').update({
                ai_tags: data.tags || [],
                ai_description: data.description || null,
              }).eq('id', variables.frameId);
              queryClient.invalidateQueries({ queryKey: ['storyboards'] });
              toast({ title: 'Frame auto-tagged', description: `${(data.tags || []).length} AI tags added` });
            }
          }
        }
      } catch (e) {
        console.error('Auto-tag failed:', e);
      }
    },
  });

  // Apply content-type and tag filters
  const filteredStoryboards = storyboards.filter((sb: any) => {
    if (filterContentType && sb.content_type !== filterContentType) return false;
    if (filterTags.length > 0 && !filterTags.some(ft => (sb.tags || []).includes(ft))) return false;
    return true;
  });

  // Collect available tags from storyboards for the filter dropdown
  const availableTags = Array.from(new Set(storyboards.flatMap((sb: any) => sb.tags || []))).sort();

  const sortKeyFn = (sb: any) => {
    if (vp.sortBy === 'name') return sb.name;
    if (vp.sortBy === 'frames') return (sb.storyboard_frames || []).length;
    return sb.updated_at;
  };
  const sorted = sortItems(filteredStoryboards, sortKeyFn, vp.sortDir);

  const groupKeyFn = (sb: any) => {
    if (vp.groupBy === 'project') return (sb as any).projects?.name || 'No Project';
    if (vp.groupBy === 'content_type') {
      const ct = CONTENT_TYPES.find(c => c.value === sb.content_type);
      return ct ? `${ct.icon} ${ct.label}` : 'General';
    }
    return '';
  };
  const grouped = vp.groupBy ? groupItems(sorted, groupKeyFn) : undefined;

  const listColumns: Column<any>[] = [
    { key: 'name', label: 'Name', render: (sb) => <span className="text-foreground font-medium">{sb.name}</span> },
    { key: 'project', label: 'Project', className: 'w-[120px]', render: (sb) => <span className="text-muted-foreground">{(sb as any).projects?.name || '—'}</span> },
    { key: 'frames', label: 'Frames', className: 'w-[80px]', render: (sb) => <span className="text-muted-foreground">{(sb.storyboard_frames || []).length}</span> },
    { key: 'tags', label: 'Tags', render: (sb) => (
      <div className="flex flex-wrap gap-1">
        {(sb.tags || []).slice(0, 3).map((t: string) => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
        ))}
        {(sb.tags || []).length > 3 && <span className="text-[10px] text-muted-foreground">+{sb.tags.length - 3}</span>}
      </div>
    )},
    { key: 'updated_at', label: 'Updated', className: 'w-[100px]', render: (sb) => <span className="text-muted-foreground">{new Date(sb.updated_at).toLocaleDateString()}</span> },
  ];

  const renderKanbanCard = (sb: any) => (
    <div className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-all cursor-pointer">
      <h4 className="text-xs font-semibold text-foreground truncate">{sb.name}</h4>
      <span className="text-[10px] text-muted-foreground">{(sb.storyboard_frames || []).length} frames</span>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground">{t('storyboards.title')}</h1>
            <p className="text-xs text-muted-foreground mt-1">{t('storyboards.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            {storyboards.length > 0 && (
              <button onClick={() => setShowBulkAttach(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border text-sm font-medium text-foreground hover:bg-secondary/80 transition-opacity">
                <Link2 className="w-4 h-4" /> Bulk Attach
              </button>
            )}
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> New Storyboard
            </button>
          </div>
        </div>

        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">New Storyboard</h3>
              <button onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Storyboard name"
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <ProjectSelect value={selectedProjectId} onChange={setSelectedProjectId} />
              <ContentTypeSelect value={newContentType} onChange={setNewContentType} />
              <TagInput value={newTags} onChange={setNewTags} placeholder="Add tags (e.g. commercial, episode)..." />
              <button onClick={() => createStoryboard.mutate()} disabled={!newName.trim() || !selectedProjectId || createStoryboard.isPending}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                {createStoryboard.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Create
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-3 mb-6 flex-wrap">
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
            groupByOptions={[{ value: 'project', label: 'Project' }, { value: 'content_type', label: 'Content Type' }]}
            groupBy={vp.groupBy}
            onGroupByChange={vp.setGroupBy}
            sortOptions={[
              { value: 'updated_at', label: 'Date' },
              { value: 'name', label: 'Name' },
              { value: 'frames', label: 'Frame Count' },
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
          <ListView items={sorted} columns={listColumns} keyFn={(sb: any) => sb.id} groups={grouped} />
        ) : vp.view === 'kanban' ? (
          <KanbanView
            columns={grouped || groupItems(sorted, (sb: any) => (sb as any).projects?.name || 'No Project')}
            renderCard={renderKanbanCard}
            keyFn={(sb: any) => sb.id}
          />
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Play className="w-8 h-8 mb-3 opacity-50" /><p className="text-sm">No storyboards yet — create one above</p>
          </div>
        ) : grouped ? (
          Object.entries(grouped).map(([gName, items]) => (
            <div key={gName} className="mb-8">
              <h3 className="text-xs font-semibold text-foreground mb-3">{gName} ({items.length})</h3>
              <div className="space-y-8">
                {items.map((sb: any) => (
                  <StoryboardCard key={sb.id} sb={sb} onPickAsset={setPickerFrameId} onDelete={(id) => deleteStoryboard.mutate(id)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-8">
            {sorted.map((sb: any) => (
              <StoryboardCard key={sb.id} sb={sb} onPickAsset={setPickerFrameId} onDelete={(id) => deleteStoryboard.mutate(id)} />
            ))}
          </div>
        )}
      </div>

      {pickerFrameId && (
        <AssetPicker
          onSelect={(assetId) => assignAsset.mutate({ frameId: pickerFrameId, assetId })}
          onClose={() => setPickerFrameId(null)}
          projectId={selectedProjectId || undefined}
        />
      )}

      {showBulkAttach && (
        <BulkAttachDialog
          sources={storyboards.map((sb: any) => ({ id: sb.id, type: 'storyboard', label: sb.name }))}
          defaultTargetType="asset"
          onClose={() => setShowBulkAttach(false)}
        />
      )}
    </AppLayout>
  );
}
