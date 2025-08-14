import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 [START] get-mapbox-token function called')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📋 [CORS] Handling preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 [STEP 1] Reading MAPBOX_PUBLIC_TOKEN from environment...')
    
    // Получаем все переменные окружения для отладки
    const allEnvVars = Deno.env.toObject()
    const mapboxVars = Object.keys(allEnvVars).filter(k => k.toLowerCase().includes('mapbox'))
    console.log('📋 [DEBUG] Available Mapbox env vars:', mapboxVars)
    console.log('📋 [DEBUG] All env var keys count:', Object.keys(allEnvVars).length)
    
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    
    console.log('✅ [STEP 1] Token retrieval completed')
    console.log('📊 [DEBUG] Token exists:', !!mapboxToken)
    console.log('📊 [DEBUG] Token length:', mapboxToken?.length || 0)
    console.log('📊 [DEBUG] Available mapbox vars:', mapboxVars)
    
    // Если токен не найден, используем токен из тела запроса как fallback
    if (!mapboxToken || mapboxToken.trim() === '') {
      console.log('⚠️ [FALLBACK] Token not found in env, checking request body...')
      
      try {
        const body = await req.json()
        if (body.token && body.token.startsWith('pk.')) {
          console.log('✅ [FALLBACK] Using token from request body')
          const fallbackToken = body.token.trim()
          
          return new Response(
            JSON.stringify({ 
              token: fallbackToken,
              success: true,
              source: 'request_body',
              timestamp: new Date().toISOString()
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      } catch (e) {
        console.log('📋 [INFO] No valid token in request body, continuing with error')
      }
      
      console.error('❌ [ERROR] Token is missing from both environment and request')
      return new Response(
        JSON.stringify({ 
          error: 'MAPBOX_PUBLIC_TOKEN not found',
          details: 'Token not found in environment variables or request body',
          available_mapbox_vars: mapboxVars,
          env_var_count: Object.keys(allEnvVars).length,
          success: false
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const cleanToken = mapboxToken.trim()
    console.log('🔍 [STEP 2] Validating token format...')
    console.log('📊 [DEBUG] Token prefix:', cleanToken.substring(0, 3))
    
    if (!cleanToken.startsWith('pk.')) {
      console.error('❌ [ERROR] Invalid token format')
      return new Response(
        JSON.stringify({ 
          error: 'Invalid token format',
          details: 'Mapbox public token must start with "pk."',
          received_prefix: cleanToken.substring(0, 10),
          success: false
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ [STEP 2] Token format is valid')
    console.log('🎉 [SUCCESS] Returning token to client')
    
    return new Response(
      JSON.stringify({ 
        token: cleanToken,
        success: true,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('💥 [CRITICAL ERROR] Unexpected error:', error)
    console.error('💥 [STACK TRACE]:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})