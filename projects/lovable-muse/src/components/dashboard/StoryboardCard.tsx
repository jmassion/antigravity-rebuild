import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Trash2, ImageIcon, Copy, GripVertical, History, Tag, Loader2, Layers, Pencil, Mic, Link2, ChevronDown, ChevronRight, FolderOpen, LayoutGrid, List, Play, Download, User } from 'lucide-react';
import TeamMemberPicker, { MiniAvatar } from '@/components/team/TeamMemberPicker';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import FrameTimeline from './FrameTimeline';
import FrameCopyDialog from './FrameCopyDialog';
import FrameVersionDiff from './FrameVersionDiff';
import BulkFrameDialog from './BulkFrameDialog';
import FrameMarkupOverlay from './FrameMarkupOverlay';
import ShotListView from './ShotListView';
import StoryboardPlayer from './StoryboardPlayer';
import StoryboardExportDialog from './StoryboardExportDialog';
import ProvenanceLinkDialog from '@/components/shared/ProvenanceLinkDialog';
import TagInput from '@/components/shared/TagInput';
import LinkedProjectsEditor from '@/components/shared/LinkedProjectsEditor';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  review: 'bg-phase-build/20 text-phase-build',
  approved: 'bg-phase-grow/20 text-phase-grow',
  revision: 'bg-destructive/20 text-destructive',
};

interface StoryboardCardProps {
  sb: any;
  onPickAsset: (frameId: string) => void;
  onDelete: (id: string) => void;
}

export default function StoryboardCard({ sb, onPickAsset, onDelete }: StoryboardCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copyingFrame, setCopyingFrame] = useState<any | null>(null);
  const [localFrames, setLocalFrames] = useState<any[] | null>(null);
  const [versionFrame, setVersionFrame] = useState<any | null>(null);
  const [taggingFrameId, setTaggingFrameId] = useState<string | null>(null);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [markupFrame, setMarkupFrame] = useState<any | null>(null);
  const [provenanceFrameId, setProvenanceFrameId] = useState<string | null>(null);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [showLinkedProjects, setShowLinkedProjects] = useState(false);
  const [frameView, setFrameView] = useState<'grid' | 'shotlist'>('grid');
  const [showPlayer, setShowPlayer] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const updateTags = useMutation({
    mutationFn: async (tags: string[]) => {
      const { error } = await supabase.from('storyboards').update({ tags }).eq('id', sb.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storyboards'] });
      toast({ title: 'Tags updated' });
    },
  });

  const rawFrames = (sb.storyboard_frames || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const frames = localFrames ?? rawFrames;
  const totalDuration = frames.reduce((acc: number, f: any) => acc + (f.duration_seconds || 0), 0);

  // Snapshot a frame version before updates
  const snapshotFrame = async (frame: any, reason: string) => {
    if (!user) return;
    // Get current max version
    const { data: existing } = await supabase
      .from('frame_versions')
      .select('version_number')
      .eq('frame_id', frame.id)
      .order('version_number', { ascending: false })
      .limit(1);
    const nextVersion = (existing?.[0]?.version_number ?? 0) + 1;
    await supabase.from('frame_versions').insert({
      frame_id: frame.id,
      version_number: nextVersion,
      title: frame.title,
      notes: frame.notes,
      duration_seconds: frame.duration_seconds,
      status: frame.status,
      asset_id: frame.asset_id,
      audio_url: frame.audio_url,
      annotations: frame.annotations || [],
      ai_tags: frame.ai_tags || [],
      ai_description: frame.ai_description || null,
      created_by: user.id,
      snapshot_reason: reason,
    });
  };

  // Auto-tag a frame using AI when asset is assigned
  const autoTagFrame = async (frameId: string, assetId: string) => {
    setTaggingFrameId(frameId);
    try {
      // Get asset info
      const { data: asset } = await supabase
        .from('assets')
        .select('name, file_url, thumbnail_url, file_type')
        .eq('id', assetId)
        .single();
      if (!asset) return;

      const imageUrl = asset.thumbnail_url || asset.file_url;
      const isImage = ['image', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].some(
        t => asset.file_type?.includes(t) || imageUrl?.toLowerCase().includes(t)
      );

      if (isImage && imageUrl) {
        const { data, error } = await supabase.functions.invoke('analyze-asset', {
          body: { imageUrl, fileName: asset.name },
        });
        if (!error && data && !data.error) {
          await supabase.from('storyboard_frames').update({
            ai_tags: data.tags || [],
            ai_description: data.description || null,
          }).eq('id', frameId);
          toast({ title: 'Frame auto-tagged', description: `${(data.tags || []).length} tags added` });
          queryClient.invalidateQueries({ queryKey: ['storyboards'] });
        }
      }
    } catch (e) {
      console.error('Auto-tag failed:', e);
    } finally {
      setTaggingFrameId(null);
    }
  };

  const addFrame = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data: existing } = await supabase
        .from('storyboard_frames')
        .select('sort_order')
        .eq('storyboard_id', sb.id)
        .order('sort_order', { ascending: false })
        .limit(1);
      const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;
      const { error } = await supabase.from('storyboard_frames').insert({
        storyboard_id: sb.id,
        sort_order: nextOrder,
        title: `Frame ${nextOrder + 1}`,
        notes: '',
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storyboards'] }),
  });

  const reorderFrames = useMutation({
    mutationFn: async (reordered: { id: string; sort_order: number }[]) => {
      const updates = reordered.map(({ id, sort_order }) =>
        supabase.from('storyboard_frames').update({ sort_order }).eq('id', id)
      );
      const results = await Promise.all(updates);
      const err = results.find(r => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storyboards'] });
      setLocalFrames(null);
    },
    onError: (e) => {
      toast({ title: 'Reorder failed', description: e.message, variant: 'destructive' });
      setLocalFrames(null);
    },
  });

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = Array.from(frames);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const withNewOrder = reordered.map((f: any, i: number) => ({ ...f, sort_order: i }));
    setLocalFrames(withNewOrder);
    reorderFrames.mutate(withNewOrder.map((f: any) => ({ id: f.id, sort_order: f.sort_order })));
  }, [frames, reorderFrames]);

  // Enhanced asset picker that snapshots + auto-tags
  const handlePickAsset = async (frameId: string) => {
    // Snapshot before change
    const frame = frames.find((f: any) => f.id === frameId);
    if (frame && frame.asset_id) {
      await snapshotFrame(frame, 'asset_change');
    }
    onPickAsset(frameId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{sb.name}</h2>
          <span className="text-[11px] text-muted-foreground">
            {frames.length} frames · {totalDuration}s total
            {(sb as any).projects?.name ? ` · ${(sb as any).projects.name}` : ''}
          </span>
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {(sb.tags || []).map((tag: string) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/80">{tag}</span>
            ))}
            <button
              onClick={() => setShowTagEditor(!showTagEditor)}
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
            >
              <Tag className="w-2.5 h-2.5" /> {showTagEditor ? '▾' : 'Edit'}
            </button>
          </div>
          {showTagEditor && (
            <div className="mt-2 max-w-md">
              <TagInput value={sb.tags || []} onChange={(tags) => updateTags.mutate(tags)} placeholder="Add tags..." />
            </div>
          )}
          <div className="flex items-center gap-1 mt-1">
            <button
              onClick={() => setShowLinkedProjects(!showLinkedProjects)}
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
            >
              <FolderOpen className="w-2.5 h-2.5" /> {showLinkedProjects ? '▾ Projects' : '+ Projects'}
            </button>
          </div>
          {showLinkedProjects && (
            <div className="mt-2 max-w-sm">
              <LinkedProjectsEditor
                entityType="storyboard"
                entityId={sb.id}
                primaryProjectId={sb.project_id}
                invalidateKeys={[['storyboards']]}
                compact
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setFrameView('grid')}
              className={`p-1.5 transition-colors ${frameView === 'grid' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFrameView('shotlist')}
              className={`p-1.5 transition-colors ${frameView === 'shotlist' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              title="Shot list view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          {frames.length > 0 && (
            <>
              <button
                onClick={() => setShowPlayer(true)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-foreground bg-secondary border border-border hover:bg-secondary/80 transition-colors"
                title="Watch storyboard"
              >
                <Play className="w-3 h-3" /> Watch
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-foreground bg-secondary border border-border hover:bg-secondary/80 transition-colors"
                title="Download / Export"
              >
                <Download className="w-3 h-3" /> Export
              </button>
            </>
          )}
          <button
            onClick={() => addFrame.mutate()}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Frame
          </button>
          <button
            onClick={() => setShowBulkAdd(true)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Layers className="w-3 h-3" /> Bulk Add
          </button>
          <button onClick={() => onDelete(sb.id)} className="text-destructive/60 hover:text-destructive p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {frameView === 'shotlist' ? (
        <ShotListView
          frames={frames}
          storyboardId={sb.id}
          onPickAsset={handlePickAsset}
          onMarkup={setMarkupFrame}
          onVersion={setVersionFrame}
          onCopy={setCopyingFrame}
          onProvenance={setProvenanceFrameId}
          onDragEnd={handleDragEnd}
        />
      ) : (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`frames-${sb.id}`} direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin"
                >
                  {frames.map((frame: any, i: number) => (
                    <Draggable key={frame.id} draggableId={frame.id} index={i}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={`flex-shrink-0 w-56 rounded-lg border bg-card overflow-hidden transition-all group ${
                            snapshot.isDragging
                              ? 'border-primary shadow-lg shadow-primary/10 rotate-1 scale-[1.02]'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <div
                            {...dragProvided.dragHandleProps}
                            className="flex items-center justify-center h-5 bg-secondary/50 cursor-grab active:cursor-grabbing border-b border-border/50"
                          >
                            <GripVertical className="w-3 h-3 text-muted-foreground/50" />
                          </div>
                          <div
                            className="relative aspect-[16/10] overflow-hidden bg-muted cursor-pointer"
                            onClick={() => handlePickAsset(frame.id)}
                            title="Click to assign asset"
                          >
                            {frame.assets?.thumbnail_url ? (
                              <img src={frame.assets.thumbnail_url} alt={frame.title || ''} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 text-xs gap-1">
                                <ImageIcon className="w-4 h-4" />
                                <span>Assign asset</span>
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <span className="text-[10px] font-mono font-bold bg-card/80 backdrop-blur px-1.5 py-0.5 rounded text-foreground">
                                {String(frame.sort_order + 1).padStart(2, '0')}
                              </span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className={`text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-full ${statusColors[frame.status] || statusColors.draft}`}>
                                {frame.status}
                              </span>
                            </div>
                            <div className="absolute bottom-2 right-2">
                              <span className="text-[10px] font-mono bg-card/80 backdrop-blur px-1.5 py-0.5 rounded text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />{frame.duration_seconds}s
                              </span>
                            </div>
                            {taggingFrameId === frame.id && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur px-2.5 py-1.5 rounded-md">
                                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                  <span className="text-[10px] text-foreground font-medium">Auto-tagging...</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-2.5">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-foreground truncate flex-1">{frame.title || 'Untitled'}</p>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                {frame.assets?.thumbnail_url && (
                                  <button onClick={(e) => { e.stopPropagation(); setMarkupFrame(frame); }} className="p-1 text-muted-foreground hover:text-primary" title="Markup / annotate"><Pencil className="w-3 h-3" /></button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); setProvenanceFrameId(frame.id); }} className="p-1 text-muted-foreground hover:text-primary" title="Provenance links"><Link2 className="w-3 h-3" /></button>
                                <button onClick={(e) => { e.stopPropagation(); setVersionFrame(frame); }} className="p-1 text-muted-foreground hover:text-primary" title="Version history"><History className="w-3 h-3" /></button>
                                <button onClick={(e) => { e.stopPropagation(); setCopyingFrame(frame); }} className="p-1 text-muted-foreground hover:text-primary" title="Copy to another storyboard"><Copy className="w-3 h-3" /></button>
                              </div>
                            </div>
                            {/* Assignee + annotation indicators */}
                            <div className="flex items-center gap-2 mt-1.5">
                              {frame.assignee ? (
                                <div className="flex items-center gap-1">
                                  <MiniAvatar member={{ ...frame.assignee, role: '' } as any} />
                                  <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{frame.assignee.display_name}</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground/30 flex items-center gap-0.5"><User className="w-3 h-3" /> Unassigned</span>
                              )}
                              {Array.isArray(frame.annotations) && frame.annotations.length > 0 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-info/15 text-info flex items-center gap-0.5">
                                  <Pencil className="w-2.5 h-2.5" /> {frame.annotations.length}
                                </span>
                              )}
                            </div>
                            {frame.assets?.name && <p className="text-[10px] text-primary/70 truncate mt-1">🔗 {frame.assets.name}</p>}
                            {frame.notes && <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{frame.notes}</p>}
                            {frame.ai_tags && frame.ai_tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                <Tag className="w-2.5 h-2.5 text-primary/50 shrink-0" />
                                {frame.ai_tags.slice(0, 3).map((tag: string) => (
                                  <span key={tag} className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary/70">{tag}</span>
                                ))}
                                {frame.ai_tags.length > 3 && (
                                  <span className="text-[8px] text-muted-foreground">+{frame.ai_tags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {frames.length === 0 && (
                    <div className="flex items-center justify-center w-56 h-32 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                      Click "Add Frame" to start
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <FrameTimeline frames={frames} storyboardId={sb.id} onOpenPlayer={() => setShowPlayer(true)} />
        </>
      )}

      {copyingFrame && (
        <FrameCopyDialog
          frame={copyingFrame}
          sourceStoryboardId={sb.id}
          onClose={() => setCopyingFrame(null)}
        />
      )}

      {versionFrame && (
        <FrameVersionDiff
          frameId={versionFrame.id}
          currentFrame={versionFrame}
          onClose={() => setVersionFrame(null)}
        />
      )}

      {showBulkAdd && (
        <BulkFrameDialog
          storyboardId={sb.id}
          currentFrameCount={frames.length}
          onClose={() => setShowBulkAdd(false)}
        />
      )}

      {markupFrame && markupFrame.assets?.thumbnail_url && (
        <FrameMarkupOverlay
          imageUrl={markupFrame.assets.thumbnail_url}
          frameName={markupFrame.title || `Frame ${markupFrame.sort_order + 1}`}
          onClose={() => setMarkupFrame(null)}
          onSave={(annotations) => {
            supabase.from('storyboard_frames')
              .update({ annotations: annotations as any })
              .eq('id', markupFrame.id)
              .then(() => {
                queryClient.invalidateQueries({ queryKey: ['storyboards'] });
                toast({ title: 'Markup saved' });
              });
          }}
        />
      )}

      {provenanceFrameId && (
        <ProvenanceLinkDialog
          sourceType="frame"
          sourceId={provenanceFrameId}
          onClose={() => setProvenanceFrameId(null)}
        />
      )}

      {showPlayer && frames.length > 0 && (
        <StoryboardPlayer
          frames={frames}
          storyboardName={sb.name}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {showExport && (
        <StoryboardExportDialog
          frames={frames}
          storyboardName={sb.name}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
