import { useSubscription } from '@/contexts/SubscriptionContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';

const TrialBanner = () => {
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  if (!subscription?.is_trial || !subscription?.trial_ends_at) {
    return null;
  }

  const trialEndsAt = new Date(subscription.trial_ends_at);
  const daysLeft = differenceInDays(trialEndsAt, new Date());

  if (daysLeft < 0) {
    return null; // Trial already ended
  }

  const isUrgent = daysLeft <= 3;

  return (
    <Alert className={`${isUrgent ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50'}`}>
      <div className="flex items-start gap-3">
        {isUrgent ? (
          <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
        ) : (
          <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
        )}
        <div className="flex-1">
          <AlertTitle className={isUrgent ? 'text-orange-900' : 'text-blue-900'}>
            {isUrgent ? '⚠️ Trial Period Segera Berakhir!' : '🎉 Anda Sedang Trial'}
          </AlertTitle>
          <AlertDescription className={`mt-2 ${isUrgent ? 'text-orange-800' : 'text-blue-800'}`}>
            <p className="mb-2">
              Trial period Anda akan berakhir dalam <strong>{daysLeft} hari</strong> lagi
              ({trialEndsAt.toLocaleDateString('id-ID')}).
            </p>
            <p className="text-sm">
              Upgrade sekarang untuk terus menikmati semua fitur premium tanpa gangguan.
            </p>
          </AlertDescription>
          <div className="mt-3">
            <Button
              size="sm"
              variant={isUrgent ? 'default' : 'outline'}
              onClick={() => navigate('/dashboard/settings?tab=subscription')}
            >
              Upgrade Sekarang
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default TrialBanner;
