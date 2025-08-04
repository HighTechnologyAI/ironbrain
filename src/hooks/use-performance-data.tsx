import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalTeamMembers: number;
  activeTeamMembers: number;
  totalAchievements: number;
  totalProjects: number;
  totalIssues: number;
  performance: number;
  weeklyGrowth: {
    tasks: number;
    team: number;
    achievements: number;
    projects: number;
    issues: number;
  };
}

export const usePerformanceData = () => {
  const [data, setData] = useState<PerformanceData>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalTeamMembers: 0,
    activeTeamMembers: 0,
    totalAchievements: 0,
    totalProjects: 0,
    totalIssues: 0,
    performance: 0,
    weeklyGrowth: {
      tasks: 0,
      team: 0,
      achievements: 0,
      projects: 0,
      issues: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        
        // Получаем статистику по задачам
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('status, created_at, completed_at, due_date');
        
        if (tasksError) throw tasksError;

        // Получаем данные о команде
        const { data: teamData, error: teamError } = await supabase
          .from('profiles')
          .select('is_active, created_at');
        
        if (teamError) throw teamError;

        // Получаем данные о достижениях
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('created_at');
        
        if (achievementsError) throw achievementsError;

        // Получаем данные о проектах
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('created_at');
        
        if (projectsError) throw projectsError;

        // Получаем данные о проблемах
        const { data: issuesData, error: issuesError } = await supabase
          .from('issues')
          .select('created_at');
        
        if (issuesError) throw issuesError;

        // Обрабатываем данные
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalTasks = tasksData?.length || 0;
        const completedTasks = tasksData?.filter(task => task.status === 'completed').length || 0;
        const pendingTasks = tasksData?.filter(task => task.status === 'pending').length || 0;
        const inProgressTasks = tasksData?.filter(task => task.status === 'in_progress').length || 0;
        
        // Подсчет просроченных задач
        const overdueTasks = tasksData?.filter(task => 
          task.due_date && 
          new Date(task.due_date) < now && 
          task.status !== 'completed'
        ).length || 0;

        const totalTeamMembers = teamData?.length || 0;
        const activeTeamMembers = teamData?.filter(member => member.is_active).length || 0;
        const totalAchievements = achievementsData?.length || 0;
        const totalProjects = projectsData?.length || 0;
        const totalIssues = issuesData?.length || 0;

        // Подсчет роста за неделю
        const weeklyTasks = tasksData?.filter(task => 
          new Date(task.created_at) > weekAgo
        ).length || 0;
        
        const weeklyTeam = teamData?.filter(member => 
          new Date(member.created_at) > weekAgo
        ).length || 0;
        
        const weeklyAchievements = achievementsData?.filter(achievement => 
          new Date(achievement.created_at) > weekAgo
        ).length || 0;

        const weeklyProjects = projectsData?.filter(project => 
          new Date(project.created_at) > weekAgo
        ).length || 0;

        const weeklyIssues = issuesData?.filter(issue => 
          new Date(issue.created_at) > weekAgo
        ).length || 0;

        // Расчет производительности (выполненные задачи / общее количество задач * 100)
        const performance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        setData({
          totalTasks,
          completedTasks,
          pendingTasks: pendingTasks + inProgressTasks,
          overdueTasks,
          totalTeamMembers,
          activeTeamMembers,
          totalAchievements,
          totalProjects,
          totalIssues,
          performance,
          weeklyGrowth: {
            tasks: weeklyTasks,
            team: weeklyTeam,
            achievements: weeklyAchievements,
            projects: weeklyProjects,
            issues: weeklyIssues
          }
        });

      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
    
    // Подписываемся на real-time обновления
    const tasksChannel = supabase.channel('performance-tasks-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'tasks' }, 
          () => fetchPerformanceData()
      )
      .subscribe();

    const profilesChannel = supabase.channel('performance-profiles-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles' }, 
          () => fetchPerformanceData()
      )
      .subscribe();

    const achievementsChannel = supabase.channel('performance-achievements-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'achievements' }, 
          () => fetchPerformanceData()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(achievementsChannel);
    };
  }, []);

  return { data, loading, error };
};