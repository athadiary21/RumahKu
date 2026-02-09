import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionBadge from '@/components/SubscriptionBadge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Calendar, 
  Utensils, 
  Wallet, 
  Shield, 
  Users, 
  Settings, 
  LogOut,
  ShieldCheck,
  ListTodo
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  useKeyboardShortcuts();

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!user,
  });

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Kalender', path: '/dashboard/calendar' },
    { icon: ListTodo, label: 'Tugas', path: '/dashboard/tasks' },
    { icon: Utensils, label: 'Dapur & Belanja', path: '/dashboard/kitchen' },
    { icon: Wallet, label: 'Keuangan', path: '/dashboard/finance' },
    { icon: Shield, label: 'Vault Digital', path: '/dashboard/vault' },
    { icon: Users, label: 'Keluarga', path: '/dashboard/family' },
    { icon: Settings, label: 'Pengaturan', path: '/dashboard/settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">RumahKu</h1>
        <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
        <div className="mt-2">
          <SubscriptionBadge />
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        {isAdmin && (
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => navigate('/admin')}
          >
            <ShieldCheck className="mr-3 h-5 w-5" />
            Admin Panel
          </Button>
        )}
        <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="mr-3 h-5 w-5" />
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Always visible Sidebar */}
      <aside className="w-64 border-r bg-card flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>

      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
};

export default Dashboard;
