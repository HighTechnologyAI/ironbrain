import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { translateTaskContent, translations } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, Clock, User, CheckCircle, AlertCircle, Timer, Search, Filter, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TaskAIAssistant } from '@/components/TaskAIAssistant';
import { TaskComments } from '@/components/TaskComments';
import { TaskInvitationNotification } from '@/components/TaskInvitationNotification';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  estimated_hours: number | null;
  actual_hours: number | null;
  tags: string[];
  assigned_to: {
    id: string;
    full_name: string;
    position?: string;
  };
  created_by: {
    id: string;
    full_name: string;
  };
}

const TaskCard = ({ task, onTaskClick }: { task: Task; onTaskClick: (task: Task) => void }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onTaskClick(task)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex gap-2 ml-2">
            <Badge className={`${getStatusColor(task.status)} text-white text-xs`}>
              {t[task.status] || task.status}
            </Badge>
            <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
              {t[task.priority] || task.priority}
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-3 text-sm">
          {task.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{task.assigned_to.full_name}</span>
            </div>
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {task.estimated_hours && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{task.estimated_hours}h</span>
              </div>
            )}
          </div>
        </div>
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, [language]);

  const loadTasks = async () => {
    try {
      // Demo tasks for testing
      const demoTasks = [
        {
          id: '1',
          title: 'test-system-operation',
          description: '1. Запусти тестовый сценарий, используя стандартные параметры Tiger Technology AI.',
          status: 'in_progress' as const,
          priority: 'medium' as const,
          due_date: '2025-08-10',
          created_at: '2025-08-04T12:11:00Z',
          estimated_hours: 2,
          actual_hours: null,
          tags: ['тестирование', 'отчет'],
          assigned_to: { id: user?.id || '1', full_name: 'OLEKSANDR KOVALCHUK', position: 'Developer' },
          created_by: { id: user?.id || '1', full_name: 'OLEKSANDR KOVALCHUK' }
        },
        {
          id: '2',
          title: 'xuesoc',
          description: 'ТЕСТ',
          status: 'completed' as const,
          priority: 'high' as const,
          due_date: '2025-08-05',
          created_at: '2025-08-04T15:51:00Z',
          estimated_hours: 5,
          actual_hours: null,
          tags: ['тест'],
          assigned_to: { id: user?.id || '1', full_name: 'OLEKSANDR KOVALCHUK', position: 'Developer' },
          created_by: { id: user?.id || '1', full_name: 'OLEKSANDR KOVALCHUK' }
        },
        {
          id: '3',
          title: 'system-testing',
          description: 'Проведи агрессивный тест функциональности системы постановки задач Tiger Technology AI.',
          status: 'completed' as const,
          priority: 'high' as const,
          due_date: null,
          created_at: '2025-08-04T02:36:00Z',
          estimated_hours: 2,
          actual_hours: null,
          tags: ['тестирование', 'система'],
          assigned_to: { id: user?.id || '1', full_name: 'OLEKSANDR KOVALCHUK', position: 'Developer' },
          created_by: { id: user?.id || '1', full_name: 'OLEKSANDR KOVALCHUK' }
        },
        {
          id: '4',
          title: 'system-testing',
          description: 'Шаги: 1) Создай тестовую задачу; 2) Проверь корректность отображения и статусов; 3) Протестируй сценарии с разными приоритетами и дедлайнами; 4) Зафиксируй баги и несоответствия; 5) Подготовь отчет с предложениями по оптимизации.',
          status: 'completed' as const,
          priority: 'high' as const,
          due_date: null,
          created_at: '2025-08-04T02:36:00Z',
          estimated_hours: 2,
          actual_hours: null,
          tags: ['тестирование', 'система', 'оптимизация'],
          assigned_to: { id: user?.id || '1', full_name: 'OLEKSANDR KOVALCHUK', position: 'Developer' },
          created_by: { id: user?.id || '1', full_name: 'OLEKSANDR KOVALCHUK' }
        }
      ];

      // Apply translations to tasks
      const translatedTasks = demoTasks.map(task => translateTaskContent(task, language));
      setTasks(translatedTasks);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setLoading(false);
    }
  };

  const filteredTasks = tasks;
  const getMyTasks = () => tasks.filter(task => task.assigned_to.id === user?.id);
  const getCreatedTasks = () => tasks.filter(task => task.created_by.id === user?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.dashboard}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t.tasksTitle}</h1>
            <p className="text-muted-foreground">{t.tasksDescription}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchTasks}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t.allStatuses} />
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
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t.allPriorities} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allPriorities}</SelectItem>
              <SelectItem value="low">{t.low}</SelectItem>
              <SelectItem value="medium">{t.medium}</SelectItem>
              <SelectItem value="high">{t.high}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Task Invitations */}
        <TaskInvitationNotification />

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              {t.allTasks} ({filteredTasks.length})
            </TabsTrigger>
            <TabsTrigger value="my" className="flex items-center gap-2">
              {t.myTasks} ({getMyTasks().length})
            </TabsTrigger>
            <TabsTrigger value="created" className="flex items-center gap-2">
              {t.createdByMe} ({getCreatedTasks().length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onTaskClick={setSelectedTask} />
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

          <TabsContent value="my" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getMyTasks().map((task) => (
                <TaskCard key={task.id} task={task} onTaskClick={setSelectedTask} />
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
                <TaskCard key={task.id} task={task} onTaskClick={setSelectedTask} />
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
        </Tabs>

        {/* Task Details Modal */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedTask && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {selectedTask.title}
                  </DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">{t.details}</TabsTrigger>
                    <TabsTrigger value="comments">{t.comments}</TabsTrigger>
                    <TabsTrigger value="ai" className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      {t.aiTaskAssistant}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">{t.description}</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {selectedTask.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">{t.taskStatus}</h4>
                          <Badge className={`${getStatusColor(selectedTask.status)} text-white`}>
                            {t[selectedTask.status] || selectedTask.status}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">{t.taskPriority}</h4>
                          <Badge className={`${getPriorityColor(selectedTask.priority)} text-white`}>
                            {t[selectedTask.priority] || selectedTask.priority}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">{t.assignee}</h4>
                        <p className="text-muted-foreground">{selectedTask.assigned_to.full_name}</p>
                      </div>

                      {selectedTask.tags.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">{t.tags}</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedTask.tags.map((tag, index) => (
                              <Badge key={index} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="comments" className="mt-4">
                    <TaskComments task={selectedTask} />
                  </TabsContent>

                  <TabsContent value="ai" className="mt-4">
                    <TaskAIAssistant task={selectedTask} />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }
};

export default Tasks;

