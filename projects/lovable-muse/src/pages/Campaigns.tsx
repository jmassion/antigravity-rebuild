import { useState } from 'react';
import { Search, Plus, Loader2, X, Check, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import ViewToolbar, { ViewMode, sortItems } from '@/components/shared/ViewToolbar';
import ListView, { Column } from '@/components/shared/ListView';
import KanbanView from '@/components/shared/KanbanView';
import ProjectSelect from '@/components/shared/ProjectSelect';
import TagInput from '@/components/shared/TagInput';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const STATUS_ORDER = ['draft', 'active', 'complete'];
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-primary/10 text-primary',
  complete: 'bg-accent text-accent-foreground',
};

type Campaign = {
  id: string;
  title: string;
  brief: string | null;
  status: string;
  goals: string[] | null;
  deliverables: string[] | null;
  tags: string[] | null;
  project_id: string | null;
  updated_at: string;
  created_at: string;
  projects?: { name: string } | null;
};

function ProgressRing({ completed, total, size = 28 }: { completed: number; total: number; size?: number }) {
  const r = (size - 4) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = total > 0 ? completed / total : 0;
  const offset = circumference * (1 - pct);
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={2} className="stroke-muted" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={2} className="stroke-primary"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-[8px] font-semibold">
        {total > 0 ? `${Math.round(pct * 100)}%` : '—'}
      </text>
    </svg>
  );
}

