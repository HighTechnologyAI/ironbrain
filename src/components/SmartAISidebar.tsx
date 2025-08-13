import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusChip } from '@/components/ui/status-chip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/use-language';
import { 
  Brain, 
  Target, 
  AlertTriangle, 
  Clock, 
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Zap,
  Timer
} from 'lucide-react';

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

interface SmartAISidebarProps {
  selectedTask?: Task | null;
  tasks: Task[];
  onTaskAction?: (action: string, taskId: string) => void;
}

export const SmartAISidebar = ({ selectedTask, tasks, onTaskAction }: SmartAISidebarProps) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { t } = useLanguage();

  // Анализ рисков для выбранной задачи
  const analyzeTaskRisks = (task: Task) => {
    const risks = [];
    const now = new Date();
    const dueDate = new Date(task.due_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 1 && task.status !== 'completed') {
      risks.push({ 
        type: 'critical', 
        message: 'Задача просрочена', 
        icon: AlertTriangle 
      });
    } else if (daysUntilDue <= 2 && task.status !== 'completed') {
      risks.push({ 
        type: 'warning', 
        message: 'Приближается дедлайн', 
        icon: Clock 
      });
    }

    if (task.priority === 'critical' && task.status === 'pending') {
      risks.push({ 
        type: 'critical', 
        message: 'Критическая задача не начата', 
        icon: Target 
      });
    }

    if (task.estimated_hours > 0 && task.actual_hours > task.estimated_hours * 1.5) {
      risks.push({ 
        type: 'warning', 
        message: 'Превышение оценки времени', 
        icon: Timer 
      });
    }

    return risks;
  };

  // Генерация следующих действий
  const generateNextActions = (task: Task) => {
    const actions = [];

    switch (task.status) {
      case 'pending':
        actions.push({
          action: 'start_task',
          title: 'Начать выполнение',
          description: 'Перевести задачу в статус "В работе"',
          priority: 'high'
        });
        break;
      case 'in_progress':
        actions.push({
          action: 'update_progress',
          title: 'Обновить прогресс',
          description: 'Добавить комментарий о текущем состоянии',
          priority: 'medium'
        });
        if (task.estimated_hours > 0 && !task.actual_hours) {
          actions.push({
            action: 'log_time',
            title: 'Зафиксировать время',
            description: 'Отметить затраченные часы',
            priority: 'medium'
          });
        }
        break;
      case 'on_hold':
        actions.push({
          action: 'resolve_blocker',
          title: 'Устранить блокировку',
          description: 'Определить и решить препятствия',
          priority: 'high'
        });
        break;
    }

    // Общие действия
    if (task.priority === 'critical' || task.priority === 'high') {
      actions.push({
        action: 'escalate',
        title: 'Привлечь помощь',
        description: 'Обратиться к коллегам или руководителю',
        priority: 'medium'
      });
    }

    return actions;
  };

  // Автосаммари на основе истории задач
  const generateTaskSummary = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const overdueTasks = tasks.filter(t => {
      const dueDate = new Date(t.due_date);
      return dueDate < new Date() && t.status !== 'completed';
    }).length;

    const highPriorityTasks = tasks.filter(t => 
      (t.priority === 'high' || t.priority === 'critical') && t.status !== 'completed'
    ).length;

    return {
      completedTasks,
      inProgressTasks,
      overdueTasks,
      highPriorityTasks,
      totalTasks: tasks.length
    };
  };

  const summary = generateTaskSummary();
  const risks = selectedTask ? analyzeTaskRisks(selectedTask) : [];
  const nextActions = selectedTask ? generateNextActions(selectedTask) : [];

  return (
    <div className="w-80 bg-surface-1 border-l border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold font-ui">{t.smartAISidebar}</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {t.selectTaskToSeeInsights}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Summary Section */}
          <div>
            <h4 className="font-medium font-ui mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              {t.taskSummary}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-surface-2 border-border">
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-success">{summary.completedTasks}</div>
                  <div className="text-xs text-muted-foreground">{t.completed}</div>
                </div>
              </Card>
              <Card className="p-3 bg-surface-2 border-border">
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-primary">{summary.inProgressTasks}</div>
                  <div className="text-xs text-muted-foreground">{t.inProgress}</div>
                </div>
              </Card>
              <Card className="p-3 bg-surface-2 border-border">
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-destructive">{summary.overdueTasks}</div>
                  <div className="text-xs text-muted-foreground">Просрочено</div>
                </div>
              </Card>
              <Card className="p-3 bg-surface-2 border-border">
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-warning">{summary.highPriorityTasks}</div>
                  <div className="text-xs text-muted-foreground">{t.high}</div>
                </div>
              </Card>
            </div>
          </div>

          {selectedTask && (
            <>
              <Separator />
              
              {/* Risk Analysis */}
              {risks.length > 0 && (
                <div>
                  <h4 className="font-medium font-ui mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    {t.riskAnalysis}
                  </h4>
                  <div className="space-y-2">
                    {risks.map((risk, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-surface-2 rounded-lg border border-border">
                        <risk.icon className={`h-4 w-4 mt-0.5 ${
                          risk.type === 'critical' ? 'text-destructive' : 'text-warning'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{risk.message}</div>
                          <StatusChip 
                            variant={risk.type === 'critical' ? 'critical' : 'warning'}
                            className="mt-1 text-xs"
                          >
                            {risk.type === 'critical' ? t.riskCritical : 'ВНИМАНИЕ'}
                          </StatusChip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Actions */}
              {nextActions.length > 0 && (
                <div>
                  <h4 className="font-medium font-ui mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    {t.recommendedActions}
                  </h4>
                  <div className="space-y-2">
                    {nextActions.map((action, index) => (
                      <div key={index} className="p-3 bg-surface-2 rounded-lg border border-border hover:bg-surface-3 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium mb-1">{action.title}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onTaskAction?.(action.action, selectedTask.id)}
                            className="flex-shrink-0"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                        <StatusChip 
                          variant={action.priority === 'high' ? 'warning' : 'info'}
                          className="mt-2 text-xs"
                        >
                          {action.priority === 'high' ? 'ПРИОРИТЕТ' : 'РЕКОМЕНДАЦИЯ'}
                        </StatusChip>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Task Intelligence */}
              <div>
                <h4 className="font-medium font-ui mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  {t.taskIntelligence}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.complexity}:</span>
                    <StatusChip variant={selectedTask.priority === 'critical' ? 'critical' : 'info'}>
                      {selectedTask.priority === 'critical' ? 'ВЫСОКАЯ' : 'СРЕДНЯЯ'}
                    </StatusChip>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.timeEstimation}:</span>
                    <span className="font-mono font-semibold">
                      {selectedTask.estimated_hours}ч
                    </span>
                  </div>
                  
                  {selectedTask.tags && selectedTask.tags.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-sm">{t.aiTags}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTask.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {!selectedTask && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {t.noTaskSelected}<br />
                {t.selectTaskToSeeInsights}
              </p>
            </div>
          )}

          {/* AI Actions */}
          <div>
            <h4 className="font-medium font-ui mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              {t.aiActions}
            </h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setIsGeneratingSummary(!isGeneratingSummary)}
                disabled={isGeneratingSummary}
              >
                <Brain className="h-4 w-4 mr-2" />
                {isGeneratingSummary ? 'Генерация...' : t.generateSummary}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
              >
                <Target className="h-4 w-4 mr-2" />
                {t.suggestSubtasks}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                {t.findExperts}
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};