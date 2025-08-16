import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelemetryPayload {
  drone_id: string;
  telemetry: {
    lat?: number;
    lon?: number;
    alt?: number;
    vel?: number;
    hdg?: number;
    batt_v?: number;
    temp?: number;
    health?: any;
    payload_state?: any;
  }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Parse request body
    const payload: TelemetryPayload = await req.json()
    
    if (!payload.drone_id || !payload.telemetry) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: drone_id, telemetry' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate drone exists
    const { data: drone, error: droneError } = await supabaseClient
      .from('drones_extended')
      .select('id')
      .eq('id', payload.drone_id)
      .single()

    if (droneError || !drone) {
      console.error('Drone not found:', droneError)
      return new Response(
        JSON.stringify({ error: 'Drone not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Batch insert telemetry data
    const telemetryRecords = payload.telemetry.map(t => ({
      drone_id: payload.drone_id,
      lat: t.lat,
      lon: t.lon,
      alt: t.alt,
      vel: t.vel,
      hdg: t.hdg,
      batt_v: t.batt_v,
      temp: t.temp,
      health: t.health,
      payload_state: t.payload_state,
      ts: new Date().toISOString()
    }))

    const { error: insertError } = await supabaseClient
      .from('telemetry')
      .insert(telemetryRecords)

    if (insertError) {
      console.error('Failed to insert telemetry:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to insert telemetry' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update drone heartbeat
    await supabaseClient
      .from('drones_extended')
      .update({ 
        last_heartbeat_at: new Date().toISOString(),
        status: 'online'
      })
      .eq('id', payload.drone_id)

    console.log(`Processed ${telemetryRecords.length} telemetry records for drone ${payload.drone_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: telemetryRecords.length,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Telemetry ingestion error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})