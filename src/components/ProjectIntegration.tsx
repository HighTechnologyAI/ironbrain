import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Plus, Settings, RefreshCw, Maximize, Download, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { IntegrationWidget } from "./IntegrationWidget";

interface IntegratedProject {
  id: string;
  name: string;
  url: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  type: 'iframe' | 'api' | 'widget';
}

export const ProjectIntegration = () => {
  const [projects, setProjects] = useState<IntegratedProject[]>([
    {
      id: '1',
      name: 'Manus Space Project',
      url: 'https://pcbsaqmk.manus.space/',
      description: 'Интегрированный проект PCB системы',
      status: 'active',
      lastSync: new Date().toISOString(),
      type: 'iframe'
    }
  ]);
  
  const [newProject, setNewProject] = useState({
    name: '',
    url: '',
    description: '',
    type: 'iframe' as const
  });
  
  const [fullscreenProject, setFullscreenProject] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Сохранение в localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('integrated-projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('integrated-projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = () => {
    if (!newProject.name || !newProject.url) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    const project: IntegratedProject = {
      id: Date.now().toString(),
      ...newProject,
      status: 'active',
      lastSync: new Date().toISOString()
    };

    setProjects(prev => [...prev, project]);
    setNewProject({ name: '', url: '', description: '', type: 'iframe' });
    
    toast({
      title: "Проект добавлен",
      description: "Внешний проект успешно интегрирован"
    });
  };

  const syncProject = (id: string) => {
    setProjects(prev => prev.map(p => 
      p.id === id 
        ? { ...p, lastSync: new Date().toISOString(), status: 'active' as const }
        : p
    ));
    
    toast({
      title: "Синхронизация завершена",
      description: "Проект обновлен"
    });
  };

  const updateProjectStatus = (id: string, status: 'active' | 'inactive' | 'error') => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, status, lastSync: new Date().toISOString() } : p
    ));
  };

  const exportConfig = () => {
    const config = {
      projects,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'integrations-config.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Конфигурация экспортирована",
      description: "Файл конфигурации сохранен"
    });
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.projects && Array.isArray(config.projects)) {
          setProjects(config.projects);
          toast({
            title: "Конфигурация импортирована",
            description: `Загружено ${config.projects.length} проектов`
          });
        }
      } catch (error) {
        toast({
          title: "Ошибка импорта",
          description: "Неверный формат файла",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Интеграция внешних проектов</h2>
          <p className="text-muted-foreground">
            Управление интегрированными внешними системами и проектами
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportConfig}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Импорт
              </span>
            </Button>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={importConfig}
            />
          </label>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Активные интеграции</TabsTrigger>
          <TabsTrigger value="widgets">Виджеты</TabsTrigger>
          <TabsTrigger value="add">Добавить проект</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Нет активных интеграций</p>
              </CardContent>
            </Card>
          ) : (
            projects.map(project => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {project.name}
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncProject(project.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(project.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setProjects(prev => prev.filter(p => p.id !== project.id));
                          toast({
                            title: "Проект удален",
                            description: "Интеграция отключена"
                          });
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>URL:</strong> {project.url}
                    </p>
                    <p className="text-sm">
                      <strong>Тип:</strong> {project.type}
                    </p>
                    <p className="text-sm">
                      <strong>Последняя синхронизация:</strong> {new Date(project.lastSync).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  
                  {project.type === 'iframe' && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Предварительный просмотр</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Maximize className="h-4 w-4 mr-2" />
                              Полный экран
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full">
                            <DialogHeader>
                              <DialogTitle>{project.name}</DialogTitle>
                            </DialogHeader>
                            <iframe
                              src={project.url}
                              className="w-full h-full border-0 rounded-lg"
                              title={project.name}
                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                      <iframe
                        src={project.url}
                        className={`w-full border rounded-lg ${isMobile ? 'h-64' : 'h-96'}`}
                        title={project.name}
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="widgets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map(project => (
              <IntegrationWidget 
                key={project.id} 
                project={project} 
                onStatusChange={updateProjectStatus}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Добавить новый проект</CardTitle>
              <CardDescription>
                Интегрируйте внешний проект в систему
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Название проекта</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Название проекта"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL проекта</Label>
                  <Input
                    id="url"
                    value={newProject.url}
                    onChange={(e) => setNewProject(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Краткое описание проекта"
                />
              </div>

              <div>
                <Label htmlFor="type">Тип интеграции</Label>
                <select 
                  id="type"
                  className="w-full p-2 border rounded"
                  value={newProject.type}
                  onChange={(e) => setNewProject(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="iframe">IFrame (встроенная страница)</option>
                  <option value="api">API интеграция</option>
                  <option value="widget">Виджет</option>
                </select>
              </div>

              <Button onClick={addProject} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Добавить проект
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки интеграции</CardTitle>
              <CardDescription>
                Глобальные настройки для всех интегрированных проектов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Автоматическая синхронизация</h4>
                  <p className="text-sm text-muted-foreground">
                    Обновлять данные каждые 30 минут
                  </p>
                </div>
                <Button variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Безопасность</h4>
                  <p className="text-sm text-muted-foreground">
                    Проверять SSL сертификаты
                  </p>
                </div>
                <Button variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};