import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ArrowLeftRight, X, Clock, Tag, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FrameVersion {
  id: string;
  version_number: number;
  title: string | null;
  notes: string | null;
  duration_seconds: number | null;
  status: string;
  asset_id: string | null;
  audio_url: string | null;
  annotations: any;
  ai_tags: string[] | null;
  ai_description: string | null;
  created_at: string;
  snapshot_reason: string | null;
}

interface FrameVersionDiffProps {
  frameId: string;
  currentFrame: {
    title: string | null;
    notes: string | null;
    duration_seconds: number | null;
    status: string;
    ai_tags?: string[] | null;
    ai_description?: string | null;
    annotations?: any;
    assets?: { thumbnail_url: string | null; name: string | null } | null;
  };
  onClose: () => void;
}

export default function FrameVersionDiff({ frameId, currentFrame, onClose }: FrameVersionDiffProps) {
  const [compareA, setCompareA] = useState<number | 'current'>('current');
  const [compareB, setCompareB] = useState<number | null>(null);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['frame-versions', frameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('frame_versions')
        .select('*')
        .eq('frame_id', frameId)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return data as FrameVersion[];
    },
  });

  const getVersionData = (v: number | 'current') => {
    if (v === 'current') return {
      label: 'Current',
      title: currentFrame.title,
      notes: currentFrame.notes,
      duration: currentFrame.duration_seconds,
      status: currentFrame.status,
      tags: currentFrame.ai_tags || [],
      description: currentFrame.ai_description || null,
      annotations: currentFrame.annotations || [],
    };
    const ver = versions.find(vv => vv.version_number === v);
    if (!ver) return null;
    return {
      label: `v${ver.version_number}`,
      title: ver.title,
      notes: ver.notes,
      duration: ver.duration_seconds,
      status: ver.status,
      tags: ver.ai_tags || [],
      description: ver.ai_description || null,
      annotations: ver.annotations || [],
      reason: ver.snapshot_reason,
      createdAt: ver.created_at,
    };
  };

  const dataA = getVersionData(compareA);
  const dataBRaw = compareB !== null ? getVersionData(compareB) : null;

  // Compute tag diff
  const computeTagDiff = (tagsNew: string[], tagsOld: string[]) => {
    const setNew = new Set(tagsNew);
    const setOld = new Set(tagsOld);
    return {
      added: tagsNew.filter(t => !setOld.has(t)),
      removed: tagsOld.filter(t => !setNew.has(t)),
      shared: tagsNew.filter(t => setOld.has(t)),
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Frame Version History</h2>
            <span className="text-[10px] text-muted-foreground">({versions.length} versions)</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading versions...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No version snapshots yet. Versions are created when frames are updated.</div>
          ) : (
            <>
              {/* Version timeline */}
              <div className="space-y-1">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Timeline</h3>
                <div
                  onClick={() => { setCompareA('current'); setCompareB(versions[0]?.version_number ?? null); }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${compareA === 'current' ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary/50 border border-transparent'}`}
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-foreground">Current</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">live</span>
                </div>
                {versions.map((v, i) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      if (compareA === 'current') setCompareB(v.version_number);
                      else { setCompareA(v.version_number); setCompareB(versions[i + 1]?.version_number ?? null); }
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      compareB === v.version_number ? 'bg-secondary border border-border' : 'hover:bg-secondary/50 border border-transparent'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                    <span className="text-xs text-foreground">v{v.version_number}</span>
                    {v.snapshot_reason && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{v.snapshot_reason}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {new Date(v.created_at).toLocaleDateString()} {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Diff view */}
              {dataA && dataBRaw && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 border-b border-border">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {dataA.label} vs {dataBRaw.label}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Title diff */}
                    <DiffRow label="Title" icon={<MessageSquare className="w-3 h-3" />}
                      valueA={dataA.title || 'Untitled'} valueB={dataBRaw.title || 'Untitled'}
                      changed={dataA.title !== dataBRaw.title} />

                    {/* Duration diff */}
                    <DiffRow label="Duration" icon={<Clock className="w-3 h-3" />}
                      valueA={`${dataA.duration}s`} valueB={`${dataBRaw.duration}s`}
                      changed={dataA.duration !== dataBRaw.duration} />

                    {/* Status diff */}
                    <DiffRow label="Status" icon={null}
                      valueA={dataA.status} valueB={dataBRaw.status}
                      changed={dataA.status !== dataBRaw.status} />

                    {/* Notes diff */}
                    {(dataA.notes || dataBRaw.notes) && (
                      <DiffRow label="Notes" icon={<MessageSquare className="w-3 h-3" />}
                        valueA={dataA.notes || '—'} valueB={dataBRaw.notes || '—'}
                        changed={dataA.notes !== dataBRaw.notes} long />
                    )}

                    {/* AI Description diff */}
                    {(dataA.description || dataBRaw.description) && (
                      <DiffRow label="AI Description" icon={null}
                        valueA={dataA.description || '—'} valueB={dataBRaw.description || '—'}
                        changed={dataA.description !== dataBRaw.description} long />
                    )}

                    {/* Tag diff */}
                    {(() => {
                      const { added, removed, shared } = computeTagDiff(dataA.tags, dataBRaw.tags);
                      if (added.length === 0 && removed.length === 0 && shared.length === 0) return null;
                      return (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Tag className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] font-semibold text-muted-foreground">Tags</span>
                            {(added.length > 0 || removed.length > 0) && (
                              <span className="text-[9px] text-primary ml-1">changed</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {added.map(t => (
                              <span key={`+${t}`} className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">+ {t}</span>
                            ))}
                            {removed.map(t => (
                              <span key={`-${t}`} className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/20">− {t}</span>
                            ))}
                            {shared.map(t => (
                              <span key={`=${t}`} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Annotations count */}
                    {(() => {
                      const countA = Array.isArray(dataA.annotations) ? dataA.annotations.length : 0;
                      const countB = Array.isArray(dataBRaw.annotations) ? dataBRaw.annotations.length : 0;
                      if (countA === 0 && countB === 0) return null;
                      return (
                        <DiffRow label="Annotations" icon={null}
                          valueA={`${countA} annotation${countA !== 1 ? 's' : ''}`}
                          valueB={`${countB} annotation${countB !== 1 ? 's' : ''}`}
                          changed={countA !== countB} />
                      );
                    })()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DiffRow({ label, icon, valueA, valueB, changed, long }: {
  label: string; icon: React.ReactNode; valueA: string; valueB: string; changed: boolean; long?: boolean;
}) {
  return (
    <div className={`${long ? '' : 'flex items-center gap-4'}`}>
      <div className="flex items-center gap-1.5 mb-1 shrink-0 w-28">
        {icon}
        <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
        {changed && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
      </div>
      {long ? (
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className={`text-[11px] px-2 py-1.5 rounded bg-secondary/50 ${changed ? 'border border-primary/20' : ''}`}>
            <span className="text-[9px] text-primary font-semibold block mb-0.5">New</span>
            <span className="text-foreground">{valueA}</span>
          </div>
          <div className="text-[11px] px-2 py-1.5 rounded bg-secondary/50">
            <span className="text-[9px] text-muted-foreground font-semibold block mb-0.5">Old</span>
            <span className="text-muted-foreground">{valueB}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <span className={`text-xs ${changed ? 'text-primary font-medium' : 'text-foreground'}`}>{valueA}</span>
          {changed && (
            <>
              <span className="text-[10px] text-muted-foreground">←</span>
              <span className="text-xs text-muted-foreground line-through">{valueB}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
