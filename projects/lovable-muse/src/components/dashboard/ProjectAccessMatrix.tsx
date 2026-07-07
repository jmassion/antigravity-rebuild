import { useState } from 'react';
import { Shield, Plus, Loader2, ChevronDown, Trash2, Check, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MiniAvatar, type PickerMember } from '@/components/team/TeamMemberPicker';

const PROJECT_ROLES = ['viewer', 'editor', 'admin', 'owner'] as const;
type ProjectRole = typeof PROJECT_ROLES[number];

const roleColors: Record<string, string> = {
  owner: 'bg-destructive/20 text-destructive border-destructive/30',
  admin: 'bg-primary/20 text-primary border-primary/30',
  editor: 'bg-accent/40 text-accent-foreground border-accent',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const PERMISSIONS = [
  { key: 'view', label: 'View project' },
  { key: 'edit_assets', label: 'Edit assets' },
  { key: 'edit_storyboards', label: 'Edit storyboards' },
  { key: 'manage_tasks', label: 'Manage tasks' },
  { key: 'manage_links', label: 'Manage links' },
  { key: 'manage_members', label: 'Manage members' },
  { key: 'delete_project', label: 'Delete project' },
] as const;

const ROLE_PERMISSIONS: Record<ProjectRole, Set<string>> = {
  viewer: new Set(['view']),
  editor: new Set(['view', 'edit_assets', 'edit_storyboards', 'manage_tasks', 'manage_links']),
  admin: new Set(['view', 'edit_assets', 'edit_storyboards', 'manage_tasks', 'manage_links', 'manage_members']),
  owner: new Set(['view', 'edit_assets', 'edit_storyboards', 'manage_tasks', 'manage_links', 'manage_members', 'delete_project']),
};

interface ProjectAccessMatrixProps {
  projectId: string;
  isOwner?: boolean;
}

export default function ProjectAccessMatrix({ projectId, isOwner = false }: ProjectAccessMatrixProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  // Fetch current project members with roles
  const { data: projectMembers = [], isLoading } = useQuery({
    queryKey: ['project-access-matrix', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_team_members')
        .select('id, role, team_member_id, team_members:team_member_id(id, display_name, avatar_url, member_type, role)')
        .eq('project_id', projectId);
      if (error) throw error;
      return (data || []).map((ptm: any) => ({
        ptm_id: ptm.id,
        role: ptm.role as ProjectRole,
        member: ptm.team_members as PickerMember,
      }));
    },
    enabled: !!user,
  });

  // Fetch available team members (not yet added)
  const { data: availableMembers = [] } = useQuery({
    queryKey: ['team-members-available', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, display_name, avatar_url, member_type, role')
        .eq('is_active', true)
        .order('display_name');
      if (error) throw error;
      return data as PickerMember[];
    },
    enabled: !!user && showAdd,
  });

  const assignedIds = new Set(projectMembers.map(pm => pm.member?.id).filter(Boolean));
  const unassigned = availableMembers.filter(m => !assignedIds.has(m.id));

  // Add member to project
  const addMember = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: ProjectRole }) => {
      const { error } = await supabase.from('project_team_members').insert({
        project_id: projectId,
        team_member_id: memberId,
        role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-access-matrix', projectId] });
      toast({ title: 'Member added to project' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  // Change role
  const changeRole = useMutation({
    mutationFn: async ({ ptmId, role }: { ptmId: string; role: ProjectRole }) => {
      const { error } = await supabase.from('project_team_members').update({ role }).eq('id', ptmId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-access-matrix', projectId] });
      toast({ title: 'Role updated' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  // Remove member
  const removeMember = useMutation({
    mutationFn: async (ptmId: string) => {
      const { error } = await supabase.from('project_team_members').delete().eq('id', ptmId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-access-matrix', projectId] });
      toast({ title: 'Member removed from project' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Access & Roles ({projectMembers.length})
        </h3>
        {isOwner && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        )}
      </div>

      {/* Add member popover */}
      {showAdd && unassigned.length > 0 && (
        <div className="rounded-md border border-border bg-secondary/50 p-2 space-y-1 max-h-40 overflow-y-auto">
          {unassigned.map(m => (
            <button
              key={m.id}
              onClick={() => { addMember.mutate({ memberId: m.id, role: 'viewer' }); }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-secondary transition-colors"
            >
              <MiniAvatar member={m} />
              <span className="truncate">{m.display_name}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {m.member_type === 'ai' ? '🤖' : m.member_type === 'placeholder' ? '👻' : ''}
              </span>
            </button>
          ))}
          {unassigned.length === 0 && (
            <p className="text-[10px] text-muted-foreground text-center py-2">All members assigned</p>
          )}
        </div>
      )}

      {/* Permission matrix */}
      {projectMembers.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-2.5 py-2 text-muted-foreground font-medium sticky left-0 bg-secondary/50 min-w-[120px]">Member</th>
                  <th className="text-left px-2.5 py-2 text-muted-foreground font-medium min-w-[80px]">Role</th>
                  {PERMISSIONS.map(p => (
                    <th key={p.key} className="text-center px-1.5 py-2 text-muted-foreground font-medium whitespace-nowrap">
                      {p.label}
                    </th>
                  ))}
                  {isOwner && <th className="w-8" />}
                </tr>
              </thead>
              <tbody>
                {projectMembers.map(pm => {
                  if (!pm.member) return null;
                  const perms = ROLE_PERMISSIONS[pm.role] || ROLE_PERMISSIONS.viewer;
                  return (
                    <tr key={pm.ptm_id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-2.5 py-2 sticky left-0 bg-card">
                        <div className="flex items-center gap-1.5">
                          <MiniAvatar member={pm.member} />
                          <span className="font-medium text-foreground truncate max-w-[80px]">{pm.member.display_name}</span>
                        </div>
                      </td>
                      <td className="px-2.5 py-2">
                        {isOwner ? (
                          <RoleDropdown
                            value={pm.role}
                            onChange={(role) => changeRole.mutate({ ptmId: pm.ptm_id, role })}
                          />
                        ) : (
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${roleColors[pm.role] || roleColors.viewer}`}>
                            {pm.role}
                          </Badge>
                        )}
                      </td>
                      {PERMISSIONS.map(p => (
                        <td key={p.key} className="text-center px-1.5 py-2">
                          {perms.has(p.key) ? (
                            <Check className="w-3.5 h-3.5 text-primary mx-auto" />
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                      ))}
                      {isOwner && (
                        <td className="px-1.5 py-2">
                          <button
                            onClick={() => removeMember.mutate(pm.ptm_id)}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">No members assigned to this project yet.</p>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 pt-1">
        {PROJECT_ROLES.map(r => (
          <div key={r} className="flex items-center gap-1">
            <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ${roleColors[r]}`}>{r}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleDropdown({ value, onChange }: { value: ProjectRole; onChange: (role: ProjectRole) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-medium transition-colors ${roleColors[value]}`}>
          {value}
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-28 p-1" align="start">
        {PROJECT_ROLES.map(r => (
          <button
            key={r}
            onClick={() => { onChange(r); setOpen(false); }}
            className={`w-full text-left px-2 py-1.5 rounded text-[10px] hover:bg-secondary transition-colors flex items-center justify-between ${r === value ? 'text-primary font-medium' : 'text-foreground'}`}
          >
            {r}
            {r === value && <Check className="w-3 h-3 text-primary" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export { PROJECT_ROLES, ROLE_PERMISSIONS, PERMISSIONS };
export type { ProjectRole };
