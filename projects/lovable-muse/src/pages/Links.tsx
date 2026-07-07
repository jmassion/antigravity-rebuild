import { useState, useCallback, useRef } from 'react';
import { Plus, Loader2, Link2, Search, X, Sparkles, ExternalLink, Trash2, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import LinkCard from '@/components/shared/LinkCard';
import ProjectSelect from '@/components/shared/ProjectSelect';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { detectToolFromUrl, getAllToolNames } from '@/lib/tool-icons';
import { useI18n } from '@/lib/i18n';

interface LinkRow {
  id: string;
  title: string;
  url: string;
  description: string | null;
  tool_name: string | null;
  tool_icon_url: string | null;
  tags: string[];
  category: string;
  project_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

interface RelatedLink {
  id: string;
  label: string;
  url: string;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'reference', label: 'Reference' },
  { value: 'file', label: 'File' },
  { value: 'tool', label: 'Tool' },
  { value: 'api', label: 'API' },
  { value: 'documentation', label: 'Documentation' },
];

export default function Links() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProjectIds, setFormProjectIds] = useState<string[]>([]);
  const [formCategories, setFormCategories] = useState<string[]>(['general']);
  const [formTags, setFormTags] = useState('');
  const [formToolName, setFormToolName] = useState('');
  const [formRelatedLinks, setFormRelatedLinks] = useState<RelatedLink[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['links', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as unknown as LinkRow[];
    },
    enabled: !!user,
  });

  const resetForm = () => {
    setFormTitle(''); setFormUrl(''); setFormDesc(''); setFormProjectIds([]);
    setFormCategories(['general']); setFormTags(''); setFormToolName('');
    setFormRelatedLinks([]); setAutoFilled(false);
    setShowCreate(false); setEditingId(null);
  };

  const fetchUrlMeta = useCallback(async (url: string) => {
    if (!url.startsWith('http')) return;
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-url-meta', {
        body: { url },
      });
      if (!error && data && !data.error) {
        if (data.title && !formTitle) setFormTitle(data.title);
        if (data.description && !formDesc) setFormDesc(data.description);
        if (data.tags?.length && !formTags) setFormTags(data.tags.join(', '));
        if (data.suggestedCategory && formCategories.length <= 1 && formCategories[0] === 'general') {
          setFormCategories([data.suggestedCategory]);
        }
        setAutoFilled(true);
      }
    } catch (e) {
      console.error('URL meta fetch failed:', e);
    } finally {
      setIsFetching(false);
    }
  }, [formTitle, formDesc, formTags, formCategories]);

  const handleUrlChange = (url: string) => {
    setFormUrl(url);
    // Detect tool immediately
    const detected = detectToolFromUrl(url);
    if (detected && !formToolName) {
      setFormToolName(detected.name);
    }
    // Debounce the metadata fetch
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (url.startsWith('http') && !editingId) {
      debounceRef.current = setTimeout(() => fetchUrlMeta(url), 600);
    }
  };

  const startEdit = (link: LinkRow) => {
    setEditingId(link.id);
    setFormTitle(link.title);
    setFormUrl(link.url);
    setFormDesc(link.description || '');
    setFormProjectIds(link.project_id ? [link.project_id] : []);
    setFormCategories(link.category ? [link.category] : ['general']);
    setFormTags((link.tags || []).join(', '));
    setFormToolName(link.tool_name || '');
    setFormRelatedLinks([]);
    setAutoFilled(false);
    setShowCreate(true);
  };

  const createLink = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const tags = formTags.split(',').map(t => t.trim()).filter(Boolean);
      // Add related link URLs as tags with prefix
      const relatedTags = formRelatedLinks
        .filter(rl => rl.url.trim())
        .map(rl => `link:${rl.label || 'related'}|${rl.url.trim()}`);
      const allTags = [...tags, ...relatedTags];

      // Create a link for the primary project (or no project)
      const primaryProjectId = formProjectIds[0] || null;
      const payload = {
        title: formTitle, url: formUrl, description: formDesc || null,
        tool_name: formToolName || null, tool_icon_url: null,
        tags: allTags, category: formCategories[0] || 'general',
        project_id: primaryProjectId,
        owner_id: user.id,
      };

      if (editingId) {
        const { error } = await supabase.from('links').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('links').insert(payload);
        if (error) throw error;
        // If multiple projects selected, create copies for the extra ones
        for (let i = 1; i < formProjectIds.length; i++) {
          await supabase.from('links').insert({
            ...payload,
            project_id: formProjectIds[i],
          });
        }
        // If multiple categories, create copies for extra categories
        for (let c = 1; c < formCategories.length; c++) {
          await supabase.from('links').insert({
            ...payload,
            category: formCategories[c],
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      resetForm();
      toast({ title: editingId ? 'Link updated' : 'Link added' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({ title: 'Link deleted' });
    },
  });

  const addRelatedLink = () => {
    setFormRelatedLinks(prev => [...prev, { id: crypto.randomUUID(), label: '', url: '' }]);
  };

  const updateRelatedLink = (id: string, field: 'label' | 'url', value: string) => {
    setFormRelatedLinks(prev => prev.map(rl => rl.id === id ? { ...rl, [field]: value } : rl));
  };

  const removeRelatedLink = (id: string) => {
    setFormRelatedLinks(prev => prev.filter(rl => rl.id !== id));
  };

  const toggleCategory = (cat: string) => {
    setFormCategories(prev => {
      if (prev.includes(cat)) {
        return prev.length > 1 ? prev.filter(c => c !== cat) : prev;
      }
      return [...prev, cat];
    });
  };

  const toggleProjectId = (id: string) => {
    setFormProjectIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const filtered = links.filter(l => {
    if (filterProject && l.project_id !== filterProject) return false;
    if (filterCategory && l.category !== filterCategory) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.url.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categories = [...new Set(links.map(l => l.category))];

  return (
    <AppLayout>
      <div className="p-6 max-w-[1200px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Link2 className="w-5 h-5" /> {t('links.title')}
          </h1>
          <button onClick={() => { resetForm(); setShowCreate(true); }}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Add Link
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search links..." />
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setFilterCategory(null)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${!filterCategory ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              All
            </button>
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCategory(c === filterCategory ? null : c)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${filterCategory === c ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden">
              <div className="rounded-lg border border-border bg-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{editingId ? 'Edit Link' : 'Add New Link'}</h3>
                  <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                </div>

                {/* URL field with smart fetch */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">URL *</label>
                  <div className="relative">
                    <input value={formUrl} onChange={e => handleUrlChange(e.target.value)} placeholder="Paste a link — we'll autofill the rest..."
                      className="w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary pr-10" />
                    {isFetching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    )}
                    {autoFilled && !isFetching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </div>
                  {autoFilled && (
                    <p className="text-[10px] text-primary/70 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Auto-filled from URL — edit any field below
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Title *</label>
                    <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Link title"
                      className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Tool</label>
                    <input value={formToolName} onChange={e => setFormToolName(e.target.value)} placeholder="e.g. Figma, Blender..." list="tool-names"
                      className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                    <datalist id="tool-names">
                      {getAllToolNames().map(n => <option key={n} value={n} />)}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
                  <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} placeholder="Optional notes..."
                    className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none" />
                </div>

                {/* Multi-category selector */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Categories (select multiple)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => toggleCategory(cat.value)}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          formCategories.includes(cat.value)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi-project selector */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Projects (select multiple)</label>
                  <MultiProjectPicker selectedIds={formProjectIds} onToggle={toggleProjectId} />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Tags (comma separated)</label>
                  <input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="design, reference, tool:figma"
                    className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                </div>

                {/* Related Links */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Related Links</label>
                    <button type="button" onClick={addRelatedLink}
                      className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors">
                      <Plus className="w-3 h-3" /> Add Related
                    </button>
                  </div>
                  {formRelatedLinks.length > 0 && (
                    <div className="space-y-2">
                      {formRelatedLinks.map((rl) => (
                        <div key={rl.id} className="flex items-center gap-2">
                          <input
                            value={rl.label}
                            onChange={e => updateRelatedLink(rl.id, 'label', e.target.value)}
                            placeholder="Label (e.g. Docs)"
                            className="w-28 px-2 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            value={rl.url}
                            onChange={e => updateRelatedLink(rl.id, 'url', e.target.value)}
                            placeholder="https://..."
                            className="flex-1 px-2 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button onClick={() => removeRelatedLink(rl.id)} className="p-1 text-destructive/50 hover:text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {formRelatedLinks.length === 0 && (
                    <p className="text-[10px] text-muted-foreground/50">Add related URLs like docs, repos, or alternate versions</p>
                  )}
                </div>

                <button onClick={() => createLink.mutate()} disabled={!formTitle || !formUrl || createLink.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {createLink.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {editingId ? 'Update Link' : 'Add Link'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Links Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {links.length === 0 ? 'No links yet. Add your first external link or tool.' : 'No links match your filters.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((link, i) => (
              <motion.div key={link.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <LinkCard
                  id={link.id} title={link.title} url={link.url}
                  description={link.description} toolName={link.tool_name}
                  toolIconUrl={link.tool_icon_url} tags={link.tags}
                  category={link.category}
                  onEdit={() => startEdit(link)}
                  onDelete={(id) => deleteLink.mutate(id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

/** Multi-project picker using checkboxes */
function MultiProjectPicker({ selectedIds, onToggle }: { selectedIds: string[]; onToggle: (id: string) => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const selectedNames = projects.filter(p => selectedIds.includes(p.id)).map(p => p.name);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-left flex items-center justify-between outline-none focus:ring-1 focus:ring-primary"
      >
        <span className={selectedNames.length ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedNames.length ? selectedNames.join(', ') : 'Select projects...'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {projects.length === 0 && (
            <p className="text-xs text-muted-foreground p-3">No projects found</p>
          )}
          {projects.map(p => (
            <label key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 cursor-pointer text-sm text-foreground">
              <input
                type="checkbox"
                checked={selectedIds.includes(p.id)}
                onChange={() => onToggle(p.id)}
                className="rounded border-border accent-primary"
              />
              {p.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
