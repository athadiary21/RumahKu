import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Tag, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFamily } from '@/hooks/useFamily';

interface PromoCodeInputProps {
  tier: string;
  originalAmount: number;
  onPromoApplied: (promoCode: string, discountAmount: number, finalAmount: number) => void;
  onPromoRemoved: () => void;
}

interface PromoCodeValidation {
  valid: boolean;
  discount_type: string;
  discount_value: number;
  message: string;
}

const PromoCodeInput = ({ 
  tier, 
  originalAmount, 
  onPromoApplied, 
  onPromoRemoved 
}: PromoCodeInputProps) => {
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<PromoCodeValidation | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const { data: familyData } = useFamily();

  const calculateDiscount = (
    amount: number,
    discountType: string,
    discountValue: number
  ): number => {
    if (discountType === 'percentage') {
      return (amount * discountValue) / 100;
    } else if (discountType === 'fixed') {
      return discountValue;
    }
    return 0;
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim() || !familyData?.family_id) {
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const { data, error } = await supabase.rpc('validate_promo_code', {
        promo_code: promoCode.trim().toUpperCase(),
      });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setValidationResult(data[0]);
      }
    } catch (error: any) {
      console.error('Promo code validation error:', error);
      setValidationResult({
        valid: false,
        discount_type: '',
        discount_value: 0,
        message: 'Terjadi kesalahan saat validasi kode promo',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const applyPromoCode = () => {
    if (!validationResult?.valid) return;

    const discountAmount = calculateDiscount(
      originalAmount,
      validationResult.discount_type,
      validationResult.discount_value
    );

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    setAppliedPromo({
      code: promoCode.trim().toUpperCase(),
      discountAmount,
      finalAmount,
    });

    onPromoApplied(promoCode.trim().toUpperCase(), discountAmount, finalAmount);
  };

  const removePromoCode = () => {
    setPromoCode('');
    setValidationResult(null);
    setAppliedPromo(null);
    onPromoRemoved();
  };

  if (appliedPromo) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-600" />
            <div>
              <p className="font-medium text-green-900">
                Kode Promo: {appliedPromo.code}
              </p>
              <p className="text-sm text-green-700">
                Diskon: Rp {appliedPromo.discountAmount.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removePromoCode}
            className="text-green-700 hover:text-green-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Harga Asli</p>
            <p className="text-sm line-through">
              Rp {originalAmount.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Bayar</p>
            <p className="text-lg font-bold text-primary">
              Rp {appliedPromo.finalAmount.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Masukkan kode promo"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value.toUpperCase());
              setValidationResult(null);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                validatePromoCode();
              }
            }}
            className="pl-10"
            disabled={isValidating}
          />
        </div>
        <Button
          onClick={validatePromoCode}
          disabled={!promoCode.trim() || isValidating}
          variant="outline"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Validasi'
          )}
        </Button>
      </div>

      {validationResult && (
        <Alert className={validationResult.valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <div className="flex items-start gap-2">
            {validationResult.valid ? (
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
            ) : (
              <X className="h-4 w-4 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertDescription className={validationResult.valid ? 'text-green-900' : 'text-red-900'}>
                {validationResult.message}
                {validationResult.valid && (
                  <div className="mt-2">
                    <p className="font-medium">
                      Diskon:{' '}
                      {validationResult.discount_type === 'percentage'
                        ? `${validationResult.discount_value}%`
                        : `Rp ${validationResult.discount_value.toLocaleString('id-ID')}`}
                    </p>
                    <p className="text-sm mt-1">
                      Hemat: Rp{' '}
                      {calculateDiscount(
                        originalAmount,
                        validationResult.discount_type,
                        validationResult.discount_value
                      ).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </AlertDescription>
              {validationResult.valid && (
                <Button
                  size="sm"
                  onClick={applyPromoCode}
                  className="mt-2"
                >
                  Gunakan Kode Promo
                </Button>
              )}
            </div>
          </div>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground">
        <p>💡 Tips: Gunakan kode promo untuk mendapatkan diskon spesial!</p>
      </div>
    </div>
  );
};

export default PromoCodeInput;
