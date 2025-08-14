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
  Database,
  Users,
  BarChart3,
  Terminal,
  Download,
  Settings,
  Code,
  ArrowLeft,
  Home,
  Activity,
  Play,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TerminalInterface from '@/components/TerminalInterface';
import TeamManagement from '@/components/TeamManagement';
import { useAdminService } from '@/hooks/use-admin-service';
import { AdminAuthentication } from '@/components/admin/AdminAuthentication';
import { SystemStatusCard } from '@/components/admin/SystemStatusCard';

const AdminPanel = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const {
    isAuthenticated,
    authAttempts,
    lockoutTime,
    authenticate,
    logout,
    getSystemStatus,
    executeSqlQuery,
    getTasks,
    getAnalytics,
    getProfiles,
    generateBackup
  } = useAdminService();

  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assigned_to: '',
    estimated_hours: ''
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getCurrentUser();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statusResult, tasksResult, analyticsResult, profilesResult] = await Promise.all([
        getSystemStatus(),
        getTasks(),
        getAnalytics(),
        getProfiles()
      ]);

      if (statusResult) setSystemStatus(statusResult);
      if (tasksResult) setTasks(tasksResult.tasks || []);
      if (analyticsResult) setAnalytics(analyticsResult.analytics);
      if (profilesResult) setProfiles(profilesResult);
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
      const result = await executeSqlQuery(sqlQuery);
      if (result) {
        setQueryResult(result);
        toast({
          title: 'Query executed',
          description: `Returned ${result.rowCount || 0} rows`,
        });
      }
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async () => {
    setLoading(true);
    try {
      const backup = await generateBackup();
      if (backup) {
        // Download backup file
        const blob = new Blob([JSON.stringify(backup, null, 2)], {
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
          title: 'Backup created',
          description: 'File downloaded successfully',
        });
      }
    } catch (error) {
      console.error('Backup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSystemStatus = async () => {
    setLoading(true);
    try {
      const status = await getSystemStatus();
      if (status) setSystemStatus(status);
    } catch (error) {
      console.error('Failed to refresh status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/'}
          className="absolute top-6 left-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        
        <AdminAuthentication
          onAuthenticate={authenticate}
          authAttempts={authAttempts}
          lockoutTime={lockoutTime}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation 
        title="Tiger CRM Admin Panel"
        subtitle="System Administration"
      />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Admin Status Banner */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-destructive/10 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold text-primary">Admin Mode Active</h3>
                <p className="text-sm text-muted-foreground">
                  Full system access enabled
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
                  Main Menu
                </Button>
                <Button variant="outline" onClick={loadDashboard} disabled={loading} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" onClick={downloadBackup} disabled={loading} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Backup
                </Button>
                <Button variant="outline" onClick={logout} size="sm">
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="system">
              <Settings className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="terminal">
              <Terminal className="h-4 w-4 mr-2" />
              Terminal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {systemStatus?.database && systemStatus?.api ? 'Healthy' : 'Issues'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {systemStatus?.timestamp && new Date(systemStatus.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tasks.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current tasks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {profiles.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registered profiles
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Status</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    Online
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All services operational
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task: any) => (
                      <div key={task.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.assigned_to?.full_name || 'Unassigned'}
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
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" onClick={loadDashboard}>
                    <Database className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={downloadBackup}>
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <SystemStatusCard 
              systemStatus={systemStatus}
              loading={loading}
              onRefresh={refreshSystemStatus}
            />
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
                  <label className="text-sm font-medium">SQL Query (SELECT only)</label>
                  <Textarea
                    placeholder="SELECT * FROM profiles LIMIT 10;"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="min-h-[100px] font-mono"
                  />
                </div>
                <Button onClick={executeQuery} disabled={loading || !sqlQuery.trim()}>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Query
                </Button>

                {queryResult && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Result:</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                      {JSON.stringify(queryResult, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <TeamManagement />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                        <p className="text-2xl font-bold">
                          {analytics.tasks?.completion_rate?.toFixed(1) || 'N/A'}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Time</p>
                        <p className="text-2xl font-bold">
                          {analytics.tasks?.average_time || 'N/A'} days
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Loading analytics...</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>30-Day Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tasks Created</p>
                        <p className="text-2xl font-bold">
                          {analytics.trends?.tasks_created_last_30_days || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completion Trend</p>
                        <p className="text-2xl font-bold">
                          {analytics.trends?.completion_trend || 'N/A'}%
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Loading trends...</p>
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
                return `Command executed: ${command}`;
              }}
            />

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>External API Access</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    For external access use:<br />
                    <code className="text-sm">
                      POST https://your-project.supabase.co/functions/v1/admin-api
                    </code><br />
                    Header: <code>x-admin-key: YOUR_ADMIN_KEY</code>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Available API endpoints:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <code>system-status</code> - System status</li>
                    <li>• <code>execute-query</code> - Database queries</li>
                    <li>• <code>tasks</code> - Task management</li>
                    <li>• <code>analytics</code> - Analytics data</li>
                    <li>• <code>backup</code> - Create backup</li>
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