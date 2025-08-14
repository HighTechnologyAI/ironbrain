import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  // Get OpenAI API key from environment
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  console.log('WebSocket connection established, connecting to OpenAI Realtime API');

  const { socket, response } = Deno.upgradeWebSocket(req);

  // Connect to OpenAI Realtime API
  const openAISocket = new WebSocket(
    "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
    [],
    {
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "realtime=v1",
      },
    }
  );

  let sessionConfigured = false;

  openAISocket.onopen = () => {
    console.log('Connected to OpenAI Realtime API');
  };

  openAISocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('OpenAI message:', data.type);

    // Configure session after receiving session.created event
    if (data.type === 'session.created' && !sessionConfigured) {
      console.log('Configuring session...');
      sessionConfigured = true;
      
      const sessionConfig = {
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: "You are an AI assistant specialized in UAV (drone) operations and management. You help with mission planning, telemetry analysis, maintenance scheduling, and operational optimization. Be concise but thorough in your responses.",
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1000
          },
          tools: [
            {
              type: "function",
              name: "analyze_telemetry",
              description: "Analyze drone telemetry data and provide insights",
              parameters: {
                type: "object",
                properties: {
                  telemetry_data: { type: "string", description: "JSON string of telemetry data" }
                },
                required: ["telemetry_data"]
              }
            },
            {
              type: "function", 
              name: "schedule_maintenance",
              description: "Schedule maintenance for a drone based on operational data",
              parameters: {
                type: "object",
                properties: {
                  drone_id: { type: "string", description: "ID of the drone" },
                  maintenance_type: { type: "string", description: "Type of maintenance needed" },
                  priority: { type: "string", enum: ["low", "medium", "high", "critical"] }
                },
                required: ["drone_id", "maintenance_type", "priority"]
              }
            },
            {
              type: "function",
              name: "get_fleet_status",
              description: "Get current status of the entire drone fleet",
              parameters: {
                type: "object",
                properties: {
                  include_details: { type: "boolean", description: "Whether to include detailed status" }
                }
              }
            },
            {
              type: "function",
              name: "optimize_mission",
              description: "Optimize a mission plan for efficiency and safety",
              parameters: {
                type: "object",
                properties: {
                  mission_data: { type: "string", description: "JSON string of mission parameters" },
                  optimization_goals: { type: "array", items: { type: "string" } }
                },
                required: ["mission_data"]
              }
            }
          ],
          tool_choice: "auto",
          temperature: 0.7,
          max_response_output_tokens: 4096
        }
      };

      openAISocket.send(JSON.stringify(sessionConfig));
      console.log('Session configuration sent');
    }

    // Handle function calls
    if (data.type === 'response.function_call_arguments.done') {
      console.log('Function call completed:', data.name, data.arguments);
      
      try {
        const args = JSON.parse(data.arguments);
        let result = {};

        switch (data.name) {
          case 'analyze_telemetry':
            result = {
              analysis: "Telemetry analysis shows normal operational parameters. Battery at 87%, altitude stable at 150m, no anomalies detected.",
              recommendations: ["Continue current mission", "Monitor battery levels", "Check weather conditions in 30 minutes"]
            };
            break;
            
          case 'schedule_maintenance':
            result = {
              scheduled: true,
              maintenance_id: `maint_${Date.now()}`,
              scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              priority: args.priority,
              estimated_duration: "2 hours"
            };
            break;
            
          case 'get_fleet_status':
            result = {
              total_drones: 8,
              active: 6,
              maintenance: 1,
              charging: 1,
              fleet_health: "Good",
              active_missions: 3,
              average_battery: 78
            };
            break;
            
          case 'optimize_mission':
            result = {
              optimized: true,
              efficiency_gain: "12%",
              estimated_time_saving: "8 minutes",
              recommended_changes: ["Adjust altitude to 120m", "Use wind-assisted routing", "Optimize waypoint sequence"]
            };
            break;
            
          default:
            result = { error: "Unknown function" };
        }

        // Send function call result back to OpenAI
        const functionResponse = {
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: data.call_id,
            output: JSON.stringify(result)
          }
        };

        openAISocket.send(JSON.stringify(functionResponse));
        
        // Trigger response generation
        openAISocket.send(JSON.stringify({ type: "response.create" }));
        
      } catch (error) {
        console.error('Error processing function call:', error);
      }
    }

    // Forward all messages to client
    socket.send(event.data);
  };

  openAISocket.onerror = (error) => {
    console.error('OpenAI WebSocket error:', error);
    socket.close(1011, 'OpenAI connection error');
  };

  openAISocket.onclose = (event) => {
    console.log('OpenAI WebSocket closed:', event.code, event.reason);
    socket.close(event.code, event.reason);
  };

  // Handle client messages
  socket.onopen = () => {
    console.log('Client WebSocket connected');
  };

  socket.onmessage = (event) => {
    console.log('Client message received');
    
    try {
      const data = JSON.parse(event.data);
      console.log('Forwarding message to OpenAI:', data.type);
      
      // Forward message to OpenAI
      openAISocket.send(event.data);
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
  };

  socket.onclose = (event) => {
    console.log('Client WebSocket closed:', event.code, event.reason);
    openAISocket.close();
  };

  return response;
});