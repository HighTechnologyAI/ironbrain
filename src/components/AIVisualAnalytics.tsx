import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, BarChart3, Download, Eye, Palette, Sparkles, Camera } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeneratedVisual {
  id: string;
  type: 'chart' | 'diagram' | 'infographic' | 'heatmap';
  title: string;
  description: string;
  imageUrl: string;
  prompt: string;
  generatedAt: string;
}

const AIVisualAnalytics: React.FC = () => {
  const [visualType, setVisualType] = useState<string>('chart');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('telemetry');
  const [generatedVisuals, setGeneratedVisuals] = useState<GeneratedVisual[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const visualTemplates = {
    chart: {
      name: 'Data Charts',
      description: 'Generate visual charts and graphs from operational data',
      examples: [
        'Create a battery usage chart for all drones over the last week',
        'Generate a flight efficiency comparison chart between different drone models',
        'Show mission success rate trends over the past month'
      ]
    },
    diagram: {
      name: 'System Diagrams',
      description: 'Create technical diagrams and system visualizations',
      examples: [
        'Draw a network topology diagram of the drone communication system',
        'Create a flowchart showing the mission planning process',
        'Generate a system architecture diagram of the UAV operations center'
      ]
    },
    infographic: {
      name: 'Infographics',
      description: 'Design informational graphics and visual reports',
      examples: [
        'Create an infographic summarizing monthly drone operations statistics',
        'Design a safety protocol infographic for drone operators',
        'Generate a visual comparison of drone fleet capabilities'
      ]
    },
    heatmap: {
      name: 'Heat Maps',
      description: 'Generate geographic and operational heat maps',
      examples: [
        'Create a heat map showing drone activity zones over the city',
        'Generate a maintenance frequency heat map across the fleet',
        'Show weather impact heat map on flight operations'
      ]
    }
  };

  const generateVisualMutation = useMutation({
    mutationFn: async ({ type, prompt, source }: { type: string, prompt: string, source: string }) => {
      // Enhanced prompt for better visual generation
      const enhancedPrompt = `Create a professional ${type} visualization: ${prompt}. 
        Style: Clean, modern, high-contrast design suitable for a UAV operations dashboard. 
        Use a professional color scheme with blues, greens, and accent colors. 
        Include data labels, legends, and professional typography. 
        Make it suitable for technical documentation and reports.`;

      const { data, error } = await supabase.functions.invoke('ai-visual-generator', {
        body: {
          prompt: enhancedPrompt,
          type: type,
          dataSource: source,
          style: 'professional',
          format: 'png',
          size: '1024x1024'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Mock generated visual for demonstration
      const mockVisual: GeneratedVisual = {
        id: Date.now().toString(),
        type: visualType as any,
        title: `AI Generated ${visualTemplates[visualType as keyof typeof visualTemplates]?.name}`,
        description: customPrompt,
        imageUrl: '/placeholder.svg', // Would be replaced with actual generated image
        prompt: customPrompt,
        generatedAt: new Date().toISOString()
      };
      
      setGeneratedVisuals(prev => [mockVisual, ...prev]);
      toast.success('Visual generated successfully');
    },
    onError: (error) => {
      console.error('Visual generation error:', error);
      toast.error('Failed to generate visual - please try again');
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const handleGenerateVisual = () => {
    if (!customPrompt.trim()) {
      toast.error('Please enter a description for the visual');
      return;
    }
    
    setIsGenerating(true);
    generateVisualMutation.mutate({
      type: visualType,
      prompt: customPrompt,
      source: dataSource
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'chart': return 'bg-blue-500 text-white';
      case 'diagram': return 'bg-green-500 text-white';
      case 'infographic': return 'bg-purple-500 text-white';
      case 'heatmap': return 'bg-orange-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const currentTemplate = visualTemplates[visualType as keyof typeof visualTemplates];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Visual Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Generate professional charts, diagrams, and visualizations using AI
          </p>
        </div>
      </div>

      <Tabs value={visualType} onValueChange={setVisualType} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chart" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="diagram" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Diagrams
          </TabsTrigger>
          <TabsTrigger value="infographic" className="gap-2">
            <Palette className="h-4 w-4" />
            Infographics
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="gap-2">
            <Image className="h-4 w-4" />
            Heat Maps
          </TabsTrigger>
        </TabsList>

        <TabsContent value={visualType} className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                {currentTemplate?.name}
              </CardTitle>
              <CardDescription>{currentTemplate?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data Source</label>
                  <Select value={dataSource} onValueChange={setDataSource}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telemetry">Telemetry Data</SelectItem>
                      <SelectItem value="missions">Mission Data</SelectItem>
                      <SelectItem value="maintenance">Maintenance Records</SelectItem>
                      <SelectItem value="performance">Performance Metrics</SelectItem>
                      <SelectItem value="financial">Financial Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Visual Description</label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`Describe the ${visualType} you want to create. For example: "${currentTemplate?.examples[0]}"`}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Example Prompts</label>
                <div className="flex flex-wrap gap-2">
                  {currentTemplate?.examples.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setCustomPrompt(example)}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerateVisual}
                disabled={isGenerating || !customPrompt.trim()}
                className="w-full gap-2"
              >
                <Image className="h-4 w-4" />
                {isGenerating ? 'Generating Visual...' : 'Generate Visual'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Visuals Gallery */}
      {generatedVisuals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Generated Visuals
            </CardTitle>
            <CardDescription>
              Your AI-generated visualizations and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedVisuals.map((visual) => (
                <Card key={visual.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{visual.title}</h4>
                      <Badge className={getTypeColor(visual.type)} variant="secondary">
                        {visual.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {visual.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual Generation Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips for Better Visuals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">For Charts & Graphs:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Specify data ranges and time periods</li>
                <li>• Include axis labels and units</li>
                <li>• Mention comparison criteria</li>
                <li>• Request specific chart types (bar, line, pie)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Diagrams:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Be specific about components to include</li>
                <li>• Mention relationships and connections</li>
                <li>• Specify layout preferences</li>
                <li>• Include annotation requirements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIVisualAnalytics;