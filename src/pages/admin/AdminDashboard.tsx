import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Tag, DollarSign, UserCheck, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [
        usersResult,
        subscriptionsResult,
        transactionsResult,
        promoCodesResult,
        revenueResult,
      ] = await Promise.all([
        // Total users
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        
        // Active subscriptions
        supabase
          .from('subscriptions')
          .select('tier, status', { count: 'exact' })
          .eq('status', 'active'),
        
        // Recent transactions
        supabase
          .from('payment_transactions')
          .select('amount, status, created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false }),
        
        // Active promo codes
        supabase
          .from('promo_codes')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        
        // Monthly revenue
        supabase
          .from('payment_transactions')
          .select('amount, created_at')
          .eq('status', 'completed')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      // Calculate revenue
      const totalRevenue = revenueResult.data?.reduce((sum, txn) => sum + txn.amount, 0) || 0;
      const completedTransactions = transactionsResult.data?.filter(t => t.status === 'completed').length || 0;
      const pendingTransactions = transactionsResult.data?.filter(t => t.status === 'pending').length || 0;

      // Calculate subscription breakdown
      const subscriptionBreakdown = subscriptionsResult.data?.reduce((acc: any, sub) => {
        acc[sub.tier] = (acc[sub.tier] || 0) + 1;
        return acc;
      }, {}) || {};

      // Calculate daily revenue for chart
      const dailyRevenue = revenueResult.data?.reduce((acc: any, txn) => {
        const date = new Date(txn.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + txn.amount;
        return acc;
      }, {}) || {};

      const revenueChartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
        date,
        revenue,
      })).slice(-14); // Last 14 days

      return {
        totalUsers: usersResult.count || 0,
        activeSubscriptions: subscriptionsResult.count || 0,
        totalRevenue,
        activePromoCodes: promoCodesResult.count || 0,
        completedTransactions,
        pendingTransactions,
        subscriptionBreakdown,
        revenueChartData,
      };
    },
  });

  const pieChartData = stats?.subscriptionBreakdown
    ? Object.entries(stats.subscriptionBreakdown).map(([tier, count]) => ({
        name: tier.charAt(0).toUpperCase() + tier.slice(1),
        value: count,
      }))
    : [];

  const COLORS = {
    Free: '#94a3b8',
    Family: '#3b82f6',
    Premium: '#f59e0b',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-2">
          Overview dan statistik platform RumahKu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Paid subscribers
            </p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        {/* Active Promo Codes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Promos</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePromoCodes || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available codes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue for the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.revenueChartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Breakdown</CardTitle>
            <CardDescription>Distribution by tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Status */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Status</CardTitle>
          <CardDescription>Recent payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats?.completedTransactions || 0}</span>
                <Badge variant="default">Success</Badge>
              </div>
            </div>
            <Progress
              value={
                stats?.completedTransactions && stats?.pendingTransactions
                  ? (stats.completedTransactions / (stats.completedTransactions + stats.pendingTransactions)) * 100
                  : 0
              }
              className="h-2"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats?.pendingTransactions || 0}</span>
                <Badge variant="secondary">Waiting</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="font-medium">Manage Users</div>
                <div className="text-sm text-muted-foreground">View and edit users</div>
              </div>
            </a>

            <a
              href="/admin/subscriptions"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <CreditCard className="h-8 w-8 text-primary" />
              <div>
                <div className="font-medium">Subscriptions</div>
                <div className="text-sm text-muted-foreground">Manage subscriptions</div>
              </div>
            </a>

            <a
              href="/admin/promo-codes"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Tag className="h-8 w-8 text-primary" />
              <div>
                <div className="font-medium">Promo Codes</div>
                <div className="text-sm text-muted-foreground">Create and manage</div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
