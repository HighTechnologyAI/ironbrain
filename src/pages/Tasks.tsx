import { useState, useEffect, useCallback, useRef } from 'react';
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
import TaskText from '@/components/TaskText';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationCenter from '@/components/NotificationCenter';
import { SmartAISidebar } from '@/components/SmartAISidebar';
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
  AlertCircle,
  Timer,
  Tag,
  MoreVertical,
  Trash2,
  UserPlus,
  MessageSquare,
  SidebarClose,
  SidebarOpen
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
  language?: string | null;
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
  const [collaboratedTasks, setCollaboratedTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAISidebar, setShowAISidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

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

  const loadTasks = useCallback(async () => {
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
          language,
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
  }, [t.error, t.tasksLoadError, toast]);

  const loadCollaboratedTasks = useCallback(async () => {
    try {
      if (!currentProfileId) { setCollaboratedTasks([]); return; }
      const { data: links, error: linksError } = await supabase
        .from('task_participants')
        .select('task_id')
        .eq('user_id', currentProfileId);
      if (linksError) { console.error('Error loading collaborations:', linksError); setCollaboratedTasks([]); return; }

      const ids = Array.from(new Set((links || []).map((l: any) => l.task_id)));
      if (ids.length === 0) { setCollaboratedTasks([]); return; }

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
          language,
          assigned_to:profiles!tasks_assigned_to_fkey(id, full_name, position),
          created_by:profiles!tasks_created_by_fkey(id, full_name)
        `)
        .in('id', ids)
        .order('created_at', { ascending: false });

      if (error) { console.error('Error loading collaborated tasks:', error); setCollaboratedTasks([]); return; }
      setCollaboratedTasks(data || []);
      await loadCommentCounts(ids);
    } catch (e) {
      console.error('Unexpected error loading collaborated tasks:', e);
    }
  }, [currentProfileId]);

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

  useEffect(() => {
    loadCollaboratedTasks();
  }, [currentProfileId]);

  // Update indicator position when active tab changes
  useEffect(() => {
    const updateIndicator = () => {
      if (!tabsRef.current) return;
      
      const activeButton = tabsRef.current.querySelector(`[data-state="active"]`) as HTMLElement;
      if (activeButton) {
        const tabsList = tabsRef.current;
        const tabsListRect = tabsList.getBoundingClientRect();
        const activeButtonRect = activeButton.getBoundingClientRect();
        
        setIndicatorStyle({
          width: activeButtonRect.width,
          left: activeButtonRect.left - tabsListRect.left
        });
      }
    };
    
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(updateIndicator, 50);
    
    // Also update on window resize
    window.addEventListener('resize', updateIndicator);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeTab, isAdmin]);

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
    } catch (error: any) {
      console.error('Error updating task:', error);
      const msg = String(error?.message || '').includes('row-level security') || String(error).includes('permission')
        ? 'Недостаточно прав для изменения статуса задачи'
        : t.taskStatusUpdateError;
      toast({
        title: t.error,
        description: msg,
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
    } catch (error: any) {
      console.error('Error deleting task:', error);
      const msg = String(error?.message || '').includes('row-level security') || String(error).includes('permission')
        ? 'Недостаточно прав для удаления задачи'
        : 'Не удалось удалить задачу';
      toast({
        title: 'Ошибка',
        description: msg,
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

  const getCollaboratedTasks = () => {
    // Фильтруем по поиску и статусам/приоритетам
    const base = collaboratedTasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
    // Исключаем мои и созданные мной, чтобы не было дублей
    const exclude = new Set([...getMyTasks(), ...getCreatedTasks()].map(t => t.id));
    return base.filter(t => !exclude.has(t.id));
  };

  const statusLabels = {
    pending: t.pending,
    in_progress: t.inProgress,
    completed: t.completed,
    cancelled: t.cancelled,
    on_hold: t.onHold,
  };

  const statusColors = {
    pending: 'border-transparent bg-accent text-accent-foreground',
    in_progress: 'border-transparent bg-primary text-primary-foreground',
    completed: 'border-transparent bg-secondary text-secondary-foreground',
    cancelled: 'border-transparent bg-muted text-muted-foreground',
    on_hold: 'border-transparent bg-destructive text-destructive-foreground',
  };

  const priorityLabels = {
    low: t.low,
    medium: t.medium,
    high: t.high,
    critical: t.critical,
  };

  const priorityColors = {
    low: 'border-transparent bg-secondary text-secondary-foreground',
    medium: 'border-transparent bg-accent text-accent-foreground',
    high: 'border-transparent bg-destructive text-destructive-foreground',
    critical: 'border-transparent bg-destructive text-destructive-foreground animate-pulse-glow',
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <TaskDetails
      task={task}
      trigger={
        <Card className="cyber-border group hover:scale-[1.01] cursor-pointer transition-all duration-300 hover:shadow-neon hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <TaskText 
                  text={task.title} 
                  type="title" 
                  sourceLang={task.language}
                  className="text-lg font-semibold group-hover:text-primary transition-colors leading-snug break-words" 
                />
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Badge className={`${priorityColors[task.priority]} px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap border border-primary/20`}>
                  {priorityLabels[task.priority]}
                </Badge>
                <Badge className={`${statusColors[task.status]} px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap border border-primary/20`}>
                  {statusLabels[task.status]}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1 min-w-0">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{task.assigned_to?.full_name || 'Не назначено'}</span>
                </div>
                {task.due_date && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Calendar className="h-4 w-4" />
                    <span className="whitespace-nowrap">{format(new Date(task.due_date), 'dd.MM.yyyy', { locale: ru })}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <MessageSquare className="h-4 w-4" />
                  <span>{commentCounts[task.id] ?? 0}</span>
                </div>
              </div>

              {task.estimated_hours && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{task.estimated_hours}ч</span>
                  {task.actual_hours && (
                    <span className="whitespace-nowrap">• {task.actual_hours}ч</span>
                  )}
                </div>
              )}

              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  {task.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs truncate max-w-20">
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{task.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <div className="text-xs text-muted-foreground truncate">
                  {format(new Date(task.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                </div>
                
                <div className="flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex items-center gap-2 flex-shrink-0">
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
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="cyber-border bg-background/95 backdrop-blur-md z-50 border-primary/30 shadow-neon">
                        {/* Быстрое изменение статуса */}
                        {task.status !== 'pending' && (
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'pending'); }}
                          >
                            {t.pending}
                          </DropdownMenuItem>
                        )}
                        {task.status !== 'in_progress' && (
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'in_progress'); }}
                          >
                            {t.inProgress}
                          </DropdownMenuItem>
                        )}
                        {task.status !== 'on_hold' && (
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'on_hold'); }}
                          >
                            Проблема
                          </DropdownMenuItem>
                        )}
                        {task.status !== 'cancelled' && (
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'cancelled'); }}
                          >
                            {t.cancelled}
                          </DropdownMenuItem>
                        )}
                        {task.status !== 'completed' && (
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'completed'); }}
                          >
                            {t.completed}
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
                            className="text-xs whitespace-nowrap"
                          >
                            Начать
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, 'completed');
                            }}
                            className="text-xs whitespace-nowrap"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Готово
                          </Button>
                        )}
                        <TaskAIAssistant task={task} employeeId={task.assigned_to?.id} />
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
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${showAISidebar ? 'mr-80' : ''}`}>
          <div className="p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Tactical Header */}
              <div className="cyber-border bg-surface-1/50 backdrop-blur-sm p-4 mb-6 rounded-lg">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate('/')}
                      className="cyber-border-glow hover:cyber-text transition-all duration-300"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {t.tasksTitle}
                      </h1>
                      <p className="text-muted-foreground text-sm lg:text-base">
                        {t.tasksDescription}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Panel */}
                  <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                    <CreateTaskForm onTaskCreated={loadTasks} />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAISidebar(!showAISidebar)}
                      className="cyber-border hover:cyber-text transition-all duration-300"
                    >
                      {showAISidebar ? <SidebarClose className="h-4 w-4" /> : <SidebarOpen className="h-4 w-4" />}
                      <span className="hidden sm:inline ml-1">
                        {showAISidebar ? 'Скрыть AI' : 'AI Помощник'}
                      </span>
                    </Button>
                    
                    <NotificationCenter />
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>

              {/* Controls Panel */}
              <div className="cyber-border bg-surface-1/30 backdrop-blur-sm p-4 mb-6 rounded-lg">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t.searchTasks}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 cyber-border bg-surface-2/50"
                      />
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                      <SelectTrigger className="w-full sm:w-48 cyber-border bg-surface-2/50">
                        <SelectValue placeholder="Исполнитель" />
                      </SelectTrigger>
                      <SelectContent className="cyber-border bg-surface-1 backdrop-blur-md">
                        <SelectItem value="self">Мои задачи</SelectItem>
                        <SelectItem value="all">Все исполнители</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48 cyber-border bg-surface-2/50">
                        <SelectValue placeholder={t.taskStatus} />
                      </SelectTrigger>
                      <SelectContent className="cyber-border bg-surface-1 backdrop-blur-md">
                        <SelectItem value="all">{t.allStatuses}</SelectItem>
                        <SelectItem value="pending">{t.pending}</SelectItem>
                        <SelectItem value="in_progress">{t.inProgress}</SelectItem>
                        <SelectItem value="completed">{t.completed}</SelectItem>
                        <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-full sm:w-48 cyber-border bg-surface-2/50">
                        <SelectValue placeholder={t.taskPriority} />
                      </SelectTrigger>
                      <SelectContent className="cyber-border bg-surface-1 backdrop-blur-md">
                        <SelectItem value="all">{t.allPriorities}</SelectItem>
                        <SelectItem value="low">{t.low}</SelectItem>
                        <SelectItem value="medium">{t.medium}</SelectItem>
                        <SelectItem value="high">{t.high}</SelectItem>
                        <SelectItem value="critical">{t.critical}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="relative">
                  <TabsList 
                    ref={tabsRef}
                    className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} cyber-border bg-surface-1/30 backdrop-blur-sm p-1 gap-1 h-auto relative overflow-hidden`}
                  >
                    {/* Animated indicator */}
                    <div
                      className="absolute top-1 bottom-1 bg-primary/20 border-2 border-primary rounded-md transition-all duration-300 ease-out z-0"
                      style={{
                        width: `${indicatorStyle.width}px`,
                        transform: `translateX(${indicatorStyle.left}px)`
                      }}
                    />
                    
                    {isAdmin && (
                      <TabsTrigger 
                        value="all" 
                        className="relative z-10 data-[state=active]:bg-transparent data-[state=active]:border-transparent data-[state=active]:text-primary hover:bg-primary/10 transition-all duration-300"
                      >
                        {t.allTasks} ({filteredTasks.length})
                      </TabsTrigger>
                    )}
                    <TabsTrigger 
                      value="my"
                      className="relative z-10 data-[state=active]:bg-transparent data-[state=active]:border-transparent data-[state=active]:text-primary hover:bg-primary/10 transition-all duration-300"
                    >
                      {t.myTasks} ({getMyTasks().length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="created"
                      className="relative z-10 data-[state=active]:bg-transparent data-[state=active]:border-transparent data-[state=active]:text-primary hover:bg-primary/10 transition-all duration-300"
                    >
                      {t.createdByMe} ({getCreatedTasks().length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="collab"
                      className="relative z-10 data-[state=active]:bg-transparent data-[state=active]:border-transparent data-[state=active]:text-primary hover:bg-primary/10 transition-all duration-300"
                    >
                      Совместно ({getCollaboratedTasks().length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="completed"
                      className="relative z-10 data-[state=active]:bg-transparent data-[state=active]:border-transparent data-[state=active]:text-primary hover:bg-primary/10 transition-all duration-300"
                    >
                      {t.completed} ({getCompletedTasks().length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                {isAdmin && (
                  <TabsContent value="all" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredTasks.map((task, index) => (
                        <div 
                          key={task.id} 
                          className="animate-fade-in-up cursor-pointer"
                          style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                          onClick={() => setSelectedTask(task)}
                        >
                          <TaskCard task={task} />
                        </div>
                      ))}
                    </div>
                    {filteredTasks.length === 0 && (
                      <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t.noTasksFound}</h3>
                        <p className="text-muted-foreground">
                          {t.noTasksFoundDesc}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                )}

                <TabsContent value="my" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {getMyTasks().map((task, index) => (
                      <div 
                        key={task.id} 
                        className="animate-fade-in-up cursor-pointer"
                        style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                        onClick={() => setSelectedTask(task)}
                      >
                        <TaskCard task={task} />
                      </div>
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
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {getCreatedTasks().map((task, index) => (
                      <div 
                        key={task.id} 
                        className="animate-fade-in-up cursor-pointer"
                        style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                        onClick={() => setSelectedTask(task)}
                      >
                        <TaskCard task={task} />
                      </div>
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

                <TabsContent value="collab" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {getCollaboratedTasks().map((task, index) => (
                      <div 
                        key={task.id} 
                        className="animate-fade-in-up cursor-pointer"
                        style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                        onClick={() => setSelectedTask(task)}
                      >
                        <TaskCard task={task} />
                      </div>
                    ))}
                  </div>
                  {getCollaboratedTasks().length === 0 && (
                    <div className="text-center py-12">
                      <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Совместных задач нет</h3>
                      <p className="text-muted-foreground">Вас еще не приглашали в задачи.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {getCompletedTasks().map((task, index) => (
                      <div 
                        key={task.id} 
                        className="animate-fade-in-up cursor-pointer"
                        style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                        onClick={() => setSelectedTask(task)}
                      >
                        <TaskCard task={task} />
                      </div>
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
                  loadCollaboratedTasks();
                }}
              />
            </div>
          </div>
        </div>

        {/* Smart AI Sidebar */}
        {showAISidebar && (
          <div className="fixed right-0 top-0 h-full z-40">
            <SmartAISidebar 
              selectedTask={selectedTask}
              tasks={tasks}
              onTaskAction={(action, taskId) => {
                switch (action) {
                  case 'start_task':
                    updateTaskStatus(taskId, 'in_progress');
                    break;
                  case 'complete_task':
                    updateTaskStatus(taskId, 'completed');
                    break;
                  default:
                    console.log(`AI Action: ${action} for task ${taskId}`);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
