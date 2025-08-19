import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Bug, 
  Clock, 
  Zap,
  Shield,
  Eye,
  Radio,
  Settings
} from 'lucide-react';

interface DefectItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'connectivity' | 'ui' | 'data' | 'control' | 'performance';
  status: 'active' | 'investigating' | 'planned';
}

export const Phase2Defects: React.FC = () => {
  const defects: DefectItem[] = [
    {
      id: 'DEF-001',
      title: 'Некорректный статус подключения',
      description: 'API возвращает connected: false, но данные поступают нормально. Исправлено логикой "если данные есть = подключен"',
      severity: 'high',
      category: 'connectivity',
      status: 'investigating'
    },
    {
      id: 'DEF-002', 
      title: 'Отсутствует реальное управление дроном',
      description: 'Кнопки ARM, DISARM, TAKEOFF, LAND не подключены к API командам. Только UI-заглушки.',
      severity: 'critical',
      category: 'control',
      status: 'planned'
    },
    {
      id: 'DEF-003',
      title: 'Нет обработки ошибок сети',
      description: 'При потере соединения с VPS/Jetson нет fallback механизмов или уведомлений пользователя.',
      severity: 'high',
      category: 'connectivity', 
      status: 'active'
    },
    {
      id: 'DEF-004',
      title: 'Фиксированный интервал обновления',
      description: 'Телеметрия обновляется каждые 5 сек независимо от важности данных или состояния дрона.',
      severity: 'medium',
      category: 'performance',
      status: 'active'
    },
    {
      id: 'DEF-005',
      title: 'Отсутствует валидация данных',
      description: 'Нет проверки корректности GPS координат, диапазонов батареи, скорости и других параметров.',
      severity: 'medium',
      category: 'data',
      status: 'active'
    },
    {
      id: 'DEF-006',
      title: 'Нет истории телеметрии',
      description: 'Показываются только последние данные, нет графиков трендов или исторических данных.',
      severity: 'low',
      category: 'ui',
      status: 'planned'
    },
    {
      id: 'DEF-007',
      title: 'Отсутствуют алерты и предупреждения',
      description: 'Нет автоматических уведомлений при низком заряде батареи, потере GPS или других критических событиях.',
      severity: 'high',
      category: 'ui',
      status: 'active'
    },
    {
      id: 'DEF-008',
      title: 'Hardcoded device ID',
      description: 'ID дрона "jetson_nano_real_001" захардкожен в коде вместо динамического получения.',
      severity: 'medium',
      category: 'data',
      status: 'active'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <Bug className="h-4 w-4" />;
      case 'medium': return <Eye className="h-4 w-4" />;
      case 'low': return <Settings className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'connectivity': return <Radio className="h-4 w-4" />;
      case 'control': return <Zap className="h-4 w-4" />;
      case 'data': return <Shield className="h-4 w-4" />;
      case 'ui': return <Eye className="h-4 w-4" />;
      case 'performance': return <Clock className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'investigating': return 'secondary';
      case 'planned': return 'outline';
      default: return 'default';
    }
  };

  const criticalCount = defects.filter(d => d.severity === 'critical').length;
  const highCount = defects.filter(d => d.severity === 'high').length;
  const activeCount = defects.filter(d => d.status === 'active').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            🚨 Дефекты Фазы 2: Live Integration
          </CardTitle>
          <CardDescription>
            Обнаруженные проблемы и ограничения текущей реализации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
              <div className="text-sm text-muted-foreground">Критические</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{highCount}</div>
              <div className="text-sm text-muted-foreground">Высокие</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{activeCount}</div>
              <div className="text-sm text-muted-foreground">Активные</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{defects.length}</div>
              <div className="text-sm text-muted-foreground">Всего</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Defects List */}
      <div className="space-y-3">
        {defects.map((defect) => (
          <Card key={defect.id} className="border-l-4 border-l-destructive">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(defect.severity)}
                    {getCategoryIcon(defect.category)}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{defect.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(defect.severity)}>
                        {defect.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {defect.category}
                      </Badge>
                      <Badge variant={getStatusColor(defect.status)}>
                        {defect.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{defect.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{defect.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            🎯 Следующие шаги для Фазы 3
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              1. 🎮 Подключить реальное управление дроном (ARM/DISARM/TAKEOFF/LAND)
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              2. 🚨 Добавить систему алертов и предупреждений  
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              3. 📊 Реализовать графики и историю телеметрии
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              4. 🛡️ Добавить валидацию данных и обработку ошибок
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              5. 🗺️ Интегрировать живую карту с позицией дрона
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};