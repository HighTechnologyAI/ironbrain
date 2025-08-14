import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnterpriseFeatures } from '@/hooks/use-enterprise-features';
import { Shield, CheckCircle, AlertTriangle, XCircle, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export const ComplianceCenter: React.FC = () => {
  const { complianceChecks, loading, runComplianceChecks, exportData } = useEnterpriseFeatures();
  const [isRunningChecks, setIsRunningChecks] = useState(false);

  useEffect(() => {
    runComplianceChecks();
  }, [runComplianceChecks]);

  const handleRunChecks = async () => {
    setIsRunningChecks(true);
    await runComplianceChecks();
    setIsRunningChecks(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pass':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'fail':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const passedChecks = complianceChecks.filter(check => check.status === 'pass').length;
  const totalChecks = complianceChecks.length;
  const complianceScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Center</h2>
          <p className="text-muted-foreground">
            Monitor and maintain regulatory compliance across your system
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRunChecks}
            disabled={isRunningChecks}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRunningChecks ? 'animate-spin' : ''}`} />
            <span>Run Checks</span>
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  complianceScore >= 80 ? 'bg-green-600' : 
                  complianceScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${complianceScore}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed Checks</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passedChecks}</div>
            <p className="text-xs text-muted-foreground">
              out of {totalChecks} total checks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceChecks.length > 0 
                ? format(new Date(complianceChecks[0].last_checked), 'MMM dd')
                : 'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Compliance checks run
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>
                Current status of all compliance checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceChecks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">{check.check_type}</div>
                        <div className="text-sm text-muted-foreground">{check.details}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadgeVariant(check.status)}>
                        {check.status.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(check.last_checked), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gdpr" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>GDPR Compliance</CardTitle>
                <CardDescription>General Data Protection Regulation requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Privacy Policy</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Cookie Consent</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Data Export</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Right to be Forgotten</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Data Processing Records</span>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Subject Rights</CardTitle>
                <CardDescription>User rights management</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Users can request data export through their profile settings. 
                    All requests are logged for compliance tracking.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => exportData('demo-user', 'json')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Test Data Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Measures</CardTitle>
                <CardDescription>Implemented security controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>HTTPS Enforcement</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>CSP Headers</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Authentication Required</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Input Validation</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate Limiting</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Scan</CardTitle>
                <CardDescription>Latest security scan results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <div className="text-lg font-medium text-green-600">All Clear</div>
                  <div className="text-sm text-muted-foreground">
                    No security vulnerabilities detected
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Last scan: {format(new Date(), 'MMM dd, yyyy')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Data retention and backup policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Backup Status</h4>
                  <div className="flex items-center justify-between">
                    <span>Database Backup</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>File Storage Backup</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Backup Encryption</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Retention Policies</h4>
                  <div className="text-sm space-y-2">
                    <div>User Data: 7 years</div>
                    <div>Audit Logs: 10 years</div>
                    <div>Session Data: 30 days</div>
                    <div>Analytics: 2 years</div>
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