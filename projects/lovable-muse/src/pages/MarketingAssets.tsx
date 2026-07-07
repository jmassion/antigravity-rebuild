import { useState, useCallback } from 'react';
import { Search, Loader2, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import AppLayout from '@/components/layout/AppLayout';
import ProjectSelect from '@/components/shared/ProjectSelect';
import AssetDetailPanel from '@/components/dashboard/AssetDetailPanel';
import VideoThumbnail from '@/components/dashboard/VideoThumbnail';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { uploadManager } from '@/lib/upload-manager';

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin', 'web', 'print'];
const FORMATS = ['story', 'reel', 'post', 'banner', 'thumbnail', 'poster'];
const MARKETING_TAGS = ['marketing', 'social', 'banner', 'promo', 'ad', 'campaign', ...PLATFORMS.map(p => `platform:${p}`), ...FORMATS.map(f => `format:${f}`)];

type MarketingAsset = {
  id: string;
  name: string;
  file_type: string;
  file_url: string;
  thumbnail_url: string | null;
  tags: string[] | null;
  ai_tags: string[] | null;
  ai_description: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
};

function getPlatformTags(tags: string[]): string[] {
  return tags.filter(t => t.startsWith('platform:')).map(t => t.replace('platform:', ''));
}
function getFormatTag(tags: string[]): string | null {
  const f = tags.find(t => t.startsWith('format:'));
  return f ? f.replace('format:', '') : null;
}

export default function MarketingAssets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MarketingAsset | null>(null);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['marketing-assets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .overlaps('tags', MARKETING_TAGS)
        .in('file_type', ['image', 'video'])
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as MarketingAsset[];
    },
    enabled: !!user,
  });

  const onDrop = useCallback(async (files: File[]) => {
    if (!user) return;
    uploadManager.addFiles(files, undefined, '/', undefined, ['marketing']);
    toast({ title: `${files.length} file(s) uploading with "marketing" tag` });
  }, [user, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    noClick: true,
  });

  const filtered = assets.filter(a => {
    const allTags = [...(a.tags || []), ...(a.ai_tags || [])];
    if (platformFilter && !allTags.includes(`platform:${platformFilter}`)) return false;
    if (formatFilter && !allTags.includes(`format:${formatFilter}`)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.name.toLowerCase().includes(q) && !(a.ai_description || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]" {...getRootProps()}>
        <input {...getInputProps()} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-xl">📸</span> Marketing Assets
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Social media graphics, banners, thumbnails, and promotional materials</p>
          </div>
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Upload
            <input type="file" multiple accept="image/*,video/*" className="hidden"
              onChange={e => { if (e.target.files) onDrop(Array.from(e.target.files)); e.target.value = ''; }} />
          </label>
        </div>

        {/* Platform chips */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Platform</span>
          <button onClick={() => setPlatformFilter('')}
            className={`px-2 py-1 rounded-full text-[11px] ${!platformFilter ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>All</button>
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setPlatformFilter(p === platformFilter ? '' : p)}
              className={`px-2 py-1 rounded-full text-[11px] capitalize ${platformFilter === p ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Format</span>
          <button onClick={() => setFormatFilter('')}
            className={`px-2 py-1 rounded-full text-[11px] ${!formatFilter ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>All</button>
          {FORMATS.map(f => (
            <button key={f} onClick={() => setFormatFilter(f === formatFilter ? '' : f)}
              className={`px-2 py-1 rounded-full text-[11px] capitalize ${formatFilter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border max-w-sm flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search marketing assets..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
          </div>
          <ProjectSelect value={projectFilter} onChange={setProjectFilter} placeholder="All projects" size="sm" className="w-48" />
        </div>

        {/* Drop indicator */}
        {isDragActive && (
          <div className="fixed inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-primary">Drop files to upload with "marketing" tag</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <span className="text-3xl mb-3">📸</span>
            <p className="text-sm">No marketing assets yet</p>
            <p className="text-xs mt-1">Upload images or videos and tag them with marketing-related tags</p>
          </div>
        ) : (
          /* Masonry-ish grid using CSS columns */
          <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
            {filtered.map((a, i) => {
              const allTags = [...(a.tags || []), ...(a.ai_tags || [])];
              const platforms = getPlatformTags(allTags);
              const format = getFormatTag(allTags);
              return (
                <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                  onClick={() => setSelectedAsset(a)}
                  className="break-inside-avoid rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="relative bg-muted overflow-hidden">
                    {a.file_type === 'video' ? (
                      <VideoThumbnail src={a.file_url} poster={a.thumbnail_url} className="w-full" />
                    ) : (
                      <img src={a.thumbnail_url || a.file_url} alt={a.name} className="w-full object-cover" loading="lazy" />
                    )}
                    {/* Format badge */}
                    {format && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium uppercase">
                        {format}
                      </span>
                    )}
                    {a.file_type === 'video' && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px]">🎬</span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-foreground truncate">{a.name}</p>
                    {platforms.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {platforms.map(p => (
                          <span key={p} className="text-[9px] px-1 py-0.5 rounded bg-accent text-accent-foreground capitalize">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {selectedAsset && <AssetDetailPanel asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
      </div>
    </AppLayout>
  );
}
