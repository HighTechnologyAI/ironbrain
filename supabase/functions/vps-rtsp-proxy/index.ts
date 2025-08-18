import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const endpoint = url.searchParams.get('endpoint') || '/health'
    const method = req.method
    
    const vpsUrl = `http://president.ironbrain.site:5762${endpoint}`
    
    console.log(`Proxying ${method} request to: ${vpsUrl}`)
    
    const vpsResponse = await fetch(vpsUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'GET' ? await req.text() : undefined,
    })
    
    const data = await vpsResponse.text()
    
    return new Response(data, {
      status: vpsResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
    
  } catch (error) {
    console.error('VPS RTSP proxy error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'VPS connection failed',
        details: error.message,
        service: 'rtsp'
      }),
      {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})