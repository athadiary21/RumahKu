import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, TrendingUp, Users, DollarSign, Activity, Calendar, Shield, Zap, Crown } from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const SubscriptionsManagement = () => {
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          family_groups(name),
          subscription_tiers(name, price_monthly, price_yearly)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-subscription-stats'],
    queryFn: async () => {
      const { data: allSubs } = await supabase
        .from('subscriptions')
        .select('tier, status, billing_period');

      const totalActive = allSubs?.filter(s => s.status === 'active').length || 0;
      const totalFree = allSubs?.filter(s => s.tier === 'free').length || 0;
      const totalFamily = allSubs?.filter(s => s.tier === 'family').length || 0;
      const totalPremium = allSubs?.filter(s => s.tier === 'premium').length || 0;

      // Calculate MRR (Monthly Recurring Revenue)
      const { data: tierData } = await supabase
        .from('subscription_tiers')
        .select('tier, price_monthly, price_yearly');

      let mrr = 0;
      allSubs?.forEach(sub => {
        if (sub.status === 'active') {
          const tier = tierData?.find(t => t.tier === sub.tier);
          if (tier) {
            if (sub.billing_period === 'yearly') {
              mrr += tier.price_yearly / 12;
            } else {
              mrr += tier.price_monthly;
            }
          }
        }
      });

      return {
        totalActive,
        totalFree,
        totalFamily,
        totalPremium,
        mrr,
      };
    },
  });

  const filteredSubscriptions = subscriptions.filter((sub: any) => {
    const matchesTier = filterTier === 'all' || sub.tier === filterTier;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesTier && matchesStatus;
  });

  const getTierBadge = (tier: string) => {
    const variants: Record<string, any> = {
      free: { variant: 'secondary', icon: Shield, color: 'text-gray-500' },
      family: { variant: 'default', icon: Zap, color: 'text-blue-500' },
      premium: { variant: 'default', icon: Crown, color: 'text-yellow-500' },
    };
    const config = variants[tier] || variants.free;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'default',
      expired: 'destructive',
      cancelled: 'secondary',
      trialing: 'outline',
    };
    return (
      <Badge variant={variants[status] as any || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = [
    { name: 'Free', count: stats?.totalFree || 0, color: '#94a3b8' },
    { name: 'Family', count: stats?.totalFamily || 0, color: '#3b82f6' },
    { name: 'Premium', count: stats?.totalPremium || 0, color: '#f59e0b' },
  ];

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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Subscription Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage all subscriptions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalActive || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free</CardTitle>
            <Shield className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFree || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Free tier users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFamily || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Family tier users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPremium || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Premium tier users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.mrr || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly recurring</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Distribution</CardTitle>
          <CardDescription>Number of subscriptions by tier</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter subscriptions by tier and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
          <CardDescription>List of all subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Family</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((sub: any) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.family_groups?.name || 'Unknown Family'}
                      </TableCell>
                      <TableCell>{getTierBadge(sub.tier)}</TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {sub.billing_period === 'yearly' ? 'Yearly' : 'Monthly'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sub.current_period_start ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(sub.current_period_start), 'dd MMM yyyy')}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {sub.current_period_end ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(sub.current_period_end), 'dd MMM yyyy')}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {sub.subscription_tiers ? (
                          <span className="text-sm font-medium">
                            {formatCurrency(
                              sub.billing_period === 'yearly'
                                ? sub.subscription_tiers.price_yearly
                                : sub.subscription_tiers.price_monthly
                            )}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionsManagement;
