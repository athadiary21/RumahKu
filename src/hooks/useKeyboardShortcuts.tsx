import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let keySequence: string[] = [];
    let sequenceTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Clear sequence timeout
      clearTimeout(sequenceTimeout);

      // Add key to sequence
      keySequence.push(e.key.toLowerCase());

      // Set timeout to clear sequence after 1 second
      sequenceTimeout = setTimeout(() => {
        keySequence = [];
      }, 1000);

      // Check for two-key sequences (g + x)
      if (keySequence.length === 2) {
        const [first, second] = keySequence;

        if (first === 'g') {
          switch (second) {
            case 'd':
              navigate('/dashboard');
              toast({ title: 'Navigasi', description: 'Menuju Dashboard' });
              break;
            case 'c':
              navigate('/dashboard/calendar');
              toast({ title: 'Navigasi', description: 'Menuju Kalender' });
              break;
            case 'k':
              navigate('/dashboard/kitchen');
              toast({ title: 'Navigasi', description: 'Menuju Dapur & Belanja' });
              break;
            case 'f':
              navigate('/dashboard/finance');
              toast({ title: 'Navigasi', description: 'Menuju Keuangan' });
              break;
            case 'v':
              navigate('/dashboard/vault');
              toast({ title: 'Navigasi', description: 'Menuju Vault Digital' });
              break;
            case 'p':
              navigate('/dashboard/family');
              toast({ title: 'Navigasi', description: 'Menuju Keluarga' });
              break;
            case 't':
              navigate('/dashboard/tasks');
              toast({ title: 'Navigasi', description: 'Menuju Tugas Keluarga' });
              break;
            case 's':
              navigate('/dashboard/settings');
              toast({ title: 'Navigasi', description: 'Menuju Pengaturan' });
              break;
          }
        }

        // Clear sequence after handling
        keySequence = [];
      }

      // Single key shortcuts
      if (keySequence.length === 1) {
        const key = keySequence[0];

        // Show help with ?
        if (key === '?') {
          toast({
            title: 'Keyboard Shortcuts',
            description: (
              <div className="space-y-2 text-sm">
                <div><strong>g + d</strong>: Dashboard</div>
                <div><strong>g + c</strong>: Kalender</div>
                <div><strong>g + k</strong>: Dapur & Belanja</div>
                <div><strong>g + f</strong>: Keuangan</div>
                <div><strong>g + v</strong>: Vault Digital</div>
                <div><strong>g + p</strong>: Keluarga</div>
                <div><strong>g + t</strong>: Tugas Keluarga</div>
                <div><strong>g + s</strong>: Pengaturan</div>
                <div><strong>?</strong>: Tampilkan bantuan ini</div>
              </div>
            ),
            duration: 10000,
          });
          keySequence = [];
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(sequenceTimeout);
    };
  }, [navigate]);
}
