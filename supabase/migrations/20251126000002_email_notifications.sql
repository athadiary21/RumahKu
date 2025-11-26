-- Create email_notifications table to queue emails
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view email notifications"
  ON public.email_notifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  ));

CREATE POLICY "System can insert email notifications"
  ON public.email_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update email notifications"
  ON public.email_notifications FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON public.email_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient ON public.email_notifications(recipient_email);

-- Function to send subscription change notification
CREATE OR REPLACE FUNCTION send_subscription_change_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  family_name TEXT;
BEGIN
  -- Only send notification if there's an actual change
  IF (OLD.tier IS DISTINCT FROM NEW.tier) OR 
     (OLD.status IS DISTINCT FROM NEW.status) THEN
    
    -- Get user email and name from family members
    SELECT 
      au.email,
      p.full_name,
      fg.name
    INTO user_email, user_name, family_name
    FROM public.family_members fm
    JOIN auth.users au ON au.id = fm.user_id
    LEFT JOIN public.profiles p ON p.id = fm.user_id
    LEFT JOIN public.family_groups fg ON fg.id = fm.family_id
    WHERE fm.family_id = NEW.family_id
    AND fm.role = 'owner'
    LIMIT 1;
    
    -- Insert email notification
    IF user_email IS NOT NULL THEN
      INSERT INTO public.email_notifications (
        recipient_email,
        recipient_name,
        subject,
        template_name,
        template_data
      ) VALUES (
        user_email,
        COALESCE(user_name, 'User'),
        'Subscription Update - RumahKu',
        'subscription_change',
        jsonb_build_object(
          'user_name', COALESCE(user_name, 'User'),
          'family_name', COALESCE(family_name, 'Your Family'),
          'old_tier', OLD.tier::TEXT,
          'new_tier', NEW.tier::TEXT,
          'old_status', OLD.status,
          'new_status', NEW.status,
          'expires_at', NEW.current_period_end
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for subscription changes
DROP TRIGGER IF EXISTS subscription_email_notification_trigger ON public.subscriptions;
CREATE TRIGGER subscription_email_notification_trigger
  AFTER UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION send_subscription_change_notification();

-- Function to send expiration reminder
CREATE OR REPLACE FUNCTION send_expiration_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_record RECORD;
  user_email TEXT;
  user_name TEXT;
  family_name TEXT;
  days_until_expiry INTEGER;
BEGIN
  -- Find subscriptions expiring in 7, 3, or 1 days
  FOR sub_record IN
    SELECT 
      s.*,
      EXTRACT(DAY FROM (s.current_period_end - NOW()))::INTEGER as days_left
    FROM public.subscriptions s
    WHERE s.status = 'active'
    AND s.current_period_end IS NOT NULL
    AND s.current_period_end > NOW()
    AND EXTRACT(DAY FROM (s.current_period_end - NOW())) IN (7, 3, 1)
  LOOP
    -- Get user details
    SELECT 
      au.email,
      p.full_name,
      fg.name
    INTO user_email, user_name, family_name
    FROM public.family_members fm
    JOIN auth.users au ON au.id = fm.user_id
    LEFT JOIN public.profiles p ON p.id = fm.user_id
    LEFT JOIN public.family_groups fg ON fg.id = fm.family_id
    WHERE fm.family_id = sub_record.family_id
    AND fm.role = 'owner'
    LIMIT 1;
    
    -- Check if reminder already sent today
    IF NOT EXISTS (
      SELECT 1 FROM public.email_notifications
      WHERE recipient_email = user_email
      AND template_name = 'expiration_reminder'
      AND created_at > NOW() - INTERVAL '1 day'
    ) THEN
      -- Insert email notification
      INSERT INTO public.email_notifications (
        recipient_email,
        recipient_name,
        subject,
        template_name,
        template_data
      ) VALUES (
        user_email,
        COALESCE(user_name, 'User'),
        'Subscription Expiring Soon - RumahKu',
        'expiration_reminder',
        jsonb_build_object(
          'user_name', COALESCE(user_name, 'User'),
          'family_name', COALESCE(family_name, 'Your Family'),
          'tier', sub_record.tier::TEXT,
          'expires_at', sub_record.current_period_end,
          'days_left', sub_record.days_left
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_email_notifications
  BEFORE UPDATE ON public.email_notifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT SELECT ON public.email_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION send_expiration_reminders() TO authenticated;

-- Add comments
COMMENT ON TABLE public.email_notifications IS 'Queue for email notifications to be sent';
COMMENT ON FUNCTION send_subscription_change_notification() IS 'Automatically queues email when subscription changes';
COMMENT ON FUNCTION send_expiration_reminders() IS 'Queues expiration reminder emails (should be called daily via cron)';
