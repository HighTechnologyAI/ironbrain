import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  Search, 
  Calendar,
  Users,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const projects = [
    {
      id: 1,
      name: "Tiger CRM v2.0",
      description: "Обновление основной CRM системы с новыми возможностями",
      status: "active",
      priority: "high",
      progress: 75,
      startDate: "2024-01-15",
      endDate: "2024-03-30",
      teamSize: 8,
      tasksTotal: 45,
      tasksCompleted: 34,
      manager: "Мария Иванова",
      budget: 1500000,
      spent: 1125000
    },
    {
      id: 2,
      name: "Мобильное приложение",
      description: "Разработка мобильного приложения для iOS и Android",
      status: "active",
      priority: "medium",
      progress: 45,
      startDate: "2024-02-01",
      endDate: "2024-05-15",
      teamSize: 5,
      tasksTotal: 32,
      tasksCompleted: 14,
      manager: "Александр Петров",
      budget: 800000,
      spent: 360000
    },
    {
      id: 3,
      name: "AI Интеграция",
      description: "Внедрение AI помощника в основные бизнес-процессы",
      status: "planning",
      priority: "high",
      progress: 15,
      startDate: "2024-03-01",
      endDate: "2024-06-30",
      teamSize: 6,
      tasksTotal: 28,
      tasksCompleted: 4,
      manager: "Дмитрий Сидоров",
      budget: 2000000,
      spent: 300000
    },
    {
      id: 4,
      name: "Система отчетности",
      description: "Автоматизация генерации отчетов и аналитики",
      status: "completed",
      priority: "medium",
      progress: 100,
      startDate: "2023-10-01",
      endDate: "2024-01-15",
      teamSize: 4,
      tasksTotal: 22,
      tasksCompleted: 22,
      manager: "Елена Козлова",
      budget: 600000,
      spent: 580000
    },
    {
      id: 5,
      name: "Безопасность данных",
      description: "Усиление мер безопасности и соответствие GDPR",
      status: "on-hold",
      priority: "low",
      progress: 30,
      startDate: "2024-01-20",
      endDate: "2024-04-20",
      teamSize: 3,
      tasksTotal: 18,
      tasksCompleted: 5,
      manager: "Александр Петров",
      budget: 400000,
      spent: 120000
    }
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Активный', variant: 'default' as const, icon: Activity, color: 'text-primary' };
      case 'completed':
        return { label: 'Завершен', variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' };
      case 'planning':
        return { label: 'Планирование', variant: 'outline' as const, icon: Clock, color: 'text-amber-600' };
      case 'on-hold':
        return { label: 'Приостановлен', variant: 'destructive' as const, icon: AlertCircle, color: 'text-destructive' };
      default:
        return { label: 'Неизвестно', variant: 'secondary' as const, icon: AlertCircle, color: 'text-muted-foreground' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
              <Target className="text-primary h-8 w-8" />
              Проекты
            </h1>
            <p className="text-muted-foreground mt-1">Управление проектами и их выполнением</p>
          </div>
        </div>
        <Button className="cyber-glow">
          <Plus className="h-4 w-4 mr-2" />
          Новый проект
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-4 w-4" />
              Поиск
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Поиск проектов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Статус
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все проекты</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
                <SelectItem value="planning">Планирование</SelectItem>
                <SelectItem value="on-hold">Приостановленные</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Всего проектов:</span>
              <span className="font-mono text-primary">{projects.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Активных:</span>
              <span className="font-mono text-primary">{projects.filter(p => p.status === 'active').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Завершенных:</span>
              <span className="font-mono text-green-600">{projects.filter(p => p.status === 'completed').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const statusInfo = getStatusInfo(project.status);
          const StatusIcon = statusInfo.icon;
          const daysLeft = getDaysLeft(project.endDate);
          const budgetUsedPercent = (project.spent / project.budget) * 100;

          return (
            <Card key={project.id} className="hover:border-primary/50 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl group-hover:cyber-text transition-colors">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(project.priority)}>
                    {project.priority === 'high' ? 'Высокий' : project.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Прогресс</span>
                    <span className="text-sm font-mono text-primary">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{project.tasksCompleted} из {project.tasksTotal} задач</span>
                    <span>{project.tasksTotal - project.tasksCompleted} осталось</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Срок:</span>
                    </div>
                    <div className="pl-5">
                      <div className="font-mono text-xs">
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                      <div className={`text-xs ${daysLeft < 7 ? 'text-destructive' : daysLeft < 30 ? 'text-amber-600' : 'text-green-600'}`}>
                        {daysLeft > 0 ? `${daysLeft} дн. осталось` : `${Math.abs(daysLeft)} дн. просрочки`}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Команда:</span>
                    </div>
                    <div className="pl-5">
                      <div className="font-mono text-xs">{project.teamSize} человек</div>
                      <div className="text-xs text-muted-foreground">{project.manager}</div>
                    </div>
                  </div>
                </div>

                {/* Budget */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Бюджет</span>
                    <span className="text-sm font-mono">{budgetUsedPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mb-1">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        budgetUsedPercent > 90 ? 'bg-destructive' : 
                        budgetUsedPercent > 75 ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Потрачено: {formatCurrency(project.spent)}
                    </span>
                    <span className="text-muted-foreground">
                      Всего: {formatCurrency(project.budget)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? `Проекты не найдены по заданным критериям`
                : 'Нет проектов для отображения'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Projects;