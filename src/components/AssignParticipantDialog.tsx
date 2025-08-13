import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AssignParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  onAssigned?: () => void;
}

interface TeamMember {
  id: string;
  full_name: string;
  position: string | null;
}

const AssignParticipantDialog = ({ open, onOpenChange, taskId, onAssigned }: AssignParticipantDialogProps) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!open || !taskId) return;
      try {
        // Load all active members
        const { data: allMembers, error: membersError } = await supabase
          .from('profiles')
          .select('id, full_name, position')
          .eq('is_active', true)
          .order('full_name');
        if (membersError) throw membersError;

        // Load existing participants for this task
        const { data: existing, error: participantsError } = await supabase
          .from('task_participants')
          .select('user_id')
          .eq('task_id', taskId);
        if (participantsError) throw participantsError;

        const existingIds = new Set((existing || []).map((e: any) => e.user_id));
        const available = (allMembers || []).filter((m) => !existingIds.has(m.id));
        setMembers(available);
        setSelectedUser(null);
      } catch (e) {
        console.error('Ошибка загрузки участников:', e);
        toast({ title: 'Ошибка', description: 'Не удалось загрузить список сотрудников', variant: 'destructive' });
      }
    };
    loadData();
  }, [open, taskId, toast]);

  const assign = async () => {
    if (!taskId || !selectedUser) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('task_participants')
        .insert({ task_id: taskId, user_id: selectedUser });
      if (error) throw error;
      toast({ title: 'Успешно', description: 'Сотрудник добавлен к задаче' });
      onAssigned?.();
      onOpenChange(false);
    } catch (e) {
      console.error('Ошибка назначения:', e);
      toast({ title: 'Ошибка', description: 'Не удалось назначить сотрудника', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Назначить участника</DialogTitle>
          <DialogDescription>Выберите сотрудника для добавления к задаче</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Select value={selectedUser ?? undefined} onValueChange={(v) => setSelectedUser(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите сотрудника" />
            </SelectTrigger>
            <SelectContent>
              {members.length === 0 ? (
                <SelectItem disabled value="none">Нет доступных сотрудников</SelectItem>
              ) : (
                members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.full_name}{m.position ? ` · ${m.position}` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={assign} disabled={!selectedUser || loading}>
            Назначить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignParticipantDialog;
