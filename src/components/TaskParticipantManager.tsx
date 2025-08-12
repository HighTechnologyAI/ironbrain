import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X, Send } from 'lucide-react';

interface TeamMember {
  id: string;
  full_name: string;
  position: string;
  user_id: string;
}

interface TaskParticipant {
  id: string;
  user_id: string;
  role: string;
  user: {
    id: string;
    full_name: string;
    position: string;
  };
}

interface TaskParticipantManagerProps {
  taskId: string;
  participants: TaskParticipant[];
  onParticipantsChange: () => void;
  canManage: boolean;
}

const TaskParticipantManager = ({ 
  taskId, 
  participants, 
  onParticipantsChange, 
  canManage 
}: TaskParticipantManagerProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isInviting, setIsInviting] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadTeamMembers();
    }
  }, [open]);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, position, user_id')
        .eq('is_active', true);

      if (error) throw error;

      // Фильтруем пользователей, которые уже участвуют в задаче
      const participantUserIds = participants.map(p => p.user.id);
      const availableMembers = (data || []).filter(
        member => !participantUserIds.includes(member.id)
      );

      setTeamMembers(availableMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const inviteParticipant = async () => {
    if (!selectedUserId || !user) return;

    setIsInviting(true);
    try {
      // Добавляем участника
      const { error } = await supabase
        .from('task_participants')
        .insert({
          task_id: taskId,
          user_id: selectedUserId,
          role: 'participant'
        });

      if (error) throw error;

      // В реальном проекте здесь бы создавалось уведомление
      // Пока что просто показываем уведомление
      toast({
        title: t.success,
        description: t.participantAdded,
      });

      setSelectedUserId('');
      setOpen(false);
      onParticipantsChange();
    } catch (error: any) {
      console.error('Error inviting participant:', error);
      const msg = String(error?.message || '').includes('row-level security') || String(error).includes('permission')
        ? 'Недостаточно прав: добавлять участников может только администратор'
        : 'Не удалось назначить участника';
      toast({
        title: t.error,
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const removeParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('task_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      toast({
        title: t.success,
        description: t.participantRemoved,
      });

      onParticipantsChange();
    } catch (error) {
      console.error('Error removing participant:', error);
      toast({
        title: t.error,
        description: t.removeParticipantFailed,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Список участников */}
      <div className="flex flex-wrap gap-2">
        {participants.map((participant) => (
          <Badge key={participant.id} variant="outline" className="flex items-center gap-2 pr-1">
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-xs">
                {participant.user.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{participant.user.full_name}</span>
            {participant.role === 'watcher' && (
              <span className="text-xs opacity-60">({t.participants})</span>
            )}
            {canManage && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeParticipant(participant.id)}
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Badge>
        ))}
      </div>

      {/* Кнопка добавления участника */}
      {canManage && teamMembers.length > 0 && (
        <Dialog open={open} onOpenChange={setOpen} modal={false}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {t.inviteParticipant}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {t.inviteToChat}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сотрудника..." />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {member.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.full_name}</div>
                          <div className="text-xs text-muted-foreground">{member.position}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t.cancel}
                </Button>
                <Button 
                  onClick={inviteParticipant} 
                  disabled={!selectedUserId || isInviting}
                >
                  {isInviting ? (
                    t.sending
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t.inviteToChat}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TaskParticipantManager;