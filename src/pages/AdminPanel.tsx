import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { supabase } from '@/integrations/supabase/client';
import AppNavigation from '@/components/AppNavigation';
import {
  Shield,
  Database,
  Users,
  BarChart3,
  Terminal,
  Download,
  RefreshCw,
  Activity,
  Settings,
  Code,
  Play,
  Lock,
  Server,
  MonitorSpeaker,
  Eye,
  ArrowLeft,
  Home
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TerminalInterface from '@/components/TerminalInterface';
import TeamManagement from '@/components/TeamManagement';

const AdminPanel = () => {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assigned_to: '',
    estimated_hours: ''
  });
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getCurrentUser();
  }, []);

  const adminApiCall = async (action: string, method = 'GET', body?: any) => {
    try {
      const response = await fetch(`https://zqnjgwrvvrqaenzmlvfx.supabase.co/functions/v1/admin-api?action=${action}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxbmpnd3J2dnJxYWVuem1sdmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDYwNDcsImV4cCI6MjA2OTgyMjA0N30.uv41CLbWP5ZMnQLymCIE9uB9m4wC9xyKNSOU3btqcR8`
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      toast({
        title: 'API Error',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const authenticate = async () => {
    if (!adminKey.trim()) {
      toast({
        title: t.error,
        description: t.enterAdminKey,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await adminApiCall('system_status');
      setIsAuthenticated(true);
      loadDashboard();
      toast({
        title: t.success,
        description: t.loginToAdmin,
      });
    } catch (error) {
      toast({
        title: 'Ошибка аутентификации',
        description: 'Неверный admin ключ',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statusRes, tasksRes, analyticsRes, profilesRes] = await Promise.all([
        adminApiCall('system_status'),
        adminApiCall('tasks_management'),
        adminApiCall('analytics'),
        supabase.from('profiles').select('*').eq('is_active', true)
      ]);

      setSystemStatus(statusRes);
      setTasks(tasksRes.tasks || []);
      setAnalytics(analyticsRes.analytics);
      setProfiles(profilesRes.data || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return;

    setLoading(true);
    try {
      const result = await adminApiCall('database_query', 'POST', {
        query: sqlQuery
      });
      setQueryResult(result);
      toast({
        title: t.requestCompleted,
        description: `${t.recordsReceived} ${result.result?.length || 0} ${t.recordsReceived}`,
      });
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async () => {
    setLoading(true);
    try {
      const backup = await adminApiCall('backup_data');
      
      // Download backup file
      const blob = new Blob([JSON.stringify(backup.backup, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tiger-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: t.backupCreated,
        description: t.fileDownloaded,
      });
    } catch (error) {
      console.error('Backup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: t.error,
        description: t.enterTaskName,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        ...newTask,
        estimated_hours: newTask.estimated_hours ? parseInt(newTask.estimated_hours) : null,
        assigned_to: newTask.assigned_to || null,
        created_by: profiles.find(p => p.user_id === currentUser?.id)?.id
      };

      await adminApiCall('tasks_management', 'POST', { task_data: taskData });
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        assigned_to: '',
        estimated_hours: ''
      });

      // Reload tasks
      loadDashboard();

      toast({
        title: t.success,
        description: t.taskCreatedViaAPI,
      });
    } catch (error) {
      console.error('Create task failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/'}
          className="absolute top-6 left-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.dashboard}
        </Button>
        
        <Card className="w-full max-w-md border-primary/30 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Tiger CRM Admin</h1>
              <p className="text-muted-foreground text-sm">
                Панель администрирования системы
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="admin-key" className="text-sm font-medium">
                Admin Key
              </label>
              <Input
                id="admin-key"
                type="password"
                placeholder={t.enterAdminKey}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && authenticate()}
                className="border-primary/30 focus:border-primary"
              />
            </div>
            <Button 
              onClick={authenticate} 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 animate-spin" />
                  {t.checking}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t.loginToAdmin}
                </div>
              )}
            </Button>
            
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation 
        title="Tiger CRM Admin Panel"
        subtitle={t.systemAdministration}
      />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Admin Status Banner */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-destructive/10 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold text-primary">{t.adminModeActive}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.fullAccess}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'} 
                  size="sm"
                  className="bg-background hover:bg-muted"
                >
                  <Home className="h-4 w-4 mr-2" />
                  {t.mainMenu}
                </Button>
                <Button variant="outline" onClick={loadDashboard} disabled={loading} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.update}
                </Button>
                <Button variant="outline" onClick={downloadBackup} disabled={loading} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t.backup}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">
              <Activity className="h-4 w-4 mr-2" />
              {t.dashboard}
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <Settings className="h-4 w-4 mr-2" />
              {t.tasks}
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="h-4 w-4 mr-2" />
              {t.database}
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Команда
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="terminal">
              <Terminal className="h-4 w-4 mr-2" />
              API Терминал
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.systemHealth}</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {systemStatus?.system_status || 'Loading...'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {systemStatus?.timestamp && new Date(systemStatus.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStatus?.stats?.total_users || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.activeProfiles}: {systemStatus?.stats?.total_profiles || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalTasks}</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStatus?.stats?.total_tasks || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.allTime}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.apiStatus}</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {systemStatus?.health?.api || 'Unknown'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.database}: {systemStatus?.health?.database || 'Unknown'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.recentTasks}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task: any) => (
                      <div key={task.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.assigned_to?.full_name}
                          </p>
                        </div>
                        <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.quickActions}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    {t.optimizeDB}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    {t.userManagement}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {t.exportReports}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    {t.systemSettings}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  SQL Query Executor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">SQL Query (только SELECT)</label>
                  <Textarea
                    placeholder="SELECT * FROM profiles LIMIT 10;"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="min-h-[100px] font-mono"
                  />
                </div>
                <Button onClick={executeQuery} disabled={loading || !sqlQuery.trim()}>
                  <Play className="h-4 w-4 mr-2" />
                  Выполнить запрос
                </Button>

                {queryResult && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Результат:</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                      {JSON.stringify(queryResult, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Создать новую задачу</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Название задачи *</label>
                    <Input
                      placeholder="Введите название задачи"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Описание</label>
                    <Textarea
                      placeholder="Опишите задачу"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Приоритет</label>
                      <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Низкий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="high">Высокий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Статус</label>
                      <Select value={newTask.status} onValueChange={(value) => setNewTask({...newTask, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">В ожидании</SelectItem>
                          <SelectItem value="in_progress">В работе</SelectItem>
                          <SelectItem value="completed">Завершена</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Назначить</label>
                      <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({...newTask, assigned_to: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите исполнителя" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.full_name} ({profile.position})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Часы (оценка)</label>
                      <Input
                        type="number"
                        placeholder="Часов"
                        value={newTask.estimated_hours}
                        onChange={(e) => setNewTask({...newTask, estimated_hours: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button onClick={createTask} disabled={loading || !newTask.title.trim()} className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Создать задачу через API
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Последние созданные задачи</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {tasks.slice(0, 10).map((task: any) => (
                      <div key={task.id} className="flex justify-between items-start p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.assigned_to?.full_name || 'Не назначено'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(task.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Интерфейс управления пользователями будет добавлен в следующей версии.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <TeamManagement />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Производительность задач</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Процент завершения</p>
                        <p className="text-2xl font-bold">
                          {analytics.tasks?.completion_rate?.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Среднее время выполнения</p>
                        <p className="text-2xl font-bold">
                          {analytics.tasks?.average_time} дней
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Тренды за 30 дней</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Создано задач</p>
                        <p className="text-2xl font-bold">
                          {analytics.trends?.tasks_created_last_30_days}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Тренд завершения</p>
                        <p className="text-2xl font-bold">
                          {analytics.trends?.completion_trend}%
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="terminal" className="mt-6">
            <TerminalInterface 
              title="Admin API Terminal"
              endpoint="/functions/v1/admin-api"
              onExecute={async (command) => {
                // Handle admin commands through API
                if (command.startsWith('admin ')) {
                  const adminCmd = command.substring(6);
                  return await adminApiCall(adminCmd);
                }
                return `Command executed: ${command}`;
              }}
            />

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Внешний API доступ</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    Для внешнего доступа используйте:<br />
                    <code className="text-sm">
                      POST https://zqnjgwrvvrqaenzmlvfx.supabase.co/functions/v1/admin-api?action=ACTION
                    </code><br />
                    Header: <code>x-admin-key: {adminKey}</code>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Доступные API endpoints:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <code>system_status</code> - Статус системы</li>
                    <li>• <code>users_stats</code> - Статистика пользователей</li>
                    <li>• <code>tasks_management</code> - Управление задачами</li>
                    <li>• <code>database_query</code> - Выполнение запросов к БД</li>
                    <li>• <code>backup_data</code> - Создание бэкапа</li>
                    <li>• <code>analytics</code> - Аналитика</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;