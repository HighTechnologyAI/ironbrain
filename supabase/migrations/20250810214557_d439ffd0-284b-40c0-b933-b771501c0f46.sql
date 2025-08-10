-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-files', 'task-files', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: users can upload files for tasks they have access to
CREATE POLICY "Task files upload by authorized users"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'task-files'
  AND (
    ((storage.foldername(name))[1])::uuid IN (
      SELECT t.id
      FROM public.tasks t
      WHERE t.assigned_to = (public.get_current_user_profile()).id
         OR t.created_by = (public.get_current_user_profile()).id
      UNION
      SELECT tp.task_id FROM public.task_participants tp
      WHERE tp.user_id = (public.get_current_user_profile()).id
    )
  )
);

-- Policy: users can read files for tasks they have access to
CREATE POLICY "Task files selectable by authorized users"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'task-files'
  AND (
    ((storage.foldername(name))[1])::uuid IN (
      SELECT t.id
      FROM public.tasks t
      WHERE t.assigned_to = (public.get_current_user_profile()).id
         OR t.created_by = (public.get_current_user_profile()).id
      UNION
      SELECT tp.task_id FROM public.task_participants tp
      WHERE tp.user_id = (public.get_current_user_profile()).id
    )
  )
);

-- Policy: users can delete their own uploads or files for tasks they have access to
CREATE POLICY "Task files delete by owners or authorized users"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'task-files'
  AND (
    owner = auth.uid()
    OR ((storage.foldername(name))[1])::uuid IN (
      SELECT t.id
      FROM public.tasks t
      WHERE t.assigned_to = (public.get_current_user_profile()).id
         OR t.created_by = (public.get_current_user_profile()).id
      UNION
      SELECT tp.task_id FROM public.task_participants tp
      WHERE tp.user_id = (public.get_current_user_profile()).id
    )
  )
);