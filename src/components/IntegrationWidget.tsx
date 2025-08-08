import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface IntegrationWidgetProps {
  project: {
    id: string;
    name: string;
    url: string;
    type: 'iframe' | 'api' | 'widget';
    status: 'active' | 'inactive' | 'error';
  };
  onStatusChange: (id: string, status: 'active' | 'inactive' | 'error') => void;
}

export const IntegrationWidget = ({ project, onStatusChange }: IntegrationWidgetProps) => {
  const [loading, setLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const { toast } = useToast();

  const checkApiStatus = async () => {
    if (project.type !== 'api') return;
    
    setLoading(true);
    try {
      const response = await fetch(project.url, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
        onStatusChange(project.id, 'active');
        toast({
          title: "API подключение активно",
          description: `${project.name} успешно подключен`
        });
      } else {
        throw new Error('API недоступен');
      }
    } catch (error) {
      onStatusChange(project.id, 'error');
      toast({
        title: "Ошибка API",
        description: `Не удалось подключиться к ${project.name}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setIframeError(false);
    onStatusChange(project.id, 'active');
  };

  const handleIframeError = () => {
    setIframeError(true);
    onStatusChange(project.id, 'error');
    toast({
      title: "Ошибка загрузки",
      description: `Не удалось загрузить ${project.name}`,
      variant: "destructive"
    });
  };

  useEffect(() => {
    if (project.type === 'api') {
      checkApiStatus();
    }
  }, [project.url, project.type]);

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (project.status === 'active') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (project.status === 'error') return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const renderContent = () => {
    if (project.type === 'iframe') {
      return (
        <div className="space-y-2">
          {iframeError ? (
            <div className="p-4 text-center border border-red-200 rounded-lg bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-700">Ошибка загрузки страницы</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  setIframeError(false);
                  window.location.reload();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Попробовать снова
              </Button>
            </div>
          ) : (
            <iframe
              src={project.url}
              className="w-full h-64 border rounded-lg"
              title={project.name}
              sandbox="allow-scripts allow-same-origin allow-forms"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
        </div>
      );
    }

    if (project.type === 'api') {
      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">API Status</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkApiStatus}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
          {apiData && (
            <div className="p-3 bg-muted rounded-lg">
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-4 text-center border border-dashed rounded-lg">
        <p className="text-sm text-muted-foreground">Виджет в разработке</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={project.status === 'active' ? 'default' : project.status === 'error' ? 'destructive' : 'secondary'}>
              {project.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};