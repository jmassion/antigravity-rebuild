import { useState } from 'react';
import { Search, Plus, Copy, Loader2, X, Pencil, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import ViewToolbar, { ViewMode, sortItems } from '@/components/shared/ViewToolbar';
import ListView, { Column } from '@/components/shared/ListView';
import TagInput from '@/components/shared/TagInput';
import MarkdownRenderer from '@/components/dashboard/MarkdownRenderer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  { value: '', label: 'All', icon: '📋' },
  { value: 'text-to-image', label: 'Text-to-Image', icon: '🖼️' },
  { value: 'text-to-video', label: 'Text-to-Video', icon: '🎬' },
  { value: 'text-to-3d', label: 'Text-to-3D', icon: '🎮' },
  { value: 'story', label: 'Story', icon: '📖' },
  { value: 'dialogue', label: 'Dialogue', icon: '💬' },
  { value: 'general', label: 'General', icon: '📝' },
];

function highlightVariables(text: string) {
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, i) =>
    /^\{[^}]+\}$/.test(part) ? (
      <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-accent text-accent-foreground text-[11px] font-mono font-medium mx-0.5">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

type Prompt = {
  id: string;
  title: string;
  content: string;
  tags: string[] | null;
  icon: string;
  slug: string;
  updated_at: string;
  created_at: string;
};

export default function Prompts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [groupBy, setGroupBy] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formCategory, setFormCategory] = useState('general');

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ['prompts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('docs')
        .select('*')
        .eq('category', 'prompt')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Prompt[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('docs').insert({
        owner_id: user.id,
        title: formTitle,
        content: formContent,
        category: 'prompt',
        slug: formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60),
        icon: CATEGORIES.find(c => c.value === formCategory)?.icon || '📝',
        tags: [formCategory, ...formTags],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      resetForm();
      toast({ title: 'Prompt created' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('docs').update({
        title: formTitle,
        content: formContent,
        icon: CATEGORIES.find(c => c.value === formCategory)?.icon || '📝',
        tags: [formCategory, ...formTags],
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      resetForm();
      toast({ title: 'Prompt updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('docs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast({ title: 'Prompt deleted' });
    },
  });

  const resetForm = () => {
    setCreating(false);
    setEditing(null);
    setFormTitle('');
    setFormContent('');
    setFormTags([]);
    setFormCategory('general');
  };

  const startEdit = (p: Prompt) => {
    const cat = (p.tags || []).find(t => CATEGORIES.some(c => c.value === t && c.value !== '')) || 'general';
    setEditing(p.id);
    setFormTitle(p.title);
    setFormContent(p.content);
    setFormCategory(cat);
    setFormTags((p.tags || []).filter(t => t !== cat));
  };

  const copyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard' });
  };

  // Filter & sort
  const filtered = prompts.filter(p => {
    if (activeCategory && !(p.tags || []).includes(activeCategory)) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = sortItems(filtered, (item) => {
    if (sortBy === 'name') return item.title;
    return item.updated_at;
  }, sortDir);

  const listColumns: Column<Prompt>[] = [
    { key: 'icon', label: '', className: 'w-10', render: (p) => <span className="text-lg">{p.icon}</span> },
    { key: 'title', label: 'Title', render: (p) => <span className="text-foreground font-medium">{p.title}</span> },
    { key: 'preview', label: 'Preview', render: (p) => <span className="text-muted-foreground line-clamp-1">{p.content.slice(0, 80)}</span> },
    { key: 'tags', label: 'Tags', className: 'w-[120px]', render: (p) => (
      <div className="flex gap-1 flex-wrap">{(p.tags || []).slice(0, 2).map(t => (
        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
      ))}</div>
    )},
    { key: 'actions', label: '', className: 'w-20', render: (p) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); copyPrompt(p.content); }} className="p-1 text-muted-foreground hover:text-primary"><Copy className="w-3.5 h-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); startEdit(p); }} className="p-1 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-xl">📝</span> Prompts
            </h1>
            <p className="text-xs text-muted-foreground mt-1">AI prompts, generation templates, and prompt libraries</p>
          </div>
          <button onClick={() => { resetForm(); setCreating(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-3.5 h-3.5" /> New Prompt
          </button>
        </div>

        {/* Category chips */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setActiveCategory(cat.value === activeCategory ? '' : cat.value)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-colors ${
                activeCategory === cat.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}>
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Search & toolbar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border max-w-sm flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search prompts..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
          </div>
          <ViewToolbar
            views={['grid', 'list']}
            view={view}
            onViewChange={setView}
            groupByOptions={[]}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            sortOptions={[
              { value: 'updated_at', label: 'Date' },
              { value: 'name', label: 'Name' },
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
                <h3 className="text-sm font-semibold text-foreground">{editing ? 'Edit Prompt' : 'New Prompt'}</h3>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Prompt title..."
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.filter(c => c.value).map(cat => (
                  <button key={cat.value} onClick={() => setFormCategory(cat.value)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition-colors ${
                      formCategory === cat.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}>
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
              <textarea value={formContent} onChange={e => setFormContent(e.target.value)} placeholder="Write your prompt template... Use {variable} for dynamic parts"
                rows={6} className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary font-mono resize-y" />
              <TagInput value={formTags} onChange={setFormTags} placeholder="Add tags..." />
              <div className="flex gap-2 justify-end">
                <button onClick={resetForm} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={() => editing ? updateMutation.mutate(editing) : createMutation.mutate()}
                  disabled={!formTitle.trim() || !formContent.trim() || createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50">
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <span className="text-3xl mb-3">📝</span>
            <p className="text-sm">No prompts yet</p>
            <p className="text-xs mt-1">Create your first prompt template to get started</p>
          </div>
        ) : view === 'list' ? (
          <ListView items={sorted} columns={listColumns} keyFn={p => p.id} onItemClick={p => setExpanded(expanded === p.id ? null : p.id)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sorted.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-all group">
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <span>{p.icon}</span> {p.title}
                    </h3>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => copyPrompt(p.content)} className="p-1 text-muted-foreground hover:text-primary" title="Copy">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => startEdit(p)} className="p-1 text-muted-foreground hover:text-primary" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(p.id)} className="p-1 text-muted-foreground hover:text-destructive" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {highlightVariables(p.content.slice(0, 200))}
                  </div>
                  {(p.tags || []).length > 0 && (
                    <div className="flex gap-1 flex-wrap pt-1">
                      {(p.tags || []).map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground/60">{new Date(p.updated_at).toLocaleDateString()}</p>
                </div>

                {/* Expanded preview */}
                {expanded === p.id && (
                  <div className="border-t border-border p-4 bg-secondary/30">
                    <MarkdownRenderer content={p.content} />
                  </div>
                )}
                <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  className="w-full px-4 py-1.5 text-[10px] text-muted-foreground hover:text-foreground bg-secondary/50 border-t border-border transition-colors">
                  {expanded === p.id ? 'Collapse' : 'Expand'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
