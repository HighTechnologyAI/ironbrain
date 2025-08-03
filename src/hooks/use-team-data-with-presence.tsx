import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserPresence } from '@/hooks/use-user-presence';

export interface TeamMember {
  id: string;
  full_name: string;
  position: string | null;
  department: string | null;
  phone: string | null;
  telegram_username: string | null;
  avatar_url: string | null;
  is_active: boolean;
  hire_date: string | null;
  tasksCompleted: number;
  totalTasks: number;
  achievements: number;
  status: 'online' | 'away' | 'offline';
}

export const useTeamDataWithPresence = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useUserPresence();

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        // Получаем данные о профилях
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_active', true);
        
        if (profilesError) throw profilesError;

        // Получаем задачи для каждого сотрудника
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('assigned_to, status');
        
        if (tasksError) throw tasksError;

        // Получаем достижения для каждого сотрудника
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('employee_id');
        
        if (achievementsError) throw achievementsError;

        // Обрабатываем данные
        const processedMembers: TeamMember[] = profilesData?.map(profile => {
          const userTasks = tasksData?.filter(task => task.assigned_to === profile.id) || [];
          const completedTasks = userTasks.filter(task => task.status === 'completed').length;
          const totalTasks = userTasks.length;
          const userAchievements = achievementsData?.filter(achievement => achievement.employee_id === profile.id).length || 0;
          
          return {
            id: profile.id,
            full_name: profile.full_name,
            position: profile.position,
            department: profile.department,
            phone: profile.phone,
            telegram_username: profile.telegram_username,
            avatar_url: profile.avatar_url,
            is_active: profile.is_active,
            hire_date: profile.hire_date,
            tasksCompleted: completedTasks,
            totalTasks,
            achievements: userAchievements,
            status: 'offline' as const
          };
        }) || [];

        setTeamMembers(processedMembers);

      } catch (err) {
        console.error('Error fetching team data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
    
    // Обновляем данные каждые 60 секунд
    const interval = setInterval(fetchTeamData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Обновляем статусы присутствия отдельно, без перезагрузки всех данных
  useEffect(() => {
    if (teamMembers.length > 0) {
      setTeamMembers(prevMembers => 
        prevMembers.map(member => {
          // Определяем статус присутствия
          let status: 'online' | 'away' | 'offline' = 'offline';
          
          if (member.id && isOnline(member.id)) {
            status = 'online';
          } else {
            // Проверяем время последней активности
            const lastActive = new Date(member.hire_date || Date.now());
            const timeDiff = Date.now() - lastActive.getTime();
            if (timeDiff < 5 * 60 * 1000) { // 5 минут
              status = 'away';
            }
          }
          
          return { ...member, status };
        })
      );
    }
  }, [isOnline, teamMembers.length]);

  return { teamMembers, loading, error };
};