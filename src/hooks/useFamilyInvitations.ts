import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from './useFamily';
import { toast } from 'sonner';

export interface FamilyInvitation {
  id: string;
  family_id: string;
  invited_by: string;
  email: string | null;
  role: 'admin' | 'member' | 'child';
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
}

export const useFamilyInvitations = () => {
  const { user } = useAuth();
  const { data: familyData } = useFamily();
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: ['family-invitations', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return [];

      const { data, error } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('family_id', familyData.family_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FamilyInvitation[];
    },
    enabled: !!familyData?.family_id,
  });

  const createInvitationMutation = useMutation({
    mutationFn: async ({ role, email }: { role: 'member' | 'child'; email?: string }) => {
      if (!familyData?.family_id || !user?.id) {
        throw new Error('Data keluarga tidak ditemukan');
      }

      const { data, error } = await supabase
        .from('family_invitations')
        .insert({
          family_id: familyData.family_id,
          invited_by: user.id,
          role,
          email: email || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as FamilyInvitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-invitations'] });
      toast.success('Undangan berhasil dibuat');
    },
    onError: (error: Error) => {
      toast.error('Gagal membuat undangan: ' + error.message);
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('family_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-invitations'] });
      toast.success('Undangan dibatalkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal membatalkan undangan: ' + error.message);
    },
  });

  return {
    invitations: invitationsQuery.data || [],
    isLoading: invitationsQuery.isLoading,
    createInvitation: createInvitationMutation.mutateAsync,
    cancelInvitation: cancelInvitationMutation.mutate,
    isCreating: createInvitationMutation.isPending,
    isCancelling: cancelInvitationMutation.isPending,
  };
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase.rpc('accept_family_invitation', {
        invitation_token: token,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; message: string; family_id?: string };
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      toast.success('Berhasil bergabung dengan keluarga!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
