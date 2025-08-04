import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  Award,
  Activity,
  Calendar,
  Download,
  ArrowLeft,
  PieChart,
  LineChart,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [department, setDepartment] = useState("all");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, department]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Загружаем данные задач
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to:profiles!tasks_assigned_to_fkey(id, full_name, department),
          created_by:profiles!tasks_created_by_fkey(id, full_name)
        `);

      // Загружаем данные профилей
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true);

      // Загружаем достижения
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*');

      setAnalyticsData({
        tasks: tasks || [],
        profiles: profiles || [],
        achievements: achievements || []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    if (!analyticsData) return [];
    
    const { tasks, profiles, achievements } = analyticsData;
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
    const avgHours = tasks.reduce((acc: number, t: any) => acc + (t.actual_hours || 0), 0) / tasks.length || 0;
    
    return [
      {
        title: language === 'ru' ? 'Выполненных задач' : 'Завършени задачи',
        value: completedTasks.toString(),
        change: "+12.5%",
        trend: "up",
        icon: Target,
        color: "text-primary"
      },
      {
        title: language === 'ru' ? 'Активных сотрудников' : 'Активни служители',
        value: profiles.length.toString(),
        change: "+8.3%", 
        trend: "up",
        icon: Users,
        color: "text-primary"
      },
      {
        title: language === 'ru' ? 'Среднее время' : 'Средно време',
        value: `${avgHours.toFixed(1)}${language === 'ru' ? ' ч' : ' ч'}`,
        change: "-15.2%",
        trend: "down",
        icon: Clock,
        color: "text-green-600"
      },
      {
        title: language === 'ru' ? 'Достижений' : 'Постижения',
        value: achievements.length.toString(),
        change: "+23.1%",
        trend: "up", 
        icon: Award,
        color: "text-accent"
      }
    ];
  };


  const departmentStats = [
    { name: "Разработка", tasks: 347, members: 8, efficiency: 89 },
    { name: "Дизайн", tasks: 156, members: 4, efficiency: 92 },
    { name: "Тестирование", tasks: 234, members: 5, efficiency: 86 },
    { name: "Управление", tasks: 189, members: 3, efficiency: 94 },
    { name: "Маркетинг", tasks: 98, members: 2, efficiency: 78 }
  ];

  const weeklyPerformance = [
    { week: "Нед 1", completed: 45, planned: 50 },
    { week: "Нед 2", completed: 52, planned: 55 },
    { week: "Нед 3", completed: 48, planned: 52 },
    { week: "Нед 4", completed: 67, planned: 60 },
    { week: "Нед 5", completed: 71, planned: 65 },
    { week: "Нед 6", completed: 58, planned: 62 }
  ];

  const topPerformers = [
    { name: "Мария Иванова", tasks: 34, efficiency: 96, department: "Управление" },
    { name: "Александр Петров", tasks: 28, efficiency: 94, department: "Разработка" },
    { name: "Елена Козлова", tasks: 31, efficiency: 92, department: "Тестирование" },
    { name: "Дмитрий Сидоров", tasks: 25, efficiency: 90, department: "Дизайн" },
    { name: "Анна Морозова", tasks: 23, efficiency: 88, department: "Разработка" }
  ];

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600";
    if (efficiency >= 80) return "text-amber-600";
    return "text-destructive";
  };

  const getEfficiencyBg = (efficiency: number) => {
    if (efficiency >= 90) return "bg-green-600";
    if (efficiency >= 80) return "bg-amber-500";
    return "bg-destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold cyber-text flex items-center gap-3">
              <BarChart3 className="text-primary h-8 w-8" />
              {t.analytics}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ru' ? 'Анализ производительности и метрики команды' : 'Анализ на производителността и метрики на екипа'}
            </p>
          </div>
        </div>
        <Button variant="outline" className="cyber-glow">
          <Download className="h-4 w-4 mr-2" />
          Экспорт отчета
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Период" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Последние 7 дней</SelectItem>
            <SelectItem value="30d">Последние 30 дней</SelectItem>
            <SelectItem value="90d">Последние 3 месяца</SelectItem>
            <SelectItem value="1y">Последний год</SelectItem>
          </SelectContent>
        </Select>

        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Отдел" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все отделы</SelectItem>
            <SelectItem value="development">Разработка</SelectItem>
            <SelectItem value="design">Дизайн</SelectItem>
            <SelectItem value="testing">Тестирование</SelectItem>
            <SelectItem value="management">Управление</SelectItem>
            <SelectItem value="marketing">Маркетинг</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          const trendColor = stat.trend === 'up' ? 'text-green-600' : 'text-destructive';
          
          return (
            <Card key={index} className="hover:border-primary/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color} font-mono mb-1`}>
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                  <span className={trendColor}>{stat.change}</span>
                  <span className="text-muted-foreground">за период</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Производительность по неделям
            </CardTitle>
            <CardDescription>
              Сравнение запланированных и выполненных задач
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyPerformance.map((week, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{week.week}</span>
                    <span className="font-mono">
                      {week.completed}/{week.planned}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(week.completed / week.planned) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-mono w-12 text-right">
                      {Math.round((week.completed / week.planned) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Производительность отделов
            </CardTitle>
            <CardDescription>
              Задачи и эффективность по отделам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{dept.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {dept.tasks} задач • {dept.members} чел.
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono ${getEfficiencyColor(dept.efficiency)}`}>
                        {dept.efficiency}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getEfficiencyBg(dept.efficiency)}`}
                      style={{ width: `${dept.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            Лучшие исполнители
          </CardTitle>
          <CardDescription>
            Топ сотрудников по количеству выполненных задач и эффективности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' : 'bg-primary'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{performer.name}</div>
                    <div className="text-sm text-muted-foreground">{performer.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-mono text-primary">{performer.tasks}</div>
                    <div className="text-xs text-muted-foreground">задач</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-mono ${getEfficiencyColor(performer.efficiency)}`}>
                      {performer.efficiency}%
                    </div>
                    <div className="text-xs text-muted-foreground">эффективность</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;