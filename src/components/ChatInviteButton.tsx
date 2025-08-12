import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Send } from 'lucide-react';

interface ChatInviteButtonProps {
  taskId: string;
  taskTitle?: string;
}

interface Profile {
  id: string;
  full_name: string;
  user_id: string;
}

const ChatInviteButton = ({ taskId, taskTitle }: ChatInviteButtonProps) => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, user_id')
        .eq('is_active', true)
        .neq('user_id', user?.id); // Исключаем текущего пользователя

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpen(true);
    loadProfiles();
  };

  const sendChatInvitation = async () => {
    if (!selectedUser || !user) return;

    setLoading(true);
    try {
      // Получаем профиль отправителя
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .single();

      if (!senderProfile) throw new Error('Sender profile not found');

      // Создаем приглашение в чат
      const { data: invitation, error: inviteError } = await supabase
        .from('chat_invitations')
        .insert({
          task_id: taskId,
          inviter_id: senderProfile.id,
          invited_user_id: selectedUser,
          message: message || undefined,
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Создаем уведомление для приглашенного пользователя
      const invitationMessage = message || 
        (language === 'en' ? `You have been invited to join the chat for task "${taskTitle || 'Unnamed Task'}"` :
         language === 'ru' ? `Вас пригласили в чат задачи "${taskTitle || 'Безымянная задача'}"` :
         `Поканени сте да се присъедините към чата на задача "${taskTitle || 'Задача без име'}"`);

      await supabase
        .from('notifications')
        .insert({
          user_id: selectedUser,
          type: 'chat_invitation',
          title: language === 'en' ? 'Chat Invitation' : 
                 language === 'ru' ? 'Приглашение в чат' : 
                 'Покана за чат',
          message: invitationMessage,
          data: {
            task_id: taskId,
            task_title: taskTitle,
            inviter_name: senderProfile.full_name,
            chat_invitation_id: invitation.id
          },
          created_by: senderProfile.id
        });

      toast({
        title: language === 'en' ? 'Success' : language === 'ru' ? 'Успешно' : 'Успех',
        description: language === 'en' ? 'Chat invitation sent' : 
                     language === 'ru' ? 'Приглашение в чат отправлено' : 
                     'Поканата за чат е изпратена',
      });

      setOpen(false);
      setSelectedUser('');
      setMessage('');
    } catch (error) {
      console.error('Error sending chat invitation:', error);
      toast({
        title: language === 'en' ? 'Error' : language === 'ru' ? 'Ошибка' : 'Грешка',
        description: language === 'en' ? 'Failed to send invitation' : 
                     language === 'ru' ? 'Не удалось отправить приглашение' : 
                     'Неуспешно изпращане на покана',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenDialog}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {language === 'en' ? 'Invite to Chat' : 
           language === 'ru' ? 'Пригласить в чат' : 
           'Покани в чат'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'en' ? 'Invite to Chat' : 
             language === 'ru' ? 'Пригласить в чат' : 
             'Покани в чат'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en' ? 'Select a user to invite to this task chat' : 
             language === 'ru' ? 'Выберите пользователя для приглашения в чат задачи' : 
             'Изберете потребител за покана в чата на задачата'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {language === 'en' ? 'Select User' : 
               language === 'ru' ? 'Выберите пользователя' : 
               'Изберете потребител'}
            </label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder={
                  language === 'en' ? 'Choose a user...' : 
                  language === 'ru' ? 'Выберите пользователя...' : 
                  'Изберете потребител...'
                } />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {language === 'en' ? 'Message (Optional)' : 
               language === 'ru' ? 'Сообщение (необязательно)' : 
               'Съобщение (по желание)'}
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                language === 'en' ? 'Add a personal message...' : 
                language === 'ru' ? 'Добавьте личное сообщение...' : 
                'Добавете лично съобщение...'
              }
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {language === 'en' ? 'Cancel' : 
               language === 'ru' ? 'Отмена' : 
               'Отказ'}
            </Button>
            <Button 
              onClick={sendChatInvitation} 
              disabled={!selectedUser || loading}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? 
                (language === 'en' ? 'Sending...' : 
                 language === 'ru' ? 'Отправка...' : 
                 'Изпращане...') :
                (language === 'en' ? 'Send Invitation' : 
                 language === 'ru' ? 'Отправить приглашение' : 
                 'Изпрати покана')
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatInviteButton;