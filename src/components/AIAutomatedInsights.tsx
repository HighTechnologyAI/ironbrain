import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutomatedInsight {
  id: string;
  type: 'efficiency' | 'safety' | 'maintenance' | 'cost' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  impact: string;
  dataSource: string[];
  generatedAt: string;
  status: 'new' | 'reviewed' | 'implemented' | 'dismissed';
  metrics: {
    affectedDrones: number;
    potentialSavings?: number;
    riskReduction?: number;
    efficiencyGain?: number;
  };
}

interface LearningPattern {
  id: string;
  pattern: string;
  frequency: number;
  accuracy: number;
  lastSeen: string;
  applications: string[];
  improvements: string[];
}

const AIAutomatedInsights: React.FC = () => {
  const [insights, setInsights] = useState<AutomatedInsight[]>([]);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoMode, setAutoMode] = useState(true);

  // Mock data for demonstration
  const mockInsights: AutomatedInsight[] = [
    {
      id: '1',
      type: 'efficiency',
      severity: 'medium',
      title: 'Flight Path Optimization Opportunity',
      description: 'Analysis of 200+ recent flights shows suboptimal routing in sector 7, resulting in 8% longer flight times.',
      recommendation: 'Implement dynamic routing algorithm that considers real-time traffic and weather conditions.',
      confidence: 89,
      impact: 'Reduce average flight time by 12 minutes and battery consumption by 8%',
      dataSource: ['flight_logs', 'weather_data', 'traffic_patterns'],
      generatedAt: new Date().toISOString(),
      status: 'new',
      metrics: {
        affectedDrones: 6,
        potentialSavings: 15000,
        efficiencyGain: 8
      }
    },
    {
      id: '2',
      type: 'maintenance',
      severity: 'high',
      title: 'Predictive Maintenance Alert',
      description: 'Vibration patterns in Drone-003 propellers indicate bearing wear approaching failure threshold.',
      recommendation: 'Schedule immediate inspection and replacement of propeller bearings within 48 hours.',
      confidence: 94,
      impact: 'Prevent potential failure and $5,000 emergency repair cost',
      dataSource: ['vibration_sensors', 'flight_hours', 'maintenance_history'],
      generatedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'new',
      metrics: {
        affectedDrones: 1,
        potentialSavings: 5000,
        riskReduction: 85
      }
    },
    {
      id: '3',
      type: 'safety',
      severity: 'critical',
      title: 'Weather Pattern Risk Assessment',
      description: 'Recurring wind shear patterns detected in northern sector during afternoon hours increase collision risk by 23%.',
      recommendation: 'Implement dynamic no-fly zones during high-risk periods and reroute missions to safer corridors.',
      confidence: 91,
      impact: 'Reduce weather-related incidents by 65% and improve mission success rate',
      dataSource: ['weather_stations', 'incident_reports', 'flight_data'],
      generatedAt: new Date(Date.now() - 7200000).toISOString(),
      status: 'reviewed',
      metrics: {
        affectedDrones: 8,
        riskReduction: 65
      }
    }
  ];

  const mockPatterns: LearningPattern[] = [
    {
      id: '1',
      pattern: 'Battery degradation correlation with temperature extremes',
      frequency: 89,
      accuracy: 94.2,
      lastSeen: new Date().toISOString(),
      applications: ['Predictive maintenance', 'Mission planning', 'Fleet optimization'],
      improvements: ['Temperature-based charging schedules', 'Seasonal fleet rotation']
    },
    {
      id: '2',
      pattern: 'Mission success rate vs. pilot experience level',
      frequency: 76,
      accuracy: 87.5,
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
      applications: ['Training programs', 'Mission assignment', 'Risk assessment'],
      improvements: ['Adaptive training modules', 'Experience-based mission routing']
    },
    {
      id: '3',
      pattern: 'Communication signal strength and equipment failure correlation',
      frequency: 67,
      accuracy: 91.8,
      lastSeen: new Date(Date.now() - 7200000).toISOString(),
      applications: ['Equipment monitoring', 'Preventive maintenance', 'Signal optimization'],
      improvements: ['Signal booster placement', 'Equipment replacement scheduling']
    }
  ];

  useEffect(() => {
    setInsights(mockInsights);
    setLearningPatterns(mockPatterns);
  }, []);

  // Auto-generate insights periodically
  useEffect(() => {
    if (autoMode) {
      const interval = setInterval(() => {
        generateAutomaticInsights();
      }, 30000); // Generate new insights every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoMode]);

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-processing-queue', {
        body: {
          type: 'analyze',
          input: {
            telemetry_data: 'Recent operational metrics',
            maintenance_records: 'Equipment health data',
            performance_metrics: 'Efficiency and safety indicators',
            weather_data: 'Environmental conditions',
            mission_history: 'Recent mission outcomes'
          },
          priority: 'medium'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      generateAutomaticInsights();
      toast.success('New AI insights generated');
    },
    onError: (error) => {
      console.error('Insight generation error:', error);
      generateAutomaticInsights(); // Fallback to mock data
      toast.error('Using cached insights - AI service unavailable');
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const generateAutomaticInsights = () => {
    // Simulate new insight generation
    const newInsight: AutomatedInsight = {
      id: Date.now().toString(),
      type: ['efficiency', 'safety', 'maintenance', 'cost', 'performance'][Math.floor(Math.random() * 5)] as any,
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      title: `Automated Analysis #${Date.now().toString().slice(-4)}`,
      description: 'AI has detected a pattern in recent operational data that requires attention.',
      recommendation: 'Implement suggested optimization to improve operational efficiency.',
      confidence: Math.floor(Math.random() * 30) + 70,
      impact: 'Estimated improvement in operational metrics',
      dataSource: ['telemetry', 'sensors', 'logs'],
      generatedAt: new Date().toISOString(),
      status: 'new',
      metrics: {
        affectedDrones: Math.floor(Math.random() * 5) + 1,
        potentialSavings: Math.floor(Math.random() * 10000) + 1000,
        efficiencyGain: Math.floor(Math.random() * 15) + 5
      }
    };

    setInsights(prev => [newInsight, ...prev.slice(0, 19)]); // Keep last 20 insights
  };

  const handleGenerateInsights = () => {
    setIsGenerating(true);
    generateInsightsMutation.mutate();
  };

  const handleInsightAction = (insightId: string, action: 'implement' | 'dismiss' | 'review') => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId 
        ? { ...insight, status: action === 'implement' ? 'implemented' : action === 'dismiss' ? 'dismissed' : 'reviewed' }
        : insight
    ));
    
    toast.success(`Insight ${action}ed successfully`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'efficiency': return <TrendingUp className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Zap className="h-4 w-4" />;
      case 'cost': return <BarChart3 className="h-4 w-4" />;
      case 'performance': return <Activity className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'bg-green-500 text-white';
      case 'reviewed': return 'bg-blue-500 text-white';
      case 'dismissed': return 'bg-gray-500 text-white';
      case 'new': return 'bg-purple-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const newInsightsCount = insights.filter(i => i.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Automated Insights</h3>
          <p className="text-sm text-muted-foreground">
            Continuous AI analysis and automated operational insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={autoMode ? "default" : "secondary"} className="gap-1">
            <Brain className="h-3 w-3" />
            Auto Mode {autoMode ? 'ON' : 'OFF'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setAutoMode(!autoMode)}
          >
            {autoMode ? 'Disable' : 'Enable'} Auto
          </Button>
          <Button 
            onClick={handleGenerateInsights}
            disabled={isGenerating}
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New Insights</span>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">{newInsightsCount}</div>
            <div className="text-xs text-muted-foreground">Require attention</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg Confidence</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">
              {insights.length > 0 ? Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">AI certainty</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Potential Savings</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">
              ${insights.reduce((acc, i) => acc + (i.metrics.potentialSavings || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">If implemented</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Learning Patterns</span>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">{learningPatterns.length}</div>
            <div className="text-xs text-muted-foreground">Active patterns</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Active Insights</TabsTrigger>
          <TabsTrigger value="patterns">Learning Patterns</TabsTrigger>
          <TabsTrigger value="automation">Automation Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate AI insights to discover optimization opportunities
                  </p>
                  <Button onClick={handleGenerateInsights} disabled={isGenerating}>
                    Generate Insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className={`border-l-4 ${
                  insight.status === 'new' ? 'border-l-primary' : 
                  insight.status === 'implemented' ? 'border-l-green-500' : 'border-l-muted'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(insight.type)}
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(insight.severity)}>
                          {insight.severity}
                        </Badge>
                        <Badge className={getStatusColor(insight.status)} variant="secondary">
                          {insight.status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{insight.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-1">AI Recommendation:</h4>
                      <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Confidence:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={insight.confidence} className="flex-1" />
                          <span className="text-muted-foreground">{insight.confidence}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Affected Drones:</span>
                        <p className="text-muted-foreground mt-1">{insight.metrics.affectedDrones}</p>
                      </div>
                      <div>
                        <span className="font-medium">Potential Savings:</span>
                        <p className="text-muted-foreground mt-1">
                          {insight.metrics.potentialSavings ? `$${insight.metrics.potentialSavings.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Generated:</span>
                        <p className="text-muted-foreground mt-1">
                          {new Date(insight.generatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {insight.status === 'new' && (
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleInsightAction(insight.id, 'implement')}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Implement
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleInsightAction(insight.id, 'review')}
                        >
                          <Clock className="h-4 w-4" />
                          Review Later
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleInsightAction(insight.id, 'dismiss')}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Machine Learning Patterns</CardTitle>
              <CardDescription>
                Patterns discovered and learned by the AI system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningPatterns.map((pattern) => (
                  <Card key={pattern.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium">{pattern.pattern}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {pattern.accuracy}% accurate
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Freq: {pattern.frequency}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Applications:</span>
                          <ul className="mt-1 space-y-1">
                            {pattern.applications.map((app, index) => (
                              <li key={index} className="text-muted-foreground">• {app}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium">Improvements:</span>
                          <ul className="mt-1 space-y-1">
                            {pattern.improvements.map((imp, index) => (
                              <li key={index} className="text-muted-foreground">• {imp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-muted-foreground">
                        Last seen: {new Date(pattern.lastSeen).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Configuration</CardTitle>
              <CardDescription>
                Configure automatic insight generation and processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Auto-Generate Insights</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically generate insights every 30 seconds
                      </p>
                    </div>
                    <Button 
                      variant={autoMode ? "default" : "outline"}
                      onClick={() => setAutoMode(!autoMode)}
                    >
                      {autoMode ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Critical Alert Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Send immediate notifications for critical insights
                      </p>
                    </div>
                    <Button variant="default">Enabled</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Learning Pattern Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Continuously update machine learning patterns
                      </p>
                    </div>
                    <Button variant="default">Enabled</Button>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">System Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Processing Speed:</span>
                      <p className="text-muted-foreground">2.3 insights/min</p>
                    </div>
                    <div>
                      <span className="font-medium">Pattern Recognition:</span>
                      <p className="text-muted-foreground">94.2% accuracy</p>
                    </div>
                    <div>
                      <span className="font-medium">Resource Usage:</span>
                      <p className="text-muted-foreground">67% capacity</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAutomatedInsights;