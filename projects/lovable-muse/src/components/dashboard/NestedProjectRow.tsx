import { ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const phaseColors: Record<string, string> = {
  start: 'bg-phase-start/20 text-phase-start',
  build: 'bg-phase-build/20 text-phase-build',
  grow: 'bg-phase-grow/20 text-phase-grow',
};

const PHASE_ORDER = ['start', 'build', 'grow'] as const;

export interface TreeNode {
  id: string;
  name: string;
  description: string | null;
  phase: string;
  thumbnail_url: string | null;
  thumbnail_fit: string;
  thumbnail_focus_x: number;
  thumbnail_focus_y: number;
  updated_at: string;
  created_at: string;
  owner_id: string;
  parent_id: string | null;
  children: TreeNode[];
  depth: number;
}

function countDescendants(node: TreeNode): number {
  let count = node.children.length;
  for (const c of node.children) count += countDescendants(c);
  return count;
}

function groupByPhase(children: TreeNode[]): Record<string, TreeNode[]> {
  const groups: Record<string, TreeNode[]> = {};
  for (const c of children) {
    const phase = c.phase || 'start';
    if (!groups[phase]) groups[phase] = [];
    groups[phase].push(c);
  }
  return groups;
}

interface NestedProjectRowProps {
  project: TreeNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
}

export default function NestedProjectRow({ project, isExpanded, onToggle, onSelect, expandedIds }: NestedProjectRowProps) {
  const hasChildren = project.children.length > 0;
  const descendantCount = countDescendants(project);
  const phaseGroups = groupByPhase(project.children);
  const fitMode = (project.thumbnail_fit || 'cover') as 'cover' | 'contain' | 'fill' | 'auto';

  return (
    <div>
      <div
        className="group flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
        onClick={() => onSelect(project.id)}
      >
        {hasChildren ? (
          <button
            onClick={e => { e.stopPropagation(); onToggle(project.id); }}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        <div className="w-8 h-8 rounded shrink-0 overflow-hidden bg-muted">
          {project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt=""
              className="w-full h-full"
              style={{
                objectFit: fitMode === 'auto' ? 'scale-down' : fitMode,
                objectPosition: `${project.thumbnail_focus_x ?? 50}% ${project.thumbnail_focus_y ?? 50}%`,
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FolderOpen className="w-3.5 h-3.5 text-muted-foreground/40" />
            </div>
          )}
        </div>

        <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {project.name}
        </span>

        <span className={`text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full shrink-0 ${phaseColors[project.phase]}`}>
          {project.phase}
        </span>

        {descendantCount > 0 && (
          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
            {descendantCount} sub
          </span>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-6 border-l border-border/50 pl-2 mt-0.5 mb-1"
          >
            {PHASE_ORDER.filter(p => phaseGroups[p]?.length).map(phase => (
              <div key={phase} className="mb-1">
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${phaseColors[phase]?.split(' ')[1] || 'text-muted-foreground'}`}>
                    {phase}
                  </span>
                  <span className="text-[9px] text-muted-foreground">({phaseGroups[phase].length})</span>
                </div>
                {phaseGroups[phase].map(child => (
                  <NestedProjectRow
                    key={child.id}
                    project={child}
                    isExpanded={expandedIds.has(child.id)}
                    onToggle={onToggle}
                    onSelect={onSelect}
                    expandedIds={expandedIds}
                  />
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { countDescendants, groupByPhase, PHASE_ORDER };
