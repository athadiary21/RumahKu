import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFamily } from './useFamily';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';

export interface FamilyTask {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  created_by: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
  last_completed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useFamilyTasks = () => {
  const { data: family } = useFamily();
  const familyId = family?.family_id;

  return useQuery({
    queryKey: ['family-tasks', familyId],
    queryFn: async () => {
      if (!familyId) return [];

      const { data, error } = await supabase
        .from('family_tasks')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch assignee profiles separately
      const tasksWithAssignees = await Promise.all(
        data.map(async (task) => {
          let assignee = null;
          if (task.assigned_to) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', task.assigned_to)
              .maybeSingle();
            assignee = profile;
          }
          return { ...task, assignee } as FamilyTask;
        })
      );

      return tasksWithAssignees;
    },
    enabled: !!familyId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { data: family } = useFamily();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string;
      assigned_to?: string | null;
      priority: TaskPriority;
      due_date?: string | null;
      is_recurring: boolean;
      recurrence_pattern?: RecurrencePattern | null;
    }) => {
      if (!family?.family_id || !user) throw new Error('No family or user');

      const { data, error } = await supabase
        .from('family_tasks')
        .insert({
          family_id: family.family_id,
          created_by: user.id,
          ...task,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-tasks'] });
      toast.success('Tugas berhasil dibuat');
    },
    onError: (error) => {
      toast.error('Gagal membuat tugas: ' + error.message);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<FamilyTask> & { id: string }) => {
      const { data, error } = await supabase
        .from('family_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-tasks'] });
      toast.success('Tugas berhasil diperbarui');
    },
    onError: (error) => {
      toast.error('Gagal memperbarui tugas: ' + error.message);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('family_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-tasks'] });
      toast.success('Tugas berhasil dihapus');
    },
    onError: (error) => {
      toast.error('Gagal menghapus tugas: ' + error.message);
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isRecurring }: { id: string; isRecurring: boolean }) => {
      if (isRecurring) {
        // For recurring tasks, reset to pending and update last_completed_at
        const { data, error } = await supabase
          .from('family_tasks')
          .update({
            status: 'pending' as TaskStatus,
            last_completed_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // For non-recurring tasks, mark as completed
        const { data, error } = await supabase
          .from('family_tasks')
          .update({
            status: 'completed' as TaskStatus,
            last_completed_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, { isRecurring }) => {
      queryClient.invalidateQueries({ queryKey: ['family-tasks'] });
      toast.success(isRecurring ? 'Tugas selesai! Akan muncul kembali.' : 'Tugas selesai!');
    },
    onError: (error) => {
      toast.error('Gagal menyelesaikan tugas: ' + error.message);
    },
  });
};
