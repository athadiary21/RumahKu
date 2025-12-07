import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Utensils, Wallet, Shield, Users, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFamily } from '@/hooks/useFamily';
import { DashboardCardSkeleton } from '@/components/ui/skeletons';
import { format, startOfWeek, endOfWeek, isToday, isPast, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const DashboardHome = () => {
  const { user } = useAuth();
  const { data: familyData } = useFamily();
  const navigate = useNavigate();

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // Query untuk events minggu ini
  const { data: weekEvents = [], isLoading: eventsLoading } = useQuery({
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
  const { data: budgetSpent = 0, isLoading: budgetLoading } = useQuery({
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
  const { data: documentCount = 0, isLoading: docsLoading } = useQuery({
    queryKey: ['document-count', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return 0;
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyData.family_id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!familyData?.family_id,
  });

  // Query untuk tugas hari ini
  const { data: todayTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['today-tasks', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return [];
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('family_tasks')
        .select('*')
        .eq('family_id', familyData.family_id)
        .neq('status', 'completed')
        .or(`due_date.eq.${today},due_date.lt.${today},is_recurring.eq.true`)
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!familyData?.family_id,
  });

  const priorityColors: Record<string, string> = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-muted text-muted-foreground border-border',
  };

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
    },
    {
      icon: Users,
      title: 'Keluarga',
      description: 'Kelola anggota keluarga Anda',
      color: 'text-pink-500',
      path: '/dashboard/family'
    },
    {
      icon: CheckSquare,
      title: 'Tugas Keluarga',
      description: 'Atur tugas dan pekerjaan rumah',
      color: 'text-cyan-500',
      path: '/dashboard/tasks'
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Card 
            key={action.title} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(action.path)}
          >
            <CardHeader className="pb-2">
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

      {/* Widget Tugas Hari Ini */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Tugas Hari Ini
            </CardTitle>
            <CardDescription>Tugas yang perlu dikerjakan</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/tasks')}>
            Lihat Semua
          </Button>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="space-y-3">
              <DashboardCardSkeleton />
              <DashboardCardSkeleton />
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Tidak ada tugas untuk hari ini</p>
              <Button variant="link" onClick={() => navigate('/dashboard/tasks')}>
                Tambah tugas baru
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map((task) => {
                const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));
                const isDueToday = task.due_date && isToday(parseISO(task.due_date));
                
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                    onClick={() => navigate('/dashboard/tasks')}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.priority === 'high' ? 'bg-destructive' :
                        task.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.is_recurring && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.recurrence_pattern}
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Terlambat
                        </Badge>
                      )}
                      {isDueToday && !isOverdue && (
                        <Badge className="text-xs bg-primary">Hari ini</Badge>
                      )}
                      <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                        {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {todayTasks.length > 5 && (
                <Button variant="ghost" className="w-full" onClick={() => navigate('/dashboard/tasks')}>
                  +{todayTasks.length - 5} tugas lainnya
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistik Cepat</CardTitle>
          <CardDescription>Ringkasan aktivitas keluarga Anda minggu ini</CardDescription>
        </CardHeader>
        <CardContent>
          {(eventsLoading || budgetLoading || docsLoading) ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DashboardCardSkeleton />
              <DashboardCardSkeleton />
              <DashboardCardSkeleton />
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
