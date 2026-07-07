import { useState } from 'react';
import { FolderOpen, Unlink, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ProjectSelect from './ProjectSelect';

interface LinkedProjectsEditorProps {
  entityType: 'asset' | 'storyboard';
  entityId: string;
  /** For storyboards, the primary project_id (always linked) */
  primaryProjectId?: string;
  /** Invalidate query keys on change */
  invalidateKeys?: string[][];
  compact?: boolean;
}

export default function LinkedProjectsEditor({
  entityType,
  entityId,
  primaryProjectId,
  invalidateKeys = [],
  compact = false,
}: LinkedProjectsEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [linkProjectId, setLinkProjectId] = useState('');

  const queryKey = entityType === 'asset' ? 'asset_projects' : 'storyboard_projects';

  const { data: linkedProjects = [] } = useQuery({
    queryKey: [queryKey, entityId],
    queryFn: async () => {
      if (entityType === 'asset') {
        const { data, error } = await supabase
          .from('asset_projects')
          .select('id, project_id, projects(name)')
          .eq('asset_id', entityId);
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('storyboard_projects')
          .select('id, project_id, projects(name)')
          .eq('storyboard_id', entityId);
        if (error) throw error;
        return data;
      }
    },
    enabled: !!user,
  });

  const linkMutation = useMutation({
    mutationFn: async (projectId: string) => {
      if (entityType === 'asset') {
        const { error } = await supabase.from('asset_projects').insert({ asset_id: entityId, project_id: projectId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('storyboard_projects').insert({ storyboard_id: entityId, project_id: projectId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey, entityId] });
      for (const key of invalidateKeys) queryClient.invalidateQueries({ queryKey: key });
      setLinkProjectId('');
      toast({ title: `Linked to project` });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const unlinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      if (entityType === 'asset') {
        const { error } = await supabase.from('asset_projects').delete().eq('id', linkId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('storyboard_projects').delete().eq('id', linkId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey, entityId] });
      for (const key of invalidateKeys) queryClient.invalidateQueries({ queryKey: key });
      toast({ title: `Unlinked from project` });
    },
  });

  const linkedProjectIds = new Set(linkedProjects.map((lp: any) => lp.project_id));
  if (primaryProjectId) linkedProjectIds.add(primaryProjectId);

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <h4 className={`font-semibold text-foreground flex items-center gap-1.5 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        <FolderOpen className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        Linked Projects ({linkedProjects.length}{primaryProjectId ? ' + primary' : ''})
      </h4>

      {linkedProjects.length > 0 && (
        <div className="space-y-1">
          {linkedProjects.map((lp: any) => (
            <div key={lp.id} className="flex items-center justify-between px-2 py-1 rounded-md bg-secondary text-xs">
              <span className="text-foreground truncate">{(lp as any).projects?.name || 'Unknown'}</span>
              <button
                onClick={() => unlinkMutation.mutate(lp.id)}
                disabled={unlinkMutation.isPending}
                className="text-destructive/60 hover:text-destructive ml-2 flex-shrink-0"
                title="Unlink"
              >
                {unlinkMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
              </button>
            </div>
          ))}
        </div>
      )}

      <ProjectSelect
        value={linkProjectId}
        onChange={id => { setLinkProjectId(id); if (id) linkMutation.mutate(id); }}
        placeholder="Link to another project..."
        excludeIds={linkedProjectIds}
        size="sm"
      />
    </div>
  );
}
