import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Trash2, Loader2 } from 'lucide-react';
import { MissionService, type MissionWaypoint } from '@/services/missionService';
import { useToast } from '@/hooks/use-toast';

interface WaypointEditorProps {
  missionId: string;
  onWaypointsChange?: (waypoints: MissionWaypoint[]) => void;
}

export const WaypointEditor: React.FC<WaypointEditorProps> = ({
  missionId,
  onWaypointsChange
}) => {
  const [waypoints, setWaypoints] = useState<MissionWaypoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [newWaypoint, setNewWaypoint] = useState({
    lat: 42.3601, // Sofia coordinates as default
    lon: 23.7911,
    alt_meters: 100,
    action: 'waypoint' as const,
    hold_time_seconds: 0
  });

  // Load existing waypoints
  useEffect(() => {
    if (missionId) {
      loadWaypoints();
    }
  }, [missionId]);

  const loadWaypoints = async () => {
    if (!missionId) return;
    
    setLoading(true);
    try {
      const { data, error } = await MissionService.getMissionWaypoints(missionId);
      if (error) {
        toast({
          title: "Error loading waypoints",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        setWaypoints(data);
        onWaypointsChange?.(data);
      }
    } catch (error) {
      console.error('Error loading waypoints:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWaypoint = async () => {
    if (!missionId || !newWaypoint.lat || !newWaypoint.lon || !newWaypoint.alt_meters) {
      toast({
        title: "Invalid waypoint",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const waypointData = {
        mission_id: missionId,
        sequence_number: waypoints.length + 1,
        lat: newWaypoint.lat,
        lon: newWaypoint.lon,
        alt_meters: newWaypoint.alt_meters,
        action: newWaypoint.action,
        hold_time_seconds: newWaypoint.hold_time_seconds
      };

      const { data, error } = await MissionService.createWaypoint(waypointData);
      
      if (error) {
        toast({
          title: "Error adding waypoint",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        const updatedWaypoints = [...waypoints, data].sort((a, b) => a.sequence_number - b.sequence_number);
        setWaypoints(updatedWaypoints);
        onWaypointsChange?.(updatedWaypoints);
        
        // Reset form
        setNewWaypoint({
          lat: 42.3601,
          lon: 23.7911,
          alt_meters: 100,
          action: 'waypoint',
          hold_time_seconds: 0
        });
        
        toast({
          title: "Waypoint added",
          description: "Waypoint added successfully"
        });
      }
    } catch (error) {
      console.error('Error adding waypoint:', error);
    } finally {
      setSaving(false);
    }
  };

  const removeWaypoint = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await MissionService.deleteWaypoint(id);
      
      if (error) {
        toast({
          title: "Error removing waypoint",
          description: error.message,
          variant: "destructive"
        });
      } else {
        const updatedWaypoints = waypoints.filter(wp => wp.id !== id);
        setWaypoints(updatedWaypoints);
        onWaypointsChange?.(updatedWaypoints);
        
        toast({
          title: "Waypoint removed",
          description: "Waypoint removed successfully"
        });
      }
    } catch (error) {
      console.error('Error removing waypoint:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Waypoint Editor
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Waypoint Form */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 border rounded-lg">
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="any"
              value={newWaypoint.lat}
              onChange={(e) => setNewWaypoint({ ...newWaypoint, lat: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="lon">Longitude</Label>
            <Input
              id="lon"
              type="number"
              step="any"
              value={newWaypoint.lon}
              onChange={(e) => setNewWaypoint({ ...newWaypoint, lon: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="alt">Altitude (m)</Label>
            <Input
              id="alt"
              type="number"
              value={newWaypoint.alt_meters}
              onChange={(e) => setNewWaypoint({ ...newWaypoint, alt_meters: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label>Action</Label>
            <Select value={newWaypoint.action} onValueChange={(value) => setNewWaypoint({ ...newWaypoint, action: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="takeoff">Takeoff</SelectItem>
                <SelectItem value="waypoint">Waypoint</SelectItem>
                <SelectItem value="hover">Hover</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="hold">Hold (sec)</Label>
            <Input
              id="hold"
              type="number"
              value={newWaypoint.hold_time_seconds}
              onChange={(e) => setNewWaypoint({ ...newWaypoint, hold_time_seconds: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={addWaypoint} 
              className="w-full"
              disabled={saving || !missionId}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add
            </Button>
          </div>
        </div>

        {/* Waypoints List */}
        <div className="space-y-2">
          {waypoints.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No waypoints added yet
            </div>
          ) : (
            waypoints.map((waypoint) => (
              <div key={waypoint.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">#{waypoint.sequence_number}</Badge>
                  <span className="text-sm font-mono">
                    {waypoint.lat.toFixed(6)}, {waypoint.lon.toFixed(6)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Alt: {waypoint.alt_meters}m
                  </span>
                  <Badge>{waypoint.action}</Badge>
                  {waypoint.hold_time_seconds > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Hold: {waypoint.hold_time_seconds}s
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeWaypoint(waypoint.id)}
                  disabled={saving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Mission Info */}
        {missionId && waypoints.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Mission Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Total Waypoints: {waypoints.length}</div>
              <div>Mission ID: {missionId.slice(0, 8)}...</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WaypointEditor;