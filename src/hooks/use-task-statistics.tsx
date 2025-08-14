import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface TaskStatistics {
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  totalTasks: number;
}

export const useTaskStatistics = () => {
  const [statistics, setStatistics] = useState<TaskStatistics>({
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    highPriorityTasks: 0,
    totalTasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStatistics = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get user profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Build query based on user role
      let query = supabase.from('tasks').select('*');
      
      if (profile.role !== 'admin') {
        // Non-admin users can only see their own tasks or assigned tasks
        query = query.or(`created_by.eq.${profile.id},assigned_to.eq.${profile.id}`);
      }

      const { data: tasks, error: tasksError } = await query;

      if (tasksError) throw tasksError;

      const now = new Date();
      
      const stats: TaskStatistics = {
        completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
        inProgressTasks: tasks?.filter(t => t.status === 'in_progress').length || 0,
        overdueTasks: tasks?.filter(t => {
          if (!t.due_date || t.status === 'completed') return false;
          return new Date(t.due_date) < now;
        }).length || 0,
        highPriorityTasks: tasks?.filter(t => 
          (t.priority === 'high' || t.priority === 'critical') && t.status !== 'completed'
        ).length || 0,
        totalTasks: tasks?.length || 0
      };

      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching task statistics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();

    // Set up real-time subscription for task changes
    const channel = supabase
      .channel('task-statistics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchStatistics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    statistics,
    isLoading,
    error,
    refetch: fetchStatistics
  };
};