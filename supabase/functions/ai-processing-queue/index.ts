import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AITask {
  id: string;
  type: 'analyze' | 'predict' | 'optimize' | 'generate';
  input: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startTime?: string;
  endTime?: string;
  processingTime?: number;
}

class AIProcessingQueue {
  private queue: AITask[] = [];
  private processing: Map<string, AITask> = new Map();
  private maxConcurrent = 3;

  addTask(task: Omit<AITask, 'id' | 'status'>): string {
    const id = crypto.randomUUID();
    const newTask: AITask = {
      ...task,
      id,
      status: 'queued'
    };
    
    // Insert based on priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const insertIndex = this.queue.findIndex(t => 
      priorityOrder[t.priority] > priorityOrder[newTask.priority]
    );
    
    if (insertIndex === -1) {
      this.queue.push(newTask);
    } else {
      this.queue.splice(insertIndex, 0, newTask);
    }
    
    this.processNext();
    return id;
  }

  getStatus(id: string): AITask | null {
    return this.processing.get(id) || this.queue.find(t => t.id === id) || null;
  }

  private async processNext() {
    if (this.processing.size >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift()!;
    task.status = 'processing';
    task.startTime = new Date().toISOString();
    this.processing.set(task.id, task);

    try {
      const result = await this.executeTask(task);
      task.result = result;
      task.status = 'completed';
    } catch (error) {
      task.error = error.message;
      task.status = 'failed';
    } finally {
      task.endTime = new Date().toISOString();
      if (task.startTime) {
        task.processingTime = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();
      }
      
      setTimeout(() => {
        this.processing.delete(task.id);
      }, 30000); // Keep completed tasks for 30 seconds
      
      this.processNext();
    }
  }

  private async executeTask(task: AITask): Promise<any> {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    let model = 'gpt-4.1-2025-04-14';

    switch (task.type) {
      case 'analyze':
        prompt = `Analyze the following UAV operational data and provide insights:
        ${JSON.stringify(task.input)}
        
        Focus on:
        - Performance patterns
        - Anomaly detection
        - Efficiency opportunities
        - Safety considerations
        
        Provide a structured analysis with actionable recommendations.`;
        break;
        
      case 'predict':
        prompt = `Based on the operational data provided, predict potential issues and maintenance needs:
        ${JSON.stringify(task.input)}
        
        Provide predictions for:
        - Maintenance requirements
        - Performance degradation
        - Failure probability
        - Optimization opportunities
        
        Include confidence levels and timeframes.`;
        break;
        
      case 'optimize':
        prompt = `Optimize the following operational parameters:
        ${JSON.stringify(task.input)}
        
        Suggest improvements for:
        - Flight efficiency
        - Resource utilization
        - Cost reduction
        - Performance enhancement
        
        Provide specific optimization recommendations.`;
        break;
        
      case 'generate':
        prompt = `Generate operational insights and recommendations based on:
        ${JSON.stringify(task.input)}
        
        Create a comprehensive report including:
        - Current status summary
        - Key performance indicators
        - Risk assessment
        - Strategic recommendations`;
        break;
        
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }

    console.log(`Processing AI task ${task.id} of type ${task.type}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert UAV operations analyst. Provide detailed, actionable insights based on operational data. Always include specific metrics, confidence levels, and timeframes where relevant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content;

    if (!result) {
      throw new Error('No response from AI');
    }

    return {
      analysis: result,
      metadata: {
        model: model,
        tokensUsed: data.usage?.total_tokens || 0,
        processingTime: task.processingTime
      }
    };
  }

  getQueueStatus() {
    return {
      queued: this.queue.length,
      processing: this.processing.size,
      completed: Array.from(this.processing.values()).filter(t => t.status === 'completed').length,
      failed: Array.from(this.processing.values()).filter(t => t.status === 'failed').length
    };
  }
}

const processingQueue = new AIProcessingQueue();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'process';

    if (action === 'status') {
      const taskId = url.searchParams.get('taskId');
      if (taskId) {
        const task = processingQueue.getStatus(taskId);
        return new Response(JSON.stringify({
          success: true,
          task: task
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        const status = processingQueue.getQueueStatus();
        return new Response(JSON.stringify({
          success: true,
          queueStatus: status
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'process') {
      const { type, input, priority = 'medium' } = await req.json();
      
      if (!type || !input) {
        throw new Error('Missing required parameters: type and input');
      }

      const taskId = processingQueue.addTask({
        type,
        input,
        priority
      });

      return new Response(JSON.stringify({
        success: true,
        taskId: taskId,
        message: 'Task queued for processing'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error('AI Processing Queue Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to process request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});