import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Check, 
  X, 
  MessageCircle,
  Clock,
  User
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { translations } from '@/lib/i18n';
import { notificationService, type TaskInvitation } from '@/lib/notifications';
import { database, getCurrentUser } from '@/lib/database';

interface TaskInvitationNotificationProps {
  onInvitationResponse?: (invitationId: string, response: 'accepted' | 'declined') => void;
}

export const TaskInvitationNotification: React.FC<TaskInvitationNotificationProps> = ({ 
  onInvitationResponse 
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [pendingInvitations, setPendingInvitations] = useState<TaskInvitation[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    loadPendingInvitations();
  }, []);

  const loadPendingInvitations = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;
      
      setCurrentUser(user);
      const invitations = await notificationService.getPendingInvitations(user.id);
      setPendingInvitations(invitations);
    } catch (error) {
      console.error('Failed to load pending invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvitationResponse = async (invitationId: string, response: 'accepted' | 'declined') => {
    setRespondingTo(invitationId);
    
    try {
      await notificationService.respondToInvitation(invitationId, response);
      
      // Remove from pending list
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      // Notify parent component
      onInvitationResponse?.(invitationId, response);
      
      // Show success message
      console.log(`Invitation ${response} successfully`);
      
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
    } finally {
      setRespondingTo(null);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString(language === 'bg' ? 'bg-BG' : language === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInviterName = async (inviterId: string) => {
    try {
      const user = await database.getUser(inviterId);
      return user?.full_name || 'Unknown User';
    } catch {
      return 'Unknown User';
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 animate-pulse" />
            <span className="text-sm text-muted-foreground">Loading notifications...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-300">
          <Bell className="h-5 w-5" />
          {t.taskInvitationsPending || 'Pending Task Invitations'}
          <Badge variant="secondary" className="ml-auto">
            {pendingInvitations.length}
          </Badge>
        </CardTitle>
        <CardDescription className="text-blue-600 dark:text-blue-400">
          {t.taskInvitationsDescription || 'You have been invited to join task chats'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {pendingInvitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border"
          >
            <Avatar className="h-10 w-10 mt-1">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">
                    {t.taskChatInvitation || 'Task Chat Invitation'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(invitation.created_at)}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {invitation.message || `You've been invited to join the chat for task: ${invitation.task_title}`}
                </p>
                
                <div className="text-xs text-muted-foreground">
                  <strong>{t.task || 'Task'}:</strong> {invitation.task_title}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                  disabled={respondingTo === invitation.id}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-1" />
                  {respondingTo === invitation.id ? 
                    (t.accepting || 'Accepting...') : 
                    (t.accept || 'Accept')
                  }
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInvitationResponse(invitation.id, 'declined')}
                  disabled={respondingTo === invitation.id}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <X className="h-4 w-4 mr-1" />
                  {respondingTo === invitation.id ? 
                    (t.declining || 'Declining...') : 
                    (t.decline || 'Decline')
                  }
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TaskInvitationNotification;

