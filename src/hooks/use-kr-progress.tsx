import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KRProgress {
  kr1: number; // Успешное проведение шоу - задачи по подготовке шоу
  kr2: number; // VIP-аудитория - задачи по работе с гостями
  kr3: number; // Ключевой контракт - задачи по продажам
  kr4: number; // Медиа-охват - задачи по маркетингу
}

export function useKRProgress() {
  const [progress, setProgress] = useState<KRProgress>({
    kr1: 0,
    kr2: 0,
    kr3: 0,
    kr4: 0
  });
  const [loading, setLoading] = useState(true);

  const calculateProgress = async () => {
    try {
      // Получаем все задачи
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, title, status, tags')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      if (!tasks) return;

      // Категории задач для каждого KR
      const krCategories = {
        kr1: ['шоу', 'дрон', 'перфоманс', 'программа', 'демонстрация', 'выступление'],
        kr2: ['vip', 'гости', 'министр', 'делегация', 'приглашение', 'аудитория'],
        kr3: ['контракт', 'продажи', 'клиент', 'договор', 'сделка', 'партнер'],
        kr4: ['медиа', 'пресса', 'публикация', 'реклама', 'маркетинг', 'сми']
      };

      // Подсчитываем прогресс для каждого KR
      const newProgress: KRProgress = { kr1: 0, kr2: 0, kr3: 0, kr4: 0 };

      Object.entries(krCategories).forEach(([kr, keywords]) => {
        // Фильтруем задачи по ключевым словам
        const relevantTasks = tasks.filter(task => {
          const titleLower = task.title.toLowerCase();
          const tagsLower = (task.tags || []).join(' ').toLowerCase();
          const searchText = `${titleLower} ${tagsLower}`;
          
          return keywords.some(keyword => searchText.includes(keyword));
        });

        if (relevantTasks.length > 0) {
          const completedTasks = relevantTasks.filter(task => 
            task.status === 'completed'
          );
          
          newProgress[kr as keyof KRProgress] = Math.round(
            (completedTasks.length / relevantTasks.length) * 100
          );
        }
      });

      setProgress(newProgress);
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

  return { progress, loading, refresh: calculateProgress };
}