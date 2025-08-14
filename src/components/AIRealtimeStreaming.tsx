import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Wifi, 
  Database,
  Brain,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeData {
  id: string;
  timestamp: string;
  source: string;
  type: 'telemetry' | 'event' | 'alert' | 'command';
  data: any;
  processed: boolean;
}

interface StreamMetrics {
  totalEvents: number;
  eventsPerSecond: number;
  averageLatency: number;
  errorRate: number;
  activeConnections: number;
}

const AIRealtimeStreaming: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamData, setStreamData] = useState<RealtimeData[]>([]);
  const [metrics, setMetrics] = useState<StreamMetrics>({
    totalEvents: 0,
    eventsPerSecond: 0,
    averageLatency: 45,
    errorRate: 0.2,
    activeConnections: 8
  });
  const [processingQueue, setProcessingQueue] = useState<number>(0);

  // Real-time subscription to UAV events and telemetry
  useEffect(() => {
    let channel: any = null;

    if (isStreaming) {
      channel = supabase
        .channel('ai-realtime-operations')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'uav_events'
          },
          (payload) => {
            const newEvent: RealtimeData = {
              id: payload.new.id,
              timestamp: payload.new.ts || new Date().toISOString(),
              source: `drone-${payload.new.drone_id}`,
              type: 'event',
              data: payload.new,
              processed: false
            };
            
            setStreamData(prev => [newEvent, ...prev.slice(0, 99)]);
            setMetrics(prev => ({
              ...prev,
              totalEvents: prev.totalEvents + 1,
              eventsPerSecond: prev.eventsPerSecond + 0.1
            }));
            
            // Auto-process with AI
            processEventWithAI(newEvent);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'uav_commands'
          },
          (payload) => {
            const newCommand: RealtimeData = {
              id: payload.new.id,
              timestamp: payload.new.created_at,
              source: 'command-center',
              type: 'command',
              data: payload.new,
              processed: false
            };
            
            setStreamData(prev => [newCommand, ...prev.slice(0, 99)]);
          }
        )
        .subscribe();

      // Simulate telemetry data stream
      const telemetryInterval = setInterval(() => {
        const mockTelemetry: RealtimeData = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          source: `drone-${Math.floor(Math.random() * 5) + 1}`,
          type: 'telemetry',
          data: {
            battery: Math.random() * 100,
            altitude: Math.random() * 500,
            speed: Math.random() * 50,
            coordinates: {
              lat: 42.3601 + (Math.random() - 0.5) * 0.01,
              lng: -71.0589 + (Math.random() - 0.5) * 0.01
            }
          },
          processed: false
        };
        
        setStreamData(prev => [mockTelemetry, ...prev.slice(0, 99)]);
        setMetrics(prev => ({
          ...prev,
          totalEvents: prev.totalEvents + 1,
          eventsPerSecond: Math.max(0, prev.eventsPerSecond + (Math.random() - 0.5) * 2)
        }));
      }, 2000);

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
        clearInterval(telemetryInterval);
      };
    }
  }, [isStreaming]);

  const processEventWithAI = async (event: RealtimeData) => {
    setProcessingQueue(prev => prev + 1);
    
    try {
      // Simulate AI processing
      setTimeout(() => {
        setStreamData(prev => prev.map(item => 
          item.id === event.id ? { ...item, processed: true } : item
        ));
        setProcessingQueue(prev => Math.max(0, prev - 1));
        
        // Generate AI insights for critical events
        if (event.type === 'event' && event.data.severity === 'critical') {
          toast.warning(`AI Alert: ${event.data.message}`, {
            description: 'Automated analysis suggests immediate attention required'
          });
        }
      }, Math.random() * 3000 + 1000);
    } catch (error) {
      console.error('AI processing error:', error);
      setProcessingQueue(prev => Math.max(0, prev - 1));
    }
  };

  const handleToggleStreaming = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      toast.success('Real-time streaming started');
    } else {
      toast.info('Real-time streaming stopped');
    }
  };

  const getDataTypeColor = (type: string) => {
    switch (type) {
      case 'telemetry': return 'bg-blue-500 text-white';
      case 'event': return 'bg-orange-500 text-white';
      case 'alert': return 'bg-red-500 text-white';
      case 'command': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'telemetry': return <Activity className="h-3 w-3" />;
      case 'event': return <Zap className="h-3 w-3" />;
      case 'alert': return <AlertTriangle className="h-3 w-3" />;
      case 'command': return <Settings className="h-3 w-3" />;
      default: return <Database className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Real-time Streaming</h3>
          <p className="text-sm text-muted-foreground">
            Live data processing and AI analysis of UAV operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isStreaming ? "default" : "secondary"} className="gap-1">
            <Wifi className="h-3 w-3" />
            {isStreaming ? 'Streaming' : 'Offline'}
          </Badge>
          <Button 
            onClick={handleToggleStreaming}
            variant={isStreaming ? "destructive" : "default"}
            size="sm"
            className="gap-2"
          >
            {isStreaming ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isStreaming ? 'Stop' : 'Start'} Stream
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Events</span>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.totalEvents.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Since start</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Events/sec</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.eventsPerSecond.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Current rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Latency</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.averageLatency}ms</div>
            <div className="text-xs text-muted-foreground">Average</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Error Rate</span>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.errorRate}%</div>
            <div className="text-xs text-muted-foreground">Last hour</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Processing Queue</span>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">{processingQueue}</div>
            <div className="text-xs text-muted-foreground">AI tasks</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stream" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stream">Live Stream</TabsTrigger>
          <TabsTrigger value="analytics">Stream Analytics</TabsTrigger>
          <TabsTrigger value="processing">AI Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="stream" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Data Stream
              </CardTitle>
              <CardDescription>
                Real-time events and telemetry from UAV operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {streamData.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-center">
                    <div>
                      <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Data Stream</h3>
                      <p className="text-muted-foreground mb-4">
                        Start streaming to see real-time data
                      </p>
                      <Button onClick={handleToggleStreaming} className="gap-2">
                        <Play className="h-4 w-4" />
                        Start Streaming
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {streamData.map((item, index) => (
                      <div 
                        key={item.id} 
                        className={`p-3 border rounded-lg transition-all ${
                          index === 0 ? 'border-primary bg-primary/5' : ''
                        } ${item.processed ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getDataTypeIcon(item.type)}
                            <span className="text-sm font-medium">{item.source}</span>
                            <Badge className={getDataTypeColor(item.type)} variant="secondary">
                              {item.type}
                            </Badge>
                            {item.processed && (
                              <Badge variant="outline" className="text-xs">
                                AI Processed
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {item.type === 'telemetry' && (
                            <div className="grid grid-cols-4 gap-2">
                              <span>Battery: {item.data.battery?.toFixed(1)}%</span>
                              <span>Alt: {item.data.altitude?.toFixed(0)}m</span>
                              <span>Speed: {item.data.speed?.toFixed(1)}m/s</span>
                              <span>Coord: {item.data.coordinates?.lat?.toFixed(4)}, {item.data.coordinates?.lng?.toFixed(4)}</span>
                            </div>
                          )}
                          {item.type === 'event' && (
                            <span>{item.data.message || item.data.event_type}</span>
                          )}
                          {item.type === 'command' && (
                            <span>Command: {item.data.command_type} - Status: {item.data.status}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stream Analytics</CardTitle>
              <CardDescription>
                Real-time analysis of data patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Data Volume by Type</h4>
                  <div className="space-y-2">
                    {['telemetry', 'event', 'command', 'alert'].map(type => {
                      const count = streamData.filter(item => item.type === type).length;
                      const percentage = streamData.length > 0 ? (count / streamData.length) * 100 : 0;
                      
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <span className="w-20 text-sm capitalize">{type}</span>
                          <Progress value={percentage} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-12">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">AI Processing Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-500 mb-1">
                        {streamData.filter(item => item.processed).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Processed</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-500 mb-1">
                        {processingQueue}
                      </div>
                      <div className="text-sm text-muted-foreground">In Queue</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-500 mb-1">
                        {streamData.filter(item => !item.processed).length - processingQueue}
                      </div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Processing Pipeline</CardTitle>
              <CardDescription>
                Real-time AI analysis and processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Processing Pipeline Status</h4>
                  <div className="space-y-3">
                    {[
                      { stage: 'Data Ingestion', status: 'active', throughput: '23.5 events/sec' },
                      { stage: 'Pattern Recognition', status: 'active', throughput: '21.2 events/sec' },
                      { stage: 'Anomaly Detection', status: 'active', throughput: '19.8 events/sec' },
                      { stage: 'Predictive Analysis', status: 'active', throughput: '18.1 events/sec' },
                      { stage: 'Alert Generation', status: 'active', throughput: '2.3 alerts/min' }
                    ].map(stage => (
                      <div key={stage.stage} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            stage.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                          }`} />
                          <span className="font-medium">{stage.stage}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{stage.throughput}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Recent AI Insights</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-blue-50 border-l-4 border-l-blue-500 rounded">
                      <span className="font-medium">Battery Pattern:</span> Drone-3 showing 8% higher consumption than expected
                    </div>
                    <div className="p-2 bg-green-50 border-l-4 border-l-green-500 rounded">
                      <span className="font-medium">Efficiency Gain:</span> Route optimization saved 12 minutes flight time
                    </div>
                    <div className="p-2 bg-yellow-50 border-l-4 border-l-yellow-500 rounded">
                      <span className="font-medium">Weather Impact:</span> Wind patterns affecting eastern sector operations
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIRealtimeStreaming;