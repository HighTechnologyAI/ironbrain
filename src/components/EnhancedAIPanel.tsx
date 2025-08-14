import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/neon/Button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Wrench,
  Globe,
  CloudSnow,
  Zap,
  Bot
} from 'lucide-react';
import { toast } from 'sonner';

interface AIRequest {
  provider: 'openai' | 'anthropic' | 'perplexity';
  action: string;
  data: any;
  model?: string;
}

export const EnhancedAIPanel: React.FC = () => {
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'perplexity'>('openai');
  const [analysisType, setAnalysisType] = useState<string>('');
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState<string>('');

  const analysisMutation = useMutation({
    mutationFn: async (request: AIRequest) => {
      const { data, error } = await supabase.functions.invoke('ai-multi-provider', {
        body: request
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setResult(data.response);
        toast.success(`${data.provider.toUpperCase()} analysis completed`);
      } else {
        throw new Error(data.error);
      }
    },
    onError: (error) => {
      console.error('AI Analysis failed:', error);
      toast.error(`Failed to complete AI analysis: ${error.message}`);
    }
  });

  const handleAnalyze = () => {
    if (!analysisType || !inputData.trim()) {
      toast.error('Please select analysis type and provide data');
      return;
    }

    let model;
    switch (provider) {
      case 'openai':
        model = 'gpt-4.1-2025-04-14';
        break;
      case 'anthropic':
        model = 'claude-sonnet-4-20250514';
        break;
      case 'perplexity':
        model = 'llama-3.1-sonar-large-128k-online';
        break;
    }

    try {
      const parsedData = JSON.parse(inputData);
      analysisMutation.mutate({
        provider,
        action: analysisType,
        data: parsedData,
        model
      });
    } catch (error) {
      // If not JSON, send as text
      analysisMutation.mutate({
        provider,
        action: analysisType,
        data: { text: inputData },
        model
      });
    }
  };

  const analysisTypes = {
    core: [
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
      }
    ],
    advanced: [
      {
        value: 'optimize_operations',
        label: 'Operations Optimization',
        icon: Brain,
        description: 'Optimize fleet operations and resource allocation'
      },
      {
        value: 'market_research',
        label: 'Market Research',
        icon: Globe,
        description: 'Research UAV industry trends and regulations (Perplexity)'
      },
      {
        value: 'weather_analysis',
        label: 'Weather Analysis',
        icon: CloudSnow,
        description: 'Meteorological analysis for flight planning'
      }
    ]
  };

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI',
      icon: Zap,
      model: 'GPT-4.1',
      description: 'Latest flagship model with superior performance',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: Brain,
      model: 'Claude Sonnet 4',
      description: 'Advanced reasoning and analytical capabilities',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      icon: Globe,
      model: 'Llama 3.1 Sonar',
      description: 'Real-time web search and current information',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  ];

  const currentProvider = providers.find(p => p.id === provider);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Enhanced AI Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Provider</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {providers.map((p) => {
                const IconComponent = p.icon;
                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      provider === p.id 
                        ? p.color 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setProvider(p.id as any)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{p.name}</span>
                      <Badge variant="secondary" className="text-xs">{p.model}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analysis Type Selection */}
          <Tabs defaultValue="core" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="core">Core Analysis</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
            </TabsList>

            <TabsContent value="core">
              <div className="space-y-2">
                <label className="text-sm font-medium">Analysis Type</label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select analysis type" />
                  </SelectTrigger>
                  <SelectContent>
                    {analysisTypes.core.map((type) => {
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
            </TabsContent>

            <TabsContent value="advanced">
              <div className="space-y-2">
                <label className="text-sm font-medium">Advanced Analysis</label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select advanced analysis type" />
                  </SelectTrigger>
                  <SelectContent>
                    {analysisTypes.advanced.map((type) => {
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
            </TabsContent>
          </Tabs>

          {/* Provider-specific alerts */}
          {provider === 'perplexity' && analysisType && (
            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                Perplexity will search for current, real-time information to enhance the analysis.
              </AlertDescription>
            </Alert>
          )}

          {provider === 'anthropic' && analysisType && (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                Claude will provide detailed reasoning and consider multiple analytical perspectives.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Input Data</label>
            <Textarea
              placeholder={getPlaceholderText(analysisType, provider)}
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
                Analyzing with {currentProvider?.name}...
              </>
            ) : (
              <>
                {currentProvider?.icon && <currentProvider.icon className="h-4 w-4 mr-2" />}
                Analyze with {currentProvider?.name}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentProvider?.icon && <currentProvider.icon className="h-5 w-5" />}
              {currentProvider?.name} Analysis Results
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

function getPlaceholderText(analysisType: string, provider: string): string {
  const examples = {
    analyze_telemetry: `{
  "altitude": 120,
  "speed": 8.5,
  "battery": 14.8,
  "temperature": 65,
  "flight_time": 45
}`,
    plan_mission: `{
  "location": "Sofia, Bulgaria",
  "objectives": "aerial photography",
  "weather": "clear, 15°C",
  "drone_model": "DJI Mavic"
}`,
    market_research: provider === 'perplexity' 
      ? 'Latest UAV regulations in Europe 2024' 
      : 'UAV market trends and regulatory changes',
    weather_analysis: `{
  "location": "42.6977, 23.3219",
  "mission_date": "2024-12-25",
  "flight_altitude": 100
}`
  };

  return examples[analysisType] || 'Enter your data here (JSON format or plain text)...';
}