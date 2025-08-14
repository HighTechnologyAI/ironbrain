import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 get-mapbox-token function started')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📋 CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Getting MAPBOX_PUBLIC_TOKEN from environment...')
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    
    console.log('✅ Token exists:', !!mapboxToken)
    console.log('🔢 Token length:', mapboxToken?.length || 0)
    
    if (!mapboxToken) {
      console.error('❌ CRITICAL: Mapbox token not found in environment variables')
      console.error('📋 Available env vars:', Object.keys(Deno.env.toObject()).filter(k => k.includes('MAPBOX')))
      return new Response(
        JSON.stringify({ 
          error: 'MAPBOX_PUBLIC_TOKEN not configured',
          details: 'Token missing from environment variables',
          available_env: Object.keys(Deno.env.toObject()).filter(k => k.includes('MAPBOX')),
          hint: 'Check Supabase project secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🔍 Token prefix check:', mapboxToken.substring(0, 3))
    if (!mapboxToken.startsWith('pk.')) {
      console.error('❌ CRITICAL: Invalid Mapbox token format')
      console.error('🔍 Received prefix:', mapboxToken.substring(0, 10))
      return new Response(
        JSON.stringify({ 
          error: 'Invalid MAPBOX_PUBLIC_TOKEN format',
          details: 'Token should start with "pk."',
          received_prefix: mapboxToken.substring(0, 10),
          token_length: mapboxToken.length
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🎉 Returning valid token successfully')
    return new Response(
      JSON.stringify({ 
        token: mapboxToken,
        success: true,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('💥 Unexpected error in get-mapbox-token function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
        type: 'function_error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})