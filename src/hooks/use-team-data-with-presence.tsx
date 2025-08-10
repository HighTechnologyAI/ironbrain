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

  useEffect(() => {
    if (teamMembers.length > 0) {
      setTeamMembers(prevMembers => 
        prevMembers.map(member => {
          const online = member.id && isOnline(member.id);
          const status: 'online' | 'away' | 'offline' = online ? 'online' : 'offline';
          return { ...member, status };
        })
      );
    }
  }, [isOnline, teamMembers.length]);

  return { teamMembers, loading, error };
};