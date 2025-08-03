// Централизованная конфигурация Tiger CRM
export const APP_CONFIG = {
  // Основные настройки приложения
  app: {
    name: 'Tiger CRM',
    version: '1.0.0-beta',
    description: 'Система управления командой и задачами',
    author: 'Tiger CRM Team',
  },

  // Настройки Supabase
  supabase: {
    url: 'https://zqnjgwrvvrqaenzmlvfx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxbmpnd3J2dnJxYWVuem1sdmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDYwNDcsImV4cCI6MjA2OTgyMjA0N30.uv41CLbWP5ZMnQLymCIE9uB9m4wC9xyKNSOU3btqcR8',
    projectId: 'zqnjgwrvvrqaenzmlvfx',
  },

  // Настройки файлов
  files: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
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

  // Настройки UI
  ui: {
    defaultLanguage: 'ru',
    supportedLanguages: ['ru', 'bg'],
    theme: {
      defaultMode: 'system', // 'light', 'dark', 'system'
    },
    pagination: {
      defaultPageSize: 10,
      maxPageSize: 100,
    },
  },

  // Настройки уведомлений
  notifications: {
    enableToasts: true,
    enableRealtime: true,
    autoHideTimeout: 5000,
  },

  // Настройки задач
  tasks: {
    defaultStatus: 'pending',
    defaultPriority: 'medium',
    statuses: ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'],
    priorities: ['low', 'medium', 'high', 'critical'],
    maxDescriptionLength: 2000,
    maxTitleLength: 200,
  },

  // Настройки комментариев
  comments: {
    maxLength: 1000,
    enableMentions: true,
    enableFileAttachments: true,
    realTimeUpdates: true,
  },

  // Настройки ролей
  roles: {
    default: 'employee',
    available: ['admin', 'manager', 'employee'],
    permissions: {
      admin: ['all'],
      manager: ['read', 'write', 'manage_team'],
      employee: ['read', 'write_own'],
    },
  },

  // Настройки API
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Настройки отчетов
  reports: {
    dailyReportTime: '22:00',
    enableDailyReports: true,
    reportFormats: ['json', 'pdf'],
  },

  // Внешние интеграции
  integrations: {
    openai: {
      enabled: true,
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
    },
    telegram: {
      enabled: false,
      botToken: '', // Настраивается в админ панели
    },
  },

  // Настройки безопасности
  security: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 часа
    enableMFA: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
  },

  // Feature flags
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

  // Настройки разработки
  development: {
    enableDebugMode: false,
    enableMockData: false,
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  },
} as const;

export type AppConfig = typeof APP_CONFIG;