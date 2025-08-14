import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/neon/Button';
import { CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export const AISystemStatus: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          AI System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">OpenAI Integration Active</div>
              <div className="text-sm text-muted-foreground">
                AI analytics and mission planning are now available with GPT-4.1-2025-04-14
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Available AI Features:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Telemetry Data Analysis</li>
              <li>• Mission Route Optimization</li>
              <li>• Predictive Maintenance</li>
              <li>• Anomaly Detection</li>
              <li>• Operations Optimization</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">AI Model:</div>
            <div className="text-sm text-muted-foreground">
              GPT-4.1-2025-04-14 (Latest Flagship Model)
            </div>
            <div className="text-sm font-medium mt-3">Processing:</div>
            <div className="text-sm text-muted-foreground">
              Real-time analysis with structured outputs
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button variant="neon-outline" size="sm" asChild>
            <a 
              href="/ai-operations" 
              className="inline-flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Try AI Operations Center
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};