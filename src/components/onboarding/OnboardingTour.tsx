import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Utensils, Wallet, Shield, Users, Keyboard, CheckSquare, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  action?: () => void;
}

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps: OnboardingStep[] = [
    {
      title: 'Selamat Datang di RumahKu! 🏠',
      description: 'RumahKu adalah platform manajemen keluarga lengkap yang membantu Anda mengatur kehidupan keluarga dengan lebih mudah dan terorganisir. Mari kami tunjukkan semua fitur utamanya!',
      icon: Home,
    },
    {
      title: 'Kalender Keluarga 📅',
      description: 'Atur jadwal keluarga, buat reminder untuk acara penting, dan pastikan semua anggota keluarga selalu tahu agenda yang akan datang.',
      icon: Calendar,
      action: () => navigate('/dashboard/calendar'),
    },
    {
      title: 'Dapur & Belanja 🍳',
      description: 'Rencanakan menu mingguan dengan 27+ resep Indonesia, simpan resep favorit keluarga, dan buat daftar belanja yang terorganisir.',
      icon: Utensils,
      action: () => navigate('/dashboard/kitchen'),
    },
    {
      title: 'Keuangan Cerdas 💰',
      description: 'Kelola budget keluarga, tracking pengeluaran dengan grafik visual, dan capai tujuan keuangan bersama.',
      icon: Wallet,
      action: () => navigate('/dashboard/finance'),
    },
    {
      title: 'Vault Digital 🔒',
      description: 'Simpan dokumen penting keluarga dengan aman seperti KTP, akta kelahiran, sertifikat, dengan tracking tanggal kadaluarsa.',
      icon: Shield,
      action: () => navigate('/dashboard/vault'),
    },
    {
      title: 'Manajemen Keluarga 👨‍👩‍👧‍👦',
      description: 'Kelola anggota keluarga, atur role (Admin, Member, Child), dan undang anggota baru untuk bergabung dengan keluarga Anda.',
      icon: Users,
      action: () => navigate('/dashboard/family'),
    },
    {
      title: 'Tugas Keluarga ✅',
      description: 'Bagi tugas rumah tangga dengan mudah! Assign tugas ke anggota keluarga, set prioritas, dan buat tugas berulang (harian/mingguan/bulanan).',
      icon: CheckSquare,
      action: () => navigate('/dashboard/tasks'),
    },
    {
      title: 'Keyboard Shortcuts ⌨️',
      description: 'Navigasi cepat dengan keyboard! Tekan "?" untuk bantuan. Shortcuts: g+d (Dashboard), g+c (Kalender), g+k (Dapur), g+f (Keuangan), g+v (Vault), g+p (Keluarga), g+t (Tugas), g+s (Pengaturan).',
      icon: Keyboard,
    },
  ];

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      // Delay opening to let the dashboard load first
      setTimeout(() => setOpen(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setOpen(false);
    setCurrentStep(0);
  };

  const handleTryFeature = () => {
    const step = steps[currentStep];
    if (step.action) {
      step.action();
      handleComplete();
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-primary'
                  : index < currentStep
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious} className="flex-1">
                Kembali
              </Button>
            )}
            {currentStep === 0 && (
              <Button variant="ghost" onClick={handleSkip} className="flex-1">
                Lewati
              </Button>
            )}
          </div>
          <div className="flex gap-2 flex-1">
            {currentStepData.action && currentStep > 0 && (
              <Button variant="outline" onClick={handleTryFeature} className="flex-1">
                Coba Sekarang
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentStep === steps.length - 1 ? 'Selesai' : 'Lanjut'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
