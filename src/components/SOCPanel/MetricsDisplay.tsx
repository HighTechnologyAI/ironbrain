import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  Users, 
  Shield, 
  Zap,
  Database,
  Globe,
  Clock
} from 'lucide-react';

interface MetricData {
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  timestamp?: string;
}

interface MetricsDisplayProps {
  timeRange?: '1h' | '24h' | '7d' | '30d';
  onTimeRangeChange?: (range: string) => void;
}

const mockMetrics: MetricData[] = [
  {
    name: 'Active Drones',
    value: 8,
    change: 2,
    changeType: 'increase',
    unit: 'units',
    icon: Activity,
    color: '#22c55e'
  },
  {
    name: 'Active Missions',
    value: 3,
    change: 1,
    changeType: 'increase', 
    unit: 'missions',
    icon: Globe,
    color: '#3b82f6'
  },
  {
    name: 'Security Events',
    value: 12,
    change: -3,
    changeType: 'decrease',
    unit: 'events/h',
    icon: Shield,
    color: '#f59e0b'
  },
  {
    name: 'System Load',
    value: 68,
    change: 5,
    changeType: 'increase',
    unit: '%',
    icon: Zap,
    color: '#ef4444'
  },
  {
    name: 'DB Queries/sec',
    value: 145,
    change: 0,
    changeType: 'neutral',
    unit: 'qps',
    icon: Database,
    color: '#8b5cf6'
  },
  {
    name: 'Response Time',
    value: 23,
    change: -8,
    changeType: 'decrease',
    unit: 'ms',
    icon: Clock,
    color: '#06b6d4'
  }
];

const mockTimeSeriesData: ChartData[] = [
  { name: '00:00', value: 65 },
  { name: '04:00', value: 42 },
  { name: '08:00', value: 78 },
  { name: '12:00', value: 85 },
  { name: '16:00', value: 91 },
  { name: '20:00', value: 68 },
];

const mockDistributionData: ChartData[] = [
  { name: 'Security', value: 35 },
  { name: 'System', value: 25 },
  { name: 'Network', value: 20 },
  { name: 'Drone', value: 15 },
  { name: 'Mission', value: 5 }
];

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  timeRange = '24h',
  onTimeRangeChange
}) => {
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'pie'>('line');

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mockMetrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="h-5 w-5" style={{ color: metric.color }} />
                  {getTrendIcon(metric.changeType)}
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.name}</div>
                  <div className={`text-xs flex items-center gap-1 ${getChangeColor(metric.changeType)}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change} {metric.unit}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Activity
              </CardTitle>
              <div className="flex gap-2">
                <Select value={timeRange} onValueChange={onTimeRangeChange}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1H</SelectItem>
                    <SelectItem value="24h">24H</SelectItem>
                    <SelectItem value="7d">7D</SelectItem>
                    <SelectItem value="30d">30D</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedChart} onValueChange={(value: any) => setSelectedChart(value)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {selectedChart === 'line' ? (
                  <LineChart data={mockTimeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={mockTimeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Event Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Event Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">CPU Usage</span>
                <span className="text-sm font-medium">68%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm font-medium">72%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Network I/O</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Disk Usage</span>
                <span className="text-sm font-medium">83%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsDisplay;