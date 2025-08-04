import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  Search, 
  Calendar,
  Users,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  ArrowLeft,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreateProjectForm from "@/components/CreateProjectForm";
import AppNavigation from "@/components/AppNavigation";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      setProjects(companies || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить проекты",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary';
      case 'completed': return 'bg-green-600';
      case 'planning': return 'bg-amber-600';
      case 'on-hold': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Активный', variant: 'default' as const, icon: Activity, color: 'text-primary' };
      case 'completed':
        return { label: 'Завершен', variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' };
      case 'planning':
        return { label: 'Планирование', variant: 'outline' as const, icon: Clock, color: 'text-amber-600' };
      case 'on-hold':
        return { label: 'Приостановлен', variant: 'destructive' as const, icon: AlertCircle, color: 'text-destructive' };
      default:
        return { label: 'Неизвестно', variant: 'secondary' as const, icon: AlertCircle, color: 'text-muted-foreground' };
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <AppNavigation title="Проекты" subtitle="Управление проектами и их выполнением" />
      <div className="min-h-screen bg-background p-6">
      {/* Header - Removed since using AppNavigation */}
      {/* Action Button */}
      <div className="flex justify-end mb-6">
        <Button 
          className="cyber-glow"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Новый проект
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-4 w-4" />
              Поиск
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Поиск проектов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Статус
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все проекты</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
                <SelectItem value="planning">Планирование</SelectItem>
                <SelectItem value="on-hold">Приостановленные</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Всего проектов:</span>
              <span className="font-mono text-primary">{projects.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Активных:</span>
              <span className="font-mono text-primary">{projects.filter(p => p.status === 'active').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Загрузка проектов...</span>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const statusInfo = getStatusInfo(project.status || 'active');
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={project.id} className="hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl group-hover:cyber-text transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {project.description}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Company Details */}
                  <div className="space-y-2">
                    {project.industry && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Отрасль:</span>
                        <span className="font-mono">{project.industry}</span>
                      </div>
                    )}
                    {project.contact_person && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Контакт:</span>
                        <span className="font-mono">{project.contact_person}</span>
                      </div>
                    )}
                    {project.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Сайт:</span>
                        <a href={project.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {project.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  {(project.contact_email || project.contact_phone) && (
                    <div className="pt-2 border-t space-y-1">
                      {project.contact_email && (
                        <div className="text-xs text-muted-foreground">
                          Email: {project.contact_email}
                        </div>
                      )}
                      {project.contact_phone && (
                        <div className="text-xs text-muted-foreground">
                          Телефон: {project.contact_phone}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? `Проекты не найдены по заданным критериям`
                : 'Нет проектов для отображения. Добавьте компании в базу данных.'
              }
            </p>
          </CardContent>
        </Card>
      )}
      </div>

      <CreateProjectForm 
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onProjectCreated={fetchProjects}
      />
    </>
  );
};

export default Projects;