import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Shield
} from "lucide-react";

const Index = () => {
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');

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
      achievements_page: "Награды"
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
      achievements_page: "Awards"
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold cyber-text flex items-center gap-3">
            <div className="relative">
              <Zap className="text-primary h-8 w-8 cyber-glow" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-xl"></div>
            </div>
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm tracking-wider">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            className="cyber-glow border-primary/30 hover:border-primary"
            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
          >
            {language === 'ru' ? 'EN' : 'РУ'}
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="mb-8 bg-card border-border cyber-glow">
        <CardHeader className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <CardTitle className="text-2xl cyber-text relative z-10">{t.welcome}</CardTitle>
          <CardDescription className="text-muted-foreground relative z-10">{t.welcomeDescription}</CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">{t.activeTasks}</CardTitle>
            <CheckSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold cyber-text">12</div>
            <p className="text-xs text-muted-foreground">+2 с прошлой недели</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">{t.teamMembers}</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold cyber-text">8</div>
            <p className="text-xs text-muted-foreground">Активных сотрудников</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">{t.achievements}</CardTitle>
            <Award className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">156</div>
            <p className="text-xs text-muted-foreground">За этот месяц</p>
          </CardContent>
        </Card>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border hover:border-primary/50 hover:cyber-glow transition-all duration-300 cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:cyber-text transition-colors">
              <CheckSquare className="h-5 w-5 text-primary group-hover:text-primary" />
              {t.myTasks}
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">5</Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 hover:cyber-glow transition-all duration-300 cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:cyber-text transition-colors">
              <Users className="h-5 w-5 text-primary" />
              {t.team}
              <Badge variant="outline" className="border-primary/30 text-primary">8</Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 hover:cyber-glow transition-all duration-300 cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:cyber-text transition-colors">
              <Target className="h-5 w-5 text-primary" />
              {t.projects}
              <Badge variant="outline" className="border-primary/30 text-primary">3</Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 hover:cyber-glow transition-all duration-300 cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:cyber-text transition-colors">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t.analytics}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 hover:cyber-glow transition-all duration-300 cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:cyber-text transition-colors">
              <Shield className="h-5 w-5 text-destructive" />
              {t.problems}
              <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">2</Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 hover:cyber-glow transition-all duration-300 cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:cyber-text transition-colors">
              <Award className="h-5 w-5 text-accent" />
              {t.achievements_page}
              <Badge variant="outline" className="border-accent/30 text-accent">12</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Index;