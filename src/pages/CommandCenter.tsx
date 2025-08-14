import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/neon/Button';
import { StatusChip } from '@/components/neon/StatusChip';
import { EmptyState } from '@/components/neon/EmptyState';
import { 
  Shield, 
  Power, 
  Play, 
  Square, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Activity
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const CommandCenter: React.FC = () => {
  const { t } = useTranslation();
  const [dryRunMode, setDryRunMode] = useState(true);

  // Feature flag check
  if (import.meta.env.VITE_FEATURE_COMMAND_CENTER !== 'true') {
    return null;
  }

  // Mock commands and their status
  const safeCommands = [
    {
      id: 'arm_drone',
      label: t('ops.commandCenter.armDrone'),
      icon: Shield,
      variant: 'neon' as const,
      dangerous: true
    },
    {
      id: 'disarm_drone',
      label: t('ops.commandCenter.disarmDrone'),
      icon: Power,
      variant: 'neon-outline' as const,
      dangerous: false
    },
    {
      id: 'start_mission',
      label: t('ops.commandCenter.startMission'),
      icon: Play,
      variant: 'neon' as const,
      dangerous: true
    },
    {
      id: 'abort_mission',
      label: t('ops.commandCenter.abortMission'),
      icon: Square,
      variant: 'destructive' as const,
      dangerous: true
    }
  ];

  const handleCommand = (commandId: string, dangerous: boolean) => {
    if (dangerous && !dryRunMode) {
      // In real implementation, show confirmation dialog
      console.log(`Executing dangerous command: ${commandId}`);
    } else {
      console.log(`${dryRunMode ? 'Dry run:' : 'Executing:'} ${commandId}`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('ops.commandCenter.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('ops.commandCenter.subtitle')}
        </p>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Control Panel
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={dryRunMode}
                  onCheckedChange={setDryRunMode}
                  id="dry-run-mode"
                />
                <label htmlFor="dry-run-mode" className="text-sm font-medium">
                  {t('ops.commandCenter.dryRun')}
                </label>
              </div>
              <StatusChip status={dryRunMode ? 'warning' : 'ready'} size="sm">
                {dryRunMode ? 'Dry Run' : 'Live Mode'}
              </StatusChip>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {safeCommands.map((command) => {
              const IconComponent = command.icon;
              return (
                <Card key={command.id} className="transition-all hover:shadow-medium">
                  <CardContent className="p-4 text-center space-y-3">
                    <div className="flex justify-center">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm">{command.label}</h3>
                    <Button
                      variant={command.variant}
                      size="sm"
                      className="w-full"
                      onClick={() => handleCommand(command.id, command.dangerous)}
                    >
                      {dryRunMode ? 'Test' : t('ops.commandCenter.execute')}
                    </Button>
                    {command.dangerous && !dryRunMode && (
                      <div className="flex items-center gap-1 text-xs text-warning">
                        <AlertTriangle className="h-3 w-3" />
                        Requires confirmation
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Command Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Command History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Activity className="h-8 w-8" />}
              title="No Commands Executed"
              description="Command history will appear here after execution"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Command Interface</span>
              <StatusChip status="online" size="sm">Online</StatusChip>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Safety Systems</span>
              <StatusChip status="armed" size="sm">Armed</StatusChip>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentication</span>
              <StatusChip status="ready" size="sm">Verified</StatusChip>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Communication</span>
              <StatusChip status="online" size="sm">Active</StatusChip>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommandCenter;