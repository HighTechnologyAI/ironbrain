import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/ui/status-chip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppNavigation from '@/components/AppNavigation';
import { useLanguage } from '@/hooks/use-language';
import { 
  Factory, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
  Target,
  Wrench,
  Truck,
  ClipboardCheck
} from 'lucide-react';

interface ProductionUnit {
  id: string;
  serialNumber: string;
  model: string;
  stage: 'incoming' | 'mechanical' | 'electronics' | 'assembly' | 'testing' | 'packaging';
  progress: number;
  assignedTo: string;
  estimatedCompletion: string;
  priority: 'normal' | 'high' | 'urgent';
}

const ProductionKanban = () => {
  const { t } = useLanguage();
  const [units] = useState<ProductionUnit[]>([
    {
      id: '1',
      serialNumber: 'UAV-2024-001',
      model: 'Tiger-X Pro',
      stage: 'mechanical',
      progress: 75,
      assignedTo: 'Иван П.',
      estimatedCompletion: '2 часа',
      priority: 'normal'
    },
    {
      id: '2',
      serialNumber: 'UAV-2024-002',
      model: 'Tiger-X Standard',
      stage: 'electronics',
      progress: 45,
      assignedTo: 'Мария К.',
      estimatedCompletion: '4 часа',
      priority: 'high'
    },
    {
      id: '3',
      serialNumber: 'UAV-2024-003',
      model: 'Tiger-X Pro',
      stage: 'testing',
      progress: 90,
      assignedTo: 'Алексей М.',
      estimatedCompletion: '30 мин',
      priority: 'urgent'
    }
  ]);

  const stages = [
    { 
      id: 'incoming', 
      name: t.incoming, 
      icon: Package, 
      color: 'text-muted-foreground',
      bgColor: 'bg-surface-2'
    },
    { 
      id: 'mechanical', 
      name: t.mechanical, 
      icon: Wrench, 
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    { 
      id: 'electronics', 
      name: t.electronics, 
      icon: Target, 
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    { 
      id: 'assembly', 
      name: t.assembly, 
      icon: Factory, 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      id: 'testing', 
      name: t.testing, 
      icon: ClipboardCheck, 
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    { 
      id: 'packaging', 
      name: t.packaging, 
      icon: CheckCircle, 
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  const getUnitsInStage = (stageId: string) => {
    return units.filter(unit => unit.stage === stageId);
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'critical';
      case 'high': return 'warning';
      default: return 'info';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return t.urgent.toUpperCase();
      case 'high': return t.high.toUpperCase();
      default: return t.normal.toUpperCase();
    }
  };

  const monthlyTarget = 100;
  const currentProduction = 78;
  const completionRate = (currentProduction / monthlyTarget) * 100;

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation title={t.productionKanban} subtitle="Kanban-система управления производством UAV" />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Production KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                {t.strategicTarget}
              </CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{monthlyTarget}</div>
              <p className="text-xs text-muted-foreground">единиц/месяц</p>
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                {t.production}
              </CardTitle>
              <Factory className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-success">{currentProduction}</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success">+12 за неделю</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                {t.performance}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{completionRate.toFixed(1)}%</div>
              <Progress value={completionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                {t.inProgress}
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-warning">{units.length}</div>
              <p className="text-xs text-muted-foreground">активных единиц</p>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {stages.map((stage) => {
            const stageUnits = getUnitsInStage(stage.id);
            return (
              <div key={stage.id} className="space-y-4">
                {/* Stage Header */}
                <div className={`p-4 rounded-lg ${stage.bgColor} border border-border`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stage.icon className={`h-5 w-5 ${stage.color}`} />
                      <h3 className="font-semibold font-ui">{stage.name}</h3>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stageUnits.length}
                    </Badge>
                  </div>
                </div>

                {/* Units in Stage */}
                <div className="space-y-3">
                  {stageUnits.map((unit) => (
                    <Card key={unit.id} className="bg-surface-1 border-border hover:shadow-medium transition-all duration-300">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-ui">{unit.serialNumber}</CardTitle>
                          <StatusChip 
                            priority={getPriorityVariant(unit.priority) as any}
                            className="text-xs"
                          >
                            {getPriorityText(unit.priority)}
                          </StatusChip>
                        </div>
                        <CardDescription className="text-xs font-mono">
                          {unit.model}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{t.progress}:</span>
                            <span className="font-mono font-semibold">{unit.progress}%</span>
                          </div>
                          <Progress value={unit.progress} className="h-2" />
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t.assignedTo}:</span>
                            <span className="font-semibold">{unit.assignedTo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t.estimatedCompletion}:</span>
                            <span className="font-mono font-semibold text-primary">{unit.estimatedCompletion}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Add Unit Button */}
                <Button 
                  variant="outline" 
                  className="w-full h-16 border-dashed border-2 hover:bg-surface-2"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Добавить единицу
                </Button>
              </div>
            );
          })}
        </div>

        {/* Quality Control Section */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-ui">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Контроль качества
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-success mb-2">99.2%</div>
                <p className="text-sm text-muted-foreground">Процент годных</p>
                <StatusChip variant="ready" className="mt-2">ОТЛИЧНО</StatusChip>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-warning mb-2">2</div>
                <p className="text-sm text-muted-foreground">Единиц на доработке</p>
                <StatusChip variant="warning" className="mt-2">КОНТРОЛЬ</StatusChip>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-primary mb-2">4.2</div>
                <p className="text-sm text-muted-foreground">Среднее время сборки (ч)</p>
                <StatusChip variant="info" className="mt-2">В НОРМЕ</StatusChip>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionKanban;