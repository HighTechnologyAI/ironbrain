-- Create table to persist AI chat messages per task and user
create table public.task_ai_messages (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  user_id uuid not null,
  is_bot boolean not null default false,
  content text not null,
  language text,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.task_ai_messages enable row level security;

-- Indexes for fast lookups
create index idx_task_ai_messages_task_user on public.task_ai_messages (task_id, user_id, created_at);

-- Policy: Users can view messages for tasks they have access to
create policy "Users can view AI messages for accessible tasks"
  on public.task_ai_messages
  for select
  using (
    (
      task_id in (
        select t.id from public.tasks t
        where (
          t.assigned_to in (select p.id from public.profiles p where p.user_id = auth.uid())
          or t.created_by in (select p.id from public.profiles p where p.user_id = auth.uid())
        )
      )
    )
    or (
      task_id in (
        select tp.task_id
        from public.task_participants tp
        join public.profiles p on p.id = tp.user_id
        where p.user_id = auth.uid()
      )
    )
  );

-- Policy: Users can insert their own messages for accessible tasks
create policy "Users can insert their own AI messages"
  on public.task_ai_messages
  for insert
  with check (
    user_id in (select p.id from public.profiles p where p.user_id = auth.uid())
    and (
      task_id in (
        select t.id from public.tasks t
        where (
          t.assigned_to in (select p.id from public.profiles p where p.user_id = auth.uid())
          or t.created_by in (select p.id from public.profiles p where p.user_id = auth.uid())
        )
      )
      or task_id in (
        select tp.task_id
        from public.task_participants tp
        join public.profiles p on p.id = tp.user_id
        where p.user_id = auth.uid()
      )
    )
  );
