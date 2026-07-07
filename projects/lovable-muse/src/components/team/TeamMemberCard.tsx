import { useNavigate } from 'react-router-dom';
import { Bot, CheckCircle2, Circle, Sparkles, User, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface TeamMember {
  id: string;
  owner_id: string;
  user_id: string | null;
  display_name: string;
  avatar_url: string | null;
  member_type: string;
  role: string;
  title: string | null;
  bio: string | null;
  primary_project_id: string | null;
  is_active: boolean;
  claimed_by: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
  task_count?: number;
  primary_project?: { name: string } | null;
  assigned_projects?: { project_id: string; name: string }[];
  project_ids?: string[];
}

const roleColors: Record<string, string> = {
  super_admin: 'bg-destructive/20 text-destructive border-destructive/30',
  admin: 'bg-primary/20 text-primary border-primary/30',
  manager: 'bg-[hsl(var(--info))]/20 text-[hsl(var(--info))] border-[hsl(var(--info))]/30',
  member: 'bg-secondary text-secondary-foreground border-border',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const typeIcons: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  human: { icon: CheckCircle2, label: 'Human', className: 'text-[hsl(var(--success))]' },
  ai: { icon: Sparkles, label: 'AI Agent', className: 'text-primary' },
  placeholder: { icon: Circle, label: 'Placeholder', className: 'text-muted-foreground' },
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function TeamMemberCard({
  member, onEdit, onDelete, onClaim,
}: {
  member: TeamMember;
  onEdit?: (m: TeamMember) => void;
  onDelete?: (id: string) => void;
  onClaim?: (m: TeamMember) => void;
}) {
  const navigate = useNavigate();
  const typeInfo = typeIcons[member.member_type] || typeIcons.placeholder;
  const TypeIcon = typeInfo.icon;
  const isPlaceholder = member.member_type === 'placeholder';
  const isAI = member.member_type === 'ai';

  return (
    <div
      onClick={() => navigate(`/team/${member.id}`)}
      className={`group rounded-lg border bg-card p-4 transition-all hover:border-primary/30 cursor-pointer ${
        isPlaceholder ? 'border-dashed border-muted-foreground/30' : 'border-border'
      } ${!member.is_active ? 'opacity-50' : ''}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ${
            isPlaceholder ? 'border-2 border-dashed border-muted-foreground/40' : 'border-2 border-border'
          }`}>
            {member.avatar_url ? (
              <img src={member.avatar_url} alt={member.display_name} className="w-full h-full object-cover" />
            ) : isAI ? (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                {getInitials(member.display_name)}
              </div>
            )}
            {/* Type indicator dot */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center bg-card`}>
              <TypeIcon className={`w-2.5 h-2.5 ${typeInfo.className}`} />
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{member.display_name}</p>
            {member.title && <p className="text-[10px] text-muted-foreground truncate">{member.title}</p>}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {onEdit && <DropdownMenuItem onClick={() => onEdit(member)}><Pencil className="w-3 h-3 mr-2" />Edit</DropdownMenuItem>}
            {isPlaceholder && onClaim && (
              <DropdownMenuItem onClick={() => onClaim(member)}><User className="w-3 h-3 mr-2" />Claim</DropdownMenuItem>
            )}
            {onDelete && <DropdownMenuItem onClick={() => onDelete(member.id)} className="text-destructive"><Trash2 className="w-3 h-3 mr-2" />Delete</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${roleColors[member.role] || roleColors.member}`}>
          {member.role.replace('_', ' ')}
        </Badge>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-transparent">
          {typeInfo.label}
        </Badge>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
        <span>{member.task_count ?? 0} tasks</span>
        <div className="flex items-center gap-1 truncate ml-2">
          {(member.assigned_projects || []).length > 0 ? (
            <>
              <span className="flex-shrink-0">📂</span>
              {(member.assigned_projects || []).slice(0, 2).map((p, i) => (
                <span key={p.project_id} className="truncate">
                  {i > 0 && ', '}{p.name}
                </span>
              ))}
              {(member.assigned_projects || []).length > 2 && (
                <span className="flex-shrink-0">+{(member.assigned_projects || []).length - 2}</span>
              )}
            </>
          ) : member.primary_project?.name ? (
            <span className="truncate">📂 {member.primary_project.name}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
