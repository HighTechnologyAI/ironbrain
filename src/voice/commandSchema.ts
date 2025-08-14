import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Command schemas
export const CommandSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('openPage'),
    args: z.object({
      route: z.string()
    })
  }),
  z.object({
    type: z.literal('search'),
    args: z.object({
      query: z.string()
    })
  }),
  z.object({
    type: z.literal('createTask'),
    args: z.object({
      title: z.string(),
      description: z.string(),
      assignees: z.array(z.string()).optional()
    })
  }),
  z.object({
    type: z.literal('updateTaskStatus'),
    args: z.object({
      taskId: z.string(),
      status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'])
    })
  }),
  z.object({
    type: z.literal('assignUser'),
    args: z.object({
      taskId: z.string(),
      userId: z.string()
    })
  }),
  z.object({
    type: z.literal('summarizeTask'),
    args: z.object({
      taskId: z.string()
    })
  }),
  z.object({
    type: z.literal('translate'),
    args: z.object({
      text: z.string(),
      targetLang: z.enum(['ru', 'bg', 'en', 'uk'])
    })
  }),
  z.object({
    type: z.literal('payByBank'),
    args: z.object({
      iban: z.string(),
      amount: z.number(),
      comment: z.string().optional()
    })
  })
]);

export type Command = z.infer<typeof CommandSchema>;

interface CommandResult {
  ok: boolean;
  message: string;
  data?: any;
}

// Command dispatcher
export class CommandDispatcher {
  private static instance: CommandDispatcher;

  static getInstance(): CommandDispatcher {
    if (!CommandDispatcher.instance) {
      CommandDispatcher.instance = new CommandDispatcher();
    }
    return CommandDispatcher.instance;
  }

  async execute(command: Command): Promise<CommandResult> {
    try {
      const validCommand = CommandSchema.parse(command);
      
      switch (validCommand.type) {
        case 'openPage':
          return this.openPage(validCommand.args.route);
        
        case 'search':
          return this.search(validCommand.args.query);
        
        case 'createTask':
          return this.createTask(validCommand.args.title, validCommand.args.description, validCommand.args.assignees);
        
        case 'updateTaskStatus':
          return this.updateTaskStatus(validCommand.args.taskId, validCommand.args.status);
        
        case 'assignUser':
          return this.assignUser(validCommand.args.taskId, validCommand.args.userId);
        
        case 'summarizeTask':
          return this.summarizeTask(validCommand.args.taskId);
        
        case 'translate':
          return this.translate(validCommand.args.text, validCommand.args.targetLang);
        
        case 'payByBank':
          return this.payByBank(validCommand.args.iban, validCommand.args.amount, validCommand.args.comment);
        
        default:
          return { ok: false, message: 'Unknown command type' };
      }
    } catch (error) {
      console.error('Command execution error:', error);
      return { ok: false, message: error instanceof Error ? error.message : 'Command failed' };
    }
  }

  private openPage(route: string): CommandResult {
    try {
      // Use history API to navigate
      window.history.pushState({}, '', route);
      window.dispatchEvent(new PopStateEvent('popstate'));
      return { ok: true, message: `Navigated to ${route}` };
    } catch (error) {
      return { ok: false, message: 'Failed to navigate' };
    }
  }

  private search(query: string): CommandResult {
    try {
      // For now, just set focus on search input if it exists
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i], input[placeholder*="поиск" i]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.value = query;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return { ok: true, message: `Searching for: ${query}` };
    } catch (error) {
      return { ok: false, message: 'Search failed' };
    }
  }

  private async createTask(title: string, description: string, assignees?: string[]): Promise<CommandResult> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { ok: false, message: 'User not authenticated' };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!profile) {
        return { ok: false, message: 'User profile not found' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          description,
          created_by: profile.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Task Created",
        description: `Successfully created task: ${title}`,
      });

      return { ok: true, message: `Task created: ${title}`, data };
    } catch (error) {
      return { ok: false, message: 'Failed to create task' };
    }
  }

  private async updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'): Promise<CommandResult> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      toast({
        title: "Task Updated",
        description: `Task status changed to ${status}`,
      });

      return { ok: true, message: `Task status updated to ${status}` };
    } catch (error) {
      return { ok: false, message: 'Failed to update task status' };
    }
  }

  private async assignUser(taskId: string, userId: string): Promise<CommandResult> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: userId })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      return { ok: true, message: 'User assigned to task' };
    } catch (error) {
      return { ok: false, message: 'Failed to assign user' };
    }
  }

  private async summarizeTask(taskId: string): Promise<CommandResult> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('title, description, status, created_at')
        .eq('id', taskId)
        .single();

      if (error) {
        throw error;
      }

      const summary = `Task: ${data.title}\nStatus: ${data.status}\nDescription: ${data.description}\nCreated: ${new Date(data.created_at).toLocaleDateString()}`;
      
      return { ok: true, message: summary, data };
    } catch (error) {
      return { ok: false, message: 'Failed to get task summary' };
    }
  }

  private async translate(text: string, targetLang: 'ru' | 'bg' | 'en' | 'uk'): Promise<CommandResult> {
    try {
      // Call the existing translate edge function
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { 
          text, 
          targetLanguage: targetLang 
        }
      });

      if (error) {
        throw error;
      }

      return { ok: true, message: `Translation: ${data.translatedText}`, data };
    } catch (error) {
      return { ok: false, message: 'Translation failed' };
    }
  }

  private payByBank(iban: string, amount: number, comment?: string): CommandResult {
    try {
      // Demo workflow - show steps
      const steps = [
        "1. Открыть интернет-банкинг",
        "2. Выбрать 'Новый платеж'",
        "3. Ввести IBAN получателя",
        "4. Указать сумму",
        "5. Подтвердить платеж"
      ];

      toast({
        title: "Payment Steps",
        description: steps.join('\n'),
      });

      // Offer to create task
      setTimeout(() => {
        const shouldCreateTask = confirm("Создать задачу 'Интернет-банкинг — оплата'?");
        if (shouldCreateTask) {
          this.createTask(
            "Интернет-банкинг — оплата",
            `Оплата ${amount} на IBAN ${iban.slice(-4)}\n\n${steps.join('\n')}`
          );
        }
      }, 2000);

      return { ok: true, message: `Payment steps for ${amount} to ${iban}` };
    } catch (error) {
      return { ok: false, message: 'Payment workflow failed' };
    }
  }
}