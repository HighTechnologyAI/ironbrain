export default {
  name: 'ai-uav-analytics',
  serve: async (req) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const { action, data } = await req.json();
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: getSystemPrompt(action)
            },
            {
              role: 'user',
              content: JSON.stringify(data)
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
      }

      const result = await openaiResponse.json();
      const aiResponse = result.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      return new Response(
        JSON.stringify({
          success: true,
          response: aiResponse,
          action: action
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (error) {
      console.error('AI Analytics Error:', error);
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

function getSystemPrompt(action: string): string {
  switch (action) {
    case 'analyze_telemetry':
      return `You are an expert UAV operations analyst. Analyze the provided telemetry data and provide insights about:
- Flight performance metrics
- Battery efficiency patterns
- Potential maintenance needs
- Safety recommendations
- Operational optimization suggestions
Respond in a structured format with clear insights and actionable recommendations.`;

    case 'plan_mission':
      return `You are a professional UAV mission planner. Based on the provided parameters (location, objectives, weather, drone capabilities), create an optimal mission plan including:
- Waypoint sequence
- Flight altitude recommendations
- Estimated flight time and battery usage
- Risk assessment and mitigation strategies
- Emergency contingency plans
Provide a structured mission brief.`;

    case 'predict_maintenance':
      return `You are a UAV maintenance prediction specialist. Analyze the provided operational data and predict:
- Components likely to need maintenance
- Recommended maintenance schedule
- Potential failure points
- Performance degradation indicators
- Cost-effective maintenance strategies
Provide prioritized recommendations with reasoning.`;

    case 'anomaly_detection':
      return `You are a UAV anomaly detection expert. Examine the provided data for:
- Unusual flight patterns
- Performance deviations from normal parameters
- Potential security or safety concerns
- Equipment malfunctions or degradation
- Environmental factors affecting operations
Identify anomalies and suggest corrective actions.`;

    case 'optimize_operations':
      return `You are a UAV operations optimization consultant. Review the operational data and suggest improvements for:
- Fleet utilization efficiency
- Route optimization
- Resource allocation
- Cost reduction opportunities
- Performance enhancement strategies
Provide actionable optimization recommendations.`;

    default:
      return `You are a UAV operations AI assistant. Analyze the provided data and provide helpful insights and recommendations for UAV operations management.`;
  }
}