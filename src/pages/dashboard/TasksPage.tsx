import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ListTodo, RefreshCw } from 'lucide-react';
import { useFamilyTasks, FamilyTask, TaskStatus, TaskPriority } from '@/hooks/useFamilyTasks';
import { useFamily } from '@/hooks/useFamily';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskStats } from '@/components/tasks/TaskStats';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

const TasksPage = () => {
  const { data: family, isLoading: familyLoading } = useFamily();
  const { data: tasks = [], isLoading: tasksLoading, refetch } = useFamilyTasks();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FamilyTask | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Realtime subscription
  useEffect(() => {
    if (!family?.family_id) return;

    const channel = supabase
      .channel('family-tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_tasks',
          filter: `family_id=eq.${family.family_id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [family?.family_id, refetch]);

  const hasActiveFilters = Boolean(search) || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Tab filter
    if (activeTab === 'recurring') {
      filtered = filtered.filter(t => t.is_recurring);
    } else if (activeTab === 'active') {
      filtered = filtered.filter(t => t.status !== 'completed');
    }

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    // Status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }

    // Assignee
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        filtered = filtered.filter(t => !t.assigned_to);
      } else {
        filtered = filtered.filter(t => t.assigned_to === assigneeFilter);
      }
    }

    return filtered;
  }, [tasks, activeTab, search, statusFilter, priorityFilter, assigneeFilter]);

  const handleEdit = (task: FamilyTask) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingTask(null);
  };

  if (familyLoading || tasksLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-primary" />
            Tugas Keluarga
          </h1>
          <p className="text-muted-foreground">
            Kelola dan pantau tugas rumah tangga bersama
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tugas Baru
        </Button>
      </div>

      {/* Stats */}
      <TaskStats tasks={tasks} />

      {/* Tabs & Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="active">Aktif</TabsTrigger>
              <TabsTrigger value="recurring" className="gap-1">
                <RefreshCw className="h-3 w-3" />
                Berulang
              </TabsTrigger>
            </TabsList>
          </div>

          <TaskFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            assigneeFilter={assigneeFilter}
            onAssigneeFilterChange={setAssigneeFilter}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <TabsContent value={activeTab} className="mt-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <ListTodo className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {hasActiveFilters ? 'Tidak ada tugas yang cocok' : 'Belum ada tugas'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? 'Coba ubah filter pencarian' 
                  : 'Mulai dengan membuat tugas pertama untuk keluarga Anda'
                }
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Tugas
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <TaskDialog 
        open={dialogOpen} 
        onOpenChange={handleDialogClose}
        task={editingTask}
      />
    </div>
  );
};

export default TasksPage;
