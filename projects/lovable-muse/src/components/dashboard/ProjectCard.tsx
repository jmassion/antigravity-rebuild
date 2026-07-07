import { motion } from 'framer-motion';
import { FolderOpen, Users, Clock } from 'lucide-react';
import type { Project } from '@/lib/mock-data';

const phaseColors: Record<string, string> = {
  start: 'bg-phase-start/20 text-phase-start',
  build: 'bg-phase-build/20 text-phase-build',
  grow: 'bg-phase-grow/20 text-phase-grow',
};

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="group relative rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-all cursor-pointer hover:glow-primary"
    >
      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden">
        <img
          src={project.thumbnail}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 relative">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${phaseColors[project.phase]}`}>
            {project.phase}
          </span>
        </div>
        <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>

        <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><FolderOpen className="w-3 h-3" />{project.assetCount}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{project.memberCount}</span>
          <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{project.updatedAt}</span>
        </div>
      </div>
    </motion.div>
  );
}
