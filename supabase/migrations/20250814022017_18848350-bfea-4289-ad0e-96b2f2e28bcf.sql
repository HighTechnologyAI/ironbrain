-- Create AI assistant logs table if not exists
CREATE TABLE IF NOT EXISTS public.ai_assistant_logs(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  event text,                 -- 'transcript','command','error','diagnostics'
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create AI commands queue table if not exists
CREATE TABLE IF NOT EXISTS public.ai_commands_queue(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL,
  args jsonb,
  status text DEFAULT 'queued', -- queued|running|done|failed
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_assistant_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_commands_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_assistant_logs
CREATE POLICY "Users can view their own AI logs" 
ON public.ai_assistant_logs 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own AI logs" 
ON public.ai_assistant_logs 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- RLS policies for ai_commands_queue
CREATE POLICY "Users can view their own commands" 
ON public.ai_commands_queue 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own commands" 
ON public.ai_commands_queue 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own commands" 
ON public.ai_commands_queue 
FOR UPDATE 
USING (user_id = auth.uid());