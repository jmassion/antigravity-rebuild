import { X, FolderOpen, Image, Film, CheckSquare, Loader2, ChevronRight, ExternalLink, Link2, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import BacklinksSection from '@/components/shared/BacklinksSection';
import ProjectAccessMatrix from '@/components/dashboard/ProjectAccessMatrix';
import TagInput from '@/components/shared/TagInput';

interface ProjectDetailPanelProps {
  projectId: string;
  onClose: () => void;
}

export default function ProjectDetailPanel({ projectId, onClose }: ProjectDetailPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTags = useMutation({
    mutationFn: async (tags: string[]) => {
      const { error } = await supabase.from('projects').update({ tags }).eq('id', projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-detail', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Tags updated' });
    },
  });

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project-detail', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: childProjects = [] } = useQuery({
    queryKey: ['project-children', projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('id, name, phase, thumbnail_url')
        .eq('parent_id', projectId)
        .order('name');
      return data || [];
    },
  });

  const { data: linkedAssets = [] } = useQuery({
    queryKey: ['project-assets', projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from('asset_projects')
        .select('asset_id, folder_path, assets(id, name, file_type, thumbnail_url)')
        .eq('project_id', projectId);
      return data || [];
    },
  });

  const { data: storyboards = [] } = useQuery({
    queryKey: ['project-storyboards', projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from('storyboards')
        .select('id, name, storyboard_frames(id)')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });
      return data || [];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('id, title, status, priority')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const { data: projectLinks = [] } = useQuery({
    queryKey: ['project-links', projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from('links')
        .select('id, title, url, tool_name, tags, category')
        .eq('project_id', projectId)
        .order('sort_order');
      return data || [];
    },
  });

  const { data: parentProject } = useQuery({
    queryKey: ['project-parent', project?.parent_id],
    queryFn: async () => {
      if (!project?.parent_id) return null;
      const { data } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', project.parent_id)
        .single();
      return data;
    },
    enabled: !!project?.parent_id,
  });

  const phaseColors: Record<string, string> = {
    start: 'bg-phase-start/20 text-phase-start',
    build: 'bg-phase-build/20 text-phase-build',
    grow: 'bg-phase-grow/20 text-phase-grow',
  };

  const statusColors: Record<string, string> = {
    todo: 'bg-muted text-muted-foreground',
    in_progress: 'bg-primary/10 text-primary',
    review: 'bg-phase-build/20 text-phase-build',
    done: 'bg-phase-grow/20 text-phase-grow',
  };

  const typeIcons: Record<string, string> = {
    image: '🖼️', video: '🎬', audio: '🎵', document: '📄', model: '🎮',
  };

  // Group assets by folder
  const assetsByFolder = linkedAssets.reduce<Record<string, typeof linkedAssets>>((acc, la) => {
    const folder = (la as any).folder_path || '/';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(la);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        className="h-full w-full max-w-md bg-card border-l border-border overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {loadingProject ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : project ? (
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {parentProject && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                    <FolderOpen className="w-3 h-3" />
                    <span>{parentProject.name}</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </div>
                )}
                <h2 className="text-sm font-bold text-foreground truncate">{project.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${phaseColors[project.phase]}`}>
                    {project.phase}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail */}
            {project.thumbnail_url && (
              <div className="rounded-lg overflow-hidden border border-border">
                <img src={project.thumbnail_url} alt={project.name} className="w-full object-cover max-h-48" />
              </div>
            )}

            {project.description && (
              <p className="text-xs text-muted-foreground">{project.description}</p>
            )}

            {/* Tags editor */}
            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Tags
              </h3>
              <TagInput
                value={(project as any).tags || []}
                onChange={(tags) => updateTags.mutate(tags)}
                placeholder="Add tags..."
              />
            </div>

            {/* Child Projects */}
            {childProjects.length > 0 && (
              <Section title="Child Projects" icon={FolderOpen} count={childProjects.length}>
                <div className="space-y-1.5">
                  {childProjects.map((cp: any) => (
                    <div key={cp.id} className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors">
                      {cp.thumbnail_url ? (
                        <img src={cp.thumbnail_url} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs">📁</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{cp.name}</p>
                        <span className={`text-[9px] font-bold uppercase ${phaseColors[cp.phase]}`}>{cp.phase}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Assets by folder */}
            {linkedAssets.length > 0 && (
              <Section title="Linked Assets" icon={Image} count={linkedAssets.length}>
                {Object.entries(assetsByFolder).map(([folder, items]) => (
                  <div key={folder}>
                    {Object.keys(assetsByFolder).length > 1 && (
                      <p className="text-[10px] text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" /> {folder}
                      </p>
                    )}
                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      {items.map((la: any) => (
                        <div key={la.asset_id} className="rounded-md overflow-hidden border border-border bg-muted aspect-square flex items-center justify-center group cursor-pointer hover:border-primary/30 transition-all" title={la.assets?.name}>
                          {la.assets?.thumbnail_url ? (
                            <img src={la.assets.thumbnail_url} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">{typeIcons[la.assets?.file_type] || '📄'}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Storyboards */}
            {storyboards.length > 0 && (
              <Section title="Storyboards" icon={Film} count={storyboards.length}>
                <div className="space-y-1.5">
                  {storyboards.map((sb: any) => (
                    <div key={sb.id} className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-secondary/50 text-xs">
                      <Film className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                      <span className="text-foreground truncate">{sb.name}</span>
                      <span className="text-muted-foreground ml-auto">{(sb.storyboard_frames || []).length} frames</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Tasks */}
            {tasks.length > 0 && (
              <Section title="Tasks" icon={CheckSquare} count={tasks.length}>
                <div className="space-y-1">
                  {tasks.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-secondary/50 text-xs">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[t.status] || 'bg-muted'}`} />
                      <span className="text-foreground truncate flex-1">{t.title}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">{t.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Links & Tools */}
            {projectLinks.length > 0 && (
              <Section title="Links & Tools" icon={Link2} count={projectLinks.length}>
                <div className="space-y-1.5">
                  {projectLinks.map((l: any) => (
                    <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-xs group">
                      <Link2 className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                      <span className="text-foreground truncate flex-1">{l.title}</span>
                      {l.tool_name && <span className="text-[10px] text-muted-foreground">{l.tool_name}</span>}
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {/* Access & Roles Matrix */}
            <div className="border-t border-border pt-4">
              <ProjectAccessMatrix projectId={projectId} isOwner={project?.owner_id === user?.id} />
            </div>

            {/* Backlinks */}
            <BacklinksSection entityType="project" entityId={projectId} />
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

function Section({ title, icon: Icon, count, children }: {
  title: string; icon: React.ElementType; count: number; children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-4">
      <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {title} ({count})
      </h3>
      {children}
    </div>
  );
}
