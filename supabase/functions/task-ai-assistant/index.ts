import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, taskContext, employeeId } = await req.json();

    console.log('Task AI Assistant called with:', {
      message,
      taskId: taskContext.id,
      employeeId
    });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Создаем контекстный промпт специально для задачи
    const systemPrompt = `Ты Tiger AI - персональный помощник по управлению задачами в компании Tiger Technology. 

КОНТЕКСТ ЗАДАЧИ:
Название: "${taskContext.title}"
Описание: "${taskContext.description}"
Статус: ${taskContext.status}
Приоритет: ${taskContext.priority}
Исполнитель: ${taskContext.assigned_to?.full_name || 'Не назначен'} (${taskContext.assigned_to?.position || 'Без должности'})
Планируемое время: ${taskContext.estimated_hours || 'Не указано'} часов
Теги: ${taskContext.tags?.join(', ') || 'Нет тегов'}

ТВОЯ РОЛЬ:
- Ты эксперт по этой конкретной задаче
- Даешь практические советы по выполнению именно этой задачи
- Помогаешь разбить задачу на подзадачи
- Предлагаешь оптимальные подходы и методы
- Учитываешь приоритет и контекст задачи
- Отвечаешь четко и по делу, как профессиональный консультант

СТИЛЬ ОБЩЕНИЯ:
- Краткий, четкий, профессиональный
- Конкретные рекомендации, а не общие фразы
- Учитывай специфику задачи и её приоритет
- Будь дружелюбным, но деловым
- Используй emoji для структурирования ответов

Отвечай только на русском языке.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Task AI Response generated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      response: aiResponse,
      taskId: taskContext.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in task-ai-assistant function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});