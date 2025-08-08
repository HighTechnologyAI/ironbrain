import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Plus, Settings, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
  
  const { toast } = useToast();

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

  const removeProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Проект удален",
      description: "Интеграция отключена"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Интеграция внешних проектов</h2>
        <p className="text-muted-foreground">
          Управление интегрированными внешними системами и проектами
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Активные интеграции</TabsTrigger>
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
                        onClick={() => removeProject(project.id)}
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
                    <div className="mt-4">
                      <iframe
                        src={project.url}
                        className="w-full h-96 border rounded-lg"
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