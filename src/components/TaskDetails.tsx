import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Tag, X } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import TaskComments from './TaskComments';
import TaskAIAssistant from './TaskAIAssistant';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  estimatedHours: number;
  actualHours?: number;
  dueDate: string;
  createdAt: string;
  tags: string[];
}

interface TaskDetailsProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
}

const TaskDetails = ({ task, isOpen, onClose, onStatusChange }: TaskDetailsProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('details');

  if (!task) return null;

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'on_hold': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'pending': return t.pending;
      case 'in_progress': return t.inProgress;
      case 'completed': return t.completed;
      case 'cancelled': return t.cancelled;
      case 'on_hold': return t.onHold;
      default: return status;
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return t.low;
      case 'medium': return t.medium;
      case 'high': return t.high;
      case 'critical': return t.critical;
      default: return priority;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border-slate-700">
        <DialogHeader className="border-b border-slate-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-white pr-8">
              {task.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t.close}</span>
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300"
            >
              {t.details}
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300"
            >
              {t.comments}
            </TabsTrigger>
            <TabsTrigger 
              value="ai-assistant" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300"
            >
              {t.aiAssistant}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6 space-y-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(task.status)} border`}>
                    {getStatusText(task.status)}
                  </Badge>
                  <Badge className={`${getPriorityColor(task.priority)} border`}>
                    {getPriorityText(task.priority)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{t.assignee}:</span>
                    <span className="font-medium text-white">{task.assignee}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{t.created}:</span>
                    <span className="font-medium text-white">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{t.estimated}:</span>
                    <span className="font-medium text-white">{task.estimatedHours}{t.hours}</span>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-start gap-2 text-gray-300">
                      <Tag className="h-4 w-4 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        <span className="text-sm">{t.tags}:</span>
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-slate-600 text-gray-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">{t.description}</h3>
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <p className="text-white whitespace-pre-wrap">{task.description}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">{t.actions}</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => onStatusChange?.(task.id, 'in_progress')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {t.startWork}
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => onStatusChange?.(task.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {t.complete}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-6 overflow-y-auto max-h-[60vh]">
            <TaskComments taskId={task.id} />
          </TabsContent>

          <TabsContent value="ai-assistant" className="mt-6 overflow-y-auto max-h-[60vh]">
            <TaskAIAssistant task={task} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;

