import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/hooks/useFamily';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Zap, Crown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PaymentDialog from './PaymentDialog';
import SubscriptionHistory from './SubscriptionHistory';
import TrialBanner from './TrialBanner';

const SubscriptionSettings = () => {
  const { subscription, tierData, isActive, isTrial, trialDaysLeft } = useSubscription();
  const { user } = useAuth();
  const { data: familyData } = useFamily();
  const { toast } = useToast();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');

  // Fetch all available tiers
  const { data: allTiers = [] } = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch usage statistics
  const { data: usageStats } = useQuery({
    queryKey: ['usage-stats', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return null;

      const [accountsResult, categoriesResult] = await Promise.all([
        supabase
          .from('accounts')
          .select('id', { count: 'exact', head: true })
          .eq('family_id', familyData.family_id),
        supabase
          .from('budget_categories')
          .select('id', { count: 'exact', head: true })
          .eq('family_id', familyData.family_id),
      ]);

      return {
        accountsCount: accountsResult.count || 0,
        categoriesCount: categoriesResult.count || 0,
      };
    },
    enabled: !!familyData?.family_id,
  });

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return Shield;
      case 'family':
        return Zap;
      case 'premium':
        return Crown;
      default:
        return Shield;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'text-gray-500';
      case 'family':
        return 'text-blue-500';
      case 'premium':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleUpgrade = (tier: string) => {
    setSelectedTier(tier);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    toast({
      title: 'Berhasil!',
      description: 'Subscription berhasil diupgrade',
    });
    // Refresh subscription data
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Trial Banner */}
      {isTrial && <TrialBanner />}

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Paket Saat Ini</CardTitle>
          <CardDescription>Informasi subscription Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {tierData && (
                <>
                  {(() => {
                    const Icon = getTierIcon(tierData.tier);
                    return <Icon className={`h-8 w-8 ${getTierColor(tierData.tier)}`} />;
                  })()}
                  <div>
                    <h3 className="font-semibold text-lg">{tierData.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tierData.price_monthly === 0
                        ? 'Gratis'
                        : `Rp ${tierData.price_monthly.toLocaleString('id-ID')}/bulan`}
                    </p>
                  </div>
                </>
              )}
            </div>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {subscription && subscription.current_period_end && (
            <div className="text-sm text-muted-foreground">
              <p>
                Berlaku hingga:{' '}
                {new Date(subscription.current_period_end).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* Usage Statistics */}
          {usageStats && tierData && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm">Penggunaan</h4>
              
              {/* Accounts */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Akun</span>
                  <span>
                    {usageStats.accountsCount} / {tierData.max_accounts === null ? '∞' : tierData.max_accounts}
                  </span>
                </div>
                {tierData.max_accounts !== null && (
                  <Progress
                    value={(usageStats.accountsCount / tierData.max_accounts) * 100}
                    className="h-2"
                  />
                )}
              </div>

              {/* Budget Categories */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Kategori Budget</span>
                  <span>
                    {usageStats.categoriesCount} /{' '}
                    {tierData.max_budget_categories === null ? '∞' : tierData.max_budget_categories}
                  </span>
                </div>
                {tierData.max_budget_categories !== null && (
                  <Progress
                    value={(usageStats.categoriesCount / tierData.max_budget_categories) * 100}
                    className="h-2"
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Paket Tersedia</CardTitle>
          <CardDescription>Pilih paket yang sesuai dengan kebutuhan Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {allTiers.map((tier) => {
              const Icon = getTierIcon(tier.tier);
              const isCurrentTier = tierData?.tier === tier.tier;
              const features = tier.features || [];

              return (
                <div
                  key={tier.id}
                  className={`border rounded-lg p-6 space-y-4 ${
                    isCurrentTier ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-8 w-8 ${getTierColor(tier.tier)}`} />
                    <div>
                      <h3 className="font-semibold text-lg">{tier.name}</h3>
                      {isCurrentTier && (
                        <Badge variant="outline" className="mt-1">
                          Paket Saat Ini
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-3xl font-bold">
                      {tier.price_monthly === 0 ? (
                        'Gratis'
                      ) : (
                        <>
                          Rp {tier.price_monthly.toLocaleString('id-ID')}
                          <span className="text-sm font-normal text-muted-foreground">/bulan</span>
                        </>
                      )}
                    </p>
                    {tier.price_yearly > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        atau Rp {tier.price_yearly.toLocaleString('id-ID')}/tahun
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {(Array.isArray(tier.features) ? tier.features : []).map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrentTier ? 'outline' : 'default'}
                    disabled={isCurrentTier}
                    onClick={() => handleUpgrade(tier.tier)}
                  >
                    {isCurrentTier ? 'Paket Aktif' : tier.price_monthly === 0 ? 'Paket Gratis' : 'Upgrade'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subscription History */}
      <SubscriptionHistory />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        tier={selectedTier}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default SubscriptionSettings;
