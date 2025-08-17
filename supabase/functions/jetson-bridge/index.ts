import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JetsonTelemetry {
  telemetry?: {
    battery_level?: number;
    location_latitude?: number;
    location_longitude?: number;
    altitude_meters?: number;
    speed_ms?: number;
    heading_degrees?: number;
    armed?: boolean;
    flight_mode?: string;
    battery_voltage?: number;
    temperature_celsius?: number;
  };
  connection?: {
    connected?: boolean;
    packets_received?: number;
    last_heartbeat?: number;
  };
  timestamp?: number;
}

interface JetsonCommand {
  command: string;
  params?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body.action;
    const jetsonIp = body.jetson_ip || '192.168.1.236';
    const jetsonPort = body.jetson_port || 5000;
    const data = body.data;
    
    const jetsonBaseUrl = `http://${jetsonIp}:${jetsonPort}`;

    console.log(`Jetson Bridge: ${action} to ${jetsonBaseUrl}`);

    switch (action) {
      case 'health':
        return await handleHealthCheck(jetsonBaseUrl);
      
      case 'telemetry':
        return await handleTelemetry(jetsonBaseUrl);
      
      case 'command':
        return await handleCommand(jetsonBaseUrl, data);
      
      case 'mavlink_connect':
        return await handleMavlinkConnect(jetsonBaseUrl, data);
      
      case 'mavlink_disconnect':
        return await handleMavlinkDisconnect(jetsonBaseUrl);
      
      case 'video_status':
        return await handleVideoStatus(jetsonBaseUrl);
      
      case 'system_stats':
        return await handleSystemStats(jetsonBaseUrl);

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid action. Available: health, telemetry, command, mavlink_connect, mavlink_disconnect, video_status, system_stats' 
          }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('Jetson Bridge Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleHealthCheck(jetsonBaseUrl: string) {
  try {
    const response = await fetch(`${jetsonBaseUrl}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Jetson health check failed: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        jetson_status: data,
        connected: true 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Jetson unreachable: ${error.message}`,
        connected: false 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleTelemetry(jetsonBaseUrl: string) {
  try {
    const response = await fetch(`${jetsonBaseUrl}/api/mavlink/telemetry`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Telemetry fetch failed: ${response.status}`);
    }

    const data: JetsonTelemetry = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        telemetry: data 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Telemetry error: ${error.message}` 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCommand(jetsonBaseUrl: string, commandData: JetsonCommand) {
  try {
    const response = await fetch(`${jetsonBaseUrl}/api/mavlink/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commandData),
    });

    if (!response.ok) {
      throw new Error(`Command failed: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        result: data 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Command error: ${error.message}` 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleMavlinkConnect(jetsonBaseUrl: string, connectData: any) {
  try {
    const response = await fetch(`${jetsonBaseUrl}/api/mavlink/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connectData),
    });

    if (!response.ok) {
      throw new Error(`MAVLink connect failed: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        result: data 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `MAVLink connect error: ${error.message}` 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleMavlinkDisconnect(jetsonBaseUrl: string) {
  try {
    const response = await fetch(`${jetsonBaseUrl}/api/mavlink/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`MAVLink disconnect failed: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        result: data 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `MAVLink disconnect error: ${error.message}` 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleVideoStatus(jetsonBaseUrl: string) {
  try {
    const response = await fetch(`${jetsonBaseUrl}/api/video/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Video status failed: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        video_status: data 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Video status error: ${error.message}` 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleSystemStats(jetsonBaseUrl: string) {
  try {
    const response = await fetch(`${jetsonBaseUrl}/api/system/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`System stats failed: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        system_stats: data 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `System stats error: ${error.message}` 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}