// Centralized configuration service
// Replaces scattered VITE_* variables and config files

import { APP_CONFIG } from '@/config/app-config';

export class ConfigService {
  // Feature flags consolidated
  static readonly features = {
    opsCenter: true, // Replaced VITE_FEATURE_OPS_CENTER
    missionControl: true, // Replaced VITE_FEATURE_MISSION_CONTROL
    fleet: true, // Replaced VITE_FEATURE_FLEET
    commandCenter: true, // Replaced VITE_FEATURE_COMMAND_CENTER
    logs: true, // Replaced VITE_FEATURE_LOGS
    neonUI: false, // Replaced VITE_UI_V2_ENABLED
  };

  // UI configuration
  static readonly ui = {
    defaultLanguage: APP_CONFIG.ui.defaultLanguage,
    supportedLanguages: APP_CONFIG.ui.supportedLanguages,
    accentColor: '#16C172', // Replaced VITE_UI_V2_ACCENT
  };

  // API endpoints
  static readonly api = {
    supabase: {
      url: APP_CONFIG.supabase.url,
      anonKey: APP_CONFIG.supabase.anonKey,
      projectId: APP_CONFIG.supabase.projectId,
    },
  };

  // Check if feature is enabled
  static isFeatureEnabled(feature: keyof typeof ConfigService.features): boolean {
    return ConfigService.features[feature];
  }

  // Get UI configuration
  static getUIConfig() {
    return ConfigService.ui;
  }

  // Get API configuration
  static getAPIConfig() {
    return ConfigService.api;
  }
}