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
import { MiniSparkline, type SparklineData } from "@/components/ui/mini-sparkline";
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
    
    // Подписываемся на real-time обновления данных
    const tasksChannel = supabase.channel('analytics-tasks-updates')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'tasks' }, 
          () => {
            console.log('Tasks updated, refreshing analytics...');
            loadAnalyticsData();
          }
      )
      .subscribe();

    const profilesChannel = supabase.channel('analytics-profiles-updates')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles' }, 
          () => {
            console.log('Profiles updated, refreshing analytics...');
            loadAnalyticsData();
          }
      )
      .subscribe();

    const achievementsChannel = supabase.channel('analytics-achievements-updates')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'achievements' }, 
          () => {
            console.log('Achievements updated, refreshing analytics...');
            loadAnalyticsData();
          }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(achievementsChannel);
    };
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
    
    // Генерируем тестовые спарклайн данные для каждой метрики
    const generateSparklineData = (trend: string, count: number = 7): SparklineData[] => {
      return Array.from({ length: count }, (_, i) => {
        const base = 50;
        const variation = trend === 'up' ? i * 2 + Math.random() * 10 : 
                         trend === 'down' ? -i * 2 + Math.random() * 10 : 
                         Math.random() * 20 - 10;
        return { value: Math.max(0, base + variation) };
      });
    };
    
    return [
      {
        title: language === 'ru' ? 'Выполненных задач' : 'Завършени задачи',
        value: completedTasks.toString(),
        change: "+12.5%",
        trend: "up" as const,
        icon: Target,
        color: "text-primary",
        sparkline: generateSparklineData('up')
      },
      {
        title: language === 'ru' ? 'Активных сотрудников' : 'Активни служители',
        value: profiles.length.toString(),
        change: "+8.3%", 
        trend: "up" as const,
        icon: Users,
        color: "text-primary",
        sparkline: generateSparklineData('up')
      },
      {
        title: language === 'ru' ? 'Среднее время' : 'Средно време',
        value: `${avgHours.toFixed(1)}${language === 'ru' ? ' ч' : ' ч'}`,
        change: "-15.2%",
        trend: "down" as const,
        icon: Clock,
        color: "text-green-600",
        sparkline: generateSparklineData('down')
      },
      {
        title: language === 'ru' ? 'Достижений' : 'Постижения',
        value: achievements.length.toString(),
        change: "+23.1%",
        trend: "up" as const, 
        icon: Award,
        color: "text-accent",
        sparkline: generateSparklineData('up')
      }
    ];
  };

  // Данные по отделам и производительности рассчитываем на основе БД
  const getDepartmentStats = () => {
    if (!analyticsData) return [] as { name: string; tasks: number; members: number; efficiency: number }[];
    const { tasks, profiles } = analyticsData as any;

    const start = (() => {
      const now = new Date();
      const map: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
      return new Date(now.getTime() - (map[dateRange] || 30) * 24 * 60 * 60 * 1000);
    })();

    const activeProfiles = profiles.filter((p: any) => p.is_active);
    const departments = Array.from(new Set(activeProfiles.map((p: any) => p.department).filter(Boolean)));

    const stats = departments.map((dept: string) => {
      const deptMembers = activeProfiles.filter((p: any) => p.department === dept).length;
      const deptTasks = tasks.filter((t: any) => {
        const assignedDept = t.assigned_to?.department;
        const ts = new Date(t.updated_at || t.created_at);
        return assignedDept === dept && ts >= start;
      });
      const total = deptTasks.length;
      const completed = deptTasks.filter((t: any) => t.status === 'completed').length;
      const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { name: dept, tasks: total, members: deptMembers, efficiency };
    });

    // Фильтр выбранного отдела
    if (department !== 'all') {
      return stats.filter((s) => s.name === department);
    }
    return stats;
  };

  const getWeeklyPerformance = () => {
    if (!analyticsData) return [] as { week: string; completed: number; planned: number }[];
    const { tasks } = analyticsData as any;

    const start = (() => {
      const now = new Date();
      const map: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
      return new Date(now.getTime() - (map[dateRange] || 30) * 24 * 60 * 60 * 1000);
    })();

    const tasksInRange = tasks.filter((t: any) => new Date(t.created_at) >= start);

    const weekKey = (d: Date) => {
      const dt = new Date(d);
      const first = new Date(dt);
      first.setDate(dt.getDate() - dt.getDay()); // начало недели
      return first.toLocaleDateString('ru-RU');
    };

    const buckets = new Map<string, { completed: number; planned: number }>();
    tasksInRange.forEach((t: any) => {
      const key = weekKey(new Date(t.created_at));
      const bucket = buckets.get(key) || { completed: 0, planned: 0 };
      bucket.planned += 1;
      if (t.status === 'completed') bucket.completed += 1;
      buckets.set(key, bucket);
    });

    // Преобразуем в массив и отсортируем по дате
    const entries = Array.from(buckets.entries()).sort((a, b) => {
      const [da] = a; const [db] = b;
      return new Date(da).getTime() - new Date(db).getTime();
    });

    return entries.map(([week, v]) => ({ week, ...v }));
  };

  const getTopPerformers = () => {
    if (!analyticsData) return [] as { id: string; name: string; tasks: number; efficiency: number; department?: string }[];
    const { tasks, profiles } = analyticsData as any;

    const start = (() => {
      const now = new Date();
      const map: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
      return new Date(now.getTime() - (map[dateRange] || 30) * 24 * 60 * 60 * 1000);
    })();

    const profilesMap = new Map<string, any>();
    profiles.forEach((p: any) => profilesMap.set(p.id, p));

    const perf = new Map<string, { total: number; completed: number }>();

    tasks.forEach((t: any) => {
      const ts = new Date(t.updated_at || t.created_at);
      if (ts < start) return;
      const assigneeId = t.assigned_to?.id;
      if (!assigneeId) return;
      const bucket = perf.get(assigneeId) || { total: 0, completed: 0 };
      bucket.total += 1;
      if (t.status === 'completed') bucket.completed += 1;
      perf.set(assigneeId, bucket);
    });

    const arr = Array.from(perf.entries()).map(([id, v]) => {
      const p = profilesMap.get(id);
      if (!p) return null;
      const efficiency = v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0;
      return { id, name: p.full_name, tasks: v.completed, efficiency, department: p.department };
    }).filter(Boolean) as any[];

    // Фильтр отдела
    const filtered = department === 'all' ? arr : arr.filter((x) => x.department === department);

    return filtered.sort((a, b) => b.tasks - a.tasks).slice(0, 5);
  };
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

  const getDepartments = () => {
    if (!analyticsData) return [] as string[];
    const { profiles } = analyticsData as any;
    return Array.from(new Set((profiles || []).filter((p: any) => p.is_active && p.department).map((p: any) => p.department)));
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
            {getDepartments().map((dept: string) => (
              <SelectItem key={String(dept)} value={String(dept)}>{String(dept)}</SelectItem>
            ))}
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
                <div className="flex items-center justify-between mb-2">
                  <div className={`text-2xl font-bold ${stat.color} font-mono`}>
                    {stat.value}
                  </div>
                  <MiniSparkline 
                    data={stat.sparkline}
                    height={32}
                    width={80}
                    trend={stat.trend}
                    variant="line"
                    strokeWidth={1.5}
                  />
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
              {getWeeklyPerformance().map((week, index) => (
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
              {getDepartmentStats().map((dept, index) => (
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
            {getTopPerformers().map((performer, index) => (
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
                    <div className="text-sm text-muted-foreground">{performer.department || '—'}</div>
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