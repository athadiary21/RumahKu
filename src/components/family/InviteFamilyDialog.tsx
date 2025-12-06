import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Mail, Check } from 'lucide-react';
import { useFamily } from '@/hooks/useFamily';

interface InviteFamilyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteFamilyDialog({ open, onOpenChange }: InviteFamilyDialogProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { data: familyData } = useFamily();

  const generateInviteCode = () => {
    // Generate a simple invite code (in production, this should be stored in DB)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setInviteCode(code);
    return code;
  };

  const handleGenerateCode = () => {
    const code = generateInviteCode();
    toast({
      title: 'Kode Undangan Dibuat',
      description: `Kode: ${code}`,
    });
  };

  const handleCopyCode = async () => {
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast({
        title: 'Berhasil!',
        description: 'Kode undangan disalin ke clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendInvite = async () => {
    if (!email || !familyData?.family_id) {
      toast({
        title: 'Error',
        description: 'Email tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if user exists in profiles (email column now exists)
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userError) throw userError;

      if (!userData) {
        toast({
          title: 'User Tidak Ditemukan',
          description: 'Email tersebut belum terdaftar di RumahKu. Minta mereka untuk mendaftar terlebih dahulu.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', familyData.family_id)
        .eq('user_id', userData.id)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: 'Sudah Menjadi Anggota',
          description: 'User ini sudah menjadi anggota keluarga Anda',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Add as family member
      const { error: insertError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyData.family_id,
          user_id: userData.id,
          role: 'member',
        });

      if (insertError) throw insertError;

      toast({
        title: 'Berhasil!',
        description: `${email} telah ditambahkan ke keluarga Anda`,
      });

      setEmail('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengundang anggota',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Undang Anggota Keluarga</DialogTitle>
          <DialogDescription>
            Tambahkan anggota baru ke keluarga Anda dengan email atau kode undangan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Invite */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Anggota</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendInvite();
                  }
                }}
              />
              <Button 
                onClick={handleSendInvite} 
                disabled={isLoading || !email}
                size="icon"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Masukkan email anggota yang sudah terdaftar di RumahKu
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Atau
              </span>
            </div>
          </div>

          {/* Invite Code */}
          <div className="space-y-2">
            <Label>Kode Undangan</Label>
            {inviteCode ? (
              <div className="flex gap-2">
                <Input
                  value={inviteCode}
                  readOnly
                  className="font-mono text-lg tracking-wider"
                />
                <Button 
                  onClick={handleCopyCode} 
                  variant="outline"
                  size="icon"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleGenerateCode} 
                variant="outline" 
                className="w-full"
              >
                Generate Kode Undangan
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Bagikan kode ini kepada anggota keluarga yang ingin bergabung
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
