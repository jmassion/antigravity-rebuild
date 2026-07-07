import { ExternalLink, MoreHorizontal, Pencil, Trash2, GripVertical } from 'lucide-react';
import { detectToolFromUrl, getToolByName } from '@/lib/tool-icons';

interface LinkCardProps {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  toolName?: string | null;
  toolIconUrl?: string | null;
  tags?: string[];
  category?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function LinkCard({ id, title, url, description, toolName, toolIconUrl, tags = [], category, onEdit, onDelete }: LinkCardProps) {
  const detectedTool = toolName ? getToolByName(toolName) : detectToolFromUrl(url);
  const icon = detectedTool?.icon || '🔗';
  const colorClass = detectedTool?.color || 'text-muted-foreground';

  let displayDomain = '';
  try { displayDomain = new URL(url).hostname.replace(/^www\./, ''); } catch { displayDomain = url; }

  return (
    <div className="group relative flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-all">
      {/* Tool icon */}
      <div className={`w-9 h-9 rounded-md bg-secondary flex items-center justify-center text-lg shrink-0 ${colorClass}`}>
        {toolIconUrl ? <img src={toolIconUrl} className="w-5 h-5 object-contain" /> : icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate">
            {title}
          </a>
          <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{displayDomain}</p>
        {description && <p className="text-[11px] text-muted-foreground/70 line-clamp-1 mt-0.5">{description}</p>}
        {tags.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {tags.map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {onEdit && (
          <button onClick={() => onEdit(id)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
