-- Update get_dashboard_stats to use real payment transaction data
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(
  total_users BIGINT,
  active_subscriptions BIGINT,
  monthly_revenue NUMERIC,
  active_promo_codes BIGINT,
  completed_transactions BIGINT,
  pending_transactions BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active' AND tier != 'free') as active_subscriptions,
    (SELECT COALESCE(SUM(amount), 0) 
     FROM public.payment_transactions 
     WHERE status = 'completed' 
     AND created_at >= NOW() - INTERVAL '30 days') as monthly_revenue,
    (SELECT COUNT(*) FROM public.promo_codes WHERE active = true) as active_promo_codes,
    (SELECT COUNT(*) FROM public.payment_transactions WHERE status = 'completed')::BIGINT as completed_transactions,
    (SELECT COUNT(*) FROM public.payment_transactions WHERE status = 'pending')::BIGINT as pending_transactions;
END;
$$;