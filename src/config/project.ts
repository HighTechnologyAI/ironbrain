export const PROJECT_CONFIG = {
  // App Information
  APP_NAME: 'Tiger CRM',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Comprehensive CRM and Task Management System',
  
  // Supabase Configuration
  SUPABASE_URL: 'https://zqnjgwrvvrqaenzmlvfx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxbmpnd3J2dnJxYWVuem1sdmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDYwNDcsImV4cCI6MjA2OTgyMjA0N30.uv41CLbWP5ZMnQLymCIE9uB9m4wC9xyKNSOU3btqcR8',
  
  // Feature Flags
  FEATURES: {
    AI_ASSISTANT: true,
    REAL_TIME_CHAT: true,
    FILE_ATTACHMENTS: true,
    ANALYTICS: true,
    TEAM_MANAGEMENT: true,
    NOTIFICATIONS: true,
    DAILY_REPORTS: true,
    MULTI_LANGUAGE: true,
  },
  
  // UI Configuration
  UI: {
    DEFAULT_LANGUAGE: 'ru',
    SUPPORTED_LANGUAGES: ['ru', 'en', 'bg'],
    THEME: {
      DEFAULT_MODE: 'system', // 'light' | 'dark' | 'system'
    },
    PAGINATION: {
      DEFAULT_PAGE_SIZE: 20,
      MAX_PAGE_SIZE: 100,
    },
  },
  
  // File Upload Configuration
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
    STORAGE_BUCKET: 'task-files',
  },
  
  // Task Configuration
  TASKS: {
    STATUSES: ['pending', 'in_progress', 'completed', 'cancelled'],
    PRIORITIES: ['low', 'medium', 'high', 'urgent'],
    DEFAULT_STATUS: 'pending',
    DEFAULT_PRIORITY: 'medium',
  },
  
  // Real-time Configuration
  REALTIME: {
    CHANNELS: {
      TASKS: 'tasks_channel',
      COMMENTS: 'task_comments_channel',
      PRESENCE: 'user_presence_channel',
    },
  },
  
  // Analytics Configuration
  ANALYTICS: {
    PERFORMANCE_METRICS: {
      TASKS_COMPLETED: 'tasks_completed',
      TASKS_OVERDUE: 'tasks_overdue',
      TOTAL_HOURS: 'total_hours',
      ACHIEVEMENT_POINTS: 'achievement_points',
    },
  },
  
  // Notification Configuration
  NOTIFICATIONS: {
    DAILY_REPORT_TIME: '22:00',
    REMINDER_INTERVALS: [24, 2, 0.5], // hours before due date
  },
  
  // API Endpoints
  API: {
    EDGE_FUNCTIONS: {
      AI_ASSISTANT: '/functions/v1/ai-task-assistant',
      TASK_AI_ASSISTANT: '/functions/v1/task-ai-assistant',
      ADMIN_API: '/functions/v1/admin-api',
      WEBHOOK_HANDLER: '/functions/v1/webhook-handler',
    },
  },
  
  // External Services
  EXTERNAL_SERVICES: {
    OPENAI_MODEL: 'gpt-4',
    TELEGRAM_BOT_ENABLED: false,
  },
} as const;

// Type definitions for better TypeScript support
export type ProjectConfig = typeof PROJECT_CONFIG;
export type SupportedLanguage = typeof PROJECT_CONFIG.UI.SUPPORTED_LANGUAGES[number];
export type TaskStatus = typeof PROJECT_CONFIG.TASKS.STATUSES[number];
export type TaskPriority = typeof PROJECT_CONFIG.TASKS.PRIORITIES[number];