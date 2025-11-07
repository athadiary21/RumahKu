import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Bell, Shield, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SubscriptionSettings from '@/components/SubscriptionSettings';

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleUpdateProfile = () => {
    toast({
      title: 'Coming Soon',
      description: 'Fitur update profil akan segera tersedia',
    });
  };
  
  const handleChangePassword = () => {
    toast({
      title: 'Coming Soon',
      description: 'Fitur ganti password akan segera tersedia',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Pengaturan
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola profil dan preferensi akun Anda
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifikasi
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Keamanan
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <CreditCard className="h-4 w-4 mr-2" />
            Langganan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>Kelola informasi profil Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button onClick={handleUpdateProfile}>Update Profil</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferensi Notifikasi</CardTitle>
              <CardDescription>Atur notifikasi yang ingin Anda terima</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pengaturan notifikasi akan segera tersedia</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keamanan Akun</CardTitle>
              <CardDescription>Kelola keamanan akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={handleChangePassword}>Ganti Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
