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
  const [recentAwards, setRecentAwards] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAchievements(),
        fetchRecentAwards(),
        fetchLeaderboard()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const fetchRecentAwards = async () => {
    try {
      // Получаем последние достижения с информацией о пользователях
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          employee:profiles!achievements_employee_id_fkey(full_name, position, department)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Преобразуем данные в формат для отображения
      const formattedAwards = (data || []).map(achievement => ({
        id: achievement.id,
        user: achievement.employee?.full_name || 'Неизвестный пользователь',
        avatar: "/placeholder.svg",
        achievement: achievement.title,
        achievementIcon: Star, // Можно добавить логику выбора иконки по типу
        points: achievement.points || 0,
        date: achievement.created_at,
        description: achievement.description || 'Без описания'
      }));
      
      setRecentAwards(formattedAwards);
    } catch (error) {
      console.error('Error fetching recent awards:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // Получаем пользователей с суммой их очков достижений
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          achievements!achievements_employee_id_fkey(points)
        `)
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Вычисляем общие очки для каждого пользователя
      const leaderboardData = (data || []).map((profile, index) => {
        const totalPoints = profile.achievements?.reduce((sum: number, achievement: any) => 
          sum + (achievement.points || 0), 0) || 0;
        const achievementCount = profile.achievements?.length || 0;
        
        return {
          position: index + 1,
          user: profile.full_name,
          avatar: profile.avatar_url || "/placeholder.svg",
          totalPoints,
          achievements: achievementCount,
          department: profile.department || 'Не указано'
        };
      })
      .filter(user => user.totalPoints > 0) // Показываем только пользователей с очками
      .sort((a, b) => b.totalPoints - a.totalPoints) // Сортируем по убыванию очков
      .map((user, index) => ({ ...user, position: index + 1 })); // Обновляем позиции
      
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  // Все данные теперь загружаются из базы данных

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
            <div className="text-2xl font-bold text-primary font-mono">
              {recentAwards.filter(award => {
                const today = new Date();
                const awardDate = new Date(award.date);
                return awardDate.toDateString() === today.toDateString();
              }).length}
            </div>
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

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Загрузка достижений...</span>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Достижения пока не созданы</h3>
                  <p className="text-muted-foreground">
                    В системе пока нет созданных достижений. Создайте первое достижение для мотивации команды!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAchievements.map((achievement) => {
                  const rarityInfo = getRarityInfo(achievement.type);
                  const categoryInfo = getCategoryInfo('productivity'); // Используем дефолтную категорию
                  const CategoryIcon = categoryInfo.icon;

                  return (
                    <Card key={achievement.id} className="hover:border-accent/50 transition-all duration-300 group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full bg-gradient-to-br from-accent/20 to-accent/10`}>
                              <Award className="h-6 w-6 text-accent" />
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
                            <span className="font-mono text-accent font-bold">{achievement.points || 0}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Создано: </span>
                            <span className="font-mono font-bold">{formatDate(achievement.created_at)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Awards */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Последние награждения</h2>
            {recentAwards.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Пока нет награждений</h3>
                  <p className="text-muted-foreground">
                    Награждения будут отображаться здесь после их создания.
                  </p>
                </CardContent>
              </Card>
            ) : (
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
            )}
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
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Рейтинг пуст</h3>
                  <p className="text-muted-foreground text-sm">
                    Пользователи появятся в рейтинге после получения первых достижений.
                  </p>
                </div>
              ) : (
                leaderboard.map((user) => (
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
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Awards;