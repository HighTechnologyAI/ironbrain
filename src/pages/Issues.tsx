import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Plus,
  Bug,
  Zap,
  Shield,
  Star,
  User,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateIssueForm from "@/components/CreateIssueForm";
import AppNavigation from "@/components/AppNavigation";

const Issues = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mock data for demo purposes
  const mockIssues = [
    {
      id: 1,
      title: "Ошибка авторизации пользователей",
      description: "Пользователи не могут войти в систему после обновления",
      priority: "high",
      status: "open",
      type: "bug",
      createdBy: "Иван Петров",
      assignedTo: "Анна Сидорова",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      title: "Добавить функцию экспорта отчетов",
      description: "Необходимо добавить возможность экспорта отчетов в PDF и Excel",
      priority: "medium",
      status: "in-progress",
      type: "feature",
      createdBy: "Мария Иванова",
      assignedTo: "Петр Сидоров",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      title: "Проблема безопасности в API",
      description: "Обнаружена уязвимость в API аутентификации",
      priority: "critical",
      status: "open",
      type: "security",
      createdBy: "Алексей Козлов",
      assignedTo: "Ольга Петрова",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  ];

  useEffect(() => {
    setIssues(mockIssues);
  }, []);

  const refreshIssues = () => {
    setIssues([...mockIssues]);
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'low':
        return { label: 'Низкий', variant: 'secondary' as const, color: 'text-green-600' };
      case 'medium':
        return { label: 'Средний', variant: 'default' as const, color: 'text-amber-600' };
      case 'high':
        return { label: 'Высокий', variant: 'destructive' as const, color: 'text-orange-600' };
      case 'critical':
        return { label: 'Критический', variant: 'destructive' as const, color: 'text-red-600' };
      default:
        return { label: 'Неизвестно', variant: 'secondary' as const, color: 'text-muted-foreground' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'open':
        return { label: 'Открыта', variant: 'destructive' as const, icon: AlertTriangle };
      case 'in-progress':
        return { label: 'В работе', variant: 'default' as const, icon: Clock };
      case 'resolved':
        return { label: 'Решена', variant: 'secondary' as const, icon: CheckCircle };
      case 'closed':
        return { label: 'Закрыта', variant: 'outline' as const, icon: XCircle };
      default:
        return { label: 'Неизвестно', variant: 'secondary' as const, icon: AlertTriangle };
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'bug':
        return { label: 'Ошибка', icon: Bug, color: 'text-red-500' };
      case 'feature':
        return { label: 'Функция', icon: Star, color: 'text-blue-500' };
      case 'improvement':
        return { label: 'Улучшение', icon: Zap, color: 'text-green-500' };
      case 'security':
        return { label: 'Безопасность', icon: Shield, color: 'text-purple-500' };
      default:
        return { label: 'Другое', icon: AlertTriangle, color: 'text-muted-foreground' };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';
    return `${diffInDays} дн. назад`;
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <>
      <AppNavigation title="Проблемы" subtitle="Система отслеживания проблем и ошибок" />
      <div className="min-h-screen bg-background p-6">
        {/* Action Button */}
        <div className="flex justify-end mb-6">
          <Button 
            className="cyber-glow"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Создать проблему
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
                placeholder="Поиск проблем..."
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
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="open">Открытые</SelectItem>
                  <SelectItem value="in-progress">В работе</SelectItem>
                  <SelectItem value="resolved">Решенные</SelectItem>
                  <SelectItem value="closed">Закрытые</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Приоритет
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const priorityInfo = getPriorityInfo(issue.priority);
            const statusInfo = getStatusInfo(issue.status);
            const typeInfo = getTypeInfo(issue.type);
            const StatusIcon = statusInfo.icon;
            const TypeIcon = typeInfo.icon;

            return (
              <Card key={issue.id} className="hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                        <Badge variant={priorityInfo.variant}>
                          {priorityInfo.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TypeIcon className={`h-3 w-3 ${typeInfo.color}`} />
                          <span className="text-xs">{typeInfo.label}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl group-hover:cyber-text transition-colors">
                        {issue.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {issue.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Создал:</span>
                      </div>
                      <div className="font-mono">{issue.createdBy}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Назначено:</span>
                      </div>
                      <div className="font-mono">{issue.assignedTo}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Создано:</span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-mono text-xs">{formatDate(issue.createdAt)}</div>
                        <div className="text-xs text-muted-foreground">{getTimeSince(issue.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredIssues.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? `Проблемы не найдены по заданным критериям`
                  : 'Нет открытых проблем. Создайте первую проблему для отслеживания.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateIssueForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onIssueCreated={refreshIssues}
      />
    </>
  );
};

export default Issues;