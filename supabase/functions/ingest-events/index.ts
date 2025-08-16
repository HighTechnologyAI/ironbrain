import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EventPayload {
  drone_id: string;
  events: {
    type: string;
    severity?: 'critical' | 'warning' | 'info' | 'debug';
    payload?: any;
    ts?: string;
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
    const payload: EventPayload = await req.json()
    
    if (!payload.drone_id || !payload.events) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: drone_id, events' }),
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

    // Batch insert events
    const eventRecords = payload.events.map(e => ({
      drone_id: payload.drone_id,
      type: e.type,
      severity: e.severity || 'info',
      payload: e.payload,
      ts: e.ts ? new Date(e.ts).toISOString() : new Date().toISOString()
    }))

    const { error: insertError } = await supabaseClient
      .from('events')
      .insert(eventRecords)

    if (insertError) {
      console.error('Failed to insert events:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to insert events' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for critical events and trigger alerts
    const criticalEvents = payload.events.filter(e => e.severity === 'critical')
    if (criticalEvents.length > 0) {
      console.log(`⚠️ Critical events detected for drone ${payload.drone_id}:`, criticalEvents)
      // TODO: Trigger mission alerts via mission-alert edge function
    }

    console.log(`Processed ${eventRecords.length} events for drone ${payload.drone_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: eventRecords.length,
        critical_events: criticalEvents.length,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Events ingestion error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})