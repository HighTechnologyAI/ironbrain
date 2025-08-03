-- Create enum types for better data integrity
CREATE TYPE public.employee_status AS ENUM ('active', 'inactive', 'on_leave', 'terminated');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'on_hold', 'cancelled');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.problem_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.problem_severity AS ENUM ('minor', 'moderate', 'major', 'critical');
CREATE TYPE public.achievement_type AS ENUM ('project_completion', 'performance_milestone', 'innovation', 'leadership', 'teamwork', 'sales_target', 'quality_improvement');

-- Companies table
CREATE TABLE public.companies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employees/Users profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    company_id UUID REFERENCES public.companies(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position TEXT,
    department TEXT,
    hire_date DATE,
    status employee_status NOT NULL DEFAULT 'active',
    manager_id UUID REFERENCES public.profiles(id),
    avatar_url TEXT,
    bio TEXT,
    skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'planning',
    budget DECIMAL(15,2),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    project_id UUID REFERENCES public.projects(id),
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'pending',
    priority task_priority NOT NULL DEFAULT 'medium',
    assigned_to UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Problems/Issues table
CREATE TABLE public.problems (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    project_id UUID REFERENCES public.projects(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status problem_status NOT NULL DEFAULT 'open',
    severity problem_severity NOT NULL DEFAULT 'moderate',
    reported_by UUID REFERENCES public.profiles(id) NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id),
    resolved_by UUID REFERENCES public.profiles(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Achievements table
CREATE TABLE public.achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    employee_id UUID REFERENCES public.profiles(id) NOT NULL,
    project_id UUID REFERENCES public.projects(id),
    title TEXT NOT NULL,
    description TEXT,
    type achievement_type NOT NULL,
    points INTEGER DEFAULT 0,
    awarded_by UUID REFERENCES public.profiles(id),
    awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance metrics table
CREATE TABLE public.performance_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    employee_id UUID REFERENCES public.profiles(id) NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    target_value DECIMAL(10,4),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Task comments table for collaboration
CREATE TABLE public.task_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view their company" ON public.companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view company colleagues" ON public.profiles
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for projects
CREATE POLICY "Users can view company projects" ON public.projects
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create projects for their company" ON public.projects
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for tasks
CREATE POLICY "Users can view company tasks" ON public.tasks
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks for their company" ON public.tasks
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks in their company" ON public.tasks
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for problems
CREATE POLICY "Users can view company problems" ON public.problems
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create problems for their company" ON public.problems
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for achievements
CREATE POLICY "Users can view company achievements" ON public.achievements
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for performance metrics
CREATE POLICY "Users can view company performance metrics" ON public.performance_metrics
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for task comments
CREATE POLICY "Users can view task comments for company tasks" ON public.task_comments
    FOR SELECT USING (
        task_id IN (
            SELECT id FROM public.tasks WHERE company_id IN (
                SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create comments on company tasks" ON public.task_comments
    FOR INSERT WITH CHECK (
        task_id IN (
            SELECT id FROM public.tasks WHERE company_id IN (
                SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_problems_updated_at
    BEFORE UPDATE ON public.problems
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample company
INSERT INTO public.companies (name, description, industry) 
VALUES ('Tiger Technology AI', 'High-tech AI solutions company focused on innovative technology development', 'Artificial Intelligence');

-- Create indexes for better performance
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_problems_company_id ON public.problems(company_id);
CREATE INDEX idx_achievements_employee_id ON public.achievements(employee_id);