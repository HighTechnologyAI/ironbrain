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
    
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    
    console.log('✅ [STEP 1] Token retrieved successfully')
    console.log('📊 [DEBUG] Token exists:', !!mapboxToken)
    console.log('📊 [DEBUG] Token length:', mapboxToken?.length || 0)
    
    if (!mapboxToken || mapboxToken.trim() === '') {
      console.error('❌ [ERROR] Token is missing or empty')
      return new Response(
        JSON.stringify({ 
          error: 'MAPBOX_PUBLIC_TOKEN not found',
          details: 'Please add MAPBOX_PUBLIC_TOKEN to Supabase secrets',
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