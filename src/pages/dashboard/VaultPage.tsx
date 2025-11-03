import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Plus, FileText } from 'lucide-react';

const VaultPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Vault Digital
          </h1>
          <p className="text-muted-foreground mt-2">
            Simpan dan kelola dokumen penting keluarga dengan aman
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Upload Dokumen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Properti', 'Pendidikan', 'Kesehatan', 'Asuransi'].map((category) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">dokumen</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dokumen Tersimpan</CardTitle>
          <CardDescription>Semua dokumen penting keluarga Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada dokumen tersimpan</p>
            <p className="text-sm mt-2">Upload dokumen penting keluarga dengan aman</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VaultPage;
