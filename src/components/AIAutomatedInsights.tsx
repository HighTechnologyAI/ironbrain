import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  BarChart3,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'performance' | 'security' | 'optimization' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  automatable: boolean;
  createdAt: string;
}

const AIAutomatedInsights: React.FC = () => {
  // Mock insights data
  const insights: AIInsight[] = [
    {
      id: '1',
      type: 'performance',
      title: 'UAV Battery Efficiency Decline',
      description: 'Detected 15% decrease in battery efficiency across Fleet Alpha over the past week',
      confidence: 92,
      impact: 'high',
      recommendation: 'Schedule preventive maintenance for affected drones and review charging protocols',
      automatable: true,
      createdAt: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Flight Path Optimization Opportunity',
      description: 'AI identified 12% potential fuel savings through route optimization in Sector 7',
      confidence: 87,
      impact: 'medium',
      recommendation: 'Implement suggested flight path changes for routes R7-001 through R7-008',
      automatable: true,
      createdAt: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: '3',
      type: 'security',
      title: 'Unusual Communication Pattern',
      description: 'Anomalous data transmission detected from UAV-15 at 14:32 UTC',
      confidence: 78,
      impact: 'critical',
      recommendation: 'Investigate communication logs and perform security scan on affected unit',
      automatable: false,
      createdAt: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: '4',
      type: 'prediction',
      title: 'Weather Impact Forecast',
      description: 'Storm system will affect operations in 6-8 hours, 65% chance of mission delays',
      confidence: 89,
      impact: 'medium',
      recommendation: 'Preposition backup equipment and notify affected mission teams',
      automatable: true,
      createdAt: new Date(Date.now() - 1200000).toISOString()
    }
  ];

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'performance': return 'bg-blue-500 text-white';
      case 'security': return 'bg-red-500 text-white';
      case 'optimization': return 'bg-green-500 text-white';
      case 'prediction': return 'bg-purple-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance': return <BarChart3 className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'prediction': return <Brain className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
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
          <h3 className="text-lg font-semibold">AI Automated Insights</h3>
          <p className="text-sm text-muted-foreground">
            Continuous AI analysis and automated operational intelligence
          </p>
        </div>
        <Button className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Generate New Insights
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500 mb-2">94.2%</div>
            <div className="text-sm text-muted-foreground">AI Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500 mb-2">47</div>
            <div className="text-sm text-muted-foreground">Insights Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500 mb-2">23</div>
            <div className="text-sm text-muted-foreground">Auto Actions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500 mb-2">91.5%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Live AI Insights
          </CardTitle>
          <CardDescription>
            Real-time AI analysis and actionable recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <h4 className="font-medium">{insight.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getInsightTypeColor(insight.type)} variant="secondary">
                          {insight.type}
                        </Badge>
                        <Badge className={getImpactColor(insight.impact)} variant="secondary">
                          {insight.impact}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium">Confidence:</span>
                        <span className="ml-2">{insight.confidence}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Generated:</span>
                        <span className="ml-2">{formatTime(insight.createdAt)}</span>
                      </div>
                      {insight.automatable && (
                        <Badge variant="outline" className="gap-1">
                          <Zap className="h-3 w-3" />
                          Automatable
                        </Badge>
                      )}
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg mb-3">
                      <span className="font-medium text-sm">Recommendation:</span>
                      <p className="text-sm text-muted-foreground mt-1">{insight.recommendation}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="default" size="sm" className="gap-2">
                        <CheckCircle className="h-3 w-3" />
                        Implement
                      </Button>
                      {insight.automatable && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Zap className="h-3 w-3" />
                          Automate
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Automation Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Active Automations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">Battery Alert System</p>
                  <p className="text-xs text-muted-foreground">Auto-trigger when &lt; 15%</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">Weather Hold Protocol</p>
                  <p className="text-xs text-muted-foreground">Ground flights in storms</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">Maintenance Scheduler</p>
                  <p className="text-xs text-muted-foreground">Schedule based on hours</p>
                </div>
                <Badge variant="secondary">Paused</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Prediction Accuracy</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">+5.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                  <span className="text-sm font-medium">-0.8s</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Automation Success</span>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Stable</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAutomatedInsights;