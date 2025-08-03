import { useState, useEffect } from "react";
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
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('online');
  const [progress, setProgress] = useState(75);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => prev >= 100 ? 0 : prev + 1);
    }, 100);
    return () => clearInterval(progressTimer);
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

  const handleCardClick = (section: string) => {
    toast({
      title: `Переход в ${section}`,
      description: "Функция будет доступна в следующей версии",
      duration: 2000,
    });
  };

  const stats = [
    { value: 23, label: t.activeTasks, icon: CheckSquare, trend: "+5", color: "text-primary" },
    { value: 12, label: t.teamMembers, icon: Users, trend: "+2", color: "text-primary" },
    { value: 187, label: t.achievements, icon: Award, trend: "+23", color: "text-accent" }
  ];

  const menuItems = [
    { 
      title: t.myTasks, 
      icon: CheckSquare, 
      badge: "8", 
      color: "text-primary",
      description: "Управление личными задачами"
    },
    { 
      title: t.team, 
      icon: Users, 
      badge: "12", 
      color: "text-primary",
      description: "Команда и сотрудники"
    },
    { 
      title: t.projects, 
      icon: Target, 
      badge: "5", 
      color: "text-primary",
      description: "Активные проекты"
    },
    { 
      title: t.analytics, 
      icon: BarChart3, 
      badge: null, 
      color: "text-primary",
      description: "Аналитика и отчеты"
    },
    { 
      title: t.problems, 
      icon: Shield, 
      badge: "3", 
      color: "text-destructive",
      description: "Проблемы требующие внимания"
    },
    { 
      title: t.achievements_page, 
      icon: Award, 
      badge: "24", 
      color: "text-accent",
      description: "Награды и достижения"
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
                <span className="text-primary font-mono">{progress}%</span>
              </div>
              <Progress value={progress} className="flex-1 max-w-[200px]" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={index}
            className="bg-card border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer"
            onClick={() => handleCardClick(stat.label)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color} font-mono`}>{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-primary">{stat.trend}</span>
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
                <span className="text-primary font-mono">8 пользователей</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {t.lastUpdate}: {currentTime.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <Card 
            key={index}
            className="bg-card border-border hover:border-primary/50 hover:cyber-glow transition-all duration-300 cursor-pointer group"
            onClick={() => handleCardClick(item.title)}
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