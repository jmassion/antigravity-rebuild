import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pencil, Check, X, GripVertical, Palette, Type, Image, Layers,
  Sparkles, ChevronDown, ChevronRight, Copy, Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AppLayout from '@/components/layout/AppLayout';
import ProjectSelect from '@/components/shared/ProjectSelect';
import TagInput from '@/components/shared/TagInput';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';

// ---- Category definitions ----
const CATEGORIES = [
  { key: 'colors', label: 'Colors', icon: Palette, placeholder: 'e.g. #7C3AED', valuePlaceholder: '#hex or rgb()', descPlaceholder: 'Primary brand color' },
  { key: 'typography', label: 'Typography', icon: Type, placeholder: 'e.g. Inter, 16px/1.5', valuePlaceholder: 'Font family, size, weight...', descPlaceholder: 'Heading font' },
  { key: 'logos', label: 'Logos & Marks', icon: Sparkles, placeholder: 'e.g. Main Logo', valuePlaceholder: 'URL or description', descPlaceholder: 'Primary logo – dark background' },
  { key: 'imagery', label: 'Imagery & Mood', icon: Image, placeholder: 'e.g. Hero Style', valuePlaceholder: 'URL or keywords', descPlaceholder: 'Warm, cinematic, natural light' },
  { key: 'patterns', label: 'Patterns & Textures', icon: Layers, placeholder: 'e.g. Grid overlay', valuePlaceholder: 'URL or CSS value', descPlaceholder: 'Subtle dot grid' },
  { key: 'spacing', label: 'Spacing & Layout', icon: Layers, placeholder: 'e.g. Base unit 8px', valuePlaceholder: '8px / 16px / 24px', descPlaceholder: 'Consistent 8pt grid' },
  { key: 'general', label: 'General Notes', icon: Pencil, placeholder: 'e.g. Voice & Tone', valuePlaceholder: 'Details...', descPlaceholder: 'Additional context' },
] as const;

type CategoryKey = typeof CATEGORIES[number]['key'];

interface Entry {
  id: string;
  category: string;
  label: string;
  value: string;
  description: string;
  sort_order: number;
  metadata: any;
  tags: string[];
  project_id: string | null;
}

function isColor(v: string) {
  return /^#([0-9a-f]{3,8})$/i.test(v.trim()) || /^(rgb|hsl)a?\(/i.test(v.trim());
}

function isImageUrl(v: string) {
  return /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg)/i.test(v.trim());
}

// ---- Inline entry form ----
function EntryForm({
  initial,
  cat,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Partial<Entry>;
  cat: typeof CATEGORIES[number];
  onSave: (data: { label: string; value: string; description: string; tags: string[] }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [label, setLabel] = useState(initial?.label || '');
  const [value, setValue] = useState(initial?.value || '');
  const [desc, setDesc] = useState(initial?.description || '');
  const [tags, setTags] = useState<string[]>(initial?.tags || []);

  return (
    <div className="rounded-lg border border-primary/30 bg-card p-3 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder={cat.placeholder}
          className="px-3 py-1.5 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          autoFocus
        />
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={cat.valuePlaceholder}
          className="px-3 py-1.5 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <input
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder={cat.descPlaceholder}
        className="w-full px-3 py-1.5 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
      />
      <TagInput value={tags} onChange={setTags} placeholder="Tags (optional)..." />
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSave({ label, value, description: desc, tags })}
          disabled={!label.trim() || saving}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Save
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 rounded-md bg-secondary text-muted-foreground text-xs hover:text-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---- Entry card ----
function EntryCard({ entry, onEdit, onDelete, onDuplicate }: {
  entry: Entry;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const colorVal = isColor(entry.value);
  const imgVal = isImageUrl(entry.value);

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-all">
      {/* Visual preview */}
      {colorVal && (
        <div
          className="w-10 h-10 rounded-md border border-border shrink-0 shadow-inner"
          style={{ backgroundColor: entry.value.trim() }}
          title={entry.value}
        />
      )}
      {imgVal && (
        <div className="w-10 h-10 rounded-md border border-border shrink-0 overflow-hidden bg-muted">
          <img src={entry.value.trim()} alt={entry.label} className="w-full h-full object-cover" />
        </div>
      )}
      {!colorVal && !imgVal && (
        <div className="w-10 h-10 rounded-md bg-secondary border border-border shrink-0 flex items-center justify-center text-muted-foreground text-[10px] font-mono truncate px-1">
          {entry.value.slice(0, 6) || '—'}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{entry.label || 'Untitled'}</p>
          {entry.value && !colorVal && !imgVal && (
            <code className="text-[10px] text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded truncate max-w-[180px]">{entry.value}</code>
          )}
          {colorVal && (
            <code className="text-[10px] text-muted-foreground font-mono">{entry.value.trim()}</code>
          )}
        </div>
        {entry.description && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{entry.description}</p>}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {entry.tags.map(t => (
              <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/70">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onDuplicate} className="p-1 text-muted-foreground hover:text-primary" title="Duplicate"><Copy className="w-3 h-3" /></button>
        <button onClick={onEdit} className="p-1 text-muted-foreground hover:text-primary" title="Edit"><Pencil className="w-3 h-3" /></button>
        <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive" title="Delete"><Trash2 className="w-3 h-3" /></button>
      </div>
    </div>
  );
}

// ---- Main page ----
export default function StyleGuides() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [projectFilter, setProjectFilter] = useState('');
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['style-guide-entries', user?.id, projectFilter],
    queryFn: async () => {
      let q = supabase
        .from('style_guide_entries')
        .select('*')
        .order('sort_order', { ascending: true });
      if (projectFilter) q = q.eq('project_id', projectFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data as Entry[];
    },
    enabled: !!user,
  });

  const createEntry = useMutation({
    mutationFn: async (data: { category: string; label: string; value: string; description: string; tags: string[] }) => {
      if (!user) throw new Error('Not authenticated');
      const maxOrder = entries.filter(e => e.category === data.category).reduce((m, e) => Math.max(m, e.sort_order), -1);
      const { error } = await supabase.from('style_guide_entries').insert({
        owner_id: user.id,
        project_id: projectFilter || null,
        category: data.category,
        label: data.label,
        value: data.value,
        description: data.description,
        tags: data.tags,
        sort_order: maxOrder + 1,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['style-guide-entries'] });
      setAddingTo(null);
      toast({ title: 'Entry added' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; label: string; value: string; description: string; tags: string[] }) => {
      const { error } = await supabase.from('style_guide_entries').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['style-guide-entries'] });
      setEditingId(null);
      toast({ title: 'Entry updated' });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('style_guide_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['style-guide-entries'] });
      toast({ title: 'Entry deleted' });
    },
  });

  const duplicateEntry = (entry: Entry) => {
    createEntry.mutate({
      category: entry.category,
      label: `${entry.label} (copy)`,
      value: entry.value,
      description: entry.description,
      tags: entry.tags,
    });
  };

  const toggleCat = (key: string) => {
    setCollapsedCats(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleReorder = (catKey: string, result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const catEntries = entries.filter(e => e.category === catKey);
    const reordered = Array.from(catEntries);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    // Optimistic + persist
    reordered.forEach((entry, i) => {
      supabase.from('style_guide_entries').update({ sort_order: i }).eq('id', entry.id).then(() => {});
    });
    queryClient.invalidateQueries({ queryKey: ['style-guide-entries'] });
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-[1000px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-xl">🎨</span> {t('styleGuides.title')}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">{t('styleGuides.desc')}</p>
          </div>
        </div>

        {/* Project filter */}
        <div className="mb-6 max-w-xs">
          <ProjectSelect value={projectFilter} onChange={setProjectFilter} placeholder="All projects" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            {CATEGORIES.map(cat => {
              const catEntries = entries.filter(e => e.category === cat.key);
              const isOpen = !collapsedCats.has(cat.key);
              const Icon = cat.icon;

              return (
                <div key={cat.key} className="rounded-xl border border-border bg-card/50 overflow-hidden">
                  {/* Category header */}
                  <button
                    onClick={() => toggleCat(cat.key)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{cat.label}</span>
                      <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{catEntries.length}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddingTo(cat.key); if (collapsedCats.has(cat.key)) toggleCat(cat.key); }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2">
                          {/* Add form */}
                          {addingTo === cat.key && (
                            <EntryForm
                              cat={cat}
                              saving={createEntry.isPending}
                              onSave={(data) => createEntry.mutate({ category: cat.key, ...data })}
                              onCancel={() => setAddingTo(null)}
                            />
                          )}

                          {/* Entries */}
                          <DragDropContext onDragEnd={(r) => handleReorder(cat.key, r)}>
                            <Droppable droppableId={`sg-${cat.key}`}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5">
                                  {catEntries.map((entry, i) => (
                                    <Draggable key={entry.id} draggableId={entry.id} index={i}>
                                      {(dragProvided, snapshot) => (
                                        <div
                                          ref={dragProvided.innerRef}
                                          {...dragProvided.draggableProps}
                                          className={snapshot.isDragging ? 'opacity-80 rotate-[0.5deg]' : ''}
                                        >
                                          {editingId === entry.id ? (
                                            <EntryForm
                                              initial={entry}
                                              cat={cat}
                                              saving={updateEntry.isPending}
                                              onSave={(data) => updateEntry.mutate({ id: entry.id, ...data })}
                                              onCancel={() => setEditingId(null)}
                                            />
                                          ) : (
                                            <div className="flex items-center gap-1">
                                              <div {...dragProvided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/30 hover:text-muted-foreground">
                                                <GripVertical className="w-3 h-3" />
                                              </div>
                                              <div className="flex-1">
                                                <EntryCard
                                                  entry={entry}
                                                  onEdit={() => setEditingId(entry.id)}
                                                  onDelete={() => deleteEntry.mutate(entry.id)}
                                                  onDuplicate={() => duplicateEntry(entry)}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>

                          {catEntries.length === 0 && addingTo !== cat.key && (
                            <button
                              onClick={() => setAddingTo(cat.key)}
                              className="w-full py-4 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add your first {cat.label.toLowerCase()} entry
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
