import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from './useFamily';
import { toast } from 'sonner';

export interface FamilyMember {
  id: string;
  user_id: string;
  family_id: string;
  role: 'admin' | 'member' | 'child';
  joined_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  email?: string;
}

export const useFamilyMembers = () => {
  const { user } = useAuth();
  const { data: familyData } = useFamily();
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ['family-members', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return [];

      const { data, error } = await supabase
        .from('family_members')
        .select(`
          id,
          user_id,
          family_id,
          role,
          joined_at
        `)
        .eq('family_id', familyData.family_id)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for each member
      const membersWithProfiles = await Promise.all(
        data.map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', member.user_id)
            .single();

          return {
            ...member,
            profile: profile || { full_name: null, avatar_url: null }
          };
        })
      );

      return membersWithProfiles as FamilyMember[];
    },
    enabled: !!familyData?.family_id,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: 'admin' | 'member' | 'child' }) => {
      const { error } = await supabase
        .from('family_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      toast.success('Peran anggota berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui peran: ' + error.message);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      toast.success('Anggota berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus anggota: ' + error.message);
    },
  });

  const currentUserRole = familyData?.role;
  const isAdmin = currentUserRole === 'admin';

  return {
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    error: membersQuery.error,
    updateRole: updateRoleMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    isUpdating: updateRoleMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
    isAdmin,
    currentUserRole,
    familyId: familyData?.family_id,
    familyName: familyData?.family_groups?.name,
  };
};
