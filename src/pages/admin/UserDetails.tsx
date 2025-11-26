import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Mail, Calendar, Shield, Zap, Crown, Activity, CreditCard, History, Users as UsersIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserDetail {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  family_id: string;
  family_name: string;
  subscription_tier: string;
  subscription_status: string;
  current_period_end: string | null;
  role: string;
}

interface SubscriptionHistory {
  id: string;
  changed_by_email: string;
  changed_by_name: string;
  old_tier: string;
  new_tier: string;
  old_status: string;
  new_status: string;
  old_expires_at: string | null;
  new_expires_at: string | null;
  notes: string | null;
  created_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
  account_id: string;
}

interface FamilyMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  joined_at: string;
}

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // Fetch user details
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user-detail', userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_users');
      if (error) throw error;
      return (data as UserDetail[]).find(u => u.id === userId);
    },
  });

  // Fetch subscription history
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['subscription-history', user?.family_id],
    queryFn: async () => {
      if (!user?.family_id) return [];
      const { data, error } = await supabase.rpc('get_subscription_history', {
        p_family_id: user.family_id,
      });
      if (error) throw error;
      return data as SubscriptionHistory[];
    },
    enabled: !!user?.family_id,
  });

  // Fetch user transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['user-transactions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('created_by', userId)
        .order('date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!userId,
  });

  // Fetch family members
  const { data: familyMembers = [], isLoading: familyLoading } = useQuery({
    queryKey: ['family-members', user?.family_id],
    queryFn: async () => {
      if (!user?.family_id) return [];
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles:user_id (
            full_name
          )
        `)
        .eq('family_id', user.family_id);
      
      if (error) throw error;
      
      // Get emails from auth.users
      const userIds = data.map(m => m.user_id);
      const { data: authUsers } = await supabase.rpc('get_admin_users');
      
      return data.map(member => ({
        id: member.id,
        user_id: member.user_id,
        full_name: (member.profiles as any)?.full_name || 'Unknown',
        email: (authUsers as any[])?.find(u => u.id === member.user_id)?.email || 'No email',
        role: member.role,
        joined_at: member.joined_at,
      })) as FamilyMember[];
    },
    enabled: !!user?.family_id,
  });

  const getTierIcon = (tier: string) => {
    const icons: Record<string, any> = {
      free: Shield,
      family: Zap,
      premium: Crown,
    };
    return icons[tier] || Shield;
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      free: 'text-gray-500',
      family: 'text-blue-500',
      premium: 'text-yellow-500',
    };
    return colors[tier] || 'text-gray-500';
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-muted-foreground">User not found</p>
        <Button onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  const TierIcon = getTierIcon(user.subscription_tier);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{user.full_name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Tier</CardTitle>
            <TierIcon className={`h-4 w-4 ${getTierColor(user.subscription_tier)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.subscription_tier}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={user.subscription_status === 'active' ? 'default' : 'destructive'}>
                {user.subscription_status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(user.created_at), 'MMM yyyy')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.role}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-sm font-semibold">{user.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-sm font-mono">{user.id.substring(0, 8)}...</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Family</p>
                <p className="text-sm font-semibold">{user.family_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Joined</p>
                <p className="text-sm">{format(new Date(user.created_at), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expires</p>
                <p className="text-sm">
                  {user.current_period_end 
                    ? format(new Date(user.current_period_end), 'dd MMM yyyy')
                    : '-'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Family Members ({familyMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {familyLoading ? (
              <div className="flex justify-center py-4">
                <Activity className="h-6 w-6 animate-spin" />
              </div>
            ) : familyMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No family members</p>
            ) : (
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{member.full_name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant="outline">{member.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Subscription History
          </CardTitle>
          <CardDescription>Track all changes to subscription</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Activity className="h-6 w-6 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No subscription history</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(item.created_at), 'dd MMM yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{item.changed_by_name || 'System'}</p>
                          <p className="text-xs text-muted-foreground">{item.changed_by_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.old_tier}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{item.new_tier}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="outline">{item.old_status}</Badge>
                          <span>→</span>
                          <Badge>{item.new_status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.new_expires_at 
                          ? format(new Date(item.new_expires_at), 'dd MMM yyyy')
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Last 10 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex justify-center py-8">
              <Activity className="h-6 w-6 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No transactions</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(transaction.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        Rp {Number(transaction.amount).toLocaleString('id-ID')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;
