import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown, RefreshCw, XCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useFamily } from '@/hooks/useFamily';

const SubscriptionHistory = () => {
  const { data: familyData } = useFamily();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['subscription-history', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return [];

      const { data, error } = await supabase
        .from('subscription_history')
        .select(`
          *,
          payment_transactions(order_id, amount, status)
        `)
        .eq('family_id', familyData.family_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!familyData?.family_id,
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upgraded':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'downgraded':
        return <ArrowDown className="h-4 w-4 text-orange-500" />;
      case 'renewed':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      upgraded: 'bg-green-500',
      downgraded: 'bg-orange-500',
      renewed: 'bg-blue-500',
      cancelled: 'bg-red-500',
      created: 'bg-green-500',
      expired: 'bg-gray-500',
    };

    return (
      <Badge className={colors[action] || 'bg-gray-500'}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    );
  };

  const getActionDescription = (item: any) => {
    switch (item.action) {
      case 'upgraded':
        return `Upgrade dari ${item.from_tier} ke ${item.to_tier}`;
      case 'downgraded':
        return `Downgrade dari ${item.from_tier} ke ${item.to_tier}`;
      case 'renewed':
        return `Perpanjangan subscription ${item.to_tier}`;
      case 'cancelled':
        return `Subscription ${item.from_tier} dibatalkan`;
      case 'created':
        return `Subscription ${item.to_tier} dibuat`;
      case 'expired':
        return `Subscription ${item.from_tier} kadaluarsa`;
      default:
        return item.notes || 'Update subscription';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Subscription</CardTitle>
          <CardDescription>Belum ada riwayat subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Riwayat perubahan subscription akan muncul di sini</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Subscription</CardTitle>
        <CardDescription>
          Semua aktivitas dan perubahan subscription Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Aktivitas</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Order ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActionIcon(item.action)}
                    <span className="text-sm">
                      {format(new Date(item.created_at), 'dd MMM yyyy HH:mm')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getActionBadge(item.action)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{getActionDescription(item)}</p>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground">{item.notes}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {item.amount ? (
                    <span className="font-medium">
                      Rp {Number(item.amount).toLocaleString('id-ID')}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.payment_transactions?.order_id ? (
                    <div>
                      <p className="text-sm font-mono">
                        {item.payment_transactions.order_id}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          item.payment_transactions.status === 'success'
                            ? 'text-green-600'
                            : item.payment_transactions.status === 'pending'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }
                      >
                        {item.payment_transactions.status}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubscriptionHistory;
