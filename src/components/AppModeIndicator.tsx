import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFeatures, APP_MODES } from '@/utils/features';
import { Info, Settings, Zap } from 'lucide-react';

export const AppModeIndicator: React.FC = () => {
  const { isCRMMode, isUAVMode, isHybridMode } = useFeatures();
  
  const getCurrentMode = () => {
    if (isCRMMode && !isUAVMode) return 'CRM_ONLY';
    if (isUAVMode && !isCRMMode) return 'UAV_ONLY'; 
    if (isHybridMode) return 'HYBRID';
    return 'CRM_ONLY'; // default
  };
  
  const currentMode = getCurrentMode();
  const modeConfig = APP_MODES[currentMode];
  
  const getModeIcon = () => {
    switch (currentMode) {
      case 'CRM_ONLY': return <Settings className="h-4 w-4" />;
      case 'UAV_ONLY': return <Zap className="h-4 w-4" />;
      case 'HYBRID': return <Info className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };
  
  const getModeVariant = () => {
    switch (currentMode) {
      case 'CRM_ONLY': return 'default';
      case 'UAV_ONLY': return 'secondary';
      case 'HYBRID': return 'outline';
      default: return 'default';
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={getModeVariant() as any} className="flex items-center gap-1">
          {getModeIcon()}
          {modeConfig.name}
        </Badge>
      </div>
      
      {/* Показываем информацию только в development режиме */}
      {process.env.NODE_ENV === 'development' && (
        <Alert className="text-xs">
          <Info className="h-3 w-3" />
          <AlertDescription>
            Режим: {modeConfig.description}
            {currentMode === 'CRM_ONLY' && (
              <div className="mt-1 text-muted-foreground">
                UAV функции отключены. Для включения установите VITE_ENABLE_UAV=true
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};