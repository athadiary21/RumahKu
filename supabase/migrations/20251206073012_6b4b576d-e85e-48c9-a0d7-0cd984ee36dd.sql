-- Create enum for task status
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create enum for task priority
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- Create enum for recurrence pattern
CREATE TYPE recurrence_pattern AS ENUM ('daily', 'weekly', 'monthly');

-- Create family_tasks table
CREATE TABLE public.family_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  status task_status NOT NULL DEFAULT 'pending',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern recurrence_pattern,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.family_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Family members can view tasks"
  ON public.family_tasks FOR SELECT
  USING (is_family_member(auth.uid(), family_id));

CREATE POLICY "Family members can insert tasks"
  ON public.family_tasks FOR INSERT
  WITH CHECK (is_family_member(auth.uid(), family_id) AND auth.uid() = created_by);

CREATE POLICY "Task assignee or admin can update tasks"
  ON public.family_tasks FOR UPDATE
  USING (
    auth.uid() = assigned_to 
    OR auth.uid() = created_by 
    OR get_family_role(auth.uid(), family_id) = 'admin'
  );

CREATE POLICY "Task creator or admin can delete tasks"
  ON public.family_tasks FOR DELETE
  USING (
    auth.uid() = created_by 
    OR get_family_role(auth.uid(), family_id) = 'admin'
  );

-- Create trigger for updated_at
CREATE TRIGGER update_family_tasks_updated_at
  BEFORE UPDATE ON public.family_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.family_tasks;