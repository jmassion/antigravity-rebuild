import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, MessageSquare, Check, X, Play, Pause, Volume2, Music, Film, Tag, Plus, Trash2,
  ChevronDown, ChevronRight, Users, Waves, Mic, Gauge
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Annotation {
  id: string;
  text: string;
  time: number;
  color: string;
  layer?: string; // 'note' | 'dialogue' | 'direction'
  character?: string;
}

interface Frame {
  id: string;
  sort_order: number;
  title: string | null;
  notes: string | null;
  duration_seconds: number | null;
  status: string;
  audio_url?: string | null;
  annotations?: Annotation[] | any[] | null;
  assets?: { thumbnail_url: string | null; name: string | null; file_type?: string } | null;
}

interface FrameTimelineProps {
  frames: Frame[];
  storyboardId: string;
  onOpenPlayer?: () => void;
}

const statusBarColors: Record<string, string> = {
  draft: 'bg-muted-foreground/30',
  review: 'bg-phase-build',
  approved: 'bg-phase-grow',
  revision: 'bg-destructive',
};

const statusDotColors: Record<string, string> = {
  draft: 'bg-muted-foreground/50',
  review: 'bg-phase-build',
  approved: 'bg-phase-grow',
  revision: 'bg-destructive',
};

const ANNOTATION_COLORS = [
  'bg-primary', 'bg-phase-start', 'bg-phase-build', 'bg-phase-grow', 'bg-destructive',
];

type TrackKey = 'video' | 'dialogue' | 'notes' | 'score' | 'sfx' | 'audio';

