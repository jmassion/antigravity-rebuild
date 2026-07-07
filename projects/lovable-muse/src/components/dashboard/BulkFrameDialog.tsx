import { useState } from 'react';
import { X, Loader2, Plus, Hash, SortAsc } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BulkFrameDialogProps {
  storyboardId: string;
  currentFrameCount: number;
  onClose: () => void;
}

export default function BulkFrameDialog({ storyboardId, currentFrameCount, onClose }: BulkFrameDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [count, setCount] = useState(5);
  const [prefix, setPrefix] = useState('Frame');
  const [startNumber, setStartNumber] = useState(currentFrameCount + 1);
  const [defaultDuration, setDefaultDuration] = useState(3);
  const [numberingStyle, setNumberingStyle] = useState<'numeric' | 'padded'>('padded');

  const bulkAdd = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const frames = Array.from({ length: count }, (_, i) => {
        const num = startNumber + i;
        const label = numberingStyle === 'padded'
          ? String(num).padStart(3, '0')
          : String(num);
        return {
          storyboard_id: storyboardId,
          sort_order: currentFrameCount + i,
          title: `${prefix} ${label}`,
          duration_seconds: defaultDuration,
          notes: '',
        };
      });
      const { error } = await supabase.from('storyboard_frames').insert(frames);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storyboards'] });
      toast({ title: `${count} frames added` });
      onClose();
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-sm p-4 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Bulk Add Frames
          </h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        {/* Count */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-muted-foreground font-medium">Number of frames</label>
          <div className="flex items-center gap-2">
            <input
              type="range" min={1} max={50} value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="flex-1 accent-primary h-1.5"
            />
            <input
              type="number" min={1} max={100} value={count}
              onChange={e => setCount(Math.max(1, Number(e.target.value)))}
              className="w-16 px-2 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground text-center outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Naming */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] text-muted-foreground font-medium">Prefix</label>
            <input
              value={prefix}
              onChange={e => setPrefix(e.target.value)}
              className="w-full px-2 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Hash className="w-3 h-3" /> Start at
            </label>
            <input
              type="number" min={1} value={startNumber}
              onChange={e => setStartNumber(Math.max(1, Number(e.target.value)))}
              className="w-full px-2 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Numbering style */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <SortAsc className="w-3 h-3" /> Numbering
          </label>
          <div className="flex gap-2">
            {(['padded', 'numeric'] as const).map(style => (
              <button
                key={style}
                onClick={() => setNumberingStyle(style)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                  numberingStyle === style ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-secondary border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {style === 'padded' ? 'Padded (001, 002)' : 'Simple (1, 2)'}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-muted-foreground font-medium">Default duration (seconds)</label>
          <div className="flex items-center gap-2">
            <input
              type="range" min={0.5} max={30} step={0.5} value={defaultDuration}
              onChange={e => setDefaultDuration(Number(e.target.value))}
              className="flex-1 accent-primary h-1.5"
            />
            <span className="text-xs font-mono text-foreground w-10 text-right">{defaultDuration}s</span>
          </div>
        </div>

        {/* Preview */}
        <div className="p-2.5 rounded-md bg-secondary/50 border border-border">
          <p className="text-[10px] text-muted-foreground mb-1">Preview:</p>
          <p className="text-xs text-foreground font-mono">
            {prefix} {numberingStyle === 'padded' ? String(startNumber).padStart(3, '0') : startNumber}
            {' → '}
            {prefix} {numberingStyle === 'padded' ? String(startNumber + count - 1).padStart(3, '0') : startNumber + count - 1}
            {' '}({count} frames × {defaultDuration}s = {(count * defaultDuration).toFixed(1)}s)
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button
            onClick={() => bulkAdd.mutate()}
            disabled={bulkAdd.isPending || count < 1}
            className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
          >
            {bulkAdd.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            Add {count} Frames
          </button>
        </div>
      </div>
    </div>
  );
}
