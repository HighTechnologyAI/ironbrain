import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import AppNavigation from '@/components/AppNavigation';
import AITaskAssistant from '@/components/AITaskAssistant';
import { 
  Users, 
  CheckSquare, 
  Bot, 
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Activity,
  Brain
} from 'lucide-react';

const AIAssistant = () => {
  const [employees, setEmployees] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Демо данные для сотрудников
  const demoEmployees = [
    {
      id: '1',
      full_name: 'Алпи',
      position: 'COO / Operation Director',
      department: 'Управление',
      role: 'coo',
      skills: ['Operations', 'Strategy', 'Leadership']
    },
    {
      id: '2', 
      full_name: 'Мики',
      position: 'Marketing Director',
      department: 'Маркетинг',
      role: 'marketing_director',
      skills: ['Digital Marketing', 'Brand Strategy', 'Analytics']
    },
    {
      id: '3',
      full_name: 'Жан',
      position: 'Top Specialist',
      department: 'Экспертиза',
      role: 'specialist',
      skills: ['Technical Expertise', 'Problem Solving', 'Innovation']
    },
    {
      id: '4',
      full_name: 'Алекс', 
      position: 'Factory Manager',
      department: 'Производство',
      role: 'factory_manager',
      skills: ['Production Management', 'Quality Control', 'Team Leadership']
    },
    {
      id: '5',
      full_name: 'Брат',
      position: 'Factory Director',
      department: 'Производство',
      role: 'factory_director',
      skills: ['Industrial Operations', 'Strategic Planning', 'Resource Management']
    },
    {
      id: '6',
      full_name: 'Дани',
      position: 'CEO',
      department: 'Руководство',
      role: 'ceo',
      skills: ['Executive Leadership', 'Business Strategy', 'Vision']
    },
    {
      id: '7',
      full_name: 'Ило',
      position: 'Founder',
      department: 'Руководство',
      role: 'founder',
      skills: ['Entrepreneurship', 'Innovation', 'Company Culture']
    },
    {
      id: '8',
      full_name: 'Питер',
      position: 'IT Manager',
      department: 'IT',
      role: 'it_manager',
      skills: ['Technology Strategy', 'System Architecture', 'Team Management']
    },
    {
      id: '9',
      full_name: 'Шеф',
      position: 'Senior Advisor',
      department: 'Консультации',
      role: 'advisor',
      skills: ['Strategic Consulting', 'Mentorship', 'Business Development']
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Загружаем реальные профили из БД
      const { data: realEmployees } = await supabase
        .from('profiles')
        .select('id, full_name, position, department')
        .eq('is_active', true);

      // Если есть реальные сотрудники, используем их, иначе демо данные
      if (realEmployees && realEmployees.length > 0) {
        setEmployees(realEmployees);
      } else {
        setEmployees(demoEmployees);
      }
      
      // Загружаем персонализированные задачи
      // В реальной системе здесь будет auth.uid(), а пока используем первого сотрудника
      const currentUserId = realEmployees?.[0]?.id || '1';
      
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, status, created_at, assigned_to, priority')
        .or(`assigned_to.eq.${currentUserId},created_by.eq.${currentUserId}`)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentTasks(tasks || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: t.error,
        description: t.tasksLoadError,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trStatus = (status: string) => {
    switch (status) {
      case 'pending': return t.pending;
      case 'in_progress': return t.inProgress;
      case 'completed': return t.completed;
      case 'cancelled': return t.cancelled;
      case 'on_hold': return t.onHold;
      default: return status;
    }
  };

  const trPriority = (p?: string) => {
    switch (p) {
      case 'low': return t.low;
      case 'medium': return t.medium;
      case 'high': return t.high;
      case 'critical': return t.critical;
      default: return p || '';
    }
  };
  const handleTaskCreated = (task: any) => {
    // Обновляем список недавних задач
    setRecentTasks(prev => [task, ...prev.slice(0, 4)]);
    
    toast({
      title: t.success,
      description: t.create || 'Создано',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary">
          <Brain className="h-6 w-6 animate-pulse" />
          <span>{t.loading} {t.aiAssistant}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation 
        title={t.aiAssistant}
        subtitle={t.aiAssistantDesc}
      />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* AI Status Banner */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-primary animate-pulse" />
              <div>
                <h3 className="font-semibold text-primary">{t.aiAssistant} — {t.online}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.aiAssistantDesc}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                  <Activity className="h-3 w-3 mr-1" />
                  {t.online}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Assistant Panel */}
        <div className="lg:col-span-2">
          <AITaskAssistant />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Статистика команды */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t.team}
              </CardTitle>
              <CardDescription>{t.teamDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {employees.map((employee) => (
                  <div 
                    key={employee.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {employee.full_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {employee.position}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-primary/30 text-primary"
                    >
                      {employee.department}
                    </Badge>
                  </div>
                ))}
                
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground text-center">
                    {t.teamMembers}: {employees.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Недавние задачи */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                {t.tasks}
              </CardTitle>
              <CardDescription>{t.tasksDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                   {recentTasks.map((task) => (
                     <div 
                       key={task.id}
                       className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border-l-2 border-l-primary/50"
                     >
                       <div className="font-medium text-sm">{task.title}</div>
                       <div className="flex items-center justify-between mt-1">
                         <div className="flex items-center gap-2">
                           <Badge 
                             variant={task.status === 'completed' ? 'default' : 'outline'}
                             className="text-xs"
                           >
                              {trStatus(task.status)}
                            </Badge>
                            {task.priority && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  task.priority === 'critical' ? 'border-red-500 text-red-500' :
                                  task.priority === 'high' ? 'border-orange-500 text-orange-500' :
                                  task.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                  'border-green-500 text-green-500'
                                }`}
                              >
                                {trPriority(task.priority)}
                              </Badge>
                            )}
                         </div>
                         <div className="text-xs text-muted-foreground">
                           {new Date(task.created_at).toLocaleDateString()}
                         </div>
                       </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted-foreground text-sm">
                    {t.noTasksFound}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t.createTask}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card className="bg-card border-border cyber-glow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 cyber-text">
                <Sparkles className="h-5 w-5" />
                {t.aiAssistant}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>{t.aiCapabilitiesPersonalized}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>{t.aiCapabilitiesWorkload}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>{t.aiCapabilitiesOptimization}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span>{t.aiCapabilitiesChat}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <div className="text-xs text-primary font-medium mb-1">
                {t.aiTipTitle}
              </div>
              <div className="text-xs text-muted-foreground">
                {t.aiTipText}
              </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;