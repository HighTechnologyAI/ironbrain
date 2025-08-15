import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StrategicObjectiveEditor from "./StrategicObjectiveEditor";
import { useStrategy, STRATEGIC_TITLE } from "@/hooks/use-strategy";
import { useLanguage } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { Calendar, Wallet, Edit3, Target, TrendingUp, Wifi, WifiOff, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { StatusChip } from "@/components/ui/status-chip";

export default function StrategicBanner() {
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
  
  const localized = {
    ru: {
      title: 'ДРОН-ШОУ 2025',
      description: 'Демонстрация передовых технологий Tiger Technology для заключения многомиллионного контракта',
      date: '20 августа 2025, 19:30',
      editTitle: 'Редактировать стратегическую цель',
      saveChanges: 'Сохранить изменения',
      cancel: 'Отмена',
      titleLabel: 'Название',
      descriptionLabel: 'Описание',
      budgetLabel: 'Бюджет (лв)',
      dateLabel: 'Дата',
      strategicGoal: 'Стратегическая цель',
      tagsLabel: 'Теги',
      addTag: 'Добавить тег...'
    },
    en: {
      title: 'DRONE SHOW 2025',
      description: 'Demonstration of Tiger Technology advanced capabilities for multi-million contract',
      date: 'August 20, 2025, 7:30 PM',
      editTitle: 'Edit Strategic Objective',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      titleLabel: 'Title',
      descriptionLabel: 'Description',
      budgetLabel: 'Budget (BGN)',
      dateLabel: 'Date',
      strategicGoal: 'Strategic Goal',
      tagsLabel: 'Tags',
      addTag: 'Add tag...'
    },
    bg: {
      title: 'ДРОН ШОУ 2025',
      description: 'Демонстрация на напредналите възможности на Tiger Technology за многомилионен договор',
      date: '20 август 2025, 19:30',
      editTitle: 'Редактиране на стратегическа цел',
      saveChanges: 'Запази промените',
      cancel: 'Отказ',
      titleLabel: 'Заглавие',
      descriptionLabel: 'Описание',
      budgetLabel: 'Бюджет (лв)',
      dateLabel: 'Дата',
      strategicGoal: 'Стратегическа цел',
      tagsLabel: 'Етикети',
      addTag: 'Добави етикет...'
    }
  } as const;
  
  const isStrategic = objective?.title === STRATEGIC_TITLE;
  const loc = (localized as any)[language] || localized.ru;

  // Force re-render when objective updates
  useEffect(() => {
    if (objective) {
      console.log('📊 Strategic Banner updated with new objective:', objective.title);
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
      budget: displayBudget?.toString() || '75000',
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
    
    // Parse budget if it's a number
    if (data.budget && !isNaN(Number(data.budget))) {
      updates.budget_planned = Number(data.budget);
    }
    
    // Handle date in DD.MM.YYYY format - let useStrategy handle UTC conversion
    if (data.date) {
      updates.target_date = data.date; // Pass directly, hook will handle conversion
    }
    
    // Update all fields
    if (data.title) updates.title = data.title;
    if (data.description) updates.description = data.description;
    if (data.currency) updates.currency = data.currency;
    if (data.tags) updates.tags = data.tags;
    
    const success = await updateObjective(updates);
    if (success) {
      setIsEditOpen(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-surface-1 border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-32 mb-2" />
            <div className="h-6 bg-muted rounded w-24" />
          </div>
          <Target className="h-5 w-5 text-primary" />
        </CardHeader>
      </Card>
    );
  }

  if (error || !objective) {
    return (
      <Card className="bg-surface-1 border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
            {loc.strategicGoal}
          </CardTitle>
          <Target className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-foreground">
            {error || 'Цель не найдена'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayTitle = objective.title;
  const displayDescription = objective.description || loc.description;
  const displayDate = objective.target_date ? format(new Date(objective.target_date), 'dd.MM.yyyy') : null;
  const displayBudget = objective.budget_planned;
  const displayCurrency = objective.currency || 'BGN';
  const displayTags = objective.tags || [];

  return (
    <>
      <Card className="bg-surface-1 border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
            {loc.strategicGoal}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Sync Status Indicator */}
            <div className={`transition-all duration-300 ${
              syncStatus === 'connected' ? 'text-success' :
              syncStatus === 'connecting' ? 'text-warning animate-pulse' :
              'text-destructive'
            }`}>
              {syncStatus === 'connected' ? <Wifi className="h-4 w-4" /> :
               syncStatus === 'connecting' ? <Clock className="h-4 w-4" /> :
               <WifiOff className="h-4 w-4" />}
            </div>
            <Target className="h-5 w-5 text-primary" />
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-primary opacity-70 hover:opacity-100 transition-opacity"
                onClick={handleEditOpen}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-foreground mb-2" key={objective?.id || 'loading'}>
            {objective?.title || loc.title}
          </div>
          <div className="flex items-center justify-between mt-2 mb-3">
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success font-semibold">В работе</span>
            </div>
            <StatusChip variant="ready" className="text-xs">
              {(() => {
                switch (objective.status) {
                  case 'planned': return 'ПЛАНИРУЕТСЯ';
                  case 'active': return 'АКТИВНО';
                  case 'done': return 'ЗАВЕРШЕНО';
                  case 'on_hold': return 'НА ПАУЗЕ';
                  default: return 'АКТИВНО';
                }
              })()}
            </StatusChip>
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {displayDescription}
          </p>
          
          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {displayTags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {displayDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary" />
                <span className="font-mono">{displayDate}</span>
              </div>
            )}
            {displayBudget != null && (
              <div className="flex items-center gap-1">
                <Wallet className="h-3 w-3 text-primary" />
                <span className="font-mono">{displayBudget.toLocaleString()} {displayCurrency}</span>
              </div>
            )}
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