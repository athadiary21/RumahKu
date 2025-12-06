import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { CheckCircle2, Circle, Clock, MoreVertical, Pencil, Trash2, RefreshCw, User, Calendar, Play } from 'lucide-react';
import { FamilyTask, TaskStatus, useUpdateTask, useDeleteTask, useCompleteTask } from '@/hooks/useFamilyTasks';
import { format, isPast, isToday } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: FamilyTask;
  onEdit: (task: FamilyTask) => void;
}

const priorityConfig = {
  low: { label: 'Rendah', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  medium: { label: 'Sedang', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  high: { label: 'Tinggi', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const statusConfig = {
  pending: { label: 'Menunggu', icon: Circle, className: 'text-muted-foreground' },
  in_progress: { label: 'Dikerjakan', icon: Play, className: 'text-blue-500' },
  completed: { label: 'Selesai', icon: CheckCircle2, className: 'text-green-500' },
};

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();
  
  const StatusIcon = statusConfig[task.status].icon;
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed';
  const isDueToday = task.due_date && isToday(new Date(task.due_date));

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === 'completed') {
      await completeTask.mutateAsync({ id: task.id, isRecurring: task.is_recurring });
    } else {
      await updateTask.mutateAsync({ id: task.id, status: newStatus });
    }
  };

  const handleDelete = async () => {
    if (confirm('Hapus tugas ini?')) {
      await deleteTask.mutateAsync(task.id);
    }
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      task.status === 'completed' && 'opacity-60',
      isOverdue && 'border-destructive/50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Toggle */}
          <button
            onClick={() => handleStatusChange(
              task.status === 'completed' ? 'pending' : 
              task.status === 'pending' ? 'in_progress' : 'completed'
            )}
            className="mt-0.5 flex-shrink-0"
          >
            <StatusIcon className={cn('h-5 w-5', statusConfig[task.status].className)} />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                'font-medium',
                task.status === 'completed' && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </h3>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                    <Circle className="mr-2 h-4 w-4" /> Menunggu
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                    <Play className="mr-2 h-4 w-4" /> Dikerjakan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Selesai
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="outline" className={priorityConfig[task.priority].className}>
                {priorityConfig[task.priority].label}
              </Badge>

              {task.is_recurring && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {task.recurrence_pattern === 'daily' ? 'Harian' :
                   task.recurrence_pattern === 'weekly' ? 'Mingguan' : 'Bulanan'}
                </Badge>
              )}

              {task.due_date && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    isOverdue && 'bg-destructive/10 text-destructive border-destructive/50',
                    isDueToday && !isOverdue && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  )}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {isOverdue ? 'Terlambat: ' : isDueToday ? 'Hari ini' : ''}
                  {!isDueToday && format(new Date(task.due_date), 'd MMM', { locale: localeId })}
                </Badge>
              )}

              {task.assignee ? (
                <div className="flex items-center gap-1.5 ml-auto">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.assignee.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {task.assignee.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {task.assignee.full_name?.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 ml-auto text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="text-xs">Belum ditugaskan</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
