import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Settings, AlertCircle } from 'lucide-react';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { FamilyMemberCard } from '@/components/family/FamilyMemberCard';
import { InviteMemberDialog } from '@/components/family/InviteMemberDialog';
import { FamilyStats } from '@/components/family/FamilyStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const FamilyPage = () => {
  const {
    members,
    isLoading,
    error,
    updateRole,
    removeMember,
    isAdmin,
    familyId,
    familyName,
  } = useFamilyMembers();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Gagal memuat data keluarga. Silakan coba lagi.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            {familyName || 'Keluarga'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola anggota keluarga dan atur peran mereka
          </p>
        </div>
        {isAdmin && familyId && familyName && (
          <InviteMemberDialog familyId={familyId} familyName={familyName} />
        )}
      </div>

      <FamilyStats members={members} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Anggota Keluarga
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? 'Anda dapat mengubah peran atau menghapus anggota'
              : 'Daftar anggota dalam keluarga Anda'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada anggota keluarga</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  isAdmin={isAdmin}
                  onUpdateRole={(id, role) => updateRole({ memberId: id, newRole: role })}
                  onRemove={removeMember}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!isAdmin && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Informasi</AlertTitle>
          <AlertDescription>
            Hanya admin keluarga yang dapat mengundang anggota baru dan mengubah peran.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FamilyPage;
