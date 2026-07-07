import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, X, ClipboardList, CheckCircle2, Clock, Target, Link2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import ProjectSelect from '@/components/shared/ProjectSelect';
import TagInput from '@/components/shared/TagInput';
import ContentTypeSelect from '@/components/shared/ContentTypeSelect';
import ViewToolbar, { groupItems, sortItems } from '@/components/shared/ViewToolbar';
import ListView, { Column } from '@/components/shared/ListView';
import KanbanView from '@/components/shared/KanbanView';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ProvenanceLinkDialog from '@/components/shared/ProvenanceLinkDialog';
import BulkAttachDialog from '@/components/shared/BulkAttachDialog';
import { useI18n } from '@/lib/i18n';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
  active: { label: 'Active', color: 'bg-phase-build/20 text-phase-build', icon: Target },
  complete: { label: 'Complete', color: 'bg-phase-grow/20 text-phase-grow', icon: CheckCircle2 },
};

export default function Plans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBrief, setNewBrief] = useState('');
  const [newGoals, setNewGoals] = useState('');
  const [newDeliverables, setNewDeliverables] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newContentType, setNewContentType] = useState('general');
  const [linkingPlanId, setLinkingPlanId] = useState<string | null>(null);
  const [showBulkAttach, setShowBulkAttach] = useState(false);
  const vp = useViewPreferences('plans');

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*, projects(name)')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createPlan = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('plans').insert({
        title: newTitle,
        brief: newBrief,
        goals: newGoals.split('\n').map(g => g.trim()).filter(Boolean),
        deliverables: newDeliverables.split('\n').map(d => d.trim()).filter(Boolean),
        project_id: newProjectId || null,
        tags: newTags,
        content_type: newContentType,
        owner_id: user.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setShowCreate(false);
      setNewTitle(''); setNewBrief(''); setNewGoals(''); setNewDeliverables('');
      setNewProjectId(''); setNewTags([]); setNewContentType('general');
      toast({ title: 'Plan created' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('plans').update({ status } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['plans'] }); toast({ title: 'Plan deleted' }); },
  });

  const sortKeyFn = (p: any) => {
    if (vp.sortBy === 'title') return p.title;
    if (vp.sortBy === 'status') return p.status;
    return p.updated_at;
  };
  const sorted = sortItems(plans, sortKeyFn, vp.sortDir);

  const groupKeyFn = (p: any) => {
    if (vp.groupBy === 'status') return statusConfig[p.status]?.label || p.status;
    if (vp.groupBy === 'project') return p.projects?.name || 'No Project';
    return '';
  };
  const grouped = vp.groupBy ? groupItems(sorted, groupKeyFn) : undefined;

  const listColumns: Column<any>[] = [
    { key: 'title', label: 'Title', render: (p) => <span className="text-foreground font-medium">{p.title}</span> },
    { key: 'status', label: 'Status', className: 'w-[90px]', render: (p) => {
      const s = statusConfig[p.status] || statusConfig.draft;
      return <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
    }},
    { key: 'project', label: 'Project', className: 'w-[120px]', render: (p) => <span className="text-muted-foreground">{p.projects?.name || '—'}</span> },
    { key: 'tags', label: 'Tags', render: (p) => (
      <div className="flex flex-wrap gap-1">
        {(p.tags || []).slice(0, 3).map((t: string) => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
        ))}
      </div>
    )},
    { key: 'updated_at', label: 'Updated', className: 'w-[100px]', render: (p) => <span className="text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</span> },
  ];

  const renderCard = (plan: any) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusConfig[plan.status]?.color || statusConfig.draft.color}`}>
          {statusConfig[plan.status]?.label || plan.status}
        </span>
        {plan.projects?.name && <span className="text-[10px] text-muted-foreground">· {plan.projects.name}</span>}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{plan.title}</h3>
      {plan.brief && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{plan.brief}</p>}
      {plan.goals?.length > 0 && (
        <div className="mb-2">
          <span className="text-[10px] font-semibold text-foreground">Goals:</span>
          <ul className="mt-0.5">
            {plan.goals.slice(0, 3).map((g: string, i: number) => (
              <li key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Target className="w-2.5 h-2.5 text-primary/50" />{g}
              </li>
            ))}
          </ul>
        </div>
      )}
      {plan.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {plan.tags.map((t: string) => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/80">{t}</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 mt-2 text-[11px]">
        <button onClick={() => setLinkingPlanId(plan.id)} className="text-primary/70 hover:text-primary">Link items</button>
        <select
          value={plan.status}
          onChange={(e) => updateStatus.mutate({ id: plan.id, status: e.target.value })}
          className="bg-secondary border border-border rounded px-1.5 py-0.5 text-[10px] text-foreground"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="complete">Complete</option>
        </select>
        <button onClick={() => deletePlan.mutate(plan.id)} className="ml-auto text-destructive/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">Delete</button>
      </div>
    </motion.div>
  );

  const renderKanbanCard = (plan: any) => (
    <div className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-all cursor-pointer">
      <h4 className="text-xs font-semibold text-foreground truncate">{plan.title}</h4>
      {plan.brief && <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{plan.brief}</p>}
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> {t('plans.title')}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">{t('plans.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            {plans.length > 0 && (
              <button onClick={() => setShowBulkAttach(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border text-sm font-medium text-foreground hover:bg-secondary/80 transition-opacity">
                <Link2 className="w-4 h-4" /> Bulk Attach
              </button>
            )}
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> New Plan
            </button>
          </div>
        </div>

        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">New Plan</h3>
              <button onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Plan title"
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <textarea value={newBrief} onChange={e => setNewBrief(e.target.value)} placeholder="Brief / description"
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none h-20" />
              <textarea value={newGoals} onChange={e => setNewGoals(e.target.value)} placeholder="Goals (one per line)"
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none h-16" />
              <textarea value={newDeliverables} onChange={e => setNewDeliverables(e.target.value)} placeholder="Deliverables (one per line)"
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none h-16" />
              <ProjectSelect value={newProjectId} onChange={setNewProjectId} placeholder="Link to project (optional)" />
              <ContentTypeSelect value={newContentType} onChange={setNewContentType} />
              <TagInput value={newTags} onChange={setNewTags} placeholder="Add tags..." />
              <button onClick={() => createPlan.mutate()} disabled={!newTitle.trim() || createPlan.isPending}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                {createPlan.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Create Plan
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <ViewToolbar
            views={['grid', 'list', 'kanban']}
            view={vp.view}
            onViewChange={vp.setView}
            groupByOptions={[
              { value: 'status', label: 'Status' },
              { value: 'project', label: 'Project' },
            ]}
            groupBy={vp.groupBy}
            onGroupByChange={vp.setGroupBy}
            sortOptions={[
              { value: 'updated_at', label: 'Date' },
              { value: 'title', label: 'Title' },
              { value: 'status', label: 'Status' },
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
          <ListView items={sorted} columns={listColumns} keyFn={(p: any) => p.id} groups={grouped} />
        ) : vp.view === 'kanban' ? (
          <KanbanView
            columns={grouped || groupItems(sorted, (p: any) => statusConfig[p.status]?.label || p.status)}
            renderCard={renderKanbanCard}
            keyFn={(p: any) => p.id}
            columnOrder={['Draft', 'Active', 'Complete']}
          />
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ClipboardList className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm">No plans yet — create one above</p>
          </div>
        ) : grouped ? (
          Object.entries(grouped).map(([gName, items]) => (
            <div key={gName} className="mb-6">
              <h3 className="text-xs font-semibold text-foreground mb-3">{gName} ({items.length})</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {items.map((p: any) => <div key={p.id}>{renderCard(p)}</div>)}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {sorted.map((p: any) => <div key={p.id}>{renderCard(p)}</div>)}
          </div>
        )}
      </div>

      {linkingPlanId && (
        <ProvenanceLinkDialog
          sourceType="plan"
          sourceId={linkingPlanId}
          onClose={() => setLinkingPlanId(null)}
        />
      )}

      {showBulkAttach && (
        <BulkAttachDialog
          sources={plans.map((p: any) => ({ id: p.id, type: 'plan', label: p.title }))}
          defaultTargetType="storyboard"
          onClose={() => setShowBulkAttach(false)}
        />
      )}
    </AppLayout>
  );
}
