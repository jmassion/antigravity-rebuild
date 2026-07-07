import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Maximize, Minimize, MessageSquare, StickyNote, Gauge, Clock
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Annotation {
  id: string;
  text: string;
  time: number;
  color: string;
  layer?: string;
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
  assets?: { thumbnail_url: string | null; name: string | null; file_url?: string; file_type?: string } | null;
}

interface StoryboardPlayerProps {
  frames: Frame[];
  storyboardName: string;
  initialFrameIndex?: number;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  review: 'bg-phase-build/20 text-phase-build',
  approved: 'bg-phase-grow/20 text-phase-grow',
  revision: 'bg-destructive/20 text-destructive',
};

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export default function StoryboardPlayer({ frames, storyboardName, initialFrameIndex = 0, onClose }: StoryboardPlayerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(initialFrameIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [looping, setLooping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [editingDuration, setEditingDuration] = useState<{ index: number; value: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentFrame = frames[currentIndex];
  const totalDuration = frames.reduce((s, f) => s + (f.duration_seconds || 3), 0);
  const frameDuration = currentFrame?.duration_seconds || 3;

  // Elapsed timer for current frame
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isPlaying) {
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 0.05);
      }, 50);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentIndex]);

  // Auto-advance
  useEffect(() => {
    if (!isPlaying) return;
    if (elapsed >= frameDuration / playbackSpeed) {
      if (currentIndex < frames.length - 1) {
        setCurrentIndex(i => i + 1);
        setElapsed(0);
      } else if (looping) {
        setCurrentIndex(0);
        setElapsed(0);
      } else {
        setIsPlaying(false);
      }
    }
  }, [elapsed, isPlaying, frameDuration, playbackSpeed, currentIndex, frames.length, looping]);

  // Video sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.playbackRate = playbackSpeed;
      video.muted = muted;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, playbackSpeed, muted, currentIndex]);

  // Audio sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentFrame?.audio_url) {
      audio.src = currentFrame.audio_url;
      audio.muted = muted;
      if (isPlaying) audio.play().catch(() => {});
      else audio.pause();
    } else {
      audio.pause();
      audio.src = '';
    }
  }, [currentIndex, isPlaying, muted, currentFrame?.audio_url]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingDuration) return;
      switch (e.key) {
        case ' ': e.preventDefault(); setIsPlaying(p => !p); break;
        case 'ArrowRight': e.preventDefault(); goNext(); break;
        case 'ArrowLeft': e.preventDefault(); goPrev(); break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 'm': case 'M': setMuted(m => !m); break;
        case 'Escape': onClose(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editingDuration]);

  const goNext = () => { if (currentIndex < frames.length - 1) { setCurrentIndex(i => i + 1); setElapsed(0); } };
  const goPrev = () => { if (currentIndex > 0) { setCurrentIndex(i => i - 1); setElapsed(0); } };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Compute global scrub position
  const globalElapsed = frames.slice(0, currentIndex).reduce((s, f) => s + (f.duration_seconds || 3), 0) + Math.min(elapsed * playbackSpeed, frameDuration);
  const globalPct = totalDuration > 0 ? (globalElapsed / totalDuration) * 100 : 0;

  const scrubTo = (pct: number) => {
    const targetTime = (pct / 100) * totalDuration;
    let acc = 0;
    for (let i = 0; i < frames.length; i++) {
      const dur = frames[i].duration_seconds || 3;
      if (acc + dur > targetTime) {
        setCurrentIndex(i);
        setElapsed((targetTime - acc) / playbackSpeed);
        return;
      }
      acc += dur;
    }
    setCurrentIndex(frames.length - 1);
    setElapsed(0);
  };

  // Dialogue subtitles for current frame
  const dialogues = (Array.isArray(currentFrame?.annotations) ? currentFrame.annotations as Annotation[] : [])
    .filter(a => (a.layer || 'note') === 'dialogue');

  // Duration edit mutation
  const updateDuration = useMutation({
    mutationFn: async ({ id, duration }: { id: string; duration: number }) => {
      const { error } = await supabase.from('storyboard_frames').update({ duration_seconds: duration }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['storyboards'] }); toast({ title: 'Duration updated' }); },
  });

  const commitDurationEdit = () => {
    if (!editingDuration) return;
    const dur = Math.max(0.5, Math.min(60, parseFloat(editingDuration.value) || 3));
    updateDuration.mutate({ id: frames[editingDuration.index].id, duration: dur });
    setEditingDuration(null);
  };

  const filmstripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (filmstripRef.current) {
      const thumb = filmstripRef.current.children[currentIndex] as HTMLElement;
      if (thumb) thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentIndex]);

  const assetFileType = currentFrame?.assets?.file_type || '';
  const assetFileUrl = currentFrame?.assets?.file_url || '';
  const isVideo = assetFileType.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(assetFileUrl);
  const imageUrl = currentFrame?.assets?.thumbnail_url || currentFrame?.assets?.file_url;
  const videoUrl = isVideo ? assetFileUrl : null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black flex flex-col">
      <audio ref={audioRef} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-white/90">{storyboardName}</h2>
          <span className="text-xs text-white/50 font-mono">
            Shot {currentIndex + 1}/{frames.length}
          </span>
          {currentFrame && (
            <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full ${statusColors[currentFrame.status] || statusColors.draft}`}>
              {currentFrame.status}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white p-1"><X className="w-5 h-5" /></button>
      </div>

      {/* Frame display */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {videoUrl ? (
              <video
                ref={videoRef}
                key={videoUrl}
                src={videoUrl}
                autoPlay={isPlaying}
                muted={muted}
                loop={false}
                playsInline
                controls={false}
                className="max-w-full max-h-full object-contain"
                onEnded={goNext}
              />
            ) : imageUrl ? (
              <img src={imageUrl} alt={currentFrame?.title || ''} className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-white/30 text-sm">No image assigned</div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Frame info overlay */}
        <div className="absolute top-16 left-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white/80">
            <p className="text-xs font-medium">{currentFrame?.title || `Frame ${currentIndex + 1}`}</p>
            <p className="text-[10px] text-white/50 font-mono mt-0.5">
              {Math.max(0, frameDuration - elapsed * playbackSpeed).toFixed(1)}s remaining
            </p>
          </div>
        </div>

        {/* Notes overlay */}
        {showNotes && currentFrame?.notes && (
          <div className="absolute top-16 right-4 z-10 max-w-xs">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white/80 text-xs">
              <p className="font-semibold text-[10px] text-white/50 uppercase mb-1">Director Notes</p>
              {currentFrame.notes}
            </div>
          </div>
        )}

        {/* Dialogue subtitles */}
        {showSubtitles && dialogues.length > 0 && (
          <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-10 max-w-lg text-center">
            {dialogues.map((d, i) => (
              <div key={i} className="bg-black/70 backdrop-blur-sm rounded px-4 py-2 mb-1 inline-block">
                {d.character && <span className="text-primary text-xs font-bold mr-1.5">{d.character}:</span>}
                <span className="text-white text-sm">{d.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transport bar */}
      <div className="bg-black/90 border-t border-white/10 px-4 py-2 space-y-2">
        {/* Scrub bar */}
        <Slider
          value={[globalPct]}
          max={100}
          step={0.1}
          onValueChange={([v]) => scrubTo(v)}
          className="w-full"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className="text-white/60 hover:text-white p-1"><SkipBack className="w-4 h-4" /></button>
            <button onClick={() => setIsPlaying(p => !p)} className="text-white bg-white/10 hover:bg-white/20 rounded-full p-2">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={goNext} className="text-white/60 hover:text-white p-1"><SkipForward className="w-4 h-4" /></button>

            <span className="text-[10px] text-white/40 font-mono ml-2">
              {globalElapsed.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed */}
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-white/40" />
              <select
                value={playbackSpeed}
                onChange={e => setPlaybackSpeed(Number(e.target.value))}
                className="bg-white/10 border-none rounded text-[10px] text-white/80 px-1.5 py-0.5 outline-none"
              >
                {SPEED_OPTIONS.map(s => <option key={s} value={s}>{s}×</option>)}
              </select>
            </div>

            <button onClick={() => setLooping(l => !l)} className={`p-1 rounded ${looping ? 'text-primary' : 'text-white/40 hover:text-white/70'}`} title="Loop">
              <Repeat className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setMuted(m => !m)} className="text-white/40 hover:text-white/70 p-1" title="Mute (M)">
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setShowSubtitles(s => !s)} className={`p-1 rounded ${showSubtitles ? 'text-primary' : 'text-white/40 hover:text-white/70'}`} title="Subtitles">
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShowNotes(n => !n)} className={`p-1 rounded ${showNotes ? 'text-primary' : 'text-white/40 hover:text-white/70'}`} title="Notes">
              <StickyNote className="w-3.5 h-3.5" />
            </button>
            <button onClick={toggleFullscreen} className="text-white/40 hover:text-white/70 p-1" title="Fullscreen (F)">
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Filmstrip */}
        <div ref={filmstripRef} className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {frames.map((frame, i) => (
            <Popover key={frame.id} open={editingDuration?.index === i} onOpenChange={(open) => { if (!open) setEditingDuration(null); }}>
              <PopoverTrigger asChild>
                <button
                  onClick={() => { setCurrentIndex(i); setElapsed(0); }}
                  className={`flex-shrink-0 w-16 rounded overflow-hidden border-2 transition-all ${i === currentIndex ? 'border-primary' : 'border-transparent hover:border-white/20'}`}
                >
                  <div className="aspect-video bg-white/5 relative">
                    {frame.assets?.thumbnail_url ? (
                      <img src={frame.assets.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-[8px]">{i + 1}</div>
                    )}
                  </div>
                  <div
                    className="text-[8px] text-white/50 text-center py-0.5 font-mono cursor-pointer hover:text-primary"
                    onClick={(e) => { e.stopPropagation(); setEditingDuration({ index: i, value: String(frame.duration_seconds || 3) }); }}
                  >
                    <Clock className="w-2 h-2 inline mr-0.5" />{frame.duration_seconds || 3}s
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-2" side="top">
                <label className="text-[10px] text-muted-foreground">Duration (s)</label>
                <input
                  type="number"
                  min={0.5}
                  max={60}
                  step={0.5}
                  value={editingDuration?.value || ''}
                  onChange={e => setEditingDuration(prev => prev ? { ...prev, value: e.target.value } : null)}
                  onKeyDown={e => { if (e.key === 'Enter') commitDurationEdit(); }}
                  className="w-full mt-1 px-2 py-1 rounded bg-secondary border border-border text-xs text-foreground outline-none"
                  autoFocus
                />
                <button onClick={commitDurationEdit} className="mt-1 w-full text-[10px] bg-primary text-primary-foreground rounded py-1 hover:opacity-90">Save</button>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </div>
    </div>
  );
}
