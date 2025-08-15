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
  tags: string[] | null;
  currency: string | null;
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
  updateObjective?: (updates: {
    title?: string;
    description?: string;
    budget_planned?: number;
    target_date?: string;
    tags?: string[];
    currency?: string;
  }) => Promise<boolean>;
}

export const STRATEGIC_TITLE = "ДРОН-ШОУ 2025: Переломный момент для Tiger Technology - заключение многомиллионного контракта через демонстрацию передовых технологий";

export function useStrategy(autoSeed = true): UseStrategyReturn {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objective, setObjective] = useState<Objective | null>(null);
  const [krs, setKrs] = useState<KeyResult[]>([]);

  useEffect(() => {
    let isMounted = true;

    // Set up real-time subscription for objectives updates
    const channel = supabase
      .channel('objectives-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'objectives',
          filter: `title=eq.${STRATEGIC_TITLE}`
        },
        (payload) => {
          if (isMounted) {
            if (payload.eventType === 'UPDATE' && payload.new) {
              setObjective(payload.new as Objective);
            } else if (payload.eventType === 'INSERT' && payload.new) {
              setObjective(payload.new as Objective);
            } else if (payload.eventType === 'DELETE' && payload.old) {
              // If our objective was deleted, reload
              window.location.reload();
            }
          }
        }
      )
      .subscribe();

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

        // load existing objective by title (take the latest one if multiple exist)
        const { data: existingObjs, error: loadErr } = await supabase
          .from('objectives')
          .select('*')
          .eq('title', STRATEGIC_TITLE)
          .order('created_at', { ascending: false })
          .limit(1);

        const existingObj = existingObjs?.[0] || null;

        if (loadErr) throw loadErr;

        let obj = existingObj as Objective | null;

        // seed if none
        if (!obj && autoSeed && profile?.id) {
            const { data: insertedObj, error: insErr } = await supabase
              .from('objectives')
              .insert({
                title: STRATEGIC_TITLE,
                description: `🎯 ГЛАВНАЯ ЦЕЛЬ: Дрон-шоу как демонстрация силы технологий Tiger\n📍 Локация: Timarevo Airfield (43°23'20.2"N 26°53'07.6"E)\n💰 Бюджет: 75,000 лв (увеличен для максимального эффекта)\n⏰ Дата и время: 20 августа 2025, 19:30-21:00\n🚁 Технологии: Модульная трансформация + ИИ-управление\n🔥 Спецэффекты: Пиротехника, лазеры, голограммы\n👥 VIP-гости: Министры, инвесторы, международные партнеры\n🛡️ Безопасность: Полный пакет (медики, пожарные, охрана)\n⚡ РЕЗУЛЬТАТ: Контракт 3+ млн лв + статус ведущего поставщика`,
                target_date: '2025-08-20',
                location: 'Timarevo Airfield, Bulgaria',
                budget_planned: 75000,
                strategic_importance: 'Ключевая демонстрация для получения статуса ведущего технологического поставщика и заключения многомиллионных государственных контрактов',
                status: 'active',
                created_by: profile.id,
              })
            .select('*')
            .single();
          if (insErr) throw insErr;
          obj = insertedObj as Objective;

          // seed KRs для дрон-шоу
          const krsToInsert = [
            {
              objective_id: obj.id,
              title: '🎪 KR1: Безукоризненное шоу-представление',
              description: '60-минутная программа: болгарский флаг → Tiger logo → военные маневры → пожаротушение → финальная трансформация с пиротехникой. Полная автономность ИИ-системы',
              progress: 25,
              target_value: 100,
              current_value: 25,
              unit: '% готовности',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
            {
              objective_id: obj.id,
              title: '👑 KR2: Элитная VIP-аудитория 25+',
              description: 'Министры обороны и экономики, CEO крупных корпораций, зарубежные военные представители, ведущие инвесторы. Персональное VIP-сопровождение каждого гостя',
              progress: 15,
              target_value: 25,
              current_value: 8,
              unit: 'VIP-гостей',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
            {
              objective_id: obj.id,
              title: '💎 KR3: Мегаконтракт 3+ млн лв',
              description: 'Государственный или корпоративный контракт на поставку систем безопасности. 40%+ предоплата, 3-летнее сотрудничество, потенциал расширения до 10+ млн лв',
              progress: 5,
              target_value: 3,
              current_value: 0,
              unit: 'млн лв',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
            {
              objective_id: obj.id,
              title: '📺 KR4: Вирусное медиа-покрытие 250K+',
              description: 'Прямые трансляции на национальных каналах, YouTube-документальный фильм 500K+ просмотров, международные технологические издания, 100+ B2B лидов',
              progress: 10,
              target_value: 250000,
              current_value: 15000,
              unit: 'охват',
              owner_id: ownerId,
              status: 'on_track',
              created_by: profile.id,
            },
            {
              objective_id: obj.id,
              title: '🚁 KR5: Технологическое превосходство',
              description: 'Демонстрация уникальных возможностей: модульная трансформация в реальном времени, ИИ-навигация в сложных условиях, интеграция с существующими системами безопасности',
              progress: 40,
              target_value: 100,
              current_value: 40,
              unit: '% готовности',
              owner_id: ownerId,
              status: 'ahead',
              created_by: profile.id,
            },
          ];

          const { error: krsErr } = await supabase.from('key_results').insert(krsToInsert as any);
          if (krsErr) throw krsErr;
        }

        // fetch objective and KRs
        if (obj) {
          // ensure target date matches requested 20/08/2025
          if (obj.target_date !== '2025-08-20') {
            try {
              await supabase.from('objectives').update({ target_date: '2025-08-20' }).eq('id', obj.id);
              obj = { ...obj, target_date: '2025-08-20' };
            } catch {}
          }

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
    return () => { 
      isMounted = false; 
      supabase.removeChannel(channel);
    };
  }, [user, autoSeed]);

  const updateObjective = async (updates: {
    title?: string;
    description?: string;
    budget_planned?: number;
    target_date?: string;
    tags?: string[];
    currency?: string;
  }) => {
    if (!objective) return false;
    
    try {
      const { error } = await supabase
        .from('objectives')
        .update(updates)
        .eq('id', objective.id);
      
      if (error) throw error;
      
      // Update local state immediately for better UX
      setObjective(prev => prev ? { ...prev, ...updates } : null);
      
      // Clear any previous errors
      setError(null);
      
      return true;
    } catch (e: any) {
      console.error('Error updating objective:', e);
      setError(e.message || 'Update error');
      return false;
    }
  };

  return { loading, error, objective, krs, updateObjective };
}
