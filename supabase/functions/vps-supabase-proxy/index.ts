import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Ngrok URLs for IronBrain services
const API_BASE_URL = 'https://fe813d448e8c.ngrok-free.app'
const BRIDGE_BASE_URL = 'https://fe813d448e8c.ngrok-free.app'
const SERVICE = 'supabase-integration'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)

    // Parse JSON body if present
    let raw = ''
    let json: any = {}
    try {
      if (req.method !== 'GET') {
        raw = await req.text()
        json = raw ? JSON.parse(raw) : {}
      }
    } catch (_) {
      json = {}
    }

    const endpointParam = url.searchParams.get('endpoint')
    const endpoint = (json.endpoint || endpointParam || '/health') as string
    const methodOverride = (json.method || undefined) as string | undefined
    const targetMethod = methodOverride || (endpoint === '/health' ? 'GET' : req.method)
    const payload = json.payload

    const requestId = (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    
// Route to appropriate service based on endpoint patterns
const isBridgeEndpoint = (
  cleanEndpoint === '/health' ||
  cleanEndpoint.startsWith('/websocket') ||
  cleanEndpoint.includes('websocket') ||
  cleanEndpoint.startsWith('/drones') ||
  cleanEndpoint.startsWith('/telemetry') ||
  cleanEndpoint.startsWith('/api/')
)
const baseUrl = isBridgeEndpoint ? BRIDGE_BASE_URL : API_BASE_URL

// Normalize to API v2 prefix if not already present (keep websocket paths intact)
const forwardEndpoint = (cleanEndpoint.includes('websocket') || cleanEndpoint.startsWith('/api/'))
  ? cleanEndpoint
  : `/api/v1${cleanEndpoint}`

const vpsUrl = `${baseUrl}${forwardEndpoint}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const start = Date.now()
    console.log(`[${SERVICE}] ${requestId} → ${targetMethod} ${vpsUrl}`)

    const vpsResponse = await fetch(vpsUrl, {
      method: targetMethod,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
      },
      body: targetMethod !== 'GET' && payload !== undefined ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const duration = Date.now() - start
    const dataText = await vpsResponse.text()
    console.log(`[${SERVICE}] ${requestId} ← ${vpsResponse.status} (${duration}ms)`)

    return new Response(dataText, {
      status: vpsResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': vpsResponse.headers.get('content-type') || 'application/json',
        'x-request-id': requestId,
        'x-proxy-duration-ms': String(duration),
      },
    })
  } catch (error: any) {
    const errBody = {
      error: 'VPS connection failed',
      details: error?.message || String(error),
      code: error?.code || error?.name,
      service: SERVICE,
    }
    console.error(`[${SERVICE}] ERROR:`, errBody)
    return new Response(JSON.stringify(errBody), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})