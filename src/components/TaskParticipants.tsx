import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';

interface TaskParticipant {
  id: string;
  user_id: string;
  joined_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
    position?: string;
  };
}

interface TeamMember {
  id: string;
  full_name: string;
  avatar_url?: string;
  position?: string;
  department?: string;
}

interface TaskParticipantsProps {
  taskId: string;
  participants: TaskParticipant[];
  teamMembers: TeamMember[];
  onParticipantsChange: () => void;
  canManage: boolean;
}

export const TaskParticipants: React.FC<TaskParticipantsProps> = ({
  taskId,
  participants,
  teamMembers,
  onParticipantsChange,
  canManage,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const { t } = useLanguage();

  const availableMembers = teamMembers.filter(
    member => !participants.some(p => p.user_id === member.id)
  );

  const handleAddParticipant = async (userId: string) => {
    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('task_participants')
        .insert({
          task_id: taskId,
          user_id: userId,
        });

      if (error) throw error;

      onParticipantsChange();
      toast({
        title: t.success,
        description: t.participantAdded,
      });
    } catch (error) {
      console.error('Add participant error:', error);
      toast({
        title: t.error,
        description: t.addParticipantFailed,
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('task_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      onParticipantsChange();
      toast({
        title: t.success,
        description: t.participantRemoved,
      });
    } catch (error) {
      console.error('Remove participant error:', error);
      toast({
        title: t.error,
        description: t.removeParticipantFailed,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          {t.participants} ({participants.length})
        </h4>
        {canManage && availableMembers.length > 0 && (
          <Select onValueChange={handleAddParticipant} disabled={isAdding}>
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <SelectValue placeholder={t.addParticipant} />
              </div>
            </SelectTrigger>
            <SelectContent>
              {availableMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {member.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.full_name}</div>
                      {member.position && (
                        <div className="text-xs text-muted-foreground">
                          {member.position}
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {participants.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t.noParticipants}
        </p>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participant.user?.avatar_url} />
                  <AvatarFallback>
                    {participant.user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {participant.user?.full_name || t.unknownUser}
                  </p>
                  <div className="flex items-center gap-2">
                    {participant.user?.position && (
                      <Badge variant="secondary" className="text-xs">
                        {participant.user.position}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {t.joined} {new Date(participant.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {canManage && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveParticipant(participant.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};