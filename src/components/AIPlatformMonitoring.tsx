import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Cpu, 
  Database, 
  Network, 
  Server, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  Brain,
  HardDrive,
  Wifi,
  Globe
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
  threshold: number;
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: number;
  responseTime: number;
  lastUpdate: string;
}

interface ResourceUsage {
  type: 'cpu' | 'memory' | 'storage' | 'network';
  current: number;
  max: number;
  unit: string;
  trend: number;
}

const AIPlatformMonitoring: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  // Mock real-time data
  useEffect(() => {
    const updateMetrics = () => {
      const mockMetrics: SystemMetric[] = [
        {
          id: 'ai_requests',
          name: 'AI Requests/min',
          value: Math.floor(Math.random() * 50) + 20,
          unit: 'req/min',
          status: 'healthy',
          trend: 'up',
          description: 'Total AI processing requests per minute',
          threshold: 100
        },
        {
          id: 'response_time',
          name: 'Avg Response Time',
          value: Math.random() * 2 + 1,
          unit: 'seconds',
          status: 'healthy',
          trend: 'stable',
          description: 'Average response time for AI requests',
          threshold: 5
        },
        {
          id: 'model_accuracy',
          name: 'Model Accuracy',
          value: 92 + Math.random() * 6,
          unit: '%',
          status: 'healthy',
          trend: 'up',
          description: 'Overall AI model prediction accuracy',
          threshold: 85
        },
        {
          id: 'error_rate',
          name: 'Error Rate',
          value: Math.random() * 3,
          unit: '%',
          status: Math.random() > 0.8 ? 'warning' : 'healthy',
          trend: 'down',
          description: 'Percentage of failed AI requests',
          threshold: 5
        },
        {
          id: 'queue_size',
          name: 'Processing Queue',
          value: Math.floor(Math.random() * 20),
          unit: 'tasks',
          status: 'healthy',
          trend: 'stable',
          description: 'Number of tasks in processing queue',
          threshold: 50
        },
        {
          id: 'bandwidth',
          name: 'Network Bandwidth',
          value: Math.random() * 80 + 20,
          unit: 'Mbps',
          status: 'healthy',
          trend: 'up',
          description: 'Current network bandwidth usage',
          threshold: 1000
        }
      ];

      const mockServices: ServiceStatus[] = [
        {
          name: 'OpenAI API',
          status: Math.random() > 0.95 ? 'degraded' : 'operational',
          uptime: 99.9,
          responseTime: 45 + Math.random() * 20,
          lastUpdate: new Date().toISOString()
        },
        {
          name: 'Anthropic API',
          status: 'operational',
          uptime: 99.8,
          responseTime: 52 + Math.random() * 15,
          lastUpdate: new Date().toISOString()
        },
        {
          name: 'Perplexity API',
          status: Math.random() > 0.9 ? 'degraded' : 'operational',
          uptime: 98.2,
          responseTime: 120 + Math.random() * 30,
          lastUpdate: new Date().toISOString()
        },
        {
          name: 'ElevenLabs API',
          status: 'operational',
          uptime: 99.5,
          responseTime: 80 + Math.random() * 25,
          lastUpdate: new Date().toISOString()
        },
        {
          name: 'Supabase DB',
          status: 'operational',
          uptime: 99.99,
          responseTime: 15 + Math.random() * 10,
          lastUpdate: new Date().toISOString()
        },
        {
          name: 'Edge Functions',
          status: 'operational',
          uptime: 99.7,
          responseTime: 25 + Math.random() * 15,
          lastUpdate: new Date().toISOString()
        }
      ];

      const mockResources: ResourceUsage[] = [
        {
          type: 'cpu',
          current: Math.random() * 80 + 10,
          max: 100,
          unit: '%',
          trend: (Math.random() - 0.5) * 10
        },
        {
          type: 'memory',
          current: Math.random() * 70 + 20,
          max: 100,
          unit: '%',
          trend: (Math.random() - 0.5) * 5
        },
        {
          type: 'storage',
          current: Math.random() * 50 + 30,
          max: 100,
          unit: '%',
          trend: Math.random() * 2
        },
        {
          type: 'network',
          current: Math.random() * 60 + 20,
          max: 100,
          unit: '%',
          trend: (Math.random() - 0.5) * 15
        }
      ];

      setSystemMetrics(mockMetrics);
      setServiceStatuses(mockServices);
      setResourceUsage(mockResources);
      setLastUpdate(new Date().toISOString());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'bg-green-500 text-white';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-500 text-white';
      case 'critical':
      case 'outage':
        return 'bg-red-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      case 'stable':
        return <Activity className="h-3 w-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'cpu':
        return <Cpu className="h-4 w-4" />;
      case 'memory':
        return <HardDrive className="h-4 w-4" />;
      case 'storage':
        return <Database className="h-4 w-4" />;
      case 'network':
        return <Wifi className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('API')) return <Globe className="h-4 w-4" />;
    if (name.includes('DB')) return <Database className="h-4 w-4" />;
    if (name.includes('Functions')) return <Zap className="h-4 w-4" />;
    return <Server className="h-4 w-4" />;
  };

  const overallHealth = systemMetrics.filter(m => m.status === 'healthy').length / systemMetrics.length * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Platform Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring of AI systems and infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            Live
          </Badge>
          <span className="text-xs text-muted-foreground">
            Updated: {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            System Health Overview
          </CardTitle>
          <CardDescription>
            Overall health and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {overallHealth.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">System Health</div>
              <Progress value={overallHealth} className="mt-2" />
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {systemMetrics.find(m => m.id === 'ai_requests')?.value || 0}
              </div>
              <div className="text-sm text-muted-foreground">AI Requests/min</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {(systemMetrics.find(m => m.id === 'response_time')?.value || 0).toFixed(1)}s
              </div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-purple-500 mb-2">
                {serviceStatuses.filter(s => s.status === 'operational').length}
              </div>
              <div className="text-sm text-muted-foreground">Services Online</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI System Metrics
            </CardTitle>
            <CardDescription>
              Key performance indicators for AI operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend)}
                        <Badge className={getStatusColor(metric.status)} variant="secondary">
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">
                        {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {metric.unit}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Progress 
                          value={Math.min((metric.value / metric.threshold) * 100, 100)} 
                          className="h-2" 
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Threshold: {metric.threshold}{metric.unit}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Service Status
            </CardTitle>
            <CardDescription>
              External services and dependencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {serviceStatuses.map((service) => (
                  <div key={service.name} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getServiceIcon(service.name)}
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <Badge className={getStatusColor(service.status)} variant="secondary">
                        {service.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Uptime</div>
                        <div className="font-medium">{service.uptime}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Response</div>
                        <div className="font-medium">{service.responseTime.toFixed(0)}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Updated</div>
                        <div className="font-medium">
                          {new Date(service.lastUpdate).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Resource Usage
          </CardTitle>
          <CardDescription>
            System resource utilization and capacity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {resourceUsage.map((resource) => (
              <div key={resource.type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getResourceIcon(resource.type)}
                    <span className="font-medium capitalize">{resource.type}</span>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    resource.trend > 0 ? 'bg-red-100 text-red-600' : 
                    resource.trend < 0 ? 'bg-green-100 text-green-600' : 
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {resource.trend > 0 ? '+' : ''}{resource.trend.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{resource.current.toFixed(1)}{resource.unit}</span>
                    <span className="text-muted-foreground">{resource.max}{resource.unit}</span>
                  </div>
                  <Progress value={(resource.current / resource.max) * 100} />
                  <div className="text-xs text-muted-foreground text-center">
                    {((resource.current / resource.max) * 100).toFixed(1)}% utilized
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Alerts
          </CardTitle>
          <CardDescription>
            Recent alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                type: 'info',
                message: 'AI model performance optimized - 5% improvement in accuracy',
                timestamp: new Date(Date.now() - 300000).toISOString()
              },
              {
                type: 'warning',
                message: 'Perplexity API response time above normal - monitoring',
                timestamp: new Date(Date.now() - 600000).toISOString()
              },
              {
                type: 'success',
                message: 'Daily backup completed successfully',
                timestamp: new Date(Date.now() - 900000).toISOString()
              }
            ].map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'success' ? 'bg-green-500' :
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  alert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPlatformMonitoring;