import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, User, Bell, Shield, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SubscriptionSettings from '@/components/SubscriptionSettings';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // local state for dialogs and forms
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [fullName, setFullName] = useState<string>(user?.user_metadata?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notifEmail, setNotifEmail] = useState<boolean>(!!(user?.user_metadata?.notifications?.email));
  const [notifPromo, setNotifPromo] = useState<boolean>(!!(user?.user_metadata?.notifications?.promo));

  const handleOpenProfile = () => {
    setFullName(user?.user_metadata?.full_name || '');
    setProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
      if (error) throw error;
      toast({ title: 'Berhasil', description: 'Profil berhasil diperbarui' });
      setProfileOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message || 'Terjadi kesalahan' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setPasswordOpen(true);
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: 'Berhasil', description: 'Password berhasil diubah' });
      setPasswordOpen(false);
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message || 'Terjadi kesalahan' });
    }
  };

  // Notification preferences stored on user metadata as `notifications`
  const handleSaveNotifications = async () => {
    try {
      const notifications = { email: notifEmail, promo: notifPromo };
      const { error } = await supabase.auth.updateUser({ data: { notifications } });
      if (error) throw error;
      toast({ title: 'Berhasil', description: 'Preferensi notifikasi disimpan' });
      window.location.reload();
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message || 'Terjadi kesalahan' });
    }
  };

  // Read query params to set active tab and show payment results
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const payment = params.get('payment');
    if (tab) {
      const trigger = Array.from(document.querySelectorAll('[data-value]')).find((el) => el.getAttribute('data-value') === tab) as HTMLElement | undefined;
      if (trigger) trigger.click();
    }
    if (payment) {
      if (payment === 'success') {
        toast({ title: 'Pembayaran Berhasil', description: 'Langganan berhasil diproses' });
      } else if (payment === 'failed' || payment === 'error') {
        toast({ title: 'Pembayaran Gagal', description: 'Terjadi masalah saat pembayaran' });
      } else if (payment === 'pending') {
        toast({ title: 'Pembayaran Pending', description: 'Pembayaran sedang diproses' });
      }
      params.delete('payment');
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [location.search]);

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
              <Button onClick={handleOpenProfile}>Update Profil</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Dialog */}
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Profil</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Nama Lengkap</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProfileOpen(false)}>Batal</Button>
              <Button onClick={handleSaveProfile} disabled={savingProfile}>{savingProfile ? 'Menyimpan...' : 'Simpan'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferensi Notifikasi</CardTitle>
              <CardDescription>Atur notifikasi yang ingin Anda terima</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifikasi</p>
                  <p className="text-sm text-muted-foreground">Terima notifikasi aktivitas akun melalui email</p>
                </div>
                <Switch checked={notifEmail} onCheckedChange={(val: boolean) => setNotifEmail(val)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promo & Penawaran</p>
                  <p className="text-sm text-muted-foreground">Terima email promo dan penawaran</p>
                </div>
                <Switch checked={notifPromo} onCheckedChange={(val: boolean) => setNotifPromo(val)} />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>Simpan Preferensi</Button>
              </div>
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
              <Button variant="outline" onClick={handleOpenChangePassword}>Ganti Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Change password dialog */}
        <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ganti Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Password Baru</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPasswordOpen(false)}>Batal</Button>
              <Button onClick={handleChangePassword}>Ubah Password</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
