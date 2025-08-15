-- Add new fields to objectives table for enhanced functionality
ALTER TABLE objectives 
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BGN';

-- Enable realtime for objectives table to sync changes across users
ALTER TABLE objectives REPLICA IDENTITY FULL;

-- Add objectives table to realtime publication
DO $$ 
BEGIN
  -- Add table to realtime publication if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'objectives'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE objectives;
  END IF;
END $$;