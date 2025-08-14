import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalytics } from '@/hooks/use-analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Eye, Clock, Target } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { metrics, loading, getMetrics, trackUserAction } = useAnalytics();
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    trackUserAction('view_analytics_dashboard');
    
    const end = new Date().toISOString();
    const start = new Date(Date.now() - getDaysFromRange(dateRange) * 24 * 60 * 60 * 1000).toISOString();
    
    getMetrics({ start, end });
  }, [dateRange, getMetrics, trackUserAction]);

  const getDaysFromRange = (range: string): number => {
    switch (range) {
      case '1d': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  const mockChartData = [
    { name: 'Mon', pageViews: 400, users: 240 },
    { name: 'Tue', pageViews: 300, users: 139 },
    { name: 'Wed', pageViews: 200, users: 980 },
    { name: 'Thu', pageViews: 278, users: 390 },
    { name: 'Fri', pageViews: 189, users: 480 },
    { name: 'Sat', pageViews: 239, users: 380 },
    { name: 'Sun', pageViews: 349, users: 430 },
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, color: 'hsl(var(--primary))' },
    { name: 'Mobile', value: 25, color: 'hsl(var(--secondary))' },
    { name: 'Tablet', value: 10, color: 'hsl(var(--accent))' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your application performance and user behavior
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.pageViews?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.uniqueUsers?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4:32</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              +0.3% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
                <CardDescription>Page views and unique users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="pageViews" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--secondary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>User devices breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Acquisition</CardTitle>
              <CardDescription>New vs returning users</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Pages</CardTitle>
                <CardDescription>Most visited pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { page: '/dashboard', views: 1420, percentage: 35 },
                    { page: '/tasks', views: 980, percentage: 24 },
                    { page: '/projects', views: 756, percentage: 19 },
                    { page: '/team', views: 543, percentage: 13 },
                    { page: '/analytics', views: 367, percentage: 9 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.page}</div>
                        <div className="text-sm text-muted-foreground">{item.views} views</div>
                      </div>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Flow</CardTitle>
                <CardDescription>Common user paths</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <div className="font-medium mb-2">Most Common Path:</div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <span>/</span>
                      <span>→</span>
                      <span>/dashboard</span>
                      <span>→</span>
                      <span>/tasks</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium mb-2">Average Pages per Session:</div>
                    <div className="text-2xl font-bold">3.4</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2s</div>
                <p className="text-xs text-muted-foreground">Average load time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">LCP</span>
                    <span className="text-sm font-medium text-green-600">Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">FID</span>
                    <span className="text-sm font-medium text-green-600">Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">CLS</span>
                    <span className="text-sm font-medium text-yellow-600">Needs Improvement</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.1%</div>
                <p className="text-xs text-muted-foreground">JavaScript errors</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};