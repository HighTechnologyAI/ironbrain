import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SwarmIntent {
  swarm_id: string;
  mission_id: string;
  formation: 'line' | 'wedge' | 'circle' | 'grid' | 'custom';
  roles: Array<{
    drone_id: string;
    role: 'leader' | 'follower' | 'scout' | 'guard';
    position_offset?: {x: number, y: number, z: number};
  }>;
  coordination: {
    comm_protocol: 'mesh' | 'star' | 'hybrid';
    sync_frequency: number; // Hz
    collision_avoidance: boolean;
    auto_failover: boolean;
  };
  constraints: {
    max_separation: number; // meters
    min_altitude: number;
    max_altitude: number;
    geo_fence?: any;
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

    const intent: SwarmIntent = await req.json()
    
    if (!intent.swarm_id || !intent.mission_id || !intent.formation) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: swarm_id, mission_id, formation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate mission exists and is active
    const { data: mission, error: missionError } = await supabaseClient
      .from('missions_extended')
      .select('id, status')
      .eq('id', intent.mission_id)
      .single()

    if (missionError || !mission) {
      return new Response(
        JSON.stringify({ error: 'Mission not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (mission.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Can only coordinate active missions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate all drones are assigned to this mission
    const droneIds = intent.roles.map(r => r.drone_id);
    const { data: assignments, error: assignError } = await supabaseClient
      .from('mission_assignments')
      .select('drone_id')
      .eq('mission_id', intent.mission_id)
      .in('drone_id', droneIds);

    if (assignError || assignments?.length !== droneIds.length) {
      return new Response(
        JSON.stringify({ error: 'Not all drones are assigned to this mission' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store swarm configuration in key-value store
    const swarmConfig = {
      swarm_id: intent.swarm_id,
      mission_id: intent.mission_id,
      formation: intent.formation,
      roles: intent.roles,
      coordination: intent.coordination,
      constraints: intent.constraints,
      created_at: new Date().toISOString(),
      version: 1
    };

    await supabaseClient
      .from('kv_config')
      .upsert([{
        scope: 'swarm',
        key: intent.swarm_id,
        value_json: swarmConfig
      }]);

    // Generate formation commands for each drone
    const commands = intent.roles.map(role => ({
      drone_id: role.drone_id,
      command: 'SWARM_FORMATION',
      parameters: {
        swarm_id: intent.swarm_id,
        role: role.role,
        formation: intent.formation,
        position_offset: role.position_offset,
        coordination: intent.coordination,
        constraints: intent.constraints
      }
    }));

    // Log swarm coordination event
    await supabaseClient
      .from('events')
      .insert(commands.map(cmd => ({
        drone_id: cmd.drone_id,
        type: 'SWARM_INTENT',
        severity: 'info',
        payload: {
          swarm_id: intent.swarm_id,
          mission_id: intent.mission_id,
          formation: intent.formation,
          role: cmd.parameters.role,
          command: cmd.command
        }
      })));

    // Calculate formation metrics
    const metrics = {
      drones_count: intent.roles.length,
      leader_count: intent.roles.filter(r => r.role === 'leader').length,
      max_separation: intent.constraints.max_separation,
      altitude_range: [intent.constraints.min_altitude, intent.constraints.max_altitude],
      formation_complexity: intent.formation === 'custom' ? 'high' : 'standard'
    };

    console.log(`Swarm ${intent.swarm_id} configured for mission ${intent.mission_id} - Formation: ${intent.formation}, Drones: ${intent.roles.length}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        swarm_id: intent.swarm_id,
        mission_id: intent.mission_id,
        formation: intent.formation,
        commands_generated: commands.length,
        metrics,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Swarm coordinator error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})