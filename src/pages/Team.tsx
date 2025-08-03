import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin,
  Activity,
  Award,
  Calendar,
  Plus,
  Settings,
  ArrowLeft,
  Loader2,
  MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTeamData } from "@/hooks/use-team-data";

const Team = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { teamMembers, loading, error } = useTeamData();

  const filteredMembers = teamMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-primary';
      case 'away': return 'bg-amber-500';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold cyber-text flex items-center gap-3">
              <Users className="text-primary h-8 w-8" />
              Команда
            </h1>
            <p className="text-muted-foreground mt-1">Управление командой и сотрудниками</p>
          </div>
        </div>
        <Button className="cyber-glow">
          <Plus className="h-4 w-4 mr-2" />
          Добавить сотрудника
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Поиск сотрудников</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, должности или отделу..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего сотрудников</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <>
                <div className="text-2xl font-bold text-primary font-mono">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Активных сотрудников
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Онлайн</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <>
                <div className="text-2xl font-bold text-primary font-mono">
                  {teamMembers.filter(m => m.status === 'online').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Активных пользователей
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Загрузка данных команды...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="text-center py-12 border-destructive/50 bg-destructive/5">
          <CardContent>
            <p className="text-destructive mb-4">Ошибка загрузки данных: {error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Team Members Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:border-primary/50 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.full_name} />
                        <AvatarFallback>{member.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`}></div>
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:cyber-text transition-colors">{member.full_name}</CardTitle>
                      <CardDescription>{member.position || 'Сотрудник'}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  )}
                  {member.telegram_username && (
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">@{member.telegram_username}</span>
                    </div>
                  )}
                  {member.hire_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">С {new Date(member.hire_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Прогресс задач</span>
                    <span className="text-sm font-mono text-primary">
                      {getProgressPercentage(member.tasksCompleted, member.totalTasks)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(member.tasksCompleted, member.totalTasks)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{member.tasksCompleted} выполнено</span>
                    <span>{member.totalTasks} всего</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-accent" />
                    <span className="text-sm font-mono text-accent">{member.achievements}</span>
                    <span className="text-xs text-muted-foreground">наград</span>
                  </div>
                  {member.department && (
                    <Badge 
                      variant="secondary" 
                      className="bg-primary/20 text-primary border-primary/30"
                    >
                      {member.department}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredMembers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Сотрудники не найдены по запросу "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Team;