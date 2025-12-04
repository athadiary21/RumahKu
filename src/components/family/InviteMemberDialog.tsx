import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface InviteMemberDialogProps {
  familyId: string;
  familyName: string;
}

export const InviteMemberDialog = ({ familyId, familyName }: InviteMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<'member' | 'child'>('member');
  const [copied, setCopied] = useState(false);

  // Generate a shareable invite link (in a real app, this would create a secure token)
  const inviteLink = `${window.location.origin}/join/${familyId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link undangan berhasil disalin');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin link');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Undang Anggota
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Undang Anggota Keluarga</DialogTitle>
          <DialogDescription>
            Bagikan link undangan untuk menambahkan anggota baru ke "{familyName}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Peran Anggota Baru</Label>
            <Select value={role} onValueChange={(v) => setRole(v as 'member' | 'child')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Anggota (Akses Penuh)</SelectItem>
                <SelectItem value="child">Anak (Akses Terbatas)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Link Undangan</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="flex-1 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Link ini dapat digunakan untuk bergabung dengan keluarga Anda
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
