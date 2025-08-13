import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || 'tiger-webhook-2025';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Verify webhook secret
    const webhookSecret = req.headers.get('x-webhook-secret');
    if (webhookSecret !== WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: 'Invalid webhook secret' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    const { event, data } = payload;

    console.log('Webhook received:', { event, timestamp: new Date().toISOString() });

    let result;

    switch (event) {
      case 'task.created':
        result = await handleTaskCreated(supabaseAdmin, data);
        break;
      
      case 'task.updated':
        result = await handleTaskUpdated(supabaseAdmin, data);
        break;
      
      case 'task.completed':
        result = await handleTaskCompleted(supabaseAdmin, data);
        break;
      
      case 'user.created':
        result = await handleUserCreated(supabaseAdmin, data);
        break;
      
      case 'ai.command':
        result = await handleAICommand(supabaseAdmin, data);
        break;
      
      case 'system.backup':
        result = await handleSystemBackup(supabaseAdmin, data);
        break;
      
      case 'analytics.request':
        result = await handleAnalyticsRequest(supabaseAdmin, data);
        break;
      
      default:
        throw new Error(`Unknown webhook event: ${event}`);
    }

    // Log webhook event
    await logWebhookEvent(supabaseAdmin, {
      event,
      data,
      result,
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    });

    return new Response(JSON.stringify({
      success: true,
      event,
      result,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleTaskCreated(supabase: any, data: any) {
  const { task } = data;
  
  // Send notifications
  if (task.assigned_to) {
    await sendNotification(supabase, task.assigned_to, {
      type: 'task_assigned',
      title: 'Новая задача назначена',
      message: `Вам назначена задача: ${task.title}`,
      task_id: task.id
    });
  }

  return { notification_sent: true, task_id: task.id };
}

async function handleTaskUpdated(supabase: any, data: any) {
  const { task, changes } = data;
  
  // Track task history
  await supabase.from('task_history').insert({
    task_id: task.id,
    field_name: 'status',
    old_value: changes.old_status,
    new_value: changes.new_status,
    changed_by: changes.changed_by,
    change_reason: 'Webhook update'
  });

  return { history_tracked: true, task_id: task.id };
}

async function handleTaskCompleted(supabase: any, data: any) {
  const { task } = data;
  
  // Calculate performance metrics
  const created = new Date(task.created_at);
  const completed = new Date(task.completed_at);
  const durationDays = Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  
  // Award achievement points
  let points = 10;
  if (durationDays <= 1) points = 25; // Fast completion
  if (task.priority === 'critical') points *= 2;
  
  await supabase.from('achievements').insert({
    title: 'Задача выполнена',
    description: `Выполнена задача: ${task.title}`,
    type: 'individual',
    points,
    employee_id: task.assigned_to,
    task_id: task.id,
    achievement_date: new Date().toISOString().split('T')[0]
  });

  return { 
    achievement_awarded: true, 
    points, 
    duration_days: durationDays,
    task_id: task.id 
  };
}

async function handleUserCreated(supabase: any, data: any) {
  const { user } = data;
  
  // Send welcome notification
  await sendNotification(supabase, user.id, {
    type: 'welcome',
    title: 'Добро пожаловать в Tiger CRM!',
    message: 'Ваш аккаунт успешно создан. Начните с изучения задач.',
    user_id: user.id
  });

  return { welcome_sent: true, user_id: user.id };
}

async function handleAICommand(supabase: any, data: any) {
  const { command, parameters, requester } = data;
  
  switch (command) {
    case 'create_task':
      const { data: newTask } = await supabase.from('tasks').insert({
        title: parameters.title,
        description: parameters.description,
        priority: parameters.priority || 'medium',
        assigned_to: parameters.assigned_to,
        created_by: requester,
        status: 'pending'
      }).select().single();
      
      return { task_created: true, task: newTask };
    
    case 'get_stats':
      const { data: tasks } = await supabase.from('tasks').select('*');
      const { data: users } = await supabase.from('profiles').select('*');
      
      return {
        stats: {
          total_tasks: tasks?.length || 0,
          total_users: users?.length || 0,
          completed_tasks: tasks?.filter((t: any) => t.status === 'completed').length || 0
        }
      };
    
    case 'bulk_update':
      if (parameters.table && parameters.updates) {
        const { data } = await supabase
          .from(parameters.table)
          .update(parameters.updates)
          .eq('id', parameters.id);
        
        return { bulk_updated: true, affected_rows: data?.length || 0 };
      }
      break;
    
    default:
      throw new Error(`Unknown AI command: ${command}`);
  }
}

async function handleSystemBackup(supabase: any, data: any) {
  const tables = ['profiles', 'tasks', 'achievements', 'companies'];
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    data: {}
  };

  for (const table of tables) {
    const { data } = await supabase.from(table).select('*');
    backup.data[table] = data || [];
  }

  // In a real scenario, you'd upload this to cloud storage
  console.log('Backup created:', { tables: tables.length, timestamp: backup.timestamp });

  return { backup_created: true, tables_backed_up: tables.length, size_kb: JSON.stringify(backup).length / 1024 };
}

async function handleAnalyticsRequest(supabase: any, data: any) {
  const { metric, period } = data;
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (period || 30));

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  const analytics = {
    period: `${period || 30} days`,
    total_tasks: tasks?.length || 0,
    completed_tasks: tasks?.filter((t: any) => t.status === 'completed').length || 0,
    completion_rate: tasks?.length ? (tasks.filter((t: any) => t.status === 'completed').length / tasks.length * 100).toFixed(1) : 0,
    by_priority: {},
    by_status: {}
  };

  tasks?.forEach((task: any) => {
    analytics.by_priority[task.priority] = (analytics.by_priority[task.priority] || 0) + 1;
    analytics.by_status[task.status] = (analytics.by_status[task.status] || 0) + 1;
  });

  return { analytics_generated: true, analytics };
}

async function sendNotification(supabase: any, userId: string, notification: any) {
  // In a real app, you'd integrate with push notification service
  console.log('Notification sent:', { userId, notification });
  return true;
}

async function logWebhookEvent(supabase: any, event: any) {
  // Log webhook events for debugging and monitoring
  try {
    await supabase.from('webhook_logs').insert({
      event_type: event.event,
      payload: event.data,
      result: event.result,
      timestamp: event.timestamp,
      ip_address: event.ip
    });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}