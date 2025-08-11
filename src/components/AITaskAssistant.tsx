import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/use-language';
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
  const { t } = useLanguage();

  const handleAIRequest = async () => {
    if (!message.trim() && mode !== 'analyze_workload') {
      toast({
        title: t.aiErrorTitle,
        description: t.aiMessageRequired,
        variant: "destructive"
      });
      return;
    }

    if (!selectedEmployee && mode !== 'chat') {
      toast({
        title: t.aiErrorTitle, 
        description: t.aiEmployeeRequired,
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
          taskContext: "Mode: " + mode
        }
      });

      if (error) throw error;

      if (data.success) {
        setAiResponse(data.data);
        toast({
          title: t.aiAssistantReadyTitle,
          description: t.aiAssistantReadyDesc,
        });
      } else {
        throw new Error(data.error || 'Неизвестная ошибка');
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast({
        title: t.aiErrorTitle,
        description: (error as any).message || t.aiErrorDesc,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!aiResponse || !selectedEmployee) return;

    try {
      // Профиль выбранного исполнителя (валидация)
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', selectedEmployee)
        .single();

      if (profileErr || !profile) {
        throw new Error('Профиль сотрудника не найден');
      }

      // Текущий пользователь (создатель задачи)
      const { data: me, error: meError } = await supabase.rpc('get_current_user_profile');
      if (meError || !me) {
        throw new Error('Не удалось получить профиль текущего пользователя');
      }

      // Нормализуем оценку времени
      let estimated: number | null = null;
      if (typeof aiResponse.estimated_hours === 'number') {
        estimated = Math.round(aiResponse.estimated_hours);
      } else if (typeof aiResponse.estimated_hours === 'string') {
        const m = aiResponse.estimated_hours.match(/\d+(?:[\.,]\d+)?/);
        if (m) estimated = Math.round(parseFloat(m[0].replace(',', '.')));
      }

      // Нормализуем теги
      let tags: string[] = [];
      if (Array.isArray(aiResponse.tags)) {
        tags = aiResponse.tags.map((t: any) => String(t));
      } else if (typeof aiResponse.tags === 'string') {
        tags = aiResponse.tags.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      const taskData = {
        title: aiResponse.title || 'AI Generated Task',
        description: aiResponse.description || message,
        assigned_to: selectedEmployee,
        status: 'pending' as const,
        priority: (aiResponse.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        estimated_hours: estimated,
        tags,
        created_by: (me as any).id,
        company_id: null
      };

      const { data: inserted, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .maybeSingle();

      if (error) throw error;

      toast({
        title: t.taskCreatedTitle,
        description: `${t.taskAssigned}: "${taskData.title}"`,
      });

      setMessage('');
      setAiResponse(null);
      
      if (onTaskCreated) {
        onTaskCreated(inserted || taskData);
      }
    } catch (error: any) {
      console.error('Task creation error:', error);
      toast({
        title: t.error,
        description: error?.message || t.taskCreationError,
        variant: "destructive"
      });
    }
  };

  const modes = [
    { value: 'create_task', label: t.aiModeCreateTask, icon: Target },
    { value: 'analyze_workload', label: t.aiModeAnalyzeWorkload, icon: BarChart3 },
    { value: 'suggest_optimization', label: t.aiModeSuggestOptimization, icon: Settings },
    { value: 'chat', label: t.aiModeChat, icon: MessageSquare }
  ];

  return (
    <Card className="bg-card border-border cyber-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 cyber-text">
          <Bot className="h-5 w-5 animate-pulse" />
          {t.aiAssistant}
          <Sparkles className="h-4 w-4 text-accent" />
        </CardTitle>
        <CardDescription>
          {t.aiAssistantDesc}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Режим работы */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t.aiModeLabel}</label>
          <Select value={mode} onValueChange={(value: any) => setMode(value)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder={t.aiModePlaceholder} />
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
            <label className="text-sm font-medium text-foreground">{t.employee}</label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder={t.aiEmployeePlaceholder} />
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
              {mode === 'create_task' ? t.aiTaskDescriptionLabel : t.aiMessageLabel}
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                mode === 'create_task' 
                  ? t.aiPlaceholderCreateTask
                  : mode === 'suggest_optimization'
                  ? t.aiPlaceholderSuggestOptimization
                  : t.aiPlaceholderChat
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
              {t.aiProcessing}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {t.aiRequest}
            </div>
          )}
        </Button>

        {/* Ответ AI */}
        {aiResponse && (
          <Card className="bg-secondary/50 border-primary/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                {t.aiResponseTitle}
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {mode === 'create_task' ? t.aiBadgeTask : 
                   mode === 'analyze_workload' ? t.aiBadgeAnalysis : 
                   mode === 'suggest_optimization' ? t.aiBadgeOptimization : t.aiBadgeChat}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === 'create_task' && aiResponse.title && (
                <>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{t.aiTaskName}</h4>
                    <p className="text-sm cyber-text font-mono">{aiResponse.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{t.aiDescription}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {aiResponse.description}
                    </p>
                  </div>

                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{t.aiPriority}: </span>
                      <Badge variant="outline" className="border-accent/30 text-accent">
                        {aiResponse.priority}
                      </Badge>
                    </div>
                    {aiResponse.estimated_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{t.aiTime}: {aiResponse.estimated_hours}{t.hours}</span>
                      </div>
                    )}
                  </div>

                  {aiResponse.tags && aiResponse.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-1">{t.aiTags}</h4>
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
                      <h4 className="font-medium text-foreground mb-1">{t.aiRecommendations}</h4>
                      <p className="text-sm text-muted-foreground">
                        {aiResponse.recommendations}
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleCreateTask}
                    className="w-full bg-accent hover:bg-accent/90"
                  >
                    {t.createTask}
                  </Button>
                </>
              )}

              {mode === 'analyze_workload' && (
                <>
                  {aiResponse.workload_status && (
                    <div>
                      <h4 className="font-medium text-foreground mb-1">{t.aiWorkloadStatus}</h4>
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
                      <h4 className="font-medium text-foreground mb-1">{t.aiAnalysis}</h4>
                      <p className="text-sm text-muted-foreground">{aiResponse.analysis}</p>
                    </div>
                  )}

                  {aiResponse.recommendations && Array.isArray(aiResponse.recommendations) && (
                    <div>
                      <h4 className="font-medium text-foreground mb-1">{t.aiRecommendations}</h4>
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
                      <h4 className="font-medium text-foreground mb-1">{t.aiOptimizations}</h4>
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
                      <h4 className="font-medium text-foreground mb-1">{t.aiSkillDevelopment}</h4>
                      <p className="text-sm text-muted-foreground">{aiResponse.skill_development}</p>
                    </div>
                  )}
                </>
              )}

              {(mode === 'chat' || aiResponse.response) && (
                <div>
                  <h4 className="font-medium text-foreground mb-1">{t.aiAnswer}</h4>
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