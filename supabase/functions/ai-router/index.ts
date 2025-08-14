import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestData {
  transcript: string;
  events?: Array<{
    type: string;
    route?: string;
    action?: string;
    payload?: any;
    timestamp: number;
  }>;
  locale?: string;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { transcript, events = [], locale = 'ru-RU', user_id }: RequestData = await req.json();

    if (!transcript) {
      throw new Error('Transcript is required');
    }

    // Build context from recent events
    const contextEvents = events.slice(-5).map(event => 
      `${event.type}: ${event.route || ''} ${event.action || ''} ${JSON.stringify(event.payload || {})}`
    ).join('\n');

    const systemPrompt = `Ты голосовой помощник IronBrain для CRM системы управления дронами и задачами.

ВАЖНО: Ты должен вести живой диалог на русском языке. Отвечай как живой собеседник, а не как робот.

Контекст пользователя:
- Текущая локаль: ${locale}
- Последние действия:
${contextEvents}

Твои возможности:
- openPage(route): Перейти на страницу (например, "/tasks", "/projects")
- search(query): Поиск по системе
- createTask(title, description, assignees?): Создать задачу
- updateTaskStatus(taskId, status): Обновить статус задачи
- translate(text, targetLang): Перевести текст
- payByBank(iban, amount, comment?): Помощь с банковскими платежами

Отвечай естественно и дружелюбно. Если нужно выполнить действие - используй функции. 
Если это просто разговор - отвечай как собеседник.
Максимум 2-3 предложения в ответе для голосового общения.
Ты можешь обсуждать работу, задачи, проекты, отвечать на вопросы и помогать с управлением системой.`;

    // Call OpenAI with function definitions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript }
        ],
        functions: [
          {
            name: 'openPage',
            description: 'Navigate to a page',
            parameters: {
              type: 'object',
              properties: {
                route: { type: 'string', description: 'Page route like /tasks, /projects' }
              },
              required: ['route']
            }
          },
          {
            name: 'search',
            description: 'Search across the system',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search query' }
              },
              required: ['query']
            }
          },
          {
            name: 'createTask',
            description: 'Create a new task',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                assignees: { type: 'array', items: { type: 'string' } }
              },
              required: ['title', 'description']
            }
          },
          {
            name: 'updateTaskStatus',
            description: 'Update task status',
            parameters: {
              type: 'object',
              properties: {
                taskId: { type: 'string' },
                status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] }
              },
              required: ['taskId', 'status']
            }
          },
          {
            name: 'translate',
            description: 'Translate text to target language',
            parameters: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                targetLang: { type: 'string', enum: ['ru', 'bg', 'en', 'uk'] }
              },
              required: ['text', 'targetLang']
            }
          },
          {
            name: 'payByBank',
            description: 'Demo banking payment workflow',
            parameters: {
              type: 'object',
              properties: {
                iban: { type: 'string' },
                amount: { type: 'number' },
                comment: { type: 'string' }
              },
              required: ['iban', 'amount']
            }
          }
        ],
        function_call: 'auto',
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;

    let commands: any[] = [];
    let replyText = message.content || '';

    // Handle function calls
    if (message.function_call) {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      commands.push({
        type: functionName,
        args: functionArgs
      });

      // Generate appropriate response text
      switch (functionName) {
        case 'openPage':
          replyText = `Открываю страницу ${functionArgs.route}`;
          break;
        case 'createTask':
          replyText = `Создаю задачу "${functionArgs.title}"`;
          break;
        case 'search':
          replyText = `Ищу: ${functionArgs.query}`;
          break;
        default:
          replyText = `Выполняю команду ${functionName}`;
      }
    }

    // Log to database
    if (user_id) {
      await supabase.from('ai_assistant_logs').insert({
        user_id,
        session_id: crypto.randomUUID(),
        event: 'transcript',
        payload: {
          transcript,
          events,
          response: replyText,
          commands,
          locale
        }
      });
    }

    return new Response(JSON.stringify({
      replyText,
      commands: commands.length > 0 ? commands : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-router function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});