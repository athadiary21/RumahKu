import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Utensils, Wallet, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFamily } from '@/hooks/useFamily';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const DashboardHome = () => {
  const { user } = useAuth();
  const { data: familyData } = useFamily();
  const navigate = useNavigate();

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // Query untuk events minggu ini
  const { data: weekEvents = [] } = useQuery({
    queryKey: ['week-events', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return [];
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('family_id', familyData.family_id)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time');
      if (error) throw error;
      return data || [];
    },
    enabled: !!familyData?.family_id,
  });

  // Query untuk budget terpakai minggu ini
  const { data: budgetSpent = 0 } = useQuery({
    queryKey: ['budget-spent', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return 0;
      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('family_id', familyData.family_id)
        .eq('type', 'expense')
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));
      if (error) throw error;
      return data?.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0) || 0;
    },
    enabled: !!familyData?.family_id,
  });

  // Query untuk dokumen tersimpan
  const { data: documentCount = 0 } = useQuery({
    queryKey: ['document-count', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return 0;
      const { count, error } = await supabase
        .from('vault_documents')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyData.family_id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!familyData?.family_id,
  });

  const quickActions = [
    {
      icon: Calendar,
      title: 'Kalender Keluarga',
      description: 'Atur jadwal & reminder keluarga',
      color: 'text-blue-500',
      path: '/dashboard/calendar'
    },
    {
      icon: Utensils,
      title: 'Dapur & Belanja',
      description: 'Rencanakan menu & belanja mingguan',
      color: 'text-green-500',
      path: '/dashboard/kitchen'
    },
    {
      icon: Wallet,
      title: 'Keuangan Cerdas',
      description: 'Kelola budget & tracking pengeluaran',
      color: 'text-orange-500',
      path: '/dashboard/finance'
    },
    {
      icon: Shield,
      title: 'Vault Digital',
      description: 'Simpan dokumen penting dengan aman',
      color: 'text-purple-500',
      path: '/dashboard/vault'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Selamat Datang! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Kelola kehidupan keluarga Anda dengan lebih mudah dan terorganisir
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => (
          <Card 
            key={action.title} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(action.path)}
          >
            <CardHeader>
              <action.icon className={`h-8 w-8 ${action.color} mb-2`} />
              <CardTitle className="text-lg">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">
                Buka Modul
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistik Cepat</CardTitle>
          <CardDescription>Ringkasan aktivitas keluarga Anda minggu ini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{weekEvents.length}</p>
              <p className="text-sm text-muted-foreground">Event Minggu Ini</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">
                {typeof budgetSpent === 'number' 
                  ? `Rp ${budgetSpent.toLocaleString('id-ID')}` 
                  : 'Rp 0'}
              </p>
              <p className="text-sm text-muted-foreground">Budget Terpakai</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{documentCount}</p>
              <p className="text-sm text-muted-foreground">Dokumen Tersimpan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
