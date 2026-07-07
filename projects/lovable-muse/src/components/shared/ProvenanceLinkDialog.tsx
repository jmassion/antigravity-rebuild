import { useState } from 'react';
import { X, Plus, Loader2, Link2, Check, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ENTITY_TYPES = ['asset', 'storyboard', 'project', 'plan', 'doc', 'link', 'task'] as const;
type EntityType = typeof ENTITY_TYPES[number];

const RELATIONSHIPS = [
  { value: 'derived_from', label: 'Derived from' },
  { value: 'inspires', label: 'Inspires' },
  { value: 'implements', label: 'Implements' },
  { value: 'references', label: 'References' },
  { value: 'produces', label: 'Produces' },
];

interface ProvenanceLinkDialogProps {
  sourceType: string;
  sourceId: string;
  onClose: () => void;
}

export default function ProvenanceLinkDialog({ sourceType, sourceId, onClose }: ProvenanceLinkDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [targetType, setTargetType] = useState<EntityType>('asset');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [relationship, setRelationship] = useState('derived_from');
  const [search, setSearch] = useState('');

  // Fetch existing links
  const { data: existingLinks = [] } = useQuery({
    queryKey: ['provenance-edges', sourceType, sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provenance_edges')
        .select('*')
        .or(`and(source_type.eq.${sourceType},source_id.eq.${sourceId}),and(target_type.eq.${sourceType},target_id.eq.${sourceId})`);
      if (error) throw error;
      return data;
    },
  });

  // Fetch target options based on selected type
  const { data: targetOptions = [], isLoading: loadingTargets } = useQuery({
    queryKey: ['provenance-targets', targetType],
    queryFn: async () => {
      const table = targetType === 'plan' ? 'plans' : targetType === 'storyboard' ? 'storyboards' : targetType + 's';
      const nameCol = targetType === 'link' ? 'title' : 'name';
      const selectCol = table === 'tasks' ? 'id, title' : table === 'docs' ? 'id, title' : table === 'plans' ? 'id, title' : `id, ${nameCol}`;
      const { data, error } = await supabase.from(table as any).select(selectCol).limit(200);
      if (error) throw error;
      return (data || []).map((d: any) => ({ id: d.id, label: d.name || d.title || d.id }));
    },
    enabled: !!targetType,
  });

  const filteredOptions = targetOptions
    .filter((o: any) => o.id !== sourceId)
    .filter((o: any) => !search || o.label.toLowerCase().includes(search.toLowerCase()));

  const toggleId = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addLinks = useMutation({
    mutationFn: async () => {
      if (!user || selectedIds.size === 0) throw new Error('Select at least one target');
      const edges = [...selectedIds].map(targetId => ({
        owner_id: user.id,
        source_type: sourceType,
        source_id: sourceId,
        target_type: targetType,
        target_id: targetId,
        relationship,
      }));
      const { error } = await supabase.from('provenance_edges').insert(edges as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provenance-edges'] });
      setSelectedIds(new Set());
      toast({ title: `${selectedIds.size} provenance link(s) added` });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const removeLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('provenance_edges').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provenance-edges'] });
      toast({ title: 'Link removed' });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-5 space-y-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" /> Provenance Links
          </h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        {/* Existing links */}
        {existingLinks.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Existing links ({existingLinks.length})</span>
            <div className="max-h-[120px] overflow-y-auto space-y-1">
              {existingLinks.map((edge: any) => {
                const isSource = edge.source_type === sourceType && edge.source_id === sourceId;
                return (
                  <div key={edge.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-secondary text-xs">
                    <span className="text-foreground">
                      {isSource ? '→' : '←'} {isSource ? edge.target_type : edge.source_type}: {isSource ? edge.target_id.slice(0, 8) : edge.source_id.slice(0, 8)}...
                      <span className="text-muted-foreground ml-1">({edge.relationship})</span>
                    </span>
                    <button onClick={() => removeLink.mutate(edge.id)} className="text-destructive/60 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add new links (multi-select) */}
        <div className="space-y-2 pt-2 border-t border-border flex-1 min-h-0 flex flex-col">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Add links (multi-select)</span>
          <div className="flex gap-2">
            <select value={relationship} onChange={e => setRelationship(e.target.value)}
              className="flex-1 px-2 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground">
              {RELATIONSHIPS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select value={targetType} onChange={e => { setTargetType(e.target.value as EntityType); setSelectedIds(new Set()); setSearch(''); }}
              className="flex-1 px-2 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground capitalize">
              {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-secondary border border-border">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${targetType}s...`}
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1" />
          </div>

          {/* Checkbox list */}
          <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0 max-h-[200px] border border-border rounded-md p-1">
            {loadingTargets ? (
              <div className="flex items-center justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
            ) : filteredOptions.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">No {targetType}s found</div>
            ) : (
              filteredOptions.map((o: any) => (
                <button
                  key={o.id}
                  onClick={() => toggleId(o.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    selectedIds.has(o.id) ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    selectedIds.has(o.id) ? 'bg-primary border-primary' : 'border-border'
                  }`}>
                    {selectedIds.has(o.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className="truncate">{o.label}</span>
                </button>
              ))
            )}
          </div>

          <button onClick={() => addLinks.mutate()} disabled={selectedIds.size === 0 || addLinks.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50">
            {addLinks.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Add {selectedIds.size > 0 ? `${selectedIds.size} Link${selectedIds.size > 1 ? 's' : ''}` : 'Links'}
          </button>
        </div>
      </div>
    </div>
  );
}
