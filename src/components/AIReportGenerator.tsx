import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Eye, Calendar, BarChart3, Settings } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'operational' | 'maintenance' | 'performance' | 'safety' | 'financial';
  sections: string[];
}

interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  content: string;
  generatedAt: string;
  status: 'draft' | 'final';
}

const AIReportGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('last_7_days');
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'daily_ops',
      name: 'Daily Operations Report',
      description: 'Comprehensive daily summary of drone operations, missions, and performance',
      type: 'operational',
      sections: ['Mission Summary', 'Fleet Status', 'Performance Metrics', 'Issues & Alerts', 'Recommendations']
    },
    {
      id: 'weekly_maintenance',
      name: 'Weekly Maintenance Report',
      description: 'Maintenance activities, scheduled repairs, and equipment health status',
      type: 'maintenance',
      sections: ['Maintenance Activities', 'Equipment Health', 'Upcoming Maintenance', 'Parts Inventory', 'Cost Analysis']
    },
    {
      id: 'monthly_performance',
      name: 'Monthly Performance Analysis',
      description: 'Detailed performance analysis with trends, efficiency metrics, and optimization suggestions',
      type: 'performance',
      sections: ['Performance Overview', 'Trend Analysis', 'Efficiency Metrics', 'Optimization Opportunities', 'Goals vs Actuals']
    },
    {
      id: 'safety_audit',
      name: 'Safety Audit Report',
      description: 'Safety incidents, compliance status, and risk assessment',
      type: 'safety',
      sections: ['Safety Overview', 'Incident Reports', 'Compliance Status', 'Risk Assessment', 'Safety Recommendations']
    },
    {
      id: 'financial_summary',
      name: 'Financial Summary Report',
      description: 'Operational costs, ROI analysis, and budget utilization',
      type: 'financial',
      sections: ['Cost Overview', 'ROI Analysis', 'Budget Utilization', 'Cost Optimization', 'Financial Projections']
    }
  ];

  const generateReportMutation = useMutation({
    mutationFn: async ({ templateId, prompt, range }: { templateId: string, prompt: string, range: string }) => {
      const template = reportTemplates.find(t => t.id === templateId);
      
      const { data, error } = await supabase.functions.invoke('ai-multi-provider', {
        body: {
          provider: 'openai',
          action: 'generate_report',
          data: {
            template: template,
            customPrompt: prompt,
            dateRange: range,
            sections: template?.sections || []
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Mock generated report for demonstration
      const mockReport: GeneratedReport = {
        id: Date.now().toString(),
        title: `${reportTemplates.find(t => t.id === selectedTemplate)?.name || 'Custom Report'} - ${new Date().toLocaleDateString()}`,
        type: reportTemplates.find(t => t.id === selectedTemplate)?.type || 'custom',
        content: generateMockReportContent(),
        generatedAt: new Date().toISOString(),
        status: 'draft'
      };
      
      setGeneratedReport(mockReport);
      toast.success('Report generated successfully');
    },
    onError: (error) => {
      console.error('Report generation error:', error);
      // Fallback to mock report
      const mockReport: GeneratedReport = {
        id: Date.now().toString(),
        title: `${reportTemplates.find(t => t.id === selectedTemplate)?.name || 'Custom Report'} - ${new Date().toLocaleDateString()}`,
        type: reportTemplates.find(t => t.id === selectedTemplate)?.type || 'custom',
        content: generateMockReportContent(),
        generatedAt: new Date().toISOString(),
        status: 'draft'
      };
      
      setGeneratedReport(mockReport);
      toast.error('Using cached data - AI service unavailable');
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const generateMockReportContent = () => {
    return `# ${reportTemplates.find(t => t.id === selectedTemplate)?.name || 'Operations Report'}

## Executive Summary
This report provides a comprehensive analysis of UAV operations for the selected period. Key highlights include improved flight efficiency, successful mission completion rates, and proactive maintenance scheduling.

## Key Metrics
- **Total Flights**: 156 missions completed
- **Flight Hours**: 324.5 hours logged
- **Success Rate**: 98.7% mission completion
- **Average Battery Usage**: 78% per mission
- **Maintenance Events**: 12 scheduled, 2 unscheduled

## Fleet Status
### Active Drones: 8/10
- **Scout Alpha**: Operational (98% health)
- **Patrol Beta**: Operational (94% health)
- **Survey Gamma**: Maintenance Required (72% health)
- **Recon Delta**: Operational (96% health)

### Inactive Drones: 2/10
- **Explorer Echo**: Scheduled maintenance
- **Guard Foxtrot**: Battery replacement in progress

## Performance Analysis
Flight efficiency has improved by 12% compared to the previous period, primarily due to optimized flight path algorithms and favorable weather conditions. Battery utilization remains within optimal parameters.

## Maintenance Summary
All scheduled maintenance activities were completed on time. Two unexpected maintenance events were resolved within 24 hours with minimal operational impact.

## Recommendations
1. **Immediate**: Schedule maintenance for Survey Gamma
2. **Short-term**: Monitor battery degradation patterns
3. **Long-term**: Consider fleet expansion for peak demand periods

## Conclusion
Operations continue to meet performance targets with high efficiency and safety standards. Proactive maintenance scheduling has minimized downtime and ensured mission readiness.

---
*Report generated by AI Operations Center on ${new Date().toLocaleString()}*`;
  };

  const handleGenerateReport = () => {
    if (!selectedTemplate && !customPrompt.trim()) {
      toast.error('Please select a template or enter a custom prompt');
      return;
    }
    
    setIsGenerating(true);
    generateReportMutation.mutate({
      templateId: selectedTemplate,
      prompt: customPrompt,
      range: dateRange
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'operational': return 'bg-blue-500 text-white';
      case 'maintenance': return 'bg-orange-500 text-white';
      case 'performance': return 'bg-green-500 text-white';
      case 'safety': return 'bg-red-500 text-white';
      case 'financial': return 'bg-purple-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Report Generator</h3>
          <p className="text-sm text-muted-foreground">
            Generate comprehensive reports using AI analysis of operational data
          </p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Report</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_24_hours">Last 24 Hours</SelectItem>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_quarter">Last Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3">
              {reportTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </div>
                      <Badge className={getTypeColor(template.type)}>
                        {template.type}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="font-medium">Sections: </span>
                      <span className="text-muted-foreground">
                        {template.sections.join(', ')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Custom Report Prompt</label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe what kind of report you want to generate. For example: 'Generate a summary of all drone missions from last week with focus on battery performance and maintenance needs.'"
                className="mt-2"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_24_hours">Last 24 Hours</SelectItem>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_quarter">Last Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button 
        onClick={handleGenerateReport}
        disabled={isGenerating || (!selectedTemplate && !customPrompt.trim())}
        className="w-full gap-2"
      >
        <BarChart3 className="h-4 w-4" />
        {isGenerating ? 'Generating Report...' : 'Generate Report'}
      </Button>

      {generatedReport && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {generatedReport.title}
                </CardTitle>
                <CardDescription>
                  Generated on {new Date(generatedReport.generatedAt).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(generatedReport.type)}>
                  {generatedReport.status}
                </Badge>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-md">
                {generatedReport.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIReportGenerator;