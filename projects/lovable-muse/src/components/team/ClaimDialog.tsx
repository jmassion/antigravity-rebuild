import { useState, useRef } from 'react';
import { Loader2, Upload, User, CheckCircle2, FolderOpen, ListChecks, Film, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { TeamMember } from '@/components/team/TeamMemberCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ClaimDialogProps {
  member: TeamMember | null;
  open: boolean;
  onClose: () => void;
}

export default function ClaimDialog({ member, open, onClose }: ClaimDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [step, setStep] = useState<'profile' | 'review'>('profile');

  // Reset state when member changes
  const resetState = () => {
    setDisplayName(member?.display_name || '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setStep('profile');
  };

  // Fetch assignments that will transfer
  const { data: assignments } = useQuery({
    queryKey: ['claim-assignments', member?.id],
    queryFn: async () => {
      if (!member) return { tasks: [], frames: [], projects: [] };

      const [tasksRes, framesRes, projectsRes] = await Promise.all([
        supabase.from('tasks').select('id, title, status, projects:project_id(name)').eq('assignee_id', member.id),
        supabase.from('storyboard_frames').select('id, title, storyboards:storyboard_id(name)').eq('assignee_id', member.id),
        supabase.from('project_team_members').select('project_id, role, projects:project_id(name)').eq('team_member_id', member.id),
      ]);

      return {
        tasks: tasksRes.data || [],
        frames: framesRes.data || [],
        projects: projectsRes.data || [],
      };
    },
    enabled: !!member && open,
  });

  const handleAvatarSelect = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const claim = useMutation({
    mutationFn: async () => {
      if (!user || !member) throw new Error('Missing data');

      let avatarUrl = member.avatar_url;

      // Upload avatar if provided
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop() || 'png';
        const path = `${user.id}/team-avatar-${member.id}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('assets')
          .upload(path, avatarFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(path);
        avatarUrl = publicUrl;
      }

      // Claim the placeholder
      const { error } = await supabase.from('team_members').update({
        user_id: user.id,
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
        member_type: 'human',
        display_name: displayName.trim() || member.display_name,
        avatar_url: avatarUrl,
      }).eq('id', member.id);
      if (error) throw error;

      // All tasks, frames, project_team_members reference member.id
      // so they transfer automatically — no re-linking needed.
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Claimed successfully!', description: `${assignments?.tasks.length || 0} tasks, ${assignments?.frames.length || 0} frames, and ${assignments?.projects.length || 0} project roles transferred to you.` });
      onClose();
    },
    onError: (e) => toast({ title: 'Claim failed', description: e.message, variant: 'destructive' }),
  });

  const taskCount = assignments?.tasks.length || 0;
  const frameCount = assignments?.frames.length || 0;
  const projectCount = assignments?.projects.length || 0;
  const totalTransfers = taskCount + frameCount + projectCount;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); else resetState(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Claim Placeholder
          </DialogTitle>
        </DialogHeader>

        {!member ? null : step === 'profile' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <p className="text-xs text-muted-foreground">
              You're claiming <span className="font-semibold text-foreground">{member.display_name}</span>. Customize your profile before completing.
            </p>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-primary/50 transition-colors overflow-hidden bg-muted flex-shrink-0 group"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} className="w-full h-full object-cover" />
                ) : member.avatar_url ? (
                  <img src={member.avatar_url} className="w-full h-full object-cover opacity-50" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarSelect(f); }}
              />
              <div className="flex-1 space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Display Name</label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder={member.display_name}
                  className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Transfer summary preview */}
            {totalTransfers > 0 && (
              <div className="rounded-md border border-border bg-secondary/50 p-3">
                <p className="text-xs font-medium text-foreground mb-2">Will be transferred to you:</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {taskCount > 0 && (
                    <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" />{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
                  )}
                  {frameCount > 0 && (
                    <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5" />{frameCount} frame{frameCount !== 1 ? 's' : ''}</span>
                  )}
                  {projectCount > 0 && (
                    <span className="flex items-center gap-1"><FolderOpen className="w-3.5 h-3.5" />{projectCount} project{projectCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button
                onClick={() => setStep('review')}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                Review & Claim
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Review step */}
            <div className="flex items-center gap-3 p-3 rounded-md bg-secondary/50 border border-border">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} className="w-full h-full object-cover" />
                ) : member.avatar_url ? (
                  <img src={member.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                    {(displayName || member.display_name)[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{displayName.trim() || member.display_name}</p>
                <p className="text-[10px] text-muted-foreground">Replacing placeholder: {member.display_name}</p>
              </div>
            </div>

            {/* Detailed transfer list */}
            {(assignments?.tasks.length || 0) > 0 && (
              <div>
                <h4 className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-primary" /> Tasks ({assignments!.tasks.length})
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {assignments!.tasks.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1 rounded bg-secondary/50">
                      <span className="truncate flex-1">{t.title}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{t.status}</Badge>
                      {t.projects?.name && <span className="text-[9px] text-muted-foreground/70">📂 {t.projects.name}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(assignments?.frames.length || 0) > 0 && (
              <div>
                <h4 className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-primary" /> Frames ({assignments!.frames.length})
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {assignments!.frames.map((f: any) => (
                    <div key={f.id} className="text-xs text-muted-foreground px-2 py-1 rounded bg-secondary/50">
                      {f.title || 'Untitled'} — {f.storyboards?.name || 'Unknown storyboard'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(assignments?.projects.length || 0) > 0 && (
              <div>
                <h4 className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-primary" /> Project Roles ({assignments!.projects.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {assignments!.projects.map((p: any) => (
                    <Badge key={p.project_id} variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                      {p.projects?.name || 'Unknown'} ({p.role})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {totalTransfers === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">No existing assignments to transfer.</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setStep('profile')} className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
                Back
              </button>
              <button
                onClick={() => claim.mutate()}
                disabled={claim.isPending}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {claim.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <CheckCircle2 className="w-4 h-4" />
                Confirm Claim
              </button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
