// Database schema and management for IronBrain CRM
// Supports comments, file attachments, and team collaboration

export interface DatabaseTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string; // User ID
  created_by: string; // User ID
  created_at: Date;
  updated_at: Date;
  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  tags: string[];
  project_id?: string;
}

export interface DatabaseComment {
  id: string;
  task_id: string;
  content: string;
  author_id: string;
  created_at: Date;
  updated_at?: Date;
  is_system: boolean; // For system-generated messages
  parent_id?: string; // For threaded comments
  mentions: string[]; // User IDs mentioned in comment
}

export interface DatabaseFileAttachment {
  id: string;
  task_id: string;
  comment_id?: string; // If attached to specific comment
  name: string;
  original_name: string;
  size: number;
  mime_type: string;
  storage_provider: 'cloudinary' | 'aws_s3' | 'local';
  storage_url: string;
  storage_public_id?: string; // For Cloudinary
  uploaded_by: string; // User ID
  uploaded_at: Date;
  is_deleted: boolean;
  deleted_at?: Date;
  download_count: number;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number; // For videos/audio
    thumbnail_url?: string;
  };
}

export interface DatabaseUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  position?: string;
  department?: string;
  is_active: boolean;
  created_at: Date;
  last_login?: Date;
  preferences: {
    language: 'en' | 'ru' | 'bg';
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      mentions: boolean;
      task_updates: boolean;
    };
  };
}

export interface DatabaseTaskParticipant {
  id: string;
  task_id: string;
  user_id: string;
  role: 'assignee' | 'watcher' | 'collaborator' | 'reviewer';
  added_by: string; // User ID who added this participant
  added_at: Date;
  is_active: boolean;
}

export interface DatabaseNotification {
  id: string;
  user_id: string;
  type: 'task_assigned' | 'task_updated' | 'comment_added' | 'file_uploaded' | 'mentioned' | 'task_completed';
  title: string;
  message: string;
  related_task_id?: string;
  related_comment_id?: string;
  related_user_id?: string;
  is_read: boolean;
  created_at: Date;
  read_at?: Date;
}

// Database operations interface
export interface DatabaseOperations {
  // Tasks
  getTasks(filters?: {
    assigned_to?: string;
    created_by?: string;
    status?: string[];
    priority?: string[];
    search?: string;
  }): Promise<DatabaseTask[]>;
  
  getTask(id: string): Promise<DatabaseTask | null>;
  createTask(task: Omit<DatabaseTask, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseTask>;
  updateTask(id: string, updates: Partial<DatabaseTask>): Promise<DatabaseTask>;
  deleteTask(id: string): Promise<boolean>;

  // Comments
  getComments(task_id: string): Promise<DatabaseComment[]>;
  createComment(comment: Omit<DatabaseComment, 'id' | 'created_at'>): Promise<DatabaseComment>;
  updateComment(id: string, content: string): Promise<DatabaseComment>;
  deleteComment(id: string): Promise<boolean>;

  // File Attachments
  getFileAttachments(task_id: string, comment_id?: string): Promise<DatabaseFileAttachment[]>;
  createFileAttachment(file: Omit<DatabaseFileAttachment, 'id' | 'uploaded_at' | 'download_count'>): Promise<DatabaseFileAttachment>;
  updateFileAttachment(id: string, updates: Partial<DatabaseFileAttachment>): Promise<DatabaseFileAttachment>;
  deleteFileAttachment(id: string): Promise<boolean>;
  incrementDownloadCount(id: string): Promise<void>;

  // Users
  getUsers(): Promise<DatabaseUser[]>;
  getUser(id: string): Promise<DatabaseUser | null>;
  getUserByEmail(email: string): Promise<DatabaseUser | null>;
  createUser(user: Omit<DatabaseUser, 'id' | 'created_at'>): Promise<DatabaseUser>;
  updateUser(id: string, updates: Partial<DatabaseUser>): Promise<DatabaseUser>;

  // Task Participants
  getTaskParticipants(task_id: string): Promise<DatabaseTaskParticipant[]>;
  addTaskParticipant(participant: Omit<DatabaseTaskParticipant, 'id' | 'added_at'>): Promise<DatabaseTaskParticipant>;
  removeTaskParticipant(task_id: string, user_id: string): Promise<boolean>;

  // Notifications
  getNotifications(user_id: string, unread_only?: boolean): Promise<DatabaseNotification[]>;
  createNotification(notification: Omit<DatabaseNotification, 'id' | 'created_at'>): Promise<DatabaseNotification>;
  markNotificationRead(id: string): Promise<boolean>;
  markAllNotificationsRead(user_id: string): Promise<boolean>;
}

// Mock implementation for development
class MockDatabase implements DatabaseOperations {
  private tasks: DatabaseTask[] = [];
  private comments: DatabaseComment[] = [];
  private files: DatabaseFileAttachment[] = [];
  private users: DatabaseUser[] = [];
  private participants: DatabaseTaskParticipant[] = [];
  private notifications: DatabaseNotification[] = [];

