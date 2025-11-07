import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Settings, FileText, MessageSquare, HelpCircle, DollarSign, Home, Users, CreditCard, Tag } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is admin
  const { data: isAdmin, isLoading } = useQuery({
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

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Website Content', path: '/admin/content' },
    { icon: MessageSquare, label: 'Testimonials', path: '/admin/testimonials' },
    { icon: HelpCircle, label: 'FAQs', path: '/admin/faqs' },
    { icon: DollarSign, label: 'Pricing', path: '/admin/pricing' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CreditCard, label: 'Subscriptions', path: '/admin/subscriptions' },
    { icon: Tag, label: 'Promo Codes', path: '/admin/promo-codes' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola Website</p>
        </div>

        <nav className="p-4 space-y-2">
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
          
          <div className="pt-4 border-t mt-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="mr-3 h-5 w-5" />
              Kembali ke Dashboard
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
