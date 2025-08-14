export default {
  name: 'ai-multi-provider',
  serve: async (req) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const { provider, action, data, model } = await req.json();
      
      let response;
      
      switch (provider) {
        case 'openai':
          response = await callOpenAI(action, data, model);
          break;
        case 'anthropic':
          response = await callAnthropic(action, data, model);
          break;
        case 'perplexity':
          response = await callPerplexity(action, data, model);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          provider,
          response: response,
          action: action
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (error) {
      console.error('AI Multi-Provider Error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

async function callOpenAI(action: string, data: any, model: string = 'gpt-4.1-2025-04-14') {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(action, 'openai')
        },
        {
          role: 'user',
          content: JSON.stringify(data)
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0]?.message?.content;
}

async function callAnthropic(action: string, data: any, model: string = 'claude-sonnet-4-20250514') {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicApiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 2000,
      system: getSystemPrompt(action, 'anthropic'),
      messages: [
        {
          role: 'user',
          content: JSON.stringify(data)
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.content[0]?.text;
}

async function callPerplexity(action: string, data: any, model: string = 'llama-3.1-sonar-large-128k-online') {
  const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!perplexityApiKey) {
    throw new Error('Perplexity API key not configured');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(action, 'perplexity')
        },
        {
          role: 'user',
          content: JSON.stringify(data)
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 2000,
      return_images: false,
      return_related_questions: true,
      search_recency_filter: 'month',
      frequency_penalty: 1,
      presence_penalty: 0
    })
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0]?.message?.content;
}

function getSystemPrompt(action: string, provider: string): string {
  const basePrompts = {
    analyze_telemetry: `You are an expert UAV operations analyst. Analyze the provided telemetry data and provide insights about flight performance, battery efficiency, maintenance needs, safety recommendations, and operational optimization.`,
    
    plan_mission: `You are a professional UAV mission planner. Create optimal mission plans including waypoints, altitude recommendations, flight time estimates, risk assessments, and contingency plans.`,
    
    predict_maintenance: `You are a UAV maintenance prediction specialist. Analyze operational data to predict component maintenance needs, schedules, failure points, and cost-effective strategies.`,
    
    anomaly_detection: `You are a UAV anomaly detection expert. Identify unusual patterns, performance deviations, safety concerns, malfunctions, and environmental factors.`,
    
    optimize_operations: `You are a UAV operations optimization consultant. Review data and suggest improvements for fleet utilization, route optimization, resource allocation, and cost reduction.`,
    
    market_research: `You are a UAV industry analyst. Research current market trends, regulations, technology developments, and competitive landscape.`,
    
    weather_analysis: `You are a meteorological expert specializing in UAV operations. Analyze weather conditions and their impact on flight safety and mission planning.`
  };

  let prompt = basePrompts[action] || 'You are a UAV operations AI assistant. Analyze the provided data and provide helpful insights.';
  
  if (provider === 'perplexity') {
    prompt += ' Use current, real-time information from reliable sources. Include recent developments and cite sources when possible.';
  } else if (provider === 'anthropic') {
    prompt += ' Provide detailed reasoning and consider multiple perspectives. Structure your response clearly with actionable recommendations.';
  } else if (provider === 'openai') {
    prompt += ' Provide practical, implementable solutions with clear explanations and step-by-step guidance.';
  }
  
  return prompt;
}