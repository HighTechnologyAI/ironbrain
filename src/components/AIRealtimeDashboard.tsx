import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Brain,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  source: 'ai' | 'system' | 'drone' | 'user';
  acknowledged: boolean;
}

interface RealtimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  lastUpdate: string;
}

const AIRealtimeDashboard: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [metrics, setMetrics] = useState<RealtimeMetric[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  // Mock real-time data
  useEffect(() => {
    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Battery Drain Detected',
        message: 'Drone UAV-003 showing 15% higher than normal battery consumption',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        source: 'ai',
        acknowledged: false
      },
      {
        id: '2',
        type: 'info',
        title: 'AI Model Updated',
        message: 'Predictive maintenance model updated with new training data',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        source: 'ai',
        acknowledged: true
      },
      {
        id: '3',
        type: 'error',
        title: 'Communication Lost',
        message: 'Temporary communication loss with Patrol Beta - reconnected',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        source: 'drone',
        acknowledged: true
      },
      {
        id: '4',
        type: 'success',
        title: 'Mission Completed',
        message: 'Surveillance mission #1247 completed successfully with 98% accuracy',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        source: 'system',
        acknowledged: false
      }
    ];

    const mockMetrics: RealtimeMetric[] = [
      {
        id: 'cpu',
        name: 'AI Processing Load',
        value: 67,
        unit: '%',
        trend: 'up',
        threshold: 80,
        status: 'normal',
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'memory',
        name: 'Memory Usage',
        value: 45,
        unit: '%',
        trend: 'stable',
        threshold: 70,
        status: 'normal',
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'requests',
        name: 'AI Requests/min',
        value: 23,
        unit: 'req/min',
        trend: 'up',
        threshold: 100,
        status: 'normal',
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'accuracy',
        name: 'Model Accuracy',
        value: 94.2,
        unit: '%',
        trend: 'stable',
        threshold: 90,
        status: 'normal',
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'latency',
        name: 'Response Time',
        value: 1.8,
        unit: 'sec',
        trend: 'down',
        threshold: 3.0,
        status: 'normal',
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'errors',
        name: 'Error Rate',
        value: 2.1,
        unit: '%',
        trend: 'up',
        threshold: 5.0,
        status: 'warning',
        lastUpdate: new Date().toISOString()
      }
    ];

    setAlerts(mockAlerts);
    setMetrics(mockMetrics);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastUpdate(new Date().toISOString());
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 5,
        lastUpdate: new Date().toISOString()
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      case 'normal': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      case 'stable': return <Activity className="h-3 w-3 text-muted-foreground" />;
      default: return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Realtime Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Live monitoring of AI systems and operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{metric.name}</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <Badge className={getStatusColor(metric.status)} variant="secondary">
                    {metric.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold">{metric.value.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">{metric.unit}</span>
                </div>
                <Progress 
                  value={Math.min((metric.value / metric.threshold) * 100, 100)} 
                  className="h-1" 
                />
                <span className="text-xs text-muted-foreground">
                  Threshold: {metric.threshold}{metric.unit}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Live Alerts
            </CardTitle>
            <CardDescription>
              Real-time system alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={alert.id}>
                    <div className={`p-3 rounded-lg border ${
                      alert.acknowledged ? 'bg-muted/50' : 'bg-background'
                    }`}>
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{alert.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {alert.source}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(alert.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {alert.message}
                          </p>
                          {!alert.acknowledged && (
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < alerts.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Processing Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Processing Queue
            </CardTitle>
            <CardDescription>
              Current AI analysis tasks and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {[
                  { id: 1, task: 'Telemetry Analysis', progress: 85, status: 'processing' },
                  { id: 2, task: 'Mission Optimization', progress: 45, status: 'processing' },
                  { id: 3, task: 'Predictive Maintenance', progress: 100, status: 'completed' },
                  { id: 4, task: 'Visual Generation', progress: 20, status: 'queued' },
                  { id: 5, task: 'Report Generation', progress: 0, status: 'queued' }
                ].map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.task}</span>
                      <Badge variant={
                        item.status === 'completed' ? 'default' : 
                        item.status === 'processing' ? 'secondary' : 'outline'
                      }>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={item.progress} className="flex-1" />
                      <span className="text-xs text-muted-foreground">
                        {item.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* System Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>
            Overall system performance and health indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500 mb-2">99.8%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500 mb-2">847</div>
              <div className="text-sm text-muted-foreground">Tasks Today</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-500 mb-2">2.3s</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-500 mb-2">94.2%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIRealtimeDashboard;