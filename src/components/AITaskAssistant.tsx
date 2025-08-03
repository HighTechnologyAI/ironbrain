import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Zap, 
  User, 
  Clock, 
  Target, 
  Sparkles,
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react';

interface AITaskAssistantProps {
  employees?: Array<{
    id: string;
    full_name: string;
    position: string;
    department: string;
  }>;
  onTaskCreated?: (task: any) => void;
}

const AITaskAssistant: React.FC<AITaskAssistantProps> = ({ 
  employees = [], 
  onTaskCreated 
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [mode, setMode] = useState<'create_task' | 'analyze_workload' | 'suggest_optimization' | 'chat'>('create_task');
  const { toast } = useToast();

  const handleAIRequest = async () => {
    if (!message.trim() && mode !== 'analyze_workload') {
      toast({
        title: "Ошибка",
        description: "Введите сообщение для AI помощника",
        variant: "destructive"
      });
      return;
    }

    if (!selectedEmployee && mode !== 'chat') {
      toast({
        title: "Ошибка", 
        description: "Выберите сотрудника",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-task-assistant', {
        body: {
          action: mode,
          employeeId: selectedEmployee || null,
          message: message.trim(),
          taskContext: `Режим: ${mode}`
        }
      });

      if (error) throw error;

      if (data.success) {
        setAiResponse(data.data);
        toast({
          title: "AI Анализ готов",
          description: "Получен ответ от Tiger AI Assistant",
        });
      } else {
        throw new Error(data.error || 'Неизвестная ошибка');
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast({
        title: "Ошибка AI",
        description: error.message || "Не удалось получить ответ от AI",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!aiResponse || !selectedEmployee) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', selectedEmployee)
        .single();

      if (!profile) {
        throw new Error('Профиль сотрудника не найден');
      }

      const taskData = {
        title: aiResponse.title || 'AI Generated Task',
        description: aiResponse.description || message,
        assigned_to: selectedEmployee,
        status: 'pending' as const,
        priority: (aiResponse.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        estimated_hours: aiResponse.estimated_hours || null,
        tags: aiResponse.tags || [],
        created_by: selectedEmployee, // В реальной системе это будет текущий пользователь
        company_id: '00000000-0000-0000-0000-000000000000' // Заглушка для демо
      };

      const { error } = await supabase
        .from('tasks')
        .insert(taskData);

      if (error) throw error;

      toast({
        title: "Задача создана!",
        description: `Задача "${taskData.title}" назначена сотруднику`,
      });

      setMessage('');
      setAiResponse(null);
      
      if (onTaskCreated) {
        onTaskCreated(taskData);
      }
    } catch (error) {
      console.error('Task creation error:', error);
      toast({
        title: "Ошибка создания",
        description: "Не удалось создать задачу",
        variant: "destructive"
      });
    }
  };

  const modes = [
    { value: 'create_task', label: 'Создать задачу', icon: Target },
    { value: 'analyze_workload', label: 'Анализ нагрузки', icon: BarChart3 },
    { value: 'suggest_optimization', label: 'Оптимизация', icon: Settings },
    { value: 'chat', label: 'Свободный чат', icon: MessageSquare }
  ];

  return (
    <Card className="bg-card border-border cyber-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 cyber-text">
          <Bot className="h-5 w-5 animate-pulse" />
          Tiger AI Assistant
          <Sparkles className="h-4 w-4 text-accent" />
        </CardTitle>
        <CardDescription>
          Персональный помощник для управления задачами команды
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Режим работы */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Режим AI помощника</label>
          <Select value={mode} onValueChange={(value: any) => setMode(value)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Выберите режим" />
            </SelectTrigger>
            <SelectContent>
              {modes.map((modeOption) => (
                <SelectItem key={modeOption.value} value={modeOption.value}>
                  <div className="flex items-center gap-2">
                    <modeOption.icon className="h-4 w-4" />
                    {modeOption.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Выбор сотрудника */}
        {mode !== 'chat' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Сотрудник</label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{employee.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {employee.position} • {employee.department}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Сообщение для AI */}
        {mode !== 'analyze_workload' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {mode === 'create_task' ? 'Описание задачи' : 'Сообщение для AI'}
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                mode === 'create_task' 
                  ? "Опишите задачу в свободной форме. AI создаст персонализированную задачу с учетом навыков сотрудника..."
                  : mode === 'suggest_optimization'
                  ? "Опишите проблему или область для оптимизации..."
                  : "Задайте любой вопрос по управлению задачами..."
              }
              className="bg-input border-border min-h-[100px]"
            />
          </div>
        )}

        {/* Кнопка запроса */}
        <Button 
          onClick={handleAIRequest}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 cyber-glow"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 animate-spin" />
              AI обрабатывает...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Запросить Tiger AI
            </div>
          )}
        </Button>

        {/* Ответ AI */}
        {aiResponse && (
          <Card className="bg-secondary/50 border-primary/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                Ответ Tiger AI
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {mode === 'create_task' ? 'Задача' : 
                   mode === 'analyze_workload' ? 'Анализ' : 
                   mode === 'suggest_optimization' ? 'Оптимизация' : 'Чат'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === 'create_task' && aiResponse.title && (
                <>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Название задачи:</h4>
                    <p className="text-sm cyber-text font-mono">{aiResponse.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Описание:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {aiResponse.description}
                    </p>
                  </div>

                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>Приоритет: </span>
                      <Badge variant="outline" className="border-accent/30 text-accent">
                        {aiResponse.priority}
                      </Badge>
                    </div>
                    {aiResponse.estimated_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Время: {aiResponse.estimated_hours}ч</span>
                      </div>
                    )}
                  </div>

                  {aiResponse.tags && aiResponse.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Теги:</h4>
                      <div className="flex gap-1 flex-wrap">
                        {aiResponse.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResponse.recommendations && (
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Рекомендации:</h4>
                      <p className="text-sm text-muted-foreground">
                        {aiResponse.recommendations}
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleCreateTask}
                    className="w-full bg-accent hover:bg-accent/90"
                  >
                    Создать задачу
                  </Button>
                </>
              )}

              {mode === 'analyze_workload' && (
                <>
                  {aiResponse.workload_status && (
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Статус нагрузки:</h4>
                      <Badge 
                        variant={aiResponse.workload_status === 'critical' ? 'destructive' : 'outline'}
                        className="text-sm"
                      >
                        {aiResponse.workload_status}
                      </Badge>
                    </div>
                  )}
                  
                  {aiResponse.analysis && (
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Анализ:</h4>
                      <p className="text-sm text-muted-foreground">{aiResponse.analysis}</p>
                    </div>
                  )}

                  {aiResponse.recommendations && Array.isArray(aiResponse.recommendations) && (
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Рекомендации:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {aiResponse.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {mode === 'suggest_optimization' && (
                <>
                  {aiResponse.optimizations && Array.isArray(aiResponse.optimizations) && (
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Оптимизации:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {aiResponse.optimizations.map((opt: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">⚡</span>
                            {opt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiResponse.skill_development && (
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Развитие навыков:</h4>
                      <p className="text-sm text-muted-foreground">{aiResponse.skill_development}</p>
                    </div>
                  )}
                </>
              )}

              {(mode === 'chat' || aiResponse.response) && (
                <div>
                  <h4 className="font-medium text-foreground mb-1">Ответ:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {aiResponse.response || JSON.stringify(aiResponse, null, 2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default AITaskAssistant;