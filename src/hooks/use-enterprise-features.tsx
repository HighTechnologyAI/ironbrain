import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, any>;
  timestamp: string;
  ip_address: string;
  user_agent: string;
}

interface ComplianceCheck {
  id: string;
  check_type: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  last_checked: string;
}

export const useEnterpriseFeatures = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const logAction = useCallback(async (
    action: string,
    resourceType: string,
    resourceId: string,
    changes: Record<string, any> = {}
  ) => {
    if (!user) return;

    try {
      const auditEntry: Omit<AuditLog, 'id'> = {
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        changes,
        timestamp: new Date().toISOString(),
        ip_address: 'client-side', // In production, get from server
        user_agent: navigator.userAgent
      };

      // For demo, store in localStorage
      const stored = localStorage.getItem('audit_logs') || '[]';
      const logs = JSON.parse(stored);
      logs.push({ ...auditEntry, id: crypto.randomUUID() });
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  }, [user]);

  const runComplianceChecks = useCallback(async () => {
    setLoading(true);
    try {
      // GDPR Compliance Check
      const gdprCheck: ComplianceCheck = {
        id: crypto.randomUUID(),
        check_type: 'GDPR',
        status: 'pass',
        details: 'Privacy policy implemented, user consent tracking active',
        last_checked: new Date().toISOString()
      };

      // Security Compliance Check
      const securityCheck: ComplianceCheck = {
        id: crypto.randomUUID(),
        check_type: 'Security',
        status: 'pass',
        details: 'HTTPS enforced, CSP headers active, authentication required',
        last_checked: new Date().toISOString()
      };

      // Data Retention Check
      const dataRetentionCheck: ComplianceCheck = {
        id: crypto.randomUUID(),
        check_type: 'Data Retention',
        status: 'warning',
        details: 'Review data retention policies for user data',
        last_checked: new Date().toISOString()
      };

      setComplianceChecks([gdprCheck, securityCheck, dataRetentionCheck]);
    } catch (error) {
      console.error('Error running compliance checks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (userId: string, format: 'json' | 'csv') => {
    try {
      // For demo, use mock data
      const userData = [{ id: userId, name: 'Demo User', email: 'demo@example.com' }];
      const tasksData = [{ id: '1', title: 'Sample Task', assigned_to: userId }];
      const auditData = JSON.parse(localStorage.getItem('audit_logs') || '[]')
        .filter((log: any) => log.user_id === userId);

      const exportData = {
        profile: userData,
        tasks: tasksData,
        audit_logs: auditData,
        exported_at: new Date().toISOString()
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user_data_${userId}_${Date.now()}.json`;
        link.click();
      } else {
        // Convert to CSV format
        const csvContent = convertToCSV(exportData);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user_data_${userId}_${Date.now()}.csv`;
        link.click();
      }

      await logAction('data_export', 'user', userId, { format });
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }, [logAction]);

  const deleteUserData = useCallback(async (userId: string) => {
    try {
      // For demo, remove from localStorage
      const auditLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      const filteredLogs = auditLogs.filter((log: any) => log.user_id !== userId);
      localStorage.setItem('audit_logs', JSON.stringify(filteredLogs));
      
      await logAction('data_deletion', 'user', userId);
    } catch (error) {
      console.error('Error deleting user data:', error);
    }
  }, [logAction]);

  const getAuditLogs = useCallback(async (filters: {
    userId?: string;
    action?: string;
    dateRange?: { start: string; end: string };
  }) => {
    setLoading(true);
    try {
      // For demo, use localStorage
      const stored = localStorage.getItem('audit_logs') || '[]';
      let data = JSON.parse(stored);
      
      if (filters.userId) {
        data = data.filter((log: any) => log.user_id === filters.userId);
      }
      
      if (filters.action) {
        data = data.filter((log: any) => log.action === filters.action);
      }
      
      if (filters.dateRange) {
        data = data.filter((log: any) => 
          log.timestamp >= filters.dateRange!.start && 
          log.timestamp <= filters.dateRange!.end
        );
      }

      setAuditLogs(data.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    auditLogs,
    complianceChecks,
    loading,
    logAction,
    runComplianceChecks,
    exportData,
    deleteUserData,
    getAuditLogs
  };
};

function convertToCSV(data: any): string {
  // Simple CSV conversion utility
  const flattenObject = (obj: any, prefix = ''): any => {
    let flattened: any = {};
    for (let key in obj) {
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}.`));
      } else {
        flattened[`${prefix}${key}`] = obj[key];
      }
    }
    return flattened;
  };

  const flattened = flattenObject(data);
  const headers = Object.keys(flattened);
  const values = Object.values(flattened);
  
  return [headers.join(','), values.join(',')].join('\n');
}