import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KRProgress {
  kr1: number; // Успешное проведение шоу - задачи по подготовке шоу
  kr2: number; // VIP-аудитория - задачи по работе с гостями
  kr3: number; // Ключевой контракт - задачи по продажам
  kr4: number; // Медиа-охват - задачи по маркетингу
}

interface KRStats {
  total: number;
  completed: number;
  progress: number;
}

export function useKRProgress() {
  const [progress, setProgress] = useState<KRProgress>({
    kr1: 0,
    kr2: 0,
    kr3: 0,
    kr4: 0
  });
  const [stats, setStats] = useState<Record<string, KRStats>>({
    kr1: { total: 0, completed: 0, progress: 0 },
    kr2: { total: 0, completed: 0, progress: 0 },
    kr3: { total: 0, completed: 0, progress: 0 },
    kr4: { total: 0, completed: 0, progress: 0 }
  });
  const [loading, setLoading] = useState(true);

  const calculateProgress = async () => {
    try {
      // Получаем все задачи с полем key_result
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, status, key_result')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      if (!tasks) return;

      // Подсчитываем прогресс для каждого KR
      const newProgress: KRProgress = { kr1: 0, kr2: 0, kr3: 0, kr4: 0 };
      const newStats: Record<string, KRStats> = {
        kr1: { total: 0, completed: 0, progress: 0 },
        kr2: { total: 0, completed: 0, progress: 0 },
        kr3: { total: 0, completed: 0, progress: 0 },
        kr4: { total: 0, completed: 0, progress: 0 }
      };

      ['kr1', 'kr2', 'kr3', 'kr4'].forEach(kr => {
        // Фильтруем задачи по полю key_result
        const relevantTasks = tasks.filter(task => task.key_result === kr);
        const completedTasks = relevantTasks.filter(task => 
          task.status === 'completed'
        );

        const total = relevantTasks.length;
        const completed = completedTasks.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        newProgress[kr as keyof KRProgress] = progress;
        newStats[kr] = { total, completed, progress };
      });

      setProgress(newProgress);
      setStats(newStats);
    } catch (error) {
      console.error('Error calculating KR progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateProgress();

    // Подписываемся на изменения в таблице задач
    const channel = supabase
      .channel('kr-progress-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          calculateProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { progress, stats, loading, refresh: calculateProgress };
}