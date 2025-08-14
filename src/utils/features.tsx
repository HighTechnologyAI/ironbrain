// Система feature flags для архитектурного разделения функциональности

export interface FeatureFlags {
  // Core CRM функции (всегда включены)
  CORE_CRM: boolean;
  TASKS_MANAGEMENT: boolean;
  TEAM_MANAGEMENT: boolean;
  PROJECTS_MANAGEMENT: boolean;
  ANALYTICS: boolean;
  
  // UAV/Drone функции (опциональные)
  UAV_OPERATIONS: boolean;
  FLEET_MANAGEMENT: boolean;
  MISSION_CONTROL: boolean;
  DRONE_TELEMETRY: boolean;
  UAV_ANALYTICS: boolean;
  
  // AI функции
  AI_ASSISTANT: boolean;
  AI_VOICE_CONTROL: boolean;
  AI_ANALYTICS: boolean;
  
  // Advanced функции
  INTEGRATIONS: boolean;
  FILE_ATTACHMENTS: boolean;
  REAL_TIME_CHAT: boolean;
  MOBILE_APP: boolean;
}

// Получение feature flags из переменных окружения с fallback'ами
const getFeatureFlags = (): FeatureFlags => {
  const env = (import.meta as any).env || {};
  
  return {
    // Core CRM - всегда включены
    CORE_CRM: true,
    TASKS_MANAGEMENT: true,
    TEAM_MANAGEMENT: true,
    PROJECTS_MANAGEMENT: true,
    ANALYTICS: true,
    
    // UAV функции - по умолчанию отключены для CRM
    UAV_OPERATIONS: env.VITE_ENABLE_UAV === 'true',
    FLEET_MANAGEMENT: env.VITE_FEATURE_FLEET === 'true',
    MISSION_CONTROL: env.VITE_FEATURE_MISSION_CONTROL === 'true',
    DRONE_TELEMETRY: env.VITE_FEATURE_TELEMETRY === 'true',
    UAV_ANALYTICS: env.VITE_FEATURE_UAV_ANALYTICS === 'true',
    
    // AI функции - включены по умолчанию
    AI_ASSISTANT: env.VITE_DISABLE_AI !== 'true',
    AI_VOICE_CONTROL: env.VITE_ENABLE_VOICE === 'true',
    AI_ANALYTICS: env.VITE_ENABLE_AI_ANALYTICS !== 'false',
    
    // Advanced функции
    INTEGRATIONS: env.VITE_ENABLE_INTEGRATIONS !== 'false',
    FILE_ATTACHMENTS: env.VITE_ENABLE_FILE_UPLOAD !== 'false',
    REAL_TIME_CHAT: env.VITE_ENABLE_REAL_TIME !== 'false',
    MOBILE_APP: env.VITE_ENABLE_MOBILE === 'true',
  };
};

export const FEATURES = getFeatureFlags();

// Утилиты для проверки feature flags
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return FEATURES[feature];
};

export const requiresUAVFeatures = (features: (keyof FeatureFlags)[]): boolean => {
  return features.some(feature => 
    ['UAV_OPERATIONS', 'FLEET_MANAGEMENT', 'MISSION_CONTROL', 'DRONE_TELEMETRY', 'UAV_ANALYTICS'].includes(feature) &&
    FEATURES[feature]
  );
};

// Компонент для условного рендеринга на основе feature flags
interface FeatureGateProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback = null 
}) => {
  if (!isFeatureEnabled(feature)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Хук для работы с feature flags в компонентах
export const useFeatures = () => {
  return {
    features: FEATURES,
    isEnabled: isFeatureEnabled,
    requiresUAV: requiresUAVFeatures,
    // Конкретные проверки для удобства
    isCRMMode: !requiresUAVFeatures(['UAV_OPERATIONS']),
    isUAVMode: requiresUAVFeatures(['UAV_OPERATIONS']),
    isHybridMode: FEATURES.CORE_CRM && FEATURES.UAV_OPERATIONS,
  };
};

// Настройки для различных режимов работы
export const APP_MODES = {
  CRM_ONLY: {
    name: 'Tiger CRM',
    description: 'Система управления командой и задачами',
    enabledFeatures: [
      'CORE_CRM', 'TASKS_MANAGEMENT', 'TEAM_MANAGEMENT', 
      'PROJECTS_MANAGEMENT', 'ANALYTICS', 'AI_ASSISTANT'
    ]
  },
  
  UAV_ONLY: {
    name: 'Tiger UAV Control',
    description: 'Система управления беспилотными аппаратами',
    enabledFeatures: [
      'UAV_OPERATIONS', 'FLEET_MANAGEMENT', 'MISSION_CONTROL',
      'DRONE_TELEMETRY', 'UAV_ANALYTICS'
    ]
  },
  
  HYBRID: {
    name: 'Tiger Integrated Platform',
    description: 'Комплексная система управления командой и UAV операциями',
    enabledFeatures: 'ALL'
  }
} as const;

export type AppMode = keyof typeof APP_MODES;