import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import TaskChat from '@/components/TaskChat';
import {
  Eye,
  Calendar,
  Clock,
  User,
  Tag,
  CheckCircle,
  AlertCircle,
  Timer,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';
import { ru, bg } from 'date-fns/locale';

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

interface TaskDetailsProps {
  task: Task;
  trigger: React.ReactNode;
}

const TaskDetails = ({ task, trigger }: TaskDetailsProps) => {
  const [open, setOpen] = useState(false);
  const [isTaskCreator, setIsTaskCreator] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const dateLocale = language === 'bg' ? bg : ru;

  useEffect(() => {
    if (user && task.created_by) {
      setIsTaskCreator(user.id === task.created_by.id);
    }
  }, [user, task.created_by]);

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

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Timer className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация о задаче */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">{language === 'ru' ? 'Описание' : 'Описание'}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description || (language === 'ru' ? 'Описание не указано' : 'Няма описание')}
              </p>
            </div>

            <Separator />

            {/* Чат и файлы */}
            <TaskChat taskId={task.id} isTaskCreator={isTaskCreator} />
          </div>

          {/* Боковая панель с деталями */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={statusColors[task.status]}>
                  {statusLabels[task.status]}
                </Badge>
                <Badge className={priorityColors[task.priority]}>
                  {priorityLabels[task.priority]}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t.assignee}:</span>
                  <span>{task.assigned_to?.full_name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{language === 'ru' ? 'Создал' : 'Създадено от'}:</span>
                  <span>{task.created_by?.full_name}</span>
                </div>

                {task.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t.dueDate}:</span>
                    <span>
                      {format(new Date(task.due_date), 'dd MMMM yyyy', { locale: dateLocale })}
                    </span>
                  </div>
                )}

                {task.estimated_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t.estimated}:</span>
                    <span>{task.estimated_hours}{t.hours}</span>
                    {task.actual_hours && (
                      <>
                        <span className="text-muted-foreground">• {t.actual}:</span>
                        <span>{task.actual_hours}{t.hours}</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t.created}:</span>
                  <span>
                    {format(new Date(task.created_at), 'dd.MM.yyyy HH:mm', { locale: dateLocale })}
                  </span>
                </div>
              </div>

              {task.tags && task.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{language === 'ru' ? 'Теги' : 'Тагове'}:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Действия */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{language === 'ru' ? 'Действия' : 'Действия'}</h3>
              
              {isTaskCreator && (
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  {language === 'ru' ? 'Настройки задачи' : 'Настройки на задачата'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;