  constructor() {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Demo users
    this.users = [
      {
        id: 'user-1',
        email: 'founder@hightechai.site',
        full_name: 'OLEKSANDR KOVALCHUK',
        position: 'Team Lead',
        department: 'Development',
        is_active: true,
        created_at: new Date('2024-01-01'),
        preferences: {
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            mentions: true,
            task_updates: true
          }
        }
      },
      {
        id: 'user-2',
        email: 'developer@hightechai.site',
        full_name: 'MARIA PETROVA',
        position: 'Senior Developer',
        department: 'Development',
        is_active: true,
        created_at: new Date('2024-01-15'),
        preferences: {
          language: 'bg',
          timezone: 'Europe/Sofia',
          notifications: {
            email: true,
            push: false,
            mentions: true,
            task_updates: false
          }
        }
      },
      {
        id: 'user-3',
        email: 'designer@hightechai.site',
        full_name: 'DMITRY GEORGIEV',
        position: 'UI/UX Designer',
        department: 'Design',
        is_active: true,
        created_at: new Date('2024-02-01'),
        preferences: {
          language: 'ru',
          timezone: 'Europe/Moscow',
          notifications: {
            email: true,
            push: true,
            mentions: true,
            task_updates: true
          }
        }
      },
      {
        id: 'user-4',
        email: 'qa@hightechai.site',
        full_name: 'ELENA NIKOLOVA',
        position: 'QA Engineer',
        department: 'Quality Assurance',
        is_active: true,
        created_at: new Date('2024-02-15'),
        preferences: {
          language: 'bg',
          timezone: 'Europe/Sofia',
          notifications: {
            email: false,
            push: true,
            mentions: true,
            task_updates: true
          }
        }
      },
      {
        id: 'user-5',
        email: 'manager@hightechai.site',
        full_name: 'ALEXANDER PETROV',
        position: 'Project Manager',
        department: 'Management',
        is_active: true,
        created_at: new Date('2024-03-01'),
        preferences: {
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            mentions: true,
            task_updates: true
          }
        }
      }
    ];

    // Demo tasks (these will be loaded from existing demo data)
    this.tasks = [
      {
        id: 'task-1',
        title: 'Conduct test system operation',
        description: 'Run test scenario using standard Tiger Technology AI parameters...',
        status: 'in_progress',
        priority: 'medium',
        assigned_to: 'user-1',
        created_by: 'user-1',
        created_at: new Date('2025-08-04T12:11:00'),
        updated_at: new Date('2025-08-04T12:11:00'),
        estimated_hours: 2,
        tags: ['testing', 'report', 'analysis']
      }
    ];
  }

  // Task operations
  async getTasks(filters?: any): Promise<DatabaseTask[]> {
    let filtered = [...this.tasks];
    
    if (filters?.assigned_to) {
      filtered = filtered.filter(task => task.assigned_to === filters.assigned_to);
    }
    
    if (filters?.created_by) {
      filtered = filtered.filter(task => task.created_by === filters.created_by);
    }
    
    if (filters?.status?.length) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }
    
    if (filters?.priority?.length) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search) ||
        task.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    return filtered;
  }

  async getTask(id: string): Promise<DatabaseTask | null> {
    return this.tasks.find(task => task.id === id) || null;
  }

  async createTask(task: Omit<DatabaseTask, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseTask> {
    const newTask: DatabaseTask = {
      ...task,
      id: `task-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<DatabaseTask>): Promise<DatabaseTask> {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) throw new Error('Task not found');
    
    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updated_at: new Date()
    };
    
    return this.tasks[index];
  }

  async deleteTask(id: string): Promise<boolean> {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) return false;
    
    this.tasks.splice(index, 1);
    return true;
  }

  // Comment operations
  async getComments(task_id: string): Promise<DatabaseComment[]> {
    return this.comments.filter(comment => comment.task_id === task_id);
  }

  async createComment(comment: Omit<DatabaseComment, 'id' | 'created_at'>): Promise<DatabaseComment> {
    const newComment: DatabaseComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      created_at: new Date()
    };
    this.comments.push(newComment);
    return newComment;
  }

  async updateComment(id: string, content: string): Promise<DatabaseComment> {
    const index = this.comments.findIndex(comment => comment.id === id);
    if (index === -1) throw new Error('Comment not found');
    
    this.comments[index] = {
      ...this.comments[index],
      content,
      updated_at: new Date()
    };
    
    return this.comments[index];
  }

  async deleteComment(id: string): Promise<boolean> {
    const index = this.comments.findIndex(comment => comment.id === id);
    if (index === -1) return false;
    
    this.comments.splice(index, 1);
    return true;
  }

  // File operations
  async getFileAttachments(task_id: string, comment_id?: string): Promise<DatabaseFileAttachment[]> {
    return this.files.filter(file => 
      file.task_id === task_id && 
      (!comment_id || file.comment_id === comment_id) &&
      !file.is_deleted
    );
  }

  async createFileAttachment(file: Omit<DatabaseFileAttachment, 'id' | 'uploaded_at' | 'download_count'>): Promise<DatabaseFileAttachment> {
    const newFile: DatabaseFileAttachment = {
      ...file,
      id: `file-${Date.now()}`,
      uploaded_at: new Date(),
      download_count: 0
    };
    this.files.push(newFile);
    return newFile;
  }

  async updateFileAttachment(id: string, updates: Partial<DatabaseFileAttachment>): Promise<DatabaseFileAttachment> {
    const index = this.files.findIndex(file => file.id === id);
    if (index === -1) throw new Error('File not found');
    
    this.files[index] = { ...this.files[index], ...updates };
    return this.files[index];
  }

  async deleteFileAttachment(id: string): Promise<boolean> {
    const index = this.files.findIndex(file => file.id === id);
    if (index === -1) return false;
    
    this.files[index].is_deleted = true;
    this.files[index].deleted_at = new Date();
    return true;
  }

  async incrementDownloadCount(id: string): Promise<void> {
    const file = this.files.find(f => f.id === id);
    if (file) {
      file.download_count++;
    }
  }

  // User operations
  async getUsers(): Promise<DatabaseUser[]> {
    return this.users.filter(user => user.is_active);
  }

  async getUser(id: string): Promise<DatabaseUser | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async createUser(user: Omit<DatabaseUser, 'id' | 'created_at'>): Promise<DatabaseUser> {
    const newUser: DatabaseUser = {
      ...user,
      id: `user-${Date.now()}`,
      created_at: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<DatabaseUser>): Promise<DatabaseUser> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) throw new Error('User not found');
    
    this.users[index] = { ...this.users[index], ...updates };
    return this.users[index];
  }

  // Participant operations
  async getTaskParticipants(task_id: string): Promise<DatabaseTaskParticipant[]> {
    return this.participants.filter(p => p.task_id === task_id && p.is_active);
  }

  async addTaskParticipant(participant: Omit<DatabaseTaskParticipant, 'id' | 'added_at'>): Promise<DatabaseTaskParticipant> {
    const newParticipant: DatabaseTaskParticipant = {
      ...participant,
      id: `participant-${Date.now()}`,
      added_at: new Date()
    };
    this.participants.push(newParticipant);
    return newParticipant;
  }

  async removeTaskParticipant(task_id: string, user_id: string): Promise<boolean> {
    const index = this.participants.findIndex(p => p.task_id === task_id && p.user_id === user_id);
    if (index === -1) return false;
    
    this.participants[index].is_active = false;
    return true;
  }

  // Notification operations
  async getNotifications(user_id: string, unread_only?: boolean): Promise<DatabaseNotification[]> {
    let filtered = this.notifications.filter(n => n.user_id === user_id);
    if (unread_only) {
      filtered = filtered.filter(n => !n.is_read);
    }
    return filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async createNotification(notification: Omit<DatabaseNotification, 'id' | 'created_at'>): Promise<DatabaseNotification> {
    const newNotification: DatabaseNotification = {
      ...notification,
      id: `notification-${Date.now()}`,
      created_at: new Date()
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return false;
    
    notification.is_read = true;
    notification.read_at = new Date();
    return true;
  }

  async markAllNotificationsRead(user_id: string): Promise<boolean> {
    const userNotifications = this.notifications.filter(n => n.user_id === user_id && !n.is_read);
    userNotifications.forEach(n => {
      n.is_read = true;
      n.read_at = new Date();
    });
    return true;
  }
}

// Singleton database instance
export const database = new MockDatabase();

// Helper functions for common operations
export const getCurrentUser = async (): Promise<DatabaseUser | null> => {
  // In production, this would get the current user from authentication context
  return await database.getUserByEmail('founder@hightechai.site');
};

export const createTaskComment = async (
  taskId: string, 
  content: string, 
  authorId: string,
  mentions: string[] = []
): Promise<DatabaseComment> => {
  const comment = await database.createComment({
    task_id: taskId,
    content,
    author_id: authorId,
    is_system: false,
    mentions
  });

  // Create notifications for mentions
  if (mentions.length > 0) {
    const author = await database.getUser(authorId);
    for (const mentionedUserId of mentions) {
      await database.createNotification({
        user_id: mentionedUserId,
        type: 'mentioned',
        title: 'You were mentioned in a comment',
        message: `${author?.full_name || 'Someone'} mentioned you in a task comment`,
        related_task_id: taskId,
        related_comment_id: comment.id,
        related_user_id: authorId,
        is_read: false
      });
    }
  }

  return comment;
};

export const attachFileToTask = async (
  taskId: string,
  fileMetadata: {
    name: string;
    size: number;
    mime_type: string;
    storage_url: string;
    storage_public_id?: string;
  },
  uploadedBy: string,
  commentId?: string
): Promise<DatabaseFileAttachment> => {
  return await database.createFileAttachment({
    task_id: taskId,
    comment_id: commentId,
    name: fileMetadata.name,
    original_name: fileMetadata.name,
    size: fileMetadata.size,
    mime_type: fileMetadata.mime_type,
    storage_provider: 'cloudinary',
    storage_url: fileMetadata.storage_url,
    storage_public_id: fileMetadata.storage_public_id,
    uploaded_by: uploadedBy,
    is_deleted: false
  });
};

