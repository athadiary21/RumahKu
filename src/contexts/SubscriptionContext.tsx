import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type SubscriptionTier = Database['public']['Enums']['subscription_tier'];

interface SubscriptionTierData {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price_monthly: number;
  price_yearly: number;
  max_accounts: number | null;
  max_budget_categories: number | null;
  max_wallets: number | null;
  features: any;
}

interface SubscriptionData {
  id: string;
  family_id: string;
  tier: SubscriptionTier;
  status: string;
  started_at: string;
  expires_at: string | null;
  is_trial: boolean;
  trial_ends_at: string | null;
  auto_renew: boolean;
  current_period_end: string | null;
  billing_period: string | null;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  tierData: SubscriptionTierData | null;
  loading: boolean;
  canAddAccount: (currentCount: number) => boolean;
  canAddBudgetCategory: (currentCount: number) => boolean;
  canAddWallet: (currentCount: number) => boolean;
  hasFeature: (feature: string) => boolean;
  isActive: boolean;
  isTrial: boolean;
  trialDaysLeft: number | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [tierData, setTierData] = useState<SubscriptionTierData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setTierData(null);
      setLoading(false);
      return;
    }

    try {
      // Get user's family_id
      const { data: familyMember, error: familyError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (familyError || !familyMember) {
        console.error('Error fetching family:', familyError);
        setLoading(false);
        return;
      }

      // Get subscription for this family
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('family_id', familyMember.family_id)
        .single();

      if (subError) {
        console.error('Error fetching subscription:', subError);
        setLoading(false);
        return;
      }

      setSubscription(subData as SubscriptionData);

      // Get tier details
      const { data: tierInfo, error: tierError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('tier', subData.tier)
        .single();

      if (tierError) {
        console.error('Error fetching tier data:', tierError);
      } else {
        setTierData(tierInfo as SubscriptionTierData);
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const canAddAccount = (currentCount: number): boolean => {
    if (!tierData) return false;
    if (tierData.max_accounts === null) return true; // unlimited
    return currentCount < tierData.max_accounts;
  };

  const canAddBudgetCategory = (currentCount: number): boolean => {
    if (!tierData) return false;
    if (tierData.max_budget_categories === null) return true; // unlimited
    return currentCount < tierData.max_budget_categories;
  };

  const canAddWallet = (currentCount: number): boolean => {
    if (!tierData) return false;
    if (tierData.max_wallets === null) return true; // unlimited
    return currentCount < tierData.max_wallets;
  };

  const hasFeature = (feature: string): boolean => {
    if (!tierData || !tierData.features) return false;
    const features = Array.isArray(tierData.features) ? tierData.features : [];
    return features.some((f: string) => f.toLowerCase().includes(feature.toLowerCase()));
  };

  const isActive = (): boolean => {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    
    // Check trial
    if (subscription.is_trial && subscription.trial_ends_at) {
      return new Date(subscription.trial_ends_at) > new Date();
    }
    
    // Check regular subscription
    if (!subscription.expires_at) return true; // no expiry = lifetime
    return new Date(subscription.expires_at) > new Date();
  };

  const isTrial = (): boolean => {
    if (!subscription) return false;
    return subscription.is_trial && 
           subscription.trial_ends_at !== null &&
           new Date(subscription.trial_ends_at) > new Date();
  };

  const getTrialDaysLeft = (): number | null => {
    if (!subscription?.is_trial || !subscription?.trial_ends_at) return null;
    const trialEnd = new Date(subscription.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        tierData,
        loading,
        canAddAccount,
        canAddBudgetCategory,
        canAddWallet,
        hasFeature,
        isActive: isActive(),
        isTrial: isTrial(),
        trialDaysLeft: getTrialDaysLeft(),
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
