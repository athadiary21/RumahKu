-- Advanced Subscription Features Migration
-- Payment gateway, subscription history, trial period, promo codes

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES public.family_groups(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  payment_method TEXT NOT NULL, -- 'midtrans', 'xendit', 'manual'
  payment_gateway TEXT, -- specific gateway used
  transaction_id TEXT, -- external transaction ID from gateway
  order_id TEXT UNIQUE NOT NULL, -- our order ID
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed, expired
  payment_url TEXT, -- payment page URL
  paid_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  metadata JSONB, -- additional data from gateway
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create subscription_history table
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES public.family_groups(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- 'created', 'upgraded', 'downgraded', 'renewed', 'cancelled', 'expired'
  from_tier subscription_tier,
  to_tier subscription_tier,
  amount DECIMAL(10, 2),
  payment_transaction_id UUID REFERENCES public.payment_transactions(id),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER, -- null = unlimited
  current_uses INTEGER NOT NULL DEFAULT 0,
  applicable_tiers subscription_tier[], -- which tiers can use this promo
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create promo_code_usage table
CREATE TABLE IF NOT EXISTS public.promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES public.family_groups(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  payment_transaction_id UUID REFERENCES public.payment_transactions(id),
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_name TEXT, -- 'subscription_confirmation', 'payment_success', 'expiry_reminder', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add trial period columns to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON public.payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_family_id ON public.payment_transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id ON public.subscription_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_family_id ON public.subscription_history(family_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_promo_code_id ON public.promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_family_id ON public.promo_code_usage(family_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications(status);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_transactions
CREATE POLICY "Family members can view their payment transactions"
  ON public.payment_transactions FOR SELECT
  USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "System can insert payment transactions"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "System can update payment transactions"
  ON public.payment_transactions FOR UPDATE
  USING (public.is_family_member(auth.uid(), family_id));

-- RLS Policies for subscription_history
CREATE POLICY "Family members can view their subscription history"
  ON public.subscription_history FOR SELECT
  USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "System can insert subscription history"
  ON public.subscription_history FOR INSERT
  WITH CHECK (true); -- Allow system to insert

-- RLS Policies for promo_codes
CREATE POLICY "Anyone can view active promo codes"
  ON public.promo_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for promo_code_usage
CREATE POLICY "Family members can view their promo code usage"
  ON public.promo_code_usage FOR SELECT
  USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "System can insert promo code usage"
  ON public.promo_code_usage FOR INSERT
  WITH CHECK (public.is_family_member(auth.uid(), family_id));

-- RLS Policies for email_notifications
CREATE POLICY "Users can view their email notifications"
  ON public.email_notifications FOR SELECT
  USING (recipient_user_id = auth.uid());

CREATE POLICY "System can manage email notifications"
  ON public.email_notifications FOR ALL
  USING (true); -- System operations

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_payment_transactions
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_promo_codes
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to log subscription changes
CREATE OR REPLACE FUNCTION public.log_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if tier or status changed
  IF (TG_OP = 'UPDATE' AND (OLD.tier != NEW.tier OR OLD.status != NEW.status)) THEN
    INSERT INTO public.subscription_history (
      subscription_id,
      family_id,
      action,
      from_tier,
      to_tier,
      notes,
      created_by
    ) VALUES (
      NEW.id,
      NEW.family_id,
      CASE 
        WHEN OLD.tier != NEW.tier AND NEW.tier > OLD.tier THEN 'upgraded'
        WHEN OLD.tier != NEW.tier AND NEW.tier < OLD.tier THEN 'downgraded'
        WHEN OLD.status = 'active' AND NEW.status = 'cancelled' THEN 'cancelled'
        WHEN OLD.status != 'expired' AND NEW.status = 'expired' THEN 'expired'
        ELSE 'updated'
      END,
      OLD.tier,
      NEW.tier,
      'Automatic log from subscription change',
      auth.uid()
    );
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.subscription_history (
      subscription_id,
      family_id,
      action,
      to_tier,
      notes,
      created_by
    ) VALUES (
      NEW.id,
      NEW.family_id,
      'created',
      NEW.tier,
      'Subscription created',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for subscription changes
DROP TRIGGER IF EXISTS log_subscription_changes ON public.subscriptions;
CREATE TRIGGER log_subscription_changes
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.log_subscription_change();

-- Function to check promo code validity
CREATE OR REPLACE FUNCTION public.validate_promo_code(
  p_code TEXT,
  p_tier subscription_tier,
  p_family_id UUID
)
RETURNS TABLE (
  valid BOOLEAN,
  promo_code_id UUID,
  discount_type TEXT,
  discount_value DECIMAL,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo RECORD;
  v_usage_count INTEGER;
BEGIN
  -- Get promo code
  SELECT * INTO v_promo
  FROM public.promo_codes
  WHERE code = p_code AND is_active = true;
  
  -- Check if promo code exists
  IF v_promo IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'Kode promo tidak valid';
    RETURN;
  END IF;
  
  -- Check if promo code is expired
  IF v_promo.valid_until IS NOT NULL AND v_promo.valid_until < NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'Kode promo sudah kadaluarsa';
    RETURN;
  END IF;
  
  -- Check if promo code hasn't started yet
  IF v_promo.valid_from > NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'Kode promo belum aktif';
    RETURN;
  END IF;
  
  -- Check if tier is applicable
  IF v_promo.applicable_tiers IS NOT NULL AND NOT (p_tier = ANY(v_promo.applicable_tiers)) THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'Kode promo tidak berlaku untuk paket ini';
    RETURN;
  END IF;
  
  -- Check max uses
  IF v_promo.max_uses IS NOT NULL AND v_promo.current_uses >= v_promo.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'Kode promo sudah mencapai batas penggunaan';
    RETURN;
  END IF;
  
  -- Check if family already used this promo
  SELECT COUNT(*) INTO v_usage_count
  FROM public.promo_code_usage
  WHERE promo_code_id = v_promo.id AND family_id = p_family_id;
  
  IF v_usage_count > 0 THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'Anda sudah menggunakan kode promo ini';
    RETURN;
  END IF;
  
  -- Valid!
  RETURN QUERY SELECT 
    true, 
    v_promo.id, 
    v_promo.discount_type, 
    v_promo.discount_value,
    'Kode promo valid';
END;
$$;

-- Insert sample promo codes
INSERT INTO public.promo_codes (code, description, discount_type, discount_value, max_uses, applicable_tiers, valid_until)
VALUES 
  ('WELCOME50', 'Diskon 50% untuk pelanggan baru', 'percentage', 50, 100, ARRAY['family', 'premium']::subscription_tier[], NOW() + INTERVAL '30 days'),
  ('FAMILY10K', 'Diskon Rp 10,000 untuk paket Family', 'fixed', 10000, NULL, ARRAY['family']::subscription_tier[], NOW() + INTERVAL '60 days'),
  ('PREMIUM2024', 'Diskon 25% untuk paket Premium', 'percentage', 25, 50, ARRAY['premium']::subscription_tier[], NOW() + INTERVAL '90 days')
ON CONFLICT (code) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.payment_transactions IS 'Stores all payment transactions from various gateways';
COMMENT ON TABLE public.subscription_history IS 'Audit log of all subscription changes';
COMMENT ON TABLE public.promo_codes IS 'Promotional discount codes';
COMMENT ON TABLE public.promo_code_usage IS 'Tracks which families used which promo codes';
COMMENT ON TABLE public.email_notifications IS 'Queue for email notifications';