export default function FrameTimeline({ frames, storyboardId, onOpenPlayer }: FrameTimelineProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editAnnotations, setEditAnnotations] = useState<Annotation[]>([]);
  const [playheadPos, setPlayheadPos] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [draggingEdge, setDraggingEdge] = useState<string | null>(null);
  const [collapsedTracks, setCollapsedTracks] = useState<Set<TrackKey>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const totalDuration = frames.reduce((sum, f) => sum + (f.duration_seconds || 0), 0) || 1;

  const toggleTrack = (key: TrackKey) => {
    setCollapsedTracks(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const isTrackOpen = (key: TrackKey) => !collapsedTracks.has(key);

  // Playhead animation
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setPlayheadPos(prev => {
          const next = prev + 0.05 * playbackSpeed;
          if (next >= totalDuration) { setIsPlaying(false); return 0; }
          return next;
        });
      }, 50);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [isPlaying, totalDuration, playbackSpeed]);

  const updateFrame = useMutation({
    mutationFn: async ({ id, notes, duration, title, annotations }: { id: string; notes: string; duration: number; title: string; annotations: Annotation[] }) => {
      const { error } = await supabase
        .from('storyboard_frames')
        .update({ notes, duration_seconds: duration, title, annotations: annotations as any })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storyboards'] });
      setEditingId(null);
      toast({ title: 'Frame updated' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateDuration = useMutation({
    mutationFn: async ({ id, duration }: { id: string; duration: number }) => {
      const { error } = await supabase
        .from('storyboard_frames')
        .update({ duration_seconds: duration })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storyboards'] }),
  });

  const startEdit = (frame: Frame) => {
    setEditingId(frame.id);
    setEditNotes(frame.notes || '');
    setEditDuration(String(frame.duration_seconds || 3));
    setEditTitle(frame.title || '');
    const annots = Array.isArray(frame.annotations) ? frame.annotations as Annotation[] : [];
    setEditAnnotations(annots.map(a => ({ ...a, id: a.id || crypto.randomUUID() })));
    setTimeout(() => notesRef.current?.focus(), 50);
  };

  const saveEdit = (id: string) => {
    const dur = Math.max(0.5, Math.min(60, parseFloat(editDuration) || 3));
    updateFrame.mutate({ id, notes: editNotes, duration: dur, title: editTitle, annotations: editAnnotations });
  };

  const addAnnotation = (layer: string = 'note') => {
    setEditAnnotations(prev => [
      ...prev,
      { id: crypto.randomUUID(), text: '', time: 0, color: ANNOTATION_COLORS[prev.length % ANNOTATION_COLORS.length], layer, character: '' },
    ]);
  };

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setEditAnnotations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const removeAnnotation = (id: string) => {
    setEditAnnotations(prev => prev.filter(a => a.id !== id));
  };

  // Drag resize handler
  const handleEdgeDrag = useCallback((frameId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingEdge(frameId);
    const startX = e.clientX;
    const frame = frames.find(f => f.id === frameId);
    const startDuration = frame?.duration_seconds || 3;
    const timelineWidth = timelineRef.current?.offsetWidth || 600;
    const pxPerSecond = timelineWidth / totalDuration;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dSeconds = dx / pxPerSecond;
      const newDur = Math.max(0.5, Math.min(30, Math.round((startDuration + dSeconds) * 2) / 2));
      const el = document.getElementById(`frame-bar-${frameId}`);
      if (el) {
        const newTotal = totalDuration - startDuration + newDur;
        el.style.width = `${Math.max((newDur / newTotal) * 100, 2)}%`;
      }
    };

    const onUp = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dSeconds = dx / pxPerSecond;
      const newDur = Math.max(0.5, Math.min(30, Math.round((startDuration + dSeconds) * 2) / 2));
      if (newDur !== startDuration) {
        updateDuration.mutate({ id: frameId, duration: newDur });
      }
      setDraggingEdge(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [frames, totalDuration, updateDuration]);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || draggingEdge) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setPlayheadPos(pct * totalDuration);
  };

  const getPlayheadFrame = () => {
    let acc = 0;
    for (const f of frames) {
      acc += f.duration_seconds || 0;
      if (playheadPos < acc) return f;
    }
    return frames[frames.length - 1];
  };

  const currentFrame = getPlayheadFrame();

  const markerInterval = totalDuration <= 10 ? 1 : totalDuration <= 30 ? 5 : 10;
  const timeMarkers: number[] = [];
  for (let t = 0; t <= totalDuration; t += markerInterval) timeMarkers.push(t);
  if (timeMarkers[timeMarkers.length - 1] < totalDuration) timeMarkers.push(totalDuration);

  if (frames.length === 0) return null;

  const playheadPct = (playheadPos / totalDuration) * 100;

  // Compute annotation markers grouped by layer
  const getAnnotationsByLayer = (layer: string) => {
    const result: { annotation: Annotation; globalTimePct: number; frameTitle: string }[] = [];
    let frameOffset = 0;
    for (const frame of frames) {
      const annots = Array.isArray(frame.annotations) ? (frame.annotations as Annotation[]) : [];
      for (const a of annots) {
        const aLayer = a.layer || 'note';
        if (aLayer === layer) {
          const globalTime = frameOffset + (a.time || 0);
          result.push({
            annotation: a,
            globalTimePct: (globalTime / totalDuration) * 100,
            frameTitle: frame.title || `Frame ${frame.sort_order + 1}`,
          });
        }
      }
      frameOffset += frame.duration_seconds || 0;
    }
    return result;
  };

  const TrackLabel = ({ trackKey, icon: Icon, label }: { trackKey: TrackKey; icon: any; label: string }) => (
    <button
      onClick={() => toggleTrack(trackKey)}
      className="w-20 flex-shrink-0 px-2 py-2 border-r border-border flex items-center gap-1 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
    >
      {isTrackOpen(trackKey) ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
      <Icon className="w-3 h-3" /> {label}
    </button>
  );

  const AnnotationTrackContent = ({ layer }: { layer: string }) => {
    const items = getAnnotationsByLayer(layer);
    return (
      <div className="relative flex items-center h-7 flex-1">
        {frames.map((frame) => {
          const widthPct = ((frame.duration_seconds || 0) / totalDuration) * 100;
          const annots = Array.isArray(frame.annotations) ? (frame.annotations as Annotation[]) : [];
          const count = annots.filter(a => (a.layer || 'note') === layer).length;
          return (
            <div key={`${layer}-bg-${frame.id}`} style={{ width: `${Math.max(widthPct, 2)}%` }} className="relative h-full">
              <div className={`mx-[1px] h-full rounded-sm ${count > 0 ? 'bg-primary/5' : 'bg-muted/20'}`}>
                {count > 0 && widthPct > 8 && (
                  <span className="text-[7px] text-primary/50 px-1 leading-7 truncate block">{count}</span>
                )}
              </div>
            </div>
          );
        })}
        {items.map((item, idx) => (
          <div
            key={`${layer}-marker-${idx}`}
            className="absolute top-1 z-10 group/marker"
            style={{ left: `${item.globalTimePct}%` }}
            title={`${item.annotation.character ? `[${item.annotation.character}] ` : ''}${item.annotation.text}`}
          >
            <div className={`w-2 h-2 rounded-full ${item.annotation.color || 'bg-primary'} ring-1 ring-card`} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/marker:block z-40">
              <div className="bg-card border border-border rounded px-2 py-1 text-[9px] text-foreground whitespace-nowrap shadow-lg max-w-[180px] truncate">
                {item.annotation.character && <span className="font-bold text-primary mr-1">{item.annotation.character}:</span>}
                {item.annotation.text || 'Empty'}
              </div>
            </div>
          </div>
        ))}
        <div className="absolute top-0 bottom-0 w-[2px] bg-primary/50 z-30 pointer-events-none" style={{ left: `${playheadPct}%` }} />
      </div>
    );
  };

  const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.5, 2];

  return (
    <div className="mt-4 space-y-1">
      {/* Transport controls */}
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <button
          onClick={() => { if (!isPlaying) setPlayheadPos(0); setIsPlaying(!isPlaying); }}
          onDoubleClick={() => onOpenPlayer?.()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary border border-border text-xs text-foreground hover:bg-secondary/80 transition-colors"
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {/* Playback speed */}
        <div className="flex items-center gap-1">
          <Gauge className="w-3 h-3 text-muted-foreground" />
          <select
            value={playbackSpeed}
            onChange={e => setPlaybackSpeed(Number(e.target.value))}
            className="bg-secondary border border-border rounded text-[10px] text-foreground px-1.5 py-0.5 outline-none"
          >
            {SPEED_OPTIONS.map(s => (
              <option key={s} value={s}>{s}×</option>
            ))}
          </select>
        </div>

        <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
          {playheadPos.toFixed(1)}s / {totalDuration.toFixed(1)}s
        </span>
        {currentFrame && (
          <span className="text-[10px] text-primary/80 font-medium">
            ▸ {currentFrame.title || `Frame ${currentFrame.sort_order + 1}`}
          </span>
        )}
      </div>

      {/* Timeline container */}
      <div className="rounded-lg border border-border bg-secondary/30 overflow-hidden">
        {/* Video track - always visible */}
        <div className="flex items-center">
          <TrackLabel trackKey="video" icon={Film} label="Video" />
          {isTrackOpen('video') ? (
            <div
              ref={timelineRef}
              className="relative flex items-center h-12 flex-1 cursor-pointer"
              onClick={handleTimelineClick}
            >
              {frames.map((frame, i) => {
                const widthPct = ((frame.duration_seconds || 0) / totalDuration) * 100;
                return (
                  <div
                    key={frame.id}
                    id={`frame-bar-${frame.id}`}
                    style={{ width: `${Math.max(widthPct, 2)}%` }}
                    className="relative h-full group"
                  >
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                      onClick={(e) => { e.stopPropagation(); startEdit(frame); }}
                      className={`origin-left h-full mx-[1px] rounded-sm flex items-center justify-center gap-1 transition-all cursor-pointer select-none ${statusBarColors[frame.status] || statusBarColors.draft} ${editingId === frame.id ? 'ring-1 ring-primary brightness-125' : 'hover:brightness-110'}`}
                    >
                      {frame.assets?.thumbnail_url && widthPct > 6 && (
                        <img src={frame.assets.thumbnail_url} className="absolute inset-0 w-full h-full object-cover rounded-sm opacity-40" alt="" />
                      )}
                      <div className="relative z-10 flex items-center gap-1 px-1">
                        <span className="text-[9px] font-mono font-bold text-foreground/90">{String(frame.sort_order + 1).padStart(2, '0')}</span>
                        {widthPct > 10 && <span className="text-[8px] font-mono text-foreground/60 truncate max-w-[60px]">{frame.title || ''}</span>}
                      </div>
                      <span className={`absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full ${statusDotColors[frame.status]}`} />
                      <span className="absolute bottom-1 right-1 text-[8px] font-mono text-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">{frame.duration_seconds}s</span>
                    </motion.div>
                    <div
                      onMouseDown={(e) => handleEdgeDrag(frame.id, e)}
                      className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-[3px] h-6 rounded-full bg-primary/70" />
                    </div>
                  </div>
                );
              })}
              <motion.div
                className="absolute top-0 bottom-0 w-[2px] bg-primary z-30 pointer-events-none"
                style={{ left: `${playheadPct}%` }}
                animate={{ left: `${playheadPct}%` }}
                transition={{ duration: 0.05, ease: 'linear' }}
              >
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 h-3 bg-muted/10" />
          )}
        </div>

        {/* Dialogue track */}
        <AnimatePresence>
          {isTrackOpen('dialogue') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
              <div className="flex items-center">
                <TrackLabel trackKey="dialogue" icon={Users} label="Dialog" />
                <AnnotationTrackContent layer="dialogue" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsedTracks.has('dialogue') && (
          <div className="flex items-center border-t border-border">
            <TrackLabel trackKey="dialogue" icon={Users} label="Dialog" />
            <div className="flex-1 h-3 bg-muted/10" />
          </div>
        )}

        {/* Notes track */}
        <AnimatePresence>
          {isTrackOpen('notes') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
              <div className="flex items-center">
                <TrackLabel trackKey="notes" icon={Tag} label="Notes" />
                <AnnotationTrackContent layer="note" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsedTracks.has('notes') && (
          <div className="flex items-center border-t border-border">
            <TrackLabel trackKey="notes" icon={Tag} label="Notes" />
            <div className="flex-1 h-3 bg-muted/10" />
          </div>
        )}

        {/* Score track */}
        <AnimatePresence>
          {isTrackOpen('score') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
              <div className="flex items-center">
                <TrackLabel trackKey="score" icon={Music} label="Score" />
                <div className="relative flex items-center h-7 flex-1">
                  {frames.map((frame) => {
                    const widthPct = ((frame.duration_seconds || 0) / totalDuration) * 100;
                    return (
                      <div key={`score-${frame.id}`} style={{ width: `${Math.max(widthPct, 2)}%` }} className="relative h-full">
                        <div className="mx-[1px] h-full rounded-sm bg-accent/10 flex items-center justify-center">
                          {widthPct > 8 && <span className="text-[7px] text-accent/40">♪</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div className="absolute top-0 bottom-0 w-[2px] bg-primary/50 z-30 pointer-events-none" style={{ left: `${playheadPct}%` }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsedTracks.has('score') && (
          <div className="flex items-center border-t border-border">
            <TrackLabel trackKey="score" icon={Music} label="Score" />
            <div className="flex-1 h-3 bg-muted/10" />
          </div>
        )}

        {/* SFX track */}
        <AnimatePresence>
          {isTrackOpen('sfx') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
              <div className="flex items-center">
                <TrackLabel trackKey="sfx" icon={Waves} label="SFX" />
                <div className="relative flex items-center h-7 flex-1">
                  {frames.map((frame) => {
                    const widthPct = ((frame.duration_seconds || 0) / totalDuration) * 100;
                    return (
                      <div key={`sfx-${frame.id}`} style={{ width: `${Math.max(widthPct, 2)}%` }} className="relative h-full">
                        <div className="mx-[1px] h-full rounded-sm bg-warning/10 flex items-center justify-center">
                          {widthPct > 8 && <span className="text-[7px] text-warning/40">⚡</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div className="absolute top-0 bottom-0 w-[2px] bg-primary/50 z-30 pointer-events-none" style={{ left: `${playheadPct}%` }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsedTracks.has('sfx') && (
          <div className="flex items-center border-t border-border">
            <TrackLabel trackKey="sfx" icon={Waves} label="SFX" />
            <div className="flex-1 h-3 bg-muted/10" />
          </div>
        )}

        {/* Audio/VO track */}
        <AnimatePresence>
          {isTrackOpen('audio') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
              <div className="flex items-center">
                <TrackLabel trackKey="audio" icon={Mic} label="VO" />
                <div className="relative flex items-center h-7 flex-1">
                  {frames.map((frame) => {
                    const widthPct = ((frame.duration_seconds || 0) / totalDuration) * 100;
                    const hasAudio = !!frame.audio_url;
                    return (
                      <div key={`audio-${frame.id}`} style={{ width: `${Math.max(widthPct, 2)}%` }} className="relative h-full">
                        <div className={`mx-[1px] h-full rounded-sm flex items-center justify-center ${hasAudio ? 'bg-info/20' : 'bg-muted/30'}`}>
                          {hasAudio ? <AudioWaveform width={widthPct} /> : widthPct > 8 && <span className="text-[8px] text-muted-foreground/40">—</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div className="absolute top-0 bottom-0 w-[2px] bg-primary/50 z-30 pointer-events-none" style={{ left: `${playheadPct}%` }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsedTracks.has('audio') && (
          <div className="flex items-center border-t border-border">
            <TrackLabel trackKey="audio" icon={Mic} label="VO" />
            <div className="flex-1 h-3 bg-muted/10" />
          </div>
        )}

        {/* Time ruler */}
        <div className="flex items-center border-t border-border/50">
          <div className="w-20 flex-shrink-0" />
          <div className="flex-1 relative h-4">
            {timeMarkers.map((t) => (
              <span key={t} className="absolute text-[8px] font-mono text-muted-foreground/60 -translate-x-1/2" style={{ left: `${(t / totalDuration) * 100}%`, top: '2px' }}>{t}s</span>
            ))}
          </div>
        </div>
      </div>

      {/* Inline editor */}
      <AnimatePresence>
        {editingId && (() => {
          const frame = frames.find(f => f.id === editingId);
          if (!frame) return null;
          const dialogueAnnotations = editAnnotations.filter(a => a.layer === 'dialogue');
          const noteAnnotations = editAnnotations.filter(a => !a.layer || a.layer === 'note');
          return (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-lg border border-border bg-card p-3 space-y-3 mt-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span className="font-mono text-muted-foreground">#{frame.sort_order + 1}</span>
                  {frame.assets?.name && <span className="text-[10px] text-primary/70 font-normal">· {frame.assets.name}</span>}
                </h4>
                <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Title</label>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Frame title..."
                  className="w-full px-2 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3">
                {/* Duration slider */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="0.5" max="30" step="0.5" value={editDuration} onChange={e => setEditDuration(e.target.value)} className="w-28 accent-primary h-1.5" />
                    <span className="text-xs font-mono text-foreground w-10 text-right">{parseFloat(editDuration).toFixed(1)}s</span>
                  </div>
                </div>
                {/* Notes */}
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-muted-foreground flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Notes</label>
                  <textarea
                    ref={notesRef}
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    rows={2}
                    placeholder="Frame notes..."
                    className="w-full px-2 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              {/* Dialogue annotations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Dialogue</label>
                  <button onClick={() => addAnnotation('dialogue')} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-primary hover:bg-primary/10 transition-colors">
                    <Plus className="w-2.5 h-2.5" /> Add Line
                  </button>
                </div>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {dialogueAnnotations.map((a) => (
                    <div key={a.id} className="flex items-center gap-2">
                      <input
                        value={a.character || ''}
                        onChange={e => updateAnnotation(a.id, { character: e.target.value })}
                        placeholder="Character"
                        className="w-24 px-2 py-0.5 rounded bg-secondary border border-border text-[10px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input type="number" min="0" max={parseFloat(editDuration) || 30} step="0.5" value={a.time} onChange={e => updateAnnotation(a.id, { time: parseFloat(e.target.value) || 0 })} className="w-12 px-1 py-0.5 rounded bg-secondary border border-border text-[10px] text-foreground text-center outline-none focus:ring-1 focus:ring-primary" />
                      <input value={a.text} onChange={e => updateAnnotation(a.id, { text: e.target.value })} placeholder="Dialogue line..." className="flex-1 px-2 py-0.5 rounded bg-secondary border border-border text-[10px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                      <button onClick={() => removeAnnotation(a.id)} className="text-destructive/50 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note annotations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Tag className="w-3 h-3" /> Clip Notes</label>
                  <button onClick={() => addAnnotation('note')} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-primary hover:bg-primary/10 transition-colors">
                    <Plus className="w-2.5 h-2.5" /> Add
                  </button>
                </div>
                {noteAnnotations.length === 0 && <p className="text-[10px] text-muted-foreground/50 italic">No notes</p>}
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {noteAnnotations.map((a) => (
                    <div key={a.id} className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {ANNOTATION_COLORS.map(c => (
                          <button key={c} onClick={() => updateAnnotation(a.id, { color: c })} className={`w-3 h-3 rounded-full ${c} ${a.color === c ? 'ring-1 ring-offset-1 ring-offset-card ring-foreground/30' : 'opacity-40 hover:opacity-70'} transition-all`} />
                        ))}
                      </div>
                      <input type="number" min="0" max={parseFloat(editDuration) || 30} step="0.5" value={a.time} onChange={e => updateAnnotation(a.id, { time: parseFloat(e.target.value) || 0 })} className="w-12 px-1 py-0.5 rounded bg-secondary border border-border text-[10px] text-foreground text-center outline-none focus:ring-1 focus:ring-primary" />
                      <input value={a.text} onChange={e => updateAnnotation(a.id, { text: e.target.value })} placeholder="Note text..." className="flex-1 px-2 py-0.5 rounded bg-secondary border border-border text-[10px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                      <button onClick={() => removeAnnotation(a.id)} className="text-destructive/50 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingId(null)} className="px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button
                  onClick={() => saveEdit(frame.id)}
                  disabled={updateFrame.isPending}
                  className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Save
                </button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

/** Mini waveform visualization */
function AudioWaveform({ width }: { width: number }) {
  const bars = Math.max(3, Math.floor(width / 2));
  return (
    <div className="flex items-center gap-[1px] h-5 px-1">
      {Array.from({ length: bars }).map((_, i) => {
        const h = 4 + Math.sin(i * 1.3) * 3 + Math.random() * 2;
        return <div key={i} className="w-[2px] rounded-full bg-info/60" style={{ height: `${Math.max(2, h)}px` }} />;
      })}
    </div>
  );
}