export default function Campaigns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('kanban');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [groupBy, setGroupBy] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  // Form
  const [formTitle, setFormTitle] = useState('');
  const [formBrief, setFormBrief] = useState('');
  const [formGoals, setFormGoals] = useState<string[]>([]);
  const [formDeliverables, setFormDeliverables] = useState<string[]>([]);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formProject, setFormProject] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [deliverableInput, setDeliverableInput] = useState('');

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*, projects(name)')
        .eq('content_type', 'campaign')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('plans').insert({
        owner_id: user.id,
        title: formTitle,
        brief: formBrief,
        content_type: 'campaign',
        goals: formGoals,
        deliverables: formDeliverables,
        tags: formTags,
        project_id: formProject || null,
        status: 'draft',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      resetForm();
      toast({ title: 'Campaign created' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plans').update({
        title: formTitle,
        brief: formBrief,
        goals: formGoals,
        deliverables: formDeliverables,
        tags: formTags,
        project_id: formProject || null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      resetForm();
      toast({ title: 'Campaign updated' });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('plans').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign deleted' });
    },
  });

  const resetForm = () => {
    setCreating(false);
    setEditing(null);
    setFormTitle('');
    setFormBrief('');
    setFormGoals([]);
    setFormDeliverables([]);
    setFormTags([]);
    setFormProject('');
    setGoalInput('');
    setDeliverableInput('');
  };

  const startEdit = (c: Campaign) => {
    setEditing(c.id);
    setFormTitle(c.title);
    setFormBrief(c.brief || '');
    setFormGoals(c.goals || []);
    setFormDeliverables(c.deliverables || []);
    setFormTags(c.tags || []);
    setFormProject(c.project_id || '');
  };

  const cycleStatus = (c: Campaign) => {
    const idx = STATUS_ORDER.indexOf(c.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    statusMutation.mutate({ id: c.id, status: next });
  };

  // Deliverables completion: track as "✓ item" prefix convention
  const isDeliverableChecked = (d: string) => d.startsWith('✓ ');
  const toggleDeliverable = async (campaignId: string, deliverables: string[], index: number) => {
    const updated = [...deliverables];
    updated[index] = isDeliverableChecked(updated[index]) ? updated[index].slice(2) : `✓ ${updated[index]}`;
    await supabase.from('plans').update({ deliverables: updated }).eq('id', campaignId);
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };

  const filtered = campaigns.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.title.toLowerCase().includes(q) || (c.brief || '').toLowerCase().includes(q);
  });

  const sorted = sortItems(filtered, (item) => {
    if (sortBy === 'name') return item.title;
    if (sortBy === 'status') return STATUS_ORDER.indexOf(item.status);
    return item.updated_at;
  }, sortDir);

  // Kanban columns
  const kanbanColumns: Record<string, Campaign[]> = { Draft: [], Active: [], Complete: [] };
  for (const c of sorted) {
    const key = c.status === 'draft' ? 'Draft' : c.status === 'active' ? 'Active' : 'Complete';
    kanbanColumns[key].push(c);
  }

  const CampaignCard = ({ c }: { c: Campaign }) => {
    const dels = c.deliverables || [];
    const done = dels.filter(isDeliverableChecked).length;
    return (
      <div className="rounded-lg border border-border bg-card p-3 space-y-2 hover:border-primary/30 transition-all group">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => startEdit(c)} className="p-1 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={() => deleteMutation.mutate(c.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {c.brief && <p className="text-xs text-muted-foreground line-clamp-2">{c.brief}</p>}
        <div className="flex items-center gap-2">
          <button onClick={() => cycleStatus(c)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[c.status]}`}>
            {c.status}
          </button>
          {c.projects?.name && <span className="text-[10px] text-muted-foreground">📂 {c.projects.name}</span>}
        </div>
        {dels.length > 0 && (
          <div className="flex items-center gap-2">
            <ProgressRing completed={done} total={dels.length} />
            <div className="flex-1 space-y-0.5">
              {dels.slice(0, 3).map((d, i) => (
                <button key={i} onClick={() => toggleDeliverable(c.id, dels, i)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground w-full text-left hover:text-foreground">
                  {isDeliverableChecked(d) ? <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" /> : <Circle className="w-3 h-3 flex-shrink-0" />}
                  <span className={isDeliverableChecked(d) ? 'line-through opacity-60' : ''}>{d.replace(/^✓ /, '')}</span>
                </button>
              ))}
              {dels.length > 3 && <span className="text-[10px] text-muted-foreground">+{dels.length - 3} more</span>}
            </div>
          </div>
        )}
        {(c.tags || []).length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {(c.tags || []).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>)}
          </div>
        )}
      </div>
    );
  };

  const listColumns: Column<Campaign>[] = [
    { key: 'title', label: 'Title', render: (c) => <span className="text-foreground font-medium">{c.title}</span> },
    { key: 'status', label: 'Status', className: 'w-[90px]', render: (c) => (
      <button onClick={() => cycleStatus(c)} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</button>
    )},
    { key: 'project', label: 'Project', className: 'w-[120px]', render: (c) => <span className="text-muted-foreground">{c.projects?.name || '—'}</span> },
    { key: 'deliverables', label: 'Deliverables', className: 'w-[100px]', render: (c) => {
      const dels = c.deliverables || [];
      const done = dels.filter(isDeliverableChecked).length;
      return <span className="text-muted-foreground">{done}/{dels.length}</span>;
    }},
    { key: 'updated', label: 'Updated', className: 'w-[100px]', render: (c) => <span className="text-muted-foreground">{new Date(c.updated_at).toLocaleDateString()}</span> },
  ];

  const ListInput = ({ values, onAdd, onRemove, input, setInput, placeholder }: {
    values: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void;
    input: string; setInput: (v: string) => void; placeholder: string;
  }) => (
    <div className="space-y-1">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-foreground">
          <span className="flex-1">{v}</span>
          <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
        </div>
      ))}
      <div className="flex gap-1.5">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && input.trim()) { e.preventDefault(); onAdd(input.trim()); setInput(''); } }}
          placeholder={placeholder}
          className="flex-1 px-2.5 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
        <button onClick={() => { if (input.trim()) { onAdd(input.trim()); setInput(''); } }}
          className="px-2 py-1.5 rounded-md bg-secondary text-xs text-muted-foreground hover:text-foreground border border-border">
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-xl">📣</span> Campaigns
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Marketing campaigns, launch plans, and promotional content</p>
          </div>
          <button onClick={() => { resetForm(); setCreating(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">
            <Plus className="w-3.5 h-3.5" /> New Campaign
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border max-w-sm flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
          </div>
          <ViewToolbar
            views={['kanban', 'grid', 'list']}
            view={view}
            onViewChange={setView}
            groupByOptions={[]}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            sortOptions={[
              { value: 'updated_at', label: 'Date' },
              { value: 'name', label: 'Name' },
              { value: 'status', label: 'Status' },
            ]}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortDir={sortDir}
            onSortDirChange={setSortDir}
          />
        </div>

        {/* Create / Edit Form */}
        <AnimatePresence>
          {(creating || editing) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-lg border border-primary/30 bg-card p-4 space-y-3 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{editing ? 'Edit Campaign' : 'New Campaign'}</h3>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Campaign title..."
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <textarea value={formBrief} onChange={e => setFormBrief(e.target.value)} placeholder="Campaign brief..."
                rows={3} className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-y" />
              <ProjectSelect value={formProject} onChange={setFormProject} placeholder="Link to project..." size="sm" />
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Objectives</label>
                <ListInput values={formGoals} onAdd={v => setFormGoals([...formGoals, v])} onRemove={i => setFormGoals(formGoals.filter((_, j) => j !== i))}
                  input={goalInput} setInput={setGoalInput} placeholder="Add objective..." />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Deliverables</label>
                <ListInput values={formDeliverables} onAdd={v => setFormDeliverables([...formDeliverables, v])} onRemove={i => setFormDeliverables(formDeliverables.filter((_, j) => j !== i))}
                  input={deliverableInput} setInput={setDeliverableInput} placeholder="Add deliverable..." />
              </div>
              <TagInput value={formTags} onChange={setFormTags} placeholder="Tags..." />
              <div className="flex gap-2 justify-end">
                <button onClick={resetForm} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={() => editing ? updateMutation.mutate(editing) : createMutation.mutate()}
                  disabled={!formTitle.trim()} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50">
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : sorted.length === 0 && !creating ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <span className="text-3xl mb-3">📣</span>
            <p className="text-sm">No campaigns yet</p>
            <p className="text-xs mt-1">Create your first campaign to start tracking deliverables</p>
          </div>
        ) : view === 'kanban' ? (
          <KanbanView
            columns={kanbanColumns}
            columnOrder={['Draft', 'Active', 'Complete']}
            keyFn={(c) => c.id}
            renderCard={(c) => <CampaignCard c={c} />}
          />
        ) : view === 'list' ? (
          <ListView items={sorted} columns={listColumns} keyFn={c => c.id} onItemClick={c => startEdit(c)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sorted.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <CampaignCard c={c} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
