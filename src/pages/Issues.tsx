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
import { useLanguage } from '@/hooks/use-language';

import AppNavigation from "@/components/AppNavigation";
import { supabase } from "@/integrations/supabase/client";

const Issues = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const loadIssues = async () => {
    setLoading(true);
    try {
      const { data: dbIssues, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const createdIds = Array.from(new Set((dbIssues || []).map(i => i.reported_by).filter(Boolean)));
      const assignedIds = Array.from(new Set((dbIssues || []).map(i => i.assigned_to).filter(Boolean)));
      const profileIds = Array.from(new Set([...(createdIds as string[]), ...(assignedIds as string[])]));

      const profilesMap = new Map<string, string>();
      if (profileIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', profileIds);
        profiles?.forEach((p: any) => profilesMap.set(p.id, p.full_name));
      }

      const taskIds = Array.from(new Set((dbIssues || []).map(i => i.task_id).filter(Boolean)));
      const tasksMap = new Map<string, { title: string; description: string }>();
      if (taskIds.length) {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, description')
          .in('id', taskIds);
        tasks?.forEach((t: any) => tasksMap.set(t.id, { title: t.title, description: t.description || '' }));
      }

      const hydrated = (dbIssues || []).map((i: any) => ({
        ...i,
        createdByName: i.reported_by ? (profilesMap.get(i.reported_by) || '—') : '—',
        assignedToName: i.assigned_to ? (profilesMap.get(i.assigned_to) || '—') : '—',
        taskTitle: i.task_id ? tasksMap.get(i.task_id)?.title : undefined,
        taskDescription: i.task_id ? tasksMap.get(i.task_id)?.description : undefined,
      }));

      setIssues(hydrated);
    } catch (e) {
      console.error('Failed to load issues', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const refreshIssues = () => {
    loadIssues();
  };
  const getSeverityInfo = (severity: string) => {
    switch (severity) {
      case 'low':
        return { label: 'Низкий', variant: 'secondary' as const, color: 'text-green-600' };
      case 'medium':
        return { label: 'Средний', variant: 'default' as const, color: 'text-amber-600' };
      case 'high':
        return { label: 'Высокий', variant: 'destructive' as const, color: 'text-orange-600' };
      case 'critical':
        return { label: 'Критический', variant: 'destructive' as const, color: 'text-red-600' };
      default:
        return { label: 'Средний', variant: 'default' as const, color: 'text-amber-600' };
    }
  };

  const getStatusInfo = (status: string) => {
    const normalized = (status || '').replace('_', '-');
    switch (normalized) {
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
    const haystack = `${issue.title || ''} ${issue.description || ''} ${issue.taskTitle || ''} ${issue.taskDescription || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const statusNorm = (issue.status || '').replace('_', '-');
    const matchesStatus = statusFilter === 'all' || statusNorm === statusFilter;
    const matchesPriority = priorityFilter === 'all' || (issue.severity || 'medium') === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <>
      <AppNavigation title={t.issuesTitle} subtitle={t.issueTrackingDesc} />
      <div className="min-h-screen bg-background p-6">
        {/* Action Button */}
        <div className="flex justify-end mb-6">
          <Button 
            variant="mission"
            size="lg"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.createIssueLabel}
          </Button>
        </div>

        {/* Enhanced Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 cyber-text">
                <Search className="h-4 w-4" />
                {t.search}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder={t.searchIssuesPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background/50 border-primary/20 focus:border-primary/60"
              />
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 cyber-text">
                <Filter className="h-4 w-4" />
                {t.statusLabel}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary/60">
                  <SelectValue placeholder={t.statusLabel} />
                </SelectTrigger>
                <SelectContent className="glass-effect">
                  <SelectItem value="all">{t.allStatusesLabel}</SelectItem>
                  <SelectItem value="open">{t.openStatus}</SelectItem>
                  <SelectItem value="in-progress">{t.inProgressStatus}</SelectItem>
                  <SelectItem value="resolved">{t.resolvedStatus}</SelectItem>
                  <SelectItem value="closed">{t.closedStatus}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 cyber-text">
                <AlertTriangle className="h-4 w-4" />
                Приоритет
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary/60">
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent className="glass-effect">
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

        <div className="space-y-6">
          {filteredIssues.map((issue, index) => {
            const severityInfo = getSeverityInfo(issue.severity || 'medium');
            const statusInfo = getStatusInfo(issue.status);
            const StatusIcon = statusInfo.icon;
            const createdDate = new Date(issue.created_at);

            return (
              <Card 
                key={issue.id} 
                className="cyber-border group hover:scale-[1.01] cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant={statusInfo.variant} className="flex items-center gap-1 px-3 py-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                        <Badge variant={severityInfo.variant} className="px-3 py-1">
                          {severityInfo.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:cyber-text transition-all duration-300 mb-2">
                        {issue.title}
                      </CardTitle>
                      {issue.taskTitle && (
                        <CardDescription className="mt-2 p-2 bg-primary/5 rounded border-l-2 border-primary/30">
                          <span className="font-medium text-primary">Задача:</span> {issue.taskTitle}
                        </CardDescription>
                      )}
                      <CardDescription className="mt-2 leading-relaxed">
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
                      <div className="font-mono">{issue.createdByName}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Назначено:</span>
                      </div>
                      <div className="font-mono">{issue.assignedToName}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Создано:</span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-mono text-xs">{formatDate(createdDate)}</div>
                        <div className="text-xs text-muted-foreground">{getTimeSince(createdDate)}</div>
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