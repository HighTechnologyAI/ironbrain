import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import CreateTaskForm from '@/components/CreateTaskForm';
import TaskAIAssistant from '@/components/TaskAIAssistant';
import TaskDetails from '@/components/TaskDetails';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationCenter from '@/components/NotificationCenter';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAdmin } from '@/hooks/use-admin';
import AssignParticipantDialog from '@/components/AssignParticipantDialog';
import { useTeamData } from '@/hooks/use-team-data';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Search,
  User,
  CheckCircle,
  Timer,
  Tag,
  MoreVertical,
  Trash2,
  UserPlus,
  MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string;
  created_at: string;
  estimated_hours: number;
  actual_hours: number;
  tags: string[];
  assigned_to: {
    id: string;
    full_name: string;
    position: string;
  };
  created_by: {
    id: string;
    full_name: string;
  };
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { teamMembers } = useTeamData();

  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTaskId, setAssignTaskId] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('self');
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadProfileId = async () => {
      if (!user) { setCurrentProfileId(null); return; }
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        console.error('Error loading current profile id:', error);
        return;
      }
      setCurrentProfileId(data?.id ?? null);
    };
    loadProfileId();
  }, [user]);
  useEffect(() => {
    loadTasks();
  }, []);

  const loadCommentCounts = async (taskIds: string[]) => {
    if (!taskIds || taskIds.length === 0) { setCommentCounts({}); return; }
    const { data, error } = await supabase
      .from('task_comments')
      .select('task_id')
      .in('task_id', taskIds);
    if (error) { console.error('Error loading comment counts:', error); return; }
    const map: Record<string, number> = {};
    (data || []).forEach((row: any) => { map[row.task_id] = (map[row.task_id] || 0) + 1; });
    setCommentCounts(map);
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          due_date,
          created_at,
          estimated_hours,
          actual_hours,
          tags,
          assigned_to:profiles!tasks_assigned_to_fkey(id, full_name, position),
          created_by:profiles!tasks_created_by_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      await loadCommentCounts((data || []).map((t: any) => t.id));
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: t.error,
        description: t.tasksLoadError,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: t.success,
        description: t.taskStatusUpdated,
      });

      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: t.error,
        description: t.taskStatusUpdateError,
        variant: 'destructive',
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!isAdmin) {
      toast({
        title: 'Доступ запрещен',
        description: 'Только администраторы могут удалять задачи',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: 'Задача удалена',
        description: 'Задача была успешно удалена',
      });

      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить задачу',
        variant: 'destructive',
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getMyTasks = () => {
    if (assigneeFilter === 'all') {
      return filteredTasks.filter(task => task.status !== 'completed');
    }
    const targetId = assigneeFilter === 'self' ? currentProfileId : assigneeFilter;
    if (!targetId) return [];
    return filteredTasks.filter(task => task.assigned_to?.id === targetId && task.status !== 'completed');
  };

  const getCreatedTasks = () => {
    if (!currentProfileId) return [];
    return filteredTasks.filter(task => task.created_by?.id === currentProfileId);
  };

  const getCompletedTasks = () => {
    const targetId = assigneeFilter === 'self' ? currentProfileId : (assigneeFilter === 'all' ? null : assigneeFilter);
    return tasks.filter(task => {
      const matchesCompleted = task.status === 'completed';
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = !targetId || task.assigned_to?.id === targetId;
      return matchesCompleted && matchesSearch && matchesPriority && matchesAssignee;
    });
  };

  const statusLabels = {
    pending: t.pending,
    in_progress: t.inProgress,
    completed: t.completed,
    cancelled: t.cancelled,
    on_hold: t.onHold,
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    on_hold: 'bg-orange-100 text-orange-800',
  };

  const priorityLabels = {
    low: t.low,
    medium: t.medium,
    high: t.high,
    critical: t.critical,
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-purple-100 text-purple-800',
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <TaskDetails
      task={task}
      trigger={
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">{task.title}</CardTitle>
                <CardDescription className="text-sm">
                  {task.description}
                </CardDescription>
              </div>
              <div className="flex gap-2 ml-4">
                <Badge className={priorityColors[task.priority]}>
                  {priorityLabels[task.priority]}
                </Badge>
                <Badge className={statusColors[task.status]}>
                  {statusLabels[task.status]}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{t.assignee}: {task.assigned_to?.full_name}</span>
                </div>
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{t.dueDate}: {format(new Date(task.due_date), 'dd MMMM yyyy', { locale: ru })}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{commentCounts[task.id] ?? 0}</span>
                </div>
              </div>

              {task.estimated_hours && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{t.estimated}: {task.estimated_hours}{t.hours}</span>
                  {task.actual_hours && (
                    <span>• {t.actual}: {task.actual_hours}{t.hours}</span>
                  )}
                </div>
              )}

              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {task.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <div className="text-xs text-muted-foreground">
                  {t.created}: {format(new Date(task.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                </div>
                
                <div className="flex flex-wrap gap-2 justify-between items-center">
                  <TaskAIAssistant task={task} employeeId={task.assigned_to?.id} />

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2"
                          aria-label="Меню задачи"
                        >
                          <MoreVertical className="h-4 w-4" />
                          Меню
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        {task.status === 'pending' && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, 'in_progress');
                            }}
                          >
                            {t.startWork}
                          </DropdownMenuItem>
                        )}
                        {task.status === 'in_progress' && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, 'completed');
                            }}
                          >
                            {t.complete}
                          </DropdownMenuItem>
                        )}
                        
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssignTaskId(task.id);
                                setAssignOpen(true);
                              }}
                              className="text-blue-600"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Назначить сотрудника
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
                                  deleteTask(task.id);
                                }
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить задачу
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {task.status !== 'completed' && task.status !== 'cancelled' && (
                      <div className="flex flex-wrap gap-2">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, 'in_progress');
                            }}
                            className="text-xs"
                          >
                            {t.startWork}
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, 'completed');
                            }}
                            className="text-xs"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t.complete}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      }
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t.tasksTitle}</h1>
              <p className="text-muted-foreground">
                {t.tasksDescription}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <LanguageSwitcher />
            {/* Создание задач только через админ панель */}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.searchTasks}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.taskStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allStatuses}</SelectItem>
              <SelectItem value="pending">{t.pending}</SelectItem>
              <SelectItem value="in_progress">{t.inProgress}</SelectItem>
              <SelectItem value="completed">{t.completed}</SelectItem>
              <SelectItem value="cancelled">{t.cancelled}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.taskPriority} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allPriorities}</SelectItem>
              <SelectItem value="low">{t.low}</SelectItem>
              <SelectItem value="medium">{t.medium}</SelectItem>
              <SelectItem value="high">{t.high}</SelectItem>
            </SelectContent>
          </Select>
          {/* Индивидуальный режим: фильтр по исполнителю скрыт, показываем только задачи текущего пользователя */}
        </div>

        <Tabs defaultValue="my" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my">{t.myTasks} ({getMyTasks().length})</TabsTrigger>
            <TabsTrigger value="created">{t.createdByMe} ({getCreatedTasks().length})</TabsTrigger>
            <TabsTrigger value="completed">{t.completed} ({getCompletedTasks().length})</TabsTrigger>
          </TabsList>


          <TabsContent value="my" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getMyTasks().map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            {getMyTasks().length === 0 && (
              <div className="text-center py-12">
                <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t.noActiveTasks}</h3>
                <p className="text-muted-foreground">
                  {t.noActiveTasksDesc}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="created" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getCreatedTasks().map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            {getCreatedTasks().length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t.noCreatedTasks}</h3>
                <p className="text-muted-foreground">
                  {t.noCreatedTasksDesc}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getCompletedTasks().map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            {getCompletedTasks().length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Завершённых задач нет</h3>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AssignParticipantDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          taskId={assignTaskId}
          onAssigned={() => {
            setAssignOpen(false);
            toast({ title: 'Участник добавлен', description: 'Сотрудник добавлен к задаче' });
            loadTasks();
          }}
        />
      </div>
    </div>
  );
};

export default Tasks;