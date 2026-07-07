import { useState } from 'react';
import { X, Link2, Unlink, Loader2, FolderOpen, Film } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import VersionHistory from './VersionHistory';
import VersionDiffView from './VersionDiffView';
import ProjectSelect from '@/components/shared/ProjectSelect';
import BacklinksSection from '@/components/shared/BacklinksSection';
import TagInput from '@/components/shared/TagInput';
import ProvenanceLinkDialog from '@/components/shared/ProvenanceLinkDialog';

interface AssetDetailPanelProps {
  asset: {
    id: string;
    name: string;
    file_type: string;
    file_url: string;
    thumbnail_url: string | null;
    ai_description: string | null;
    tags: string[] | null;
    ai_tags: string[] | null;
    created_at: string;
  };
  onClose: () => void;
}

export default function AssetDetailPanel({ asset, onClose }: AssetDetailPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [linkProjectId, setLinkProjectId] = useState('');
  const [diffVersions, setDiffVersions] = useState<{ a: any; b: any } | null>(null);
  const [showProvenance, setShowProvenance] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: linkedProjects = [] } = useQuery({
    queryKey: ['asset-projects', asset.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_projects')
        .select('id, project_id, folder_path, projects(name)')
        .eq('asset_id', asset.id);
      if (error) throw error;
      return data;
    },
  });

  const linkMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase.from('asset_projects').insert({ asset_id: asset.id, project_id: projectId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-projects', asset.id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setLinkProjectId('');
      toast({ title: 'Asset linked to project' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const unlinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from('asset_projects').delete().eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-projects', asset.id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Asset unlinked from project' });
    },
  });

  const linkedProjectIds = new Set(linkedProjects.map((lp: any) => lp.project_id));
  const allTags = [...(asset.tags || []), ...(asset.ai_tags || [])].filter((v, i, a) => a.indexOf(v) === i);
  const manualTags = asset.tags || [];

  const updateTagsMutation = useMutation({
    mutationFn: async (tags: string[]) => {
      const { error } = await supabase.from('assets').update({ tags }).eq('id', asset.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Tags updated' });
    },
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40" onClick={onClose}>
        <div className="h-full w-full max-w-md bg-card border-l border-border overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground truncate">{asset.name}</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>

            {asset.file_type === 'video' ? (
              <div className="rounded-lg overflow-hidden border border-border">
                <video src={asset.file_url} poster={asset.thumbnail_url || undefined} controls muted playsInline preload="metadata" className="w-full max-h-48 bg-black" />
              </div>
            ) : asset.thumbnail_url ? (
              <div className="rounded-lg overflow-hidden border border-border">
                <img src={asset.thumbnail_url} alt={asset.name} className="w-full object-cover max-h-48" />
              </div>
            ) : null}

            {asset.ai_description && <p className="text-xs text-muted-foreground">{asset.ai_description}</p>}

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {allTags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}

            {/* Manual Tags Editor */}
            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-semibold text-foreground mb-2">Tags</h3>
              <TagInput value={manualTags} onChange={(tags) => updateTagsMutation.mutate(tags)} placeholder="Add tags..." />
            </div>

            {/* Linked Projects */}
            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" /> Linked Projects ({linkedProjects.length})
              </h3>
              {linkedProjects.length === 0 ? (
                <p className="text-[11px] text-muted-foreground mb-3">Not linked to any project yet</p>
              ) : (
                <div className="space-y-1.5 mb-3">
                  {linkedProjects.map((lp: any) => (
                    <div key={lp.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-secondary text-xs">
                      <span className="text-foreground truncate">{lp.projects?.name || 'Unknown'}</span>
                      <button onClick={() => unlinkMutation.mutate(lp.id)} disabled={unlinkMutation.isPending}
                        className="text-destructive/60 hover:text-destructive ml-2 flex-shrink-0" title="Unlink from project">
                        {unlinkMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <ProjectSelect value={linkProjectId} onChange={id => { setLinkProjectId(id); if (id) linkMutation.mutate(id); }}
                  placeholder="Link to project..." excludeIds={linkedProjectIds} size="sm" className="flex-1" />
              </div>
            </div>

            {/* Provenance Links */}
            <div className="border-t border-border pt-4">
              <button onClick={() => setShowProvenance(true)} className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors">
                <Link2 className="w-3.5 h-3.5" /> Provenance Links
              </button>
            </div>

            {/* Backlinks */}
            <BacklinksSection entityType="asset" entityId={asset.id} tags={allTags} />

            {/* Version History */}
            <div className="border-t border-border pt-4">
              <VersionHistory assetId={asset.id} assetFileUrl={asset.file_url} onOpenDiff={(a, b) => setDiffVersions({ a, b })} />
            </div>
          </div>
        </div>
      </div>

      {diffVersions && <VersionDiffView versionA={diffVersions.a} versionB={diffVersions.b} onClose={() => setDiffVersions(null)} />}
      {showProvenance && <ProvenanceLinkDialog sourceType="asset" sourceId={asset.id} onClose={() => setShowProvenance(false)} />}
    </>
  );
}
