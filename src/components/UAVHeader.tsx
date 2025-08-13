import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusChip } from '@/components/ui/status-chip';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import { useUserPresence } from '@/hooks/use-user-presence';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const commands = [
    { 
      id: 'create-task', 
      label: 'Создать задачу', 
      action: () => navigate('/tasks?create=true'),
      shortcut: 'T'
    },
    { 
      id: 'create-mission', 
      label: 'Запустить миссию', 
      action: () => navigate('/missions?create=true'),
      shortcut: 'M'
    },
    { 
      id: 'summarize-chat', 
      label: '/summarize чат', 
      action: () => console.log('Summarize chat'),
      ai: true
    },
    { 
      id: 'make-subtasks', 
      label: '/make subtasks', 
      action: () => console.log('Make subtasks'),
      ai: true
    },
    { 
      id: 'translate-bg', 
      label: '/translate to BG', 
      action: () => console.log('Translate to Bulgarian'),
      ai: true
    }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-surface-1 border-border">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-ui">
            <Command className="h-5 w-5 text-primary" />
            Командная палитра
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Быстрые действия и AI команды
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4">
          <Input
            placeholder="Поиск команд или введите AI команду..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-4 font-mono"
            autoFocus
          />
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors text-left"
                onClick={() => {
                  cmd.action();
                  onOpenChange(false);
                  setQuery('');
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-ui">{cmd.label}</span>
                  {cmd.ai && (
                    <Badge variant="info" className="text-xs">AI</Badge>
                  )}
                </div>
                {cmd.shortcut && (
                  <kbd className="px-2 py-1 text-xs bg-surface-3 rounded font-mono">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const UAVHeader = ({ title, subtitle }: HeaderProps) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { userCount } = useUserPresence();
  const navigate = useNavigate();

  // Keyboard shortcut handler
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen(true);
    }
  };

  useState(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <>
      <div className="bg-surface-1 border-b border-border sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title & Status */}
            <div className="flex items-center gap-6">
              <div>
                {title && (
                  <h1 className="text-xl font-bold font-ui tracking-tight">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground font-ui">{subtitle}</p>
                )}
              </div>
              
              {/* System Status */}
              <div className="flex items-center gap-4 text-sm">
                <StatusChip variant="ready">СИСТЕМА ГОТОВА</StatusChip>
                <div className="text-muted-foreground font-mono">
                  Нагрузка: <span className="text-primary">24%</span>
                </div>
                <div className="text-muted-foreground font-mono">
                  Онлайн: <span className="text-primary">{userCount}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Command Palette */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 hover:bg-primary/10"
              >
                <Command className="h-4 w-4" />
                <span className="text-xs text-muted-foreground">⌘K</span>
              </Button>

              {/* Quick Create */}
              <Button 
                variant="mission" 
                size="sm"
                onClick={() => navigate('/tasks?create=true')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Создать
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen}
      />
    </>
  );
};