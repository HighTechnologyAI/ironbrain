import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, MessageCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TaskAIAssistantProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    tags?: string[];
    estimated_hours?: number;
    assigned_to?: {
      full_name: string;
      position: string;
    };
  };
  employeeId?: string;
}

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const TaskAIAssistant = ({ task, employeeId }: TaskAIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addWelcomeMessage = () => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Привет! Я Tiger AI - твой персональный помощник по задаче "${task.title}". 

Я знаю все детали этой задачи:
• Приоритет: ${getPriorityLabel(task.priority)}
• Статус: ${getStatusLabel(task.status)}
• Исполнитель: ${task.assigned_to?.full_name || 'Не назначен'}
${task.estimated_hours ? `• Планируемое время: ${task.estimated_hours}ч` : ''}
${task.tags?.length ? `• Теги: ${task.tags.join(', ')}` : ''}

Чем могу помочь? Могу:
✓ Разбить задачу на подзадачи
✓ Дать рекомендации по выполнению
✓ Помочь с планированием времени
✓ Ответить на вопросы по контексту
✓ Предложить оптимальный подход`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('task-ai-assistant', {
        body: {
          message: input,
          taskContext: {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            tags: task.tags,
            estimated_hours: task.estimated_hours,
            assigned_to: task.assigned_to,
          },
          employeeId,
        },
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Task AI Assistant error:', error);
      toast({
        title: 'Ошибка AI помощника',
        description: error.message || 'Не удалось получить ответ от AI',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Низкий',
      medium: 'Средний', 
      high: 'Высокий',
      critical: 'Критический',
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Ожидает',
      in_progress: 'В работе',
      completed: 'Завершена',
      cancelled: 'Отменена',
      on_hold: 'Приостановлена',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); addWelcomeMessage(); }}
          className="flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          Tiger AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Tiger AI - Помощник по задаче
            <Badge variant="outline" className="ml-2">
              {task.title}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <Card
                  className={`max-w-[80%] p-3 ${
                    message.isBot
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.isBot && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <Card className="bg-muted text-muted-foreground p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Спросите AI о задаче, попросите совет или помощь..."
              className="flex-1 min-h-[60px] max-h-[120px]"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskAIAssistant;