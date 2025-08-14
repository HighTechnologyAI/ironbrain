import React, { memo, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, Clock, User, Tag, CheckCircle, AlertCircle, Timer } from 'lucide-react';
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

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  language?: string;
  compact?: boolean;
}

const statusColors = {
  pending: 'border-transparent bg-accent text-accent-foreground',
  in_progress: 'border-transparent bg-primary text-primary-foreground',
  completed: 'border-transparent bg-secondary text-secondary-foreground',
  cancelled: 'border-transparent bg-muted text-muted-foreground',
  on_hold: 'border-transparent bg-destructive text-destructive-foreground',
} as const;

const priorityColors = {
  low: 'border-blue-200 bg-blue-50 text-blue-800',
  medium: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  high: 'border-orange-200 bg-orange-50 text-orange-800',
  critical: 'border-red-200 bg-red-50 text-red-800',
} as const;

const TaskCardComponent: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
  language = 'ru',
  compact = false
}) => {
  const dateLocale = useMemo(() => language === 'bg' ? bg : ru, [language]);
  
  const formattedDueDate = useMemo(() => {
    if (!task.due_date) return null;
    return format(new Date(task.due_date), 'dd/MM/yyyy', { locale: dateLocale });
  }, [task.due_date, dateLocale]);

  const formattedCreatedAt = useMemo(() => {
    return format(new Date(task.created_at), 'dd/MM/yyyy HH:mm', { locale: dateLocale });
  }, [task.created_at, dateLocale]);

  const handleClick = useCallback(() => {
    onClick?.(task);
  }, [onClick, task]);

  const handleStatusChange = useCallback((newStatus: Task['status']) => {
    onStatusChange?.(task.id, newStatus);
  }, [onStatusChange, task.id]);

  const progressPercentage = useMemo(() => {
    if (!task.estimated_hours) return 0;
    return Math.min((task.actual_hours / task.estimated_hours) * 100, 100);
  }, [task.actual_hours, task.estimated_hours]);

  if (compact) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm truncate flex-1">{task.title}</h4>
            <Badge className={`ml-2 text-xs ${priorityColors[task.priority]}`}>
              {task.priority}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.assigned_to?.full_name || 'Unassigned'}
            </span>
            <Badge className={statusColors[task.status]} variant="outline">
              {task.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <div className="flex gap-2">
            <Badge className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
            <Badge className={statusColors[task.status]} variant="outline">
              {task.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {task.description && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">
              {task.assigned_to?.full_name || 'Unassigned'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formattedCreatedAt}</span>
          </div>

          {formattedDueDate && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formattedDueDate}</span>
            </div>
          )}

          {task.estimated_hours && (
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span>{task.actual_hours || 0}h / {task.estimated_hours}h</span>
            </div>
          )}
        </div>

        {task.estimated_hours && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          
          {task.status !== 'completed' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(task.status === 'pending' ? 'in_progress' : 'completed');
              }}
            >
              {task.status === 'pending' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Start
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const TaskCard = memo(TaskCardComponent);