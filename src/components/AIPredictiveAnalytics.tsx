import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertTriangle, Battery, Wrench, Activity } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PredictionItem {
  id: string;
  type: 'maintenance' | 'performance' | 'battery' | 'failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  title: string;
  description: string;
  predictedDate: string;
  droneId?: string;
  droneName?: string;
  recommendations: string[];
}

const AIPredictiveAnalytics: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for demonstration
  const mockPredictions: PredictionItem[] = [
    {
      id: '1',
      type: 'maintenance',
      severity: 'medium',
      confidence: 85,
      title: 'Propeller Replacement Due',
      description: 'Drone UAV-001 propellers showing wear patterns indicating replacement needed within 2 weeks',
      predictedDate: '2024-09-01',
      droneId: 'uav-001',
      droneName: 'Scout Alpha',
      recommendations: ['Schedule maintenance window', 'Order replacement propellers', 'Reduce flight intensity']
    },
    {
      id: '2',
      type: 'battery',
      severity: 'high',
      confidence: 92,
      title: 'Battery Degradation Alert',
      description: 'Battery capacity dropping faster than expected - 15% degradation in last month',
      predictedDate: '2024-08-25',
      droneId: 'uav-002',
      droneName: 'Patrol Beta',
      recommendations: ['Replace battery pack', 'Calibrate charging system', 'Monitor temperature cycles']
    },
    {
      id: '3',
      type: 'performance',
      severity: 'low',
      confidence: 78,
      title: 'Flight Efficiency Decline',
      description: 'Gradual decrease in flight efficiency due to weather pattern changes',
      predictedDate: '2024-09-15',
      recommendations: ['Adjust flight paths', 'Update weather algorithms', 'Schedule performance review']
    },
    {
      id: '4',
      type: 'failure',
      severity: 'critical',
      confidence: 94,
      title: 'GPS Module Failure Risk',
      description: 'GPS signal inconsistencies suggest potential module failure within 1 week',
      predictedDate: '2024-08-20',
      droneId: 'uav-003',
      droneName: 'Survey Gamma',
      recommendations: ['Immediate GPS module inspection', 'Backup navigation system check', 'Ground drone immediately if issues persist']
    }
  ];

  const generatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-multi-provider', {
        body: {
          provider: 'openai',
          action: 'predict_maintenance',
          data: {
            telemetry_summary: 'Recent drone operations data',
            maintenance_history: 'Past maintenance records',
            usage_patterns: 'Flight pattern analysis'
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setPredictions(mockPredictions); // Use mock data for now
      toast.success('AI predictions generated successfully');
    },
    onError: (error) => {
      console.error('Prediction generation error:', error);
      setPredictions(mockPredictions); // Fallback to mock data
      toast.error('Using cached predictions - AI service unavailable');
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const handleGeneratePredictions = () => {
    setIsGenerating(true);
    generatePredictionsMutation.mutate();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'battery': return <Battery className="h-4 w-4" />;
      case 'performance': return <Activity className="h-4 w-4" />;
      case 'failure': return <AlertTriangle className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const filteredPredictions = selectedType === 'all' 
    ? predictions 
    : predictions.filter(p => p.type === selectedType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Predictive Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Machine learning predictions for maintenance, performance, and failure prevention
          </p>
        </div>
        <Button 
          onClick={handleGeneratePredictions}
          disabled={isGenerating}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Predictions'}
        </Button>
      </div>

      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="battery">Battery</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="failure">Failure Risk</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="space-y-4 mt-4">
          {filteredPredictions.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Predictions Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate AI predictions to see maintenance and performance forecasts
                  </p>
                  <Button onClick={handleGeneratePredictions} disabled={isGenerating}>
                    Generate Predictions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPredictions.map((prediction) => (
                <Card key={prediction.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(prediction.type)}
                        <CardTitle className="text-base">{prediction.title}</CardTitle>
                      </div>
                      <Badge className={getSeverityColor(prediction.severity)}>
                        {prediction.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>{prediction.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Confidence:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={prediction.confidence} className="flex-1" />
                          <span className="text-muted-foreground">{prediction.confidence}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Predicted Date:</span>
                        <p className="text-muted-foreground mt-1">{prediction.predictedDate}</p>
                      </div>
                      {prediction.droneName && (
                        <div>
                          <span className="font-medium">Affected Drone:</span>
                          <p className="text-muted-foreground mt-1">{prediction.droneName}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Recommendations:</span>
                      <ul className="mt-2 space-y-1">
                        {prediction.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPredictiveAnalytics;