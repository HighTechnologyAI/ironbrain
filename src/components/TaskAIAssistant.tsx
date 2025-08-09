import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Send } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { translations } from '@/lib/i18n';

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

interface TaskAIAssistantProps {
  task: Task;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const TaskAIAssistant: React.FC<TaskAIAssistantProps> = ({ task }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: generateWelcomeMessage(task, t),
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const handleQuickAction = (action: string) => {
    setMessage(action);
    handleSendMessage(action);
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message;
    if (!textToSend.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: textToSend,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Real OpenAI API integration
      const response = await fetch('http://localhost:3001/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          task: {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            estimated_hours: task.estimated_hours,
            tags: task.tags,
            assigned_to: task.assigned_to.full_name
          },
          language: language
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response || generateAIResponse(textToSend, task, t),
        isUser: false,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      
      // Fallback to local response if API fails
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(textToSend, task, t),
        isUser: false,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'bg' ? 'bg-BG' : language === 'ru' ? 'ru-RU' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-green-500" />
          {t.aiTaskAssistant}
        </CardTitle>
        <CardDescription className="text-sm">
          {t.aiAnalyzeContext}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Quick Action Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {t.exampleQuestions}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(t.howToBest)}
              className="text-xs"
            >
              {t.howToBest}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(t.breakIntoSubtasks)}
              className="text-xs"
            >
              {t.breakIntoSubtasks}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(t.giveRecommendations)}
              className="text-xs"
            >
              {t.giveRecommendations}
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 space-y-3 max-h-64 overflow-y-auto">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {!msg.isUser && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-500">{t.tigerAI}</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-500">{t.tigerAI}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.askAiAboutTask}
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {t.enterToSend}, {t.shiftEnterNewLine}
            </p>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!message.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function generateWelcomeMessage(task: Task, t: any): string {
  const statusText = t[task.status] || task.status;
  const priorityText = t[task.priority] || task.priority;
  const tagsText = task.tags.length > 0 ? task.tags.join(', ') : t.aiNoTags;
  
  return `${t.aiGreeting} "${task.title}".

${t.aiKnowDetails}
• ${t.aiPriority}: ${priorityText}
• ${t.aiStatus}: ${statusText}
• ${t.aiAssignee}: ${task.assigned_to.full_name}
• ${t.aiEstimated}: ${task.estimated_hours || 0}${t.hours}
• ${t.aiTags}: ${tagsText}

${t.aiCanHelp}
${t.aiBreakTask}
${t.aiGiveRecommendations}
${t.aiHelpPlanning}
${t.aiAnswerQuestions}
${t.aiSuggestApproach}`;
}

function generateAIResponse(userMessage: string, task: Task, t: any): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes(t.howToBest.toLowerCase()) || lowerMessage.includes('how') || lowerMessage.includes('как')) {
    return `Для эффективного выполнения задачи "${task.title}" рекомендую:

1. Начать с анализа требований
2. Разбить на этапы по ${Math.ceil((task.estimated_hours || 2) / 3)} часа каждый
3. Регулярно фиксировать прогресс
4. При возникновении вопросов - обращаться к команде

Учитывая приоритет "${t[task.priority]}", рекомендую уделить особое внимание качеству выполнения.`;
  }
  
  if (lowerMessage.includes(t.breakIntoSubtasks.toLowerCase()) || lowerMessage.includes('subtask') || lowerMessage.includes('подзадач')) {
    return `Разбиваю задачу "${task.title}" на подзадачи:

📋 **Подзадача 1**: Подготовительный этап
   - Изучение требований
   - Подготовка инструментов
   - Время: 30 мин

📋 **Подзадача 2**: Основная работа
   - Выполнение ключевых действий
   - Время: ${Math.floor((task.estimated_hours || 2) * 0.6)}ч

📋 **Подзадача 3**: Проверка и завершение
   - Тестирование результатов
   - Оформление отчета
   - Время: ${Math.floor((task.estimated_hours || 2) * 0.3)}ч`;
  }
  
  if (lowerMessage.includes(t.giveRecommendations.toLowerCase()) || lowerMessage.includes('recommend') || lowerMessage.includes('препорък')) {
    return `💡 **Рекомендации по задаче "${task.title}":**

🎯 **По приоритету**: Задача имеет приоритет "${t[task.priority]}" - ${getPriorityAdvice(task.priority, t)}

⏰ **По времени**: Запланировано ${task.estimated_hours || 2}ч - рекомендую добавить 20% буфер

👥 **По команде**: Исполнитель - ${task.assigned_to.full_name}, при необходимости можно привлечь коллег

📊 **По качеству**: Регулярно проверяйте промежуточные результаты`;
  }
  
  return `Понял ваш вопрос о задаче "${task.title}". 

Могу предложить следующее:
- Проанализировать текущий статус (${t[task.status]})
- Оценить временные затраты (план: ${task.estimated_hours || 2}ч)
- Предложить оптимальную последовательность действий

Что именно вас интересует больше всего?`;
}

function getPriorityAdvice(priority: string, t: any): string {
  switch (priority) {
    case 'high':
      return 'требует немедленного внимания и качественного выполнения';
    case 'medium':
      return 'важна для проекта, выполняйте в плановом порядке';
    case 'low':
      return 'можно выполнить в свободное время';
    default:
      return 'требует внимания согласно установленному приоритету';
  }
}

export default TaskAIAssistant;

