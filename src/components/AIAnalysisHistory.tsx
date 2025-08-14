import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/neon/Button';
import { 
  Clock, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown,
  ChevronUp,
  Zap,
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIAnalysisRecord {
  id: string;
  provider: string;
  analysis_type: string;
  input_data: any;
  result_data: string;
  model_used: string;
  created_at: string;
  execution_time_ms: number;
  success: boolean;
  error_message?: string;
}

export const AIAnalysisHistory: React.FC = () => {
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  const { data: analysisHistory, isLoading } = useQuery({
    queryKey: ['ai-analysis-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_analysis_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as AIAnalysisRecord[];
    }
  });

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return <Zap className="h-4 w-4" />;
      case 'anthropic':
        return <Brain className="h-4 w-4" />;
      case 'perplexity':
        return <Globe className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'anthropic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'perplexity':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAnalysisType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            AI Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading analysis history...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisHistory || analysisHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            AI Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No analysis history found. Start using the AI tools to see your analysis history here.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          AI Analysis History
          <Badge variant="secondary" className="ml-auto">
            {analysisHistory.length} analyses
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {analysisHistory.map((analysis) => (
              <div
                key={analysis.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${getProviderColor(analysis.provider)}`}>
                      {getProviderIcon(analysis.provider)}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {formatAnalysisType(analysis.analysis_type)}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{analysis.provider.toUpperCase()}</span>
                        <span>•</span>
                        <span>{analysis.model_used}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(analysis.created_at))} ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {analysis.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {analysis.execution_time_ms}ms
                    </Badge>
                  </div>
                </div>

                {!analysis.success && analysis.error_message && (
                  <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">{analysis.error_message}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Analysis completed {analysis.success ? 'successfully' : 'with errors'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedAnalysis(
                      expandedAnalysis === analysis.id ? null : analysis.id
                    )}
                  >
                    {expandedAnalysis === analysis.id ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show Details
                      </>
                    )}
                  </Button>
                </div>

                {expandedAnalysis === analysis.id && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <div>
                      <h5 className="font-medium mb-2">Input Data</h5>
                      <div className="bg-muted/20 rounded-lg p-3">
                        <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
                          {JSON.stringify(analysis.input_data, null, 2)}
                        </pre>
                      </div>
                    </div>
                    
                    {analysis.success && analysis.result_data && (
                      <div>
                        <h5 className="font-medium mb-2">AI Analysis Result</h5>
                        <div className="bg-muted/20 rounded-lg p-3">
                          <pre className="text-sm whitespace-pre-wrap leading-relaxed">
                            {analysis.result_data}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};