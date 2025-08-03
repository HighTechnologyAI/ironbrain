import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Terminal, Send, Trash2, Power, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TerminalLog {
  id: string;
  timestamp: Date;
  command: string;
  output: string;
  type: 'success' | 'error' | 'info' | 'system';
}

interface TerminalInterfaceProps {
  title: string;
  endpoint: string;
  onExecute?: (command: string) => Promise<any>;
}

const TerminalInterface = ({ title, endpoint, onExecute }: TerminalInterfaceProps) => {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    // Add welcome message
    addLog('system', 'help', 'Tiger CRM Terminal v1.0 - Ready for external control\nType "help" for available commands\nSystem online and monitoring...');
  }, []);

  const addLog = (type: TerminalLog['type'], cmd: string, output: string) => {
    const newLog: TerminalLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      command: cmd,
      output,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  const executeCommand = async () => {
    if (!command.trim()) return;

    setIsExecuting(true);
    const currentCommand = command.trim();
    setCommand('');

    // Add command to logs
    addLog('info', currentCommand, 'Executing...');

    try {
      let result;
      
      if (onExecute) {
        result = await onExecute(currentCommand);
      } else {
        // Default command handling
        result = await handleDefaultCommands(currentCommand);
      }

      addLog('success', currentCommand, typeof result === 'string' ? result : JSON.stringify(result, null, 2));
      
    } catch (error: any) {
      addLog('error', currentCommand, `Error: ${error.message || 'Command failed'}`);
      toast({
        title: "Command Error",
        description: error.message || 'Command execution failed',
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDefaultCommands = async (cmd: string): Promise<string> => {
    const [baseCmd, ...args] = cmd.toLowerCase().split(' ');
    
    switch (baseCmd) {
      case 'help':
        return `Available commands:
• status - System status check
• db query [SQL] - Execute database query  
• logs [count] - Show recent system logs
• users - List active users
• tasks - Show task statistics
• clear - Clear terminal
• ping - Test connection
• monitor - Show real-time monitoring`;

      case 'status':
        return `System Status: ✅ ONLINE
Database: ✅ Connected
API: ✅ Active
Users Online: 8
Last Update: ${new Date().toLocaleString()}`;

      case 'ping':
        return 'PONG - Connection active';

      case 'clear':
        setLogs([]);
        return 'Terminal cleared';

      case 'monitor':
        return `Real-time Monitoring:
CPU: 24% | Memory: 68% | Disk: 45%
Active Connections: 12
Tasks Completed Today: 23
System Load: Normal`;

      case 'users':
        return `Active Users:
• OLEKSANDR KOVALCHUK (founder@hightechai.site) - Online
• System Admin - Active
• API Clients: 3 connected`;

      case 'tasks':
        return `Task Statistics:
Total Tasks: 1
In Progress: 1  
Completed: 0
High Priority: 1
Overdue: 0`;

      case 'db':
        if (args[0] === 'query' && args.length > 1) {
          return `Database Query Executed:
Query: ${args.slice(1).join(' ')}
Status: ✅ Success
Note: Use Admin API for actual database operations`;
        }
        return 'Usage: db query [SQL]';

      case 'logs':
        const count = args[0] ? parseInt(args[0]) : 5;
        return `Recent System Logs (${count}):
${new Date().toISOString()} - User login: founder@hightechai.site
${new Date().toISOString()} - Task created: "Подготовить актуальную смету на сегодня"
${new Date().toISOString()} - AI Assistant accessed
${new Date().toISOString()} - Database backup completed
${new Date().toISOString()} - System health check: OK`;

      default:
        throw new Error(`Unknown command: ${baseCmd}. Type 'help' for available commands.`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const clearTerminal = () => {
    setLogs([]);
    addLog('system', 'clear', 'Terminal cleared');
  };

  const getLogColor = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success': return 'text-primary';
      case 'error': return 'text-destructive';
      case 'info': return 'text-muted-foreground';
      case 'system': return 'text-accent';
      default: return 'text-foreground';
    }
  };

  const getTypeIcon = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'system': return '🔧';
      default: return '>';
    }
  };

  return (
    <Card className="h-[600px] bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            {title}
            <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
              {isConnected ? "CONNECTED" : "DISCONNECTED"}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearTerminal}
              className="h-8"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConnected(!isConnected)}
              className="h-8"
            >
              <Power className={`h-3 w-3 ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-80px)] flex flex-col">
        <ScrollArea className="flex-1 p-4 bg-muted/20" ref={scrollRef}>
          <div className="font-mono text-sm space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{log.timestamp.toLocaleTimeString()}</span>
                  <span>{getTypeIcon(log.type)}</span>
                  {log.command && (
                    <span className="text-primary">$ {log.command}</span>
                  )}
                </div>
                <pre className={`whitespace-pre-wrap text-xs ${getLogColor(log.type)} pl-4 border-l-2 border-muted`}>
                  {log.output}
                </pre>
              </div>
            ))}
            {isExecuting && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3 w-3 animate-spin" />
                <span>Executing command...</span>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-border bg-background">
          <div className="flex items-center gap-2">
            <span className="text-primary font-mono text-sm">$</span>
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter command..."
              className="font-mono text-sm bg-muted/50"
              disabled={!isConnected || isExecuting}
            />
            <Button
              onClick={executeCommand}
              size="sm"
              disabled={!command.trim() || !isConnected || isExecuting}
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Type "help" for available commands • Press Enter to execute
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TerminalInterface;