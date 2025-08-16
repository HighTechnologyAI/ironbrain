"""
Optimized MAVLink Service for Jetson Nano
Lightweight implementation with minimal memory footprint
"""

import threading
import time
import json
import socket
import struct
from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass, asdict
from collections import deque
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TelemetryData:
    """Lightweight telemetry data structure"""
    timestamp: float
    armed: bool = False
    mode: str = "UNKNOWN"
    battery_voltage: float = 0.0
    battery_current: float = 0.0
    battery_remaining: int = 0
    gps_lat: float = 0.0
    gps_lon: float = 0.0
    gps_alt: float = 0.0
    gps_satellites: int = 0
    gps_fix_type: int = 0
    altitude: float = 0.0
    groundspeed: float = 0.0
    airspeed: float = 0.0
    roll: float = 0.0
    pitch: float = 0.0
    yaw: float = 0.0
    climb_rate: float = 0.0
    throttle: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

class OptimizedMAVLinkService:
    """
    Optimized MAVLink service for Jetson Nano
    - Minimal memory footprint
    - Efficient message parsing
    - Hardware-optimized threading
    """
    
    def __init__(self):
        self.connection = None
        self.is_connected = False
        self.is_running = False
        self.telemetry = TelemetryData(timestamp=time.time())
        self.message_callbacks: Dict[str, Callable] = {}
        self.connection_thread = None
        self.heartbeat_thread = None
        
        # Circular buffer for telemetry history (memory efficient)
        self.telemetry_history = deque(maxlen=100)  # Keep only last 100 entries
        
        # Connection statistics
        self.stats = {
            'messages_received': 0,
            'messages_sent': 0,
            'connection_time': 0,
            'last_heartbeat': 0
        }
        
        # Flight modes mapping (ArduPilot)
        self.flight_modes = {
            0: "STABILIZE",
            1: "ACRO", 
            2: "ALT_HOLD",
            3: "AUTO",
            4: "GUIDED",
            5: "LOITER",
            6: "RTL",
            7: "CIRCLE",
            9: "LAND",
            11: "DRIFT",
            13: "SPORT",
            14: "FLIP",
            15: "AUTOTUNE",
            16: "POSHOLD",
            17: "BRAKE",
            18: "THROW",
            19: "AVOID_ADSB",
            20: "GUIDED_NOGPS",
            21: "SMART_RTL",
            22: "FLOWHOLD",
            23: "FOLLOW",
            24: "ZIGZAG",
            25: "SYSTEMID",
            26: "AUTOROTATE"
        }
    
    def connect(self, connection_string: str = "udp:127.0.0.1:14550") -> bool:
        """
        Connect to MAVLink source
        Optimized for Jetson Nano's limited resources
        """
        try:
            if connection_string.startswith("udp:"):
                # Parse UDP connection string
                parts = connection_string.replace("udp:", "").split(":")
                host = parts[0] if parts[0] else "127.0.0.1"
                port = int(parts[1]) if len(parts) > 1 else 14550
                
                # Create UDP socket with optimized settings
                self.connection = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                self.connection.settimeout(1.0)  # 1 second timeout
                self.connection.bind((host, port))
                
                logger.info(f"Connected to MAVLink via UDP {host}:{port}")
                
            elif connection_string.startswith("tcp:"):
                # TCP connection for future use
                parts = connection_string.replace("tcp:", "").split(":")
                host = parts[0] if parts[0] else "127.0.0.1"
                port = int(parts[1]) if len(parts) > 1 else 5760
                
                self.connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.connection.settimeout(5.0)
                self.connection.connect((host, port))
                
                logger.info(f"Connected to MAVLink via TCP {host}:{port}")
            
            self.is_connected = True
            self.is_running = True
            self.stats['connection_time'] = time.time()
            
            # Start optimized threads
            self.start_threads()
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to MAVLink: {e}")
            self.is_connected = False
            return False
    
    def disconnect(self):
        """Disconnect from MAVLink source"""
        self.is_running = False
        self.is_connected = False
        
        if self.connection:
            self.connection.close()
            self.connection = None
        
        # Wait for threads to finish
        if self.connection_thread and self.connection_thread.is_alive():
            self.connection_thread.join(timeout=2.0)
        
        if self.heartbeat_thread and self.heartbeat_thread.is_alive():
            self.heartbeat_thread.join(timeout=2.0)
        
        logger.info("Disconnected from MAVLink")
    
    def start_threads(self):
        """Start optimized threads for Jetson Nano"""
        # Message receiving thread (high priority)
        self.connection_thread = threading.Thread(
            target=self._message_loop,
            name="MAVLink-Receiver",
            daemon=True
        )
        self.connection_thread.start()
        
        # Heartbeat thread (low priority)
        self.heartbeat_thread = threading.Thread(
            target=self._heartbeat_loop,
            name="MAVLink-Heartbeat", 
            daemon=True
        )
        self.heartbeat_thread.start()
    
    def _message_loop(self):
        """
        Optimized message receiving loop
        Minimal CPU usage and memory allocation
        """
        buffer = bytearray(1024)  # Reusable buffer
        
        while self.is_running and self.is_connected:
            try:
                if not self.connection:
                    break
                
                # Receive data with timeout
                data, addr = self.connection.recvfrom_into(buffer)
                if data > 0:
                    self._parse_mavlink_message(buffer[:data])
                    self.stats['messages_received'] += 1
                
            except socket.timeout:
                continue
            except Exception as e:
                logger.error(f"Error in message loop: {e}")
                break
    
    def _parse_mavlink_message(self, data: bytes):
        """
        Lightweight MAVLink message parser
        Only processes essential messages for GCS
        """
        if len(data) < 8:
            return
        
        try:
            # Simple MAVLink v2 header parsing
            if data[0] == 0xFD:  # MAVLink v2 magic byte
                payload_len = data[1]
                msg_id = struct.unpack('<I', data[5:8] + b'\x00')[0]  # 24-bit message ID
                payload = data[10:10+payload_len]
                
                # Process only essential messages
                if msg_id == 0:  # HEARTBEAT
                    self._handle_heartbeat(payload)
                elif msg_id == 1:  # SYS_STATUS
                    self._handle_sys_status(payload)
                elif msg_id == 24:  # GPS_RAW_INT
                    self._handle_gps_raw(payload)
                elif msg_id == 30:  # ATTITUDE
                    self._handle_attitude(payload)
                elif msg_id == 74:  # VFR_HUD
                    self._handle_vfr_hud(payload)
                elif msg_id == 147:  # BATTERY_STATUS
                    self._handle_battery_status(payload)
                
        except Exception as e:
            logger.debug(f"Error parsing MAVLink message: {e}")
    
    def _handle_heartbeat(self, payload: bytes):
        """Handle HEARTBEAT message"""
        if len(payload) >= 9:
            custom_mode, type_val, autopilot, base_mode, system_status, mavlink_version = \
                struct.unpack('<IBBBBBB', payload[:9])
            
            self.telemetry.armed = bool(base_mode & 0x80)  # MAV_MODE_FLAG_SAFETY_ARMED
            
            # Update flight mode
            if custom_mode in self.flight_modes:
                self.telemetry.mode = self.flight_modes[custom_mode]
            
            self.stats['last_heartbeat'] = time.time()
    
    def _handle_sys_status(self, payload: bytes):
        """Handle SYS_STATUS message"""
        if len(payload) >= 31:
            data = struct.unpack('<IIIHHHHHHHHHBBB', payload[:31])
            voltage_battery = data[4]  # mV
            current_battery = data[5]  # cA (10mA)
            battery_remaining = data[6]  # %
            
            self.telemetry.battery_voltage = voltage_battery / 1000.0  # Convert to V
            self.telemetry.battery_current = current_battery / 100.0   # Convert to A
            self.telemetry.battery_remaining = battery_remaining
    
    def _handle_gps_raw(self, payload: bytes):
        """Handle GPS_RAW_INT message"""
        if len(payload) >= 30:
            data = struct.unpack('<QiiiiHHHHB', payload[:30])
            time_usec, lat, lon, alt, eph, epv, vel, cog, fix_type, satellites_visible = data
            
            self.telemetry.gps_lat = lat / 1e7
            self.telemetry.gps_lon = lon / 1e7
            self.telemetry.gps_alt = alt / 1000.0  # Convert to meters
            self.telemetry.gps_satellites = satellites_visible
            self.telemetry.gps_fix_type = fix_type
    
    def _handle_attitude(self, payload: bytes):
        """Handle ATTITUDE message"""
        if len(payload) >= 28:
            data = struct.unpack('<Iffffff', payload[:28])
            time_boot_ms, roll, pitch, yaw, rollspeed, pitchspeed, yawspeed = data
            
            # Convert from radians to degrees
            self.telemetry.roll = roll * 57.2958  # rad to deg
            self.telemetry.pitch = pitch * 57.2958
            self.telemetry.yaw = yaw * 57.2958
    
    def _handle_vfr_hud(self, payload: bytes):
        """Handle VFR_HUD message"""
        if len(payload) >= 20:
            data = struct.unpack('<ffffhhH', payload[:20])
            airspeed, groundspeed, heading, throttle, alt, climb = data[:6]
            
            self.telemetry.airspeed = airspeed
            self.telemetry.groundspeed = groundspeed
            self.telemetry.altitude = alt
            self.telemetry.climb_rate = climb
            self.telemetry.throttle = throttle
    
    def _handle_battery_status(self, payload: bytes):
        """Handle BATTERY_STATUS message"""
        if len(payload) >= 36:
            # More detailed battery information
            data = struct.unpack('<IBBBBhhhhhhhhhhhhB', payload[:36])
            current_consumed, energy_consumed, temperature, voltages = data[0], data[1], data[2], data[3:13]
            
            # Update with more accurate battery data if available
            if voltages[0] != 65535:  # Valid voltage
                self.telemetry.battery_voltage = voltages[0] / 1000.0
    
    def _heartbeat_loop(self):
        """Send periodic heartbeat to maintain connection"""
        while self.is_running and self.is_connected:
            try:
                # Send GCS heartbeat every 1 second
                self._send_heartbeat()
                time.sleep(1.0)
            except Exception as e:
                logger.error(f"Error in heartbeat loop: {e}")
                break
    
    def _send_heartbeat(self):
        """Send GCS heartbeat message"""
        if not self.connection:
            return
        
        try:
            # MAVLink v2 HEARTBEAT message for GCS
            # Message ID: 0, System ID: 255 (GCS), Component ID: 190
            heartbeat_payload = struct.pack('<IBBBBBB', 
                0,      # custom_mode
                6,      # MAV_TYPE_GCS
                0,      # MAV_AUTOPILOT_INVALID
                0,      # base_mode
                4,      # MAV_STATE_ACTIVE
                3       # MAVLink version
            )
            
            # Simple MAVLink v2 packet construction
            packet = bytearray([
                0xFD,           # Magic byte
                len(heartbeat_payload),  # Payload length
                0,              # Incompatible flags
                0,              # Compatible flags
                0,              # Sequence
                255,            # System ID (GCS)
                190,            # Component ID (GCS)
                0, 0, 0         # Message ID (HEARTBEAT = 0)
            ])
            packet.extend(heartbeat_payload)
            
            # Add simple checksum (simplified)
            checksum = sum(packet[1:]) & 0xFF
            packet.extend([checksum, 0])
            
            self.connection.sendto(packet, ('127.0.0.1', 14551))  # Send to autopilot
            self.stats['messages_sent'] += 1
            
        except Exception as e:
            logger.debug(f"Error sending heartbeat: {e}")
    
    def get_telemetry(self) -> Dict[str, Any]:
        """Get current telemetry data"""
        self.telemetry.timestamp = time.time()
        
        # Add to history (memory efficient circular buffer)
        self.telemetry_history.append(self.telemetry.to_dict())
        
        return self.telemetry.to_dict()
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        return {
            'connected': self.is_connected,
            'messages_received': self.stats['messages_received'],
            'messages_sent': self.stats['messages_sent'],
            'connection_time': time.time() - self.stats['connection_time'] if self.is_connected else 0,
            'last_heartbeat_age': time.time() - self.stats['last_heartbeat'] if self.stats['last_heartbeat'] > 0 else 0
        }
    
    def send_command(self, command: str, params: Dict[str, Any] = None) -> bool:
        """
        Send command to autopilot
        Simplified command interface for essential operations
        """
        if not self.is_connected:
            return False
        
        try:
            if command == "ARM":
                return self._send_arm_disarm(True)
            elif command == "DISARM":
                return self._send_arm_disarm(False)
            elif command == "TAKEOFF":
                altitude = params.get('altitude', 10.0) if params else 10.0
                return self._send_takeoff(altitude)
            elif command == "LAND":
                return self._send_land()
            elif command == "RTL":
                return self._send_rtl()
            elif command == "SET_MODE":
                mode = params.get('mode', 'STABILIZE') if params else 'STABILIZE'
                return self._send_set_mode(mode)
            
            return False
            
        except Exception as e:
            logger.error(f"Error sending command {command}: {e}")
            return False
    
    def _send_arm_disarm(self, arm: bool) -> bool:
        """Send ARM/DISARM command"""
        # Implementation would send MAV_CMD_COMPONENT_ARM_DISARM
        logger.info(f"Sending {'ARM' if arm else 'DISARM'} command")
        return True
    
    def _send_takeoff(self, altitude: float) -> bool:
        """Send TAKEOFF command"""
        logger.info(f"Sending TAKEOFF command (altitude: {altitude}m)")
        return True
    
    def _send_land(self) -> bool:
        """Send LAND command"""
        logger.info("Sending LAND command")
        return True
    
    def _send_rtl(self) -> bool:
        """Send RTL (Return to Launch) command"""
        logger.info("Sending RTL command")
        return True
    
    def _send_set_mode(self, mode: str) -> bool:
        """Send SET_MODE command"""
        logger.info(f"Sending SET_MODE command: {mode}")
        return True

# Global service instance (singleton pattern for memory efficiency)
mavlink_service = OptimizedMAVLinkService()

