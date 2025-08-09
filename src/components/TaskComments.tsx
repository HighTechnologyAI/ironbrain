import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  UserPlus, 
  Download, 
  FileText, 
  Image as ImageIcon,
  Video,
  File,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { translations } from '@/lib/i18n';
import { fileStorage, fileMetadata, formatFileSize, getFileIcon, type FileMetadata } from '@/lib/storage';
import { database, type DatabaseUser } from '@/lib/database';
import { notificationService } from '@/lib/notifications';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  estimated_hours: number | null;
  actual_hours: number | null;
  tags: string[];
  assigned_to: {
    id: string;
    full_name: string;
    position?: string;
  };
  created_by: {
    id: string;
    full_name: string;
  };
}

interface TaskCommentsProps {
  task: Task;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    position?: string;
  };
  timestamp: Date;
  attachments?: FileMetadata[];
  isSystem?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  position: string;
  avatar?: string;
}

// Real team members will be loaded from database

export const TaskComments: React.FC<TaskCommentsProps> = ({ task }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  // State for real team members from database
  const [teamMembers, setTeamMembers] = useState<DatabaseUser[]>([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(true);
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      content: t.taskCommentsWelcome.replace('{taskTitle}', task.title),
      author: {
        id: 'system',
        name: 'System',
        position: 'Automated'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isSystem: true
    }
  ]);
  
  const [newComment, setNewComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load team members from database
  React.useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const users = await database.getUsers();
        setTeamMembers(users.filter(user => user.is_active));
      } catch (error) {
        console.error('Failed to load team members:', error);
      } finally {
        setLoadingTeamMembers(false);
      }
    };

    loadTeamMembers();
  }, []);

  const handleSendComment = async () => {
    if (!newComment.trim() && selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Upload files if any
      const attachments: FileMetadata[] = [];
      
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          // Validate file before upload
          const validation = fileStorage.validateFile(file);
          if (!validation.valid) {
            console.error(`File validation failed: ${validation.error}`);
            continue;
          }

          // Upload to Cloudinary
          const uploadResult = await fileStorage.uploadFile(file, task.id);
          
          if (uploadResult.success && uploadResult.url && uploadResult.publicId) {
            // Create file metadata
            const fileMetadataObj: FileMetadata = {
              id: Date.now().toString() + Math.random(),
              name: file.name,
              size: file.size,
              type: file.type,
              url: uploadResult.url,
              publicId: uploadResult.publicId,
              uploadedBy: 'OLEKSANDR KOVALCHUK',
              uploadedAt: new Date(),
              taskId: task.id
            };
            
            // Save metadata
            fileMetadata.saveFileMetadata(fileMetadataObj);
            attachments.push(fileMetadataObj);
          } else {
            console.error(`File upload failed: ${uploadResult.error}`);
          }
        }
      }

      // Add comment
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: {
          id: 'current-user',
          name: 'OLEKSANDR KOVALCHUK',
          position: 'Team Lead',
          avatar: '/avatars/current-user.jpg'
        },
        timestamp: new Date(),
        attachments: attachments.length > 0 ? attachments : undefined
      };

      setComments(prev => [...prev, comment]);
      setNewComment('');
      setSelectedFiles([]);
      
    } catch (error) {
      console.error('Error sending comment:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInviteTeamMember = async () => {
    if (!selectedMember) return;

    setIsSendingInvite(true);

    try {
      const selectedUser = teamMembers.find(member => member.id === selectedMember);
      if (!selectedUser) return;

      // Send invitation through notification service
      await notificationService.sendTaskInvitation({
        task_id: task.id,
        task_title: task.title,
        invited_by: 'user-1', // Current user ID (should come from auth context)
        invited_user: selectedMember,
        message: `You've been invited to join the chat for task: ${task.title}`
      });

      // Add system message about invitation
      const inviteComment: Comment = {
        id: Date.now().toString(),
        content: t.taskCommentsInvited.replace('{email}', selectedUser.full_name),
        author: {
          id: 'system',
          name: 'System',
          position: 'Automated'
        },
        timestamp: new Date(),
        isSystem: true
      };

      setComments(prev => [...prev, inviteComment]);
      setSelectedMember('');
      setShowInviteForm(false);

      // Show success message
      console.log(`Invitation sent to ${selectedUser.full_name}`);
      
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const getFileIconComponent = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString(language === 'bg' ? 'bg-BG' : language === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          {t.taskComments}
        </CardTitle>
        <CardDescription className="text-sm">
          {t.taskCommentsDescription}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Team Invitation */}
        <div className="space-y-2">
          {!showInviteForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteForm(true)}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t.taskCommentsInviteTeam}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={loadingTeamMembers ? t.taskCommentsLoading : t.taskCommentsSelectTeamMember} />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>{member.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
              <Button 
                onClick={handleInviteTeamMember} 
                size="sm"
                disabled={!selectedMember || isSendingInvite}
              >
                {isSendingInvite ? t.taskCommentsSending : t.taskCommentsInvite}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowInviteForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="flex-1 space-y-3 max-h-64 overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex gap-3 ${comment.isSystem ? 'opacity-70' : ''}`}
            >
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback className={comment.isSystem ? 'bg-muted' : ''}>
                  {comment.isSystem ? 'S' : comment.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.author.name}</span>
                  {comment.author.position && (
                    <Badge variant="secondary" className="text-xs">
                      {comment.author.position}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatTime(comment.timestamp)}
                  </span>
                </div>
                
                {comment.content && (
                  <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
                )}
                
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {comment.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm"
                      >
                        {getFileIconComponent(file.type)}
                        <div className="flex-1">
                          <div className="font-medium">{file.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {t.taskCommentsUploadedBy} {file.uploadedBy}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => window.open(file.url, '_blank')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* File Attachments Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">{t.taskCommentsAttachedFiles}:</div>
            <div className="space-y-1">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                  {getFileIconComponent(file.type)}
                  <span className="flex-1">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t.taskCommentsWriteComment}
            className="min-h-[80px] resize-none"
            disabled={isUploading}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept="*/*"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {t.taskCommentsAttachFiles}
              </span>
            </div>
            
            <Button
              onClick={handleSendComment}
              disabled={(!newComment.trim() && selectedFiles.length === 0) || isUploading}
              size="sm"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t.taskCommentsUploading}
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t.taskCommentsSend}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskComments;