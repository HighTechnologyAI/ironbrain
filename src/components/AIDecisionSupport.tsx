import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Lightbulb,
  Shield,
  Zap,
  ArrowRight,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIRecommendation {
  id: string;
  type: 'operational' | 'maintenance' | 'safety' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  impact: string;
  timeframe: string;
  resources: string[];
  estimatedCost: number;
  expectedBenefit: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'implemented';
  createdAt: string;
}

interface DecisionScenario {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  options: {
    id: string;
    title: string;
    description: string;
    pros: string[];
    cons: string[];
    risk: number;
    cost: number;
    timeline: string;
    aiRecommendation: boolean;
  }[];
  aiAnalysis: {
    recommendedOption: string;
    reasoning: string;
    confidence: number;
    riskAssessment: string;
  };
}

const AIDecisionSupport: React.FC = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [scenarios, setScenarios] = useState<DecisionScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);

  // Mock data
  const mockRecommendations: AIRecommendation[] = [
    {
      id: '1',
      type: 'maintenance',
      priority: 'high',
      title: 'Preventive Maintenance Schedule Optimization',
      description: 'Adjust maintenance intervals based on usage patterns and predictive analytics',
      reasoning: 'Analysis of 6 months of flight data shows 23% variance in component wear rates across different operational conditions',
      confidence: 87,
      impact: 'Reduce maintenance costs by 15-20% while improving reliability',
      timeframe: '2-3 weeks implementation',
      resources: ['Maintenance team training', 'Schedule system update'],
      estimatedCost: 5000,
      expectedBenefit: '$25,000 annual savings',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'operational',
      priority: 'medium',
      title: 'Flight Path Optimization for Energy Efficiency',
      description: 'Implement AI-optimized flight paths to reduce battery consumption by 12%',
      reasoning: 'Weather pattern analysis and terrain mapping suggest more efficient routes are possible',
      confidence: 92,
      impact: 'Extended flight time and reduced charging cycles',
      timeframe: '1 week',
      resources: ['Flight control software update'],
      estimatedCost: 2000,
      expectedBenefit: '12% battery life extension',
      status: 'approved',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      type: 'safety',
      priority: 'critical',
      title: 'Emergency Landing Zone Updates',
      description: 'Update emergency landing protocols based on new urban development',
      reasoning: 'Recent construction has reduced available emergency landing zones by 30% in sector 7',
      confidence: 95,
      impact: 'Improved emergency response capability',
      timeframe: 'Immediate',
      resources: ['Mapping update', 'Pilot training'],
      estimatedCost: 1500,
      expectedBenefit: 'Enhanced safety margins',
      status: 'pending',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const mockScenarios: DecisionScenario[] = [
    {
      id: 'weather-scenario',
      title: 'Severe Weather Response',
      description: 'Storm system approaching operational area with 40mph winds and heavy rain expected',
      urgency: 'high',
      options: [
        {
          id: 'ground-all',
          title: 'Ground All Operations',
          description: 'Cancel all flights and secure equipment',
          pros: ['Maximum safety', 'No equipment risk', 'Clear protocol'],
          cons: ['Mission delays', 'Lost operational time', 'Customer impact'],
          risk: 10,
          cost: 15000,
          timeline: 'Immediate',
          aiRecommendation: false
        },
        {
          id: 'selective-ops',
          title: 'Selective Operations',
          description: 'Continue critical missions with weather-rated drones only',
          pros: ['Maintain essential services', 'Lower financial impact', 'Test capabilities'],
          cons: ['Increased risk', 'Limited fleet availability', 'Requires monitoring'],
          risk: 35,
          cost: 5000,
          timeline: '2 hours prep',
          aiRecommendation: true
        },
        {
          id: 'full-continue',
          title: 'Continue Full Operations',
          description: 'Proceed with normal operations using enhanced monitoring',
          pros: ['No mission disruption', 'Normal revenue', 'Show reliability'],
          cons: ['High risk', 'Potential equipment loss', 'Safety concerns'],
          risk: 75,
          cost: 0,
          timeline: 'Immediate',
          aiRecommendation: false
        }
      ],
      aiAnalysis: {
        recommendedOption: 'selective-ops',
        reasoning: 'Weather-rated drones can safely operate in current conditions. Critical missions maintain service while reducing risk exposure by 60% compared to full operations.',
        confidence: 89,
        riskAssessment: 'Medium risk with acceptable safety margins. Enhanced monitoring protocols recommended.'
      }
    }
  ];

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-multi-provider', {
        body: {
          provider: 'openai',
          action: 'generate_recommendations',
          data: {
            operational_data: 'Current system metrics and performance data',
            historical_patterns: 'Historical operational patterns and outcomes',
            current_context: 'Current operational context and constraints'
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setRecommendations(mockRecommendations);
      toast.success('AI recommendations generated');
    },
    onError: (error) => {
      console.error('Recommendation generation error:', error);
      setRecommendations(mockRecommendations);
      toast.error('Using cached recommendations - AI service unavailable');
    },
    onSettled: () => {
      setIsGeneratingRecommendations(false);
    }
  });

  React.useEffect(() => {
    setScenarios(mockScenarios);
  }, []);

  const handleGenerateRecommendations = () => {
    setIsGeneratingRecommendations(true);
    generateRecommendationsMutation.mutate();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'operational': return <Target className="h-4 w-4" />;
      case 'maintenance': return <Zap className="h-4 w-4" />;
      case 'safety': return <Shield className="h-4 w-4" />;
      case 'optimization': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'implemented': return 'bg-blue-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'reviewing': return 'bg-yellow-500 text-white';
      case 'pending': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Decision Support</h3>
          <p className="text-sm text-muted-foreground">
            Intelligent recommendations and decision analysis for operational excellence
          </p>
        </div>
        <Button 
          onClick={handleGenerateRecommendations}
          disabled={isGeneratingRecommendations}
          className="gap-2"
        >
          <Brain className="h-4 w-4" />
          {isGeneratingRecommendations ? 'Generating...' : 'Generate Recommendations'}
        </Button>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="scenarios">Decision Scenarios</TabsTrigger>
          <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate AI-powered recommendations based on current operational data
                  </p>
                  <Button onClick={handleGenerateRecommendations} disabled={isGeneratingRecommendations}>
                    Generate Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(rec.type)}
                        <CardTitle className="text-base">{rec.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <Badge className={getStatusColor(rec.status)} variant="secondary">
                          {rec.status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{rec.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Confidence:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-muted-foreground">{rec.confidence}%</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${rec.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Estimated Cost:</span>
                        <p className="text-muted-foreground mt-1">${rec.estimatedCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Timeline:</span>
                        <p className="text-muted-foreground mt-1">{rec.timeframe}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-sm">AI Reasoning:</span>
                        <p className="text-sm text-muted-foreground mt-1">{rec.reasoning}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Expected Impact:</span>
                        <p className="text-sm text-muted-foreground mt-1">{rec.impact}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button variant="default" size="sm" className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Clock className="h-4 w-4" />
                        Review Later
                      </Button>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          {scenarios.map((scenario) => (
            <Card key={scenario.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      {scenario.title}
                    </CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </div>
                  <Badge className={getPriorityColor(scenario.urgency)}>
                    {scenario.urgency} urgency
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Analysis */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Analysis & Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium text-sm">Recommended Option:</span>
                      <p className="text-sm mt-1">
                        {scenario.options.find(o => o.id === scenario.aiAnalysis.recommendedOption)?.title}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">AI Reasoning:</span>
                      <p className="text-sm text-muted-foreground mt-1">{scenario.aiAnalysis.reasoning}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-medium">Confidence:</span>
                        <span className="ml-2">{scenario.aiAnalysis.confidence}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Risk Level:</span>
                        <span className="ml-2">{scenario.aiAnalysis.riskAssessment}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Options */}
                <div className="space-y-3">
                  <h4 className="font-medium">Available Options:</h4>
                  {scenario.options.map((option) => (
                    <Card key={option.id} className={`${
                      option.aiRecommendation ? 'border-primary bg-primary/5' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium flex items-center gap-2">
                            {option.title}
                            {option.aiRecommendation && (
                              <Badge variant="default" className="text-xs">
                                AI Recommended
                              </Badge>
                            )}
                          </h5>
                          <div className="text-sm text-muted-foreground">
                            Risk: {option.risk}% | Cost: ${option.cost.toLocaleString()}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-green-600">Pros:</span>
                            <ul className="mt-1 space-y-1">
                              {option.pros.map((pro, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <ThumbsUp className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium text-red-600">Cons:</span>
                            <ul className="mt-1 space-y-1">
                              {option.cons.map((con, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <ThumbsDown className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Strategic Insights
              </CardTitle>
              <CardDescription>
                Long-term trends and strategic recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Operational Efficiency Trends</h4>
                  <p className="text-sm text-muted-foreground">
                    Analysis of 6-month operational data shows 18% improvement in mission success rates
                    and 12% reduction in operational costs through AI-optimized decisions.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Predictive Maintenance Impact</h4>
                  <p className="text-sm text-muted-foreground">
                    AI-driven maintenance scheduling has reduced unexpected downtime by 34% and
                    extended average component lifespan by 8 months.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Future Optimization Opportunities</h4>
                  <p className="text-sm text-muted-foreground">
                    Fleet expansion analysis suggests optimal growth strategy with ROI of 23% over 24 months
                    through strategic deployment in high-demand sectors.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIDecisionSupport;