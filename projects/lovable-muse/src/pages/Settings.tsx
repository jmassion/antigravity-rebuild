import { useState } from 'react';
import { Loader2, User, Save, Download, Globe } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ExportDialog from '@/components/shared/ExportDialog';
import { useI18n, AVAILABLE_LOCALES } from '@/lib/i18n';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, locale, setLocale } = useI18n();
  const [displayName, setDisplayName] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      if (!initialized) {
        setDisplayName(data.display_name || '');
        setInitialized(true);
      }
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: t('settings.profileUpdated') });
    },
    onError: (e) => toast({ title: t('common.error'), description: e.message, variant: 'destructive' }),
  });

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    const ext = file.name.split('.').pop() || 'png';
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('assets').upload(path, file, { upsert: true });
    if (error) { toast({ title: 'Upload failed', variant: 'destructive' }); return; }
    const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(path);
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', user.id);
    if (updateError) { toast({ title: 'Update failed', variant: 'destructive' }); return; }
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    toast({ title: 'Avatar updated' });
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl">
        <h1 className="text-lg font-bold text-foreground mb-6">{t('settings.title')}</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-8">
            {/* Language Section */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><Globe className="w-4 h-4" /> {t('settings.language')}</h2>
              <p className="text-xs text-muted-foreground mb-3">{t('settings.languageDesc')}</p>
              <div className="flex gap-2">
                {AVAILABLE_LOCALES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLocale(l.code)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      locale === l.code
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-lg">{l.flag}</span>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Section */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><User className="w-4 h-4" /> {t('settings.profile')}</h2>

              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <label className="cursor-pointer group">
                    <div className="w-20 h-20 rounded-full bg-muted overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground/40">👤</div>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
                    <p className="text-[10px] text-muted-foreground text-center mt-1">{t('settings.clickToChange')}</p>
                  </label>
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">{t('settings.displayName')}</label>
                    <input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">{t('settings.email')}</label>
                    <input value={user?.email || ''} disabled
                      className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border text-sm text-muted-foreground cursor-not-allowed" />
                  </div>
                  <button
                    onClick={() => updateProfile.mutate()}
                    disabled={updateProfile.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('settings.saveChanges')}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">{t('settings.account')}</h2>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>{t('settings.userId')}: <span className="font-mono text-foreground/70">{user?.id}</span></p>
                <p>{t('settings.joined')}: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</p>
              </div>
            </div>
            {/* Export Section */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Download className="w-4 h-4" /> {t('settings.exportAll')}</h2>
              <p className="text-xs text-muted-foreground mb-3">{t('settings.exportDesc')}</p>
              <button onClick={() => setShowExport(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                <Download className="w-4 h-4" /> {t('settings.exportData')}
              </button>
            </div>
          </div>
        )}
      </div>
      <ExportDialog open={showExport} onClose={() => setShowExport(false)} />
    </AppLayout>
  );
}
