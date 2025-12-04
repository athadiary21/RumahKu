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
import { UserPlus, Copy, Check, Loader2, X, Link } from 'lucide-react';
import { toast } from 'sonner';
import { useFamilyInvitations, FamilyInvitation } from '@/hooks/useFamilyInvitations';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface InviteMemberDialogProps {
  familyId: string;
  familyName: string;
}

export const InviteMemberDialog = ({ familyId, familyName }: InviteMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<'member' | 'child'>('member');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  
  const { 
    invitations, 
    createInvitation, 
    cancelInvitation,
    isCreating, 
    isCancelling 
  } = useFamilyInvitations();

  const handleCreateInvitation = async () => {
    try {
      await createInvitation({ role });
    } catch {
      // Error handled in hook
    }
  };

  const handleCopyLink = async (token: string) => {
    const inviteLink = `${window.location.origin}/join/${token}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedToken(token);
      toast.success('Link undangan berhasil disalin');
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      toast.error('Gagal menyalin link');
    }
  };

  const roleLabels = {
    member: 'Anggota',
    child: 'Anak',
    admin: 'Admin',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Undang Anggota
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Undang Anggota Keluarga</DialogTitle>
          <DialogDescription>
            Buat link undangan untuk menambahkan anggota baru ke "{familyName}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Create new invitation */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <Label>Buat Undangan Baru</Label>
            <div className="flex gap-2">
              <Select value={role} onValueChange={(v) => setRole(v as 'member' | 'child')}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Anggota (Akses Penuh)</SelectItem>
                  <SelectItem value="child">Anak (Akses Terbatas)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateInvitation} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link className="h-4 w-4" />
                )}
                <span className="ml-2">Buat Link</span>
              </Button>
            </div>
          </div>

          {/* Existing invitations */}
          {invitations.length > 0 && (
            <div className="space-y-3">
              <Label>Undangan Aktif</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {invitations.map((invitation) => (
                  <InvitationItem
                    key={invitation.id}
                    invitation={invitation}
                    onCopy={() => handleCopyLink(invitation.token)}
                    onCancel={() => cancelInvitation(invitation.id)}
                    isCopied={copiedToken === invitation.token}
                    isCancelling={isCancelling}
                    roleLabel={roleLabels[invitation.role]}
                  />
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Link undangan berlaku selama 7 hari. Bagikan ke anggota keluarga yang ingin bergabung.
          </p>
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

interface InvitationItemProps {
  invitation: FamilyInvitation;
  onCopy: () => void;
  onCancel: () => void;
  isCopied: boolean;
  isCancelling: boolean;
  roleLabel: string;
}

const InvitationItem = ({ 
  invitation, 
  onCopy, 
  onCancel, 
  isCopied, 
  isCancelling,
  roleLabel 
}: InvitationItemProps) => {
  const expiresAt = new Date(invitation.expires_at);
  const isExpired = expiresAt < new Date();

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {roleLabel}
          </Badge>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              Kedaluwarsa
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Berlaku sampai {format(expiresAt, 'dd MMM yyyy HH:mm', { locale: id })}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCopy}
          disabled={isExpired}
          title="Salin link"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isCancelling}
          title="Batalkan undangan"
        >
          <X className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};
