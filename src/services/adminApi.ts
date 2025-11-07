import { supabase } from '@/integrations/supabase/client';

/**
 * Admin API Service
 * Provides methods to interact with admin-specific backend APIs
 */

export interface AdminUser {
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  family_id: string;
  family_name: string;
  subscription_tier: string;
  subscription_status: string;
  current_period_end: string | null;
  user_role: string;
}

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

export interface PromoStats {
  total_codes: number;
  active_codes: number;
  total_uses: number;
  expired_codes: number;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return userRole?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<{
  stats: DashboardStats;
  revenueTrend: RevenueTrend[];
  subscriptionBreakdown: SubscriptionBreakdown;
}> {
  try {
    const { data: stats, error: statsError } = await supabase
      .rpc('get_dashboard_stats');

    if (statsError) throw statsError;

    const { data: revenueTrend, error: trendError } = await supabase
      .rpc('get_revenue_trend', { days_back: 14 });

    if (trendError) throw trendError;

    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('tier, status');

    if (subsError) throw subsError;

    const subscriptionBreakdown = {
      free: subscriptions?.filter(s => s.tier === 'free').length || 0,
      family: subscriptions?.filter(s => s.tier === 'family').length || 0,
      premium: subscriptions?.filter(s => s.tier === 'premium').length || 0,
    };

    return {
      stats,
      revenueTrend: revenueTrend || [],
      subscriptionBreakdown,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

/**
 * Get all users with subscription info
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase.rpc('get_admin_users');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
}

/**
 * Update user subscription
 */
export async function updateUserSubscription(
  familyId: string,
  tier: string,
  status: string,
  expiresAt: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('admin_update_subscription', {
      p_family_id: familyId,
      p_tier: tier,
      p_status: status,
      p_current_period_end: expiresAt,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats() {
  try {
    const { data, error } = await supabase.rpc('get_subscription_stats');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    throw error;
  }
}

/**
 * Get all subscriptions with details
 */
export async function getSubscriptions() {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        family_groups(name),
        subscription_tiers(name, price_monthly, price_yearly)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
}

/**
 * Get promo code statistics
 */
export async function getPromoStats(): Promise<PromoStats> {
  try {
    const { data, error } = await supabase.rpc('get_promo_stats');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching promo stats:', error);
    throw error;
  }
}

/**
 * Get all promo codes
 */
export async function getPromoCodes() {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    throw error;
  }
}

/**
 * Create promo code
 */
export async function createPromoCode(promoData: {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number | null;
  applicable_tiers?: string[] | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}) {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert([{
        ...promoData,
        code: promoData.code.toUpperCase(),
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating promo code:', error);
    throw error;
  }
}

/**
 * Update promo code
 */
export async function updatePromoCode(
  id: string,
  promoData: Partial<{
    code: string;
    description?: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_uses?: number | null;
    applicable_tiers?: string[] | null;
    valid_from: string;
    valid_until: string;
    is_active: boolean;
  }>
) {
  try {
    const updateData = { ...promoData };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    const { data, error } = await supabase
      .from('promo_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating promo code:', error);
    throw error;
  }
}

/**
 * Delete promo code
 */
export async function deletePromoCode(id: string) {
  try {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting promo code:', error);
    throw error;
  }
}

/**
 * Validate promo code
 */
export async function validatePromoCode(code: string, tier: string) {
  try {
    const { data, error } = await supabase.rpc('validate_promo_code', {
      p_code: code.toUpperCase(),
      p_tier: tier,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error validating promo code:', error);
    throw error;
  }
}

/**
 * Get payment transactions
 */
export async function getPaymentTransactions(limit = 100) {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    throw error;
  }
}

/**
 * Get subscription history
 */
export async function getSubscriptionHistory(familyId?: string) {
  try {
    let query = supabase
      .from('subscription_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (familyId) {
      query = query.eq('family_id', familyId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    throw error;
  }
}
