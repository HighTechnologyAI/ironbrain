import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MapPin, Clock, Plane } from 'lucide-react';

interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  type: 'survey' | 'patrol' | 'delivery' | 'inspection' | 'custom';
  estimatedDuration: string;
  waypoints: number;
}

interface MissionPlannerProps {
  onCreateMission?: (mission: any) => void;
}

const missionTemplates: MissionTemplate[] = [
  {
    id: 'survey_area',
    name: 'Area Survey',
    description: 'Systematic area coverage with grid pattern',
    type: 'survey',
    estimatedDuration: '45 min',
    waypoints: 16
  },
  {
    id: 'perimeter_patrol',
    name: 'Perimeter Patrol',
    description: 'Security patrol along defined boundaries',
    type: 'patrol', 
    estimatedDuration: '30 min',
    waypoints: 8
  },
  {
    id: 'point_inspection',
    name: 'Point Inspection',
    description: 'Detailed inspection of specific locations',
    type: 'inspection',
    estimatedDuration: '20 min',
    waypoints: 4
  }
];

export const MissionPlanner: React.FC<MissionPlannerProps> = ({
  onCreateMission
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [missionName, setMissionName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDrone, setSelectedDrone] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleCreateMission = () => {
    if (!missionName || !selectedTemplate) return;

    const template = missionTemplates.find(t => t.id === selectedTemplate);
    const mission = {
      name: missionName,
      description,
      template: selectedTemplate,
      templateName: template?.name,
      droneId: selectedDrone,
      priority,
      status: 'planning',
      estimatedDuration: template?.estimatedDuration,
      waypoints: template?.waypoints
    };

    onCreateMission?.(mission);
    
    // Reset form
    setMissionName('');
    setDescription('');
    setSelectedTemplate('');
    setSelectedDrone('');
    setPriority('medium');
  };

  const selectedTemplateData = missionTemplates.find(t => t.id === selectedTemplate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Mission Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mission Templates */}
        <div className="space-y-3">
          <Label>Mission Template</Label>
          <div className="grid grid-cols-1 gap-3">
            {missionTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === template.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  <Badge variant="outline">{template.type}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.estimatedDuration}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {template.waypoints} waypoints
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Details */}
        {selectedTemplate && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="mission-name">Mission Name</Label>
              <Input
                id="mission-name"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                placeholder="Enter mission name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional mission details"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assigned Drone</Label>
                <Select value={selectedDrone} onValueChange={setSelectedDrone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select drone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiger_01">Tiger-01 (Available)</SelectItem>
                    <SelectItem value="tiger_02">Tiger-02 (Available)</SelectItem>
                    <SelectItem value="tiger_03">Tiger-03 (Maintenance)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Template Summary */}
            {selectedTemplateData && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Mission Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-muted-foreground" />
                    <span>Type: {selectedTemplateData.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Duration: {selectedTemplateData.estimatedDuration}</span>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleCreateMission} 
              className="w-full"
              disabled={!missionName || !selectedTemplate}
            >
              Create Mission
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MissionPlanner;