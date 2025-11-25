import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, CreditCard, Wallet, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: string;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    snap?: any;
  }
}

const PaymentDialog = ({ open, onOpenChange, tier, onSuccess }: PaymentDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'midtrans' | 'xendit'>('midtrans');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [midtransLoaded, setMidtransLoaded] = useState(false);

  // Pricing
  const pricing = {
    free: { monthly: 0, yearly: 0 },
    family: { monthly: 20000, yearly: 200000 },
    premium: { monthly: 100000, yearly: 1000000 },
  };

  const basePrice = pricing[tier as keyof typeof pricing]?.[billingPeriod] || 0;
  const finalPrice = Math.max(0, basePrice - discount);

  // Load Midtrans Snap script
  useEffect(() => {
    if (paymentMethod === 'midtrans' && !midtransLoaded) {
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
      script.onload = () => setMidtransLoaded(true);
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [paymentMethod, midtransLoaded]);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: 'Error',
        description: 'Masukkan kode promo',
        variant: 'destructive',
      });
      return;
    }

    setValidatingPromo(true);

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('active', true)
        .single();

      if (error || !data) {
        throw new Error('Kode promo tidak valid');
      }

      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = new Date(data.valid_until);

      if (now < validFrom || now > validUntil) {
        throw new Error('Kode promo sudah tidak berlaku');
      }

      if (data.max_uses !== null && data.current_uses >= data.max_uses) {
        throw new Error('Kode promo sudah mencapai batas penggunaan');
      }

      // Calculate discount
      let discountAmount = 0;
      if (data.discount_type === 'percentage') {
        discountAmount = (basePrice * data.discount_value) / 100;
      } else {
        discountAmount = data.discount_value;
      }

      setDiscount(discountAmount);
      setPromoApplied(true);

      toast({
        title: 'Berhasil!',
        description: `Kode promo berhasil diterapkan. Diskon: Rp ${discountAmount.toLocaleString('id-ID')}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setValidatingPromo(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoApplied(false);
    setDiscount(0);
    toast({
      title: 'Promo dihapus',
      description: 'Kode promo telah dihapus',
    });
  };

  const handlePayment = async () => {
    if (finalPrice === 0) {
      toast({
        title: 'Error',
        description: 'Harga tidak valid',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'midtrans') {
        await handleMidtransPayment();
      } else {
        await handleXenditPayment();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal memproses pembayaran',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleMidtransPayment = async () => {
    const { data, error } = await supabase.functions.invoke('create-midtrans-payment', {
      body: {
        tier,
        billing_period: billingPeriod,
        promo_code: promoApplied ? promoCode : null,
      },
    });

    if (error) throw error;

    if (!window.snap) {
      throw new Error('Midtrans Snap belum dimuat');
    }

    window.snap.pay(data.snap_token, {
      onSuccess: function(result: any) {
        console.log('Payment success:', result);
        toast({
          title: 'Pembayaran Berhasil!',
          description: 'Subscription Anda telah diaktifkan',
        });
        onOpenChange(false);
        onSuccess?.();
      },
      onPending: function(result: any) {
        console.log('Payment pending:', result);
        toast({
          title: 'Pembayaran Pending',
          description: 'Menunggu konfirmasi pembayaran',
        });
        onOpenChange(false);
      },
      onError: function(result: any) {
        console.log('Payment error:', result);
        toast({
          title: 'Pembayaran Gagal',
          description: 'Terjadi kesalahan saat memproses pembayaran',
          variant: 'destructive',
        });
        setLoading(false);
      },
      onClose: function() {
        console.log('Payment popup closed');
        setLoading(false);
      },
    });
  };

  const handleXenditPayment = async () => {
    const { data, error } = await supabase.functions.invoke('create-xendit-payment', {
      body: {
        tier,
        billing_period: billingPeriod,
        promo_code: promoApplied ? promoCode : null,
      },
    });

    if (error) throw error;

    // Open Xendit invoice URL in new tab
    window.open(data.invoice_url, '_blank');

    toast({
      title: 'Redirect ke Xendit',
      description: 'Silakan selesaikan pembayaran di tab baru',
    });

    onOpenChange(false);
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTierLabel = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade ke {getTierLabel(tier)}</DialogTitle>
          <DialogDescription>
            Pilih metode pembayaran dan periode billing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Billing Period */}
          <div className="space-y-2">
            <Label>Periode Billing</Label>
            <Select value={billingPeriod} onValueChange={(value: any) => setBillingPeriod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">
                  Bulanan - {formatPrice(pricing[tier as keyof typeof pricing]?.monthly || 0)}
                </SelectItem>
                <SelectItem value="yearly">
                  Tahunan - {formatPrice(pricing[tier as keyof typeof pricing]?.yearly || 0)}
                  <span className="text-green-600 ml-2">(Hemat 17%)</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Metode Pembayaran</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="midtrans" id="midtrans" />
                <Label htmlFor="midtrans" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Midtrans</div>
                    <div className="text-xs text-muted-foreground">
                      Credit Card, VA, E-Wallet, QRIS
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="xendit" id="xendit" />
                <Label htmlFor="xendit" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Wallet className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Xendit</div>
                    <div className="text-xs text-muted-foreground">
                      Virtual Account, QR Code, E-Wallet
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Promo Code */}
          <div className="space-y-2">
            <Label>Kode Promo (Opsional)</Label>
            <div className="flex gap-2">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Masukkan kode promo"
                disabled={promoApplied}
              />
              {promoApplied ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={removePromoCode}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={validatePromoCode}
                  disabled={validatingPromo || !promoCode.trim()}
                  className="shrink-0"
                >
                  {validatingPromo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            {promoApplied && (
              <p className="text-sm text-green-600">
                ✓ Kode promo diterapkan
              </p>
            )}
          </div>

          {/* Price Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Harga</span>
              <span>{formatPrice(basePrice)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Diskon</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(finalPrice)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handlePayment} disabled={loading || finalPrice === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Bayar Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
