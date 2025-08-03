import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Paperclip, 
  Download, 
  Trash2, 
  Users, 
  AtSign,
  MessageCircle,
  File
} from 'lucide-react';
import { format } from 'date-fns';
import { ru, bg } from 'date-fns/locale';
import { APP_CONFIG } from '@/config/app-config';

interface TaskComment {
  id: string;
  content: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  mentioned_users?: string[];
  created_at: string;
  user_id: string;
  user: {
    id: string;
    full_name: string;
  };
}

interface TaskParticipant {
  id: string;
  user_id: string;
  role: string;
  user: {
    id: string;
    full_name: string;
  };
}

interface TaskChatProps {
  taskId: string;
  isTaskCreator: boolean;
}

const TaskChat = ({ taskId, isTaskCreator }: TaskChatProps) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [participants, setParticipants] = useState<TaskParticipant[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const dateLocale = language === 'bg' ? bg : ru;

  useEffect(() => {
    loadComments();
    loadParticipants();
    subscribeToUpdates();
  }, [taskId]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          user:profiles(id, full_name)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('task_participants')
        .select(`
          *,
          user:profiles(id, full_name)
        `)
        .eq('task_id', taskId);

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const subscribeToUpdates = () => {
    const commentsChannel = supabase
      .channel('task-comments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_comments',
        filter: `task_id=eq.${taskId}`
      }, () => {
        loadComments();
      })
      .subscribe();

    const participantsChannel = supabase
      .channel('task-participants')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_participants',
        filter: `task_id=eq.${taskId}`
      }, () => {
        loadParticipants();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(participantsChannel);
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > APP_CONFIG.files.maxFileSize) {
      toast({
        title: t.error,
        description: `Файл слишком большой. Максимальный размер: ${APP_CONFIG.files.maxFileSize / 1024 / 1024}MB`,
        variant: 'destructive',
      });
      return;
    }

    if (!APP_CONFIG.files.allowedTypes.includes(file.type as any)) {
      toast({
        title: t.error,
        description: 'Неподдерживаемый тип файла',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string; size: number } | null> => {
    try {
      const fileName = `${taskId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from(APP_CONFIG.files.bucket)
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(APP_CONFIG.files.bucket)
        .getPublicUrl(fileName);

      return {
        url: urlData.publicUrl,
        name: file.name,
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const addComment = async () => {
    if (!newComment.trim() && !selectedFile) return;
    if (!user) return;

    setLoading(true);
    setUploading(!!selectedFile);

    try {
      let fileData = null;
      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
        if (!fileData) {
          throw new Error('Ошибка загрузки файла');
        }
      }

      const { error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          content: newComment.trim() || 'Прикреплен файл',
          file_url: fileData?.url,
          file_name: fileData?.name,
          file_size: fileData?.size,
        });

      if (error) throw error;

      setNewComment('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: t.success,
        description: 'Комментарий добавлен',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: t.error,
        description: 'Не удалось добавить комментарий',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: t.error,
        description: 'Ошибка скачивания файла',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  return (
    <div className="space-y-4">
      {/* Участники задачи */}
      {participants.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Участники ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant) => (
                <Badge key={participant.id} variant="outline" className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="text-xs">
                      {participant.user.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {participant.user.full_name}
                  {participant.role === 'watcher' && <span className="text-xs opacity-60">(наблюдатель)</span>}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Чат */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Комментарии ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Список комментариев */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {comment.user.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.user.full_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), 'dd.MM.yyyy HH:mm', { locale: dateLocale })}
                    </span>
                  </div>
                  
                  {comment.content && (
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  )}
                  
                  {comment.file_url && comment.file_name && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded border">
                      {isImage(comment.file_name) ? (
                        <img 
                          src={comment.file_url} 
                          alt={comment.file_name}
                          className="h-20 w-20 object-cover rounded"
                        />
                      ) : (
                        <File className="h-6 w-6 text-muted-foreground" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{comment.file_name}</p>
                        {comment.file_size && (
                          <p className="text-xs text-muted-foreground">{formatFileSize(comment.file_size)}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadFile(comment.file_url!, comment.file_name!)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Форма добавления комментария */}
          <div className="space-y-3 border-t pt-3">
            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <File className="h-4 w-4" />
                <span className="text-sm flex-1">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                placeholder="Добавить комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 min-h-[80px]"
                maxLength={APP_CONFIG.comments.maxLength}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept={APP_CONFIG.files.allowedTypes.join(',')}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Paperclip className="h-4 w-4 mr-1" />
                  Файл
                </Button>
              </div>

              <Button
                onClick={addComment}
                disabled={loading || (!newComment.trim() && !selectedFile)}
                size="sm"
              >
                {uploading ? (
                  'Загрузка...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Отправить
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Осталось символов: {APP_CONFIG.comments.maxLength - newComment.length}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskChat;