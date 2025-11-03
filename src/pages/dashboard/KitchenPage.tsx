import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, Plus, ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const KitchenPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Utensils className="h-8 w-8 text-primary" />
            Dapur & Belanja
          </h1>
          <p className="text-muted-foreground mt-2">
            Rencanakan menu dan kelola daftar belanja
          </p>
        </div>
      </div>

      <Tabs defaultValue="shopping" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shopping">Daftar Belanja</TabsTrigger>
          <TabsTrigger value="recipes">Resep & Menu</TabsTrigger>
        </TabsList>

        <TabsContent value="shopping" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daftar Belanja Mingguan</CardTitle>
                  <CardDescription>Kelola kebutuhan belanja keluarga</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Daftar belanja masih kosong</p>
                <p className="text-sm mt-2">Mulai tambahkan item yang perlu dibeli</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resep & Rencana Menu</CardTitle>
                  <CardDescription>Rencanakan menu mingguan keluarga</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Resep
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada resep tersimpan</p>
                <p className="text-sm mt-2">Tambahkan resep favorit keluarga Anda</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KitchenPage;
