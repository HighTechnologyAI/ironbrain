import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { prompt, type, dataSource, style = 'professional', format = 'png', size = '1024x1024' } = await req.json();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced prompt for visual generation
    const enhancedPrompt = `Create a ${style} ${type} visualization: ${prompt}
    
    Requirements:
    - High quality, professional appearance
    - Clean, modern design
    - Readable text and labels
    - Appropriate color scheme for technical documentation
    - Clear data representation
    - Suitable for UAV operations dashboard
    
    Style: Use a professional color palette with blues (#0066CC), greens (#00AA44), and neutral grays. 
    Include proper legends, axis labels, and annotations where appropriate.
    Make it visually appealing and technically accurate.`;

    console.log('Generating image with prompt:', enhancedPrompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        output_format: format,
        quality: 'high',
        background: 'opaque'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.data || !data.data[0]) {
      throw new Error('No image data received from OpenAI');
    }

    const imageData = data.data[0];
    
    return new Response(JSON.stringify({
      success: true,
      imageUrl: imageData.url || null,
      imageData: imageData.b64_json || null,
      prompt: prompt,
      type: type,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Visual generation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to generate visual',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});