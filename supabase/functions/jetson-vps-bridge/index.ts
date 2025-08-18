import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// VPS endpoints configuration
const VPS_HOST = '87.120.254.156'
const VPS_PORTS = {
  mavlink: 5760,
  rtsp: 5762,
  supabase: 5761
}

// Jetson configuration  
const JETSON_CONFIG = {
  ip: '192.168.1.236',
  port: 5000
}

interface BridgeRequest {
  action: 'health' | 'connect_jetson_to_vps' | 'relay_command' | 'stream_telemetry' | 'setup_video_bridge'
  jetson_ip?: string
  jetson_port?: number
  vps_service?: 'mavlink' | 'rtsp' | 'supabase'
  command_data?: any
  target?: 'jetson' | 'vps' | 'both'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: BridgeRequest = await req.json()
    console.log('Jetson-VPS Bridge request:', body)

    switch (body.action) {
      case 'health':
        return await handleHealthCheck()
      
      case 'connect_jetson_to_vps':
        return await handleJetsonVPSConnection(body)
      
      case 'relay_command':
        return await handleCommandRelay(body)
      
      case 'stream_telemetry':
        return await handleTelemetryStreaming(body)
      
      case 'setup_video_bridge':
        return await handleVideoBridge(body)
      
      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid action. Available: health, connect_jetson_to_vps, relay_command, stream_telemetry, setup_video_bridge' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('Jetson-VPS Bridge error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleHealthCheck() {
  try {
    const checks = await Promise.allSettled([
      // Check Jetson
      fetch(`http://${JETSON_CONFIG.ip}:${JETSON_CONFIG.port}/api/health`, { 
        signal: AbortSignal.timeout(5000) 
      }),
      // Check VPS MAVLink
      fetch(`http://${VPS_HOST}:${VPS_PORTS.mavlink}/health`, { 
        signal: AbortSignal.timeout(5000) 
      }),
      // Check VPS RTSP
      fetch(`http://${VPS_HOST}:${VPS_PORTS.rtsp}/health`, { 
        signal: AbortSignal.timeout(5000) 
      }),
      // Check VPS Supabase
      fetch(`http://${VPS_HOST}:${VPS_PORTS.supabase}/health`, { 
        signal: AbortSignal.timeout(5000) 
      })
    ])

    const status = {
      jetson: checks[0].status === 'fulfilled' && checks[0].value.ok,
      vps_mavlink: checks[1].status === 'fulfilled' && checks[1].value.ok,
      vps_rtsp: checks[2].status === 'fulfilled' && checks[2].value.ok,
      vps_supabase: checks[3].status === 'fulfilled' && checks[3].value.ok,
      overall: checks.every(check => check.status === 'fulfilled' && check.value.ok)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status,
        bridge_ready: status.overall,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Health check failed: ${error.message}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleJetsonVPSConnection(body: BridgeRequest) {
  try {
    const jetsonIp = body.jetson_ip || JETSON_CONFIG.ip
    const jetsonPort = body.jetson_port || JETSON_CONFIG.port

    console.log(`Establishing Jetson-VPS bridge: ${jetsonIp}:${jetsonPort} ↔ ${VPS_HOST}`)

    // Step 1: Configure Jetson to use VPS as MAVLink proxy
    const mavlinkConfig = await fetch(`http://${jetsonIp}:${jetsonPort}/api/mavlink/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proxy_host: VPS_HOST,
        proxy_port: VPS_PORTS.mavlink,
        enable_proxy: true
      })
    })

    // Step 2: Configure VPS to route MAVLink to Jetson
    const vpsConfig = await fetch(`http://${VPS_HOST}:${VPS_PORTS.mavlink}/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jetson_endpoint: `udp:${jetsonIp}:14550`,
        route_enabled: true
      })
    })

    // Step 3: Setup video streaming bridge
    const videoConfig = await fetch(`http://${VPS_HOST}:${VPS_PORTS.rtsp}/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jetson_rtsp_source: `rtsp://${jetsonIp}:8554/camera`,
        relay_enabled: true
      })
    })

    const results = {
      mavlink_bridge: mavlinkConfig.ok,
      vps_routing: vpsConfig.ok,
      video_bridge: videoConfig.ok,
      overall: mavlinkConfig.ok && vpsConfig.ok && videoConfig.ok
    }

    return new Response(
      JSON.stringify({ 
        success: results.overall, 
        bridge_status: results,
        message: results.overall ? 'Jetson-VPS bridge established successfully' : 'Bridge setup partial or failed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Bridge setup failed: ${error.message}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleCommandRelay(body: BridgeRequest) {
  try {
    const { command_data, target = 'both' } = body
    const results: any = {}

    if (target === 'jetson' || target === 'both') {
      // Send command to Jetson
      const jetsonResponse = await fetch(`http://${JETSON_CONFIG.ip}:${JETSON_CONFIG.port}/api/mavlink/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command_data)
      })
      results.jetson = {
        success: jetsonResponse.ok,
        data: jetsonResponse.ok ? await jetsonResponse.json() : null
      }
    }

    if (target === 'vps' || target === 'both') {
      // Send command via VPS
      const vpsResponse = await fetch(`http://${VPS_HOST}:${VPS_PORTS.mavlink}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command_data)
      })
      results.vps = {
        success: vpsResponse.ok,
        data: vpsResponse.ok ? await vpsResponse.json() : null
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        relay_results: results,
        command: command_data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Command relay failed: ${error.message}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleTelemetryStreaming(body: BridgeRequest) {
  try {
    // Get telemetry from Jetson
    const jetsonTelemetry = await fetch(`http://${JETSON_CONFIG.ip}:${JETSON_CONFIG.port}/api/mavlink/telemetry`)
    
    if (!jetsonTelemetry.ok) {
      throw new Error('Failed to fetch Jetson telemetry')
    }

    const telemetryData = await jetsonTelemetry.json()

    // Stream to VPS Supabase service
    const supabaseStream = await fetch(`http://${VPS_HOST}:${VPS_PORTS.supabase}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drone_id: 'jetson-001',
        ...telemetryData.telemetry,
        timestamp: new Date().toISOString()
      })
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        telemetry_streamed: supabaseStream.ok,
        telemetry_data: telemetryData,
        vps_response: supabaseStream.ok ? await supabaseStream.json() : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Telemetry streaming failed: ${error.message}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleVideoBridge(body: BridgeRequest) {
  try {
    // Configure Jetson video streaming to VPS
    const jetsonVideoConfig = await fetch(`http://${JETSON_CONFIG.ip}:${JETSON_CONFIG.port}/api/video/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stream_to_vps: true,
        vps_rtsp_endpoint: `rtsp://${VPS_HOST}:8554/jetson-001/live`,
        quality: 'high',
        fps: 30
      })
    })

    // Configure VPS RTSP relay
    const vpsVideoConfig = await fetch(`http://${VPS_HOST}:${VPS_PORTS.rtsp}/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jetson_source: `rtsp://${JETSON_CONFIG.ip}:8554/camera`,
        output_stream: 'jetson-001/live',
        enable_relay: true
      })
    })

    const videoStatus = {
      jetson_configured: jetsonVideoConfig.ok,
      vps_relay_configured: vpsVideoConfig.ok,
      bridge_ready: jetsonVideoConfig.ok && vpsVideoConfig.ok
    }

    return new Response(
      JSON.stringify({ 
        success: videoStatus.bridge_ready, 
        video_bridge_status: videoStatus,
        stream_url: videoStatus.bridge_ready ? `rtsp://${VPS_HOST}:8554/jetson-001/live` : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Video bridge setup failed: ${error.message}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}