import { useState, useCallback } from 'react';
import { TaskService, Task, CreateTaskData } from '@/services/taskService';
import { useToast } from '@/hooks/use-toast';

export const useTaskService = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const taskService = new TaskService();

  const withLoading = useCallback(async (
    operation: () => Promise<any>,
    successMessage?: string
  ): Promise<any | null> => {
    setLoading(true);
    try {
      const result = await operation();
      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      return result;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    
    // Task operations
    getTasks: () => withLoading(() => taskService.getTasks()),
    
    getTaskById: (id: string) => withLoading(() => taskService.getTaskById(id)),
    
    createTask: (taskData: CreateTaskData) => 
      withLoading(
        () => taskService.createTask(taskData),
        'Task created successfully'
      ),
    
    updateTask: (id: string, updates: Partial<CreateTaskData>) => 
      withLoading(
        () => taskService.updateTask(id, updates),
        'Task updated successfully'
      ),
    
    deleteTask: (id: string) => 
      withLoading(
        () => taskService.deleteTask(id),
        'Task deleted successfully'
      ),
    
    updateTaskStatus: (id: string, status: Task['status']) => 
      withLoading(
        () => taskService.updateTaskStatus(id, status),
        'Task status updated'
      )
  };
};