import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield, AlertTriangle } from 'lucide-react';

interface AdminAuthenticationProps {
  onAuthenticate: (adminKey: string) => Promise<boolean>;
  authAttempts: number;
  lockoutTime: number | null;
  loading: boolean;
}

export const AdminAuthentication: React.FC<AdminAuthenticationProps> = ({
  onAuthenticate,
  authAttempts,
  lockoutTime,
  loading
}) => {
  const [adminKey, setAdminKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;
    
    await onAuthenticate(adminKey);
  };

  const isLocked = lockoutTime && Date.now() < lockoutTime;
  const remainingTime = lockoutTime ? Math.ceil((lockoutTime - Date.now()) / 1000) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Panel Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="adminKey" className="text-sm font-medium">
                Admin Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="adminKey"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key"
                  className="pl-10"
                  disabled={loading || isLocked}
                />
              </div>
            </div>

            {authAttempts > 0 && !isLocked && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Invalid admin key. {5 - authAttempts} attempts remaining.
                </AlertDescription>
              </Alert>
            )}

            {isLocked && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Too many failed attempts. Please wait {remainingTime} seconds.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || isLocked || !adminKey.trim()}
            >
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};