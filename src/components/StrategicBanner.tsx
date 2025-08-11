import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStrategy } from "@/hooks/use-strategy";
import { Calendar, MapPin, Wallet } from "lucide-react";

export default function StrategicBanner() {
  const { loading, error, objective, krs } = useStrategy(true);

  if (loading) {
    return (
      <Card className="mb-8 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl">Загрузка стратегии…</CardTitle>
          <CardDescription className="text-muted-foreground">Получаем цель и ключевые результаты</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error || !objective) {
    return (
      <Card className="mb-8 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl">Стратегический фокус</CardTitle>
          <CardDescription className="text-muted-foreground">{error || 'Стратегическая цель не найдена'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl leading-snug">{objective.title}</CardTitle>
            {objective.description && (
              <CardDescription className="mt-2 whitespace-pre-line">{objective.description}</CardDescription>
            )}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              {objective.location && (
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" />{objective.location}</span>
              )}
              {objective.target_date && (
                <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4 text-primary" />{new Date(objective.target_date).toLocaleDateString()}</span>
              )}
              {objective.budget_planned != null && (
                <span className="inline-flex items-center gap-1"><Wallet className="h-4 w-4 text-primary" />План: {objective.budget_planned.toLocaleString()} лв</span>
              )}
            </div>
          </div>
          <Badge variant="outline" className="h-7 self-start bg-primary/10 text-primary border-primary/30">{objective.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {krs.map((kr) => (
            <div key={kr.id} className="rounded-lg border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-medium text-foreground leading-tight">{kr.title}</div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">{kr.status}</Badge>
              </div>
              {kr.description && (
                <div className="text-xs text-muted-foreground line-clamp-3 mb-3">{kr.description}</div>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Прогресс</span>
                <span className="font-mono text-foreground">{kr.progress}%</span>
              </div>
              <Progress value={kr.progress} />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Цель: <span className="text-foreground font-mono">{kr.target_value ?? '-'} {kr.unit || ''}</span></span>
                <span>Текущее: <span className="text-foreground font-mono">{kr.current_value ?? 0} {kr.unit || ''}</span></span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
