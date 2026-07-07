import { useState } from 'react';
import { Plus, Loader2, X, Calendar, AlertCircle, CheckCircle2, Circle, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import ViewToolbar, { ViewMode, groupItems, sortItems } from '@/components/shared/ViewToolbar';
import ListView, { Column } from '@/components/shared/ListView';
import KanbanView from '@/components/shared/KanbanView';
import ProjectSelect from '@/components/shared/ProjectSelect';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  project_id: string | null;
  asset_id: string | null;
  frame_id: string | null;
  created_by: string;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
  projects?: { name: string } | null;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  todo: { icon: Circle, color: 'bg-muted text-muted-foreground', label: 'To Do' },
  in_progress: { icon: Clock, color: 'bg-primary/10 text-primary', label: 'In Progress' },
  review: { icon: AlertCircle, color: 'bg-phase-build/20 text-phase-build', label: 'Review' },
  done: { icon: CheckCircle2, color: 'bg-phase-grow/20 text-phase-grow', label: 'Done' },
};

const statusLabelToKey: Record<string, string> = {
  'To Do': 'todo',
  'In Progress': 'in_progress',
  'Review': 'review',
  'Done': 'done',
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: 'text-muted-foreground', label: 'Low' },
  medium: { color: 'text-phase-build', label: 'Medium' },
  high: { color: 'text-destructive', label: 'High' },
  urgent: { color: 'text-destructive font-bold', label: 'Urgent' },
};

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newProjectId, setNewProjectId] = useState('');
  const vp = useViewPreferences('tasks', { view: 'kanban', groupBy: 'status' });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(name)')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('tasks').insert({
        title: newTitle, description: newDesc || null, priority: newPriority,
        project_id: newProjectId || null, created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowCreate(false); setNewTitle(''); setNewDesc(''); setNewProjectId('');
      toast({ title: 'Task created' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast({ title: 'Task deleted' }); },
  });

  const handleKanbanReorder = (result: { itemKey: string; sourceColumn: string; destColumn: string }) => {
    if (result.sourceColumn === result.destColumn) return;
    // Map column label back to status key
    const newStatus = statusLabelToKey[result.destColumn];
    if (newStatus) {
      updateStatus.mutate({ id: result.itemKey, status: newStatus });
    }
  };

  const sortKeyFn = (t: Task) => {
    if (vp.sortBy === 'title') return t.title;
    if (vp.sortBy === 'priority') return { urgent: 0, high: 1, medium: 2, low: 3 }[t.priority] ?? 2;
    if (vp.sortBy === 'status') return { todo: 0, in_progress: 1, review: 2, done: 3 }[t.status] ?? 0;
    return t.updated_at;
  };
  const sorted = sortItems(tasks, sortKeyFn, vp.sortDir);

  const groupKeyFn = (t: Task) => {
    if (vp.groupBy === 'status') return statusConfig[t.status]?.label || t.status;
    if (vp.groupBy === 'priority') return priorityConfig[t.priority]?.label || t.priority;
    if (vp.groupBy === 'project') return t.projects?.name || 'No Project';
    return '';
  };
  const grouped = vp.groupBy ? groupItems(sorted, groupKeyFn) : undefined;

  const listColumns: Column<Task>[] = [
    {
      key: 'status', label: 'Status', className: 'w-[110px]',
      render: (t) => (
        <select value={t.status} onChange={e => updateStatus.mutate({ id: t.id, status: e.target.value })}
          className="bg-transparent text-xs border-none outline-none cursor-pointer" onClick={e => e.stopPropagation()}>
          {Object.entries(statusConfig).map(([val, c]) => <option key={val} value={val}>{c.label}</option>)}
        </select>
      ),
    },
    { key: 'title', label: 'Title', render: (t) => <span className="text-foreground font-medium">{t.title}</span> },
    { key: 'priority', label: 'Priority', className: 'w-[80px]', render: (t) => <span className={`text-xs ${priorityConfig[t.priority]?.color || ''}`}>{priorityConfig[t.priority]?.label || t.priority}</span> },
    { key: 'project', label: 'Project', className: 'w-[120px]', render: (t) => <span className="text-muted-foreground">{t.projects?.name || '—'}</span> },
    { key: 'due', label: 'Due', className: 'w-[100px]', render: (t) => t.due_date ? <span className="text-muted-foreground">{new Date(t.due_date).toLocaleDateString()}</span> : <span className="text-muted-foreground/50">—</span> },
    { key: 'actions', label: '', className: 'w-[40px]', render: (t) => <button onClick={(e) => { e.stopPropagation(); deleteTask.mutate(t.id); }} className="text-destructive/50 hover:text-destructive text-xs">✕</button> },
  ];

  const renderKanbanCard = (task: Task) => (
    <div className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[10px] font-semibold ${priorityConfig[task.priority]?.color || ''}`}>{priorityConfig[task.priority]?.label}</span>
        <button onClick={() => deleteTask.mutate(task.id)} className="text-destructive/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
      </div>
      <p className="text-xs font-medium text-foreground">{task.title}</p>
      {task.description && <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{task.description}</p>}
      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
        {task.projects?.name && <span className="truncate">📂 {task.projects.name}</span>}
        {task.due_date && <span className="flex items-center gap-0.5 ml-auto"><Calendar className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString()}</span>}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground">{t('tasks.title')}</h1>
            <p className="text-xs text-muted-foreground mt-1">{t('tasks.subtitle')}</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>

        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">New Task</h3>
              <button onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task title"
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={2}
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none" />
              <div className="flex gap-3">
                <ProjectSelect value={newProjectId} onChange={setNewProjectId} placeholder="Project (optional)" className="flex-1" />
                <div className="flex gap-1">
                  {Object.entries(priorityConfig).map(([val, cfg]) => (
                    <button key={val} onClick={() => setNewPriority(val)}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${newPriority === val ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground border border-border'}`}>{cfg.label}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => createTask.mutate()} disabled={!newTitle.trim() || createTask.isPending}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                {createTask.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Create Task
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <ViewToolbar
            views={['kanban', 'list', 'grid']}
            view={vp.view} onViewChange={vp.setView}
            groupByOptions={[
              { value: 'status', label: 'Status' },
              { value: 'priority', label: 'Priority' },
              { value: 'project', label: 'Project' },
            ]}
            groupBy={vp.groupBy} onGroupByChange={vp.setGroupBy}
            sortOptions={[
              { value: 'updated_at', label: 'Date' },
              { value: 'title', label: 'Title' },
              { value: 'priority', label: 'Priority' },
              { value: 'status', label: 'Status' },
            ]}
            sortBy={vp.sortBy} onSortByChange={vp.setSortBy}
            sortDir={vp.sortDir} onSortDirChange={vp.setSortDir}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : vp.view === 'kanban' ? (
          <KanbanView
            columns={grouped || groupItems(sorted, t => statusConfig[t.status]?.label || t.status)}
            renderCard={renderKanbanCard}
            keyFn={t => t.id}
            columnOrder={['To Do', 'In Progress', 'Review', 'Done']}
            onReorder={handleKanbanReorder}
          />
        ) : vp.view === 'list' ? (
          <ListView items={sorted} columns={listColumns} keyFn={t => t.id} groups={grouped} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {sorted.map(task => (
              <motion.div key={task.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                {renderKanbanCard(task)}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
