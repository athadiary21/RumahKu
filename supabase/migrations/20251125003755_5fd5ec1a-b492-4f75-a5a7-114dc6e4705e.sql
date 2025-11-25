-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on promo_codes
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Policies for promo_codes
CREATE POLICY "Anyone can view active promo codes"
  ON public.promo_codes FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create subscription_history table
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  billing_period TEXT,
  amount_paid NUMERIC,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscription_history
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_history
CREATE POLICY "Family members can view their subscription history"
  ON public.subscription_history FOR SELECT
  USING (is_family_member(auth.uid(), family_id));

CREATE POLICY "Admins can view all subscription history"
  ON public.subscription_history FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add missing columns to subscriptions table
ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS billing_period TEXT;

-- Create function to validate promo code
CREATE OR REPLACE FUNCTION public.validate_promo_code(promo_code TEXT)
RETURNS TABLE (
  valid BOOLEAN,
  discount_type TEXT,
  discount_value NUMERIC,
  message TEXT
) AS $$
DECLARE
  promo_record RECORD;
BEGIN
  -- Get promo code details
  SELECT * INTO promo_record
  FROM public.promo_codes
  WHERE code = promo_code AND active = true;

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'Invalid promo code'::TEXT;
    RETURN;
  END IF;

  -- Check if code is still valid (date range)
  IF promo_record.valid_from > NOW() THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'Promo code not yet valid'::TEXT;
    RETURN;
  END IF;

  IF promo_record.valid_until IS NOT NULL AND promo_record.valid_until < NOW() THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'Promo code has expired'::TEXT;
    RETURN;
  END IF;

  -- Check if max uses exceeded
  IF promo_record.max_uses IS NOT NULL AND promo_record.current_uses >= promo_record.max_uses THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'Promo code has reached maximum uses'::TEXT;
    RETURN;
  END IF;

  -- Code is valid
  RETURN QUERY SELECT true, promo_record.discount_type, promo_record.discount_value, 'Promo code is valid'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(active);
CREATE INDEX IF NOT EXISTS idx_subscription_history_family_id ON public.subscription_history(family_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_family_id ON public.subscriptions(family_id);