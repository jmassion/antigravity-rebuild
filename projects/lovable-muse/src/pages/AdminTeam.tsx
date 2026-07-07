import { useState } from 'react';
import { Shield, Users, Plus, Loader2, History, UserPlus, AlertTriangle, Search, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const ROLES = ['super_admin', 'admin', 'manager', 'member', 'viewer'] as const;
type AppRole = typeof ROLES[number];

const roleColors: Record<string, string> = {
  super_admin: 'bg-destructive/20 text-destructive border-destructive/30',
  admin: 'bg-primary/20 text-primary border-primary/30',
  manager: 'bg-accent/40 text-accent-foreground border-accent',
  member: 'bg-secondary text-secondary-foreground border-border',
  viewer: 'bg-muted text-muted-foreground border-border',
};

type Tab = 'members' | 'audit';

export default function AdminTeam() {
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('members');
  const [search, setSearch] = useState('');
  const [showBulkInvite, setShowBulkInvite] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkRole, setBulkRole] = useState<AppRole>('member');

  // --- All users with roles ---
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['admin-members'],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, created_at');
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rErr) throw rErr;

      const roleMap: Record<string, AppRole[]> = {};
      (roles || []).forEach((r: any) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });

      return (profiles || []).map((p: any) => ({
        ...p,
        roles: roleMap[p.user_id] || [],
        highest_role: roleMap[p.user_id]?.[0] || 'member',
      }));
    },
    enabled: isAdmin,
  });

  // --- Audit log ---
  const { data: auditLog = [], isLoading: auditLoading } = useQuery({
    queryKey: ['role-audit-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin && tab === 'audit',
  });

  // --- Change role ---
  const changeRole = useMutation({
    mutationFn: async ({ targetUserId, newRole, previousRole }: { targetUserId: string; newRole: AppRole; previousRole: string | null }) => {
      if (!user) throw new Error('Not authenticated');

      // Remove existing roles for user
      await supabase.from('user_roles').delete().eq('user_id', targetUserId);

      // Insert new role
      const { error } = await supabase.from('user_roles').insert({ user_id: targetUserId, role: newRole });
      if (error) throw error;

      // Audit log
      await supabase.from('role_audit_log').insert({
        target_user_id: targetUserId,
        changed_by: user.id,
        previous_role: previousRole,
        new_role: newRole,
        action: 'assign',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['role-audit-log'] });
      toast({ title: 'Role updated' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  // --- Bulk invite ---
  const bulkInvite = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const emails = bulkEmails.split(/[\n,;]+/).map(e => e.trim().toLowerCase()).filter(Boolean);
      if (!emails.length) throw new Error('No valid emails');

      const results: { email: string; success: boolean; error?: string }[] = [];

      for (const email of emails) {
        try {
          // Sign up the user (they'll get a confirmation email)
          const { data: signUpData, error: signUpError } = await supabase.auth.admin
            ? { data: null, error: new Error('Use edge function') }
            : await supabase.auth.signUp({
                email,
                password: crypto.randomUUID(), // temp password, user resets via email
                options: { data: { display_name: email, invited_by: user.id } },
              });

          if (signUpError) {
            results.push({ email, success: false, error: signUpError.message });
            continue;
          }

          const newUserId = signUpData?.user?.id;
          if (newUserId) {
            await supabase.from('user_roles').insert({ user_id: newUserId, role: bulkRole });
            await supabase.from('role_audit_log').insert({
              target_user_id: newUserId,
              changed_by: user.id,
              new_role: bulkRole,
              action: 'bulk_invite',
              note: `Invited via bulk invite`,
            });
          }
          results.push({ email, success: true });
        } catch (err: any) {
          results.push({ email, success: false, error: err.message });
        }
      }

      const failed = results.filter(r => !r.success);
      if (failed.length) {
        throw new Error(`${results.length - failed.length} invited, ${failed.length} failed: ${failed.map(f => f.email).join(', ')}`);
      }
      return results;
    },
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: ['admin-members'] });
      qc.invalidateQueries({ queryKey: ['role-audit-log'] });
      toast({ title: `${results.length} user(s) invited` });
      setBulkEmails('');
      setShowBulkInvite(false);
    },
    onError: (e) => toast({ title: 'Invite result', description: e.message, variant: 'destructive' }),
  });

  // --- Guard ---
  if (adminLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
    </AppLayout>
  );

  if (!isAdmin) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-3">
        <AlertTriangle className="w-10 h-10 text-destructive" />
        <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground max-w-md">You need admin or super_admin privileges to access this page.</p>
      </div>
    </AppLayout>
  );

  const filtered = members.filter((m: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.display_name?.toLowerCase().includes(q) || m.user_id?.includes(q);
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5" /> Admin: Team & Roles
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Manage user roles, bulk invite, and view audit trail</p>
          </div>
          <button
            onClick={() => setShowBulkInvite(!showBulkInvite)}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-4 h-4" /> Bulk Invite
          </button>
        </div>

        {/* Bulk Invite Panel */}
        <AnimatePresence>
          {showBulkInvite && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 rounded-lg border border-border bg-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Bulk Invite Users
                </h3>
                <p className="text-xs text-muted-foreground mb-3">Enter email addresses separated by commas, semicolons, or new lines. Each user will receive a signup confirmation email.</p>
                <textarea
                  value={bulkEmails}
                  onChange={e => setBulkEmails(e.target.value)}
                  placeholder="user1@example.com, user2@example.com&#10;user3@example.com"
                  rows={4}
                  className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none mb-3"
                />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Assign role:</label>
                    <select
                      value={bulkRole}
                      onChange={e => setBulkRole(e.target.value as AppRole)}
                      className="px-2 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => bulkInvite.mutate()}
                    disabled={!bulkEmails.trim() || bulkInvite.isPending}
                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {bulkInvite.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Invites
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-6 border-b border-border">
          <button
            onClick={() => setTab('members')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${tab === 'members' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Users className="w-4 h-4 inline mr-1.5" />Members ({members.length})
          </button>
          <button
            onClick={() => setTab('audit')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${tab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <History className="w-4 h-4 inline mr-1.5" />Audit Log
          </button>
        </div>

        {/* Members Tab */}
        {tab === 'members' && (
          <>
            <div className="mb-4 relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or ID..."
                className="pl-8 pr-3 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary w-72"
              />
            </div>

            {membersLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">User</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Role</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Joined</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium w-48">Change Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m: any) => (
                      <tr key={m.user_id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-border flex-shrink-0 bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {m.avatar_url ? (
                              <img src={m.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              (m.display_name || '?')[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{m.display_name || 'Unknown'}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{m.user_id?.slice(0, 8)}...</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {m.roles.length ? m.roles.map((r: string) => (
                              <Badge key={r} variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${roleColors[r] || roleColors.member}`}>
                                {r.replace('_', ' ')}
                              </Badge>
                            )) : (
                              <span className="text-muted-foreground italic">no role</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {m.user_id === user?.id ? (
                            <span className="text-muted-foreground italic">You</span>
                          ) : (
                            <RoleSelector
                              currentRole={m.highest_role}
                              onSelect={(newRole) => changeRole.mutate({
                                targetUserId: m.user_id,
                                newRole,
                                previousRole: m.highest_role,
                              })}
                              disabled={changeRole.isPending}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">No users found</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Audit Tab */}
        {tab === 'audit' && (
          auditLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : auditLog.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">No audit entries yet</p>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Time</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Action</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Target User</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Change</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">By</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((log: any) => (
                    <tr key={log.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">
                        {log.target_user_id?.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-muted-foreground">{log.previous_role || '—'}</span>
                        <span className="mx-1 text-muted-foreground">→</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${roleColors[log.new_role] || roleColors.member}`}>
                          {log.new_role?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">
                        {log.changed_by?.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[200px]">
                        {log.note || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </AppLayout>
  );
}

function RoleSelector({ currentRole, onSelect, disabled }: {
  currentRole: string;
  onSelect: (role: AppRole) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary border border-border text-xs text-foreground hover:bg-secondary/80 disabled:opacity-50"
      >
        {currentRole.replace('_', ' ')}
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[120px]">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => { onSelect(r); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors ${r === currentRole ? 'text-primary font-medium' : 'text-foreground'}`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
