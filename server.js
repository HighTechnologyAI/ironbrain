// Simple Express server for API endpoints
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const systemPrompts = {
  en: `You are Tiger AI, an expert CRM task management assistant specialized in analyzing specific tasks and providing contextual recommendations.

IMPORTANT: Always analyze the specific task provided and give targeted advice based on its details.

Your analysis should include:
1. Task-specific recommendations based on title, description, and context
2. Priority assessment and time management suggestions
3. Potential challenges specific to this task type
4. Step-by-step action plan
5. Resource requirements and optimization tips
6. Risk mitigation strategies

Be practical, actionable, and specific to the task at hand. Avoid generic responses.
Always respond in English.`,

  ru: `Вы Tiger AI, экспертный помощник по управлению задачами в CRM системе, специализирующийся на анализе конкретных задач и предоставлении контекстных рекомендаций.

ВАЖНО: Всегда анализируйте конкретную предоставленную задачу и давайте целевые советы на основе её деталей.

Ваш анализ должен включать:
1. Специфические рекомендации на основе названия, описания и контекста задачи
2. Оценка приоритета и предложения по управлению временем
3. Потенциальные вызовы, специфичные для данного типа задач
4. Пошаговый план действий
5. Требования к ресурсам и советы по оптимизации
6. Стратегии снижения рисков

Будьте практичны, действенны и конкретны относительно поставленной задачи. Избегайте общих ответов.
Всегда отвечайте на русском языке.`,

  bg: `Вие сте Tiger AI, експертен асистент за управление на задачи в CRM система, специализиран в анализа на конкретни задачи и предоставянето на контекстуални препоръки.

ВАЖНО: Винаги анализирайте конкретната предоставена задача и давайте целенасочени съвети въз основа на нейните детайли.

Вашият анализ трябва да включва:
1. Специфични препоръки въз основа на заглавието, описанието и контекста на задачата
2. Оценка на приоритета и предложения за управление на времето
3. Потенциални предизвикателства, специфични за този тип задачи
4. Стъпка по стъпка план за действие
5. Изисквания за ресурси и съвети за оптимизация
6. Стратегии за намаляване на рисковете

Бъдете практични, действени и конкретни относно поставената задача. Избягвайте общи отговори.
Винаги отговаряйте на български език.`
};

