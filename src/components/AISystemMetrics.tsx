import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

const AISystemMetrics: React.FC = () => {
  // Mock data for AI system metrics
  const metrics: AIMetric[] = [
    {
      id: 'response_time',
      name: 'Average Response Time',
      value: 2.3,
      unit: 'seconds',
      status: 'healthy',
      trend: 'down',
      description: 'Time taken for AI to process and respond to queries'
    },
    {
      id: 'accuracy',
      name: 'Prediction Accuracy',
      value: 94.2,
      unit: '%',
      status: 'healthy',
      trend: 'up',
      description: 'Accuracy of AI predictions compared to actual outcomes'
    },
    {
      id: 'api_calls',
      name: 'API Calls Today',
      value: 847,
      unit: 'calls',
      status: 'healthy',
      trend: 'up',
      description: 'Number of AI API calls made in the last 24 hours'
    },
    {
      id: 'token_usage',
      name: 'Token Usage',
      value: 75,
      unit: '%',
      status: 'warning',
      trend: 'up',
      description: 'Percentage of monthly token quota used'
    },
    {
      id: 'error_rate',
      name: 'Error Rate',
      value: 1.2,
      unit: '%',
      status: 'healthy',
      trend: 'stable',
      description: 'Percentage of failed AI requests in the last hour'
    },
    {
      id: 'model_health',
      name: 'Model Health Score',
      value: 98.5,
      unit: '/100',
      status: 'healthy',
      trend: 'stable',
      description: 'Overall health score of deployed AI models'
    }
  ];

  const providerStatus = [
    { name: 'OpenAI', status: 'operational', latency: '45ms', uptime: '99.9%' },
    { name: 'Anthropic', status: 'operational', latency: '52ms', uptime: '99.8%' },
    { name: 'Perplexity', status: 'degraded', latency: '120ms', uptime: '98.2%' }
  ];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'outage':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">AI System Metrics</h3>
        <p className="text-sm text-muted-foreground">
          Real-time monitoring of AI system performance and health
        </p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <Badge className={getStatusColor(metric.status)} variant="secondary">
                    {metric.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
                {metric.id === 'token_usage' && (
                  <Progress value={metric.value} className="h-2" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Provider Status
          </CardTitle>
          <CardDescription>
            Real-time status of connected AI service providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providerStatus.map((provider) => (
              <div key={provider.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(provider.status)}
                  <div>
                    <h4 className="font-medium">{provider.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{provider.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{provider.latency}</div>
                    <div className="text-muted-foreground">Latency</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{provider.uptime}</div>
                    <div className="text-muted-foreground">Uptime</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Trends
          </CardTitle>
          <CardDescription>
            AI system performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4" />
              <p>Performance charts and trends will be displayed here</p>
              <p className="text-sm">Connect to analytics service to view detailed metrics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISystemMetrics;