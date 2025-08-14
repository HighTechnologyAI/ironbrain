import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAnalyticsPanel } from '@/components/AIAnalyticsPanel';
import { AIMissionPlanner } from '@/components/AIMissionPlanner';
import { EnhancedAIPanel } from '@/components/EnhancedAIPanel';
import { UAVMetricsWidget } from '@/components/UAVMetricsWidget';
import { RecentEventsWidget } from '@/components/RecentEventsWidget';
import { 
  Brain, 
  Route, 
  BarChart3, 
  Activity,
  Sparkles
} from 'lucide-react';

const AIAssistantPage: React.FC = () => {
  const { t } = useTranslation();

  // Feature flag check
  if (import.meta.env.VITE_FEATURE_OPS_CENTER !== 'true') {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          {t('ops.aiAssistant.title', 'AI Operations Assistant')}
        </h1>
        <p className="text-muted-foreground">
          {t('ops.aiAssistant.subtitle', 'Intelligent analytics and mission planning for UAV operations')}
        </p>
      </div>

      {/* UAV Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UAVMetricsWidget />
        </div>
        <RecentEventsWidget />
      </div>

      {/* AI Tools */}
      <Tabs defaultValue="enhanced" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enhanced" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Enhanced AI
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Legacy Analytics
          </TabsTrigger>
          <TabsTrigger value="mission-planner" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Mission Planner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced" className="space-y-6">
          <EnhancedAIPanel />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AIAnalyticsPanel />
        </TabsContent>

        <TabsContent value="mission-planner" className="space-y-6">
          <AIMissionPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistantPage;