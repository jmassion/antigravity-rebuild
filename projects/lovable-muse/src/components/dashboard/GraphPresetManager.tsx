import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import type { NodeType } from '@/pages/Connections';

export interface PresetConfig {
  hiddenTypes: NodeType[];
  search: string;
  viewMode: '2d' | '3d';
  graphViewMode: 'graph' | 'list' | 'matrix';
  pinnedNodes: Record<string, { x: number; y: number }>;
  linkThickness: number;
}

interface Props {
  currentConfig: PresetConfig;
  onLoadPreset: (config: PresetConfig) => void;
}

export default function GraphPresetManager({ currentConfig, onLoadPreset }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);

  const { data: presets = [], isLoading } = useQuery({
    queryKey: ['graph-presets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('graph_presets' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('graph_presets' as any)
        .insert({ owner_id: user!.id, name, config: currentConfig as any });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['graph-presets'] });
      toast.success('Preset saved');
      setSaveName('');
      setShowSave(false);
    },
    onError: () => toast.error('Failed to save preset'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('graph_presets' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['graph-presets'] });
      toast.success('Preset deleted');
    },
  });

  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            Presets <ChevronDown className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end">
          <p className="text-xs font-semibold text-foreground mb-2">Saved Arrangements</p>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto my-2" />
          ) : presets.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">No presets saved yet</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {presets.map((p: any) => (
                <div key={p.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-accent/30 transition-colors group">
                  <button
                    className="flex-1 text-left text-xs text-foreground truncate"
                    onClick={() => onLoadPreset(p.config as PresetConfig)}
                  >
                    {p.name}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(p.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border mt-2 pt-2">
            {showSave ? (
              <div className="flex items-center gap-1">
                <Input
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="Preset name..."
                  className="h-7 text-xs flex-1"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && saveName.trim()) saveMutation.mutate(saveName.trim());
                    if (e.key === 'Escape') setShowSave(false);
                  }}
                />
                <Button
                  size="sm"
                  className="h-7 text-xs px-2"
                  disabled={!saveName.trim() || saveMutation.isPending}
                  onClick={() => saveName.trim() && saveMutation.mutate(saveName.trim())}
                >
                  {saveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="w-full h-7 text-xs gap-1" onClick={() => setShowSave(true)}>
                <Save className="w-3 h-3" /> Save Current
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
