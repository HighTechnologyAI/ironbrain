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

export default function StrategicBanner() {
  const { loading, error, objective } = useStrategy(true);
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
      description: 'Демонстрация передовых технологий Tiger Technology',
      date: '20 августа 2025, 19:30',
      editTitle: 'Редактировать стратегическую цель',
      saveChanges: 'Сохранить изменения',
      cancel: 'Отмена',
      titleLabel: 'Название',
      descriptionLabel: 'Описание',
      budgetLabel: 'Бюджет (лв)',
      dateLabel: 'Дата'
    },
    en: {
      title: 'DRONE SHOW 2025',
      description: 'Demonstration of Tiger Technology advanced capabilities',
      date: 'August 20, 2025, 7:30 PM',
      editTitle: 'Edit Strategic Objective',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      titleLabel: 'Title',
      descriptionLabel: 'Description',
      budgetLabel: 'Budget (BGN)',
      dateLabel: 'Date'
    },
    bg: {
      title: 'ДРОН ШОУ 2025',
      description: 'Демонстрация на напредналите възможности на Tiger Technology',
      date: '20 август 2025, 19:30',
      editTitle: 'Редактиране на стратегическа цел',
      saveChanges: 'Запази промените',
      cancel: 'Отказ',
      titleLabel: 'Заглавие',
      descriptionLabel: 'Описание',
      budgetLabel: 'Бюджет (лв)',
      dateLabel: 'Дата'
    }
  } as const;
  
  const isStrategic = objective?.title === STRATEGIC_TITLE;
  const loc = (localized as any)[language] || localized.ru;

  const handleEditOpen = () => {
    setEditData({
      title: displayTitle,
      description: displayDescription || loc.description,
      budget: displayBudget?.toString() || '75000',
      date: displayDate || loc.date
    });
    setIsEditOpen(true);
  };

  const handleSave = () => {
    // Здесь будет логика сохранения в базу данных
    console.log('Saving:', editData);
    setIsEditOpen(false);
  };

  if (loading) {
    return (
      <Card className="bg-surface-1 border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-32 mb-2" />
            <div className="h-6 bg-muted rounded w-24" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (error || !objective) {
    return (
      <Card className="bg-surface-1 border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {error || 'Стратегическая цель не найдена'}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const displayTitle = isStrategic ? loc.title : objective.title;
  const displayDescription = isStrategic ? loc.description : (objective.description || loc.description);
  const displayDate = isStrategic ? loc.date : (objective.target_date ? format(new Date(objective.target_date), 'dd.MM.yyyy') : null);
  const displayBudget = objective.budget_planned;

  return (
    <>
      <Card className="bg-surface-1 border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
            Стратегическая цель
          </CardTitle>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {isAdmin && (
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">{loc.descriptionLabel}</Label>
                      <Textarea 
                        id="description"
                        value={editData.description}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget">{loc.budgetLabel}</Label>
                      <Input 
                        id="budget"
                        type="number"
                        value={editData.budget}
                        onChange={(e) => setEditData(prev => ({ ...prev, budget: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">{loc.dateLabel}</Label>
                      <Input 
                        id="date"
                        value={editData.date}
                        onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                      />
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
              <span className="text-success font-semibold">В процессе</span>
            </div>
            <Badge 
              variant="outline" 
              className="border-primary/30 bg-primary/5 text-primary text-xs"
            >
              {(() => {
                switch (objective.status) {
                  case 'planned': return 'ПЛАНИРУЕТСЯ';
                  case 'active': return 'АКТИВНО';
                  case 'done': return 'ЗАВЕРШЕНО';
                  case 'on_hold': return 'НА ПАУЗЕ';
                  default: return 'АКТИВНО';
                }
              })()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {displayDescription}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {displayDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary" />
                <span>{displayDate}</span>
              </div>
            )}
            {displayBudget != null && (
              <div className="flex items-center gap-1">
                <Wallet className="h-3 w-3 text-primary" />
                <span>{displayBudget.toLocaleString()} лв</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}