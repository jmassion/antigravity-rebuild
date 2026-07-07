import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import type { TeamMember } from './TeamMemberCard';

const roleOrder = ['super_admin', 'admin', 'manager', 'member', 'viewer'];

const roleTiers: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'border-destructive/50 bg-destructive/5' },
  admin: { label: 'Admin', color: 'border-primary/50 bg-primary/5' },
  manager: { label: 'Manager', color: 'border-[hsl(var(--info))]/50 bg-[hsl(var(--info))]/5' },
  member: { label: 'Member', color: 'border-border bg-card' },
  viewer: { label: 'Viewer', color: 'border-muted bg-muted/30' },
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function AccountabilityChart({ members }: { members: TeamMember[] }) {
  const tiers = useMemo(() => {
    const grouped: Record<string, TeamMember[]> = {};
    for (const role of roleOrder) grouped[role] = [];
    for (const m of members) {
      const r = roleOrder.includes(m.role) ? m.role : 'member';
      grouped[r].push(m);
    }
    return roleOrder.filter(r => grouped[r].length > 0).map(r => ({
      role: r,
      ...roleTiers[r],
      members: grouped[r],
    }));
  }, [members]);

  if (tiers.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">No team members yet.</p>;
  }

  return (
    <div className="space-y-6">
      {tiers.map((tier, tierIdx) => (
        <div key={tier.role} className="relative">
          {/* Connector line to next tier */}
          {tierIdx < tiers.length - 1 && (
            <div className="absolute left-1/2 -translate-x-px bottom-0 translate-y-full w-0.5 h-6 bg-border" />
          )}

          {/* Tier label */}
          <div className="text-center mb-3">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">{tier.label}</span>
          </div>

          {/* Members row */}
          <div className="flex flex-wrap justify-center gap-3">
            {tier.members.map(m => (
              <ChartNode key={m.id} member={m} tierColor={tier.color} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartNode({ member, tierColor }: { member: TeamMember; tierColor: string }) {
  const navigate = useNavigate();
  const isPlaceholder = member.member_type === 'placeholder';
  const isAI = member.member_type === 'ai';

  return (
    <div onClick={() => navigate(`/team/${member.id}`)} className={`rounded-lg border p-3 w-36 text-center transition-all hover:border-primary/30 cursor-pointer ${tierColor} ${
      isPlaceholder ? 'border-dashed' : ''
    }`}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full mx-auto mb-2 overflow-hidden border-2 border-border">
        {member.avatar_url ? (
          <img src={member.avatar_url} className="w-full h-full object-cover" alt="" />
        ) : isAI ? (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center"><Bot className="w-4 h-4 text-primary" /></div>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
            {getInitials(member.display_name)}
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-foreground truncate">{member.display_name}</p>
      {member.title && <p className="text-[10px] text-muted-foreground truncate">{member.title}</p>}
      <div className="flex items-center justify-center gap-1 mt-1">
        {isAI && <Sparkles className="w-3 h-3 text-primary" />}
        {isPlaceholder && <Circle className="w-3 h-3 text-muted-foreground" />}
        {member.member_type === 'human' && <CheckCircle2 className="w-3 h-3 text-[hsl(var(--success))]" />}
        <span className="text-[10px] text-muted-foreground">{member.task_count ?? 0} tasks</span>
      </div>
    </div>
  );
}
