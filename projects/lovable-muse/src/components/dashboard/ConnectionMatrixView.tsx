import { useMemo, useState } from 'react';
import type { GraphNode, GraphEdge, NodeType } from '@/pages/Connections';
import { NODE_TYPE_CONFIG } from '@/pages/Connections';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId?: string | null;
  onSelectNode?: (id: string | null) => void;
}

type SortKey = 'name' | 'type' | 'total' | NodeType;

export default function ConnectionMatrixView({ nodes, edges, selectedId, onSelectNode }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortAsc, setSortAsc] = useState(false);

  const nodeTypes = useMemo(() => {
    const types = new Set<NodeType>();
    for (const n of nodes) types.add(n.type);
    return Array.from(types);
  }, [nodes]);

  const matrix = useMemo(() => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const counts = new Map<string, Record<string, number>>();
    for (const n of nodes) counts.set(n.id, {});

    for (const e of edges) {
      const fromNode = nodeMap.get(e.from);
      const toNode = nodeMap.get(e.to);
      if (fromNode && toNode) {
        const fc = counts.get(e.from)!;
        fc[toNode.type] = (fc[toNode.type] || 0) + 1;
        const tc = counts.get(e.to)!;
        tc[fromNode.type] = (tc[fromNode.type] || 0) + 1;
      }
    }

    return nodes.map(n => {
      const c = counts.get(n.id) || {};
      const total = Object.values(c).reduce((s, v) => s + v, 0);
      return { node: n, counts: c, total };
    });
  }, [nodes, edges]);

  const sorted = useMemo(() => {
    return [...matrix].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.node.label.localeCompare(b.node.label);
      else if (sortKey === 'type') cmp = a.node.type.localeCompare(b.node.type);
      else if (sortKey === 'total') cmp = a.total - b.total;
      else cmp = (a.counts[sortKey] || 0) - (b.counts[sortKey] || 0);
      return sortAsc ? cmp : -cmp;
    });
  }, [matrix, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortHeader = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer hover:bg-accent/30 transition-colors whitespace-nowrap" onClick={() => handleSort(k)}>
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3 h-3 ${sortKey === k ? 'text-primary' : 'text-muted-foreground/50'}`} />
      </span>
    </TableHead>
  );

  return (
    <ScrollArea className="h-full">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHeader k="name">Name</SortHeader>
            <SortHeader k="type">Type</SortHeader>
            {nodeTypes.map(t => (
              <SortHeader key={t} k={t}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: NODE_TYPE_CONFIG[t]?.color }} />
                {NODE_TYPE_CONFIG[t]?.label || t}
              </SortHeader>
            ))}
            <SortHeader k="total">Total</SortHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(row => {
            const cfg = NODE_TYPE_CONFIG[row.node.type];
            const isSel = selectedId === row.node.id;
            return (
              <TableRow
                key={row.node.id}
                className={`cursor-pointer transition-colors ${isSel ? 'bg-primary/10' : 'hover:bg-accent/20'}`}
                onClick={() => onSelectNode?.(isSel ? null : row.node.id)}
              >
                <TableCell className="font-medium text-sm">
                  <span className="flex items-center gap-2">
                    {row.node.meta?.thumbnail_url ? (
                      <Avatar className="w-6 h-6 rounded">
                        <AvatarImage src={row.node.meta.thumbnail_url} alt={row.node.label} className="object-cover" />
                        <AvatarFallback className="text-[10px] rounded">{cfg?.emoji}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <span className="w-6 h-6 flex items-center justify-center text-sm">{cfg?.emoji}</span>
                    )}
                    <span className="truncate max-w-[200px]">{row.node.label}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg?.color }} />
                    {cfg?.label}
                  </span>
                </TableCell>
                {nodeTypes.map(t => (
                  <TableCell key={t} className="text-center text-xs tabular-nums">
                    {row.counts[t] ? (
                      <span className="font-medium text-foreground">{row.counts[t]}</span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-center text-xs font-bold tabular-nums">{row.total}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
