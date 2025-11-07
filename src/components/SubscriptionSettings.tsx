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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Zap, Crown, Check, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentService, type PaymentGateway } from '@/services/payment';
import PromoCodeInput from './PromoCodeInput';
import SubscriptionHistory from './SubscriptionHistory';
import TrialBanner from './TrialBanner';

const SubscriptionSettings = () => {
  const { subscription, tierData, isActive, isTrial, trialDaysLeft } = useSubscription();
  const { user } = useAuth();
  const { data: familyData } = useFamily();
  const { toast } = useToast();

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('midtrans');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

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
    const tierInfo = allTiers.find((t) => t.tier === tier);
    if (!tierInfo) return;

    setSelectedTier(tier);
    const amount = billingPeriod === 'monthly' ? tierInfo.price_monthly : tierInfo.price_yearly;
    setFinalAmount(amount);
    setDiscountAmount(0);
    setPromoCode('');
    setUpgradeDialogOpen(true);
  };

  const handlePromoApplied = (code: string, discount: number, final: number) => {
    setPromoCode(code);
    setDiscountAmount(discount);
    setFinalAmount(final);
  };

  const handlePromoRemoved = () => {
    setPromoCode('');
    setDiscountAmount(0);
    const tierInfo = allTiers.find((t) => t.tier === selectedTier);
    if (tierInfo) {
      const amount = billingPeriod === 'monthly' ? tierInfo.price_monthly : tierInfo.price_yearly;
      setFinalAmount(amount);
    }
  };

  const processPayment = async () => {
    if (!user || !familyData?.family_id || !subscription?.id) {
      toast({
        title: 'Error',
        description: 'Data user tidak lengkap',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const tierInfo = allTiers.find((t) => t.tier === selectedTier);
      if (!tierInfo) throw new Error('Tier not found');

      const originalAmount = billingPeriod === 'monthly' 
        ? tierInfo.price_monthly 
        : tierInfo.price_yearly;

      const result = await paymentService.createPayment({
        gateway: selectedGateway,
        familyId: familyData.family_id,
        subscriptionId: subscription.id,
        tier: selectedTier,
        amount: finalAmount,
        customerName: user.email?.split('@')[0] || 'User',
        customerEmail: user.email || '',
        promoCode: promoCode || undefined,
      });

      if (result.success && result.paymentUrl) {
        // Redirect to payment page
        window.location.href = result.paymentUrl;
      } else {
        throw new Error(result.error || 'Failed to create payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat pembayaran',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
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
            <div className="text-right">
              <Badge className={isActive ? 'bg-green-500' : 'bg-red-500'}>
                {isActive ? 'Active' : 'Expired'}
              </Badge>
              {isTrial && trialDaysLeft !== null && (
                <p className="text-sm text-muted-foreground mt-1">
                  Trial: {trialDaysLeft} hari lagi
                </p>
              )}
              {subscription?.expires_at && !isTrial && (
                <p className="text-sm text-muted-foreground mt-1">
                  Berlaku hingga: {new Date(subscription.expires_at).toLocaleDateString('id-ID')}
                </p>
              )}
            </div>
          </div>

          {/* Usage Statistics */}
          {usageStats && tierData && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Akun Bank/Wallet</span>
                  <span>
                    {usageStats.accountsCount} /{' '}
                    {tierData.max_accounts || '∞'}
                  </span>
                </div>
                <Progress
                  value={
                    tierData.max_accounts
                      ? (usageStats.accountsCount / tierData.max_accounts) * 100
                      : 0
                  }
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Kategori Budget</span>
                  <span>
                    {usageStats.categoriesCount} /{' '}
                    {tierData.max_budget_categories || '∞'}
                  </span>
                </div>
                <Progress
                  value={
                    tierData.max_budget_categories
                      ? (usageStats.categoriesCount / tierData.max_budget_categories) * 100
                      : 0
                  }
                />
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
              const features = Array.isArray(tier.features) ? tier.features : [];
              const isCurrent = subscription?.tier === tier.tier;

              return (
                <Card key={tier.id} className={isCurrent ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-6 w-6 ${getTierColor(tier.tier)}`} />
                      <CardTitle>{tier.name}</CardTitle>
                    </div>
                    <CardDescription>
                      <span className="text-2xl font-bold">
                        {tier.price_monthly === 0
                          ? 'Gratis'
                          : `Rp ${tier.price_monthly.toLocaleString('id-ID')}`}
                      </span>
                      {tier.price_monthly > 0 && <span className="text-sm">/bulan</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrent ? 'outline' : 'default'}
                      disabled={isCurrent || tier.tier === 'free'}
                      onClick={() => handleUpgrade(tier.tier)}
                    >
                      {isCurrent ? 'Paket Saat Ini' : tier.tier === 'free' ? 'Paket Gratis' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subscription History */}
      <SubscriptionHistory />

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Subscription</DialogTitle>
            <DialogDescription>
              Pilih metode pembayaran dan periode billing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Gateway</label>
              <Select value={selectedGateway} onValueChange={(v: PaymentGateway) => setSelectedGateway(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midtrans">Midtrans</SelectItem>
                  <SelectItem value="xendit">Xendit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Billing Period</label>
              <Select value={billingPeriod} onValueChange={(v: any) => {
                setBillingPeriod(v);
                const tierInfo = allTiers.find((t) => t.tier === selectedTier);
                if (tierInfo) {
                  const amount = v === 'monthly' ? tierInfo.price_monthly : tierInfo.price_yearly;
                  setFinalAmount(amount);
                  setDiscountAmount(0);
                  setPromoCode('');
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly (Save 17%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Promo Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Kode Promo (Opsional)</label>
              <PromoCodeInput
                tier={selectedTier}
                originalAmount={
                  allTiers.find((t) => t.tier === selectedTier)?.[
                    billingPeriod === 'monthly' ? 'price_monthly' : 'price_yearly'
                  ] || 0
                }
                onPromoApplied={handlePromoApplied}
                onPromoRemoved={handlePromoRemoved}
              />
            </div>

            {/* Summary */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Paket</span>
                <span className="font-medium">
                  {allTiers.find((t) => t.tier === selectedTier)?.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Periode</span>
                <span className="font-medium">
                  {billingPeriod === 'monthly' ? 'Bulanan' : 'Tahunan'}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Diskon</span>
                  <span className="font-medium">
                    -Rp {discountAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">
                  Rp {finalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={processPayment} disabled={isProcessing}>
              <CreditCard className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Bayar Sekarang'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionSettings;
