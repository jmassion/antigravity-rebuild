import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PRESET_TAGS = [
  'commercial', 'film', 'episode', 'series', 'game-cinematic', 'game-trailer',
  'music-video', 'poster-art', 'key-art', 'marketing', 'social-media',
  'teaser', 'trailer', 'behind-the-scenes', 'concept-art', 'storyboard', 'animatic',
];

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ value, onChange, placeholder = 'Add tag...' }: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: dbTags = [] } = useQuery({
    queryKey: ['all-tags-pool'],
    queryFn: async () => {
      const [a, s, p, pl, d, l] = await Promise.all([
        supabase.from('assets').select('tags'),
        supabase.from('storyboards').select('tags'),
        supabase.from('projects').select('tags'),
        supabase.from('plans').select('tags'),
        supabase.from('docs').select('tags'),
        supabase.from('links').select('tags'),
      ]);
      const allTags = new Set<string>();
      for (const result of [a.data, s.data, p.data, pl.data, d.data, l.data]) {
        if (result) {
          for (const row of result) {
            if (row.tags) {
              for (const t of row.tags) allTags.add(t);
            }
          }
        }
      }
      return Array.from(allTags).sort();
    },
    staleTime: 60_000,
  });

  const allSuggestions = Array.from(new Set([...PRESET_TAGS, ...dbTags])).sort();
  const filtered = allSuggestions.filter(
    t => t.toLowerCase().includes(input.toLowerCase()) && !value.includes(t)
  );

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (clean && !value.includes(clean)) {
      onChange([...value, clean]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex flex-wrap items-center gap-1.5 min-h-[38px] px-2.5 py-1.5 rounded-md bg-secondary border border-border focus-within:ring-1 focus-within:ring-primary cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
            {tag}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 min-w-[80px]"
        />
      </div>

      {showSuggestions && input && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-[160px] overflow-y-auto rounded-md border border-border bg-card shadow-lg py-1">
          {filtered.slice(0, 12).map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => { addTag(tag); setShowSuggestions(false); }}
              className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
