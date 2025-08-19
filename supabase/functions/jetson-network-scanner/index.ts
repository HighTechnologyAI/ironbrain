import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScanResult {
  ip: string;
  port: number;
  status: 'jetson' | 'unknown' | 'timeout';
  response?: any;
  responseTime?: number;
}

async function checkJetsonEndpoint(ip: string, port: number = 5000): Promise<ScanResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
  
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Checking ${ip}:${port}...`);
    
    const response = await fetch(`http://${ip}:${port}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Found Jetson at ${ip}:${port} (${responseTime}ms)`);
      
      // Check if it's a Jetson GCS response
      if (data.service === 'jetson-gcs' || data.platform?.includes('jetson') || data.version) {
        return {
          ip,
          port,
          status: 'jetson',
          response: data,
          responseTime
        };
      }
    }
    
    return {
      ip,
      port,
      status: 'unknown',
      responseTime
    };
    
  } catch (error) {
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    console.log(`❌ No response from ${ip}:${port} (${responseTime}ms): ${error.message}`);
    
    return {
      ip,
      port,
      status: 'timeout',
      responseTime
    };
  }
}

async function scanSubnet(baseIp: string): Promise<ScanResult[]> {
  const ipParts = baseIp.split('.');
  const subnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
  
  console.log(`🌐 Scanning subnet ${subnet}.0/24 for Jetson devices...`);
  
  // Create array of IPs to scan (skip .0 and .255)
  const ipsToScan = [];
  for (let i = 1; i < 255; i++) {
    ipsToScan.push(`${subnet}.${i}`);
  }
  
  // Scan in batches of 20 to avoid overwhelming the network
  const batchSize = 20;
  const results: ScanResult[] = [];
  
  for (let i = 0; i < ipsToScan.length; i += batchSize) {
    const batch = ipsToScan.slice(i, i + batchSize);
    
    console.log(`📡 Scanning batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(ipsToScan.length/batchSize)} (IPs ${batch[0]} - ${batch[batch.length-1]})`);
    
    const batchPromises = batch.map(ip => checkJetsonEndpoint(ip));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    // Short delay between batches
    if (i + batchSize < ipsToScan.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, subnet } = await req.json();
    
    console.log(`🚀 Jetson Network Scanner - Action: ${action}`);
    
    if (action === 'scan') {
      const baseIp = subnet || '192.168.1.1'; // Default to common router IP
      
      const scanResults = await scanSubnet(baseIp);
      
      // Filter results to show only successful connections and Jetson devices
      const jetsonDevices = scanResults.filter(result => result.status === 'jetson');
      const allResults = scanResults.filter(result => result.status !== 'timeout');
      
      console.log(`✅ Scan complete. Found ${jetsonDevices.length} Jetson device(s) out of ${allResults.length} responding hosts`);
      
      return new Response(
        JSON.stringify({
          success: true,
          jetsonDevices,
          allResults,
          summary: {
            totalScanned: scanResults.length,
            responding: allResults.length,
            jetsonFound: jetsonDevices.length
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    if (action === 'ping') {
      const { ip, port } = await req.json();
      const result = await checkJetsonEndpoint(ip, port || 5000);
      
      return new Response(
        JSON.stringify({
          success: true,
          result
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid action. Use "scan" or "ping"' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );

  } catch (error) {
    console.error('❌ Scanner error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});