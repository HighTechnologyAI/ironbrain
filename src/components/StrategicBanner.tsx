import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStrategy, STRATEGIC_TITLE } from "@/hooks/use-strategy";
import { useLanguage } from "@/hooks/use-language";
import { Calendar, MapPin, Wallet } from "lucide-react";
import { format } from "date-fns";

export default function StrategicBanner() {
  const { loading, error, objective, krs } = useStrategy(true);
  const { t, language } = useLanguage();
  const localized = {
    ru: {
      title: 'Провести впечатляющее демонстрационное дрон-шоу для высокопоставленных гостей и заключить ключевой контракт стоимостью несколько миллионов левов',
      description: 'Локация: Timarevo Airfield (43°23\'20.2"N 26°53\'07.6"E)\nБюджет: 50,000 лв\nФормат: 19:30–20:30 (закат + ночные эффекты)\nТехнологии: Модульная трансформация дрона\nДата: Сентябрь 2025\nБезопасность: Медицинская команда + пожарная машина\nСтратегическое значение: Переломный момент для превращения Tiger Technology в признанного игрока с многомиллионными контрактами!',
      krTitles: ['KR1: Успешное проведение шоу','KR2: VIP-аудитория 20+','KR3: Ключевой контракт 2+ млн лв','KR4: Медиа-охват 100,000+'],
      krDescriptions: [
        '45-минутная программа, болгарский флаг → логотип Tiger, 3 этапа пожаротушения, военная трансформация с взрывом, полная автономность ИИ',
        'Министры, руководители служб, зарубежные представители, инвесторы; VIP-сопровождение',
        'Гос. или корпоративный клиент, 30%+ предоплата, долгосрочное партнерство, потенциал +50%',
        '5+ публикаций в нац. СМИ, документальный фильм, международное признание, 50+ лидов',
      ],
    },
    en: {
      title: 'Deliver an impressive demo drone show for VIP guests and sign a multi-million BGN key contract',
      description: 'Location: Timarevo Airfield (43°23\'20.2"N 26°53\'07.6"E)\nBudget: 50,000 BGN\nFormat: 19:30–20:30 (sunset + night effects)\nTechnology: Modular drone transformation\nDate: September 2025\nSafety: Medical team + fire truck\nStrategic impact: A turning point to position Tiger Technology as a recognized player with multi-million contracts!',
      krTitles: ['KR1: Successful show execution','KR2: VIP audience 20+','KR3: Key contract 2+ M BGN','KR4: Media reach 100,000+'],
      krDescriptions: [
        '45-minute program, Bulgarian flag → Tiger logo, 3 fire-extinguishing stages, military transformation with a real blast, full AI autonomy',
        '20+ VIPs: ministers, agency heads, foreign representatives, investors; VIP hosting',
        'Sign a 2+ M BGN contract: government or corporate, 30%+ prepayment, long-term partnership, +50% expansion potential',
        '100,000+ reach: 5+ national media publications, documentary film, international recognition, 50+ new leads',
      ],
    },
    bg: {
      title: 'Провеждане на впечатляващо демонстрационно дрон шоу за VIP гости и подписване на ключов договор за няколко милиона лева',
      description: 'Локация: Timarevo Airfield (43°23\'20.2"N 26°53\'07.6"E)\nБюджет: 50 000 лв\nФормат: 19:30–20:30 (залез + нощни ефекти)\nТехнологии: Модулна трансформация на дрона\nДата: септември 2025\nБезопасност: Медицински екип + пожарна кола\nСтратегическо значение: Поворотен момент за позициониране на Tiger Technology като признат играч с многомилионни договори!',
      krTitles: ['KR1: Успешно провеждане на шоуто','KR2: VIP аудитория 20+','KR3: Ключов договор 2+ млн. лв.','KR4: Медийно покритие 100 000+'],
      krDescriptions: [
        '45‑минутна програма, българското знаме → логото на Tiger, 3 етапа пожарогасене, военна трансформация с взрив, пълна автономност на ИИ',
        '20+ VIP: министри, ръководители на служби, чуждестранни представители, инвеститори; VIP съпровождане',
        'Подписан договор за 2+ млн. лв.: държавен или корпоративен клиент, 30%+ аванс, дългосрочно партньорство, потенциал +50%',
        '100 000+ обхват: 5+ публикации в национални медии, документален филм, международно признание, 50+ нови лийда',
      ],
    }
  } as const;
  const isStrategic = objective?.title === STRATEGIC_TITLE;
  const loc = (localized as any)[language] || localized.ru;

  if (loading) {
    return (
      <Card className="mb-8 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl">{t.strategicLoadingTitle}</CardTitle>
          <CardDescription className="text-muted-foreground">{t.strategicLoadingDesc}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error || !objective) {
    return (
      <Card className="mb-8 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl">{t.strategicFocusTitle}</CardTitle>
          <CardDescription className="text-muted-foreground">{error || t.strategicNotFound}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const displayTitle = isStrategic ? loc.title : objective.title;
  const displayDescription = isStrategic ? loc.description : objective.description;

  return (
    <Card className="mb-8 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent border-primary/30">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <CardTitle className="text-xl sm:text-2xl leading-snug break-words hyphens-auto">{displayTitle}</CardTitle>
            {displayDescription && (
              <CardDescription className="mt-2 whitespace-pre-line text-sm sm:text-base break-words">{displayDescription}</CardDescription>
            )}
        <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
          {objective.location && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" />{t.location}: {objective.location}</span>
          )}
          {objective.target_date && (
            <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4 text-primary" />{t.targetDate}: {format(new Date(objective.target_date), 'dd/MM/yyyy')}</span>
          )}
          {objective.budget_planned != null && (
            <span className="inline-flex items-center gap-1"><Wallet className="h-4 w-4 text-primary" />{t.strategicBudgetPlanned}: {objective.budget_planned.toLocaleString()} лв</span>
          )}
        </div>
          </div>
          <Badge variant="outline" className="h-7 w-fit sm:self-start bg-primary/10 text-primary border-primary/30 mt-2 sm:mt-0">{t.strategicStatus}: {(() => {
            switch (objective.status) {
              case 'planned': return t.statusPlanned;
              case 'active': return t.statusActive;
              case 'done': return t.statusDone;
              case 'on_hold': return t.statusOnHold;
              default: return objective.status;
            }
          })()}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {krs.map((kr, idx) => (
            <div key={kr.id} className="rounded-lg border bg-card p-3 sm:p-4 shadow-sm hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-medium text-foreground leading-tight text-sm sm:text-base">{isStrategic ? (loc.krTitles[idx] ?? kr.title) : kr.title}</div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 text-[10px] sm:text-xs">{kr.status}</Badge>
              </div>
              {(isStrategic ? (loc.krDescriptions[idx] ?? kr.description) : kr.description) && (
                <div className="text-xs text-muted-foreground line-clamp-4 sm:line-clamp-3 mb-3">{isStrategic ? (loc.krDescriptions[idx] ?? kr.description) : kr.description}</div>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{t.strategicProgress}</span>
                <span className="font-mono text-foreground">{kr.progress}%</span>
              </div>
              <Progress value={kr.progress} />
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-muted-foreground">
                <span>{t.strategicTarget}: <span className="text-foreground font-mono">{kr.target_value ?? '-'} {kr.unit || ''}</span></span>
                <span>{t.strategicCurrent}: <span className="text-foreground font-mono">{kr.current_value ?? 0} {kr.unit || ''}</span></span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
