import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface CreateIssueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIssueCreated: () => void;
}

const CreateIssueForm: React.FC<CreateIssueFormProps> = ({
  open,
  onOpenChange,
  onIssueCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
  });

  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Ошибка",
        description: "Название и описание обязательны",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: profile, error: profileError } = await supabase.rpc('get_current_user_profile');
      if (profileError) throw profileError;

      const { error } = await supabase
        .from('issues')
        .insert([{
          title: formData.title.trim(),
          description: formData.description.trim(),
          severity: formData.severity as any,
          status: 'open',
          reported_by: (profile as any)?.id ?? null,
        }]);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Проблема создана успешно",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
      });

      onOpenChange(false);
      onIssueCreated();
    } catch (error: any) {
      console.error('Error creating issue:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать проблему",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Создать проблему</DialogTitle>
          <DialogDescription>
            Сообщите о новой проблеме или ошибке в системе
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название проблемы *</Label>
            <Input
              id="title"
              placeholder="Краткое описание проблемы"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Подробное описание *</Label>
            <Textarea
              id="description"
              placeholder="Опишите проблему подробно"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Серьезность</Label>
            <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите серьезность" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкая</SelectItem>
                <SelectItem value="medium">Средняя</SelectItem>
                <SelectItem value="high">Высокая</SelectItem>
                <SelectItem value="critical">Критическая</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                'Создать проблему'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIssueForm;