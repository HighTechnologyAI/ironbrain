import { DatabaseNotification, DatabaseUser } from './database';

export interface TaskInvitation {
  id: string;
  task_id: string;
  task_title: string;
  invited_by: string;
  invited_user: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: Date;
  responded_at?: Date;
}

export interface NotificationService {
  sendTaskInvitation(invitation: Omit<TaskInvitation, 'id' | 'created_at' | 'status'>): Promise<TaskInvitation>;
  respondToInvitation(invitationId: string, response: 'accepted' | 'declined'): Promise<void>;
  getUserNotifications(userId: string): Promise<DatabaseNotification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
}

class MockNotificationService implements NotificationService {
  private invitations: TaskInvitation[] = [];
  private notifications: DatabaseNotification[] = [];

  async sendTaskInvitation(
    invitation: Omit<TaskInvitation, 'id' | 'created_at' | 'status'>
  ): Promise<TaskInvitation> {
    const newInvitation: TaskInvitation = {
      ...invitation,
      id: `invitation-${Date.now()}`,
      status: 'pending',
      created_at: new Date()
    };

    this.invitations.push(newInvitation);

    // Create notification for invited user
    const notification: DatabaseNotification = {
      id: `notification-${Date.now()}`,
      user_id: invitation.invited_user,
      type: 'task_assigned',
      title: 'Task Chat Invitation',
      message: `You've been invited to join the chat for task: ${invitation.task_title}`,
      related_task_id: invitation.task_id,
      related_user_id: invitation.invited_by,
      is_read: false,
      created_at: new Date()
    };

    this.notifications.push(notification);

    // Simulate real-time notification (in real app would use WebSocket/SSE)
    this.simulateRealTimeNotification(notification);

    return newInvitation;
  }

  async respondToInvitation(invitationId: string, response: 'accepted' | 'declined'): Promise<void> {
    const invitation = this.invitations.find(inv => inv.id === invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    invitation.status = response;
    invitation.responded_at = new Date();

    // Create notification for the user who sent the invitation
    const responseNotification: DatabaseNotification = {
      id: `notification-${Date.now()}`,
      user_id: invitation.invited_by,
      type: 'task_updated',
      title: 'Invitation Response',
      message: `Your invitation to join task chat "${invitation.task_title}" was ${response}`,
      related_task_id: invitation.task_id,
      related_user_id: invitation.invited_user,
      is_read: false,
      created_at: new Date()
    };

    this.notifications.push(responseNotification);
    this.simulateRealTimeNotification(responseNotification);
  }

  async getUserNotifications(userId: string): Promise<DatabaseNotification[]> {
    return this.notifications
      .filter(notification => notification.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.is_read = true;
      notification.read_at = new Date();
    }
  }

  private simulateRealTimeNotification(notification: DatabaseNotification) {
    // In a real application, this would send the notification via WebSocket or Server-Sent Events
    console.log('Real-time notification sent:', notification);
    
    // For demo purposes, we can show a browser notification if permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
  }

  // Helper methods for getting invitations
  async getTaskInvitations(taskId: string): Promise<TaskInvitation[]> {
    return this.invitations.filter(inv => inv.task_id === taskId);
  }

  async getUserInvitations(userId: string): Promise<TaskInvitation[]> {
    return this.invitations.filter(inv => inv.invited_user === userId);
  }

  async getPendingInvitations(userId: string): Promise<TaskInvitation[]> {
    return this.invitations.filter(inv => 
      inv.invited_user === userId && inv.status === 'pending'
    );
  }
}

// Export singleton instance
export const notificationService = new MockNotificationService();

// Export types for use in components
export type { DatabaseNotification };

