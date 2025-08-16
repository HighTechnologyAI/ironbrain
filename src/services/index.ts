// Central services configuration for Tiger CRM
// Consolidates all service imports and exports

export { supabase } from '@/integrations/supabase/client';
export * from './authService';
export * from './missionService';
export * from './droneService';
export * from './configService';