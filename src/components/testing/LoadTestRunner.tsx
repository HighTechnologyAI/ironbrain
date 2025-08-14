import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Zap, StopCircle, TrendingUp, Clock } from 'lucide-react';

interface LoadTestConfig {
  duration: number; // seconds
  requestsPerSecond: number;
  endpoint: string;
  method: 'GET' | 'POST';
}

interface LoadTestResult {
  timestamp: number;
  responseTime: number;
  success: boolean;
  statusCode: number;
}

interface LoadTestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
}

export const LoadTestRunner: React.FC = () => {
  const [config, setConfig] = useState<LoadTestConfig>({
    duration: 30,
    requestsPerSecond: 10,
    endpoint: '/api/test',
    method: 'GET'
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<LoadTestResult[]>([]);
  const [metrics, setMetrics] = useState<LoadTestMetrics | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const simulateRequest = useCallback(async (): Promise<LoadTestResult> => {
    const startTime = performance.now();
    
    try {
      // Simulate network request with random delay
      const delay = Math.random() * 200 + 50; // 50-250ms
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Simulate occasional failures (5% failure rate)
      const success = Math.random() > 0.05;
      const statusCode = success ? 200 : 500;
      const responseTime = performance.now() - startTime;
      
      return {
        timestamp: Date.now(),
        responseTime,
        success,
        statusCode
      };
    } catch (error) {
      return {
        timestamp: Date.now(),
        responseTime: performance.now() - startTime,
        success: false,
        statusCode: 500
      };
    }
  }, []);

  const calculateMetrics = useCallback((results: LoadTestResult[]): LoadTestMetrics => {
    const totalRequests = results.length;
    const successfulRequests = results.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const responseTimes = results.map(r => r.responseTime);
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / totalRequests;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    
    const duration = results.length > 0 
      ? (results[results.length - 1].timestamp - results[0].timestamp) / 1000
      : 1;
    const requestsPerSecond = totalRequests / duration;
    const errorRate = (failedRequests / totalRequests) * 100;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.round(averageResponseTime),
      minResponseTime: Math.round(minResponseTime),
      maxResponseTime: Math.round(maxResponseTime),
      requestsPerSecond: Math.round(requestsPerSecond * 10) / 10,
      errorRate: Math.round(errorRate * 10) / 10
    };
  }, []);

  const updateChartData = useCallback((results: LoadTestResult[]) => {
    const grouped = results.reduce((acc, result) => {
      const timeSlot = Math.floor((result.timestamp - startTimeRef.current) / 1000);
      if (!acc[timeSlot]) {
        acc[timeSlot] = { time: timeSlot, responseTimes: [], errors: 0 };
      }
      acc[timeSlot].responseTimes.push(result.responseTime);
      if (!result.success) {
        acc[timeSlot].errors++;
      }
      return acc;
    }, {} as Record<number, any>);

    const chartData = Object.values(grouped).map((slot: any) => ({
      time: slot.time,
      avgResponseTime: Math.round(slot.responseTimes.reduce((sum: number, time: number) => sum + time, 0) / slot.responseTimes.length),
      errors: slot.errors,
      requests: slot.responseTimes.length
    }));

    setChartData(chartData);
  }, []);

  const startLoadTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setMetrics(null);
    setChartData([]);
    startTimeRef.current = Date.now();
    
    const testResults: LoadTestResult[] = [];
    const totalDuration = config.duration * 1000; // Convert to milliseconds
    const interval = 1000 / config.requestsPerSecond; // Time between requests
    
    let requestCount = 0;
    const maxRequests = config.duration * config.requestsPerSecond;

    intervalRef.current = setInterval(async () => {
      if (requestCount >= maxRequests) {
        stopLoadTest();
        return;
      }

      // Execute multiple requests in parallel to achieve desired RPS
      const batchSize = Math.min(config.requestsPerSecond, maxRequests - requestCount);
      const promises = Array(batchSize).fill(null).map(() => simulateRequest());
      
      try {
        const batchResults = await Promise.all(promises);
        testResults.push(...batchResults);
        
        requestCount += batchSize;
        const progressPercent = (requestCount / maxRequests) * 100;
        setProgress(progressPercent);
        
        // Update results and metrics
        setResults([...testResults]);
        setMetrics(calculateMetrics(testResults));
        updateChartData(testResults);
        
      } catch (error) {
        console.error('Load test error:', error);
      }
    }, 1000); // Execute batch every second

    toast({
      title: 'Load Test Started',
      description: `Running ${config.requestsPerSecond} RPS for ${config.duration} seconds`
    });
  };

  const stopLoadTest = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setProgress(100);
    
    toast({
      title: 'Load Test Completed',
      description: `Generated ${results.length} requests`,
      variant: metrics && metrics.errorRate < 5 ? 'default' : 'destructive'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Load Test Runner</h2>
          <p className="text-muted-foreground">
            Performance testing and stress analysis
          </p>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Configure load test parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={config.duration}
                onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                disabled={isRunning}
              />
            </div>
            
            <div>
              <Label htmlFor="rps">Requests/Second</Label>
              <Input
                id="rps"
                type="number"
                value={config.requestsPerSecond}
                onChange={(e) => setConfig(prev => ({ ...prev, requestsPerSecond: parseInt(e.target.value) || 10 }))}
                disabled={isRunning}
              />
            </div>
            
            <div>
              <Label htmlFor="endpoint">Endpoint</Label>
              <Input
                id="endpoint"
                value={config.endpoint}
                onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                disabled={isRunning}
                placeholder="/api/endpoint"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={isRunning ? stopLoadTest : startLoadTest}
                className="w-full"
                variant={isRunning ? 'destructive' : 'default'}
              >
                {isRunning ? (
                  <>
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop Test
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Test
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.requestsPerSecond} RPS
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Badge variant={metrics.errorRate < 5 ? 'default' : 'destructive'}>
                {100 - metrics.errorRate}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.successfulRequests}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.failedRequests} failed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">
                {metrics.minResponseTime}-{metrics.maxResponseTime}ms range
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <Badge variant={metrics.errorRate < 5 ? 'default' : 'destructive'}>
                {metrics.errorRate}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                metrics.errorRate < 5 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metrics.errorRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Target: &lt; 5%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>Average response time over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}${name === 'avgResponseTime' ? 'ms' : ''}`, 
                      name === 'avgResponseTime' ? 'Avg Response Time' : 'Requests'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgResponseTime" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Volume & Errors</CardTitle>
              <CardDescription>Requests per second and error count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Requests"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="errors" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    name="Errors"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};