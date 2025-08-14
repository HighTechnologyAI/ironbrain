import { supabase } from '@/integrations/supabase/client';
import { validateUserInput } from '@/utils/security';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string;
  created_at: string;
  estimated_hours: number;
  actual_hours: number;
  tags: string[];
  language?: string | null;
  assigned_to: {
    id: string;
    full_name: string;
    position: string;
  };
  created_by: {
    id: string;
    full_name: string;
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
  assigned_to: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: Date;
  estimated_hours?: number;
  tags?: string;
}

export class TaskService {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to:profiles!tasks_assigned_to_fkey(id, full_name, position),
        created_by:profiles!tasks_created_by_fkey(id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return data || [];
  }

  async getTaskById(id: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to:profiles!tasks_assigned_to_fkey(id, full_name, position),
        created_by:profiles!tasks_created_by_fkey(id, full_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch task: ${error.message}`);
    }

    return data;
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    // Validate input data
    const titleValidation = validateUserInput(taskData.title);
    const descriptionValidation = taskData.description ? validateUserInput(taskData.description) : null;
    
    if (!titleValidation.isValid) {
      throw new Error(`Invalid title: ${titleValidation.error}`);
    }
    
    if (descriptionValidation && !descriptionValidation.isValid) {
      throw new Error(`Invalid description: ${descriptionValidation.error}`);
    }

    const sanitizedData = {
      title: titleValidation.sanitized,
      description: descriptionValidation?.sanitized || null,
      assigned_to: taskData.assigned_to,
      priority: taskData.priority,
      due_date: taskData.due_date?.toISOString(),
      estimated_hours: taskData.estimated_hours || null,
      tags: taskData.tags ? taskData.tags.split(',').map(tag => tag.trim()) : []
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(sanitizedData)
      .select(`
        *,
        assigned_to:profiles!tasks_assigned_to_fkey(id, full_name, position),
        created_by:profiles!tasks_created_by_fkey(id, full_name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return data;
  }

  async updateTask(id: string, updates: Partial<CreateTaskData>): Promise<Task> {
    const sanitizedUpdates: any = {};
    
    if (updates.title) {
      const titleValidation = validateUserInput(updates.title);
      if (!titleValidation.isValid) {
        throw new Error(`Invalid title: ${titleValidation.error}`);
      }
      sanitizedUpdates.title = titleValidation.sanitized;
    }
    
    if (updates.description) {
      const descriptionValidation = validateUserInput(updates.description);
      if (!descriptionValidation.isValid) {
        throw new Error(`Invalid description: ${descriptionValidation.error}`);
      }
      sanitizedUpdates.description = descriptionValidation.sanitized;
    }
    
    if (updates.assigned_to) sanitizedUpdates.assigned_to = updates.assigned_to;
    if (updates.priority) sanitizedUpdates.priority = updates.priority;
    if (updates.due_date) sanitizedUpdates.due_date = updates.due_date.toISOString();
    if (updates.estimated_hours !== undefined) sanitizedUpdates.estimated_hours = updates.estimated_hours;
    if (updates.tags) sanitizedUpdates.tags = updates.tags.split(',').map(tag => tag.trim());

    const { data, error } = await supabase
      .from('tasks')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select(`
        *,
        assigned_to:profiles!tasks_assigned_to_fkey(id, full_name, position),
        created_by:profiles!tasks_created_by_fkey(id, full_name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return data;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  async updateTaskStatus(id: string, status: Task['status']): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        assigned_to:profiles!tasks_assigned_to_fkey(id, full_name, position),
        created_by:profiles!tasks_created_by_fkey(id, full_name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update task status: ${error.message}`);
    }

    return data;
  }
}