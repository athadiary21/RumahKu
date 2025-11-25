import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function TrafficLogs() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['traffic-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  const filteredLogs = logs?.filter(log => 
    log.page.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_id?.includes(searchQuery)
  );

  // Calculate page view statistics
  const pageStats = logs?.reduce((acc, log) => {
    acc[log.page] = (acc[log.page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPages = Object.entries(pageStats || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Traffic Logs</h1>
        <p className="text-muted-foreground">Monitor page views and user navigation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs?.map(l => l.session_id)).size || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs?.filter(l => l.user_id).map(l => l.user_id)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPages.map(([page, count]) => (
              <div key={page} className="flex items-center justify-between">
                <span className="text-sm font-medium">{page}</span>
                <span className="text-sm text-muted-foreground">{count} views</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Traffic</CardTitle>
          <Input
            placeholder="Search by page or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Referrer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-medium">{log.page}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.user_id ? log.user_id.substring(0, 8) + '...' : 'Anonymous'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.session_id?.substring(0, 8) + '...'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                        {log.referrer || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLogs?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No traffic logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
