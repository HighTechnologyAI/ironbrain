import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface Objective {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  location: string | null;
  budget_planned: number | null;
  strategic_importance: string | null;
  status: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  description: string | null;
  progress: number;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  owner_id: string | null;
  status: string;
}

interface UseStrategyReturn {
  loading: boolean;
  error: string | null;
  objective: Objective | null;
  krs: KeyResult[];
}

const STRATEGIC_TITLE = "Провести впечатляющее демонстрационное дрон-шоу для высокопоставленных гостей и заключить ключевой контракт стоимостью несколько миллионов левов";

export function useStrategy(autoSeed = true): UseStrategyReturn {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objective, setObjective] = useState<Objective | null>(null);
  const [krs, setKrs] = useState<KeyResult[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        setLoading(true);
        setError(null);
        if (!user) {
          setLoading(false);
          return;
        }

        // current profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('user_id', user.id)
          .maybeSingle();

        // find admin owner
        let ownerId: string | null = null;
        if (profile?.role === 'admin') ownerId = profile.id;
        if (!ownerId) {
          const { data: adminProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();
          ownerId = adminProfile?.id || profile?.id || null;
        }

        // load existing objective by title
        const { data: existingObj, error: loadErr } = await supabase
          .from('objectives')
          .select('*')
          .eq('title', STRATEGIC_TITLE)
          .maybeSingle();

        if (loadErr) throw loadErr;

        let obj = existingObj as Objective | null;

        // seed if none
        if (!obj && autoSeed && profile?.id) {
          const { data: insertedObj, error: insErr } = await supabase
            .from('objectives')
            .insert({
              title: STRATEGIC_TITLE,
              description: `Локация: Timarevo Airfield (43°23'20.2"N 26°53'07.6"E)\nБюджет: 50,000 лв\nФормат: 19:30-20:30 (закат + ночные эффекты)\nТехнологии: Модульная трансформация дрона\nДата: Август 2025\nБезопасность: Медицинская команда + пожарная машина\nСтратегическое значение: Переломный момент для превращения Tiger Technology в признанного игрока с многомиллионными контрактами!`,
              target_date: '2025-08-15',
              location: 'Timarevo Airfield (43°23\'20.2"N 26°53\'07.6"E)',
              budget_planned: 50000,
              strategic_importance: 'Переломный момент для выхода на многомиллионные контракты',
              status: 'active',
              created_by: profile.id,
            })
            .select('*')
            .single();
          if (insErr) throw insErr;
          obj = insertedObj as Objective;

          // seed KRs
          const krsToInsert = [
            {
              objective_id: obj.id,
              title: 'KR1: Успешное проведение шоу',
              description: '45-минутная программа, болгарский флаг → логотип Tiger, 3 этапа пожаротушения, военная трансформация с взрывом, полная автономность ИИ',
              progress: 0,
              target_value: 1,
              current_value: 0,
              unit: 'show',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
            {
              objective_id: obj.id,
              title: 'KR2: VIP-аудитория 20+',
              description: 'Министры, руководители служб, зарубежные представители, инвесторы; VIP-сопровождение',
              progress: 0,
              target_value: 20,
              current_value: 0,
              unit: 'guests',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
            {
              objective_id: obj.id,
              title: 'KR3: Ключевой контракт 2+ млн лв',
              description: 'Гос. или корпоративный клиент, 30%+ предоплата, долгосрочное партнерство, потенциал +50%',
              progress: 0,
              target_value: 2,
              current_value: 0,
              unit: 'M BGN',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
            {
              objective_id: obj.id,
              title: 'KR4: Медиа-охват 100,000+',
              description: '5+ публикаций в нац. СМИ, документальный фильм, международное признание, 50+ лидов',
              progress: 0,
              target_value: 100000,
              current_value: 0,
              unit: 'reach',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
          ];

          const { error: krsErr } = await supabase.from('key_results').insert(krsToInsert as any);
          if (krsErr) throw krsErr;
        }

        // fetch objective and KRs
        if (obj) {
          const { data: krsData } = await supabase
            .from('key_results')
            .select('*')
            .eq('objective_id', obj.id)
            .order('title');

          if (isMounted) {
            setObjective(obj);
            setKrs((krsData || []) as KeyResult[]);
          }
        }
      } catch (e: any) {
        if (isMounted) setError(e.message || 'Strategy load error');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();
    return () => { isMounted = false; };
  }, [user, autoSeed]);

  return { loading, error, objective, krs };
}
