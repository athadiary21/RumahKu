-- Admin API Functions for RumahKu
-- This migration creates database functions to support admin panel operations

-- Function: Get all users with their subscription info
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  family_id uuid,
  family_name text,
  subscription_tier text,
  subscription_status text,
  current_period_end timestamptz,
  user_role text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.created_at,
    fm.family_id,
    fg.name as family_name,
    COALESCE(s.tier, 'free') as subscription_tier,
    COALESCE(s.status, 'active') as subscription_status,
    s.current_period_end,
    fm.role as user_role
  FROM profiles p
  LEFT JOIN family_members fm ON p.id = fm.user_id
  LEFT JOIN family_groups fg ON fm.family_id = fg.id
  LEFT JOIN subscriptions s ON fm.family_id = s.family_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Function: Get subscription statistics
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  SELECT json_build_object(
    'total_active', (
      SELECT COUNT(*) FROM subscriptions WHERE status = 'active'
    ),
    'total_free', (
      SELECT COUNT(*) FROM subscriptions WHERE tier = 'free'
    ),
    'total_family', (
      SELECT COUNT(*) FROM subscriptions WHERE tier = 'family'
    ),
    'total_premium', (
      SELECT COUNT(*) FROM subscriptions WHERE tier = 'premium'
    ),
    'mrr', (
      SELECT COALESCE(SUM(
        CASE 
          WHEN s.billing_period = 'yearly' THEN st.price_yearly / 12
          ELSE st.price_monthly
        END
      ), 0)
      FROM subscriptions s
      JOIN subscription_tiers st ON s.tier = st.tier
      WHERE s.status = 'active'
    ),
    'total_subscriptions', (
      SELECT COUNT(*) FROM subscriptions
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Function: Get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  SELECT json_build_object(
    'total_users', (
      SELECT COUNT(*) FROM profiles
    ),
    'active_subscriptions', (
      SELECT COUNT(*) FROM subscriptions WHERE status = 'active'
    ),
    'monthly_revenue', (
      SELECT COALESCE(SUM(
        CASE 
          WHEN s.billing_period = 'yearly' THEN st.price_yearly / 12
          ELSE st.price_monthly
        END
      ), 0)
      FROM subscriptions s
      JOIN subscription_tiers st ON s.tier = st.tier
      WHERE s.status = 'active'
    ),
    'active_promo_codes', (
      SELECT COUNT(*) FROM promo_codes WHERE is_active = true
    ),
    'completed_transactions', (
      SELECT COUNT(*) FROM payment_transactions WHERE status = 'completed'
    ),
    'pending_transactions', (
      SELECT COUNT(*) FROM payment_transactions WHERE status = 'pending'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Function: Get revenue trend (last 14 days)
CREATE OR REPLACE FUNCTION get_revenue_trend(days_back int DEFAULT 14)
RETURNS TABLE (
  date date,
  revenue numeric
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    pt.created_at::date as date,
    COALESCE(SUM(pt.amount), 0) as revenue
  FROM payment_transactions pt
  WHERE pt.created_at >= CURRENT_DATE - days_back
    AND pt.status = 'completed'
  GROUP BY pt.created_at::date
  ORDER BY date ASC;
END;
$$;

-- Function: Update user subscription (admin only)
CREATE OR REPLACE FUNCTION admin_update_subscription(
  p_family_id uuid,
  p_tier text,
  p_status text,
  p_current_period_end timestamptz
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Update subscription
  UPDATE subscriptions
  SET 
    tier = p_tier,
    status = p_status,
    current_period_end = p_current_period_end,
    updated_at = NOW()
  WHERE family_id = p_family_id;

  -- Log the change
  INSERT INTO subscription_history (
    family_id,
    action,
    old_tier,
    new_tier,
    changed_by
  )
  SELECT 
    p_family_id,
    'admin_update',
    (SELECT tier FROM subscriptions WHERE family_id = p_family_id),
    p_tier,
    auth.uid();

  SELECT json_build_object(
    'success', true,
    'message', 'Subscription updated successfully'
  ) INTO result;

  RETURN result;
END;
$$;

-- Function: Get promo code statistics
CREATE OR REPLACE FUNCTION get_promo_stats()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  SELECT json_build_object(
    'total_codes', (
      SELECT COUNT(*) FROM promo_codes
    ),
    'active_codes', (
      SELECT COUNT(*) FROM promo_codes WHERE is_active = true
    ),
    'total_uses', (
      SELECT COALESCE(SUM(current_uses), 0) FROM promo_codes
    ),
    'expired_codes', (
      SELECT COUNT(*) FROM promo_codes 
      WHERE valid_until < NOW()
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Function: Validate promo code
CREATE OR REPLACE FUNCTION validate_promo_code(p_code text, p_tier text)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  promo_record promo_codes%ROWTYPE;
  result json;
BEGIN
  -- Get promo code
  SELECT * INTO promo_record
  FROM promo_codes
  WHERE code = UPPER(p_code)
    AND is_active = true;

  -- Check if code exists
  IF NOT FOUND THEN
    SELECT json_build_object(
      'valid', false,
      'error', 'Invalid promo code'
    ) INTO result;
    RETURN result;
  END IF;

  -- Check if expired
  IF promo_record.valid_until IS NOT NULL AND promo_record.valid_until < NOW() THEN
    SELECT json_build_object(
      'valid', false,
      'error', 'Promo code has expired'
    ) INTO result;
    RETURN result;
  END IF;

  -- Check if max uses reached
  IF promo_record.max_uses IS NOT NULL AND promo_record.current_uses >= promo_record.max_uses THEN
    SELECT json_build_object(
      'valid', false,
      'error', 'Promo code usage limit reached'
    ) INTO result;
    RETURN result;
  END IF;

  -- Check if applicable to tier
  IF promo_record.applicable_tiers IS NOT NULL AND NOT (p_tier = ANY(promo_record.applicable_tiers)) THEN
    SELECT json_build_object(
      'valid', false,
      'error', 'Promo code not applicable to this subscription tier'
    ) INTO result;
    RETURN result;
  END IF;

  -- Valid promo code
  SELECT json_build_object(
    'valid', true,
    'discount_type', promo_record.discount_type,
    'discount_value', promo_record.discount_value,
    'code', promo_record.code
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_trend(int) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_subscription(uuid, text, text, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION get_promo_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_promo_code(text, text) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Add comments
COMMENT ON FUNCTION get_admin_users() IS 'Returns all users with their subscription information for admin panel';
COMMENT ON FUNCTION get_subscription_stats() IS 'Returns subscription statistics for admin dashboard';
COMMENT ON FUNCTION get_dashboard_stats() IS 'Returns overall dashboard statistics for admin';
COMMENT ON FUNCTION get_revenue_trend(int) IS 'Returns daily revenue trend for the specified number of days';
COMMENT ON FUNCTION admin_update_subscription(uuid, text, text, timestamptz) IS 'Allows admin to update user subscription';
COMMENT ON FUNCTION get_promo_stats() IS 'Returns promo code statistics for admin panel';
COMMENT ON FUNCTION validate_promo_code(text, text) IS 'Validates a promo code and returns discount information';
