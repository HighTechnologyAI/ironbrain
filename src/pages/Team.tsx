import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, ArrowLeft, Plus, Mail, Phone, Calendar, UserCheck, UserX, Loader2, AtSign, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTeamDataWithPresence } from "@/hooks/use-team-data-with-presence";
import { useLanguage } from "@/hooks/use-language";
import CreateTeamMemberForm from "@/components/CreateTeamMemberForm";
import AppNavigation from "@/components/AppNavigation";
import { useAdmin } from "@/hooks/use-admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Team = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { teamMembers, loading, error } = useTeamDataWithPresence();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  // State and functions for team member management will go here
  // For example, state for filtering, sorting, and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editDeptOpen, setEditDeptOpen] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [deptValue, setDeptValue] = useState("");
  const [roleValue, setRoleValue] = useState("");

  // Function to handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Function to handle role filter change
  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
  };
  // Function to filter team members based on search term
  const filteredTeam = teamMembers?.filter(member => {
    const searchMatch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-primary';
      case 'away': return 'bg-amber-500';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return t.online || 'В сети';
      case 'away': return t.away || 'Отошел';
      case 'offline': return t.offline || 'Не в сети';
      default: return t.unknown || 'Неизвестно';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'manager': return 'bg-primary text-primary-foreground';
      case 'employee': return 'bg-secondary text-secondary-foreground';
      case 'intern': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return t.administrator || 'Администратор';
      case 'manager': return t.manager || 'Менеджер';
      case 'employee': return t.employee || 'Сотрудник';
      case 'intern': return t.intern || 'Стажер';
      default: return t.unknown || 'Неизвестно';
    }
  };

  const handleSaveDept = async () => {
    if (!editMemberId) return;
    const { error } = await supabase
      .from('profiles')
      .update({ department: deptValue || null, position: roleValue || null })
      .eq('id', editMemberId);

    if (error) {
      toast({ title: t.error || 'Ошибка', description: error.message || 'Не удалось сохранить отдел', variant: 'destructive' });
      return;
    }

    toast({ title: 'Сохранено', description: 'Профиль обновлён' });
    setEditDeptOpen(false);
    window.location.reload();
  };

  return (
    <>
      <AppNavigation title={t.team || "Команда"} subtitle={t.teamManagement || "Управление участниками команды"} />
      <div className="min-h-screen bg-background p-6">
        {/* Action Button (admin only) */}
        {isAdmin && (
          <div className="flex justify-end mb-6">
            <Button 
              className="cyber-glow"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.addEmployee || 'Добавить сотрудника'}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">{t.loadingTeam || 'Загрузка команды...'}</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive mb-4">{t.dataLoadError || 'Ошибка загрузки данных'}: {error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                {t.tryAgain || 'Попробовать снова'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Team Members Grid */}
        {!loading && !error && teamMembers && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="hover:border-primary/50 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback className="bg-primary/10">
                            {member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(member.status || 'offline')}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.full_name}</CardTitle>
                        <CardDescription>{member.position || t.employee || 'Сотрудник'}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-secondary text-secondary-foreground">
                      {member.position || 'Сотрудник'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getStatusLabel(member.status || 'offline')}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      {t.department || 'Отдел'}: {member.department || 'Не указан'}
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => {
                          setEditMemberId(member.id);
                          setDeptValue(member.department || '');
                          setRoleValue(member.position || '');
                          setEditDeptOpen(true);
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        {t.edit || 'Изм.'}
                      </Button>
                    )}
                  </div>

                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{member.phone}</span>
                    </div>
                  )}

                  {member.telegram_username && (
                    <div className="flex items-center gap-2 text-sm">
                      <AtSign className="h-3 w-3 text-muted-foreground" />
                      <a
                        href={`https://t.me/${member.telegram_username.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        @{member.telegram_username.replace(/^@/, '')}
                      </a>
                    </div>
                  )}

                  {member.hire_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{t.since || 'С'} {new Date(member.hire_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      {t.status || 'Статус'}: {getStatusLabel(member.status || 'offline')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && teamMembers && teamMembers.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t.noTeamMembers || 'Нет участников команды. Добавьте первого сотрудника.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={editDeptOpen} onOpenChange={setEditDeptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование профиля</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Роль</Label>
              <Select value={roleValue} onValueChange={setRoleValue}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent className="z-[1000]">
                  <SelectItem value="Основатель">Основатель</SelectItem>
                  <SelectItem value="Сотрудник">Сотрудник</SelectItem>
                  <SelectItem value="Разработчик">Разработчик</SelectItem>
                  <SelectItem value="Директор">Директор</SelectItem>
                  <SelectItem value="Менеджер">Менеджер</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept">{t.department || 'Отдел'}</Label>
              <Input id="dept" value={deptValue} onChange={(e) => setDeptValue(e.target.value)} placeholder="Введите отдел" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDeptOpen(false)}>Отмена</Button>
            <Button onClick={handleSaveDept}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <CreateTeamMemberForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onMemberCreated={() => window.location.reload()}
        />
      )}
    </>
  );
};

export default Team;
