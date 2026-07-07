import { X, ExternalLink, ArrowRight, FolderOpen, Image, Film, CheckSquare, Users, BookOpen, Link2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { GraphNode, GraphEdge, NodeType } from '@/pages/Connections';
import { Badge } from '@/components/ui/badge';

const TYPE_META: Record<NodeType, { icon: React.ElementType; color: string; route?: (id: string) => string }> = {
  project:    { icon: FolderOpen,  color: '#3b82f6', route: () => '/projects' },
  asset:      { icon: Image,       color: '#10b981', route: () => '/assets' },
  tag:        { icon: Tag,         color: '#f59e0b' },
  storyboard: { icon: Film,        color: '#a855f7', route: () => '/storyboards' },
  task:       { icon: CheckSquare, color: '#ef4444', route: () => '/tasks' },
  team:       { icon: Users,       color: '#06b6d4', route: (id: string) => `/team/${id}` },
  doc:        { icon: BookOpen,    color: '#ec4899', route: () => '/docs' },
  link:       { icon: Link2,       color: '#84cc16', route: () => '/links' },
};

interface NodeDetailPanelProps {
  node: GraphNode;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
  onNavigate: (nodeId: string) => void;
}

export default function NodeDetailPanel({ node, edges, allNodes, onClose, onNavigate }: NodeDetailPanelProps) {
  const navigate = useNavigate();
  const meta = TYPE_META[node.type];
  const Icon = meta.icon;

  // Get connected nodes grouped by relationship
  const connections: { node: GraphNode; label: string; direction: 'from' | 'to' }[] = [];
  const nodeMap = new Map(allNodes.map(n => [n.id, n]));

  for (const e of edges) {
    if (e.from === node.id) {
      const target = nodeMap.get(e.to);
      if (target) connections.push({ node: target, label: e.label || 'connected', direction: 'to' });
    }
    if (e.to === node.id) {
      const source = nodeMap.get(e.from);
      if (source) connections.push({ node: source, label: e.label || 'connected', direction: 'from' });
    }
  }

  // Group by type
  const grouped: Record<string, typeof connections> = {};
  for (const c of connections) {
    if (!grouped[c.node.type]) grouped[c.node.type] = [];
    grouped[c.node.type].push(c);
  }

  const handleNavigateToPage = () => {
    if (meta.route) navigate(meta.route(node.entityId || ''));
  };

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full border-l border-border bg-card overflow-y-auto flex-shrink-0"
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${meta.color}20` }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color: meta.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground truncate">{node.label}</p>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 mt-1"
                style={{ borderColor: `${meta.color}40`, color: meta.color }}
              >
                {node.type}
              </Badge>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meta info */}
        {node.meta && Object.keys(node.meta).length > 0 && (
          <div className="rounded-md border border-border bg-secondary/50 p-3 space-y-1.5">
            {Object.entries(node.meta).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                {typeof value === 'string' && value.startsWith('http') ? (
                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[160px] flex items-center gap-1">
                    {new URL(value).hostname} <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{String(value)}</Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Navigate to entity page */}
        {meta.route && (
          <button
            onClick={handleNavigateToPage}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <Icon className="w-3.5 h-3.5" />
            Go to {node.type} page
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Connections */}
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-2">
            Connections ({connections.length})
          </h4>

          {connections.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No connections</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(grouped).map(([type, items]) => {
                const typeMeta = TYPE_META[type as NodeType];
                const TypeIcon = typeMeta?.icon || Tag;
                return (
                  <div key={type}>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <TypeIcon className="w-3 h-3" style={{ color: typeMeta?.color }} />
                      {type}s ({items.length})
                    </p>
                    <div className="space-y-0.5">
                      {items.slice(0, 20).map((c, i) => {
                        const cMeta = TYPE_META[c.node.type];
                        const CIcon = cMeta?.icon || Tag;
                        return (
                          <button
                            key={`${c.node.id}-${i}`}
                            onClick={() => onNavigate(c.node.id)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-secondary transition-colors text-left group"
                          >
                            <div
                              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${cMeta?.color || '#888'}15` }}
                            >
                              <CIcon className="w-3 h-3" style={{ color: cMeta?.color || '#888' }} />
                            </div>
                            <span className="truncate flex-1 text-foreground">{c.node.label}</span>
                            <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              {c.label}
                            </span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </button>
                        );
                      })}
                      {items.length > 20 && (
                        <p className="text-[10px] text-muted-foreground px-2 py-1">+{items.length - 20} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
