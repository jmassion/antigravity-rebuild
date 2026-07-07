import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useIsAdmin() {
  const { user } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['user-is-admin', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id);
      if (error) throw error;
      return (data || []).some(r => r.role === 'super_admin' || r.role === 'admin');
    },
    enabled: !!user,
  });

  return { isAdmin, isLoading };
}
