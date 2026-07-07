import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface FieldDefinition {
  id: string;
  owner_id: string;
  entity_type: string;
  scope: string;
  scope_id: string | null;
  field_name: string;
  field_label: string;
  field_type: string;
  options: { value: string; label: string }[];
  default_value: string | null;
  sort_order: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface FieldValue {
  id: string;
  field_id: string;
  entity_type: string;
  entity_id: string;
  value: string | null;
}

export function useCustomFieldDefinitions(entityType: string, projectId?: string | null, entityId?: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['custom-field-defs', entityType, projectId, entityId],
    enabled: !!user,
    queryFn: async () => {
      // Build OR conditions for scope resolution
      let q = supabase
        .from('custom_field_definitions' as any)
        .select('*')
        .eq('entity_type', entityType)
        .order('sort_order', { ascending: true });

      // We fetch all and filter client-side for the 3-scope logic
      const { data, error } = await q;
      if (error) throw error;
      const all = (data || []) as unknown as FieldDefinition[];
      return all.filter(f => {
        if (f.scope === 'global') return true;
        if (f.scope === 'project' && projectId && f.scope_id === projectId) return true;
        if (f.scope === 'instance' && entityId && f.scope_id === entityId) return true;
        return false;
      });
    },
  });
}

export function useCustomFieldValues(entityType: string, entityId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['custom-field-values', entityType, entityId],
    enabled: !!user && !!entityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_field_values' as any)
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId!);
      if (error) throw error;
      return (data || []) as unknown as FieldValue[];
    },
  });
}

export function useUpsertFieldValue() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { field_id: string; entity_type: string; entity_id: string; value: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('custom_field_values' as any)
        .upsert(
          { ...input, owner_id: user.id } as any,
          { onConflict: 'field_id,entity_id' }
        );
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['custom-field-values', vars.entity_type, vars.entity_id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateFieldDefinition() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<FieldDefinition> & { entity_type: string; field_name: string; field_label: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('custom_field_definitions' as any)
        .insert({ ...input, owner_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-field-defs'] });
      toast.success('Custom field created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteFieldDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_field_definitions' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-field-defs'] });
      toast.success('Custom field deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