// AI Assistant endpoint
app.post('/ai-assistant', async (req, res) => {
  try {
    const { message, task, language } = req.body;
    
    console.log('AI Assistant Request:', { message, task: task?.title, language });
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Format task context based on language
    const taskContextTemplates = {
      en: `
CURRENT TASK ANALYSIS:
Title: ${task.title}
Description: ${task.description}
Status: ${task.status}
Priority: ${task.priority}
Estimated Time: ${task.estimated_hours || 'not specified'} hours
Assigned To: ${task.assigned_to}
Tags: ${task.tags.join(', ') || 'no tags'}

USER QUESTION: ${message}

Please provide specific, actionable advice for this exact task.`,

      ru: `
АНАЛИЗ ТЕКУЩЕЙ ЗАДАЧИ:
Название: ${task.title}
Описание: ${task.description}
Статус: ${task.status}
Приоритет: ${task.priority}
Планируемое время: ${task.estimated_hours || 'не указано'} часов
Исполнитель: ${task.assigned_to}
Теги: ${task.tags.join(', ') || 'нет тегов'}

ВОПРОС ПОЛЬЗОВАТЕЛЯ: ${message}

Пожалуйста, предоставьте конкретные, действенные советы именно для этой задачи.`,

      bg: `
АНАЛИЗ НА ТЕКУЩАТА ЗАДАЧА:
Заглавие: ${task.title}
Описание: ${task.description}
Статус: ${task.status}
Приоритет: ${task.priority}
Планирано време: ${task.estimated_hours || 'не е посочено'} часа
Възложено на: ${task.assigned_to}
Тагове: ${task.tags.join(', ') || 'няма тагове'}

ВЪПРОС НА ПОТРЕБИТЕЛЯ: ${message}

Моля, предоставете конкретни, действени съвети именно за тази задача.`
    };

    const taskContext = taskContextTemplates[language] || taskContextTemplates.en;

    console.log('Making OpenAI API call...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using gpt-3.5-turbo instead of gpt-4 for better availability
      messages: [
        {
          role: "system",
          content: systemPrompts[language]
        },
        {
          role: "user",
          content: taskContext
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Извините, не удалось получить ответ от AI помощника.';
    
    console.log('OpenAI API response received successfully');
    
    res.json({ response });

  } catch (error) {
    console.error('AI Assistant API Error:', error.message);
    
    // Enhanced fallback response based on task context
    const enhancedFallbackResponse = getEnhancedFallbackResponse(req.body.task, req.body.message, req.body.language || 'en');
    
    res.json({ 
      response: enhancedFallbackResponse,
      error: 'AI service temporarily unavailable, using enhanced fallback response'
    });
  }
});

function getEnhancedFallbackResponse(task, message, language) {
  const taskAnalysis = {
    en: {
      high: "This is a HIGH PRIORITY task that requires immediate attention.",
      medium: "This is a MEDIUM PRIORITY task that should be planned carefully.",
      low: "This is a LOW PRIORITY task that can be scheduled flexibly.",
      development: "For development tasks, consider: 1) Break into smaller subtasks, 2) Set up proper testing environment, 3) Plan code reviews, 4) Document requirements clearly.",
      crm: "For CRM-related tasks: 1) Understand user requirements, 2) Plan data structure, 3) Consider integration points, 4) Plan user training.",
      general: "Task-specific recommendations: 1) Review requirements thoroughly, 2) Estimate time realistically, 3) Identify potential blockers, 4) Plan regular check-ins."
    },
    ru: {
      high: "Это задача ВЫСОКОГО ПРИОРИТЕТА, требующая немедленного внимания.",
      medium: "Это задача СРЕДНЕГО ПРИОРИТЕТА, которую следует тщательно спланировать.",
      low: "Это задача НИЗКОГО ПРИОРИТЕТА, которую можно запланировать гибко.",
      development: "Для задач разработки рекомендую: 1) Разбить на подзадачи, 2) Настроить среду тестирования, 3) Запланировать код-ревью, 4) Четко документировать требования.",
      crm: "Для CRM-задач: 1) Понять требования пользователей, 2) Спланировать структуру данных, 3) Учесть точки интеграции, 4) Запланировать обучение пользователей.",
      general: "Специфические рекомендации для задачи: 1) Тщательно изучить требования, 2) Реалистично оценить время, 3) Выявить потенциальные блокеры, 4) Запланировать регулярные проверки."
    },
    bg: {
      high: "Това е задача с ВИСОК ПРИОРИТЕТ, която изисква незабавно внимание.",
      medium: "Това е задача със СРЕДЕН ПРИОРИТЕТ, която трябва да бъде внимателно планирана.",
      low: "Това е задача с НИСЪК ПРИОРИТЕТ, която може да бъде планирана гъвкаво.",
      development: "За задачи за разработка препоръчвам: 1) Разделяне на подзадачи, 2) Настройване на тестова среда, 3) Планиране на код ревюта, 4) Ясно документиране на изискванията.",
      crm: "За CRM задачи: 1) Разбиране на потребителските изисквания, 2) Планиране на структурата на данните, 3) Отчитане на точките за интеграция, 4) Планиране на обучение на потребителите.",
      general: "Специфични препоръки за задачата: 1) Внимателно преглеждане на изискванията, 2) Реалистична оценка на времето, 3) Идентифициране на потенциални блокери, 4) Планиране на редовни проверки."
    }
  };

  const lang = taskAnalysis[language] || taskAnalysis.en;
  
  let response = `🤖 Tiger AI - Анализ задачи "${task?.title || 'Неизвестная задача'}"\n\n`;
  
  // Priority analysis
  if (task?.priority) {
    response += lang[task.priority] + "\n\n";
  }
  
  // Tag-based recommendations
  if (task?.tags && task.tags.length > 0) {
    const hasDevTag = task.tags.some(tag => tag.toLowerCase().includes('dev'));
    const hasCrmTag = task.tags.some(tag => tag.toLowerCase().includes('crm'));
    
    if (hasDevTag) {
      response += lang.development + "\n\n";
    } else if (hasCrmTag) {
      response += lang.crm + "\n\n";
    } else {
      response += lang.general + "\n\n";
    }
  } else {
    response += lang.general + "\n\n";
  }
  
  // Time estimation
  if (task?.estimated_hours) {
    const timeAdvice = language === 'ru' 
      ? `⏱️ Планируемое время: ${task.estimated_hours} часов. Рекомендую добавить 20% буфер на непредвиденные сложности.`
      : language === 'bg'
      ? `⏱️ Планирано време: ${task.estimated_hours} часа. Препоръчвам да добавите 20% буфер за непредвидени сложности.`
      : `⏱️ Estimated time: ${task.estimated_hours} hours. I recommend adding a 20% buffer for unexpected complexities.`;
    
    response += timeAdvice + "\n\n";
  }
  
  const footer = language === 'ru'
    ? "💡 Это улучшенный анализ на основе данных задачи. Для более детальных рекомендаций попробуйте позже, когда AI сервис будет доступен."
    : language === 'bg'
    ? "💡 Това е подобрен анализ въз основа на данните на задачата. За по-подробни препоръки опитайте по-късно, когато AI услугата бъде достъпна."
    : "💡 This is an enhanced analysis based on task data. For more detailed recommendations, try again later when the AI service is available.";
  
  response += footer;
  
  return response;
}

function getFallbackResponse(language) {
  const fallbacks = {
    en: "I'm Tiger AI, your task management assistant. I'm currently experiencing technical difficulties, but I'm here to help you with task planning and execution. Please try again in a moment.",
    ru: "Я Tiger AI, ваш помощник по управлению задачами. В данный момент у меня технические трудности, но я готов помочь вам с планированием и выполнением задач. Попробуйте еще раз через момент.",
    bg: "Аз съм Tiger AI, вашият асистент за управление на задачи. В момента имам технически затруднения, но съм тук, за да ви помогна с планирането и изпълнението на задачи. Моля, опитайте отново след малко."
  };
  
  return fallbacks[language] || fallbacks.en;
}

app.listen(port, () => {
  console.log(`🚀 AI Assistant API server running on http://localhost:${port}`);
});

export default app;

