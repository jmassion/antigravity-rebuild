import { useState } from 'react';
import { X, ArrowLeftRight, Tag } from 'lucide-react';

interface VersionData {
  id: string;
  version_number: number;
  file_url: string;
  thumbnail_url: string | null;
  notes: string | null;
  ai_tags: string[] | null;
  ai_description: string | null;
  created_at: string | null;
}

interface Props {
  versionA: VersionData;
  versionB: VersionData;
  onClose: () => void;
}

export default function VersionDiffView({ versionA, versionB, onClose }: Props) {
  const [sliderPos, setSliderPos] = useState(50);
  const [mode, setMode] = useState<'slider' | 'side-by-side'>('side-by-side');

  const tagsA = new Set(versionA.ai_tags || []);
  const tagsB = new Set(versionB.ai_tags || []);
  const addedTags = [...tagsA].filter(t => !tagsB.has(t));
  const removedTags = [...tagsB].filter(t => !tagsA.has(t));
  const sharedTags = [...tagsA].filter(t => tagsB.has(t));

  const isImage = (url: string | null) => {
    if (!url) return false;
    const ext = url.split('.').pop()?.toLowerCase() || '';
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
  };

  const bothImages = isImage(versionA.file_url) && isImage(versionB.file_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Version {versionB.version_number} → Version {versionA.version_number}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {bothImages && (
              <div className="flex rounded-md border border-border overflow-hidden">
                <button
                  onClick={() => setMode('side-by-side')}
                  className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    mode === 'side-by-side' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Side by Side
                </button>
                <button
                  onClick={() => setMode('slider')}
                  className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    mode === 'slider' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Slider
                </button>
              </div>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Comparison */}
        <div className="flex-1 overflow-auto">
          {bothImages ? (
            mode === 'slider' ? (
              <div className="relative w-full aspect-video bg-muted overflow-hidden">
                {/* Version B (older) - full background */}
                <img src={versionB.file_url} alt={`v${versionB.version_number}`} className="absolute inset-0 w-full h-full object-contain" />
                {/* Version A (newer) - clipped by slider */}
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                  <img src={versionA.file_url} alt={`v${versionA.version_number}`} className="absolute inset-0 w-full h-full object-contain" style={{ minWidth: `${10000 / sliderPos}%` }} />
                </div>
                {/* Slider line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary cursor-ew-resize z-10"
                  style={{ left: `${sliderPos}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPos}
                  onChange={e => setSliderPos(Number(e.target.value))}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 z-20 opacity-70 accent-primary"
                />
                {/* Labels */}
                <span className="absolute top-3 left-3 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded z-10">
                  v{versionA.version_number} (new)
                </span>
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded z-10">
                  v{versionB.version_number} (old)
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-0.5 bg-border">
                <div className="bg-card p-2">
                  <span className="text-[10px] font-bold text-primary mb-1 block">v{versionA.version_number} (newer)</span>
                  <div className="aspect-video bg-muted rounded overflow-hidden">
                    <img src={versionA.file_url} alt="" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="bg-card p-2">
                  <span className="text-[10px] font-bold text-muted-foreground mb-1 block">v{versionB.version_number} (older)</span>
                  <div className="aspect-video bg-muted rounded overflow-hidden">
                    <img src={versionB.file_url} alt="" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 gap-0.5 bg-border p-4">
              <div className="bg-card p-3 rounded">
                <span className="text-[10px] font-bold text-primary mb-1 block">v{versionA.version_number} (newer)</span>
                <p className="text-xs text-muted-foreground">Non-image file — open to compare</p>
                <a href={versionA.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                  Open file ↗
                </a>
              </div>
              <div className="bg-card p-3 rounded">
                <span className="text-[10px] font-bold text-muted-foreground mb-1 block">v{versionB.version_number} (older)</span>
                <p className="text-xs text-muted-foreground">Non-image file — open to compare</p>
                <a href={versionB.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                  Open file ↗
                </a>
              </div>
            </div>
          )}

          {/* Metadata Diff */}
          <div className="px-5 py-4 space-y-4 border-t border-border">
            {/* Notes comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] font-bold text-foreground mb-1">v{versionA.version_number} Notes</h4>
                <p className="text-xs text-muted-foreground">{versionA.notes || '—'}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-foreground mb-1">v{versionB.version_number} Notes</h4>
                <p className="text-xs text-muted-foreground">{versionB.notes || '—'}</p>
              </div>
            </div>

            {/* AI Description comparison */}
            {(versionA.ai_description || versionB.ai_description) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-foreground mb-1">v{versionA.version_number} AI Description</h4>
                  <p className="text-xs text-muted-foreground">{versionA.ai_description || '—'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-foreground mb-1">v{versionB.version_number} AI Description</h4>
                  <p className="text-xs text-muted-foreground">{versionB.ai_description || '—'}</p>
                </div>
              </div>
            )}

            {/* Tag diff */}
            {(addedTags.length > 0 || removedTags.length > 0 || sharedTags.length > 0) && (
              <div>
                <h4 className="text-[10px] font-bold text-foreground mb-2 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Tag Changes
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {addedTags.map(t => (
                    <span key={`+${t}`} className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                      + {t}
                    </span>
                  ))}
                  {removedTags.map(t => (
                    <span key={`-${t}`} className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/20">
                      − {t}
                    </span>
                  ))}
                  {sharedTags.map(t => (
                    <span key={`=${t}`} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
