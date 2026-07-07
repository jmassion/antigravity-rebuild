import { useState } from 'react';
import { X, Loader2, Link2, Check, Search } from 'lucide-react';
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

interface BulkAttachDialogProps {
  /** The source items to attach FROM */
  sources: { id: string; type: string; label: string }[];
  /** Default target type to show */
  defaultTargetType?: EntityType;
  /** If true, sources become targets (reverse direction) */
  reverse?: boolean;
  onClose: () => void;
}

export default function BulkAttachDialog({ sources, defaultTargetType = 'storyboard', reverse = false, onClose }: BulkAttachDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [targetType, setTargetType] = useState<EntityType>(defaultTargetType);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [relationship, setRelationship] = useState('derived_from');
  const [search, setSearch] = useState('');

  const { data: targetOptions = [], isLoading: loadingTargets } = useQuery({
    queryKey: ['bulk-attach-targets', targetType],
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

  const sourceIds = new Set(sources.map(s => s.id));
  const filteredOptions = targetOptions.filter((o: any) =>
    !sourceIds.has(o.id) && (!search || o.label.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleId = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const allIds = filteredOptions.map((o: any) => o.id);
    setSelectedIds(new Set(allIds));
  };

  const deselectAll = () => setSelectedIds(new Set());

  const attachMutation = useMutation({
    mutationFn: async () => {
      if (!user || selectedIds.size === 0) throw new Error('Select at least one target');
      const edges: any[] = [];
      for (const source of sources) {
        for (const targetId of selectedIds) {
          edges.push({
            owner_id: user.id,
            source_type: reverse ? targetType : source.type,
            source_id: reverse ? targetId : source.id,
            target_type: reverse ? source.type : targetType,
            target_id: reverse ? source.id : targetId,
            relationship,
          });
        }
      }
      const { error } = await supabase.from('provenance_edges').insert(edges as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provenance-edges'] });
      toast({ title: `${sources.length * selectedIds.size} provenance links created` });
      onClose();
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const directionLabel = reverse
    ? `Attach ${selectedIds.size} ${targetType}(s) → ${sources.length} item(s)`
    : `Attach ${sources.length} item(s) → ${selectedIds.size} ${targetType}(s)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-lg p-5 space-y-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" /> Bulk Attach ({sources.length} source{sources.length !== 1 ? 's' : ''})
          </h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        {/* Sources preview */}
        <div className="flex flex-wrap gap-1.5">
          {sources.slice(0, 5).map(s => (
            <span key={s.id} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s.label}</span>
          ))}
          {sources.length > 5 && <span className="text-[10px] text-muted-foreground">+{sources.length - 5} more</span>}
        </div>

        {/* Controls */}
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
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-secondary border border-border">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${targetType}s...`}
            className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1" />
        </div>

        {/* Select all / none */}
        <div className="flex items-center gap-2 text-[10px]">
          <button onClick={selectAll} className="text-primary hover:underline">Select all ({filteredOptions.length})</button>
          <span className="text-muted-foreground">·</span>
          <button onClick={deselectAll} className="text-muted-foreground hover:text-foreground">None</button>
          <span className="ml-auto text-muted-foreground">{selectedIds.size} selected</span>
        </div>

        {/* Checkbox list */}
        <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0 max-h-[300px] border border-border rounded-md p-1">
          {loadingTargets ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
          ) : filteredOptions.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-6">No {targetType}s found</div>
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

        {/* Action */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground">{directionLabel}</span>
          <button
            onClick={() => attachMutation.mutate()}
            disabled={selectedIds.size === 0 || attachMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
          >
            {attachMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
            Attach {selectedIds.size > 0 ? `(${sources.length * selectedIds.size} links)` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
