import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pin, PinOff, EyeOff, Network, Copy, ExternalLink } from 'lucide-react';
import type { GraphNode, GraphEdge, NodeType } from '@/pages/Connections';
import { toast } from 'sonner';

interface Props {
  nodeId: string;
  position: { x: number; y: number };
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
  pinnedNodes: Record<string, { x: number; y: number }>;
  onClose: () => void;
  onPinToggle: (nodeId: string) => void;
  onHideType: (type: NodeType) => void;
  onShowOnlyConnected: (nodeId: string) => void;
}

const TYPE_ROUTES: Record<string, string> = {
  project: '/projects',
  asset: '/assets',
  storyboard: '/storyboards',
  task: '/tasks',
  team: '/team',
  doc: '/docs',
  link: '/links',
};

export default function GraphContextMenu({
  nodeId, position, allNodes, pinnedNodes,
  onClose, onPinToggle, onHideType, onShowOnlyConnected,
}: Props) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const node = allNodes.find(n => n.id === nodeId);
  const isPinned = !!pinnedNodes[nodeId];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!node) return null;

  const items = [
    {
      icon: ExternalLink,
      label: 'Go to page',
      action: () => {
        const route = TYPE_ROUTES[node.type];
        if (route) navigate(route);
        onClose();
      },
    },
    {
      icon: isPinned ? PinOff : Pin,
      label: isPinned ? 'Unpin node' : 'Pin node',
      action: () => { onPinToggle(nodeId); onClose(); },
    },
    {
      icon: EyeOff,
      label: `Hide all ${node.type}s`,
      action: () => { onHideType(node.type); onClose(); },
    },
    {
      icon: Network,
      label: 'Show only connected',
      action: () => { onShowOnlyConnected(nodeId); onClose(); },
    },
    {
      icon: Copy,
      label: 'Copy name',
      action: () => {
        navigator.clipboard.writeText(node.label);
        toast.success('Copied to clipboard');
        onClose();
      },
    },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-[9999] bg-popover border border-border rounded-lg shadow-xl py-1 min-w-[180px]"
      style={{ left: position.x, top: position.y }}
    >
      <div className="px-3 py-1.5 border-b border-border">
        <p className="text-xs font-semibold text-foreground truncate">{node.label}</p>
        <p className="text-[10px] text-muted-foreground capitalize">{node.type}</p>
      </div>
      {items.map(item => (
        <button
          key={item.label}
          onClick={item.action}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-accent/50 transition-colors"
        >
          <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
