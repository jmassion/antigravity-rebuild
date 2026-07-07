import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/AppLayout';
import MarkdownRenderer from '@/components/dashboard/MarkdownRenderer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, Plus, Edit3, Save, X, Trash2, ChevronDown, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { seedDocs } from '@/lib/seed-docs';

// ── Types ──

interface Doc {
  id: string;
  owner_id: string;
  parent_id: string | null;
  icon: string;
  category: string;
  title: string;
  slug: string;
  content: string;
  sort_order: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ── Constants ──

const CATEGORY_COLORS: Record<string, string> = {
  changelog: 'bg-phase-start/20 text-phase-start',
  architecture: 'bg-phase-build/20 text-phase-build',
  features: 'bg-phase-grow/20 text-phase-grow',
  'api reference': 'bg-purple-500/15 text-purple-400',
  general: 'bg-secondary text-muted-foreground',
};

const DEFAULT_ICONS: Record<string, string> = {
  changelog: '📝',
  architecture: '🏗️',
  features: '🚀',
  'api reference': '🔌',
  general: '📄',
};

const ICON_PALETTE = [
  '📋', '📐', '🗄️', '🔌', '🚀', '📁', '🎬', '🔗', '📂', '🏷️',
  '🖼️', '📖', '📝', '💡', '⚡', '🎯', '🛠️', '🧩', '📊', '🗂️',
  '🔒', '🌐', '💾', '📡', '🎨', '🧪', '📌', '🏗️', '📄', '✨',
];

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat.toLowerCase()] || CATEGORY_COLORS.general;
}

function getDefaultIcon(cat: string) {
  return DEFAULT_ICONS[cat.toLowerCase()] || '📄';
}

