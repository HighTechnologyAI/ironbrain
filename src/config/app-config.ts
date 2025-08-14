// Централизованная конфигурация Tiger CRM
const V = (import.meta as any).env || {};

// Проверяем обязательные переменные окружения
const SUPABASE_URL = V.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = V.VITE_SUPABASE_ANON_KEY;
const SUPABASE_PROJECT_ID = V.VITE_SUPABASE_PROJECT_ID;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_PROJECT_ID) {
  throw new Error('Отсутствуют обязательные переменные окружения Supabase. Проверьте конфигурацию.');
}

export const APP_CONFIG = {
  app: {
    name: 'Tiger CRM',
    version: '1.0.0-beta',
    description: 'Система управления командой и задачами',
    author: 'Tiger CRM Team',
  },
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    projectId: SUPABASE_PROJECT_ID,
  },
  files: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
    bucket: 'task-files',
  },
  ui: {
    defaultLanguage: 'ru',
    supportedLanguages: ['ru', 'bg', 'en', 'uk'],
    theme: { defaultMode: 'system' },
    pagination: { defaultPageSize: 10, maxPageSize: 100 },
  },
  notifications: { enableToasts: true, enableRealtime: true, autoHideTimeout: 5000 },
  tasks: {
    defaultStatus: 'pending',
    defaultPriority: 'medium',
    statuses: ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'],
    priorities: ['low', 'medium', 'high', 'critical'],
    maxDescriptionLength: 2000,
    maxTitleLength: 200,
  },
  comments: { maxLength: 1000, enableMentions: true, enableFileAttachments: true, realTimeUpdates: true },
  roles: {
    default: 'employee',
    available: ['admin', 'manager', 'employee'],
    permissions: { admin: ['all'], manager: ['read', 'write', 'manage_team'], employee: ['read', 'write_own'] },
  },
  api: { timeout: 30000, retryAttempts: 3, retryDelay: 1000 },
  reports: { dailyReportTime: '22:00', enableDailyReports: true, reportFormats: ['json', 'pdf'] },
  integrations: { openai: { enabled: true, model: 'gpt-3.5-turbo', maxTokens: 1000 }, telegram: { enabled: false, botToken: '' } },
  security: {
    sessionTimeout: 24 * 60 * 60 * 1000,
    enableMFA: false,
    passwordPolicy: { minLength: 8, requireUppercase: true, requireNumbers: true, requireSpecialChars: false },
  },
  features: {
    enableAIAssistant: true,
    enableFileUpload: true,
    enableComments: true,
    enableMentions: true,
    enableRealTimeChat: true,
    enableAnalytics: true,
    enableDarkMode: true,
    enableMobileApp: false,
  },
  development: { enableDebugMode: false, enableMockData: false, logLevel: 'info' },
} as const;

export type AppConfig = typeof APP_CONFIG;
