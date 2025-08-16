"""
Mission Planning Service for Pro Mega Spot Technology AI GCS
Optimized for Jetson Nano with minimal memory footprint

Features:
- Waypoint management
- Mission upload/download
- Flight path optimization
- Drop zone planning
- Emergency procedures
"""

import time
import json
import logging
import threading
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import math

logger = logging.getLogger(__name__)

class WaypointAction(Enum):
    """Waypoint action types"""
    WAYPOINT = "WAYPOINT"
    TAKEOFF = "TAKEOFF"
    LAND = "LAND"
    RTL = "RTL"
    LOITER = "LOITER"
    DROP = "DROP"
    PHOTO = "PHOTO"
    VIDEO_START = "VIDEO_START"
    VIDEO_STOP = "VIDEO_STOP"
    CHANGE_SPEED = "CHANGE_SPEED"
    CHANGE_ALT = "CHANGE_ALT"

@dataclass
class Waypoint:
    """Mission waypoint"""
    id: int
    lat: float
    lon: float
    alt: float
    action: str = WaypointAction.WAYPOINT.value
    params: Dict[str, Any] = None
    speed: float = 10.0  # m/s
    wait_time: float = 0.0  # seconds
    radius: float = 5.0  # acceptance radius in meters
    
    def __post_init__(self):
        if self.params is None:
            self.params = {}
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Waypoint':
        return cls(**data)

@dataclass
class DropZone:
    """Drop zone definition"""
    id: int
    name: str
    lat: float
    lon: float
    alt: float
    radius: float = 10.0  # meters
    drop_type: str = "PAYLOAD"  # PAYLOAD, EMERGENCY, SUPPLY
    wind_compensation: bool = True
    approach_heading: float = 0.0  # degrees
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class MissionStats:
    """Mission statistics"""
    total_distance: float = 0.0  # meters
    estimated_time: float = 0.0  # seconds
    waypoint_count: int = 0
    drop_count: int = 0
    max_altitude: float = 0.0
    min_altitude: float = 0.0
    battery_required: float = 0.0  # percentage

class MissionService:
    """
    Mission planning and management service
    Optimized for memory efficiency on Jetson Nano
    """
    
    def __init__(self):
        self.waypoints: List[Waypoint] = []
        self.drop_zones: List[DropZone] = []
        self.current_mission_id = None
        self.mission_stats = MissionStats()
        
        # Mission state
        self.is_mission_active = False
        self.current_waypoint_index = 0
        self.mission_start_time = 0.0
        
        # Settings
        self.settings = {
            'default_altitude': 50.0,  # meters
            'default_speed': 10.0,     # m/s
            'safety_altitude': 30.0,   # minimum altitude
            'max_waypoints': 100,      # memory limit
            'auto_rtl': True,          # auto return to launch
            'battery_failsafe': 20.0,  # percentage
            'wind_compensation': True
        }
        
        # Home position
        self.home_position = {
            'lat': 0.0,
            'lon': 0.0,
            'alt': 0.0,
            'set': False
        }
        
        # Mission templates
        self.mission_templates = {
            'survey': self._create_survey_mission,
            'delivery': self._create_delivery_mission,
            'patrol': self._create_patrol_mission,
            'emergency': self._create_emergency_mission
        }
        
        self._lock = threading.Lock()
    
    def set_home_position(self, lat: float, lon: float, alt: float = 0.0) -> bool:
        """Set home position"""
        try:
            with self._lock:
                self.home_position = {
                    'lat': lat,
                    'lon': lon,
                    'alt': alt,
                    'set': True
                }
            
            logger.info(f"🏠 Home position set: {lat:.6f}, {lon:.6f}, {alt:.1f}m")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to set home position: {e}")
            return False
    
    def add_waypoint(self, lat: float, lon: float, alt: float = None, 
                    action: str = WaypointAction.WAYPOINT.value, 
                    **kwargs) -> Optional[Waypoint]:
        """Add waypoint to mission"""
        try:
            with self._lock:
                if len(self.waypoints) >= self.settings['max_waypoints']:
                    logger.warning(f"⚠️ Maximum waypoints reached: {self.settings['max_waypoints']}")
                    return None
                
                # Use default altitude if not specified
                if alt is None:
                    alt = self.settings['default_altitude']
                
                # Ensure minimum safety altitude
                alt = max(alt, self.settings['safety_altitude'])
                
                # Create waypoint
                waypoint_id = len(self.waypoints) + 1
                waypoint = Waypoint(
                    id=waypoint_id,
                    lat=lat,
                    lon=lon,
                    alt=alt,
                    action=action,
                    speed=kwargs.get('speed', self.settings['default_speed']),
                    wait_time=kwargs.get('wait_time', 0.0),
                    radius=kwargs.get('radius', 5.0),
                    params=kwargs.get('params', {})
                )
                
                self.waypoints.append(waypoint)
                self._update_mission_stats()
                
                logger.info(f"📍 Waypoint added: {waypoint_id} at {lat:.6f}, {lon:.6f}, {alt:.1f}m")
                return waypoint
                
        except Exception as e:
            logger.error(f"❌ Failed to add waypoint: {e}")
            return None
    
    def remove_waypoint(self, waypoint_id: int) -> bool:
        """Remove waypoint from mission"""
        try:
            with self._lock:
                self.waypoints = [wp for wp in self.waypoints if wp.id != waypoint_id]
                
                # Renumber waypoints
                for i, wp in enumerate(self.waypoints):
                    wp.id = i + 1
                
                self._update_mission_stats()
                
                logger.info(f"🗑️ Waypoint removed: {waypoint_id}")
                return True
                
        except Exception as e:
            logger.error(f"❌ Failed to remove waypoint: {e}")
            return False
    
    def update_waypoint(self, waypoint_id: int, **kwargs) -> bool:
        """Update waypoint parameters"""
        try:
            with self._lock:
                waypoint = next((wp for wp in self.waypoints if wp.id == waypoint_id), None)
                
                if not waypoint:
                    logger.warning(f"⚠️ Waypoint not found: {waypoint_id}")
                    return False
                
                # Update waypoint fields
                for key, value in kwargs.items():
                    if hasattr(waypoint, key):
                        setattr(waypoint, key, value)
                
                # Ensure safety constraints
                if hasattr(waypoint, 'alt'):
                    waypoint.alt = max(waypoint.alt, self.settings['safety_altitude'])
                
                self._update_mission_stats()
                
                logger.info(f"📝 Waypoint updated: {waypoint_id}")
                return True
                
        except Exception as e:
            logger.error(f"❌ Failed to update waypoint: {e}")
            return False
    
    def clear_mission(self) -> bool:
        """Clear all waypoints"""
        try:
            with self._lock:
                self.waypoints.clear()
                self.drop_zones.clear()
                self.current_waypoint_index = 0
                self.is_mission_active = False
                self._update_mission_stats()
                
                logger.info("🧹 Mission cleared")
                return True
                
        except Exception as e:
            logger.error(f"❌ Failed to clear mission: {e}")
            return False
    
    def get_waypoints(self) -> List[Dict[str, Any]]:
        """Get all waypoints"""
        with self._lock:
            return [wp.to_dict() for wp in self.waypoints]
    
    def add_drop_zone(self, name: str, lat: float, lon: float, alt: float, 
                     **kwargs) -> Optional[DropZone]:
        """Add drop zone"""
        try:
            with self._lock:
                drop_zone_id = len(self.drop_zones) + 1
                drop_zone = DropZone(
                    id=drop_zone_id,
                    name=name,
                    lat=lat,
                    lon=lon,
                    alt=alt,
                    radius=kwargs.get('radius', 10.0),
                    drop_type=kwargs.get('drop_type', 'PAYLOAD'),
                    wind_compensation=kwargs.get('wind_compensation', True),
                    approach_heading=kwargs.get('approach_heading', 0.0)
                )
                
                self.drop_zones.append(drop_zone)
                
                logger.info(f"🎯 Drop zone added: {name} at {lat:.6f}, {lon:.6f}")
                return drop_zone
                
        except Exception as e:
            logger.error(f"❌ Failed to add drop zone: {e}")
            return None
    
    def get_drop_zones(self) -> List[Dict[str, Any]]:
        """Get all drop zones"""
        with self._lock:
            return [dz.to_dict() for dz in self.drop_zones]
    
    def _update_mission_stats(self):
        """Update mission statistics"""
        if not self.waypoints:
            self.mission_stats = MissionStats()
            return
        
        total_distance = 0.0
        estimated_time = 0.0
        altitudes = [wp.alt for wp in self.waypoints]
        
        # Calculate total distance and time
        prev_wp = None
        for wp in self.waypoints:
            if prev_wp:
                distance = self._calculate_distance(
                    prev_wp.lat, prev_wp.lon,
                    wp.lat, wp.lon
                )
                total_distance += distance
                
                # Estimate time based on speed
                speed = wp.speed if wp.speed > 0 else self.settings['default_speed']
                estimated_time += distance / speed + wp.wait_time
            
            prev_wp = wp
        
        # Add RTL time if enabled
        if self.settings['auto_rtl'] and self.home_position['set'] and self.waypoints:
            last_wp = self.waypoints[-1]
            rtl_distance = self._calculate_distance(
                last_wp.lat, last_wp.lon,
                self.home_position['lat'], self.home_position['lon']
            )
            total_distance += rtl_distance
            estimated_time += rtl_distance / self.settings['default_speed']
        
        # Count drops
        drop_count = sum(1 for wp in self.waypoints if wp.action == WaypointAction.DROP.value)
        
        # Estimate battery usage (rough calculation)
        # Assume 1% battery per minute of flight time
        battery_required = min(100.0, (estimated_time / 60.0) * 1.5)  # 1.5% per minute with safety margin
        
        self.mission_stats = MissionStats(
            total_distance=total_distance,
            estimated_time=estimated_time,
            waypoint_count=len(self.waypoints),
            drop_count=drop_count,
            max_altitude=max(altitudes) if altitudes else 0.0,
            min_altitude=min(altitudes) if altitudes else 0.0,
            battery_required=battery_required
        )
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        R = 6371000  # Earth radius in meters
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * 
             math.sin(delta_lon / 2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def get_mission_stats(self) -> Dict[str, Any]:
        """Get mission statistics"""
        with self._lock:
            return asdict(self.mission_stats)
    
    def validate_mission(self) -> Dict[str, Any]:
        """Validate mission for safety and feasibility"""
        issues = []
        warnings = []
        
        with self._lock:
            # Check if home position is set
            if not self.home_position['set']:
                issues.append("Home position not set")
            
            # Check minimum waypoints
            if len(self.waypoints) < 1:
                issues.append("No waypoints defined")
            
            # Check altitude constraints
            for wp in self.waypoints:
                if wp.alt < self.settings['safety_altitude']:
                    issues.append(f"Waypoint {wp.id} below safety altitude")
                
                if wp.alt > 120:  # FAA limit
                    warnings.append(f"Waypoint {wp.id} above 120m AGL")
            
            # Check battery requirements
            if self.mission_stats.battery_required > 80:
                warnings.append("Mission requires >80% battery")
            
            # Check for takeoff waypoint
            has_takeoff = any(wp.action == WaypointAction.TAKEOFF.value for wp in self.waypoints)
            if not has_takeoff and self.waypoints:
                warnings.append("No takeoff waypoint defined")
            
            # Check for landing/RTL
            has_landing = any(wp.action in [WaypointAction.LAND.value, WaypointAction.RTL.value] 
                            for wp in self.waypoints)
            if not has_landing and not self.settings['auto_rtl']:
                warnings.append("No landing or RTL waypoint defined")
        
        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'warnings': warnings,
            'stats': asdict(self.mission_stats)
        }
    
    def upload_mission(self) -> bool:
        """Upload mission to autopilot"""
        try:
            validation = self.validate_mission()
            
            if not validation['valid']:
                logger.error(f"❌ Mission validation failed: {validation['issues']}")
                return False
            
            if validation['warnings']:
                logger.warning(f"⚠️ Mission warnings: {validation['warnings']}")
            
            # Here would be the actual MAVLink mission upload
            # For now, just log the mission
            logger.info(f"📤 Uploading mission with {len(self.waypoints)} waypoints")
            
            for wp in self.waypoints:
                logger.info(f"  WP{wp.id}: {wp.action} at {wp.lat:.6f}, {wp.lon:.6f}, {wp.alt:.1f}m")
            
            self.current_mission_id = int(time.time())
            logger.info(f"✅ Mission uploaded successfully (ID: {self.current_mission_id})")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to upload mission: {e}")
            return False
    
    def start_mission(self) -> bool:
        """Start mission execution"""
        try:
            if not self.waypoints:
                logger.error("❌ No mission to start")
                return False
            
            validation = self.validate_mission()
            if not validation['valid']:
                logger.error(f"❌ Cannot start invalid mission: {validation['issues']}")
                return False
            
            self.is_mission_active = True
            self.current_waypoint_index = 0
            self.mission_start_time = time.time()
            
            logger.info(f"🚀 Mission started with {len(self.waypoints)} waypoints")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to start mission: {e}")
            return False
    
    def pause_mission(self) -> bool:
        """Pause mission execution"""
        try:
            self.is_mission_active = False
            logger.info("⏸️ Mission paused")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to pause mission: {e}")
            return False
    
    def resume_mission(self) -> bool:
        """Resume mission execution"""
        try:
            self.is_mission_active = True
            logger.info("▶️ Mission resumed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to resume mission: {e}")
            return False
    
    def abort_mission(self) -> bool:
        """Abort mission and return to launch"""
        try:
            self.is_mission_active = False
            self.current_waypoint_index = 0
            
            logger.info("🛑 Mission aborted - RTL initiated")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to abort mission: {e}")
            return False
    
    def get_mission_status(self) -> Dict[str, Any]:
        """Get current mission status"""
        with self._lock:
            current_wp = None
            if 0 <= self.current_waypoint_index < len(self.waypoints):
                current_wp = self.waypoints[self.current_waypoint_index].to_dict()
            
            elapsed_time = time.time() - self.mission_start_time if self.mission_start_time > 0 else 0
            
            return {
                'active': self.is_mission_active,
                'mission_id': self.current_mission_id,
                'current_waypoint_index': self.current_waypoint_index,
                'current_waypoint': current_wp,
                'total_waypoints': len(self.waypoints),
                'progress_percent': (self.current_waypoint_index / len(self.waypoints) * 100) if self.waypoints else 0,
                'elapsed_time': elapsed_time,
                'estimated_remaining': max(0, self.mission_stats.estimated_time - elapsed_time),
                'stats': asdict(self.mission_stats)
            }
    
    def save_mission(self, filename: str) -> bool:
        """Save mission to file"""
        try:
            mission_data = {
                'version': '1.0',
                'created': time.time(),
                'home_position': self.home_position,
                'settings': self.settings,
                'waypoints': [wp.to_dict() for wp in self.waypoints],
                'drop_zones': [dz.to_dict() for dz in self.drop_zones],
                'stats': asdict(self.mission_stats)
            }
            
            with open(filename, 'w') as f:
                json.dump(mission_data, f, indent=2)
            
            logger.info(f"💾 Mission saved: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to save mission: {e}")
            return False
    
    def load_mission(self, filename: str) -> bool:
        """Load mission from file"""
        try:
            with open(filename, 'r') as f:
                mission_data = json.load(f)
            
            with self._lock:
                # Load home position
                self.home_position = mission_data.get('home_position', self.home_position)
                
                # Load settings
                self.settings.update(mission_data.get('settings', {}))
                
                # Load waypoints
                self.waypoints = [
                    Waypoint.from_dict(wp_data) 
                    for wp_data in mission_data.get('waypoints', [])
                ]
                
                # Load drop zones
                self.drop_zones = [
                    DropZone(**dz_data) 
                    for dz_data in mission_data.get('drop_zones', [])
                ]
                
                self._update_mission_stats()
            
            logger.info(f"📂 Mission loaded: {filename} ({len(self.waypoints)} waypoints)")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load mission: {e}")
            return False
    
    def _create_survey_mission(self, **kwargs) -> List[Waypoint]:
        """Create survey mission template"""
        # Implementation for survey pattern
        return []
    
    def _create_delivery_mission(self, **kwargs) -> List[Waypoint]:
        """Create delivery mission template"""
        # Implementation for delivery mission
        return []
    
    def _create_patrol_mission(self, **kwargs) -> List[Waypoint]:
        """Create patrol mission template"""
        # Implementation for patrol pattern
        return []
    
    def _create_emergency_mission(self, **kwargs) -> List[Waypoint]:
        """Create emergency mission template"""
        # Implementation for emergency procedures
        return []

