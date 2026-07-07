import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Bot, CheckCircle2, Circle, Sparkles, User, Pencil, Shield,
  FolderOpen, CheckSquare, Film, Clock, Loader2, Activity, Lock, AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const roleColors: Record<string, string> = {
  super_admin: 'bg-destructive/20 text-destructive border-destructive/30',
  admin: 'bg-primary/20 text-primary border-primary/30',
  manager: 'bg-[hsl(var(--info))]/20 text-[hsl(var(--info))] border-[hsl(var(--info))]/30',
  member: 'bg-secondary text-secondary-foreground border-border',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const typeConfig: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  human: { icon: CheckCircle2, label: 'Human', className: 'text-[hsl(var(--success))]' },
  ai: { icon: Sparkles, label: 'AI Agent', className: 'text-primary' },
  placeholder: { icon: Circle, label: 'Placeholder', className: 'text-muted-foreground' },
};

const priorityColors: Record<string, string> = {
  urgent: 'text-destructive',
  high: 'text-[hsl(var(--warning))]',
  medium: 'text-foreground',
  low: 'text-muted-foreground',
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function TeamMemberDetail() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch member
  const { data: member, isLoading } = useQuery({
    queryKey: ['team-member', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*, projects:primary_project_id(name)')
        .eq('id', memberId!)
        .single();
      if (error) throw error;
      return { ...data, primary_project: data.projects } as any;
    },
    enabled: !!memberId && !!user,
  });

  // Fetch project assignments
  const { data: projectAssignments = [] } = useQuery({
    queryKey: ['member-projects', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_team_members')
        .select('role, project_id, projects:project_id(name, phase, thumbnail_url)')
        .eq('team_member_id', memberId!);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        project_id: r.project_id,
        role: r.role,
        name: r.projects?.name || '',
        phase: r.projects?.phase || 'start',
        thumbnail_url: r.projects?.thumbnail_url,
      }));
    },
    enabled: !!memberId && !!user,
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['member-tasks', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status, priority, due_date, project_id, projects:project_id(name)')
        .eq('assignee_id', memberId!)
        .order('updated_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map((t: any) => ({ ...t, project_name: t.projects?.name }));
    },
    enabled: !!memberId && !!user,
  });

  // Fetch frames
  const { data: frames = [] } = useQuery({
    queryKey: ['member-frames', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storyboard_frames')
        .select('id, title, status, sort_order, storyboard_id, asset_id, assets:asset_id(thumbnail_url, name), storyboards:storyboard_id(name)')
        .eq('assignee_id', memberId!)
        .order('sort_order')
        .limit(50);
      if (error) throw error;
      return (data || []).map((f: any) => ({
        ...f,
        thumbnail_url: f.assets?.thumbnail_url,
        asset_name: f.assets?.name,
        storyboard_name: f.storyboards?.name,
      }));
    },
    enabled: !!memberId && !!user,
  });

  // Fetch audit log (only if member has user_id)
  const { data: auditLog = [] } = useQuery({
    queryKey: ['member-audit', member?.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_audit_log')
        .select('*')
        .eq('target_user_id', member!.user_id!)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!member?.user_id && !!user,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Team member not found</p>
          <Link to="/team" className="text-xs text-primary hover:underline">← Back to Team</Link>
        </div>
      </AppLayout>
    );
  }

  const ti = typeConfig[member.member_type] || typeConfig.placeholder;
  const TypeIcon = ti.icon;
  const isPlaceholder = member.member_type === 'placeholder';
  const isAI = member.member_type === 'ai';

  // Task stats
  const tasksByStatus: Record<string, typeof tasks> = { todo: [], in_progress: [], review: [], done: [] };
  tasks.forEach(t => {
    const s = tasksByStatus[t.status] ? t.status : 'todo';
    tasksByStatus[s].push(t);
  });

  const phaseColors: Record<string, string> = {
    start: 'bg-[hsl(var(--phase-start))]/15 text-[hsl(var(--phase-start))] border-[hsl(var(--phase-start))]/30',
    build: 'bg-primary/15 text-primary border-primary/30',
    grow: 'bg-[hsl(var(--phase-grow))]/15 text-[hsl(var(--phase-grow))] border-[hsl(var(--phase-grow))]/30',
  };

  // Build timeline items
  const timeline: { label: string; time: string; icon: React.ElementType }[] = [];
  if (member.claimed_at) {
    timeline.push({ label: `Claimed placeholder "${member.display_name}"`, time: member.claimed_at, icon: User });
  }
  auditLog.forEach((a: any) => {
    timeline.push({
      label: `Role ${a.action}: ${a.previous_role || '–'} → ${a.new_role}${a.note ? ` (${a.note})` : ''}`,
      time: a.created_at,
      icon: Shield,
    });
  });
  timeline.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <AppLayout>
      <div className="p-6 max-w-[1200px] space-y-6">
        {/* Breadcrumb + actions */}
        <div className="flex items-center justify-between">
          <Link to="/team" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Team
          </Link>
          <div className="flex items-center gap-2">
            {!member.is_active && (
              <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">Inactive</Badge>
            )}
          </div>
        </div>

        {/* Hero Header */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-5">
            {/* Large Avatar */}
            <div className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 ${
              isPlaceholder ? 'border-2 border-dashed border-muted-foreground/40' : 'border-2 border-border'
            }`}>
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.display_name} className="w-full h-full object-cover" />
              ) : isAI ? (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                  {getInitials(member.display_name)}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full border-2 border-card flex items-center justify-center bg-card">
                <TypeIcon className={`w-3.5 h-3.5 ${ti.className}`} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground">{member.display_name}</h1>
              {member.title && <p className="text-sm text-muted-foreground mt-0.5">{member.title}</p>}

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={`text-xs px-2 py-0.5 ${roleColors[member.role] || roleColors.member}`}>
                  {member.role.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-transparent">
                  {ti.label}
                </Badge>
                {member.is_active ? (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 border-[hsl(var(--success))]/30 text-[hsl(var(--success))]">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 border-destructive/30 text-destructive">Inactive</Badge>
                )}
              </div>

              {member.bio && (
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-xl">{member.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tasks', value: tasks.length, icon: CheckSquare },
            { label: 'Projects', value: projectAssignments.length, icon: FolderOpen },
            { label: 'Frames', value: frames.length, icon: Film },
            { label: 'Timeline', value: timeline.length, icon: Activity },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabbed sections */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="frames">Frames</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
          </TabsList>

          {/* PROJECTS */}
          <TabsContent value="projects">
            {projectAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No project assignments</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projectAssignments.map((p: any) => (
                  <Card key={p.project_id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate('/projects')}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary border border-border overflow-hidden flex-shrink-0">
                        {p.thumbnail_url ? (
                          <img src={p.thumbnail_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><FolderOpen className="w-5 h-5 text-muted-foreground" /></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${phaseColors[p.phase] || ''}`}>
                            {p.phase}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{p.role}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TASKS */}
          <TabsContent value="tasks">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No tasks assigned</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(['todo', 'in_progress', 'review', 'done'] as const).map(status => (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {status.replace('_', ' ')}
                      </p>
                      <span className="text-[10px] text-muted-foreground">{tasksByStatus[status]?.length || 0}</span>
                    </div>
                    <div className="space-y-1.5 min-h-[60px]">
                      {(tasksByStatus[status] || []).map((t: any) => (
                        <div key={t.id} className="rounded-lg border border-border bg-card p-2.5 hover:border-primary/30 transition-colors">
                          <p className="text-xs font-medium text-foreground truncate">{t.title}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`text-[10px] font-medium ${priorityColors[t.priority] || ''}`}>
                              {t.priority}
                            </span>
                            {t.due_date && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {formatDistanceToNow(new Date(t.due_date), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                          {t.project_name && (
                            <p className="text-[10px] text-muted-foreground mt-1 truncate">📂 {t.project_name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* FRAMES */}
          <TabsContent value="frames">
            {frames.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No frames assigned</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {frames.map((f: any) => (
                  <div key={f.id} className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors">
                    <div className="aspect-video bg-secondary flex items-center justify-center">
                      {f.thumbnail_url ? (
                        <img src={f.thumbnail_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Film className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-medium text-foreground truncate">{f.title || `Frame ${f.sort_order + 1}`}</p>
                      {f.storyboard_name && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">🎬 {f.storyboard_name}</p>
                      )}
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 mt-1">{f.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TIMELINE */}
          <TabsContent value="timeline">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No activity recorded</p>
            ) : (
              <div className="space-y-0">
                {timeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ACCESS */}
          <TabsContent value="access">
            {projectAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No access permissions</p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Project</th>
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Phase</th>
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectAssignments.map((p: any) => (
                      <tr key={p.project_id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-foreground flex items-center gap-2">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                          {p.name}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${phaseColors[p.phase] || ''}`}>
                            {p.phase}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${roleColors[p.role] || roleColors.member}`}>
                            {p.role}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
