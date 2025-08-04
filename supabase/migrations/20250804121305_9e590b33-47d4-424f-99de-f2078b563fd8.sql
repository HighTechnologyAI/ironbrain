-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active'::text,
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  created_by UUID REFERENCES public.profiles(id),
  company_id UUID,
  progress INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view projects" 
ON public.projects 
FOR SELECT 
USING (
  (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())) OR
  true -- Allow viewing all projects for now
);

CREATE POLICY "Users can create projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update projects they created" 
ON public.projects 
FOR UPDATE 
USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add trigger for timestamps
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.projects (name, description, status, created_by, progress)
SELECT 
  'Тестовый проект', 
  'Описание тестового проекта', 
  'active', 
  id, 
  25
FROM public.profiles 
LIMIT 1;