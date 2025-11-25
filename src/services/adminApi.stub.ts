// Stub implementation for adminApi until database functions are implemented
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  total_users: number;
  active_subscriptions: number;
  monthly_revenue: number;
  active_promo_codes: number;
  completed_transactions: number;
  pending_transactions: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
}

export interface SubscriptionBreakdown {
  free: number;
  family: number;
  premium: number;
}

export interface AdminUser {
  user_id: string;
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  subscription_tier: 'free' | 'family' | 'premium';
  subscription_status: string;
  expires_at: string;
  current_period_end: string;
  family_id: string;
  family_name: string;
  role: string;
}

export interface PromoStats {
  total_codes: number;
  active_codes: number;
  total_uses: number;
  expired_codes: number;
}

export async function getDashboardStats(): Promise<{
  stats: DashboardStats;
  revenueTrend: RevenueTrend[];
  subscriptionBreakdown: SubscriptionBreakdown;
}> {
  // TODO: Implement get_dashboard_stats and get_revenue_trend database functions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('tier, status');

  const subscriptionBreakdown = {
    free: subscriptions?.filter(s => s.tier === 'free').length || 0,
    family: subscriptions?.filter(s => s.tier === 'family').length || 0,
    premium: subscriptions?.filter(s => s.tier === 'premium').length || 0,
  };

  return {
    stats: {
      total_users: 0,
      active_subscriptions: subscriptions?.length || 0,
      monthly_revenue: 0,
      active_promo_codes: 0,
      completed_transactions: 0,
      pending_transactions: 0,
    },
    revenueTrend: [],
    subscriptionBreakdown,
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  // TODO: Implement get_admin_users database function
  return [];
}

export async function updateUserSubscription(
  familyId: string,
  tier: 'free' | 'family' | 'premium',
  status: string,
  expiresAt: string
): Promise<void> {
  // TODO: Implement admin_update_subscription database function
  await supabase
    .from('subscriptions')
    .update({ tier, status, expires_at: expiresAt })
    .eq('family_id', familyId);
}

export async function getSubscriptionStats() {
  // TODO: Implement get_subscription_stats database function
  return {
    total_subscriptions: 0,
    active_trials: 0,
    expired_subscriptions: 0,
    revenue_this_month: 0,
    churn_rate: 0,
  };
}

export async function getSubscriptions() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      family_groups(name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPromoStats(): Promise<PromoStats> {
  // TODO: Implement get_promo_stats database function
  return {
    total_codes: 0,
    active_codes: 0,
    total_uses: 0,
    expired_codes: 0,
  };
}

export async function getPromoCodes() {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function validatePromoCode(code: string) {
  const { data, error } = await supabase.rpc('validate_promo_code', {
    promo_code: code.toUpperCase(),
  });

  if (error) throw error;
  return data;
}

export async function getPaymentTransactions(limit = 100) {
  // TODO: Implement payment_transactions table
  return [];
}

export async function getTrafficAnalytics(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('traffic_logs')
    .select('*')
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getActivityLogs(limit = 100) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
