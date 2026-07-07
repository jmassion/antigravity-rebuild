import { useState, useRef } from 'react';
import { Plus, Loader2, Check, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProjectSelectProps {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  className?: string;
  excludeIds?: Set<string>;
  size?: 'sm' | 'md';
}

interface ProjectNode {
  id: string;
  name: string;
  parent_id: string | null;
  children: ProjectNode[];
  depth: number;
}

function buildTree(projects: { id: string; name: string; parent_id: string | null }[]): ProjectNode[] {
  const map = new Map<string, ProjectNode>();
  for (const p of projects) {
    map.set(p.id, { ...p, children: [], depth: 0 });
  }
  const roots: ProjectNode[] = [];
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      const parent = map.get(node.parent_id)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  // Flatten tree for dropdown display
  const flat: ProjectNode[] = [];
  const walk = (nodes: ProjectNode[], depth: number) => {
    for (const n of nodes.sort((a, b) => a.name.localeCompare(b.name))) {
      n.depth = depth;
      flat.push(n);
      walk(n.children, depth + 1);
    }
  };
  walk(roots, 0);
  return flat;
}

export default function ProjectSelect({ value, onChange, placeholder = 'Select project...', className = '', excludeIds, size = 'md' }: ProjectSelectProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('id, name, parent_id').order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('projects').insert({
        name,
        owner_id: user.id,
        phase: 'start',
      }).select('id').single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onChange(data.id);
      setCreating(false);
      setNewName('');
    },
  });

  const tree = buildTree(projects as any);
  const filtered = excludeIds ? tree.filter(p => !excludeIds.has(p.id)) : tree;

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-1.5 text-xs'
    : 'px-3 py-2 text-sm';

  if (creating) {
    return (
      <div className={`flex gap-1.5 ${className}`}>
        <input
          ref={inputRef}
          autoFocus
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && newName.trim()) createMutation.mutate(newName.trim());
            if (e.key === 'Escape') { setCreating(false); setNewName(''); }
          }}
          placeholder="New project name..."
          className={`flex-1 ${sizeClasses} rounded-md bg-secondary border border-primary/30 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary`}
        />
        <button
          onClick={() => newName.trim() && createMutation.mutate(newName.trim())}
          disabled={!newName.trim() || createMutation.isPending}
          className={`${sizeClasses} rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1`}
        >
          {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={e => {
          if (e.target.value === '__create__') {
            setCreating(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          } else {
            onChange(e.target.value);
          }
        }}
        className={`w-full ${sizeClasses} rounded-md bg-secondary border border-border text-foreground outline-none focus:ring-1 focus:ring-primary appearance-none pr-8`}
      >
        <option value="">{placeholder}</option>
        {filtered.map(p => (
          <option key={p.id} value={p.id}>
            {'  '.repeat(p.depth)}{p.depth > 0 ? '└ ' : ''}{p.name}
          </option>
        ))}
        <option value="__create__">＋ Create new project...</option>
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}
