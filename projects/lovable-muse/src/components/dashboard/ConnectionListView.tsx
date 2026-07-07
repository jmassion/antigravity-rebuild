import { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { GraphNode, GraphEdge, NodeType } from '@/pages/Connections';
import { NODE_TYPE_CONFIG } from '@/pages/Connections';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId?: string | null;
  onSelectNode?: (id: string | null) => void;
}

export default function ConnectionListView({ nodes, edges, selectedId, onSelectNode }: Props) {
  const [expandedTypes, setExpandedTypes] = useState<Set<NodeType>>(new Set(['project', 'asset', 'storyboard']));
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const adjacency = useMemo(() => {
    const map = new Map<string, { node: GraphNode; connections: { node: GraphNode; label?: string }[] }>();
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    for (const n of nodes) map.set(n.id, { node: n, connections: [] });
    for (const e of edges) {
      const fromEntry = map.get(e.from);
      const toEntry = map.get(e.to);
      const fromNode = nodeMap.get(e.from);
      const toNode = nodeMap.get(e.to);
      if (fromEntry && toNode) fromEntry.connections.push({ node: toNode, label: e.label });
      if (toEntry && fromNode) toEntry.connections.push({ node: fromNode, label: e.label });
    }
    return map;
  }, [nodes, edges]);

  const grouped = useMemo(() => {
    const groups: Record<NodeType, GraphNode[]> = {} as any;
    for (const n of nodes) {
      if (!groups[n.type]) groups[n.type] = [];
      groups[n.type].push(n);
    }
    return groups;
  }, [nodes]);

  const toggleType = (type: NodeType) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {(Object.entries(NODE_TYPE_CONFIG) as [NodeType, typeof NODE_TYPE_CONFIG[NodeType]][]).map(([type, cfg]) => {
          const items = grouped[type] || [];
          if (items.length === 0) return null;
          const isOpen = expandedTypes.has(type);
          return (
            <div key={type} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleType(type)}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium text-foreground"
              >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span>{cfg.emoji} {cfg.label}</span>
                <Badge variant="outline" className="ml-auto text-[10px] h-5">{items.length}</Badge>
              </button>
              {isOpen && (
                <div className="divide-y divide-border">
                  {items.map(node => {
                    const entry = adjacency.get(node.id);
                    const conns = entry?.connections || [];
                    const nodeOpen = expandedNodes.has(node.id);
                    const isSel = selectedId === node.id;
                    return (
                      <div key={node.id}>
                        <div
                          className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent/30 transition-colors ${isSel ? 'bg-primary/10 border-l-2 border-primary' : ''}`}
                          onClick={() => onSelectNode?.(isSel ? null : node.id)}
                        >
                          {conns.length > 0 ? (
                            <button onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }} className="p-0.5">
                              {nodeOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                            </button>
                          ) : (
                            <span className="w-4" />
                          )}
                          <span className="text-sm text-foreground truncate flex-1">{node.label}</span>
                          <span className="text-[10px] text-muted-foreground">{conns.length} conn.</span>
                        </div>
                        {nodeOpen && conns.length > 0 && (
                          <div className="pl-10 pb-1 space-y-0.5">
                            {conns.map((c, i) => {
                              const ccfg = NODE_TYPE_CONFIG[c.node.type];
                              return (
                                <div
                                  key={`${c.node.id}-${i}`}
                                  className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent/20 cursor-pointer text-xs"
                                  onClick={() => onSelectNode?.(c.node.id)}
                                >
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ccfg?.color || '#888' }} />
                                  <span className="text-foreground truncate">{c.node.label}</span>
                                  {c.label && <span className="text-muted-foreground ml-auto text-[10px]">{c.label}</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
