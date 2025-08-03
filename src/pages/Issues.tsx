import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle,
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  User,
  Tag,
  MessageSquare,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Issues = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          reported_by:profiles!issues_reported_by_fkey(full_name),
          assigned_to:profiles!issues_assigned_to_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить проблемы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Демо данные удалены для бета версии
      id: 1,
      title: "Низкая производительность серверов",
      description: "Серверы приложения показывают высокую нагрузку CPU (>85%) в часы пик",
      status: "open",
      priority: "high",
      category: "infrastructure",
      assignee: "Александр Петров",
      reporter: "Система мониторинга",
      createdAt: "2024-01-10T10:30:00Z",
      updatedAt: "2024-01-11T15:45:00Z",
      comments: 5,
      impact: "Замедление работы приложения для всех пользователей"
    },
    {
      id: 2,
      title: "Ошибки интеграции с платежной системой",
      description: "Периодические сбои при обработке платежей через API банка",
      status: "in-progress",
      priority: "critical",
      category: "payments",
      assignee: "Мария Иванова",
      reporter: "Служба поддержки",
      createdAt: "2024-01-09T14:20:00Z",
      updatedAt: "2024-01-11T09:15:00Z",
      comments: 8,
      impact: "Потеря транзакций, недовольство клиентов"
    },
    {
      id: 3,
      title: "Уязвимость в системе аутентификации",
      description: "Обнаружена потенциальная уязвимость в механизме сброса паролей",
      status: "resolved",
      priority: "high",
      category: "security",
      assignee: "Дмитрий Сидоров",
      reporter: "Команда безопасности",
      createdAt: "2024-01-05T08:45:00Z",
      updatedAt: "2024-01-08T16:30:00Z",
      comments: 12,
      impact: "Риск несанкционированного доступа к аккаунтам"
    },
    {
      id: 4,
      title: "Медленная загрузка отчетов",
      description: "Генерация больших отчетов занимает более 2 минут",
      status: "open",
      priority: "medium",
      category: "performance",
      assignee: "Елена Козлова",
      reporter: "Отдел аналитики",
      createdAt: "2024-01-08T12:00:00Z",
      updatedAt: "2024-01-10T11:20:00Z",
      comments: 3,
      impact: "Задержки в получении аналитических данных"
    },
    {
      id: 5,
      title: "Проблемы с синхронизацией данных",
      description: "Данные между основной и резервной базой синхронизируются с задержкой",
      status: "open",
      priority: "low",
      category: "database",
      assignee: "Не назначен",
      reporter: "Администратор БД",
      createdAt: "2024-01-07T16:30:00Z",
      updatedAt: "2024-01-07T16:30:00Z",
      comments: 1,
      impact: "Потенциальная потеря данных при сбоях"
    }
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'open':
        return { label: 'Открыта', variant: 'destructive' as const, icon: AlertCircle, color: 'text-destructive' };
      case 'in-progress':
        return { label: 'В работе', variant: 'default' as const, icon: Clock, color: 'text-primary' };
      case 'resolved':
        return { label: 'Решена', variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' };
      default:
        return { label: 'Неизвестно', variant: 'secondary' as const, icon: AlertCircle, color: 'text-muted-foreground' };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { label: 'Критический', color: 'text-red-600', bg: 'bg-red-100' };
      case 'high':
        return { label: 'Высокий', color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'medium':
        return { label: 'Средний', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'low':
        return { label: 'Низкий', color: 'text-green-600', bg: 'bg-green-100' };
      default:
        return { label: 'Неопределен', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'infrastructure': return { label: 'Инфраструктура', icon: Shield };
      case 'payments': return { label: 'Платежи', icon: AlertTriangle };
      case 'security': return { label: 'Безопасность', icon: Shield };
      case 'performance': return { label: 'Производительность', icon: Clock };
      case 'database': return { label: 'База данных', icon: AlertCircle };
      default: return { label: 'Общие', icon: AlertCircle };
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} дн. назад`;
    if (diffHours > 0) return `${diffHours} ч. назад`;
    return 'Только что';
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
              <Shield className="text-destructive h-8 w-8" />
              Проблемы
            </h1>
            <p className="text-muted-foreground mt-1">Отслеживание и решение проблем системы</p>
          </div>
        </div>
        <Button 
          className="cyber-glow"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Сообщить о проблеме
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего проблем</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{issues.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Открытых</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">
              {issues.filter(i => i.status === 'open').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В работе</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {issues.filter(i => i.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Решенных</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-green-600">
              {issues.filter(i => i.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск проблем..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="open">Открытые</SelectItem>
            <SelectItem value="in-progress">В работе</SelectItem>
            <SelectItem value="resolved">Решенные</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
            <SelectItem value="critical">Критический</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          Экспорт отчета
        </Button>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => {
          const statusInfo = getStatusInfo(issue.status);
          const priorityInfo = getPriorityInfo(issue.priority);
          const categoryInfo = getCategoryInfo(issue.category);
          const StatusIcon = statusInfo.icon;
          const CategoryIcon = categoryInfo.icon;

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
                      <Badge variant="outline" className={`${priorityInfo.color} border-current`}>
                        {priorityInfo.label}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CategoryIcon className="h-3 w-3" />
                        {categoryInfo.label}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-xl group-hover:cyber-text transition-colors mb-2">
                      #{issue.id} {issue.title}
                    </CardTitle>
                    
                    <CardDescription className="text-sm mb-3">
                      {issue.description}
                    </CardDescription>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-sm text-destructive font-medium mb-1">Влияние:</div>
                      <div className="text-sm text-muted-foreground">{issue.impact}</div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Назначен:</span>
                    </div>
                    <div className="font-medium">{issue.assignee}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      <span>Создал:</span>
                    </div>
                    <div className="font-medium">{issue.reporter}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Создано:</span>
                    </div>
                    <div className="font-mono text-xs">{formatDate(issue.createdAt)}</div>
                    <div className="text-xs text-muted-foreground">{getTimeSince(issue.createdAt)}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>Комментарии:</span>
                    </div>
                    <div className="font-mono text-primary">{issue.comments}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Последнее обновление: {formatDate(issue.updatedAt)}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Комментировать
                      </Button>
                      {issue.status !== 'resolved' && (
                        <Button size="sm">
                          {issue.status === 'open' ? 'Взять в работу' : 'Решить'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredIssues.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Проблемы не найдены по заданным критериям'
                : 'Нет проблем для отображения'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Issue Form Modal (simplified for now) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Сообщить о проблеме</CardTitle>
              <CardDescription>
                Опишите проблему подробно для быстрого решения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Заголовок проблемы" />
              <Textarea placeholder="Подробное описание проблемы..." rows={4} />
              <div className="grid grid-cols-2 gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="critical">Критический</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infrastructure">Инфраструктура</SelectItem>
                    <SelectItem value="payments">Платежи</SelectItem>
                    <SelectItem value="security">Безопасность</SelectItem>
                    <SelectItem value="performance">Производительность</SelectItem>
                    <SelectItem value="database">База данных</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Отмена
                </Button>
                <Button onClick={() => setShowCreateForm(false)}>
                  Создать проблему
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Issues;