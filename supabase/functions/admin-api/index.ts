import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Admin authentication key
const ADMIN_KEY = Deno.env.get('ADMIN_API_KEY') || 'tiger-admin-2025';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check admin authentication
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized - Invalid admin key' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const { method } = req;

    console.log(`Admin API called: ${method} ${action}`);

    switch (action) {
      case 'system_status':
        return await getSystemStatus(supabaseAdmin);
      
      case 'users_stats':
        return await getUsersStats(supabaseAdmin);
      
      case 'tasks_management':
        if (method === 'GET') return await getTasksManagement(supabaseAdmin);
        if (method === 'POST') return await createTaskViaAPI(supabaseAdmin, req);
        if (method === 'PUT') return await updateTaskViaAPI(supabaseAdmin, req);
        if (method === 'DELETE') return await deleteTaskViaAPI(supabaseAdmin, req);
        break;
      
      case 'database_query':
        if (method === 'POST') return await executeDatabaseQuery(supabaseAdmin, req);
        break;
      
      case 'bulk_operations':
        if (method === 'POST') return await executeBulkOperation(supabaseAdmin, req);
        break;
      
      case 'backup_data':
        return await backupData(supabaseAdmin);
      
      case 'analytics':
        return await getAnalytics(supabaseAdmin);
      
      default:
        return new Response(JSON.stringify({ 
          error: 'Unknown action',
          available_actions: [
            'system_status', 'users_stats', 'tasks_management', 
            'database_query', 'bulk_operations', 'backup_data', 'analytics'
          ]
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Admin API error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getSystemStatus(supabase: any) {
  const [usersCount, tasksCount, profilesCount] = await Promise.all([
    supabase.from('auth.users').select('*', { count: 'exact' }),
    supabase.from('tasks').select('*', { count: 'exact' }),
    supabase.from('profiles').select('*', { count: 'exact' })
  ]);

  return new Response(JSON.stringify({
    success: true,
    system_status: 'online',
    timestamp: new Date().toISOString(),
    stats: {
      total_users: usersCount.count || 0,
      total_tasks: tasksCount.count || 0,
      total_profiles: profilesCount.count || 0,
    },
    health: {
      database: 'connected',
      api: 'operational',
      functions: 'active'
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getUsersStats(supabase: any) {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const stats = {
    total_users: profiles?.length || 0,
    active_users: profiles?.filter((p: any) => p.is_active).length || 0,
    by_role: {},
    by_department: {},
    recent_signups: profiles?.slice(0, 10) || []
  };

  // Group by role and department
  profiles?.forEach((profile: any) => {
    stats.by_role[profile.role] = (stats.by_role[profile.role] || 0) + 1;
    if (profile.department) {
      stats.by_department[profile.department] = (stats.by_department[profile.department] || 0) + 1;
    }
  });

  return new Response(JSON.stringify({
    success: true,
    users_stats: stats,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getTasksManagement(supabase: any) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_to:profiles!tasks_assigned_to_fkey(id, full_name, department),
      created_by:profiles!tasks_created_by_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  const stats = {
    total: tasks?.length || 0,
    by_status: {},
    by_priority: {},
    overdue: 0
  };

  tasks?.forEach((task: any) => {
    stats.by_status[task.status] = (stats.by_status[task.status] || 0) + 1;
    stats.by_priority[task.priority] = (stats.by_priority[task.priority] || 0) + 1;
    
    if (task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed') {
      stats.overdue++;
    }
  });

  return new Response(JSON.stringify({
    success: true,
    tasks: tasks || [],
    stats,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function createTaskViaAPI(supabase: any, req: Request) {
  const body = await req.json();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(body.task_data)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    task: data,
    message: 'Task created successfully via API'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function executeDatabaseQuery(supabase: any, req: Request) {
  const { query, table, operation, data, filters } = await req.json();

  let result;
  
  if (query) {
    // Raw SQL query (limited for security)
    if (!query.toLowerCase().startsWith('select')) {
      throw new Error('Only SELECT queries are allowed via API');
    }
    result = await supabase.rpc('exec_sql', { sql: query });
  } else {
    // Safe operations
    let queryBuilder = supabase.from(table);
    
    switch (operation) {
      case 'select':
        queryBuilder = queryBuilder.select(data || '*');
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value);
          });
        }
        break;
      case 'insert':
        queryBuilder = queryBuilder.insert(data);
        break;
      case 'update':
        queryBuilder = queryBuilder.update(data);
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value);
          });
        }
        break;
      case 'delete':
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value);
          });
        }
        queryBuilder = queryBuilder.delete();
        break;
    }
    
    result = await queryBuilder;
  }

  return new Response(JSON.stringify({
    success: true,
    result: result.data,
    error: result.error,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function backupData(supabase: any) {
  // Export all main tables
  const tables = ['profiles', 'tasks', 'companies', 'achievements'];
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    data: {}
  };

  for (const table of tables) {
    const { data } = await supabase.from(table).select('*');
    backup.data[table] = data || [];
  }

  return new Response(JSON.stringify({
    success: true,
    backup,
    download_url: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backup))}`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getAnalytics(supabase: any) {
  const { data: tasks } = await supabase.from('tasks').select('*');
  const { data: profiles } = await supabase.from('profiles').select('*');
  
  const analytics = {
    tasks: {
      completion_rate: tasks?.filter((t: any) => t.status === 'completed').length / (tasks?.length || 1) * 100,
      average_time: calculateAverageCompletionTime(tasks || []),
      productivity_by_user: getProductivityByUser(tasks || [])
    },
    users: {
      most_active: getMostActiveUsers(tasks || []),
      department_performance: getDepartmentPerformance(tasks || [], profiles || [])
    },
    trends: {
      tasks_created_last_30_days: getTasksTrend(tasks || []),
      completion_trend: getCompletionTrend(tasks || [])
    }
  };

  return new Response(JSON.stringify({
    success: true,
    analytics,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Helper functions
function calculateAverageCompletionTime(tasks: any[]) {
  const completedTasks = tasks.filter(t => t.completed_at && t.created_at);
  if (completedTasks.length === 0) return 0;
  
  const totalTime = completedTasks.reduce((sum, task) => {
    const created = new Date(task.created_at);
    const completed = new Date(task.completed_at);
    return sum + (completed.getTime() - created.getTime());
  }, 0);
  
  return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60 * 24)); // days
}

function getProductivityByUser(tasks: any[]) {
  const userStats = {};
  tasks.forEach(task => {
    if (!task.assigned_to) return;
    if (!userStats[task.assigned_to]) {
      userStats[task.assigned_to] = { total: 0, completed: 0 };
    }
    userStats[task.assigned_to].total++;
    if (task.status === 'completed') {
      userStats[task.assigned_to].completed++;
    }
  });
  
  return Object.entries(userStats).map(([userId, stats]: [string, any]) => ({
    user_id: userId,
    completion_rate: (stats.completed / stats.total * 100).toFixed(1),
    total_tasks: stats.total,
    completed_tasks: stats.completed
  }));
}

function getMostActiveUsers(tasks: any[]) {
  const userTaskCount = {};
  tasks.forEach(task => {
    if (task.assigned_to) {
      userTaskCount[task.assigned_to] = (userTaskCount[task.assigned_to] || 0) + 1;
    }
  });
  
  return Object.entries(userTaskCount)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([userId, count]) => ({ user_id: userId, task_count: count }));
}

function getDepartmentPerformance(tasks: any[], profiles: any[]) {
  const departmentStats = {};
  
  tasks.forEach(task => {
    const userProfile = profiles.find(p => p.id === task.assigned_to);
    if (!userProfile?.department) return;
    
    if (!departmentStats[userProfile.department]) {
      departmentStats[userProfile.department] = { total: 0, completed: 0 };
    }
    
    departmentStats[userProfile.department].total++;
    if (task.status === 'completed') {
      departmentStats[userProfile.department].completed++;
    }
  });
  
  return Object.entries(departmentStats).map(([dept, stats]: [string, any]) => ({
    department: dept,
    completion_rate: (stats.completed / stats.total * 100).toFixed(1),
    total_tasks: stats.total
  }));
}

function getTasksTrend(tasks: any[]) {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  return tasks.filter(task => 
    new Date(task.created_at) >= last30Days
  ).length;
}

function getCompletionTrend(tasks: any[]) {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentTasks = tasks.filter(task => 
    new Date(task.created_at) >= last30Days
  );
  
  const completed = recentTasks.filter(task => task.status === 'completed').length;
  return recentTasks.length > 0 ? (completed / recentTasks.length * 100).toFixed(1) : 0;
}