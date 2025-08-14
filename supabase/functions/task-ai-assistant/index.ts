import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);

interface TaskAssistantRequest {
  message: string;
  taskId?: string;
  projectId?: string;
  context?: {
    previousMessages?: any[];
    suggestions?: any[];
  };
}

interface TaskSuggestion {
  id: string;
  type: 'priority' | 'deadline' | 'assignment' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  action: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI Task Assistant function called');
    
    const body: TaskAssistantRequest = await req.json();
    const { message, taskId, projectId, context } = body;

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing task assistant request:', { message, taskId, projectId });

    let response = '';
    let suggestions: TaskSuggestion[] = [];
    
    // Get task context if taskId is provided
    let taskContext = '';
    if (taskId) {
      const { data: task } = await supabase
        .from('tasks')
        .select('title, description, status, priority, due_date, assigned_to, created_by')
        .eq('id', taskId)
        .single();
      
      if (task) {
        taskContext = `Current task: ${task.title} - ${task.description}. Status: ${task.status}, Priority: ${task.priority}`;
      }
    }

    // Prepare system prompt for AI assistant
    const systemPrompt = `You are an AI Task Assistant specialized in project management and UAV operations. 
    You help with task optimization, team coordination, deadline management, and operational efficiency.
    
    Context: ${taskContext}
    
    Your capabilities:
    - Analyze task complexity and suggest optimizations
    - Recommend team members and resource allocation
    - Estimate completion times and identify dependencies
    - Suggest priority adjustments based on project needs
    - Provide insights on task management best practices
    
    Always be helpful, concise, and actionable in your responses.`;

    // Try Perplexity API first for real-time information
    if (perplexityApiKey) {
      try {
        console.log('Using Perplexity AI for task assistance');
        
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: message
              }
            ],
            temperature: 0.2,
            top_p: 0.9,
            max_tokens: 1000,
            return_images: false,
            return_related_questions: false,
            search_recency_filter: 'month',
            frequency_penalty: 1,
            presence_penalty: 0
          }),
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          response = perplexityData.choices[0].message.content;
        }
      } catch (error) {
        console.error('Perplexity API error:', error);
      }
    }

    // Fallback to OpenAI if Perplexity fails or is not available
    if (!response && openAIApiKey) {
      try {
        console.log('Using OpenAI for task assistance');
        
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          }),
        });

        if (openAIResponse.ok) {
          const openAIData = await openAIResponse.json();
          response = openAIData.choices[0].message.content;
        }
      } catch (error) {
        console.error('OpenAI API error:', error);
      }
    }

    // Generate task suggestions based on the message
    if (message.toLowerCase().includes('optimize') || message.toLowerCase().includes('improve')) {
      suggestions = [
        {
          id: 'opt_1',
          type: 'optimization',
          title: 'Break Task into Subtasks',
          description: 'Divide this task into smaller, manageable subtasks for better tracking',
          confidence: 85,
          impact: 'high',
          action: 'Create 3-4 subtasks with clear deliverables'
        },
        {
          id: 'opt_2',
          type: 'assignment',
          title: 'Add Subject Matter Expert',
          description: 'Assign a specialist to provide technical guidance',
          confidence: 78,
          impact: 'medium',
          action: 'Invite specialist from engineering team'
        }
      ];
    }

    if (message.toLowerCase().includes('deadline') || message.toLowerCase().includes('time')) {
      suggestions.push({
        id: 'time_1',
        type: 'deadline',
        title: 'Adjust Timeline',
        description: 'Based on current workload, consider extending deadline',
        confidence: 72,
        impact: 'medium',
        action: 'Extend deadline by 2-3 business days'
      });
    }

    // Store the interaction in the database
    if (taskId) {
      try {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', req.headers.get('x-user-id'))
          .single();

        if (userProfile) {
          // Store user message
          await supabase.from('task_ai_messages').insert({
            task_id: taskId,
            user_id: userProfile.id,
            content: message,
            is_bot: false
          });

          // Store bot response
          await supabase.from('task_ai_messages').insert({
            task_id: taskId,
            user_id: userProfile.id,
            content: response || 'I understand your request and am here to help with task management.',
            is_bot: true
          });
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    // Default response if no AI service is available
    if (!response) {
      response = generateDefaultResponse(message);
    }

    return new Response(
      JSON.stringify({
        response,
        suggestions,
        timestamp: new Date().toISOString(),
        taskId,
        context: taskContext || 'No specific task context'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error in ai-task-assistant function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: 'I apologize, but I\'m having trouble right now. However, I can still help you with task management best practices and suggestions.',
        suggestions: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

function generateDefaultResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('optimize') || lowerMessage.includes('improve')) {
    return 'To optimize this task, consider breaking it into smaller subtasks, identifying dependencies, and ensuring proper resource allocation. I can help you analyze the task complexity and suggest improvements.';
  }
  
  if (lowerMessage.includes('deadline') || lowerMessage.includes('time')) {
    return 'For timeline management, I recommend reviewing the task scope, checking team availability, and considering any dependencies. Would you like me to help estimate the completion time?';
  }
  
  if (lowerMessage.includes('team') || lowerMessage.includes('assign')) {
    return 'For team assignments, consider the skills required, current workload, and expertise needed. I can help you identify the right team members for this task.';
  }
  
  if (lowerMessage.includes('priority')) {
    return 'Task prioritization should consider business impact, dependencies, deadlines, and resource availability. I can help you analyze these factors to determine the optimal priority level.';
  }
  
  return 'I\'m here to help you with task management, optimization, team coordination, and project planning. How can I assist you with this task?';
}