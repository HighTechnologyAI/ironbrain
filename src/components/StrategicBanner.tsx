import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useStrategy, STRATEGIC_TITLE } from "@/hooks/use-strategy";
import { useLanguage } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { Calendar, Wallet, Edit3, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { StatusChip } from "@/components/ui/status-chip";

export default function StrategicBanner() {
  const { loading, error, objective, updateObjective } = useStrategy(true);
  const { t, language } = useLanguage();
  const { isAdmin } = useAdmin();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    budget: '',
    date: ''
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
      strategicGoal: 'Стратегическая цель'
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
      strategicGoal: 'Strategic Goal'
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
      strategicGoal: 'Стратегическа цел'
    }
  } as const;
  
  const isStrategic = objective?.title === STRATEGIC_TITLE;
  const loc = (localized as any)[language] || localized.ru;

  const handleEditOpen = () => {
    const displayTitle = isStrategic ? loc.title : objective?.title || '';
    const displayDescription = isStrategic ? loc.description : (objective?.description || loc.description);
    const displayDate = isStrategic ? loc.date : (objective?.target_date ? format(new Date(objective.target_date), 'dd.MM.yyyy') : '');
    const displayBudget = objective?.budget_planned;

    setEditData({
      title: displayTitle,
      description: displayDescription,
      budget: displayBudget?.toString() || '75000',
      date: displayDate
    });
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!updateObjective) return;
    
    const updates: any = {};
    
    // Parse budget if it's a number
    if (editData.budget && !isNaN(Number(editData.budget))) {
      updates.budget_planned = Number(editData.budget);
    }
    
    // Parse date if it's provided
    if (editData.date) {
      try {
        // Try to parse the date in different formats
        const dateStr = editData.date;
        let parsedDate: Date;
        
        if (dateStr.includes(',')) {
          // Format like "20 августа 2025, 19:30"
          const [datePart] = dateStr.split(',');
          parsedDate = new Date(datePart.trim());
        } else {
          parsedDate = new Date(dateStr);
        }
        
        if (!isNaN(parsedDate.getTime())) {
          updates.target_date = parsedDate.toISOString().split('T')[0];
        }
      } catch (e) {
        console.warn('Could not parse date:', editData.date);
      }
    }
    
    // Only update title and description for non-strategic objectives
    if (!isStrategic) {
      if (editData.title) updates.title = editData.title;
      if (editData.description) updates.description = editData.description;
    }
    
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

  const displayTitle = isStrategic ? loc.title : objective.title;
  const displayDescription = isStrategic ? loc.description : (objective.description || loc.description);
  const displayDate = isStrategic ? loc.date : (objective.target_date ? format(new Date(objective.target_date), 'dd.MM.yyyy, HH:mm') : null);
  const displayBudget = objective.budget_planned;

  return (
    <>
      <Card className="bg-surface-1 border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
            {loc.strategicGoal}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {isAdmin && (
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary opacity-70 hover:opacity-100 transition-opacity"
                    onClick={handleEditOpen}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{loc.editTitle}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">{loc.titleLabel}</Label>
                      <Input 
                        id="title"
                        value={editData.title}
                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">{loc.descriptionLabel}</Label>
                      <Textarea 
                        id="description"
                        value={editData.description}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="budget">{loc.budgetLabel}</Label>
                        <Input 
                          id="budget"
                          type="number"
                          value={editData.budget}
                          onChange={(e) => setEditData(prev => ({ ...prev, budget: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date">{loc.dateLabel}</Label>
                        <Input 
                          id="date"
                          value={editData.date}
                          onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                        {loc.cancel}
                      </Button>
                      <Button onClick={handleSave}>
                        {loc.saveChanges}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-foreground mb-2">
            {displayTitle}
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
                <span className="font-mono">{displayBudget.toLocaleString()} лв</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}