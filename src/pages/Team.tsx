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
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Team = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const teamMembers = [
    {
      id: 1,
      name: "Александр Петров",
      role: "Senior Developer",
      department: "Разработка",
      email: "a.petrov@company.com",
      phone: "+7 (999) 123-45-67",
      location: "Москва",
      avatar: "/placeholder.svg",
      status: "online",
      tasksCompleted: 24,
      totalTasks: 28,
      achievements: 15,
      joinDate: "2023-01-15"
    },
    {
      id: 2,
      name: "Мария Иванова",
      role: "Project Manager",
      department: "Управление проектами",
      email: "m.ivanova@company.com",
      phone: "+7 (999) 234-56-78",
      location: "Санкт-Петербург",
      avatar: "/placeholder.svg",
      status: "away",
      tasksCompleted: 31,
      totalTasks: 35,
      achievements: 22,
      joinDate: "2022-08-20"
    },
    {
      id: 3,
      name: "Дмитрий Сидоров",
      role: "UI/UX Designer",
      department: "Дизайн",
      email: "d.sidorov@company.com",
      phone: "+7 (999) 345-67-89",
      location: "Екатеринбург",
      avatar: "/placeholder.svg",
      status: "offline",
      tasksCompleted: 18,
      totalTasks: 22,
      achievements: 8,
      joinDate: "2023-05-10"
    },
    {
      id: 4,
      name: "Елена Козлова",
      role: "QA Engineer",
      department: "Тестирование",
      email: "e.kozlova@company.com",
      phone: "+7 (999) 456-78-90",
      location: "Новосибирск",
      avatar: "/placeholder.svg",
      status: "online",
      tasksCompleted: 27,
      totalTasks: 30,
      achievements: 12,
      joinDate: "2023-03-01"
    }
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="text-2xl font-bold text-primary font-mono">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 за последний месяц
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Онлайн</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-mono">
              {teamMembers.filter(m => m.status === 'online').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Активных пользователей
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:border-primary/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`}></div>
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:cyber-text transition-colors">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{member.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">С {new Date(member.joinDate).toLocaleDateString()}</span>
                </div>
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
                <Badge 
                  variant="secondary" 
                  className="bg-primary/20 text-primary border-primary/30"
                >
                  {member.department}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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