-- First, let's update the tasks that reference demo profiles to set them to NULL
-- or delete them if they are demo tasks
UPDATE tasks SET assigned_to = NULL WHERE assigned_to IN (
  SELECT id FROM profiles WHERE user_id IS NULL
);

UPDATE tasks SET created_by = NULL WHERE created_by IN (
  SELECT id FROM profiles WHERE user_id IS NULL
);

-- Delete tasks that have both created_by and assigned_to as NULL (demo tasks)
DELETE FROM tasks WHERE created_by IS NULL AND assigned_to IS NULL;

-- Delete other related data
DELETE FROM task_comments WHERE user_id IN (
  SELECT id FROM profiles WHERE user_id IS NULL
);

DELETE FROM task_participants WHERE user_id IN (
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

-- Finally, delete demo profiles
DELETE FROM profiles WHERE user_id IS NULL;