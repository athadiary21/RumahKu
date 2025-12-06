import { Card, CardContent } from '@/components/ui/card';
import { Circle, Play, CheckCircle2, Clock } from 'lucide-react';
import { FamilyTask } from '@/hooks/useFamilyTasks';
import { isPast, isToday } from 'date-fns';

interface TaskStatsProps {
  tasks: FamilyTask[];
}

export const TaskStats = ({ tasks }: TaskStatsProps) => {
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => 
    t.due_date && isPast(new Date(t.due_date)) && t.status !== 'completed'
  ).length;

  const stats = [
    { 
      label: 'Menunggu', 
      count: pendingCount, 
      icon: Circle,
      className: 'text-muted-foreground bg-muted/50'
    },
    { 
      label: 'Dikerjakan', 
      count: inProgressCount, 
      icon: Play,
      className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
    },
    { 
      label: 'Selesai', 
      count: completedCount, 
      icon: CheckCircle2,
      className: 'text-green-600 bg-green-100 dark:bg-green-900/30'
    },
    { 
      label: 'Terlambat', 
      count: overdueCount, 
      icon: Clock,
      className: 'text-red-600 bg-red-100 dark:bg-red-900/30'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.className}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
