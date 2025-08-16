import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MissionControl {
  mission_id: string;
  action: 'launch' | 'pause' | 'resume' | 'abort' | 'update_waypoints';
  operator_id?: string;
  payload?: {
    waypoints?: Array<{lat: number, lon: number, alt: number}>;
    speed?: number;
    formation?: string;
    emergency_land?: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const control: MissionControl = await req.json()
    
    if (!control.mission_id || !control.action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: mission_id, action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate mission exists and get assigned drones
    const { data: mission, error: missionError } = await supabaseClient
      .from('missions_extended')
      .select(`
        *,
        mission_assignments(
          drone_id,
          role,
          drones_extended(id, name, status)
        )
      `)
      .eq('id', control.mission_id)
      .single()

    if (missionError || !mission) {
      console.error('Mission not found:', missionError)
      return new Response(
        JSON.stringify({ error: 'Mission not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Execute mission control action
    let newStatus = mission.status;
    let result: any = {};

    switch (control.action) {
      case 'launch':
        if (mission.status !== 'planning') {
          throw new Error('Can only launch missions in planning state');
        }
        newStatus = 'active';
        
        // Update drone statuses to 'mission'
        const droneIds = mission.mission_assignments?.map((a: any) => a.drone_id) || [];
        if (droneIds.length > 0) {
          await supabaseClient
            .from('drones_extended')
            .update({ status: 'mission' })
            .in('id', droneIds);
        }
        
        result = { launched_drones: droneIds.length, start_time: new Date().toISOString() };
        break;

      case 'pause':
        if (mission.status !== 'active') {
          throw new Error('Can only pause active missions');
        }
        newStatus = 'paused';
        result = { paused_at: new Date().toISOString() };
        break;

      case 'resume':
        if (mission.status !== 'paused') {
          throw new Error('Can only resume paused missions');
        }
        newStatus = 'active';
        result = { resumed_at: new Date().toISOString() };
        break;

      case 'abort':
        if (!['active', 'paused'].includes(mission.status)) {
          throw new Error('Can only abort active or paused missions');
        }
        newStatus = 'aborted';
        
        // Return drones to 'online' status
        const abortDroneIds = mission.mission_assignments?.map((a: any) => a.drone_id) || [];
        if (abortDroneIds.length > 0) {
          await supabaseClient
            .from('drones_extended')
            .update({ status: 'online' })
            .in('id', abortDroneIds);
        }
        
        result = { aborted_at: new Date().toISOString(), returned_drones: abortDroneIds.length };
        break;

      case 'update_waypoints':
        if (control.payload?.waypoints) {
          // Store waypoints in mission ruleset
          const updatedRuleset = {
            ...mission.ruleset,
            waypoints: control.payload.waypoints,
            formation: control.payload.formation,
            speed: control.payload.speed
          };
          
          await supabaseClient
            .from('missions_extended')
            .update({ ruleset: updatedRuleset })
            .eq('id', control.mission_id);
            
          result = { waypoints_updated: control.payload.waypoints.length };
        }
        break;

      default:
        throw new Error(`Unknown action: ${control.action}`);
    }

    // Update mission status if changed
    if (newStatus !== mission.status) {
      await supabaseClient
        .from('missions_extended')
        .update({ 
          status: newStatus,
          ...(control.action === 'launch' ? { starts_at: new Date().toISOString() } : {}),
          ...(control.action === 'abort' ? { ends_at: new Date().toISOString() } : {})
        })
        .eq('id', control.mission_id);
    }

    // Log the mission event
    await supabaseClient
      .from('events')
      .insert([{
        drone_id: mission.mission_assignments?.[0]?.drone_id || null,
        type: 'MISSION_CONTROL',
        severity: control.action === 'abort' ? 'warning' : 'info',
        payload: {
          mission_id: control.mission_id,
          action: control.action,
          operator_id: control.operator_id,
          old_status: mission.status,
          new_status: newStatus,
          ...result
        }
      }]);

    console.log(`Mission ${control.mission_id} - Action: ${control.action}, Status: ${mission.status} -> ${newStatus}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        mission_id: control.mission_id,
        action: control.action,
        old_status: mission.status,
        new_status: newStatus,
        timestamp: new Date().toISOString(),
        ...result
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Mission control error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})