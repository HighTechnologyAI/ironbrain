-- Delete demo profiles (all profiles without user_id are demo profiles)
DELETE FROM profiles WHERE user_id IS NULL;

-- Also clean up any demo-related tasks, comments, etc.
DELETE FROM task_comments WHERE user_id IN (
  SELECT id FROM profiles WHERE user_id IS NULL
);

DELETE FROM task_participants WHERE user_id IN (
  SELECT id FROM profiles WHERE user_id IS NULL
);

DELETE FROM tasks WHERE created_by IN (
  SELECT id FROM profiles WHERE user_id IS NULL
) OR assigned_to IN (
  SELECT id FROM profiles WHERE user_id IS NULL
);

DELETE FROM achievements WHERE employee_id IN (
  SELECT id FROM profiles WHERE user_id IS NULL
) OR created_by IN (
  SELECT id FROM profiles WHERE user_id IS NULL
);

DELETE FROM issues WHERE reported_by IN (
  SELECT id FROM profiles WHERE user_id IS NULL
) OR assigned_to IN (
  SELECT id FROM profiles WHERE user_id IS NULL
);