// ── Icon Picker ──

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-md border border-input bg-background flex items-center justify-center text-lg hover:bg-accent transition-colors"
      >
        {value || '📄'}
      </button>
      {open && (
        <div className="absolute top-12 left-0 z-50 bg-popover border border-border rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 w-56">
          {ICON_PALETTE.map(icon => (
            <button
              key={icon}
              type="button"
              onClick={() => { onChange(icon); setOpen(false); }}
              className={`w-8 h-8 rounded flex items-center justify-center text-base hover:bg-accent transition-colors ${value === icon ? 'bg-primary/20 ring-1 ring-primary' : ''}`}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Recursive Doc Tree ──

function DocTreeNode({
  doc,
  docs,
  selectedId,
  onSelect,
  expanded,
  toggleExpand,
  depth = 0,
  searchActive,
}: {
  doc: Doc;
  docs: Doc[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
  depth?: number;
  searchActive: boolean;
}) {
  const children = docs.filter(d => d.parent_id === doc.id).sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
  const hasChildren = children.length > 0;
  const isOpen = expanded.has(doc.id);
  const icon = doc.icon || getDefaultIcon(doc.category);

  return (
    <div>
      <button
        onClick={() => {
          onSelect(doc.id);
          if (hasChildren) toggleExpand(doc.id);
        }}
        className={`w-full flex items-center gap-1.5 py-1 px-2 rounded text-xs transition-colors group ${
          selectedId === doc.id
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-sidebar-foreground hover:bg-sidebar-accent'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {hasChildren ? (
          <span className="w-3 h-3 shrink-0 flex items-center justify-center text-muted-foreground">
            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        ) : (
          <span className="w-3 h-3 shrink-0" />
        )}
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{doc.title}</span>
      </button>
      {(isOpen || searchActive) && children.map(child => (
        <DocTreeNode
          key={child.id}
          doc={child}
          docs={docs}
          selectedId={selectedId}
          onSelect={onSelect}
          expanded={expanded}
          toggleExpand={toggleExpand}
          depth={depth + 1}
          searchActive={searchActive}
        />
      ))}
    </div>
  );
}

// ── Main Component ──

export default function Docs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editParentId, setEditParentId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newIcon, setNewIcon] = useState('📄');
  const [newParentId, setNewParentId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['docs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('docs')
        .select('*')
        .order('sort_order')
        .order('title');
      if (error) throw error;
      return data as Doc[];
    },
    enabled: !!user,
  });

  // Seed on first empty load
  useEffect(() => {
    if (!user || isLoading || docs.length > 0 || seeding) return;
    setSeeding(true);
    seedDocs(user.id).then(ok => {
      if (ok) {
        qc.invalidateQueries({ queryKey: ['docs'] });
        toast.success('Docs seeded with planning content');
      }
      setSeeding(false);
    });
  }, [user, isLoading, docs.length, seeding, qc]);

  // Auto-expand all on load
  useEffect(() => {
    if (docs.length > 0 && expanded.size === 0) {
      const parents = new Set(docs.filter(d => docs.some(c => c.parent_id === d.id)).map(d => d.id));
      setExpanded(parents);
    }
  }, [docs]);

  // Auto-select first
  useEffect(() => {
    if (!selectedId && docs.length > 0) setSelectedId(docs[0].id);
  }, [docs, selectedId]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let result = docs;
    if (categoryFilter) {
      result = result.filter(d => d.category === categoryFilter || (d.tags && d.tags.includes(categoryFilter)));
    }
    if (search) {
      const q = search.toLowerCase();
      const matchIds = new Set<string>();
      result.forEach(d => {
        if (d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)) {
          matchIds.add(d.id);
          // Also include ancestors
          let parent = result.find(p => p.id === d.parent_id);
          while (parent) {
            matchIds.add(parent.id);
            parent = result.find(p => p.id === parent!.parent_id);
          }
        }
      });
      result = result.filter(d => matchIds.has(d.id));
    }
    return result;
  }, [docs, search, categoryFilter]);

  const topLevel = useMemo(() =>
    filtered.filter(d => !d.parent_id).sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title)),
    [filtered]
  );

  const categories = useMemo(() => [...new Set(docs.map(d => d.category))], [docs]);
  const selected = docs.find(d => d.id === selectedId);

  // ── Mutations ──

  const saveMutation = useMutation({
    mutationFn: async ({ id, title, content, icon, parent_id }: { id: string; title: string; content: string; icon: string; parent_id: string | null }) => {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { error } = await supabase.from('docs').update({ title, content, slug, icon, parent_id } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['docs'] });
      setEditing(false);
      toast.success('Document saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { data, error } = await supabase.from('docs').insert({
        owner_id: user.id,
        title: newTitle,
        slug,
        category: newCategory,
        icon: newIcon,
        parent_id: newParentId,
        content: `# ${newTitle}\n\nStart writing here...`,
      } as any).select().single();
      if (error) throw error;
      return data as Doc;
    },
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ['docs'] });
      setSelectedId(doc.id);
      setCreating(false);
      setNewTitle('');
      setNewCategory('general');
      setNewIcon('📄');
      setNewParentId(null);
      toast.success('Document created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('docs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['docs'] });
      setSelectedId(null);
      setEditing(false);
      toast.success('Document deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startEdit = () => {
    if (!selected) return;
    setEditTitle(selected.title);
    setEditContent(selected.content);
    setEditIcon(selected.icon || getDefaultIcon(selected.category));
    setEditParentId(selected.parent_id);
    setEditing(true);
  };

  // ── Render ──

  return (
    <AppLayout>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-72 border-r border-border flex flex-col bg-sidebar shrink-0">
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search docs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Button size="sm" className="w-full h-8 text-xs" onClick={() => setCreating(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> New Document
            </Button>
          </div>

          {/* Category filter chips */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1 px-3 pt-2">
              <button
                onClick={() => setCategoryFilter(null)}
                className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${!categoryFilter ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${categoryFilter === cat ? getCategoryColor(cat) : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Tree */}
          <div className="flex-1 overflow-y-auto py-2 px-1 scrollbar-thin">
            {(isLoading || seeding) && <p className="text-xs text-muted-foreground p-2">Loading...</p>}
            {topLevel.map(doc => (
              <DocTreeNode
                key={doc.id}
                doc={doc}
                docs={filtered}
                selectedId={selectedId}
                onSelect={(id) => { setSelectedId(id); setEditing(false); }}
                expanded={expanded}
                toggleExpand={toggleExpand}
                searchActive={!!search}
              />
            ))}
            {!isLoading && !seeding && filtered.length === 0 && (
              <p className="text-xs text-muted-foreground p-3 text-center">No documents found</p>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {creating ? (
            <div className="max-w-lg mx-auto p-8 space-y-4">
              <h2 className="text-lg font-bold text-foreground">New Document</h2>
              <div className="flex gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Icon</label>
                  <IconPicker value={newIcon} onChange={setNewIcon} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                  <Input placeholder="Document title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <select
                  value={newCategory}
                  onChange={e => {
                    setNewCategory(e.target.value);
                    setNewIcon(getDefaultIcon(e.target.value));
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {['General', 'Changelog', 'Architecture', 'Features', 'API Reference'].map(c => (
                    <option key={c} value={c.toLowerCase()}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Parent Document</label>
                <Select value={newParentId || '__none__'} onValueChange={v => setNewParentId(v === '__none__' ? null : v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None (top-level)</SelectItem>
                    {docs.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.icon || getDefaultIcon(d.category)} {d.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => createMutation.mutate()} disabled={!newTitle.trim() || createMutation.isPending} size="sm">
                  <Save className="w-3.5 h-3.5 mr-1" /> Create
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>
                  <X className="w-3.5 h-3.5 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : selected ? (
            <div className="max-w-3xl mx-auto p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{selected.icon || getDefaultIcon(selected.category)}</span>
                <Badge className={`${getCategoryColor(selected.category)} text-xs`}>{selected.category}</Badge>
                {selected.tags && selected.tags.length > 0 && selected.tags.map(t => (
                  <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                ))}
                {!editing && (
                  <div className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" onClick={startEdit}>
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                      if (confirm('Delete this document?')) deleteMutation.mutate(selected.id);
                    }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {editing ? (
                <div className="space-y-3">
                  <div className="flex gap-3 items-end">
                    <IconPicker value={editIcon} onChange={setEditIcon} />
                    <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-lg font-bold flex-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Parent Document</label>
                    <Select value={editParentId || '__none__'} onValueChange={v => setEditParentId(v === '__none__' ? null : v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None (top-level)</SelectItem>
                        {docs.filter(d => d.id !== selected.id).map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.icon || getDefaultIcon(d.category)} {d.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="min-h-[60vh] font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveMutation.mutate({ id: selected.id, title: editTitle, content: editContent, icon: editIcon, parent_id: editParentId })} disabled={saveMutation.isPending}>
                      <Save className="w-3.5 h-3.5 mr-1" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                      <X className="w-3.5 h-3.5 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <MarkdownRenderer content={selected.content} />
              )}
              <p className="text-[10px] text-muted-foreground mt-8">
                Last updated: {new Date(selected.updated_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a document or create a new one
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
