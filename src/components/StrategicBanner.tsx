import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStrategy, STRATEGIC_TITLE } from "@/hooks/use-strategy";
import { useLanguage } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { Calendar, Wallet, Edit3 } from "lucide-react";
import { format } from "date-fns";

export default function StrategicBanner() {
  const { loading, error, objective } = useStrategy(true);
  const { t, language } = useLanguage();
  const { isAdmin } = useAdmin();
  
  const localized = {
    ru: {
      title: 'ДРОН-ШОУ 2025',
      date: '20 августа 2025, 19:30'
    },
    en: {
      title: 'DRONE SHOW 2025',
      date: 'August 20, 2025, 7:30 PM'
    },
    bg: {
      title: 'ДРОН ШОУ 2025',
      date: '20 август 2025, 19:30'
    }
  } as const;
  
  const isStrategic = objective?.title === STRATEGIC_TITLE;
  const loc = (localized as any)[language] || localized.ru;

  if (loading) {
    return (
      <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-2" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (error || !objective) {
    return (
      <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg text-muted-foreground">
            {error || 'Стратегическая цель не найдена'}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const displayTitle = isStrategic ? loc.title : objective.title;
  const displayDate = isStrategic ? loc.date : (objective.target_date ? format(new Date(objective.target_date), 'dd.MM.yyyy') : null);
  const displayBudget = objective.budget_planned;

  return (
    <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl font-light tracking-tight text-foreground mb-6">
              {displayTitle}
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-6 text-sm text-muted-foreground">
              {displayDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-mono">{displayDate}</span>
                </div>
              )}
              
              {displayBudget != null && (
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="font-mono">{displayBudget.toLocaleString()} лв</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className="border-primary/30 bg-primary/5 text-primary font-normal"
            >
              {(() => {
                switch (objective.status) {
                  case 'planned': return 'Планируется';
                  case 'active': return 'Активно';
                  case 'done': return 'Завершено';
                  case 'on_hold': return 'На паузе';
                  default: return objective.status;
                }
              })()}
            </Badge>
            
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}