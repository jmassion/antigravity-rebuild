import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const CONTENT_TYPES = [
  { value: 'general', label: 'General', icon: '📁' },
  { value: 'film', label: 'Film', icon: '🎬' },
  { value: 'episode', label: 'Episode', icon: '📺' },
  { value: 'series', label: 'Series / Show', icon: '🎞️' },
  { value: 'commercial', label: 'Commercial', icon: '📣' },
  { value: 'game-cinematic', label: 'Game Cinematic', icon: '🎮' },
  { value: 'music-video', label: 'Music Video', icon: '🎵' },
  { value: 'short-film', label: 'Short Film', icon: '🎥' },
  { value: 'marketing', label: 'Marketing Campaign', icon: '📢' },
  { value: 'poster-art', label: 'Poster / Key Art', icon: '🖼️' },
  { value: 'social-media', label: 'Social Media', icon: '📱' },
  { value: 'behind-the-scenes', label: 'Behind the Scenes', icon: '🎭' },
] as const;

interface ContentTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ContentTypeSelect({ value, onChange }: ContentTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = CONTENT_TYPES.find(t => t.value === value) || CONTENT_TYPES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground hover:border-primary/30 transition-colors"
      >
        <span>{selected.icon}</span>
        <span className="flex-1 text-left">{selected.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-[240px] overflow-y-auto rounded-md border border-border bg-card shadow-lg py-1">
          {CONTENT_TYPES.map(ct => (
            <button
              key={ct.value}
              type="button"
              onClick={() => { onChange(ct.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors ${
                ct.value === value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-secondary'
              }`}
            >
              <span>{ct.icon}</span>
              <span>{ct.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
