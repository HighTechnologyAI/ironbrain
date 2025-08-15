-- Add key_result field to tasks table to link tasks to specific KRs
ALTER TABLE tasks ADD COLUMN key_result text;

-- Add index for better performance
CREATE INDEX idx_tasks_key_result ON tasks(key_result);

-- Add comment for documentation
COMMENT ON COLUMN tasks.key_result IS 'Links task to specific Key Result (kr1, kr2, kr3, kr4)';