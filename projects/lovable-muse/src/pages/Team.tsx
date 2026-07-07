import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, X, Search, Users, LayoutGrid, List, GitBranch, Globe2, Mail, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import TeamMemberCard, { type TeamMember } from '@/components/team/TeamMemberCard';
import ClaimDialog from '@/components/team/ClaimDialog';
import AccountabilityChart from '@/components/team/AccountabilityChart';
import ProjectSelect from '@/components/shared/ProjectSelect';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';

type ViewMode = 'grid' | 'list' | 'chart';
type FilterType = 'all' | 'human' | 'ai' | 'placeholder';

const roleOptions = ['super_admin', 'admin', 'manager', 'member', 'viewer'];
const typeOptions: { value: string; label: string }[] = [
  { value: 'human', label: 'Human' },
  { value: 'ai', label: 'AI Agent' },
  { value: 'placeholder', label: 'Placeholder' },
];

export default function Team() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [claimTarget, setClaimTarget] = useState<TeamMember | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('placeholder');
  const [formRole, setFormRole] = useState('member');
  const [formTitle, setFormTitle] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formProject, setFormProject] = useState('');
  const [formProjectIds, setFormProjectIds] = useState<string[]>([]);
  const [formEmail, setFormEmail] = useState('');
  const [sendInvite, setSendInvite] = useState(false);
  const [inviting, setInviting] = useState(false);

  const resetForm = () => {
    setFormName(''); setFormType('placeholder'); setFormRole('member');
    setFormTitle(''); setFormBio(''); setFormProject('');
    setFormProjectIds([]); setEditing(null); setShowCreate(false);
    setFormEmail(''); setSendInvite(false);
  };

  const openEdit = (m: TeamMember) => {
    setFormName(m.display_name); setFormType(m.member_type); setFormRole(m.role);
    setFormTitle(m.title || ''); setFormBio(m.bio || ''); setFormProject(m.primary_project_id || '');
    setFormProjectIds(m.project_ids || []);
    setEditing(m); setShowCreate(true);
  };

  // Fetch all projects for multi-select
  const { data: allProjects = [] } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('id, name').order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*, projects:primary_project_id(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Get task counts
      const { data: taskCounts } = await supabase
        .from('tasks')
        .select('assignee_id');
      const counts: Record<string, number> = {};
      (taskCounts || []).forEach((t: any) => { if (t.assignee_id) counts[t.assignee_id] = (counts[t.assignee_id] || 0) + 1; });

      // Get project_team_members for cross-project assignments
      const { data: ptm } = await supabase
        .from('project_team_members')
        .select('team_member_id, project_id, projects:project_id(name)');
      const ptmMap: Record<string, { project_id: string; name: string }[]> = {};
      (ptm || []).forEach((r: any) => {
        if (!ptmMap[r.team_member_id]) ptmMap[r.team_member_id] = [];
        ptmMap[r.team_member_id].push({ project_id: r.project_id, name: (r.projects as any)?.name || '' });
      });

      return (data || []).map((m: any) => ({
        ...m,
        primary_project: m.projects,
        task_count: counts[m.id] || 0,
        assigned_projects: ptmMap[m.id] || [],
        project_ids: (ptmMap[m.id] || []).map((p: any) => p.project_id),
      })) as TeamMember[];
    },
    enabled: !!user,
  });

  const saveMember = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const payload = {
        display_name: formName,
        member_type: formType,
        role: formRole,
        title: formTitle || null,
        bio: formBio || null,
        primary_project_id: formProject || null,
        owner_id: user.id,
      };

      let memberId = editing?.id;

      if (editing) {
        const { error } = await supabase.from('team_members').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const insertPayload: any = { ...payload };
        if (formType === 'human') insertPayload.user_id = user.id;
        const { data, error } = await supabase.from('team_members').insert(insertPayload).select('id').single();
        if (error) throw error;
        memberId = data.id;
      }

      // Sync project_team_members for cross-project assignment
      if (memberId) {
        // Remove old assignments
        await supabase.from('project_team_members').delete().eq('team_member_id', memberId);
        // Insert new ones
        if (formProjectIds.length > 0) {
          const rows = formProjectIds.map(pid => ({
            team_member_id: memberId!,
            project_id: pid,
            role: formRole,
          }));
          const { error: ptmErr } = await supabase.from('project_team_members').insert(rows);
          if (ptmErr) throw ptmErr;
        }
      }
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: editing ? 'Member updated' : 'Member created' });

      // Send invite email if requested (only on create)
      if (!editing && sendInvite && formEmail.trim()) {
        setInviting(true);
        try {
          const { data, error } = await supabase.functions.invoke('invite-member', {
            body: { email: formEmail.trim(), teamMemberName: formName, role: formRole },
          });
          if (error) throw error;
          if (data?.already_registered) {
            toast({ title: 'User already registered', description: `${formEmail} already has an account.` });
          } else {
            toast({ title: 'Invite sent', description: `Invitation emailed to ${formEmail}` });
          }
        } catch (e: any) {
          toast({ title: 'Invite failed', description: e.message, variant: 'destructive' });
        } finally {
          setInviting(false);
        }
      }
      resetForm();
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      // Clean up project assignments first
      await supabase.from('project_team_members').delete().eq('team_member_id', id);
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-members'] }); toast({ title: 'Member removed' }); },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const openClaim = (m: TeamMember) => setClaimTarget(m);

  const toggleProjectId = (pid: string) => {
    setFormProjectIds(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const filtered = members.filter(m => {
    if (filterType !== 'all' && m.member_type !== filterType) return false;
    if (search && !m.display_name.toLowerCase().includes(search.toLowerCase()) &&
        !(m.title || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const viewIcons = [
    { key: 'grid' as const, icon: LayoutGrid },
    { key: 'list' as const, icon: List },
    { key: 'chart' as const, icon: GitBranch },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2"><Users className="w-5 h-5" /> {t('team.title')}</h1>
            <p className="text-xs text-muted-foreground mt-1">{t('team.subtitle')}</p>
          </div>
          <button onClick={() => { resetForm(); setShowCreate(true); }}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Member
          </button>
        </div>

        {/* Create/Edit form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">{editing ? 'Edit Member' : 'New Team Member'}</h3>
                <button onClick={resetForm}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Display name *"
                  className="px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Job title (e.g. Lead Animator)"
                  className="px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                <select value={formType} onChange={e => setFormType(e.target.value)}
                  className="px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
                  {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <select value={formRole} onChange={e => setFormRole(e.target.value)}
                  className="px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
                  {roleOptions.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
                <ProjectSelect value={formProject} onChange={setFormProject} placeholder="Primary project (optional)" className="col-span-1" />

                {/* Cross-project assignment */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5" /> Assign to projects
                    {formType === 'placeholder' && <span className="text-primary">(cross-project placeholder)</span>}
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-md bg-secondary border border-border min-h-[40px]">
                    {allProjects.map(p => {
                      const selected = formProjectIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleProjectId(p.id)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-all border ${
                            selected
                              ? 'bg-primary/15 text-primary border-primary/30'
                              : 'bg-card text-muted-foreground border-border hover:border-primary/20 hover:text-foreground'
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                    {allProjects.length === 0 && (
                      <span className="text-xs text-muted-foreground">No projects yet</span>
                    )}
                  </div>
                </div>

                {/* Optional email invite (only on create) */}
                {!editing && (
                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendInvite}
                        onChange={e => setSendInvite(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Send email invite
                      </span>
                    </label>
                    {sendInvite && (
                      <input
                        type="email"
                        value={formEmail}
                        onChange={e => setFormEmail(e.target.value)}
                        placeholder="team@example.com"
                        className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                      />
                    )}
                  </div>
                )}

                <textarea value={formBio} onChange={e => setFormBio(e.target.value)} placeholder="Bio / notes" rows={2}
                  className="col-span-1 sm:col-span-2 px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>
              <button onClick={() => saveMember.mutate()} disabled={!formName.trim() || saveMember.isPending || inviting}
                className="mt-3 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                {(saveMember.isPending || inviting) && <Loader2 className="w-4 h-4 animate-spin" />}
                {inviting ? 'Sending invite…' : editing ? 'Update' : sendInvite && formEmail ? 'Create & Invite' : 'Create'}
                {sendInvite && formEmail && !editing && <Send className="w-3.5 h-3.5 ml-1" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1 rounded-md border border-border bg-secondary p-0.5">
            {viewIcons.map(v => (
              <button key={v.key} onClick={() => setView(v.key)}
                className={`p-1.5 rounded transition-colors ${view === v.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <v.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-md border border-border bg-secondary p-0.5">
            {(['all', 'human', 'ai', 'placeholder'] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${filterType === t ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                {t === 'all' ? 'All' : t === 'ai' ? 'AI' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative ml-auto">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
              className="pl-8 pr-3 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary w-48" />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : view === 'chart' ? (
          <AccountabilityChart members={filtered} />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <TeamMemberCard member={m} onEdit={openEdit} onDelete={id => deleteMember.mutate(id)} onClaim={openClaim} />
              </motion.div>
            ))}
            {filtered.length === 0 && <p className="col-span-full text-center text-sm text-muted-foreground py-12">No team members found</p>}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Member</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Type</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Role</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Title</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Tasks</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Projects</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => navigate(`/team/${m.id}`)}>
                    <td className="px-3 py-2.5 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-border flex-shrink-0">
                        {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                            {m.display_name[0]}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-foreground">{m.display_name}</span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{m.member_type}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{m.role.replace('_', ' ')}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{m.title || '—'}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{m.task_count ?? 0}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        {(m.assigned_projects || []).slice(0, 3).map((p: any) => (
                          <Badge key={p.project_id} variant="outline" className="text-[9px] px-1 py-0 h-4">{p.name}</Badge>
                        ))}
                        {(m.assigned_projects || []).length > 3 && (
                          <span className="text-[9px] text-muted-foreground">+{(m.assigned_projects || []).length - 3}</span>
                        )}
                        {(m.assigned_projects || []).length === 0 && <span className="text-muted-foreground">—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No team members found</p>}
          </div>
        )}
      </div>
      <ClaimDialog member={claimTarget} open={!!claimTarget} onClose={() => setClaimTarget(null)} />
    </AppLayout>
  );
}
