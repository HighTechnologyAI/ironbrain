import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  CheckSquare, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  Bell,
  Zap,
  Target,
  Award,
  BarChart3,
  Shield,
  Clock,
  Activity,
  Wifi,
  Cpu,
  Database,
  Bot,
  Sparkles,
  LogOut,
  Loader2
} from "lucide-react";
import OnlineUsersWidget from "@/components/OnlineUsersWidget";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { usePerformanceData } from "@/hooks/use-performance-data";
import { useUserPresence } from "@/hooks/use-user-presence";

const Index = () => {
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('online');
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: performanceData, loading: performanceLoading } = usePerformanceData();
  const { userCount: onlineUserCount } = useUserPresence();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const translations = {
    ru: {
      title: "TIGER CRM",
      subtitle: "Система достижения результатов компании",
      welcome: "Добро пожаловать в Tiger Technology AI",
      welcomeDescription: "Управляйте задачами, достижениями и масштабированием команды",
      activeTasks: "Активные задачи",
      teamMembers: "Участники команды", 
      achievements: "Достижения",
      myTasks: "Мои задачи",
      team: "Команда",
      projects: "Проекты",
      analytics: "Аналитика",
      problems: "Проблемы",
      achievements_page: "Награды",
      systemStatus: "Статус системы",
      online: "В сети",
      lastUpdate: "Последнее обновление",
      performance: "Производительность"
    },
    en: {
      title: "TIGER CRM",
      subtitle: "Company Results Achievement System",
      welcome: "Welcome to Tiger Technology AI",
      welcomeDescription: "Manage tasks, achievements and team scaling",
      activeTasks: "Active Tasks",
      teamMembers: "Team Members",
      achievements: "Achievements", 
      myTasks: "My Tasks",
      team: "Team",
      projects: "Projects",
      analytics: "Analytics",
      problems: "Issues",
      achievements_page: "Awards",
      systemStatus: "System Status",
      online: "Online",
      lastUpdate: "Last Update",
      performance: "Performance"
    }
  };

  const t = translations[language];

  const handleCardClick = (section: string, route?: string) => {
    if (route) {
      navigate(route);
    } else {
      // Определяем маршруты для карточек статистики
      switch (section) {
        case t.activeTasks:
          toast({
            title: "Переход к задачам",
            description: "Открываем список активных задач...",
          });
          navigate('/tasks');
          break;
        case t.teamMembers:
          toast({
            title: "Переход к команде",
            description: "Открываем управление командой...",
          });
          navigate('/team');
          break;
        case t.achievements:
          toast({
            title: "Переход к достижениям", 
            description: "Открываем награды и достижения...",
          });
          navigate('/awards');
          break;
        default:
          console.log(`Clicked on ${section}`);
      }
    }
  };

  const stats = [
    { 
      value: performanceData.pendingTasks, 
      label: t.activeTasks, 
      icon: CheckSquare, 
      trend: `+${performanceData.weeklyGrowth.tasks}`, 
      color: "text-primary" 
    },
    { 
      value: performanceData.activeTeamMembers, 
      label: t.teamMembers, 
      icon: Users, 
      trend: `+${performanceData.weeklyGrowth.team}`, 
      color: "text-primary" 
    },
    { 
      value: performanceData.totalAchievements, 
      label: t.achievements, 
      icon: Award, 
      trend: `+${performanceData.weeklyGrowth.achievements}`, 
      color: "text-accent" 
    }
  ];

  const menuItems = [
    { 
      title: t.myTasks, 
      icon: CheckSquare, 
      badge: performanceData.pendingTasks > 0 ? performanceData.pendingTasks.toString() : null, 
      color: "text-primary",
      description: "Управление личными задачами",
      route: "/tasks"
    },
    { 
      title: t.team, 
      icon: Users, 
      badge: performanceData.activeTeamMembers > 0 ? performanceData.activeTeamMembers.toString() : null, 
      color: "text-primary",
      description: "Команда и сотрудники",
      route: "/team"
    },
    { 
      title: t.projects, 
      icon: Target, 
      badge: "5", 
      color: "text-primary",
      description: "Активные проекты",
      route: "/projects"
    },
    { 
      title: t.analytics, 
      icon: BarChart3, 
      badge: null, 
      color: "text-primary",
      description: "Аналитика и отчеты",
      route: "/analytics"
    },
    { 
      title: t.problems, 
      icon: Shield, 
      badge: performanceData.overdueTasks > 0 ? performanceData.overdueTasks.toString() : null, 
      color: "text-destructive",
      description: "Проблемы требующие внимания",
      route: "/issues"
    },
    { 
      title: t.achievements_page, 
      icon: Award, 
      badge: performanceData.totalAchievements > 0 ? performanceData.totalAchievements.toString() : null, 
      color: "text-accent",
      description: "Награды и достижения",
      route: "/awards"
    },
    { 
      title: "Админ-панель", 
      icon: Settings, 
      badge: "SYS", 
      color: "text-accent",
      description: "Управление системой и внешний контроль",
      route: "/admin"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold cyber-text flex items-center gap-3">
            <div className="relative">
              <Zap className="text-primary h-8 w-8 cyber-glow animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-xl"></div>
            </div>
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm tracking-wider">{t.subtitle}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3 text-primary" />
              {t.systemStatus}: <span className="text-primary">{t.online}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground hidden sm:block">
            Пользователь: <span className="text-primary">{user?.email}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="cyber-glow border-primary/30 hover:border-primary transition-all"
            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
          >
            {language === 'ru' ? 'EN' : 'РУ'}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10 relative"
            onClick={() => handleCardClick('Уведомления')}
          >
            <Bell className="h-5 w-5 text-primary" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-bounce"></div>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="hover:bg-destructive/10 hover:border-destructive border-border"
            onClick={signOut}
            title="Выйти"
          >
            <LogOut className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="mb-8 bg-card border-border cyber-glow hover:border-primary/50 transition-all duration-500">
        <CardHeader className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="relative z-10">
            <CardTitle className="text-2xl cyber-text">{t.welcome}</CardTitle>
            <CardDescription className="text-muted-foreground">{t.welcomeDescription}</CardDescription>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{t.performance}:</span>
                {performanceLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <span className="text-primary font-mono">{performanceData.performance}%</span>
                )}
              </div>
              <Progress value={performanceData.performance} className="flex-1 max-w-[200px]" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={index}
            className="bg-card border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group cursor-pointer transform hover:scale-105 active:scale-95"
            onClick={() => handleCardClick(stat.label)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color} font-mono group-hover:text-primary transition-colors`}>{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-primary group-hover:animate-bounce" />
                <span className="text-primary font-semibold">{stat.trend}</span>
                <span>за неделю</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status Bar */}
      <Card className="mb-8 bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">DB:</span>
                <span className="text-primary font-mono">99.9%</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">CPU:</span>
                <span className="text-primary font-mono">24%</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Активных:</span>
                <span className="text-primary font-mono">{onlineUserCount} пользователей</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {t.lastUpdate}: {currentTime.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Special Card */}
      <Card 
        className="mb-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border-primary/30 cyber-glow hover:border-primary transition-all duration-500 cursor-pointer group"
        onClick={() => navigate('/ai-assistant')}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl group-hover:cyber-text transition-colors">
            <div className="relative">
              <Bot className="h-6 w-6 text-primary animate-pulse cyber-glow" />
              <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1 animate-bounce" />
            </div>
            Tiger AI Assistant
            <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 animate-pulse">
              NEW
            </Badge>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            🤖 Персональный помощник для создания задач с учетом навыков каждого сотрудника
          </CardDescription>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1 text-primary">
              <Sparkles className="h-3 w-3" />
              <span>Персонализация</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Target className="h-3 w-3" />
              <span>Умные задачи</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <BarChart3 className="h-3 w-3" />
              <span>Анализ нагрузки</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Online Users Widget */}
      <OnlineUsersWidget />

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {menuItems.map((item, index) => (
          <Card 
            key={index}
            className="bg-card border-border hover:border-primary/50 hover:cyber-glow transition-all duration-300 cursor-pointer group"
            onClick={() => handleCardClick(item.title, (item as any).route)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:cyber-text transition-colors">
                <item.icon className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform`} />
                {item.title}
                {item.badge && (
                  <Badge 
                    variant={item.color === "text-destructive" ? "destructive" : "secondary"} 
                    className={`
                      ${item.color === "text-destructive" 
                        ? "bg-destructive/20 text-destructive border-destructive/30" 
                        : item.color === "text-accent"
                        ? "bg-accent/20 text-accent border-accent/30"
                        : "bg-primary/20 text-primary border-primary/30"
                      } animate-pulse
                    `}
                  >
                    {item.badge}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {item.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;