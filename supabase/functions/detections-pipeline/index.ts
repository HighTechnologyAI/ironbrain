import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DetectionPayload {
  video_segment_id: string;
  detections: Array<{
    timestamp: string;
    class: string;
    confidence: number;
    bbox: {x: number, y: number, width: number, height: number};
    tracking_id?: string;
    attributes?: any;
    geo_location?: {lat: number, lon: number, alt?: number};
  }>;
  model_info: {
    name: string;
    version: string;
    task: 'object_detection' | 'classification' | 'tracking' | 'anomaly';
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

    const payload: DetectionPayload = await req.json()
    
    if (!payload.video_segment_id || !payload.detections || !payload.model_info) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: video_segment_id, detections, model_info' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate video segment exists
    const { data: segment, error: segmentError } = await supabaseClient
      .from('video_segments')
      .select('id, drone_id, mission_id')
      .eq('id', payload.video_segment_id)
      .single()

    if (segmentError || !segment) {
      return new Response(
        JSON.stringify({ error: 'Video segment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process detections and prepare for batch insert
    const detectionRecords = payload.detections.map(detection => ({
      video_segment_id: payload.video_segment_id,
      ts: new Date(detection.timestamp).toISOString(),
      class: detection.class,
      score: detection.confidence,
      bbox: detection.bbox,
      tracking_id: detection.tracking_id,
      model_version: `${payload.model_info.name}:${payload.model_info.version}`,
      geo: detection.geo_location
    }));

    // Batch insert detections
    const { error: insertError } = await supabaseClient
      .from('detections')
      .insert(detectionRecords);

    if (insertError) {
      console.error('Failed to insert detections:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to insert detections' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Analyze detections for alerts
    const criticalClasses = ['person', 'vehicle', 'weapon', 'fire', 'smoke'];
    const criticalDetections = payload.detections.filter(d => 
      criticalClasses.includes(d.class.toLowerCase()) && d.confidence > 0.8
    );

    const anomalies = payload.detections.filter(d => 
      d.class.toLowerCase().includes('anomaly') || d.confidence < 0.3
    );

    // Generate alerts for critical detections
    if (criticalDetections.length > 0) {
      await supabaseClient
        .from('events')
        .insert([{
          drone_id: segment.drone_id,
          type: 'CRITICAL_DETECTION',
          severity: 'critical',
          payload: {
            video_segment_id: payload.video_segment_id,
            mission_id: segment.mission_id,
            detection_count: criticalDetections.length,
            classes: criticalDetections.map(d => d.class),
            max_confidence: Math.max(...criticalDetections.map(d => d.confidence)),
            model: payload.model_info
          }
        }]);

      console.log(`🚨 CRITICAL DETECTIONS: ${criticalDetections.length} objects detected by drone ${segment.drone_id}`);
    }

    // Track model performance metrics
    const metrics = {
      total_detections: payload.detections.length,
      avg_confidence: payload.detections.reduce((sum, d) => sum + d.confidence, 0) / payload.detections.length,
      unique_classes: [...new Set(payload.detections.map(d => d.class))].length,
      critical_detections: criticalDetections.length,
      low_confidence: anomalies.length,
      processing_timestamp: new Date().toISOString()
    };

    // Store processing metrics for model evaluation
    await supabaseClient
      .from('kv_config')
      .upsert([{
        scope: 'model_metrics',
        key: `${payload.model_info.name}_${payload.video_segment_id}`,
        value_json: {
          model: payload.model_info,
          segment_id: payload.video_segment_id,
          metrics,
          detections_summary: {
            classes: metrics.unique_classes,
            critical_count: criticalDetections.length
          }
        }
      }]);

    console.log(`Processed ${payload.detections.length} detections for segment ${payload.video_segment_id} using ${payload.model_info.name}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        video_segment_id: payload.video_segment_id,
        processed_detections: payload.detections.length,
        critical_alerts: criticalDetections.length,
        model: payload.model_info,
        metrics,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Detections pipeline error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})