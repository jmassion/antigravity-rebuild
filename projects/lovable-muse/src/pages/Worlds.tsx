import { useState } from 'react';
import { Search, Plus, Loader2, X, Pencil, Trash2, Check, GripVertical, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AppLayout from '@/components/layout/AppLayout';
import ProjectSelect from '@/components/shared/ProjectSelect';
import TagInput from '@/components/shared/TagInput';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const SECTIONS = [
  { key: 'world:locations', label: 'Locations', icon: '📍', desc: 'Cities, rooms, landmarks, and places' },
  { key: 'world:props', label: 'Props', icon: '🎭', desc: 'Objects, weapons, tools, and items' },
  { key: 'world:environments', label: 'Environments', icon: '🌄', desc: 'Biomes, weather, lighting, and atmospheres' },
  { key: 'world:lore', label: 'Lore', icon: '📜', desc: 'History, myths, factions, and world rules' },
  { key: 'world:rules', label: 'Rules', icon: '⚙️', desc: 'Physics, magic systems, and constraints' },
];

type WorldEntry = {
  id: string;
  label: string;
  description: string | null;
  value: string;
  category: string;
  tags: string[] | null;
  sort_order: number;
  project_id: string | null;
  updated_at: string;
};

export default function Worlds() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  // Form state
  const [formLabel, setFormLabel] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['world-entries', user?.id, projectFilter],
    queryFn: async () => {
      let query = supabase
        .from('style_guide_entries')
        .select('*')
        .like('category', 'world:%')
        .order('sort_order', { ascending: true });
      if (projectFilter) query = query.eq('project_id', projectFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data as WorldEntry[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (category: string) => {
      if (!user) throw new Error('Not authenticated');
      const sectionEntries = entries.filter(e => e.category === category);
      const maxOrder = sectionEntries.reduce((m, e) => Math.max(m, e.sort_order), -1);
      const { error } = await supabase.from('style_guide_entries').insert({
        owner_id: user.id,
        label: formLabel,
        description: formDesc,
        value: formValue,
        category,
        tags: formTags,
        sort_order: maxOrder + 1,
        project_id: projectFilter || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['world-entries'] });
      resetForm();
      toast({ title: 'Entry created' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('style_guide_entries').update({
        label: formLabel,
        description: formDesc,
        value: formValue,
        tags: formTags,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['world-entries'] });
      resetForm();
      toast({ title: 'Entry updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('style_guide_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['world-entries'] });
      toast({ title: 'Entry deleted' });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ items }: { items: { id: string; sort_order: number }[] }) => {
      for (const item of items) {
        await supabase.from('style_guide_entries').update({ sort_order: item.sort_order }).eq('id', item.id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['world-entries'] }),
  });

  const resetForm = () => {
    setAddingTo(null);
    setEditingId(null);
    setFormLabel('');
    setFormDesc('');
    setFormValue('');
    setFormTags([]);
  };

  const startEdit = (entry: WorldEntry) => {
    setEditingId(entry.id);
    setFormLabel(entry.label);
    setFormDesc(entry.description || '');
    setFormValue(entry.value);
    setFormTags(entry.tags || []);
  };

  const handleDragEnd = (result: DropResult, category: string) => {
    if (!result.destination) return;
    const sectionEntries = entries.filter(e => e.category === category);
    const reordered = [...sectionEntries];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    reorderMutation.mutate({ items: reordered.map((e, i) => ({ id: e.id, sort_order: i })) });
  };

  const filteredEntries = (category: string) => {
    let items = entries.filter(e => e.category === category);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(e => e.label.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q));
    }
    return items;
  };

  const EntryForm = ({ category }: { category: string }) => (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
      className="rounded-md border border-primary/30 bg-card p-3 space-y-2 overflow-hidden mt-2">
      <input value={formLabel} onChange={e => setFormLabel(e.target.value)} placeholder="Entry name..."
        className="w-full px-3 py-1.5 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
      <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Description..."
        rows={2} className="w-full px-3 py-1.5 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-y" />
      <div className="flex items-center gap-2">
        <Image className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input value={formValue} onChange={e => setFormValue(e.target.value)} placeholder="Reference image URL (optional)..."
          className="flex-1 px-3 py-1.5 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <TagInput value={formTags} onChange={setFormTags} placeholder="Tags..." />
      <div className="flex gap-2 justify-end">
        <button onClick={resetForm} className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
        <button onClick={() => editingId ? updateMutation.mutate(editingId) : createMutation.mutate(category)}
          disabled={!formLabel.trim()} className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50">
          <Check className="w-3 h-3" /> {editingId ? 'Update' : 'Add'}
        </button>
      </div>
    </motion.div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-xl">🌍</span> Worlds & Props
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Environments, backgrounds, props, and scene elements</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border max-w-sm flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
          </div>
          <ProjectSelect value={projectFilter} onChange={setProjectFilter} placeholder="All projects" size="sm" className="w-48" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <Accordion type="multiple" defaultValue={SECTIONS.map(s => s.key)} className="space-y-2">
            {SECTIONS.map(section => {
              const items = filteredEntries(section.key);
              return (
                <AccordionItem key={section.key} value={section.key} className="rounded-lg border border-border bg-card overflow-hidden">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{section.icon}</span>
                      <span className="font-semibold text-sm">{section.label}</span>
                      <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{items.length}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-[11px] text-muted-foreground mb-3">{section.desc}</p>

                    {items.length === 0 && addingTo !== section.key ? (
                      <div className="text-center py-6 text-muted-foreground/60 text-xs">
                        No entries yet. Add your first {section.label.toLowerCase()} entry.
                      </div>
                    ) : (
                      <DragDropContext onDragEnd={(r) => handleDragEnd(r, section.key)}>
                        <Droppable droppableId={section.key}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5">
                              {items.map((entry, i) => (
                                <Draggable key={entry.id} draggableId={entry.id} index={i}>
                                  {(dragProvided, dragSnapshot) => (
                                    <div ref={dragProvided.innerRef} {...dragProvided.draggableProps}
                                      className={`flex items-start gap-2 p-2.5 rounded-md border border-border bg-secondary/30 group transition-colors ${
                                        dragSnapshot.isDragging ? 'shadow-lg border-primary/30' : 'hover:border-primary/20'
                                      }`}>
                                      <div {...dragProvided.dragHandleProps} className="mt-1 cursor-grab">
                                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
                                      </div>
                                      {entry.value && (
                                        <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                                          <img src={entry.value} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{entry.label}</p>
                                        {entry.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{entry.description}</p>}
                                        {(entry.tags || []).length > 0 && (
                                          <div className="flex gap-1 mt-1">
                                            {(entry.tags || []).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>)}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(entry)} className="p-1 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => deleteMutation.mutate(entry.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}

                    <AnimatePresence>
                      {(addingTo === section.key || (editingId && entries.find(e => e.id === editingId)?.category === section.key)) && (
                        <EntryForm category={section.key} />
                      )}
                    </AnimatePresence>

                    {addingTo !== section.key && !editingId && (
                      <button onClick={() => { resetForm(); setAddingTo(section.key); }}
                        className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add {section.label.toLowerCase()}
                      </button>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </AppLayout>
  );
}
