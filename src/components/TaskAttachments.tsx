import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Download, X, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PROJECT_CONFIG } from '@/config/project';
import { useLanguage } from '@/hooks/use-language';

interface TaskAttachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
}

interface TaskAttachmentsProps {
  taskId: string;
  attachments: TaskAttachment[];
  onAttachmentsChange: () => void;
  canUpload: boolean;
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  taskId,
  attachments,
  onAttachmentsChange,
  canUpload,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!PROJECT_CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
          toast({
            title: t('error'),
            description: `${t('unsupportedFileType')}: ${file.type}`,
            variant: 'destructive',
          });
          continue;
        }

        // Validate file size
        if (file.size > PROJECT_CONFIG.FILE_UPLOAD.MAX_FILE_SIZE) {
          toast({
            title: t('error'),
            description: `${t('fileTooLarge')}: ${formatFileSize(file.size)}`,
            variant: 'destructive',
          });
          continue;
        }

        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${taskId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: storageError } = await supabase.storage
          .from(PROJECT_CONFIG.FILE_UPLOAD.STORAGE_BUCKET)
          .upload(fileName, file);

        if (storageError) {
          toast({
            title: t('error'),
            description: t('uploadFailed'),
            variant: 'destructive',
          });
          continue;
        }

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
          continue;
        }

        // Save attachment record
        const { error: dbError } = await supabase
          .from('task_attachments')
          .insert({
            task_id: taskId,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: profile.id,
          });

        if (dbError) {
          // Clean up uploaded file if database insert fails
          await supabase.storage
            .from(PROJECT_CONFIG.FILE_UPLOAD.STORAGE_BUCKET)
            .remove([fileName]);
          
          toast({
            title: t('error'),
            description: t('uploadFailed'),
            variant: 'destructive',
          });
          continue;
        }
      }

      onAttachmentsChange();
      toast({
        title: t('success'),
        description: t('filesUploaded'),
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('error'),
        description: t('uploadFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (attachment: TaskAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from(PROJECT_CONFIG.FILE_UPLOAD.STORAGE_BUCKET)
        .download(attachment.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: t('error'),
        description: t('downloadFailed'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (attachmentId: string, filePath: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(PROJECT_CONFIG.FILE_UPLOAD.STORAGE_BUCKET)
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
      }

      onAttachmentsChange();
      toast({
        title: t('success'),
        description: t('fileDeleted'),
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: t('error'),
        description: t('deleteFailed'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          {t('attachments')} ({attachments.length})
        </h4>
        {canUpload && (
          <div>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              accept={PROJECT_CONFIG.FILE_UPLOAD.ALLOWED_TYPES.join(',')}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? t('uploading') : t('addFile')}
            </Button>
          </div>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {attachment.file_type.split('/')[1]?.toUpperCase()}
                    </Badge>
                    <span>{formatFileSize(attachment.file_size)}</span>
                    <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {canUpload && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(attachment.id, attachment.file_path)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};