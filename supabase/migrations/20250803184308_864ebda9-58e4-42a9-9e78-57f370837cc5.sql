-- Create enums for better data consistency
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.employee_role AS ENUM ('admin', 'manager', 'employee', 'intern');
CREATE TYPE public.issue_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.achievement_type AS ENUM ('individual', 'team', 'company');

-- Create profiles table for employee data
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    position TEXT,
    role employee_role DEFAULT 'employee',
    department TEXT,
    phone TEXT,
    telegram_username TEXT,
    avatar_url TEXT,
    hire_date DATE DEFAULT CURRENT_DATE,
    salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create companies table for client data
CREATE TABLE public.companies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    industry TEXT,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'pending',
    priority task_priority DEFAULT 'medium',
    assigned_to UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id),
    company_id UUID REFERENCES public.companies(id),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type achievement_type DEFAULT 'individual',
    employee_id UUID REFERENCES public.profiles(id),
    task_id UUID REFERENCES public.tasks(id),
    company_id UUID REFERENCES public.companies(id),
    points INTEGER DEFAULT 0,
    reward_amount DECIMAL(10,2),
    achievement_date DATE DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create issues table for problems tracking
CREATE TABLE public.issues (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    severity issue_severity DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    reported_by UUID REFERENCES public.profiles(id),
    assigned_to UUID REFERENCES public.profiles(id),
    task_id UUID REFERENCES public.tasks(id),
    company_id UUID REFERENCES public.companies(id),
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create task history for tracking changes
CREATE TABLE public.task_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES public.profiles(id),
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create employee performance tracking
CREATE TABLE public.employee_performance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.profiles(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    tasks_overdue INTEGER DEFAULT 0,
    total_hours DECIMAL(8,2) DEFAULT 0,
    achievement_points INTEGER DEFAULT 0,
    performance_rating DECIMAL(3,2) CHECK (performance_rating >= 1.0 AND performance_rating <= 5.0),
    feedback TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(employee_id, period_start, period_end)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view active profiles" ON public.profiles
    FOR SELECT USING (is_active = true);

-- Companies policies
CREATE POLICY "Authenticated users can view companies" ON public.companies
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create companies" ON public.companies
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles));

-- Tasks policies
CREATE POLICY "Users can view tasks assigned to them" ON public.tasks
    FOR SELECT USING (
        assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles));

CREATE POLICY "Users can update tasks assigned to them" ON public.tasks
    FOR UPDATE USING (
        assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Achievements policies
CREATE POLICY "Users can view their achievements" ON public.achievements
    FOR SELECT USING (
        employee_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create achievements" ON public.achievements
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles));

-- Issues policies
CREATE POLICY "Users can view issues they reported or assigned to" ON public.issues
    FOR SELECT USING (
        reported_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create issues" ON public.issues
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles));

-- Task history policies
CREATE POLICY "Users can view task history for their tasks" ON public.task_history
    FOR SELECT USING (
        task_id IN (
            SELECT id FROM public.tasks WHERE 
            assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
            created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

-- Employee performance policies
CREATE POLICY "Users can view their own performance" ON public.employee_performance
    FOR SELECT USING (employee_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        'employee'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX idx_achievements_employee_id ON public.achievements(employee_id);
CREATE INDEX idx_issues_assigned_to ON public.issues(assigned_to);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_task_history_task_id ON public.task_history(task_id);