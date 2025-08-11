import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { action, employeeId, message, taskContext, language } = await req.json();

    console.log('AI Task Assistant called with:', { action, employeeId, message });

    // Get employee profile and context
    let employeeContext = '';
    if (employeeId) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('full_name, position, department, role, skills')
        .eq('id', employeeId)
        .single();

      if (profile) {
        employeeContext = `
Сотрудник: ${profile.full_name}
Должность: ${profile.position || 'Не указана'}
Отдел: ${profile.department || 'Не указан'}
Роль: ${profile.role || 'Не указана'}
Навыки: ${profile.skills ? profile.skills.join(', ') : 'Не указаны'}
        `;
      }

      // Get current tasks for context
      const { data: currentTasks } = await supabaseClient
        .from('tasks')
        .select('title, description, status, priority')
        .eq('assigned_to', employeeId)
        .neq('status', 'completed')
        .limit(5);

      if (currentTasks && currentTasks.length > 0) {
        employeeContext += `\nТекущие активные задачи:\n`;
        currentTasks.forEach((task, index) => {
          employeeContext += `${index + 1}. ${task.title} (${task.status}, приоритет: ${task.priority})\n`;
        });
      }
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'create_task':
        systemPrompt = `Ты - AI помощник Tiger Technology AI для создания персонализированных задач.

Твоя роль:
- Анализируй профиль сотрудника и его текущие задачи
- Создавай четкие, выполнимые задачи с учетом навыков и загрузки
- Предлагай конкретные шаги выполнения
- Учитывай приоритеты и дедлайны
- Используй агрессивный кибер-стиль Tiger Technology AI

Контекст сотрудника:
${employeeContext}

Дополнительный контекст: ${taskContext || 'Нет'}

Отвечай в формате JSON:
{
  "title": "Краткое название задачи",
  "description": "Подробное описание с шагами выполнения",
  "priority": "low|medium|high|critical",
  "estimated_hours": число_часов,
  "tags": ["тег1", "тег2"],
  "recommendations": "Персональные рекомендации для сотрудника"
}`;
        userPrompt = message;
        break;

      case 'analyze_workload':
        systemPrompt = `Ты - AI аналитик Tiger Technology AI для анализа рабочей нагрузки.

Анализируй:
- Текущую загрузку сотрудника
- Баланс между задачами разной сложности
- Соответствие задач навыкам сотрудника
- Рекомендации по оптимизации

Контекст сотрудника:
${employeeContext}

Отвечай в формате JSON:
{
  "workload_status": "low|optimal|high|critical",
  "analysis": "Детальный анализ текущей ситуации",
  "recommendations": ["рекомендация1", "рекомендация2"],
  "suggested_actions": "Конкретные действия для улучшения"
}`;
        userPrompt = "Проанализируй рабочую нагрузку этого сотрудника";
        break;

      case 'suggest_optimization':
        systemPrompt = `Ты - AI стратег Tiger Technology AI для оптимизации задач.

Твоя задача:
- Предлагать улучшения в распределении задач
- Находить узкие места в рабочем процессе
- Рекомендовать развитие навыков
- Предлагать автоматизацию рутинных задач

Контекст сотрудника:
${employeeContext}

Отвечай в формате JSON:
{
  "optimizations": ["оптимизация1", "оптимизация2"],
  "skill_development": "Рекомендации по развитию навыков",
  "automation_opportunities": "Возможности для автоматизации",
  "priority_rebalancing": "Рекомендации по пересмотру приоритетов"
}`;
        userPrompt = message || "Предложи оптимизации для этого сотрудника";
        break;

      default:
        systemPrompt = `Ты - универсальный AI помощник Tiger Technology AI.

Помогаешь с:
- Планированием задач
- Анализом производительности  
- Оптимизацией рабочих процессов
- Персональными рекомендациями

Контекст сотрудника:
${employeeContext}

Отвечай конструктивно и по делу, используя агрессивный кибер-стиль Tiger Technology AI.`;
        userPrompt = message;

        break;
    }

    const targetLanguage = ['ru','bg','en'].includes(language) ? language : 'en';
    const langInstruction = `Language policy:\n- Respond in the same language as the user's last message when possible.\n- If unclear, respond in ${'${targetLanguage.toUpperCase()}'} .\n- Keep JSON keys and enum values in English; translate only human-readable text fields.`;
    systemPrompt = `${systemPrompt}\n\n${langInstruction}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Try to parse as JSON, fallback to plain text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      parsedResponse = { response: aiResponse };
    }

    return new Response(JSON.stringify({
      success: true,
      data: parsedResponse,
      action,
      employeeId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI Task Assistant:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});