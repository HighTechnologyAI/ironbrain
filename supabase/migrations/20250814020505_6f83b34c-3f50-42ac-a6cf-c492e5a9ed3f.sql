-- Add configuration for AI processing queue function
ALTER TABLE ai_analysis_history ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;
ALTER TABLE ai_analysis_history ADD COLUMN IF NOT EXISTS queue_status TEXT DEFAULT 'pending';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_priority ON ai_analysis_history(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_queue_status ON ai_analysis_history(queue_status);

-- Update the supabase realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE ai_analysis_history;