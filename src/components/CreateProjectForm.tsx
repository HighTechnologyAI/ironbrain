import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface CreateProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  open,
  onOpenChange,
  onProjectCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    status: 'planning'
  });

  const { toast } = useToast();
  const { t } = useLanguage();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Название проекта обязательно",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('companies')
        .insert([{
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          industry: formData.industry.trim() || null,
          contact_person: formData.contact_person.trim() || null,
          contact_email: formData.contact_email.trim() || null,
          contact_phone: formData.contact_phone.trim() || null,
          website: formData.website.trim() || null,
          status: formData.status
        }]);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Проект создан успешно",
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        industry: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        status: 'planning'
      });

      onOpenChange(false);
      onProjectCreated();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать проект",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.formCreateNewProject}</DialogTitle>
          <DialogDescription>
            {t.formAddNewCompany}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.formProjectName}</Label>
              <Input
                id="name"
                placeholder={t.formProjectNamePlaceholder}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">{t.formIndustry}</Label>
              <Input
                id="industry"
                placeholder={t.formIndustryPlaceholder}
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Описание проекта"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Контактное лицо</Label>
              <Input
                id="contact_person"
                placeholder="Имя контактного лица"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="email@example.com"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Телефон</Label>
              <Input
                id="contact_phone"
                placeholder="+7 (xxx) xxx-xx-xx"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Веб-сайт</Label>
              <Input
                id="website"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус проекта</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Планирование</SelectItem>
                <SelectItem value="active">Активный</SelectItem>
                <SelectItem value="on-hold">Приостановлен</SelectItem>
                <SelectItem value="completed">Завершён</SelectItem>
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
                'Создать проект'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectForm;