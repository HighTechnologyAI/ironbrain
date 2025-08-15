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
      title: 'ДРОН-ШОУ 2025: Переломный момент для Tiger Technology - заключение многомиллионного контракта через демонстрацию передовых технологий',
      description: '🎯 ГЛАВНАЯ ЦЕЛЬ: Дрон-шоу как демонстрация силы технологий Tiger\n📍 Локация: Timarevo Airfield (43°23\'20.2"N 26°53\'07.6"E)\n💰 Бюджет: 75,000 лв (увеличен для максимального эффекта)\n⏰ Дата и время: 20 августа 2025, 19:30-21:00\n🚁 Технологии: Модульная трансформация + ИИ-управление\n🔥 Спецэффекты: Пиротехника, лазеры, голограммы\n👥 VIP-гости: Министры, инвесторы, международные партнеры\n🛡️ Безопасность: Полный пакет (медики, пожарные, охрана)\n⚡ РЕЗУЛЬТАТ: Контракт 3+ млн лв + статус ведущего поставщика',
      krTitles: ['🎪 KR1: Безукоризненное шоу-представление','👑 KR2: Элитная VIP-аудитория 25+','💎 KR3: Мегаконтракт 3+ млн лв','📺 KR4: Вирусное медиа-покрытие 250K+','🚁 KR5: Технологическое превосходство'],
      krDescriptions: [
        '60-минутная программа: болгарский флаг → Tiger logo → военные маневры → пожаротушение → финальная трансформация с пиротехникой. Полная автономность ИИ-системы',
        'Министры обороны и экономики, CEO крупных корпораций, зарубежные военные представители, ведущие инвесторы. Персональное VIP-сопровождение каждого гостя',
        'Государственный или корпоративный контракт на поставку систем безопасности. 40%+ предоплата, 3-летнее сотрудничество, потенциал расширения до 10+ млн лв',
        'Прямые трансляции на национальных каналах, YouTube-документальный фильм 500K+ просмотров, международные технологические издания, 100+ B2B лидов',
        'Демонстрация уникальных возможностей: модульная трансформация в реальном времени, ИИ-навигация в сложных условиях, интеграция с существующими системами безопасности',
      ],
    },
    en: {
      title: 'DRONE SHOW 2025: Tiger Technology\'s breakthrough moment - securing multi-million contract through advanced tech demonstration',
      description: '🎯 MAIN OBJECTIVE: Drone show as demonstration of Tiger Technology power\n📍 Location: Timarevo Airfield (43°23\'20.2"N 26°53\'07.6"E)\n💰 Budget: 75,000 BGN (increased for maximum impact)\n⏰ Date & Time: August 20, 2025, 7:30PM-9:00PM\n🚁 Technology: Modular transformation + AI control\n🔥 Special effects: Pyrotechnics, lasers, holograms\n👥 VIP guests: Ministers, investors, international partners\n🛡️ Security: Full package (medics, firefighters, security)\n⚡ OUTCOME: 3+ M BGN contract + leading supplier status',
      krTitles: ['🎪 KR1: Flawless show performance','👑 KR2: Elite VIP audience 25+','💎 KR3: Mega contract 3+ M BGN','📺 KR4: Viral media coverage 250K+','🚁 KR5: Technological superiority'],
      krDescriptions: [
        '60-minute program: Bulgarian flag → Tiger logo → military maneuvers → firefighting → final transformation with pyrotechnics. Full AI system autonomy',
        'Defense & Economy Ministers, CEOs of major corporations, foreign military representatives, leading investors. Personal VIP escort for each guest',
        'Government or corporate contract for security systems supply. 40%+ prepayment, 3-year cooperation, expansion potential up to 10+ M BGN',
        'Live broadcasts on national channels, YouTube documentary film 500K+ views, international tech publications, 100+ B2B leads',
        'Demonstration of unique capabilities: real-time modular transformation, AI navigation in complex conditions, integration with existing security systems',
      ],
    },
    bg: {
      title: 'ДРОН ШОУ 2025: Преломен момент за Tiger Technology - сключване на многомилионен договор чрез демонстрация на напреднали технологии',
      description: '🎯 ГЛАВНА ЦЕЛ: Дрон шоу като демонстрация на силата на технологиите на Tiger\n📍 Локация: Timarevo Airfield (43°23\'20.2"N 26°53\'07.6"E)\n💰 Бюджет: 75 000 лв (увеличен за максимален ефект)\n⏰ Дата и час: 20 август 2025, 19:30-21:00\n🚁 Технологии: Модулна трансформация + ИИ управление\n🔥 Специални ефекти: Пиротехника, лазери, холограми\n👥 VIP гости: Министри, инвеститори, международни партньори\n🛡️ Сигурност: Пълен пакет (медици, пожарникари, охрана)\n⚡ РЕЗУЛТАТ: Договор 3+ млн лв + статус на водещ доставчик',
      krTitles: ['🎪 KR1: Безупречно шоу представление','👑 KR2: Елитна VIP аудитория 25+','💎 KR3: Мегадоговор 3+ млн лв','📺 KR4: Вирусно медийно покритие 250K+','🚁 KR5: Технологично превъзходство'],
      krDescriptions: [
        '60-минутна програма: българско знаме → Tiger лого → военни маневри → пожарогасене → финална трансформация с пиротехника. Пълна автономност на ИИ системата',
        'Министри на отбраната и икономиката, CEO на големи корпорации, чуждестранни военни представители, водещи инвеститори. Персонално VIP съпровождане за всеки гост',
        'Държавен или корпоративен договор за доставка на системи за сигурност. 40%+ авансово плащане, 3-годишно сътрудничество, потенциал за разширяване до 10+ млн лв',
        'Преки предавания по национални канали, YouTube документален филм 500K+ гледания, международни технологични издания, 100+ B2B лийда',
        'Демонстрация на уникални възможности: модулна трансформация в реално време, ИИ навигация в сложни условия, интеграция със съществуващи системи за сигурност',
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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
