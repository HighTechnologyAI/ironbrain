import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { detectLanguage } from '@/lib/translation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, User } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const taskSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().optional(),
  assigned_to: z.string().min(1, 'Выберите исполнителя'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  due_date: z.date().optional(),
  estimated_hours: z.number().min(1).max(100).optional(),
  tags: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface Employee {
  id: string;
  full_name: string;
  position: string;
  department: string;
}

interface CreateTaskFormProps {
  onTaskCreated?: () => void;
}

const CreateTaskForm = ({ onTaskCreated }: CreateTaskFormProps) => {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { language, t } = useLanguage();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      tags: '',
    },
  });

  useEffect(() => {
    if (open) {
      loadEmployees();
    }
  }, [open]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, position, department')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список сотрудников',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      // Получаем профиль текущего пользователя
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Переводим текст под выбранный язык пользователя
      const originalTitle = data.title;
      const originalDescription = data.description || '';

      let translatedTitle = originalTitle;
      let translatedDescription = originalDescription;
      try {
        const [titleRes, descRes] = await Promise.all([
          supabase.functions.invoke('translate', { body: { text: originalTitle, target: language } }),
          originalDescription
            ? supabase.functions.invoke('translate', { body: { text: originalDescription, target: language } })
            : Promise.resolve({ data: { translated: originalDescription } } as any),
        ]);
        translatedTitle = (titleRes.data as any)?.translated || originalTitle;
        translatedDescription = (descRes as any)?.data?.translated || originalDescription;
      } catch (e) {
        // Если перевод не удался — используем исходный текст
        console.warn('Translation failed, fallback to original:', e);
      }

      // Определяем язык исходного текста
      const detectedLanguage = await detectLanguage(originalTitle + ' ' + originalDescription);

      // Подготавливаем данные задачи
      const taskData = {
        title: translatedTitle,
        description: translatedDescription,
        assigned_to: data.assigned_to,
        created_by: currentProfile.id,
        priority: data.priority,
        due_date: data.due_date?.toISOString(),
        estimated_hours: typeof data.estimated_hours === 'number' ? Math.round(data.estimated_hours) : null,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : null,
        language: detectedLanguage !== 'unknown' ? detectedLanguage : null,
      };

      const { error } = await supabase
        .from('tasks')
        .insert([taskData]);

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Задача создана',
      });

      form.reset();
      setOpen(false);
      onTaskCreated?.();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать задачу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-purple-100 text-purple-800',
  };

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 cyber-border-glow bg-primary/20 hover:bg-primary/30 text-primary hover:text-primary transition-all duration-300">
          <Plus className="h-4 w-4" />
          {t.createTask}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto cyber-border bg-surface-1 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>{t.formCreatingNewTask}</DialogTitle>
          <DialogDescription>
            {t.formFillTaskInfo}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.formTaskTitle}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.formTaskTitlePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.formTaskDescription}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.formTaskDescriptionPlaceholder}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Исполнитель</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите исполнителя" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="cyber-border bg-surface-1 backdrop-blur-md z-50">
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{employee.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {employee.position} • {employee.department}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Приоритет</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="cyber-border bg-surface-1 backdrop-blur-md z-50">
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Badge className={priorityColors[value as keyof typeof priorityColors]}>
                                {label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Планируемые часы</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Часы"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Срок выполнения</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value && 'text-muted-foreground'
                          }`}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Выберите дату</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Опционально: установите срок выполнения задачи
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Теги</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="frontend, срочно, bug (через запятую)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Теги для категоризации задачи (разделяйте запятыми)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t.cancel}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t.sending : t.createTask}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskForm;