import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);

interface VisualGenerationRequest {
  prompt: string;
  type: 'chart' | 'diagram' | 'infographic' | 'heatmap';
  dataSource?: string;
  style?: string;
  format?: string;
  size?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI Visual Generator function called');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const body: VisualGenerationRequest = await req.json();
    const { 
      prompt, 
      type = 'chart', 
      dataSource = 'telemetry', 
      style = 'professional',
      format = 'png',
      size = '1024x1024'
    } = body;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('Generating visual with prompt:', prompt);

    // Enhanced prompt for DALL-E with specific visual requirements
    const enhancedPrompt = `Create a professional ${type} visualization: ${prompt}. 
      Style: Clean, modern, high-contrast design suitable for a UAV operations dashboard. 
      Use a professional color scheme with blues (#2563eb), greens (#16a34a), and neutral grays. 
      Include clear data labels, legends, and professional typography. 
      Make it suitable for technical documentation and reports. 
      No text overlays or watermarks. 
      High quality, crisp, technical illustration style.`;

    // Generate image using DALL-E
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size as any,
        quality: 'hd',
        style: 'natural'
      }),
    });

    if (!imageResponse.ok) {
      const error = await imageResponse.json();
      console.error('DALL-E API error:', error);
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.data[0].url;

    console.log('Image generated successfully:', imageUrl);

    // Store the generated visual metadata in the database
    const { data: visualRecord, error: dbError } = await supabase
      .from('ai_analysis_history')
      .insert({
        analysis_type: 'visual_generation',
        provider: 'openai',
        model_used: 'dall-e-3',
        input_data: {
          prompt,
          type,
          dataSource,
          style,
          format,
          size
        },
        result_data: JSON.stringify({
          imageUrl,
          generatedAt: new Date().toISOString(),
          type,
          description: prompt
        }),
        success: true,
        execution_time_ms: 0,
        tokens_used: 1 // DALL-E uses credits, not tokens
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway - the image was generated successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        type,
        description: prompt,
        generatedAt: new Date().toISOString(),
        metadata: {
          model: 'dall-e-3',
          size,
          style,
          dataSource
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error in ai-visual-generator function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});