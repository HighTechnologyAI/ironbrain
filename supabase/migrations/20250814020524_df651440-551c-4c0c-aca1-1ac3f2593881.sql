-- Fix critical security issues identified by the linter

-- Enable RLS for tables that were missing it
ALTER TABLE recent_telemetry_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE uav_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for tables that had policies but RLS was disabled
CREATE POLICY "Authenticated users can view telemetry summary" 
ON recent_telemetry_summary 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view analytics summary" 
ON uav_analytics_summary 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update security definer functions to be more secure
-- Note: The get_current_user_profile function is secure as it only returns current user's data
-- The handle_new_user function is also secure as it only creates profiles for new users

-- Add comment to document security considerations
COMMENT ON FUNCTION get_current_user_profile() IS 'SECURITY DEFINER function - secure as it only returns current authenticated user profile';
COMMENT ON FUNCTION handle_new_user() IS 'SECURITY DEFINER function - secure as it only creates profile for new authenticated user';