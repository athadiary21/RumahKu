import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Crown, Trash2, User, Pencil, Check, X, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFamily } from '@/hooks/useFamily';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { InviteMemberDialog } from '@/components/family/InviteMemberDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FamilyMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member' | 'child';
  joined_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

const FamilyPage = () => {
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const { data: familyData, refetch: refetchFamily } = useFamily();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const familyId = familyData?.family_id || '';
  const familyName = familyData?.family_groups?.name || 'Keluarga Saya';

  // Fetch family members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: async () => {
      if (!familyId) return [];
      
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles:user_id (
            full_name
          )
        `)
        .eq('family_id', familyId)
        .order('joined_at');

      if (error) throw error;
      return data as FamilyMember[];
    },
    enabled: !!familyId,
  });

  // Get current user's role
  const currentUserMember = members.find(m => m.user_id === user?.id);
  const isAdmin = currentUserMember?.role === 'admin';

  // Update family name mutation
  const updateFamilyNameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const { error } = await supabase
        .from('family_groups')
        .update({ name: newName })
        .eq('id', familyId);

      if (error) throw error;
    },
    onSuccess: () => {
      refetchFamily();
      toast({
        title: 'Berhasil',
        description: 'Nama keluarga berhasil diubah',
      });
      setIsEditingName(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengubah nama keluarga',
        variant: 'destructive',
      });
    },
  });

  // Update member role mutation
  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: 'admin' | 'member' | 'child' }) => {
      const { error } = await supabase
        .from('family_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      toast({
        title: 'Berhasil',
        description: 'Role anggota berhasil diubah',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengubah role anggota',
        variant: 'destructive',
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      toast({
        title: 'Berhasil',
        description: 'Anggota berhasil dihapus dari keluarga',
      });
      setMemberToRemove(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus anggota',
        variant: 'destructive',
      });
    },
  });

  const handleRemoveMember = () => {
    if (memberToRemove) {
      removeMemberMutation.mutate(memberToRemove.id);
    }
  };

  const handleStartEditName = () => {
    setEditedName(familyName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== familyName) {
      updateFamilyNameMutation.mutate(editedName.trim());
    } else {
      setIsEditingName(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const handleRoleChange = (memberId: string, newRole: 'admin' | 'member' | 'child') => {
    updateMemberRoleMutation.mutate({ memberId, newRole });
  };

  const getInitials = (name: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const getDisplayName = (member: FamilyMember) => {
    return member.profiles?.full_name || 'Anggota';
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <Badge variant="default" className="gap-1">
          <Crown className="h-3 w-3" />
          Admin
        </Badge>
      );
    }
    if (role === 'child') {
      return <Badge variant="outline">Anak</Badge>;
    }
    return <Badge variant="secondary">Member</Badge>;
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'member': return 'Member';
      case 'child': return 'Anak';
      default: return 'Member';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Keluarga
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola anggota keluarga dan kolaborasi
          </p>
        </div>
        {familyId && (
          <InviteMemberDialog familyId={familyId} familyName={familyName} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Family Members List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Anggota Keluarga</CardTitle>
            <CardDescription>
              {members.length} anggota dalam keluarga Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-48 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Belum Ada Anggota</p>
                <p className="text-sm mb-4">
                  Undang anggota keluarga untuk mulai berkolaborasi
                </p>
                {isAdmin && familyId && (
                  <InviteMemberDialog familyId={familyId} familyName={familyName} />
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(member.profiles?.full_name || null)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium truncate">
                          {getDisplayName(member)}
                        </p>
                        {member.user_id === user?.id && (
                          <Badge variant="outline" className="text-xs">Anda</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <p className="truncate">ID: {member.user_id.slice(0, 8)}...</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Bergabung {new Date(member.joined_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    
                    {/* Role selector for admin */}
                    <div className="flex items-center gap-2">
                      {isAdmin && member.user_id !== user?.id ? (
                        <Select
                          value={member.role}
                          onValueChange={(value: 'admin' | 'member' | 'child') => 
                            handleRoleChange(member.id, value)
                          }
                          disabled={updateMemberRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Crown className="h-3 w-3" />
                                Admin
                              </div>
                            </SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="child">Anak</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getRoleBadge(member.role)
                      )}
                      
                      {isAdmin && member.user_id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setMemberToRemove(member)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Family Info & Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Info Keluarga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Nama Keluarga</Label>
                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') handleCancelEditName();
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={handleSaveName}
                      disabled={updateFamilyNameMutation.isPending}
                    >
                      {updateFamilyNameMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={handleCancelEditName}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium">{familyName}</p>
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={handleStartEditName}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Anggota</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Role Anda</p>
                {getRoleBadge(currentUserMember?.role || 'member')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cara Undang Anggota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary font-bold">1.</span>
                <p>Klik tombol "Undang Anggota" di atas</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold">2.</span>
                <p>Pilih role dan buat link undangan</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold">3.</span>
                <p>Salin link dan bagikan ke anggota keluarga</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold">4.</span>
                <p>Mereka buka link, login/daftar, lalu otomatis bergabung</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Remove Member Confirmation */}
      {memberToRemove && (
        <AlertDialog open={true} onOpenChange={(open) => !open && setMemberToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Anggota Keluarga?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus{' '}
                <strong>{memberToRemove.profiles?.full_name || 'anggota ini'}</strong> dari keluarga?
                Mereka akan kehilangan akses ke semua data keluarga.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveMember}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default FamilyPage;