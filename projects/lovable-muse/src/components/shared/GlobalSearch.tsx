import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, FolderOpen, Image, Film, CheckSquare, BookOpen, X, ArrowRight, Loader2, Sparkles, Tag, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SearchResult {
  id: string;
  type: 'project' | 'asset' | 'storyboard' | 'task' | 'doc' | 'link';
  title: string;
  subtitle?: string;
  meta?: string;
  tags?: string[];
  matchReason?: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  project: { icon: FolderOpen, color: 'text-primary', label: 'Project' },
  asset: { icon: Image, color: 'text-phase-build', label: 'Asset' },
  storyboard: { icon: Film, color: 'text-phase-start', label: 'Storyboard' },
  task: { icon: CheckSquare, color: 'text-phase-grow', label: 'Task' },
  doc: { icon: BookOpen, color: 'text-muted-foreground', label: 'Doc' },
  link: { icon: Link2, color: 'text-primary', label: 'Link' },
};

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  onSelectAsset?: (id: string) => void;
  onSelectProject?: (id: string) => void;
}

export default function GlobalSearch({ open, onClose, onSelectAsset, onSelectProject }: GlobalSearchProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedTerms, setExpandedTerms] = useState<string[]>([]);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const aiCacheRef = useRef<Map<string, { synonyms: string[]; tags: string[] }>>(new Map());

  // Direct DB search
  const directSearch = useCallback(async (q: string, extraTerms: string[] = [], extraTags: string[] = []) => {
    if (!q.trim() || !user) { setResults([]); return; }
    setLoading(true);
    const term = `%${q.toLowerCase()}%`;

    // Build OR conditions for all terms
    const allTerms = [q, ...extraTerms];
    const allTags = extraTags;

    const [projects, assets, storyboards, tasks, docs, links] = await Promise.all([
      supabase.from('projects').select('id, name, phase, description').ilike('name', term).limit(5),
      // Assets: search by name, ai_description, tags, ai_tags
      (async () => {
        // Search by name
        const byName = supabase.from('assets').select('id, name, file_type, ai_description, tags, ai_tags').ilike('name', term).limit(5);
        // Search by ai_description
        const byDesc = supabase.from('assets').select('id, name, file_type, ai_description, tags, ai_tags').ilike('ai_description', term).limit(5);
        // Search by tags using overlaps if we have AI tags
        const tagResults = allTags.length > 0
          ? supabase.from('assets').select('id, name, file_type, ai_description, tags, ai_tags').overlaps('ai_tags', allTags).limit(5)
          : Promise.resolve({ data: [] });
        // Extra synonym name searches
        const synonymResults = await Promise.all(
          extraTerms.slice(0, 3).map(syn =>
            supabase.from('assets').select('id, name, file_type, ai_description, tags, ai_tags').ilike('name', `%${syn.toLowerCase()}%`).limit(3)
          )
        );
        const [r1, r2, r3] = await Promise.all([byName, byDesc, tagResults]);
        // Merge and deduplicate
        const allAssets = [...(r1.data || []), ...(r2.data || []), ...(r3.data || [])];
        for (const sr of synonymResults) allAssets.push(...(sr.data || []));
        const seen = new Set<string>();
        return allAssets.filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; }).slice(0, 8);
      })(),
      supabase.from('storyboards').select('id, name, projects(name)').ilike('name', term).limit(5),
      supabase.from('tasks').select('id, title, status, projects(name)').ilike('title', term).limit(5),
      // Docs: search title and content
      (async () => {
        const [byTitle, byContent] = await Promise.all([
          supabase.from('docs').select('id, title, category, slug, tags').ilike('title', term).limit(5),
          supabase.from('docs').select('id, title, category, slug, tags').ilike('content', term).limit(3),
        ]);
        // Tag-based doc search
        const tagDocs = allTags.length > 0
          ? await supabase.from('docs').select('id, title, category, slug, tags').overlaps('tags', allTags).limit(5)
          : { data: [] };
        // Synonym searches
        const synDocs = await Promise.all(
          extraTerms.slice(0, 3).map(syn =>
            supabase.from('docs').select('id, title, category, slug, tags').ilike('title', `%${syn.toLowerCase()}%`).limit(3)
          )
        );
        const all = [...(byTitle.data || []), ...(byContent.data || []), ...(tagDocs.data || [])];
        for (const sr of synDocs) all.push(...(sr.data || []));
        const seen = new Set<string>();
        return all.filter(d => { if (seen.has(d.id)) return false; seen.add(d.id); return true; }).slice(0, 8);
      })(),
      // Links search
      supabase.from('links').select('id, title, url, tool_name, tags, category').or(`title.ilike.${term},url.ilike.${term}`).limit(5),
    ]);

    // Determine match reason for assets
    const assetResults = (assets as any[]).map(a => {
      let matchReason: string | undefined;
      const nameLower = a.name?.toLowerCase() || '';
      const descLower = a.ai_description?.toLowerCase() || '';
      if (nameLower.includes(q.toLowerCase())) {
        matchReason = undefined; // direct match
      } else if (descLower.includes(q.toLowerCase())) {
        matchReason = 'AI description';
      } else if (allTags.some(t => a.ai_tags?.includes(t) || a.tags?.includes(t))) {
        matchReason = `tag: ${allTags.find(t => a.ai_tags?.includes(t) || a.tags?.includes(t))}`;
      } else {
        const matchedSyn = extraTerms.find(syn => nameLower.includes(syn.toLowerCase()));
        if (matchedSyn) matchReason = `synonym: ${matchedSyn}`;
      }
      return {
        id: a.id, type: 'asset' as const, title: a.name,
        subtitle: a.ai_description || undefined, meta: a.file_type,
        tags: [...(a.tags || []), ...(a.ai_tags || [])].slice(0, 4),
        matchReason,
      };
    });

    const docResults = (docs as any[]).map(d => {
      let matchReason: string | undefined;
      if (!d.title?.toLowerCase().includes(q.toLowerCase())) {
        if (allTags.some(t => d.tags?.includes(t))) {
          matchReason = `tag: ${allTags.find(t => d.tags?.includes(t))}`;
        } else {
          const matchedSyn = extraTerms.find(syn => d.title?.toLowerCase().includes(syn.toLowerCase()));
          if (matchedSyn) matchReason = `synonym: ${matchedSyn}`;
          else matchReason = 'content match';
        }
      }
      return {
        id: d.id, type: 'doc' as const, title: d.title,
        subtitle: d.category, meta: d.slug,
        tags: (d.tags || []).slice(0, 4),
        matchReason,
      };
    });

    const merged: SearchResult[] = [
      ...(projects.data || []).map(p => ({
        id: p.id, type: 'project' as const, title: p.name,
        subtitle: p.description || undefined, meta: p.phase.toUpperCase(),
      })),
      ...assetResults,
      ...(storyboards.data || []).map(s => ({
        id: s.id, type: 'storyboard' as const, title: s.name,
        subtitle: (s as any).projects?.name || undefined,
      })),
      ...(tasks.data || []).map(t => ({
        id: t.id, type: 'task' as const, title: t.title,
        subtitle: (t as any).projects?.name || undefined, meta: t.status,
      })),
      ...docResults,
      ...((links as any).data || []).map((l: any) => ({
        id: l.id, type: 'link' as const, title: l.title,
        subtitle: l.tool_name || l.url, meta: l.category,
        tags: (l.tags || []).slice(0, 4),
      })),
    ];

    setResults(merged);
    setSelectedIndex(0);
    setLoading(false);
  }, [user]);

  // AI expansion (debounced, cached)
  const expandWithAI = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 3) { setExpandedTerms([]); setAiTags([]); return; }
    const cached = aiCacheRef.current.get(q.toLowerCase());
    if (cached) {
      setExpandedTerms(cached.synonyms);
      setAiTags(cached.tags);
      // Re-search with expanded terms
      directSearch(q, cached.synonyms, cached.tags);
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-expand', {
        body: { query: q },
      });
      if (error) throw error;
      const synonyms = data?.synonyms || [];
      const tags = data?.tags || [];
      aiCacheRef.current.set(q.toLowerCase(), { synonyms, tags });
      setExpandedTerms(synonyms);
      setAiTags(tags);
      // Re-search with expanded terms
      directSearch(q, synonyms, tags);
    } catch (e) {
      console.error('AI expand failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [directSearch]);

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); setExpandedTerms([]); setAiTags([]); return; }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Immediate direct search
  useEffect(() => {
    const timer = setTimeout(() => directSearch(query), 150);
    return () => clearTimeout(timer);
  }, [query, directSearch]);

  // Delayed AI expansion
  useEffect(() => {
    const timer = setTimeout(() => expandWithAI(query), 600);
    return () => clearTimeout(timer);
  }, [query, expandWithAI]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIndex]) { handleSelect(results[selectedIndex]); }
  };

  const handleSelect = (result: SearchResult) => {
    onClose();
    switch (result.type) {
      case 'project': onSelectProject?.(result.id); navigate('/projects'); break;
      case 'asset': onSelectAsset?.(result.id); navigate('/assets'); break;
      case 'storyboard': navigate('/storyboards'); break;
      case 'task': navigate('/tasks'); break;
      case 'doc': navigate('/docs'); break;
      case 'link': navigate('/links'); break;
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); if (open) onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  let flatIndex = 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search assets, notes, prompts, projects..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {(loading || aiLoading) && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            {aiLoading && <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />}
            <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border font-mono">ESC</kbd>
          </div>

          {/* AI expansion chips */}
          {(expandedTerms.length > 0 || aiTags.length > 0) && (
            <div className="px-4 py-2 border-b border-border/50 flex items-center gap-1.5 flex-wrap">
              <Sparkles className="w-3 h-3 text-primary shrink-0" />
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold shrink-0">AI expanded:</span>
              {expandedTerms.map(t => (
                <span key={`syn-${t}`} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
              ))}
              {aiTags.map(t => (
                <span key={`tag-${t}`} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-0.5">
                  <Tag className="w-2.5 h-2.5" />{t}
                </span>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {query && results.length === 0 && !loading && !aiLoading && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No results for "{query}"
              </div>
            )}

            {!query && (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                <p>AI-powered search across assets, notes, prompts & more</p>
                <p className="text-[10px] text-muted-foreground/60">
                  Finds matches via names, AI descriptions, tags & synonyms
                </p>
                <p className="text-[10px]">
                  <kbd className="px-1 py-0.5 rounded bg-secondary border border-border font-mono">⌘K</kbd> to open anytime
                </p>
              </div>
            )}

            {Object.entries(grouped).map(([type, items]) => {
              const cfg = typeConfig[type];
              return (
                <div key={type}>
                  <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/30">
                    {cfg.label}s
                  </div>
                  {items.map(result => {
                    const currentFlatIndex = flatIndex++;
                    const isSelected = currentFlatIndex === selectedIndex;
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(currentFlatIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-secondary/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-foreground truncate">{result.title}</p>
                            {result.matchReason && (
                              <span className="text-[9px] text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                {result.matchReason}
                              </span>
                            )}
                          </div>
                          {result.subtitle && (
                            <p className="text-[11px] text-muted-foreground truncate">{result.subtitle}</p>
                          )}
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {result.tags.map(tag => (
                                <span key={tag} className="text-[9px] text-muted-foreground/70 bg-secondary px-1 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {result.meta && (
                          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full flex-shrink-0">
                            {result.meta}
                          </span>
                        )}
                        {isSelected && <ArrowRight className="w-3 h-3 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
              <span><kbd className="px-1 py-0.5 rounded bg-secondary border border-border font-mono">↑↓</kbd> navigate</span>
              <span><kbd className="px-1 py-0.5 rounded bg-secondary border border-border font-mono">↵</kbd> open</span>
              <span className="ml-auto">{results.length} results</span>
              {expandedTerms.length > 0 && <span className="flex items-center gap-1"><Sparkles className="w-2.5 h-2.5 text-primary" /> AI</span>}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
