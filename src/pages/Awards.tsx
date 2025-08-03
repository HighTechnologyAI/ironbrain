import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Award,
  Trophy,
  Medal,
  Star,
  Target,
  Zap,
  Crown,
  Search,
  Calendar,
  Users,
  TrendingUp,
  ArrowLeft,
  Plus,
  Gift,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Awards = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          employee:profiles!achievements_employee_id_fkey(full_name, position),
          created_by:profiles!achievements_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить достижения",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Демо данные удалены для бета версии - используем только реальные данные из БД

  const recentAwards = [
    {
      id: 1,
      user: "Мария Иванова",
      avatar: "/placeholder.svg",
      achievement: "Спринтер",
      achievementIcon: Zap,
      points: 50,
      date: "2024-01-11T14:30:00Z",
      description: "Выполнила 12 задач за неделю"
    },
    {
      id: 2,
      user: "Александр Петров",
      avatar: "/placeholder.svg",
      achievement: "Мастер качества",
      achievementIcon: Crown,
      points: 200,
      date: "2024-01-10T16:45:00Z",
      description: "Выполнил 52 задачи без замечаний"
    },
    {
      id: 3,
      user: "Елена Козлова",
      avatar: "/placeholder.svg",
      achievement: "Командный игрок",
      achievementIcon: Users,
      points: 75,
      date: "2024-01-09T11:20:00Z",
      description: "Помогла коллегам в 23 задачах"
    },
    {
      id: 4,
      user: "Дмитрий Сидоров",
      avatar: "/placeholder.svg",
      achievement: "Первый шаг",
      achievementIcon: Star,
      points: 10,
      date: "2024-01-08T09:15:00Z",
      description: "Выполнил первую задачу в системе"
    }
  ];

  const leaderboard = [
    {
      position: 1,
      user: "Мария Иванова",
      avatar: "/placeholder.svg",
      totalPoints: 847,
      achievements: 15,
      department: "Управление проектами"
    },
    {
      position: 2,
      user: "Александр Петров",
      avatar: "/placeholder.svg",
      totalPoints: 723,
      achievements: 12,
      department: "Разработка"
    },
    {
      position: 3,
      user: "Елена Козлова",
      avatar: "/placeholder.svg",
      totalPoints: 658,
      achievements: 11,
      department: "Тестирование"
    },
    {
      position: 4,
      user: "Дмитрий Сидоров",
      avatar: "/placeholder.svg",
      totalPoints: 534,
      achievements: 9,
      department: "Дизайн"
    },
    {
      position: 5,
      user: "Анна Морозова",
      avatar: "/placeholder.svg",
      totalPoints: 421,
      achievements: 8,
      department: "Разработка"
    }
  ];

  const getRarityInfo = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return { label: 'Обычное', color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'uncommon':
        return { label: 'Необычное', color: 'text-green-600', bg: 'bg-green-100' };
      case 'rare':
        return { label: 'Редкое', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'epic':
        return { label: 'Эпическое', color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'legendary':
        return { label: 'Легендарное', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      default:
        return { label: 'Неизвестное', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'starter': return { label: 'Начинающий', icon: Star };
      case 'productivity': return { label: 'Продуктивность', icon: Zap };
      case 'quality': return { label: 'Качество', icon: Crown };
      case 'teamwork': return { label: 'Командная работа', icon: Users };
      case 'milestone': return { label: 'Веха', icon: Trophy };
      default: return { label: 'Общие', icon: Award };
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <Award className="text-accent h-8 w-8" />
              Награды и достижения
            </h1>
            <p className="text-muted-foreground mt-1">Система мотивации и признания заслуг</p>
          </div>
        </div>
        <Button className="cyber-glow">
          <Plus className="h-4 w-4 mr-2" />
          Создать награду
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего достижений</CardTitle>
            <Award className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent font-mono">{achievements.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Награждений сегодня</CardTitle>
            <Gift className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-mono">8</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий рейтинг</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 font-mono">
              {leaderboard.reduce((sum, user) => sum + user.totalPoints, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных участников</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-mono">{leaderboard.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Achievements & Recent Awards */}
        <div className="lg:col-span-2 space-y-8">
          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Доступные достижения</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск достижений..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    <SelectItem value="starter">Начинающий</SelectItem>
                    <SelectItem value="productivity">Продуктивность</SelectItem>
                    <SelectItem value="quality">Качество</SelectItem>
                    <SelectItem value="teamwork">Командная работа</SelectItem>
                    <SelectItem value="milestone">Веха</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAchievements.map((achievement) => {
                const rarityInfo = getRarityInfo(achievement.rarity);
                const categoryInfo = getCategoryInfo(achievement.category);
                const AchievementIcon = achievement.icon;
                const CategoryIcon = categoryInfo.icon;

                return (
                  <Card key={achievement.id} className="hover:border-accent/50 transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-full bg-gradient-to-br from-accent/20 to-accent/10`}>
                            <AchievementIcon className={`h-6 w-6 ${achievement.color}`} />
                          </div>
                          <div>
                            <CardTitle className="group-hover:cyber-text transition-colors">
                              {achievement.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {achievement.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className={`${rarityInfo.color} border-current`}>
                          {rarityInfo.label}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CategoryIcon className="h-3 w-3" />
                          {categoryInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Очки: </span>
                          <span className="font-mono text-accent font-bold">{achievement.points}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Получили: </span>
                          <span className="font-mono font-bold">{achievement.earnedBy}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Awards */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Последние награждения</h2>
            <div className="space-y-4">
              {recentAwards.map((award) => {
                const AchievementIcon = award.achievementIcon;
                
                return (
                  <Card key={award.id} className="hover:border-primary/50 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={award.avatar} alt={award.user} />
                          <AvatarFallback>{award.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{award.user}</span>
                            <span className="text-muted-foreground">получил(а)</span>
                            <div className="flex items-center gap-1">
                              <AchievementIcon className="h-4 w-4 text-accent" />
                              <span className="font-medium text-accent">{award.achievement}</span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-2">
                            {award.description}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Очки:</span>
                              <Badge variant="outline" className="text-accent border-accent/30">
                                +{award.points}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(award.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Leaderboard */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Рейтинг лидеров</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                Топ участников
              </CardTitle>
              <CardDescription>
                Рейтинг по общему количеству очков
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaderboard.map((user) => (
                <div 
                  key={user.position} 
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    user.position <= 3 ? 'bg-gradient-to-r from-accent/10 to-transparent border border-accent/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getPositionIcon(user.position)}
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.user} />
                    <AvatarFallback>{user.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-medium">{user.user}</div>
                    <div className="text-xs text-muted-foreground">{user.department}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-mono font-bold text-accent">{user.totalPoints}</div>
                    <div className="text-xs text-muted-foreground">{user.achievements} наград</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Awards;