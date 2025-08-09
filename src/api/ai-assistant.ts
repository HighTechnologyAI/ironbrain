// API endpoint for AI Assistant with OpenAI integration
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface TaskContext {
  title: string;
  description: string;
  status: string;
  priority: string;
  estimated_hours: number | null;
  tags: string[];
  assigned_to: string;
}

interface AIRequest {
  message: string;
  task: TaskContext;
  language: 'en' | 'ru' | 'bg';
}

const systemPrompts = {
  en: `You are Tiger AI, an expert CRM task management assistant. You help users with task planning, execution, and optimization. 
  
  Provide practical, actionable advice. Be concise but thorough. Focus on productivity and efficiency.
  
  When analyzing tasks, consider:
  - Priority level and urgency
  - Time estimates and deadlines
  - Resource requirements
  - Potential obstacles
  - Best practices for similar tasks
  
  Always respond in English.`,
  
  ru: `Вы Tiger AI, экспертный помощник по управлению задачами в CRM системе. Вы помогаете пользователям с планированием, выполнением и оптимизацией задач.
  
  Предоставляйте практические, действенные советы. Будьте лаконичны, но основательны. Сосредоточьтесь на продуктивности и эффективности.
  
  При анализе задач учитывайте:
  - Уровень приоритета и срочность
  - Временные оценки и дедлайны
  - Требования к ресурсам
  - Потенциальные препятствия
  - Лучшие практики для похожих задач
  
  Всегда отвечайте на русском языке.`,
  
  bg: `Вие сте Tiger AI, експертен асистент за управление на задачи в CRM система. Помагате на потребителите с планиране, изпълнение и оптимизация на задачи.
  
  Предоставяйте практични, действени съвети. Бъдете лаконични, но основателни. Съсредоточете се върху продуктивността и ефективността.
  
  При анализ на задачи отчитайте:
  - Ниво на приоритет и спешност
  - Времеви оценки и крайни срокове
  - Изисквания за ресурси
  - Потенциални препятствия
  - Най-добри практики за подобни задачи
  
  Винаги отговаряйте на български език.`
};

export async function POST(request: Request) {
  try {
    const { message, task, language }: AIRequest = await request.json();
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const taskContext = `
Текущая задача:
Название: ${task.title}
Описание: ${task.description}
Статус: ${task.status}
Приоритет: ${task.priority}
Планируемое время: ${task.estimated_hours || 'не указано'} часов
Исполнитель: ${task.assigned_to}
Теги: ${task.tags.join(', ') || 'нет тегов'}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompts[language] + "\n\n" + taskContext
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Извините, не удалось получить ответ от AI помощника.';

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Assistant API Error:', error);
    
    // Fallback response if OpenAI fails
    const fallbackResponse = getFallbackResponse(language);
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      error: 'AI service temporarily unavailable, using fallback response'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function getFallbackResponse(language: 'en' | 'ru' | 'bg'): string {
  const fallbacks = {
    en: "I'm Tiger AI, your task management assistant. I'm currently experiencing technical difficulties, but I'm here to help you with task planning and execution. Please try again in a moment.",
    ru: "Я Tiger AI, ваш помощник по управлению задачами. В данный момент у меня технические трудности, но я готов помочь вам с планированием и выполнением задач. Попробуйте еще раз через момент.",
    bg: "Аз съм Tiger AI, вашият асистент за управление на задачи. В момента имам технически затруднения, но съм тук, за да ви помогна с планирането и изпълнението на задачи. Моля, опитайте отново след малко."
  };
  
  return fallbacks[language];
}

