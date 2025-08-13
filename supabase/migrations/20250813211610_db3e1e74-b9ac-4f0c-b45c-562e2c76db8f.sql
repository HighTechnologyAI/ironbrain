-- Enable RLS on critical tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks table
CREATE POLICY "Users can view all tasks" ON public.tasks FOR SELECT USING (true);

CREATE POLICY "Users can insert their own tasks" ON public.tasks 
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update tasks they created or are assigned to" ON public.tasks 
FOR UPDATE USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  auth.uid() IN (SELECT user_id FROM task_participants WHERE task_id = tasks.id)
);

CREATE POLICY "Users can delete tasks they created" ON public.tasks 
FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for task_comments table
CREATE POLICY "Users can view comments on tasks they have access to" ON public.task_comments 
FOR SELECT USING (
  task_id IN (
    SELECT id FROM tasks WHERE 
    created_by = auth.uid() OR 
    assigned_to = auth.uid() OR
    id IN (SELECT task_id FROM task_participants WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can insert comments on accessible tasks" ON public.task_comments 
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  task_id IN (
    SELECT id FROM tasks WHERE 
    created_by = auth.uid() OR 
    assigned_to = auth.uid() OR
    id IN (SELECT task_id FROM task_participants WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own comments" ON public.task_comments 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.task_comments 
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for profiles table
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles 
FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);