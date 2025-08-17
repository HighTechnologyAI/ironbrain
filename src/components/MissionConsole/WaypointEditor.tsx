import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Trash2, Save } from 'lucide-react';

interface Waypoint {
  id: string;
  sequence: number;
  lat: number;
  lng: number;
  alt: number;
  action: 'takeoff' | 'waypoint' | 'land' | 'hover';
}

interface WaypointEditorProps {
  missionId?: string;
  waypoints?: Waypoint[];
  onSave?: (waypoints: Waypoint[]) => void;
}

export const WaypointEditor: React.FC<WaypointEditorProps> = ({
  missionId,
  waypoints = [],
  onSave
}) => {
  const [currentWaypoints, setCurrentWaypoints] = useState<Waypoint[]>(waypoints);
  const [newWaypoint, setNewWaypoint] = useState<Partial<Waypoint>>({
    lat: 0,
    lng: 0,
    alt: 100,
    action: 'waypoint'
  });

  const addWaypoint = () => {
    if (newWaypoint.lat && newWaypoint.lng && newWaypoint.alt) {
      const waypoint: Waypoint = {
        id: `wp_${Date.now()}`,
        sequence: currentWaypoints.length + 1,
        lat: newWaypoint.lat,
        lng: newWaypoint.lng,
        alt: newWaypoint.alt,
        action: newWaypoint.action || 'waypoint'
      };
      setCurrentWaypoints([...currentWaypoints, waypoint]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Waypoint Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
          <Input
            type="number"
            placeholder="Latitude"
            value={newWaypoint.lat || ''}
            onChange={(e) => setNewWaypoint({ ...newWaypoint, lat: parseFloat(e.target.value) })}
          />
          <Input
            type="number"
            placeholder="Longitude" 
            value={newWaypoint.lng || ''}
            onChange={(e) => setNewWaypoint({ ...newWaypoint, lng: parseFloat(e.target.value) })}
          />
          <Input
            type="number"
            placeholder="Altitude"
            value={newWaypoint.alt || ''}
            onChange={(e) => setNewWaypoint({ ...newWaypoint, alt: parseInt(e.target.value) })}
          />
          <Button onClick={addWaypoint}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        
        <div className="space-y-2">
          {currentWaypoints.map((waypoint) => (
            <div key={waypoint.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-4">
                <Badge>#{waypoint.sequence}</Badge>
                <span>{waypoint.lat.toFixed(6)}, {waypoint.lng.toFixed(6)}</span>
                <span>Alt: {waypoint.alt}m</span>
              </div>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {currentWaypoints.length > 0 && (
          <Button onClick={() => onSave?.(currentWaypoints)} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Waypoints
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WaypointEditor;