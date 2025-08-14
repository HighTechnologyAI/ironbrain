import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useEnterpriseFeatures } from '@/hooks/use-enterprise-features';
import { Search, Download, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs, loading, getAuditLogs } = useEnterpriseFeatures();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const end = new Date().toISOString();
    const start = new Date(Date.now() - getDaysFromRange(dateRange) * 24 * 60 * 60 * 1000).toISOString();
    
    getAuditLogs({
      action: actionFilter === 'all' ? undefined : actionFilter,
      dateRange: { start, end }
    });
  }, [actionFilter, dateRange, getAuditLogs]);

  const getDaysFromRange = (range: string): number => {
    switch (range) {
      case '1d': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user_id,
        log.action,
        log.resource_type,
        log.resource_id,
        log.ip_address
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${Date.now()}.csv`;
    link.click();
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'login':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Log Viewer</h2>
          <p className="text-muted-foreground">
            Track all user actions and system changes for compliance
          </p>
        </div>
        
        <Button onClick={exportLogs} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {filteredLogs.length} records found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.user_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.resource_type}</div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {log.resource_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {Object.keys(log.changes).length > 0 && (
                            <details className="cursor-pointer">
                              <summary className="text-sm font-medium">
                                {Object.keys(log.changes).length} changes
                              </summary>
                              <div className="mt-2 text-xs bg-muted p-2 rounded">
                                <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                              </div>
                            </details>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.ip_address}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};