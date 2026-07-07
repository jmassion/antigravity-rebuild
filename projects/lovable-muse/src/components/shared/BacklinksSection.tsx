import { FolderOpen, Film, Tag, Upload, ChevronRight, CheckSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BacklinksSectionProps {
  entityType: 'asset' | 'project' | 'storyboard';
  entityId: string;
  tags?: string[];
}

export default function BacklinksSection({ entityType, entityId, tags = [] }: BacklinksSectionProps) {
  // Asset backlinks: projects, storyboard frames, upload logs
  const { data: linkedProjects = [] } = useQuery({
    queryKey: ['backlinks-projects', entityType, entityId],
    queryFn: async () => {
      if (entityType !== 'asset') return [];
      const { data } = await supabase
        .from('asset_projects')
        .select('project_id, folder_path, projects(name, parent_id)')
        .eq('asset_id', entityId);
      return data || [];
    },
    enabled: entityType === 'asset',
  });

  const { data: linkedFrames = [] } = useQuery({
    queryKey: ['backlinks-frames', entityType, entityId],
    queryFn: async () => {
      if (entityType !== 'asset') return [];
      const { data } = await supabase
        .from('storyboard_frames')
        .select('id, title, sort_order, storyboard_id, storyboards(name, projects(name))')
        .eq('asset_id', entityId);
      return data || [];
    },
    enabled: entityType === 'asset',
  });

  const { data: uploadLog } = useQuery({
    queryKey: ['backlinks-upload', entityType, entityId],
    queryFn: async () => {
      if (entityType !== 'asset') return null;
      const { data } = await supabase
        .from('upload_logs')
        .select('*')
        .eq('asset_id', entityId)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: entityType === 'asset',
  });

  // Project backlinks: child projects, linked assets, storyboards, tasks, parent chain
  const { data: childProjects = [] } = useQuery({
    queryKey: ['backlinks-children', entityType, entityId],
    queryFn: async () => {
      if (entityType !== 'project') return [];
      const { data } = await supabase
        .from('projects')
        .select('id, name')
        .eq('parent_id', entityId);
      return data || [];
    },
    enabled: entityType === 'project',
  });

  const { data: projectAssets = [] } = useQuery({
    queryKey: ['backlinks-project-assets', entityType, entityId],
    queryFn: async () => {
      if (entityType !== 'project') return [];
      const { data } = await supabase
        .from('asset_projects')
        .select('asset_id, assets(name, file_type)')
        .eq('project_id', entityId);
      return data || [];
    },
    enabled: entityType === 'project',
  });

  const { data: projectStoryboards = [] } = useQuery({
    queryKey: ['backlinks-project-storyboards', entityType, entityId],
    queryFn: async () => {
      if (entityType !== 'project') return [];
      const { data } = await supabase
        .from('storyboards')
        .select('id, name')
        .eq('project_id', entityId);
      return data || [];
    },
    enabled: entityType === 'project',
  });

  const { data: projectTasks = [] } = useQuery({
    queryKey: ['backlinks-project-tasks', entityType, entityId],
    queryFn: async () => {
      if (entityType !== 'project') return [];
      const { data } = await supabase
        .from('tasks')
        .select('id, title, status')
        .eq('project_id', entityId)
        .limit(10);
      return data || [];
    },
    enabled: entityType === 'project',
  });

  // Storyboard backlinks: project, frames with assets
  const { data: storyboardProject } = useQuery({
    queryKey: ['backlinks-sb-project', entityType, entityId],
    queryFn: async () => {
      if (entityType !== 'storyboard') return null;
      const { data } = await supabase
        .from('storyboards')
        .select('project_id, projects(name)')
        .eq('id', entityId)
        .single();
      return data;
    },
    enabled: entityType === 'storyboard',
  });

  const { data: storyboardFrameAssets = [] } = useQuery({
    queryKey: ['backlinks-sb-frame-assets', entityType, entityId],
    queryFn: async () => {
      if (entityType !== 'storyboard') return [];
      const { data } = await supabase
        .from('storyboard_frames')
        .select('id, title, sort_order, asset_id, assets(name, file_type)')
        .eq('storyboard_id', entityId)
        .not('asset_id', 'is', null)
        .order('sort_order');
      return data || [];
    },
    enabled: entityType === 'storyboard',
  });

  const hasAny =
    linkedProjects.length > 0 || linkedFrames.length > 0 || uploadLog ||
    childProjects.length > 0 || projectAssets.length > 0 || projectStoryboards.length > 0 || projectTasks.length > 0 ||
    storyboardProject || storyboardFrameAssets.length > 0 ||
    tags.length > 0;

  if (!hasAny) return null;

  return (
    <div className="border-t border-border pt-4">
      <h3 className="text-xs font-semibold text-foreground mb-3">📍 Appears in</h3>
      <div className="space-y-2">
        {/* Asset: Project links */}
        {linkedProjects.map((lp: any) => (
          <Breadcrumb
            key={lp.project_id}
            icon={<FolderOpen className="w-3 h-3 text-primary/70" />}
            parts={[lp.projects?.name || 'Project', lp.folder_path !== '/' ? lp.folder_path : null].filter(Boolean) as string[]}
            label="project"
          />
        ))}

        {/* Asset: Storyboard frame links */}
        {linkedFrames.map((f: any) => (
          <Breadcrumb
            key={f.id}
            icon={<Film className="w-3 h-3 text-primary/70" />}
            parts={[
              f.storyboards?.projects?.name,
              f.storyboards?.name,
              f.title || `Frame ${f.sort_order + 1}`,
            ].filter(Boolean) as string[]}
            label="storyboard"
          />
        ))}

        {/* Project: Child projects */}
        {childProjects.map((cp: any) => (
          <Breadcrumb key={cp.id} icon={<FolderOpen className="w-3 h-3 text-primary/70" />} parts={[cp.name]} label="child project" />
        ))}

        {/* Project: Storyboards */}
        {projectStoryboards.map((sb: any) => (
          <Breadcrumb key={sb.id} icon={<Film className="w-3 h-3 text-primary/70" />} parts={[sb.name]} label="storyboard" />
        ))}

        {/* Project: Tasks */}
        {projectTasks.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CheckSquare className="w-3 h-3" />
            <span>{projectTasks.length} linked tasks</span>
          </div>
        )}

        {/* Project: Assets count */}
        {projectAssets.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Tag className="w-3 h-3" />
            <span>{projectAssets.length} linked assets</span>
          </div>
        )}

        {/* Storyboard: Parent project */}
        {storyboardProject && (
          <Breadcrumb
            icon={<FolderOpen className="w-3 h-3 text-primary/70" />}
            parts={[(storyboardProject as any).projects?.name || 'Project'].filter(Boolean)}
            label="parent project"
          />
        )}

        {/* Storyboard: Frame assets */}
        {storyboardFrameAssets.map((f: any) => (
          <Breadcrumb
            key={f.id}
            icon={<Film className="w-3 h-3 text-primary/70" />}
            parts={[f.title || `Frame ${f.sort_order + 1}`, f.assets?.name].filter(Boolean)}
            label="asset"
          />
        ))}

        {/* Upload log */}
        {uploadLog && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Upload className="w-3 h-3" />
            <span>Uploaded {new Date(uploadLog.started_at).toLocaleDateString()} via {uploadLog.source}</span>
            {uploadLog.status === 'error' && <span className="text-destructive">· Error: {uploadLog.error_message}</span>}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3 h-3 text-muted-foreground" />
            {tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Breadcrumb({ icon, parts, label }: { icon: React.ReactNode; parts: string[]; label: string }) {
  return (
    <div className="flex items-center gap-1 text-[11px]">
      {icon}
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/50" />}
          <span className="text-foreground">{part}</span>
        </span>
      ))}
      <span className="text-muted-foreground ml-1">({label})</span>
    </div>
  );
}
