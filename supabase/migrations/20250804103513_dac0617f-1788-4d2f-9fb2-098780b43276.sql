-- Создание таблицы уведомлений
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task_invitation', 'chat_invitation', 'general', 'admin_announcement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID
);

-- Включаем RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'admin'::employee_role)
  OR 
  auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id)
);

-- Триггер для обновления updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Создание таблицы приглашений в чат
CREATE TABLE public.chat_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  inviter_id UUID NOT NULL,
  invited_user_id UUID NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Включаем RLS для приглашений
ALTER TABLE public.chat_invitations ENABLE ROW LEVEL SECURITY;

-- Политики для приглашений
CREATE POLICY "Users can view invitations for them or sent by them" 
ON public.chat_invitations 
FOR SELECT 
USING (
  invited_user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR 
  inviter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Task creators can send invitations" 
ON public.chat_invitations 
FOR INSERT 
WITH CHECK (
  inviter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  AND
  task_id IN (
    SELECT id FROM tasks WHERE created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Invited users can update invitation status" 
ON public.chat_invitations 
FOR UPDATE 
USING (invited_user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Индексы для производительности
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_chat_invitations_invited_user ON public.chat_invitations(invited_user_id);
CREATE INDEX idx_chat_invitations_task_id ON public.chat_invitations(task_id);