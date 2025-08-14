import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Brain,
  Zap,
  Server,
  Cpu,
  Database,
  Wifi,
  Shield,
  TrendingUp,
  RefreshCw,
  Settings,
  Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatus {
  id: string;
  service: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastChecked: string;
  description: string;
  dependencies: string[];
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: number;
  trend: number; // percentage change
}

export const AISystemStatus: React.FC = () => {
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  // Query AI analysis history for system health data
  const { data: analysisHistory, refetch } = useQuery({
    queryKey: ['ai-system-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_analysis_history')
        .select('*')
        .eq('analysis_type', 'system_health')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  useEffect(() => {
    // Mock system status data
    const mockStatuses: SystemStatus[] = [
      {
        id: 'ai-core',
        service: 'AI Core Engine',
        status: 'operational',
        uptime: 99.97,
        responseTime: 234,
        lastChecked: new Date().toISOString(),
        description: 'Main AI processing engine for UAV operations',
        dependencies: ['Database', 'Message Queue', 'Redis Cache']
      },
      {
        id: 'openai-api',
        service: 'OpenAI API',
        status: 'operational',
        uptime: 99.95,
        responseTime: 456,
        lastChecked: new Date().toISOString(),
        description: 'External OpenAI API integration',
        dependencies: ['Internet Connection', 'API Gateway']
      },
      {
        id: 'perplexity-api',
        service: 'Perplexity API',
        status: 'operational',
        uptime: 99.89,
        responseTime: 312,
        lastChecked: new Date().toISOString(),
        description: 'Perplexity AI for real-time search capabilities',
        dependencies: ['Internet Connection', 'API Gateway']
      },
      {
        id: 'voice-service',
        service: 'Voice Processing',
        status: 'operational',
        uptime: 99.92,
        responseTime: 178,
        lastChecked: new Date().toISOString(),
        description: 'AI voice processing and TTS services',
        dependencies: ['ElevenLabs API', 'Audio Engine']
      },
      {
        id: 'visual-gen',
        service: 'Visual Generation',
        status: 'degraded',
        uptime: 98.45,
        responseTime: 892,
        lastChecked: new Date().toISOString(),
        description: 'AI image and visualization generation',
        dependencies: ['DALL-E API', 'Image Storage']
      },
      {
        id: 'realtime-stream',
        service: 'Real-time Streaming',
        status: 'operational',
        uptime: 99.99,
        responseTime: 45,
        lastChecked: new Date().toISOString(),
        description: 'Real-time data streaming and WebSocket connections',
        dependencies: ['Supabase Realtime', 'WebSocket Server']
      },
      {
        id: 'analytics-engine',
        service: 'Analytics Engine',
        status: 'operational',
        uptime: 99.94,
        responseTime: 267,
        lastChecked: new Date().toISOString(),
        description: 'AI analytics and predictive modeling',
        dependencies: ['Time Series DB', 'ML Models']
      },
      {
        id: 'automation-system',
        service: 'Automation System',
        status: 'operational',
        uptime: 99.88,
        responseTime: 134,
        lastChecked: new Date().toISOString(),
        description: 'Automated decision making and task execution',
        dependencies: ['Rule Engine', 'Event Bus']
      }
    ];

    const mockMetrics: PerformanceMetric[] = [
      {
        id: 'cpu',
        name: 'CPU Usage',
        value: 67.3,
        unit: '%',
        status: 'good',
        threshold: 80,
        trend: -2.4
      },
      {
        id: 'memory',
        name: 'Memory Usage',
        value: 74.8,
        unit: '%',
        status: 'warning',
        threshold: 85,
        trend: 3.1
      },
      {
        id: 'requests',
        name: 'Requests/sec',
        value: 1247,
        unit: 'req/s',
        status: 'good',
        threshold: 2000,
        trend: 15.6
      },
      {
        id: 'latency',
        name: 'Avg Latency',
        value: 267,
        unit: 'ms',
        status: 'good',
        threshold: 500,
        trend: -8.2
      },
      {
        id: 'errors',
        name: 'Error Rate',
        value: 0.23,
        unit: '%',
        status: 'good',
        threshold: 1.0,
        trend: -15.3
      },
      {
        id: 'storage',
        name: 'Storage Usage',
        value: 82.4,
        unit: '%',
        status: 'warning',
        threshold: 90,
        trend: 1.8
      }
    ];

    setSystemStatuses(mockStatuses);
    setPerformanceMetrics(mockMetrics);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastUpdate(new Date().toISOString());
      setPerformanceMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10)
      })));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500 text-white';
      case 'degraded': return 'bg-yellow-500 text-white';
      case 'outage': return 'bg-red-500 text-white';
      case 'maintenance': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      case 'critical': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'outage': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <Settings className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case 'ai-core': return <Brain className="h-4 w-4" />;
      case 'openai-api': case 'perplexity-api': return <Zap className="h-4 w-4" />;
      case 'voice-service': return <Activity className="h-4 w-4" />;
      case 'visual-gen': return <Eye className="h-4 w-4" />;
      case 'realtime-stream': return <Wifi className="h-4 w-4" />;
      case 'analytics-engine': return <TrendingUp className="h-4 w-4" />;
      case 'automation-system': return <Server className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const handleHealthCheck = async () => {
    setIsChecking(true);
    // Simulate health check
    setTimeout(() => {
      setIsChecking(false);
      setLastUpdate(new Date().toISOString());
      refetch();
    }, 2000);
  };

  const overallHealth = systemStatuses.reduce((acc, status) => {
    if (status.status === 'operational') return acc + 1;
    if (status.status === 'degraded') return acc + 0.5;
    return acc;
  }, 0) / systemStatuses.length * 100;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI System Status</h3>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring of AI services and system health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={overallHealth > 95 ? "default" : overallHealth > 85 ? "secondary" : "destructive"}>
            {overallHealth.toFixed(1)}% Healthy
          </Badge>
          <Button 
            onClick={handleHealthCheck}
            disabled={isChecking}
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Health Check'}
          </Button>
        </div>
      </div>

      {/* Overall System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Overview
          </CardTitle>
          <CardDescription>
            Overall system health and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500 mb-2">{overallHealth.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Overall Health</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500 mb-2">{systemStatuses.filter(s => s.status === 'operational').length}</div>
              <div className="text-sm text-muted-foreground">Services Online</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-500 mb-2">
                {Math.round(systemStatuses.reduce((acc, s) => acc + s.responseTime, 0) / systemStatuses.length)}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-500 mb-2">
                {Math.round(systemStatuses.reduce((acc, s) => acc + s.uptime, 0) / systemStatuses.length * 100) / 100}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services" className="gap-2">
            <Server className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Cpu className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="gap-2">
            <Database className="h-4 w-4" />
            Dependencies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {systemStatuses.map((status) => (
                <Card key={status.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getServiceIcon(status.id)}
                        <div>
                          <h4 className="font-medium">{status.service}</h4>
                          <p className="text-sm text-muted-foreground">{status.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.status)}
                        <Badge className={getStatusColor(status.status)} variant="secondary">
                          {status.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Uptime:</span>
                        <div className="mt-1">
                          <Progress value={status.uptime} className="h-2" />
                          <span className="text-xs text-muted-foreground">{status.uptime.toFixed(2)}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Response Time:</span>
                        <p className="text-muted-foreground mt-1">{status.responseTime}ms</p>
                      </div>
                      <div>
                        <span className="font-medium">Last Checked:</span>
                        <p className="text-muted-foreground mt-1">{formatTime(status.lastChecked)}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="font-medium text-sm">Dependencies:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {status.dependencies.map((dep) => (
                          <Badge key={dep} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <Badge className={getMetricStatusColor(metric.status)} variant="secondary">
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">{metric.value.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">{metric.unit}</span>
                    </div>
                    <Progress 
                      value={Math.min((metric.value / metric.threshold) * 100, 100)} 
                      className="h-2" 
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Threshold: {metric.threshold}{metric.unit}
                      </span>
                      <span className={`flex items-center gap-1 ${
                        metric.trend > 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        <TrendingUp className={`h-3 w-3 ${metric.trend < 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(metric.trend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">External Dependencies</CardTitle>
              <CardDescription>
                Status of external services and APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'OpenAI API', status: 'operational', latency: '456ms' },
                  { name: 'Perplexity API', status: 'operational', latency: '312ms' },
                  { name: 'ElevenLabs API', status: 'operational', latency: '178ms' },
                  { name: 'Supabase', status: 'operational', latency: '67ms' },
                  { name: 'Internet Connectivity', status: 'operational', latency: '23ms' }
                ].map((dep) => (
                  <div key={dep.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{dep.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{dep.latency}</span>
                      <Badge variant="default">Online</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground text-center">
        Last updated: {formatTime(lastUpdate)} • Auto-refresh every 30s
      </div>
    </div>
  );
};