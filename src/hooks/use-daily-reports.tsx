import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface DailyReport {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  teamOnline: number;
  achievements: Array<{
    employee: string;
    achievement: string;
  }>;
  issues: Array<{
    title: string;
    priority: string;
  }>;
  recommendations: string[];
}

export const useDailyReports = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateDailyReport = async (): Promise<DailyReport> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Получаем данные за сегодня
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      const { data: achievements } = await supabase
        .from('achievements')
        .select('*, employee:profiles!achievements_employee_id_fkey(full_name)')
        .gte('created_at', `${today}T00:00:00`);

      const { data: issues } = await supabase
        .from('issues')
        .select('title, severity')
        .eq('status', 'open');

      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const totalTasks = tasks?.length || 0;

      const report: DailyReport = {
        date: today,
        tasksCompleted: completedTasks,
        tasksTotal: totalTasks,
        teamOnline: 0, // Будет заполнено из presence
        achievements: achievements?.map(a => ({
          employee: a.employee?.full_name || 'Unknown',
          achievement: a.title
        })) || [],
        issues: issues?.map(i => ({
          title: i.title,
          priority: i.severity
        })) || [],
        recommendations: [
          'Рассмотрите перераспределение задач с высоким приоритетом',
          'Запланируйте встречу команды для обсуждения блокеров',
          'Обновите статусы задач перед концом дня'
        ]
      };

      return report;
    } catch (error) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  };

  const scheduleDailyReport = () => {
    const now = new Date();
    const target = new Date();
    target.setHours(22, 0, 0, 0); // 22:00

    // Если время уже прошло, планируем на следующий день
    if (now > target) {
      target.setDate(target.getDate() + 1);
    }

    const timeUntilReport = target.getTime() - now.getTime();

    setTimeout(async () => {
      if (user) {
        const report = await generateDailyReport();
        setReports(prev => [report, ...prev]);
        
        // Планируем следующий отчет через 24 часа
        setInterval(async () => {
          const newReport = await generateDailyReport();
          setReports(prev => [newReport, ...prev.slice(0, 6)]); // Храним только последние 7 отчетов
        }, 24 * 60 * 60 * 1000);
      }
    }, timeUntilReport);
  };

  useEffect(() => {
    if (user) {
      scheduleDailyReport();
    }
  }, [user]);

  return {
    reports,
    generateDailyReport,
    loading
  };
};