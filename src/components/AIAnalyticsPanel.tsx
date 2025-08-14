import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/neon/Button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, TrendingUp, AlertTriangle, MapPin, Wrench } from 'lucide-react';
import { toast } from 'sonner';

interface AIAnalysisRequest {
  action: 'analyze_telemetry' | 'plan_mission' | 'predict_maintenance' | 'anomaly_detection' | 'optimize_operations';
  data: any;
}

export const AIAnalyticsPanel: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<string>('');
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState<string>('');

  const analysisMutation = useMutation({
    mutationFn: async (request: AIAnalysisRequest) => {
      const { data, error } = await supabase.functions.invoke('ai-uav-analytics', {
        body: request
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setResult(data.response);
        toast.success('AI analysis completed');
      } else {
        throw new Error(data.error);
      }
    },
    onError: (error) => {
      console.error('AI Analysis failed:', error);
      toast.error('Failed to complete AI analysis');
    }
  });

  const handleAnalyze = () => {
    if (!analysisType || !inputData.trim()) {
      toast.error('Please select analysis type and provide data');
      return;
    }

    try {
      const parsedData = JSON.parse(inputData);
      analysisMutation.mutate({
        action: analysisType as any,
        data: parsedData
      });
    } catch (error) {
      // If not JSON, send as text
      analysisMutation.mutate({
        action: analysisType as any,
        data: { text: inputData }
      });
    }
  };

  const analysisTypes = [
    {
      value: 'analyze_telemetry',
      label: 'Telemetry Analysis',
      icon: TrendingUp,
      description: 'Analyze flight data and performance metrics'
    },
    {
      value: 'plan_mission',
      label: 'Mission Planning',
      icon: MapPin,
      description: 'AI-powered mission route and parameter optimization'
    },
    {
      value: 'predict_maintenance',
      label: 'Predictive Maintenance',
      icon: Wrench,
      description: 'Predict maintenance needs and schedule'
    },
    {
      value: 'anomaly_detection',
      label: 'Anomaly Detection',
      icon: AlertTriangle,
      description: 'Detect unusual patterns and potential issues'
    },
    {
      value: 'optimize_operations',
      label: 'Operations Optimization',
      icon: Brain,
      description: 'Optimize fleet operations and resource allocation'
    }
  ];

  const selectedAnalysis = analysisTypes.find(type => type.value === analysisType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analytics & Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Type</label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue placeholder="Select analysis type" />
              </SelectTrigger>
              <SelectContent>
                {analysisTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedAnalysis && (
            <Alert>
              <selectedAnalysis.icon className="h-4 w-4" />
              <AlertDescription>
                {selectedAnalysis.description}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Input Data</label>
            <Textarea
              placeholder={`Enter data for analysis (JSON format or plain text)...

Example for telemetry analysis:
{
  "altitude": 120,
  "speed": 8.5,
  "battery": 14.8,
  "temperature": 65,
  "flight_time": 45
}`}
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={analysisMutation.isPending || !analysisType || !inputData.trim()}
            className="w-full"
            variant="neon"
          >
            {analysisMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/20 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {result}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};