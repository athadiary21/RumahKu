import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, UserPlus } from 'lucide-react';

const FamilyPage = () => {
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
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Undang Anggota
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Anggota Keluarga</CardTitle>
            <CardDescription>Daftar anggota dalam keluarga Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Kelola anggota keluarga Anda</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Keluarga</CardTitle>
            <CardDescription>Log aktivitas terkini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Belum ada aktivitas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FamilyPage;
