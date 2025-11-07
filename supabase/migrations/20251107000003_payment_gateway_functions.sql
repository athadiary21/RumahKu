-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE id = promo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  p_family_id UUID,
  p_resource_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_count INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get current subscription tier
  SELECT COALESCE(tier, 'free')
  INTO v_tier
  FROM subscriptions
  WHERE family_id = p_family_id
  AND status = 'active';

  -- If no subscription found, default to free
  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;

  -- Check based on resource type
  IF p_resource_type = 'accounts' THEN
    -- Count existing accounts
    SELECT COUNT(*)
    INTO v_count
    FROM accounts
    WHERE family_id = p_family_id;

    -- Get limit based on tier
    IF v_tier = 'free' THEN
      v_limit := 1;
    ELSE
      v_limit := 999999; -- Unlimited for paid tiers
    END IF;

    RETURN v_count < v_limit;

  ELSIF p_resource_type = 'budget_categories' THEN
    -- Count existing budget categories
    SELECT COUNT(*)
    INTO v_count
    FROM budget_categories
    WHERE family_id = p_family_id;

    -- Get limit based on tier
    IF v_tier = 'free' THEN
      v_limit := 3;
    ELSE
      v_limit := 999999; -- Unlimited for paid tiers
    END IF;

    RETURN v_count < v_limit;

  ELSE
    -- Unknown resource type, allow by default
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add check constraint to accounts table
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS check_account_limit;
ALTER TABLE accounts ADD CONSTRAINT check_account_limit
  CHECK (check_subscription_limit(family_id, 'accounts'));

-- Add check constraint to budget_categories table
ALTER TABLE budget_categories DROP CONSTRAINT IF EXISTS check_budget_category_limit;
ALTER TABLE budget_categories ADD CONSTRAINT check_budget_category_limit
  CHECK (check_subscription_limit(family_id, 'budget_categories'));

-- Create index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_family_status 
  ON subscriptions(family_id, status);

-- Create index for payment transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_status 
  ON payment_transactions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway 
  ON payment_transactions(payment_method, status);
