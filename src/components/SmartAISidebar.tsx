import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusChip } from '@/components/ui/status-chip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
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
  onTaskUpdate?: () => void;
}

export const SmartAISidebar = ({ selectedTask, tasks, onTaskAction, onTaskUpdate }: SmartAISidebarProps) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<{
    type: 'analysis' | 'subtasks' | 'experts',
    content: string,
    timestamp: Date
  } | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();

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

  // Действия с задачами через AI
  const handleGenerateSummary = async () => {
    if (!selectedTask) return;
    
    setIsGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('task-ai-assistant', {
        body: {
          action: 'analyze_task',
          taskContext: {
            id: selectedTask.id,
            title: selectedTask.title,
            description: selectedTask.description,
            status: selectedTask.status,
            priority: selectedTask.priority,
            estimated_hours: selectedTask.estimated_hours,
            actual_hours: selectedTask.actual_hours
          },
          message: 'Создай подробный анализ этой задачи с рекомендациями по улучшению',
          language: 'ru'
        }
      });

      if (error) throw error;
      
      // Сохраняем результат для отображения
      if (data?.response) {
        setAiResults({
          type: 'analysis',
          content: data.response,
          timestamp: new Date()
        });
      }
      
      toast({
        title: "AI Анализ готов",
        description: "Результат отображен ниже в секции AI результатов",
      });
      
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сгенерировать анализ",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateSubtasks = async () => {
    if (!selectedTask) return;
    
    setIsGeneratingSubtasks(true);
    try {
      const { data, error } = await supabase.functions.invoke('task-ai-assistant', {
        body: {
          action: 'suggest_optimization',
          taskContext: {
            id: selectedTask.id,
            title: selectedTask.title,
            description: selectedTask.description,
            status: selectedTask.status,
            priority: selectedTask.priority
          },
          message: 'Предложи подзадачи для разбиения этой задачи на более мелкие части',
          language: 'ru'
        }
      });

      if (error) throw error;
      
      // Сохраняем результат для отображения
      if (data?.response) {
        setAiResults({
          type: 'subtasks',
          content: data.response,
          timestamp: new Date()
        });
      }
      
      toast({
        title: "Подзадачи предложены",
        description: "Результат отображен ниже в секции AI результатов",
      });
      
    } catch (error) {
      console.error('Error generating subtasks:', error);
      toast({
        title: "Ошибка", 
        description: "Не удалось сгенерировать подзадачи",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleTaskAction = async (action: string, taskId: string) => {
    if (!selectedTask) return;
    
    setIsLoadingAction(action);
    
    try {
      let updateData: any = {};
      
      switch (action) {
        case 'start_task':
          updateData = { status: 'in_progress' };
          break;
          
        case 'update_progress':
          // Добавляем автоматический комментарий о прогрессе
          const progressComment = `📊 Обновление прогресса: Задача находится в работе. Текущий статус: ${selectedTask.status}. Приоритет: ${selectedTask.priority}.`;
          
          const { error: commentError } = await supabase
            .from('task_comments')
            .insert({
              task_id: taskId,
              user_id: selectedTask.assigned_to?.id || selectedTask.created_by?.id,
              content: progressComment,
              language: 'ru'
            });

          if (commentError) throw commentError;

          toast({
            title: "✅ Прогресс обновлен",
            description: "Комментарий о текущем состоянии добавлен к задаче",
          });
          
          onTaskUpdate?.();
          setIsLoadingAction(null);
          return;
          
        case 'log_time':
          // Добавляем 1 час к затраченному времени как пример
          const currentHours = selectedTask.actual_hours || 0;
          const newHours = currentHours + 1;
          
          updateData = { 
            actual_hours: newHours 
          };
          
          // Также добавляем комментарий о времени
          const timeComment = `⏱️ Зафиксировано время: +1 час. Общее затраченное время: ${newHours} ч.`;
          
          const { error: timeCommentError } = await supabase
            .from('task_comments')
            .insert({
              task_id: taskId,
              user_id: selectedTask.assigned_to?.id || selectedTask.created_by?.id,
              content: timeComment,
              language: 'ru'
            });

          if (timeCommentError) console.warn('Failed to add time comment:', timeCommentError);
          break;
          
        case 'escalate':
          // Создаем уведомление для руководителя/коллег
          const escalationComment = `🚨 Запрос помощи: Задача требует дополнительного внимания. Исполнитель: ${selectedTask.assigned_to?.full_name || 'Не назначен'}. Необходима консультация или поддержка.`;
          
          const { error: escalationError } = await supabase
            .from('task_comments')
            .insert({
              task_id: taskId,
              user_id: selectedTask.assigned_to?.id || selectedTask.created_by?.id,
              content: escalationComment,
              language: 'ru'
            });

          if (escalationError) throw escalationError;

          // Попытаемся найти админов для уведомления
          const { data: admins } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')
            .eq('is_active', true)
            .limit(3);

          if (admins && admins.length > 0) {
            // Создаем уведомления для админов
            const notifications = admins.map(admin => ({
              user_id: admin.id,
              title: 'Запрос помощи по задаче',
              message: `Задача "${selectedTask.title}" требует внимания`,
              type: 'escalation',
              data: { task_id: taskId, requester_id: selectedTask.assigned_to?.id || selectedTask.created_by?.id }
            }));

            await supabase
              .from('notifications')
              .insert(notifications);
          }

          toast({
            title: "🤝 Помощь запрошена",
            description: "Уведомление отправлено коллегам и руководству",
          });
          
          onTaskUpdate?.();
          setIsLoadingAction(null);
          return;
          
        case 'resolve_blocker':
          updateData = { status: 'in_progress' };
          
          const blockerComment = `🔓 Блокировка устранена: Препятствия для выполнения задачи решены. Работа возобновлена.`;
          
          const { error: blockerError } = await supabase
            .from('task_comments')
            .insert({
              task_id: taskId,
              user_id: selectedTask.assigned_to?.id || selectedTask.created_by?.id,
              content: blockerComment,
              language: 'ru'
            });

          if (blockerError) console.warn('Failed to add blocker comment:', blockerError);
          break;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('tasks')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (error) throw error;

        const actionTitles = {
          'start_task': 'Задача запущена',
          'log_time': 'Время зафиксировано',
          'resolve_blocker': 'Блокировка устранена'
        };

        toast({
          title: actionTitles[action] || "Задача обновлена",
          description: "Изменения сохранены успешно",
        });

        onTaskUpdate?.();
      }
      
    } catch (error) {
      console.error('Error performing task action:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить действие",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAction(null);
    }
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
                            onClick={() => handleTaskAction(action.action, selectedTask.id)}
                            className="flex-shrink-0"
                            disabled={isLoadingAction === action.action}
                          >
                            {isLoadingAction === action.action ? (
                              <Timer className="h-3 w-3 animate-spin" />
                            ) : (
                              <ArrowRight className="h-3 w-3" />
                            )}
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

              {/* AI Results Display - Moved up for better visibility */}
              {aiResults && (
                <div>
                  <h4 className="font-medium font-ui mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary animate-pulse" />
                    AI Результат
                    <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                      {aiResults.type === 'analysis' ? 'Анализ' : 
                       aiResults.type === 'subtasks' ? 'Подзадачи' : 'Эксперты'}
                    </Badge>
                  </h4>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3 cyber-border shadow-glow">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {aiResults.timestamp.toLocaleTimeString('ru-RU')}
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground max-h-48 overflow-y-auto">
                      {aiResults.content}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setAiResults(null)}
                        className="text-xs"
                      >
                        Закрыть
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          navigator.clipboard.writeText(aiResults.content);
                          toast({
                            title: "Скопировано",
                            description: "Результат скопирован в буфер обмена",
                          });
                        }}
                        className="text-xs"
                      >
                        Копировать
                      </Button>
                    </div>
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
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary || !selectedTask}
              >
                <Brain className="h-4 w-4 mr-2" />
                {isGeneratingSummary ? 'Анализ...' : 'Анализ задачи'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={handleGenerateSubtasks}
                disabled={isGeneratingSubtasks || !selectedTask}
              >
                <Target className="h-4 w-4 mr-2" />
                {isGeneratingSubtasks ? 'Генерация...' : 'Предложить подзадачи'}
              </Button>

              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                disabled={!selectedTask}
                onClick={() => {
                  if (!selectedTask) return;
                  
                  // Здесь можно добавить функцию поиска экспертов
                  setAiResults({
                    type: 'experts',
                    content: `Для задачи "${selectedTask.title}" рекомендуются следующие эксперты:\n\n• ${selectedTask.assigned_to?.full_name} - ${selectedTask.assigned_to?.position}\n• Можно привлечь коллег из отдела ${selectedTask.assigned_to?.position}\n• Рекомендуется консультация с руководителем проекта`,
                    timestamp: new Date()
                  });
                  
                  toast({
                    title: "Эксперты найдены",
                    description: "Рекомендации отображены в секции AI результатов",
                  });
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Найти экспертов
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};