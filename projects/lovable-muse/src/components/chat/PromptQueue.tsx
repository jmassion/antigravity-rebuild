import { useState } from 'react';
import { X, Pencil, Check, GripVertical, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QueuedPrompt {
  id: string;
  text: string;
}

interface Props {
  queue: QueuedPrompt[];
  isPaused: boolean;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onTogglePause: () => void;
  onClear: () => void;
}

export default function PromptQueue({ queue, isPaused, onEdit, onRemove, onReorder, onTogglePause, onClear }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  if (queue.length === 0) return null;

  const startEdit = (item: QueuedPrompt) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const commitEdit = () => {
    if (editingId && editText.trim()) {
      onEdit(editingId, editText.trim());
    }
    setEditingId(null);
  };

  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  };

  const handleDrop = (idx: number) => {
    if (dragIdx !== null && dragIdx !== idx) {
      onReorder(dragIdx, idx);
    }
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="px-3 pb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Queue ({queue.length} pending){isPaused && ' · Paused'}
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={onTogglePause}
            title={isPaused ? 'Resume queue' : 'Pause queue'}
          >
            {isPaused ? <Play className="w-3 h-3 text-primary" /> : <Pause className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={onClear}
            title="Clear queue"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        {queue.map((item, i) => (
          <div
            key={item.id}
            draggable={editingId !== item.id}
            onDragStart={() => handleDragStart(i)}
            onDragOver={e => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-1 rounded px-1.5 py-1 text-xs group transition-colors ${
              dragIdx === i ? 'opacity-40' : ''
            } ${overIdx === i && dragIdx !== i ? 'ring-1 ring-primary/40' : ''} ${
              isPaused ? 'bg-muted/30' : 'bg-muted/50'
            }`}
          >
            <GripVertical className="w-3 h-3 text-muted-foreground/50 cursor-grab shrink-0" />
            <span className="text-muted-foreground font-mono w-4 shrink-0 text-[10px]">{i + 1}.</span>
            {editingId === item.id ? (
              <>
                <input
                  className="flex-1 bg-background border border-border rounded px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-ring"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitEdit();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  autoFocus
                />
                <button onClick={commitEdit} className="text-primary hover:text-primary/80 shrink-0">
                  <Check className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 truncate">{item.text}</span>
                <button
                  onClick={() => startEdit(item)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity shrink-0"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onRemove(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
