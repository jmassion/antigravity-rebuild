import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical, ImageIcon, Clock, Users, Tag, Music, Waves, Mic, Pencil, History, Copy, Link2,
  ChevronDown, ChevronRight, Check, X, Plus, Trash2, MessageSquare, User,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TeamMemberPicker, { MiniAvatar } from '@/components/team/TeamMemberPicker';

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
  ai_tags?: string[] | null;
  ai_description?: string | null;
  annotations?: Annotation[] | any[] | null;
  assignee_id?: string | null;
  assignee?: { id: string; display_name: string; avatar_url: string | null; member_type: string } | null;
  assets?: { thumbnail_url: string | null; name: string | null; file_type?: string } | null;
}

interface ShotListViewProps {
  frames: Frame[];
  storyboardId: string;
  onPickAsset: (frameId: string) => void;
  onMarkup?: (frame: Frame) => void;
  onVersion?: (frame: Frame) => void;
  onCopy?: (frame: Frame) => void;
  onProvenance?: (frameId: string) => void;
  onDragEnd: (result: DropResult) => void;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', dot: 'bg-muted-foreground/50' },
  { value: 'review', label: 'Review', dot: 'bg-phase-build' },
  { value: 'approved', label: 'Done', dot: 'bg-phase-grow' },
  { value: 'revision', label: 'Revision', dot: 'bg-destructive' },
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  draft: { label: 'Draft', color: 'text-muted-foreground', dot: 'bg-muted-foreground/50' },
  review: { label: 'Review', color: 'text-phase-build', dot: 'bg-phase-build' },
  approved: { label: 'Done', color: 'text-phase-grow', dot: 'bg-phase-grow' },
  revision: { label: 'Revision', color: 'text-destructive', dot: 'bg-destructive' },
};

const ANNOTATION_COLORS = [
  'bg-primary', 'bg-phase-start', 'bg-phase-build', 'bg-phase-grow', 'bg-destructive',
];

