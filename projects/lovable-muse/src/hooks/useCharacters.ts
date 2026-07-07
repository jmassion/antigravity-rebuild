import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Character {
  id: string;
  owner_id: string;
  project_id: string | null;
  name: string;
  description: string;
  role: string;
  status: string;
  avatar_url: string | null;
  tags: string[];
  metadata: Record<string, any>;
  sort_order: number;
  created_at: string;
  updated_at: string;
  project?: { id: string; name: string } | null;
}

export function useCharacters(filters?: { projectId?: string; status?: string; search?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['characters', user?.id, filters],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from('characters' as any)
        .select('*, project:projects(id, name)')
        .order('sort_order', { ascending: true });
      if (filters?.projectId) q = q.eq('project_id', filters.projectId);
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.search) q = q.ilike('name', `%${filters.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as Character[];
    },
  });
}

export function useCharacter(id: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['character', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('characters' as any)
        .select('*, project:projects(id, name)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as unknown as Character;
    },
  });
}

export function useCreateCharacter() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { name: string; role?: string; description?: string; project_id?: string; status?: string; avatar_url?: string; tags?: string[] }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('characters' as any)
        .insert({ ...input, owner_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['characters'] });
      toast.success('Character created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<Character, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await supabase
        .from('characters' as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['characters'] });
      qc.invalidateQueries({ queryKey: ['character', vars.id] });
      toast.success('Character updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('characters' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['characters'] });
      toast.success('Character deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCharacterAssets(characterId: string | null) {
  return useQuery({
    queryKey: ['character-assets', characterId],
    enabled: !!characterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('character_assets' as any)
        .select('*, asset:assets(id, name, file_url, thumbnail_url, file_type)')
        .eq('character_id', characterId!)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });
}
