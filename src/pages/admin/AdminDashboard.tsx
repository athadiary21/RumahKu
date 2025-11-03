import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, HelpCircle, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [contentCount, testimonialsCount, faqsCount, pricingCount] = await Promise.all([
        supabase.from('website_content').select('*', { count: 'exact', head: true }),
        supabase.from('testimonials_admin').select('*', { count: 'exact', head: true }),
        supabase.from('faqs_admin').select('*', { count: 'exact', head: true }),
        supabase.from('pricing_tiers_admin').select('*', { count: 'exact', head: true }),
      ]);

      return {
        content: contentCount.count || 0,
        testimonials: testimonialsCount.count || 0,
        faqs: faqsCount.count || 0,
        pricing: pricingCount.count || 0,
      };
    },
  });

  const statCards = [
    { title: 'Website Content', value: stats?.content || 0, icon: FileText, color: 'text-blue-500' },
    { title: 'Testimonials', value: stats?.testimonials || 0, icon: MessageSquare, color: 'text-green-500' },
    { title: 'FAQs', value: stats?.faqs || 0, icon: HelpCircle, color: 'text-orange-500' },
    { title: 'Pricing Tiers', value: stats?.pricing || 0, icon: DollarSign, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Selamat datang di Admin Panel RumahKu
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">item total</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selamat Datang di Admin Panel</CardTitle>
          <CardDescription>
            Gunakan menu di sidebar untuk mengelola konten website RumahKu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Website Content:</strong> Kelola teks dan konten yang ditampilkan di halaman utama
            </p>
            <p className="text-sm">
              <strong>Testimonials:</strong> Kelola testimoni dari user
            </p>
            <p className="text-sm">
              <strong>FAQs:</strong> Kelola pertanyaan yang sering ditanyakan
            </p>
            <p className="text-sm">
              <strong>Pricing:</strong> Kelola paket harga dan fitur
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
