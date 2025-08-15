import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StrategicObjectiveEditor from "./StrategicObjectiveEditor";
import { useStrategy, STRATEGIC_TITLE } from "@/hooks/use-strategy";
import { useLanguage } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { 
  Calendar, 
  Wallet, 
  Edit3, 
  Target, 
  MapPin, 
  Clock, 
  Shield,
  TrendingUp,
  Users,
  Eye,
  Wifi,
  WifiOff
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { StatusChip } from "@/components/ui/status-chip";

interface KeyResult {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'behind';
  targets: {
    current: string;
    target: string;
  };
}

export default function DetailedStrategicBanner() {
  const { loading, error, objective, updateObjective, syncStatus, saveStatus } = useStrategy(true);
  const { t, language } = useLanguage();
  const { isAdmin } = useAdmin();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    budget: '',
    date: '',
    currency: 'BGN',
    tags: [] as string[]
  });

  // Данные ключевых результатов из скриншота
  const keyResults: KeyResult[] = [
    {
      id: 'kr1',
      title: 'Успешное проведение шоу',
      description: '45-минутная программа, болгарский флаг → логотип Tiger, 3 этапа повествования, военная трансформация-процесс',
      progress: 0,
      status: 'on_track',
      targets: {
        current: '1 show',
        target: '0 show'
      }
    },
    {
      id: 'kr2', 
      title: 'VIP-аудитория 20+',
      description: 'Министры, руководители служб, зарубежные представители, инвесторы; VIP-сопровождение',
      progress: 0,
      status: 'on_track',
      targets: {
        current: '20 guests',
        target: '0 guests'
      }
    },
    {
      id: 'kr3',
      title: 'Ключевой контракт 2+ млн лв',
      description: 'Гос. или корпоративный клиент, 30%+ предоплата, долгосрочное партнёрство, потенциал +50%',
      progress: 0,
      status: 'on_track',
      targets: {
        current: '2 M BGN',
        target: '0 M BGN'
      }
    },
    {
      id: 'kr4',
      title: 'Медиа-охват 100,000+',
      description: '5+ публикаций в нац. СМИ, документальный фильм, международное признание, 50+ лидов',
      progress: 0,
      status: 'on_track',
      targets: {
        current: '100000 reach',
        target: '0 reach'
      }
    }
  ];

  const localized = {
    ru: {
      strategicGoal: 'Стратегическая цель',
      location: 'Локация',
      budget: 'Бюджет',
      targetDate: 'Целевая дата',
      plannedBudget: 'Плановый бюджет',
      format: 'Формат',
      technologies: 'Технологии',
      safety: 'Безопасность',
      strategicImportance: 'Стратегическое значение',
      keyResults: 'Ключевые результаты',
      progress: 'Прогресс',
      target: 'Цель',
      current: 'Текущее'
    },
    en: {
      strategicGoal: 'Strategic Goal',
      location: 'Location',
      budget: 'Budget',
      targetDate: 'Target Date',
      plannedBudget: 'Planned Budget',
      format: 'Format',
      technologies: 'Technologies',
      safety: 'Safety',
      strategicImportance: 'Strategic Importance',
      keyResults: 'Key Results',
      progress: 'Progress',
      target: 'Target',
      current: 'Current'
    },
    bg: {
      strategicGoal: 'Стратегическа цел',
      location: 'Локация',
      budget: 'Бюджет',
      targetDate: 'Целева дата',
      plannedBudget: 'Планиран бюджет',
      format: 'Формат',
      technologies: 'Технологии',
      safety: 'Безопасност',
      strategicImportance: 'Стратегическо значение',
      keyResults: 'Ключови резултати',
      progress: 'Прогрес',
      target: 'Цел',
      current: 'Текущо'
    }
  } as const;

  const loc = (localized as any)[language] || localized.ru;

  useEffect(() => {
    if (objective) {
      console.log('🎯 Detailed Strategic Banner updated:', objective.title);
    }
  }, [objective]);

  const handleEditOpen = () => {
    const displayTitle = objective?.title || '';
    const displayDescription = objective?.description || '';
    const displayDate = objective?.target_date ? format(new Date(objective.target_date), 'dd.MM.yyyy') : '';
    const displayBudget = objective?.budget_planned;
    const displayCurrency = objective?.currency || 'BGN';
    const displayTags = objective?.tags || [];

    setEditData({
      title: displayTitle,
      description: displayDescription,
      budget: displayBudget?.toString() || '50000',
      date: displayDate,
      currency: displayCurrency,
      tags: displayTags
    });
    setIsEditOpen(true);
  };

  const handleSave = async (data: {
    title: string;
    description: string;
    budget: string;
    currency: string;
    date: string;
    tags: string[];
  }) => {
    if (!updateObjective) return;
    
    const updates: any = {};
    
    if (data.budget && !isNaN(Number(data.budget))) {
      updates.budget_planned = Number(data.budget);
    }
    
    if (data.date) {
      updates.target_date = data.date;
    }
    
    if (data.title) updates.title = data.title;
    if (data.description) updates.description = data.description;
    if (data.currency) updates.currency = data.currency;
    if (data.tags) updates.tags = data.tags;
    
    const success = await updateObjective(updates);
    if (success) {
      setIsEditOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-success';
      case 'at_risk': return 'text-warning';
      case 'behind': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="bg-surface-1 border-border">
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-8 bg-muted rounded w-96" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (error || !objective) {
    return (
      <Card className="bg-surface-1 border-border">
        <CardHeader>
          <CardTitle className="text-destructive">
            Ошибка загрузки стратегической цели
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const displayTitle = objective?.title || 'ДРОН-ШОУ 2025';
  const displayDescription = objective?.description || '';
  const displayDate = objective?.target_date ? format(new Date(objective.target_date), 'dd MMMM yyyy') : 'Сентябрь 2025';
  const displayBudget = objective?.budget_planned || 50000;
  const displayCurrency = objective?.currency || 'лв';

  return (
    <>
      <Card className="bg-surface-1 border-border">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {loc.strategicGoal}
                </span>
                <div className={`transition-all duration-300 ${
                  syncStatus === 'connected' ? 'text-success' :
                  syncStatus === 'connecting' ? 'text-warning animate-pulse' :
                  'text-destructive'
                }`}>
                  {syncStatus === 'connected' ? <Wifi className="h-4 w-4" /> :
                   syncStatus === 'connecting' ? <Clock className="h-4 w-4" /> :
                   <WifiOff className="h-4 w-4" />}
                </div>
                <StatusChip variant="ready" className="text-xs ml-auto">
                  АКТИВНА
                </StatusChip>
              </div>
              <h1 className="text-xl font-bold text-foreground mb-4">
                Провести впечатляющее демонстрационное дрон-шоу для высокопоставленных гостей и 
                заключить ключевой контракт стоимостью несколько миллионов левов
              </h1>
            </div>
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                onClick={handleEditOpen}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{loc.location}:</span>
              <span className="font-mono">Timarevo Airfield (43°23'20.2"N 26°53'07.6"E)</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{loc.budget}:</span>
              <span className="font-mono">{displayBudget.toLocaleString()} {displayCurrency}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{loc.format}:</span>
              <span>19:30-20:30 (закат + ночные эффекты)</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{loc.technologies}:</span>
              <span>Модульная трансформация дрона</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Дата:</span>
              <span className="font-mono">Сентябрь 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{loc.safety}:</span>
              <span>Медицинская команда + пожарная машина</span>
            </div>
          </div>

          {/* Стратегическое значение */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">{loc.strategicImportance}:</h3>
            <p className="text-sm text-muted-foreground">
              Переломный момент для превращения Tiger Technology в признанного игрока с многомиллионными контрактами!
            </p>
          </div>

          {/* Ключевые результаты */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {loc.keyResults}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {keyResults.map((kr, index) => (
                <Card key={kr.id} className="bg-surface-2 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          KR{index + 1}
                        </Badge>
                        <span className="text-sm font-semibold text-foreground">
                          {kr.title}
                        </span>
                      </div>
                      <StatusChip 
                        variant={kr.status === 'on_track' ? 'ready' : kr.status === 'at_risk' ? 'warning' : 'critical'}
                        className="text-xs"
                      >
                        on_track
                      </StatusChip>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {kr.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{loc.progress}</span>
                        <span className={getStatusColor(kr.status)}>
                          {kr.progress}%
                        </span>
                      </div>
                      <Progress value={kr.progress} className="h-1" />
                      
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">{loc.target}:</span>
                          <span className="font-mono">{kr.targets.target}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">{loc.current}:</span>
                          <span className="font-mono">{kr.targets.current}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <StrategicObjectiveEditor
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        title={editData.title}
        description={editData.description}
        budget={editData.budget}
        currency={editData.currency}
        date={editData.date}
        tags={editData.tags}
        onSave={handleSave}
        onCancel={() => setIsEditOpen(false)}
        syncStatus={syncStatus}
        saveStatus={saveStatus}
        localized={loc}
      />
    </>
  );
}