export default function ShotListView({
  frames,
  storyboardId,
  onPickAsset,
  onMarkup,
  onVersion,
  onCopy,
  onProvenance,
  onDragEnd,
}: ShotListViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (frames.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
        No frames — add one above
      </div>
    );
  }

  const getAnnotations = (frame: Frame, layer: string) => {
    const annots = Array.isArray(frame.annotations) ? (frame.annotations as Annotation[]) : [];
    return annots.filter(a => (a.layer || 'note') === layer);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="mt-4 rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[36px_48px_72px_1fr_1.5fr_1fr_80px_90px] bg-secondary/60 border-b border-border text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          <div className="px-1 py-2" />
          <div className="px-1 py-2">Shot</div>
          <div className="px-1 py-2">Image</div>
          <div className="px-2 py-2">Title / Duration</div>
          <div className="px-2 py-2">Description & Notes</div>
          <div className="px-2 py-2">Dialogue / Audio</div>
          <div className="px-2 py-2">Assignee</div>
          <div className="px-2 py-2 text-right">Status</div>
        </div>

        <Droppable droppableId={`shotlist-${storyboardId}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {frames.map((frame, i) => {
                const isEditing = editingId === frame.id;
                const isExpanded = expandedId === frame.id;

                return (
                  <Draggable key={frame.id} draggableId={frame.id} index={i}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`border-b border-border last:border-b-0 transition-colors ${
                          snapshot.isDragging ? 'bg-primary/5 shadow-lg' : isEditing ? 'bg-secondary/40' : 'bg-card hover:bg-secondary/20'
                        }`}
                      >
                        {isEditing ? (
                          <InlineEditor
                            frame={frame}
                            onPickAsset={onPickAsset}
                            dragHandleProps={dragProvided.dragHandleProps}
                            onClose={() => setEditingId(null)}
                          />
                        ) : (
                          <>
                            {/* Read-only row — click to edit */}
                            <div
                              className="grid grid-cols-[36px_48px_72px_1fr_1.5fr_1fr_80px_90px] items-start cursor-pointer"
                              onClick={() => setEditingId(frame.id)}
                            >
                              <div
                                {...dragProvided.dragHandleProps}
                                className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing"
                                onClick={e => e.stopPropagation()}
                              >
                                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
                              </div>

                              <div className="px-1 py-3">
                                <span className="text-sm font-bold font-mono text-foreground">
                                  {String(frame.sort_order + 1).padStart(2, '0')}
                                </span>
                              </div>

                              <div className="px-1 py-2" onClick={e => { e.stopPropagation(); onPickAsset(frame.id); }}>
                                <div className="w-14 aspect-[16/10] rounded border border-border overflow-hidden bg-muted cursor-pointer group">
                                  {frame.assets?.thumbnail_url ? (
                                    <img src={frame.assets.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                      <ImageIcon className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="px-2 py-3">
                                <p className="text-xs font-semibold text-foreground">{frame.title || 'Untitled'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />{frame.duration_seconds || 0}s
                                  </span>
                                  {(frame.ai_tags || []).slice(0, 3).map((tag: string) => (
                                    <span key={tag} className="text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-primary/10 text-primary/70">{tag}</span>
                                  ))}
                                </div>
                              </div>

                              <div className="px-2 py-3">
                                {frame.notes ? (
                                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{frame.notes}</p>
                                ) : frame.ai_description ? (
                                  <p className="text-[11px] text-muted-foreground/60 italic line-clamp-2">{frame.ai_description}</p>
                                ) : (
                                  <p className="text-[10px] text-muted-foreground/30 italic">Click to add notes...</p>
                                )}
                              </div>

                              <div className="px-2 py-3">
                                {(() => {
                                  const dialogue = getAnnotations(frame, 'dialogue');
                                  const noteAnnots = getAnnotations(frame, 'note');
                                  if (dialogue.length === 0 && noteAnnots.length === 0 && !frame.audio_url) {
                                    return <span className="text-[10px] text-muted-foreground/30 italic">Click to add...</span>;
                                  }
                                  return (
                                    <div className="space-y-0.5">
                                      {dialogue.slice(0, 2).map(d => (
                                        <p key={d.id} className="text-[10px]">
                                          <span className="text-primary font-semibold">{d.character || '???'}:</span>{' '}
                                          <span className="text-muted-foreground">{d.text}</span>
                                        </p>
                                      ))}
                                      {frame.audio_url && (
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Mic className="w-3 h-3 text-info" /> VO</p>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Assignee column */}
                              <div className="px-2 py-3" onClick={e => e.stopPropagation()}>
                                {frame.assignee ? (
                                  <div className="flex items-center gap-1.5">
                                    <MiniAvatar member={{ ...frame.assignee, role: '' } as any} />
                                    <span className="text-[10px] text-foreground truncate">{frame.assignee.display_name}</span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground/30 italic">Unassigned</span>
                                )}
                              </div>

                              <div className="px-2 py-3 flex items-start justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                <span className={`w-2.5 h-2.5 rounded-full mt-0.5 ${(statusConfig[frame.status] || statusConfig.draft).dot}`} />
                                <span className={`text-[11px] font-medium ${(statusConfig[frame.status] || statusConfig.draft).color}`}>
                                  {(statusConfig[frame.status] || statusConfig.draft).label}
                                </span>
                              </div>
                            </div>

                            {/* Quick actions */}
                            <div className="flex items-center gap-1 px-3 pb-1.5 -mt-0.5">
                              <button onClick={() => setEditingId(frame.id)} className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors">
                                <Pencil className="w-3 h-3" /> Edit
                              </button>
                              <div className="ml-auto flex items-center gap-1">
                                {frame.assets?.thumbnail_url && onMarkup && (
                                  <button onClick={() => onMarkup(frame)} className="p-1 text-muted-foreground/40 hover:text-primary transition-colors" title="Markup"><Pencil className="w-3 h-3" /></button>
                                )}
                                {onProvenance && (
                                  <button onClick={() => onProvenance(frame.id)} className="p-1 text-muted-foreground/40 hover:text-primary transition-colors" title="Provenance"><Link2 className="w-3 h-3" /></button>
                                )}
                                {onVersion && (
                                  <button onClick={() => onVersion(frame)} className="p-1 text-muted-foreground/40 hover:text-primary transition-colors" title="Versions"><History className="w-3 h-3" /></button>
                                )}
                                {onCopy && (
                                  <button onClick={() => onCopy(frame)} className="p-1 text-muted-foreground/40 hover:text-primary transition-colors" title="Copy"><Copy className="w-3 h-3" /></button>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}

/** Inline editor that replaces the row when editing */
function InlineEditor({
  frame,
  onPickAsset,
  dragHandleProps,
  onClose,
}: {
  frame: Frame;
  onPickAsset: (id: string) => void;
  dragHandleProps: any;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(frame.title || '');
  const [notes, setNotes] = useState(frame.notes || '');
  const [duration, setDuration] = useState(String(frame.duration_seconds || 3));
  const [status, setStatus] = useState(frame.status || 'draft');
  const [assigneeId, setAssigneeId] = useState<string | null>(frame.assignee_id || null);
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    const raw = Array.isArray(frame.annotations) ? (frame.annotations as Annotation[]) : [];
    return raw.map(a => ({ ...a, id: a.id || crypto.randomUUID() }));
  });

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const dialogueAnnotations = annotations.filter(a => a.layer === 'dialogue');
  const noteAnnotations = annotations.filter(a => !a.layer || a.layer === 'note');

  const updateFrame = useMutation({
    mutationFn: async () => {
      const dur = Math.max(0.5, Math.min(60, parseFloat(duration) || 3));
      const { error } = await supabase
        .from('storyboard_frames')
        .update({
          title, notes, duration_seconds: dur, status,
          assignee_id: assigneeId,
          annotations: annotations as any,
        })
        .eq('id', frame.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storyboards'] });
      toast({ title: 'Frame updated' });
      onClose();
    },
    onError: (e) => toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' }),
  });

  const addAnnotation = (layer: string) => {
    setAnnotations(prev => [
      ...prev,
      { id: crypto.randomUUID(), text: '', time: 0, color: ANNOTATION_COLORS[prev.length % ANNOTATION_COLORS.length], layer, character: '' },
    ]);
  };

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) updateFrame.mutate();
  };

  return (
    <div className="p-3 space-y-3" onKeyDown={handleKeyDown}>
      {/* Top bar */}
      <div className="flex items-center gap-2">
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
        </div>
        <span className="text-sm font-bold font-mono text-foreground/50">
          #{frame.sort_order + 1}
        </span>

        {/* Thumbnail */}
        <div
          className="w-12 aspect-[16/10] rounded border border-border overflow-hidden bg-muted cursor-pointer shrink-0"
          onClick={() => onPickAsset(frame.id)}
          title="Click to change asset"
        >
          {frame.assets?.thumbnail_url ? (
            <img src={frame.assets.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <ImageIcon className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Title */}
        <input
          ref={titleRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Frame title..."
          className="flex-1 px-2 py-1 rounded bg-secondary border border-border text-sm font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
        />

        {/* Duration */}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <input
            type="number"
            min="0.5"
            max="60"
            step="0.5"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-14 px-1.5 py-1 rounded bg-secondary border border-border text-xs font-mono text-foreground text-center outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-[10px] text-muted-foreground">s</span>
        </div>

        {/* Status dropdown */}
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="px-2 py-1 rounded bg-secondary border border-border text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Assignee picker */}
        <TeamMemberPicker
          value={assigneeId}
          onChange={setAssigneeId}
          placeholder="Assign..."
          className="text-[10px] min-w-[120px] py-1"
        />

        {/* Save / Cancel */}
        <button
          onClick={() => updateFrame.mutate()}
          disabled={updateFrame.isPending}
          className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
        >
          <Check className="w-3 h-3" /> Save
        </button>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notes */}
      <div>
        <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
          <MessageSquare className="w-3 h-3" /> Description / Action Notes
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Describe the shot action, camera movement, framing details..."
          className="w-full px-2.5 py-1.5 rounded bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {/* Dialogue + Notes in two columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Dialogue */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> Dialogue
            </label>
            <button onClick={() => addAnnotation('dialogue')} className="flex items-center gap-0.5 text-[10px] text-primary hover:text-primary/80">
              <Plus className="w-2.5 h-2.5" /> Line
            </button>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {dialogueAnnotations.length === 0 && (
              <p className="text-[10px] text-muted-foreground/40 italic">No dialogue — click + to add</p>
            )}
            {dialogueAnnotations.map(a => (
              <div key={a.id} className="flex items-center gap-1.5">
                <input
                  value={a.character || ''}
                  onChange={e => updateAnnotation(a.id, { character: e.target.value })}
                  placeholder="Who"
                  className="w-16 px-1.5 py-1 rounded bg-secondary border border-border text-[10px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  value={a.text}
                  onChange={e => updateAnnotation(a.id, { text: e.target.value })}
                  placeholder="Dialogue..."
                  className="flex-1 px-1.5 py-1 rounded bg-secondary border border-border text-[10px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={() => removeAnnotation(a.id)} className="text-destructive/40 hover:text-destructive p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Clip Notes / SFX */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              <Tag className="w-3 h-3" /> Clip Notes / SFX
            </label>
            <button onClick={() => addAnnotation('note')} className="flex items-center gap-0.5 text-[10px] text-primary hover:text-primary/80">
              <Plus className="w-2.5 h-2.5" /> Note
            </button>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {noteAnnotations.length === 0 && (
              <p className="text-[10px] text-muted-foreground/40 italic">No notes — click + to add</p>
            )}
            {noteAnnotations.map(a => (
              <div key={a.id} className="flex items-center gap-1.5">
                <div className="flex gap-0.5 shrink-0">
                  {ANNOTATION_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => updateAnnotation(a.id, { color: c })}
                      className={`w-2.5 h-2.5 rounded-full ${c} ${a.color === c ? 'ring-1 ring-offset-1 ring-offset-card ring-foreground/30' : 'opacity-30 hover:opacity-60'} transition-all`}
                    />
                  ))}
                </div>
                <input
                  value={a.text}
                  onChange={e => updateAnnotation(a.id, { text: e.target.value })}
                  placeholder="Note / SFX..."
                  className="flex-1 px-1.5 py-1 rounded bg-secondary border border-border text-[10px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={() => removeAnnotation(a.id)} className="text-destructive/40 hover:text-destructive p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI tags display */}
      {(frame.ai_tags || []).length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">AI Tags:</span>
          {(frame.ai_tags || []).map((tag: string) => (
            <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/70">{tag}</span>
          ))}
        </div>
      )}

      <p className="text-[9px] text-muted-foreground/40">⌘+Enter to save · Esc to cancel</p>
    </div>
  );
}
