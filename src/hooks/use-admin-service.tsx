import { useState, useCallback } from 'react';
import { AdminService, SystemStatus, SqlQueryResult } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { RateLimiter } from '@/utils/security';

const rateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

export const useAdminService = () => {
  const [adminService, setAdminService] = useState<AdminService | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const { toast } = useToast();

  const authenticate = useCallback(async (adminKey: string): Promise<boolean> => {
    try {
      // Check rate limiting
      if (!rateLimiter.isAllowed('admin-auth')) {
        const resetTime = new Date(Date.now() + rateLimiter.getRemainingTime('admin-auth'));
        setLockoutTime(resetTime.getTime());
        throw new Error(`Too many authentication attempts. Try again at ${resetTime.toLocaleTimeString()}`);
      }

      const service = new AdminService({ adminKey });
      
      // Test authentication by calling a simple endpoint
      await service.getSystemStatus();
      
      setAdminService(service);
      setIsAuthenticated(true);
      setAuthAttempts(0);
      setLockoutTime(null);
      
      toast({
        title: 'Success',
        description: 'Successfully authenticated to admin panel',
      });
      
      return true;
    } catch (error: any) {
      setAuthAttempts(prev => prev + 1);
      setIsAuthenticated(false);
      setAdminService(null);
      
      toast({
        title: 'Authentication failed',
        description: error.message,
        variant: 'destructive'
      });
      
      return false;
    }
  }, [toast]);

  const logout = useCallback(() => {
    setAdminService(null);
    setIsAuthenticated(false);
    setAuthAttempts(0);
    setLockoutTime(null);
  }, []);

  const callService = useCallback(async (
    operation: (service: AdminService) => Promise<any>
  ): Promise<any | null> => {
    if (!adminService) {
      toast({
        title: 'Error',
        description: 'Not authenticated',
        variant: 'destructive'
      });
      return null;
    }

    try {
      return await operation(adminService);
    } catch (error: any) {
      toast({
        title: 'Service Error',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  }, [adminService, toast]);

  return {
    isAuthenticated,
    authAttempts,
    lockoutTime,
    authenticate,
    logout,
    callService,
    // Convenient methods
    getSystemStatus: () => callService(service => service.getSystemStatus()),
    executeSqlQuery: (query: string) => callService(service => service.executeSqlQuery(query)),
    getTasks: () => callService(service => service.getTasks()),
    getAnalytics: () => callService(service => service.getAnalytics()),
    getProfiles: () => callService(service => service.getProfiles()),
    createTask: (taskData: any) => callService(service => service.createTask(taskData)),
    generateBackup: () => callService(service => service.generateBackup())
  };
};