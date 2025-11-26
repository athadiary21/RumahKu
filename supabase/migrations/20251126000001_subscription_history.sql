-- Create subscription_history table for tracking changes
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_tier TEXT,
  new_tier TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  old_expires_at TIMESTAMPTZ,
  new_expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view subscription history"
  ON public.subscription_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  ));

CREATE POLICY "System can insert subscription history"
  ON public.subscription_history FOR INSERT
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_history_family_id ON public.subscription_history(family_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON public.subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON public.subscription_history(created_at DESC);

-- Function to automatically log subscription changes
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if there's an actual change
  IF (OLD.tier IS DISTINCT FROM NEW.tier) OR 
     (OLD.status IS DISTINCT FROM NEW.status) OR 
     (OLD.current_period_end IS DISTINCT FROM NEW.current_period_end) THEN
    
    INSERT INTO public.subscription_history (
      family_id,
      changed_by,
      old_tier,
      new_tier,
      old_status,
      new_status,
      old_expires_at,
      new_expires_at
    ) VALUES (
      NEW.family_id,
      auth.uid(),
      OLD.tier::TEXT,
      NEW.tier::TEXT,
      OLD.status,
      NEW.status,
      OLD.current_period_end,
      NEW.current_period_end
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on subscriptions table
DROP TRIGGER IF EXISTS subscription_change_trigger ON public.subscriptions;
CREATE TRIGGER subscription_change_trigger
  AFTER UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_change();

-- Function to get subscription history for a user/family
CREATE OR REPLACE FUNCTION get_subscription_history(p_family_id UUID)
RETURNS TABLE (
  id UUID,
  family_id UUID,
  changed_by_email TEXT,
  changed_by_name TEXT,
  old_tier TEXT,
  new_tier TEXT,
  old_status TEXT,
  new_status TEXT,
  old_expires_at TIMESTAMPTZ,
  new_expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sh.id,
    sh.family_id,
    au.email as changed_by_email,
    p.full_name as changed_by_name,
    sh.old_tier,
    sh.new_tier,
    sh.old_status,
    sh.new_status,
    sh.old_expires_at,
    sh.new_expires_at,
    sh.notes,
    sh.created_at
  FROM public.subscription_history sh
  LEFT JOIN auth.users au ON au.id = sh.changed_by
  LEFT JOIN public.profiles p ON p.id = sh.changed_by
  WHERE sh.family_id = p_family_id
  ORDER BY sh.created_at DESC;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.subscription_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_history(UUID) TO authenticated;

-- Add comments
COMMENT ON TABLE public.subscription_history IS 'Tracks all changes to subscription tiers and status';
COMMENT ON FUNCTION log_subscription_change() IS 'Automatically logs subscription changes to history table';
COMMENT ON FUNCTION get_subscription_history(UUID) IS 'Returns subscription history for a specific family';
