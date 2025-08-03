import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';

interface TaskComment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
  onCommentsChange: () => void;
  canComment: boolean;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({
  taskId,
  comments,
  onCommentsChange,
  canComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Get current user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) {
        toast({
          title: t('error'),
          description: t('userNotFound'),
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          content: newComment.trim(),
          author_id: profile.id,
        });

      if (error) throw error;

      setNewComment('');
      onCommentsChange();
      toast({
        title: t('success'),
        description: t('commentAdded'),
      });
    } catch (error) {
      console.error('Comment submission error:', error);
      toast({
        title: t('error'),
        description: t('commentFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        {t('comments')} ({comments.length})
      </h4>

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('noComments')}
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 border rounded-lg bg-muted/30">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author?.avatar_url} />
                <AvatarFallback>
                  {comment.author?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.author?.full_name || t('unknownUser')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <span className="text-xs text-muted-foreground">
                      ({t('edited')})
                    </span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Comment Form */}
      {canComment && (
        <div className="space-y-3 border-t pt-4">
          <Textarea
            placeholder={t('writeComment')}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {t('pressCtrlEnter')}
            </p>
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? t('sending') : t('send')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};