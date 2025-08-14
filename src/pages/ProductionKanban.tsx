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
  // Пока нет активного производства - готовимся к демо-шоу
  const [units] = useState<ProductionUnit[]>([]);

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

  // Данные для демо-шоу 10 сентября
  const demoDate = new Date('2024-09-10');
  const today = new Date();
  const daysUntilDemo = Math.ceil((demoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const demoPreparationProgress = Math.max(0, Math.min(100, ((30 - daysUntilDemo) / 30) * 100)); // 30 дней подготовки

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation title="Подготовка к демо-шоу" subtitle="Демонстрация дронов - 10 сентября 2024" />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Demo Preparation Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                Дата демо-шоу
              </CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold font-mono">10 сентября</div>
              <p className="text-xs text-muted-foreground">2024 год</p>
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                Дней осталось
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-warning">{Math.max(0, daysUntilDemo)}</div>
              <div className="flex items-center gap-1 text-xs">
                <AlertTriangle className="h-3 w-3 text-warning" />
                <span className="text-warning">до демонстрации</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                Готовность
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{demoPreparationProgress.toFixed(0)}%</div>
              <Progress value={demoPreparationProgress} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                Будущее производство
              </CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold font-mono text-muted-foreground">TBD</div>
              <p className="text-xs text-muted-foreground">после демонстрации</p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Preparation Status */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-ui">
              <Target className="h-5 w-5 text-primary" />
              Подготовка к демонстрации дронов
            </CardTitle>
            <CardDescription>
              Текущее состояние подготовки к показательному полету 10 сентября 2024
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-primary/10 border border-primary/20">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-xl font-bold font-mono text-primary mb-2">ЦЕЛЬ</div>
                <p className="text-sm text-muted-foreground mb-4">Демонстрация возможностей дронов Tiger-X</p>
                <StatusChip variant="info" className="text-xs">10 СЕНТЯБРЯ</StatusChip>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-warning/10 border border-warning/20">
                <Factory className="h-12 w-12 text-warning mx-auto mb-4" />
                <div className="text-xl font-bold font-mono text-warning mb-2">СТАТУС</div>
                <p className="text-sm text-muted-foreground mb-4">Производство будет запущено после демо</p>
                <StatusChip variant="warning" className="text-xs">ОЖИДАНИЕ</StatusChip>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <div className="text-xl font-bold font-mono text-success mb-2">ЗАДАЧА</div>
                <p className="text-sm text-muted-foreground mb-4">Определить объемы производства</p>
                <StatusChip variant="ready" className="text-xs">ПОСЛЕ ДЕМО</StatusChip>
              </div>
            </div>
            
            <div className="mt-8 p-6 rounded-lg bg-info/10 border border-info/20">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-6 w-6 text-info" />
                <h3 className="text-lg font-semibold">Следующие шаги</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Подготовка демонстрационных дронов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    <span>Планирование презентации</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-info" />
                    <span>Подготовка команды</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span>Проверка безопасности полетов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-info" />
                    <span>Логистика мероприятия</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>Анализ результатов и планирование производства</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Production Planning */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-ui">
              <Factory className="h-5 w-5 text-primary" />
              Планирование производства
            </CardTitle>
            <CardDescription>
              После успешной демонстрации будут определены объемы и сроки производства
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold font-mono text-muted-foreground mb-2">?</div>
                <p className="text-sm text-muted-foreground">Целевой объем</p>
                <p className="text-xs text-muted-foreground mt-1">определится после демо</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold font-mono text-muted-foreground mb-2">?</div>
                <p className="text-sm text-muted-foreground">Сроки производства</p>
                <p className="text-xs text-muted-foreground mt-1">зависят от спроса</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold font-mono text-muted-foreground mb-2">?</div>
                <p className="text-sm text-muted-foreground">Модификации</p>
                <p className="text-xs text-muted-foreground mt-1">по итогам демонстрации</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionKanban;