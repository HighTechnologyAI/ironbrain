import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, ExternalLink, Eye, EyeOff } from 'lucide-react';

interface MapboxTokenInputProps {
  onTokenSet: (token: string) => void;
}

export const MapboxTokenInput: React.FC<MapboxTokenInputProps> = ({ onTokenSet }) => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Check if token is already stored
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      setToken(storedToken);
      onTokenSet(storedToken);
    }
  }, [onTokenSet]);

  const handleSaveToken = async () => {
    if (!token.trim()) return;
    
    setIsValidating(true);
    
    try {
      // Basic validation - check if token format looks correct
      if (token.startsWith('pk.') && token.length > 50) {
        localStorage.setItem('mapbox_token', token);
        onTokenSet(token);
      } else {
        throw new Error('Invalid token format');
      }
    } catch (error) {
      console.error('Invalid Mapbox token:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const hasStoredToken = localStorage.getItem('mapbox_token');

  if (hasStoredToken) {
    return (
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          Mapbox token configured. Maps are ready to use.
          <Button 
            variant="link" 
            size="sm" 
            className="p-0 ml-2 h-auto"
            onClick={() => {
              localStorage.removeItem('mapbox_token');
              setToken('');
              window.location.reload();
            }}
          >
            Change token
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapbox Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            To enable maps, please provide your Mapbox public token.
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 ml-1 h-auto"
              asChild
            >
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                Get token <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="mapbox-token"
                type={showToken ? "text" : "password"}
                placeholder="pk.eyJ1IjoiLi4u"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button 
              onClick={handleSaveToken}
              disabled={!token.trim() || isValidating}
            >
              {isValidating ? 'Validating...' : 'Save'}
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Your token will be stored locally in your browser and used for map requests.
        </div>
      </CardContent>
    </Card>
  );
};