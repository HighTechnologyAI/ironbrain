"""
MAVLink Bridge Service - Modular MAVLink Communication
Extracted from mavlink_service.py for better separation of concerns
"""

import socket
import time
import logging
import threading
from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass, asdict
from collections import deque

from ..utils.serialization import SerializationUtils

logger = logging.getLogger(__name__)


@dataclass
class ConnectionStats:
    """Connection statistics"""
    is_connected: bool = False
    messages_received: int = 0
    messages_sent: int = 0
    bytes_received: int = 0
    bytes_sent: int = 0
    connection_time: float = 0
    last_heartbeat: float = 0
    connection_string: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class MAVLinkBridge:
    """
    Modular MAVLink communication bridge
    Handles connection, message parsing, and command sending
    """
    
    def __init__(self, max_history: int = 100):
        # Connection management
        self.connection: Optional[socket.socket] = None
        self.is_connected: bool = False
        self.connection_string: str = ""
        
        # Threading
        self._message_thread: Optional[threading.Thread] = None
        self._heartbeat_thread: Optional[threading.Thread] = None
        self._running: bool = False
        self._lock = threading.Lock()
        
        # Statistics
        self.stats = ConnectionStats()
        
        # Message handlers
        self.message_handlers: Dict[str, Callable] = {}
        self.raw_message_history = deque(maxlen=max_history)
        
        # Flight mode mapping (consolidated)
        self.flight_modes = {
            0: "STABILIZE", 1: "ACRO", 2: "ALT_HOLD", 3: "AUTO",
            4: "GUIDED", 5: "LOITER", 6: "RTL", 7: "CIRCLE",
            8: "POSITION", 9: "LAND", 10: "OF_LOITER", 11: "DRIFT",
            12: "SPORT", 13: "FLIP", 14: "AUTOTUNE", 15: "POSHOLD",
            16: "BRAKE", 17: "THROW", 18: "AVOID_ADSB", 19: "GUIDED_NOGPS",
            20: "SMART_RTL", 21: "FLOWHOLD", 22: "FOLLOW", 23: "ZIGZAG"
        }
    
    def register_message_handler(self, message_type: str, handler: Callable[[Dict[str, Any]], None]):
        """Register a handler for specific message types"""
        with self._lock:
            self.message_handlers[message_type] = handler
    
    def connect(self, connection_string: str = "udp:127.0.0.1:14550") -> bool:
        """
        Connect to MAVLink source with graceful degradation
        """
        try:
            self.disconnect()  # Clean disconnect first
            
            if connection_string.startswith("udp:"):
                success = self._connect_udp(connection_string)
            elif connection_string.startswith("tcp:"):
                success = self._connect_tcp(connection_string)
            else:
                logger.error(f"Unsupported connection type: {connection_string}")
                return False
            
            if success:
                self.is_connected = True
                self.connection_string = connection_string
                self.stats.connection_string = connection_string
                self.stats.connection_time = time.time()
                self.stats.is_connected = True
                
                # Start communication threads
                self._start_threads()
                logger.info(f"✅ MAVLink bridge connected: {connection_string}")
                return True
            
        except Exception as e:
            logger.error(f"❌ MAVLink connection failed: {e}")
            self.is_connected = False
            
        return False
    
    def _connect_udp(self, connection_string: str) -> bool:
        """Connect via UDP"""
        parts = connection_string.replace("udp:", "").split(":")
        host = parts[0] if parts[0] else "127.0.0.1"
        port = int(parts[1]) if len(parts) > 1 else 14550
        
        self.connection = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.connection.settimeout(1.0)
        self.connection.bind((host, port))
        
        return True
    
    def _connect_tcp(self, connection_string: str) -> bool:
        """Connect via TCP"""
        parts = connection_string.replace("tcp:", "").split(":")
        host = parts[0] if parts[0] else "127.0.0.1"
        port = int(parts[1]) if len(parts) > 1 else 5760
        
        self.connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.connection.settimeout(5.0)
        self.connection.connect((host, port))
        
        return True
    
    def disconnect(self):
        """Graceful disconnect with cleanup"""
        self._running = False
        self.is_connected = False
        
        # Wait for threads to finish
        if self._message_thread and self._message_thread.is_alive():
            self._message_thread.join(timeout=2.0)
        
        if self._heartbeat_thread and self._heartbeat_thread.is_alive():
            self._heartbeat_thread.join(timeout=2.0)
        
        # Close connection
        if self.connection:
            try:
                self.connection.close()
            except:
                pass
            self.connection = None
        
        # Reset stats
        self.stats.is_connected = False
        logger.info("🛑 MAVLink bridge disconnected")
    
    def _start_threads(self):
        """Start communication threads"""
        self._running = True
        
        # Message processing thread
        self._message_thread = threading.Thread(
            target=self._message_loop,
            name="MAVLink-Message-Loop",
            daemon=True
        )
        self._message_thread.start()
        
        # Heartbeat thread
        self._heartbeat_thread = threading.Thread(
            target=self._heartbeat_loop,
            name="MAVLink-Heartbeat-Loop",
            daemon=True
        )
        self._heartbeat_thread.start()
    
    def _message_loop(self):
        """Main message processing loop"""
        buffer = bytearray()
        
        while self._running and self.connection:
            try:
                # Receive data
                data, addr = self.connection.recvfrom(1024)
                
                if not data:
                    continue
                
                buffer.extend(data)
                self.stats.bytes_received += len(data)
                
                # Process complete MAVLink messages
                while len(buffer) >= 12:  # Minimum MAVLink v2 packet size
                    message = self._parse_mavlink_packet(buffer)
                    if message:
                        self._handle_message(message)
                        self.stats.messages_received += 1
                    else:
                        break
                
            except socket.timeout:
                continue
            except Exception as e:
                if self._running:
                    logger.error(f"Message loop error: {e}")
                break
    
    def _parse_mavlink_packet(self, buffer: bytearray) -> Optional[Dict[str, Any]]:
        """Parse MAVLink packet from buffer"""
        if len(buffer) < 12:
            return None
        
        # Check for MAVLink v2 magic byte
        if buffer[0] != 0xFD:
            # Remove invalid byte and continue
            buffer.pop(0)
            return None
        
        # Extract payload length
        payload_len = buffer[1]
        packet_len = payload_len + 12  # Header + payload + checksum
        
        if len(buffer) < packet_len:
            return None
        
        # Extract packet
        packet = buffer[:packet_len]
        del buffer[:packet_len]
        
        # Parse basic message info
        message = {
            'payload_length': payload_len,
            'sequence': packet[2],
            'system_id': packet[3],
            'component_id': packet[4],
            'message_id': int.from_bytes(packet[5:8], 'little'),
            'payload': packet[10:10+payload_len],
            'timestamp': time.time()
        }
        
        return message
    
    def _handle_message(self, message: Dict[str, Any]):
        """Handle parsed MAVLink message"""
        # Add to history
        self.raw_message_history.append(message)
        
        # Call registered handlers
        message_id = message.get('message_id')
        if message_id in self.message_handlers:
            try:
                self.message_handlers[message_id](message)
            except Exception as e:
                logger.error(f"Message handler error: {e}")
        
        # Update heartbeat timestamp for HEARTBEAT messages (ID 0)
        if message_id == 0:
            self.stats.last_heartbeat = time.time()
    
    def _heartbeat_loop(self):
        """Send periodic heartbeat"""
        while self._running:
            try:
                self._send_heartbeat()
                time.sleep(1.0)  # 1Hz heartbeat
            except Exception as e:
                if self._running:
                    logger.error(f"Heartbeat error: {e}")
            time.sleep(1.0)
    
    def _send_heartbeat(self):
        """Send GCS heartbeat message"""
        if not self.connection:
            return
        
        try:
            # MAVLink v2 HEARTBEAT message
            payload = bytearray([
                0x00, 0x00, 0x00, 0x00,  # custom_mode
                0x06,  # type (GCS)
                0x08,  # autopilot (INVALID)
                0x00,  # base_mode
                0x00,  # system_status
                0x03   # mavlink_version
            ])
            
            packet = bytearray([
                0xFD,  # magic
                len(payload),  # payload length
                0x00,  # sequence
                0xFF,  # system_id (GCS)
                0xBE,  # component_id
                0x00, 0x00, 0x00,  # message_id (HEARTBEAT = 0)
                0x00, 0x00  # compatibility flags
            ])
            
            packet.extend(payload)
            
            # Calculate and append checksum
            checksum = sum(packet[1:]) & 0xFF
            packet.extend([checksum, 0])
            
            # Send to autopilot (adjust target as needed)
            self.connection.sendto(packet, ('127.0.0.1', 14551))
            self.stats.messages_sent += 1
            self.stats.bytes_sent += len(packet)
            
        except Exception as e:
            logger.debug(f"Heartbeat send error: {e}")
    
    def send_command(self, command: str, params: Dict[str, Any] = None) -> bool:
        """Send command to autopilot (placeholder for command implementation)"""
        if not self.is_connected:
            return False
        
        # Implementation would depend on specific commands needed
        logger.info(f"Command sent: {command} with params: {params}")
        return True
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        return SerializationUtils.add_timestamp(self.stats.to_dict())
    
    def get_message_history(self, count: int = 10) -> List[Dict[str, Any]]:
        """Get recent message history"""
        with self._lock:
            return list(self.raw_message_history)[-count:]


# Singleton instance for global use
mavlink_bridge = MAVLinkBridge()