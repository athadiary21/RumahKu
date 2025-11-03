import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const FAQsAdmin = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAQs Management</h1>
          <p className="text-muted-foreground mt-2">
            Kelola FAQ (Frequently Asked Questions)
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar FAQ</CardTitle>
          <CardDescription>Pertanyaan yang sering ditanyakan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-12 text-muted-foreground">
            CRUD untuk FAQs akan segera tersedia
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQsAdmin;
