import { useState } from 'react';
import { Copy, X, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FrameCopyDialogProps {
  frame: {
    id: string;
    title: string | null;
    notes: string | null;
    duration_seconds: number | null;
    status: string;
    asset_id?: string | null;
    annotations?: any;
    audio_url?: string | null;
  };
  sourceStoryboardId: string;
  onClose: () => void;
}

export default function FrameCopyDialog({ frame, sourceStoryboardId, onClose }: FrameCopyDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSbId, setSelectedSbId] = useState('');

  const { data: storyboards = [], isLoading } = useQuery({
    queryKey: ['all-storyboards-for-copy', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storyboards')
        .select('id, name, project_id, projects(name), storyboard_frames(sort_order)')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const copyFrame = useMutation({
    mutationFn: async () => {
      if (!selectedSbId) throw new Error('Select a storyboard');
      // Get next sort_order in target storyboard
      const { data: existing } = await supabase
        .from('storyboard_frames')
        .select('sort_order')
        .eq('storyboard_id', selectedSbId)
        .order('sort_order', { ascending: false })
        .limit(1);
      const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

      const { error } = await supabase.from('storyboard_frames').insert({
        storyboard_id: selectedSbId,
        sort_order: nextOrder,
        title: frame.title,
        notes: frame.notes,
        duration_seconds: frame.duration_seconds,
        status: 'draft',
        asset_id: frame.asset_id || null,
        annotations: frame.annotations || [],
        audio_url: frame.audio_url || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storyboards'] });
      toast({ title: 'Frame copied successfully' });
      onClose();
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  // Group by project
  const grouped = storyboards.reduce<Record<string, typeof storyboards>>((acc, sb) => {
    const pName = (sb as any).projects?.name || 'No Project';
    if (!acc[pName]) acc[pName] = [];
    acc[pName].push(sb);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Copy className="w-4 h-4 text-primary" />
            Copy Frame: {frame.title || 'Untitled'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
          <p className="text-xs text-muted-foreground">Select a target storyboard to copy this frame into:</p>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            Object.entries(grouped).map(([projectName, sbs]) => (
              <div key={projectName}>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{projectName}</p>
                <div className="space-y-1">
                  {sbs.map((sb: any) => {
                    const isSame = sb.id === sourceStoryboardId;
                    const frameCount = (sb.storyboard_frames || []).length;
                    return (
                      <button
                        key={sb.id}
                        onClick={() => setSelectedSbId(sb.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-xs transition-colors ${
                          selectedSbId === sb.id
                            ? 'bg-primary/10 border border-primary/30 text-foreground'
                            : 'bg-secondary/50 hover:bg-secondary text-foreground border border-transparent'
                        } ${isSame ? 'opacity-60' : ''}`}
                      >
                        <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform ${selectedSbId === sb.id ? 'text-primary rotate-90' : 'text-muted-foreground'}`} />
                        <span className="truncate flex-1">{sb.name}</span>
                        <span className="text-[10px] text-muted-foreground">{frameCount} frames</span>
                        {isSame && <span className="text-[9px] text-primary/70">(same)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={() => copyFrame.mutate()}
            disabled={!selectedSbId || copyFrame.isPending}
            className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
          >
            {copyFrame.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Copy className="w-3 h-3" />}
            Copy Frame
          </button>
        </div>
      </motion.div>
    </div>
  );
}
