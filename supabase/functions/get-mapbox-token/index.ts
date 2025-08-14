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
    console.log('🔍 [DEBUG] Getting MAPBOX_PUBLIC_TOKEN from environment...')
    
    // Получаем все переменные окружения для диагностики
    const allEnvVars = Deno.env.toObject()
    console.log('📋 [DEBUG] All environment variables:', Object.keys(allEnvVars))
    console.log('📋 [DEBUG] Mapbox related vars:', Object.keys(allEnvVars).filter(k => k.toLowerCase().includes('mapbox')))
    
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    
    console.log('✅ [DEBUG] Token exists:', !!mapboxToken)
    console.log('🔢 [DEBUG] Token length:', mapboxToken?.length || 0)
    
    if (mapboxToken) {
      console.log('🔍 [DEBUG] Token first 20 chars:', mapboxToken.substring(0, 20))
      console.log('🔍 [DEBUG] Token last 10 chars:', mapboxToken.substring(mapboxToken.length - 10))
    }
    
    if (!mapboxToken || mapboxToken.trim() === '') {
      console.error('❌ CRITICAL: Mapbox token not found or empty')
      return new Response(
        JSON.stringify({ 
          error: 'MAPBOX_PUBLIC_TOKEN not configured or empty',
          details: 'Token missing from environment variables',
          available_mapbox_vars: Object.keys(allEnvVars).filter(k => k.toLowerCase().includes('mapbox')),
          hint: 'Please set MAPBOX_PUBLIC_TOKEN in Supabase Edge Function Secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const cleanToken = mapboxToken.trim()
    console.log('🔍 [DEBUG] Clean token prefix check:', cleanToken.substring(0, 3))
    
    if (!cleanToken.startsWith('pk.')) {
      console.error('❌ CRITICAL: Invalid Mapbox token format')
      console.error('🔍 Expected: starts with "pk."')
      console.error('🔍 Received prefix:', cleanToken.substring(0, 10))
      return new Response(
        JSON.stringify({ 
          error: 'Invalid MAPBOX_PUBLIC_TOKEN format',
          details: 'Public token should start with "pk."',
          received_prefix: cleanToken.substring(0, 10),
          token_length: cleanToken.length,
          hint: 'Get your public token from https://account.mapbox.com/access-tokens/'
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