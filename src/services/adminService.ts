import { supabase } from '@/integrations/supabase/client';

export interface AdminServiceConfig {
  adminKey: string;
}

export interface SystemStatus {
  database: boolean;
  api: boolean;
  auth: boolean;
  timestamp: string;
}

export interface SqlQueryResult {
  data: any[];
  error?: string;
  rowCount: number;
}

export class AdminService {
  private adminKey: string;

  constructor(config: AdminServiceConfig) {
    this.adminKey = config.adminKey;
  }

  private async makeAdminCall(action: string, method = 'GET', body?: any) {
    const { data, error } = await supabase.functions.invoke('admin-api', {
      body: {
        action,
        method,
        data: body
      },
      headers: {
        'x-admin-key': this.adminKey
      }
    });

    if (error) {
      throw new Error(error.message || 'API Error');
    }

    return data;
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return this.makeAdminCall('system-status');
  }

  async executeSqlQuery(query: string): Promise<SqlQueryResult> {
    return this.makeAdminCall('execute-query', 'POST', { query });
  }

  async getTasks() {
    return this.makeAdminCall('tasks');
  }

  async getAnalytics() {
    return this.makeAdminCall('analytics');
  }

  async getProfiles() {
    return this.makeAdminCall('profiles');
  }

  async createTask(taskData: any) {
    return this.makeAdminCall('create-task', 'POST', taskData);
  }

  async updateSystemConfig(config: any) {
    return this.makeAdminCall('update-config', 'PUT', config);
  }

  async generateBackup() {
    return this.makeAdminCall('backup', 'POST');
  }
}