import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemTestDashboard } from '@/components/testing/SystemTestDashboard';
import { LoadTestRunner } from '@/components/testing/LoadTestRunner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube, Zap, Shield, Monitor, Smartphone, Database } from 'lucide-react';

export const TestingCenter: React.FC = () => {
  console.log('TestingCenter component loaded successfully');
  const testCategories = [
    {
      icon: <TestTube className="h-5 w-5" />,
      title: 'System Tests',
      description: 'Comprehensive functionality testing',
      count: '20+ tests',
      status: 'ready'
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Load Tests',
      description: 'Performance and stress testing',
      count: 'Configurable',
      status: 'ready'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Security Tests',
      description: 'Security and compliance validation',
      count: '8 checks',
      status: 'active'
    },
    {
      icon: <Monitor className="h-5 w-5" />,
      title: 'UI/UX Tests',
      description: 'Interface and accessibility testing',
      count: '6 tests',
      status: 'ready'
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: 'Mobile Tests',
      description: 'Mobile-specific functionality',
      count: '4 tests',
      status: 'ready'
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: 'Integration Tests',
      description: 'API and database connectivity',
      count: '5 tests',
      status: 'ready'
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'ready':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testing Center</h1>
          <p className="text-muted-foreground">
            Comprehensive testing and quality assurance dashboard
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Phase 7: Testing
        </Badge>
      </div>

      {/* Test Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testCategories.map((category, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {category.icon}
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">{category.title}</CardTitle>
                  <CardDescription className="text-xs">{category.description}</CardDescription>
                </div>
              </div>
              <Badge variant={getStatusVariant(category.status)} className="text-xs">
                {category.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{category.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Testing Interface */}
      <Tabs defaultValue="system" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>System Tests</span>
          </TabsTrigger>
          <TabsTrigger value="load" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Load Tests</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <SystemTestDashboard />
        </TabsContent>

        <TabsContent value="load" className="space-y-4">
          <LoadTestRunner />
        </TabsContent>
      </Tabs>

      {/* Testing Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Best Practices</CardTitle>
          <CardDescription>Guidelines for effective testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Do</h4>
              <ul className="space-y-2 text-sm">
                <li>• Run tests regularly during development</li>
                <li>• Test on different devices and browsers</li>
                <li>• Include edge cases and error scenarios</li>
                <li>• Monitor performance metrics continuously</li>
                <li>• Validate security measures thoroughly</li>
                <li>• Test user workflows end-to-end</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-red-600">❌ Don't</h4>
              <ul className="space-y-2 text-sm">
                <li>• Skip testing in production-like environments</li>
                <li>• Ignore failed tests or warnings</li>
                <li>• Test only happy path scenarios</li>
                <li>• Overlook mobile and accessibility testing</li>
                <li>• Deploy without running full test suite</li>
                <li>• Assume tests will pass without verification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Readiness Status</CardTitle>
          <CardDescription>Current state of all implemented features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Architecture Refactoring</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Performance Optimizations</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Security Implementation</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>CI/CD Pipeline</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Advanced Features</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Enterprise Features</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Testing Suite</span>
                <Badge variant="secondary">🔄 In Progress</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Production Ready</span>
                <Badge variant="outline">⏳ Pending</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingCenter;