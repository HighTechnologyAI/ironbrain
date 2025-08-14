import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Target,
  Calendar,
  Users,
  Paperclip,
  Star
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
  taskId?: string;
  language?: string;
}

interface TaskSuggestion {
  id: string;
  type: 'priority' | 'deadline' | 'assignment' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  action: string;
}

interface AITaskAssistantProps {
  taskId?: string;
  projectId?: string;
}

const AITaskAssistant: React.FC<AITaskAssistantProps> = ({ taskId, projectId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch AI messages for the task
  const { data: aiMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['task-ai-messages', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      
      const { data, error } = await supabase
        .from('task_ai_messages')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!taskId
  });

  // Send message to AI assistant
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, taskId: msgTaskId }: { content: string, taskId?: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-task-assistant', {
        body: {
          message: content,
          taskId: msgTaskId,
          projectId,
          context: {
            previousMessages: messages.slice(-5), // Last 5 messages for context
            suggestions: suggestions
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const botMessage: AIMessage = {
        id: Date.now().toString() + '_bot',
        content: data.response || 'I understand. Let me help you with that.',
        isBot: true,
        timestamp: new Date().toISOString(),
        taskId
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
      
      toast.success('AI assistant responded');
      refetchMessages();
    },
    onError: (error) => {
      console.error('AI assistant error:', error);
      // Fallback response
      const botMessage: AIMessage = {
        id: Date.now().toString() + '_fallback',
        content: 'I\'m having trouble connecting right now, but I can help you with task management, prioritization, and optimization suggestions.',
        isBot: true,
        timestamp: new Date().toISOString(),
        taskId
      };
      setMessages(prev => [...prev, botMessage]);
      toast.error('AI assistant unavailable - using offline mode');
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Initialize with sample suggestions
  useEffect(() => {
    const sampleSuggestions: TaskSuggestion[] = [
      {
        id: '1',
        type: 'priority',
        title: 'Increase Task Priority',
        description: 'This task affects critical system components and should be prioritized',
        confidence: 89,
        impact: 'high',
        action: 'Change priority to High'
      },
      {
        id: '2',
        type: 'deadline',
        title: 'Extend Deadline',
        description: 'Based on current workload, consider extending deadline by 2 days',
        confidence: 72,
        impact: 'medium',
        action: 'Extend deadline to next Friday'
      },
      {
        id: '3',
        type: 'assignment',
        title: 'Add Team Member',
        description: 'Task complexity suggests adding a specialist to the team',
        confidence: 84,
        impact: 'high',
        action: 'Assign specialist from engineering team'
      },
      {
        id: '4',
        type: 'optimization',
        title: 'Break Down Task',
        description: 'This task could be more manageable if broken into 3 subtasks',
        confidence: 76,
        impact: 'medium',
        action: 'Create subtasks for better tracking'
      }
    ];
    
    setSuggestions(sampleSuggestions);
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: message,
      isBot: false,
      timestamp: new Date().toISOString(),
      taskId
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    sendMessageMutation.mutate({ content: message, taskId });
    setMessage('');
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'priority': return <Star className="h-4 w-4" />;
      case 'deadline': return <Calendar className="h-4 w-4" />;
      case 'assignment': return <Users className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Task Assistant
        </h3>
        <p className="text-sm text-muted-foreground">
          Get intelligent suggestions and assistance for task management
        </p>
      </div>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Suggestions
          </CardTitle>
          <CardDescription>
            Smart recommendations to optimize this task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getSuggestionIcon(suggestion.type)}
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getImpactColor(suggestion.impact)} variant="secondary">
                      {suggestion.impact} impact
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.confidence}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Apply Suggestion
                  </Button>
                  <Button variant="ghost" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Chat with AI Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about task management, optimization, or get help
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <ScrollArea className="h-64 w-full border rounded-lg p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Bot className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Start a conversation with the AI assistant</p>
                  <p className="text-xs">Ask about task optimization, deadlines, or team management</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={msg.id}>
                    <div className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        msg.isBot 
                          ? 'bg-muted text-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {msg.isBot ? (
                            <Bot className="h-3 w-3" />
                          ) : (
                            <Users className="h-3 w-3" />
                          )}
                          <span className="text-xs opacity-70">
                            {msg.isBot ? 'AI Assistant' : 'You'} • {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                    {index < messages.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Bot className="h-3 w-3 animate-pulse" />
                        <span className="text-xs">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask the AI assistant about task management, optimization, or any questions..."
              className="flex-1"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                size="sm"
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Paperclip className="h-4 w-4" />
                Attach
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMessage('How can I optimize this task?')}
              className="text-xs"
            >
              Optimize Task
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMessage('What are the dependencies for this task?')}
              className="text-xs"
            >
              Check Dependencies
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMessage('Suggest team members for this task')}
              className="text-xs"
            >
              Team Suggestions
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMessage('Estimate completion time')}
              className="text-xs"
            >
              Time Estimate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Task Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis of task patterns and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500 mb-2">87%</div>
              <div className="text-sm text-muted-foreground">Completion Probability</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500 mb-2">3.2d</div>
              <div className="text-sm text-muted-foreground">Estimated Duration</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-500 mb-2">Medium</div>
              <div className="text-sm text-muted-foreground">Complexity Level</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITaskAssistant;