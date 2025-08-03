import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Loader2,
  Phone,
  MessageCircle,
  Calendar,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTeamData, TeamMember } from "@/hooks/use-team-data";

interface EditingMember extends Partial<TeamMember> {
  isNew?: boolean;
}

const TeamManagement = () => {
  const [editingMember, setEditingMember] = useState<EditingMember | null>(null);
  const [loading, setLoading] = useState(false);
  const { teamMembers, loading: teamLoading } = useTeamData();
  const { toast } = useToast();

  const handleEdit = (member: TeamMember) => {
    setEditingMember({...member});
  };

  const handleAddNew = () => {
    setEditingMember({
      isNew: true,
      full_name: '',
      position: '',
      department: '',
      phone: '',
      telegram_username: '',
      is_active: true
    });
  };

  const handleSave = async () => {
    if (!editingMember || !editingMember.full_name) {
      toast({
        title: "Ошибка",
        description: "Необходимо заполнить имя сотрудника",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (editingMember.isNew) {
        // Создание нового профиля
        const { error } = await supabase
          .from('profiles')
          .insert({
            full_name: editingMember.full_name,
            position: editingMember.position || null,
            department: editingMember.department || null,
            phone: editingMember.phone || null,
            telegram_username: editingMember.telegram_username || null,
            is_active: editingMember.is_active ?? true
          });

        if (error) throw error;

        toast({
          title: "Успешно",
          description: "Новый сотрудник добавлен",
        });
      } else {
        // Обновление существующего профиля
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: editingMember.full_name,
            position: editingMember.position || null,
            department: editingMember.department || null,
            phone: editingMember.phone || null,
            telegram_username: editingMember.telegram_username || null,
            is_active: editingMember.is_active ?? true
          })
          .eq('id', editingMember.id);

        if (error) throw error;

        toast({
          title: "Успешно",
          description: "Данные сотрудника обновлены",
        });
      }

      setEditingMember(null);
      // Принудительно обновляем страницу для получения новых данных
      window.location.reload();
    } catch (error) {
      console.error('Error saving member:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при сохранении",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (memberId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Сотрудник деактивирован",
      });

      // Принудительно обновляем страницу
      window.location.reload();
    } catch (error) {
      console.error('Error deactivating member:', error);
      toast({
        title: "Ошибка",
        description: "Ошибка при деактивации сотрудника",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (teamLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Загрузка данных команды...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold cyber-text flex items-center gap-3">
            <Users className="text-primary h-6 w-6" />
            Управление командой
          </h2>
          <p className="text-muted-foreground mt-1">Редактирование профилей сотрудников</p>
        </div>
        <Button onClick={handleAddNew} className="cyber-glow">
          <Plus className="h-4 w-4 mr-2" />
          Добавить сотрудника
        </Button>
      </div>

      {/* Editing Form */}
      {editingMember && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {editingMember.isNew ? 'Новый сотрудник' : 'Редактирование профиля'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Полное имя *</Label>
                <Input
                  id="full_name"
                  value={editingMember.full_name || ''}
                  onChange={(e) => setEditingMember({...editingMember, full_name: e.target.value})}
                  placeholder="Иван Иванов"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Должность</Label>
                <Input
                  id="position"
                  value={editingMember.position || ''}
                  onChange={(e) => setEditingMember({...editingMember, position: e.target.value})}
                  placeholder="Разработчик"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Отдел</Label>
                <Select
                  value={editingMember.department || ''}
                  onValueChange={(value) => setEditingMember({...editingMember, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите отдел" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Разработка">Разработка</SelectItem>
                    <SelectItem value="Дизайн">Дизайн</SelectItem>
                    <SelectItem value="Маркетинг">Маркетинг</SelectItem>
                    <SelectItem value="Продажи">Продажи</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Администрация">Администрация</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={editingMember.phone || ''}
                  onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram</Label>
                <Input
                  id="telegram"
                  value={editingMember.telegram_username || ''}
                  onChange={(e) => setEditingMember({...editingMember, telegram_username: e.target.value})}
                  placeholder="username"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingMember(null)}>
                <X className="h-4 w-4 mr-2" />
                Отмена
              </Button>
              <Button onClick={handleSave} disabled={loading} className="cyber-glow">
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Сохранить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:border-primary/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.full_name} />
                    <AvatarFallback>{member.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.full_name}</CardTitle>
                    <CardDescription>{member.position || 'Сотрудник'}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeactivate(member.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Contact Info */}
              <div className="space-y-1">
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

              {/* Stats */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-accent" />
                  <span className="text-sm font-mono text-accent">{member.achievements}</span>
                  <span className="text-xs text-muted-foreground">наград</span>
                </div>
                {member.department && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                    {member.department}
                  </Badge>
                )}
              </div>

              {/* Tasks Progress */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Задачи</span>
                  <span className="text-xs font-mono text-primary">
                    {member.totalTasks > 0 ? Math.round((member.tasksCompleted / member.totalTasks) * 100) : 0}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {member.tasksCompleted} из {member.totalTasks} выполнено
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Нет сотрудников в системе</p>
            <Button onClick={handleAddNew} className="cyber-glow">
              <Plus className="h-4 w-4 mr-2" />
              Добавить первого сотрудника
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamManagement;