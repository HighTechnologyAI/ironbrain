#!/usr/bin/env python3
"""
WebSocket MAVLink Bridge for IronBrain Integration

This bridge connects the Web Mission Planner frontend to the existing tcp_mavlink_bridge
running on Jetson, providing real-time MAVLink communication through WebSocket.

Architecture:
Frontend (WebSocket) <-> WebSocket Bridge <-> TCP MAVLink Bridge <-> Orange Cube

Author: Manus AI
Date: August 19, 2025
"""

import asyncio
import websockets
import socket
import json
import logging
import time
import threading
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import struct

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('WebSocketMAVLinkBridge')

@dataclass
class MAVLinkMessage:
    """MAVLink message structure"""
    msg_type: str
    system_id: int
    component_id: int
    timestamp: float
    data: Dict[str, Any]
    raw_bytes: Optional[bytes] = None

@dataclass
class ConnectionStats:
    """Connection statistics"""
    websocket_clients: int = 0
    tcp_connected: bool = False
    messages_received: int = 0
    messages_sent: int = 0
    heartbeat_count: int = 0
    last_heartbeat: Optional[float] = None
    uptime: float = 0
    start_time: float = 0

class WebSocketMAVLinkBridge:
    """WebSocket to TCP MAVLink Bridge"""
    
    def __init__(self, 
                 websocket_host: str = '0.0.0.0',
                 websocket_port: int = 8765,
                 tcp_host: str = '6.tcp.eu.ngrok.io',
                 tcp_port: int = 12189):
        """
        Initialize WebSocket MAVLink Bridge
        
        Args:
            websocket_host: WebSocket server host
            websocket_port: WebSocket server port
            tcp_host: TCP MAVLink bridge host (ngrok tunnel)
            tcp_port: TCP MAVLink bridge port
        """
        self.websocket_host = websocket_host
        self.websocket_port = websocket_port
        self.tcp_host = tcp_host
        self.tcp_port = tcp_port
        
        # Connection management
        self.websocket_clients: set = set()
        self.tcp_socket: Optional[socket.socket] = None
        self.tcp_connected = False
        
        # Statistics
        self.stats = ConnectionStats(start_time=time.time())
        
        # Message queues
        self.outbound_queue = asyncio.Queue()
        self.inbound_queue = asyncio.Queue()
        
        # Control flags
        self.running = False
        self.tcp_thread: Optional[threading.Thread] = None
        
        logger.info(f"WebSocket MAVLink Bridge initialized")
        logger.info(f"WebSocket: {websocket_host}:{websocket_port}")
        logger.info(f"TCP Target: {tcp_host}:{tcp_port}")

    async def start(self):
        """Start the WebSocket MAVLink Bridge"""
        logger.info("Starting WebSocket MAVLink Bridge...")
        self.running = True
        self.stats.start_time = time.time()
        
        # Start TCP connection in background thread
        self.tcp_thread = threading.Thread(target=self._tcp_connection_handler, daemon=True)
        self.tcp_thread.start()
        
        # Start WebSocket server
        logger.info(f"Starting WebSocket server on {self.websocket_host}:{self.websocket_port}")
        
        try:
            async with websockets.serve(
                self._websocket_handler,
                self.websocket_host,
                self.websocket_port,
                ping_interval=30,
                ping_timeout=10
            ):
                logger.info("WebSocket MAVLink Bridge started successfully")
                
                # Start background tasks
                await asyncio.gather(
                    self._message_processor(),
                    self._stats_reporter(),
                    self._keep_running()
                )
        except Exception as e:
            logger.error(f"Failed to start WebSocket server: {e}")
            raise

    async def stop(self):
        """Stop the WebSocket MAVLink Bridge"""
        logger.info("Stopping WebSocket MAVLink Bridge...")
        self.running = False
        
        # Close TCP connection
        if self.tcp_socket:
            try:
                self.tcp_socket.close()
            except:
                pass
        
        # Close all WebSocket connections
        if self.websocket_clients:
            await asyncio.gather(
                *[client.close() for client in self.websocket_clients],
                return_exceptions=True
            )
        
        logger.info("WebSocket MAVLink Bridge stopped")

    def _tcp_connection_handler(self):
        """Handle TCP connection to MAVLink bridge (runs in separate thread)"""
        while self.running:
            try:
                if not self.tcp_connected:
                    self._connect_tcp()
                
                if self.tcp_connected:
                    self._tcp_receive_loop()
                    
            except Exception as e:
                logger.error(f"TCP connection error: {e}")
                self.tcp_connected = False
                if self.tcp_socket:
                    try:
                        self.tcp_socket.close()
                    except:
                        pass
                    self.tcp_socket = None
                
                # Wait before reconnecting
                time.sleep(5)

    def _connect_tcp(self):
        """Connect to TCP MAVLink bridge"""
        try:
            logger.info(f"Connecting to TCP MAVLink bridge at {self.tcp_host}:{self.tcp_port}")
            
            self.tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.tcp_socket.settimeout(10)
            self.tcp_socket.connect((self.tcp_host, self.tcp_port))
            self.tcp_socket.settimeout(None)  # Remove timeout for data operations
            
            self.tcp_connected = True
            self.stats.tcp_connected = True
            
            logger.info("Successfully connected to TCP MAVLink bridge")
            
        except Exception as e:
            logger.error(f"Failed to connect to TCP MAVLink bridge: {e}")
            self.tcp_connected = False
            self.stats.tcp_connected = False
            if self.tcp_socket:
                try:
                    self.tcp_socket.close()
                except:
                    pass
                self.tcp_socket = None

    def _tcp_receive_loop(self):
        """Receive data from TCP MAVLink bridge"""
        buffer = b''
        
        while self.running and self.tcp_connected:
            try:
                # Receive data
                data = self.tcp_socket.recv(4096)
                if not data:
                    logger.warning("TCP connection closed by remote")
                    break
                
                buffer += data
                
                # Process complete MAVLink messages
                while len(buffer) >= 8:  # Minimum MAVLink message size
                    # Simple MAVLink message detection (starts with 0xFE or 0xFD)
                    if buffer[0] in [0xFE, 0xFD]:
                        # MAVLink v1 (0xFE) or v2 (0xFD)
                        if buffer[0] == 0xFE and len(buffer) >= 8:
                            # MAVLink v1: header(6) + payload + checksum(2)
                            payload_len = buffer[1]
                            msg_len = 6 + payload_len + 2
                            
                            if len(buffer) >= msg_len:
                                msg_bytes = buffer[:msg_len]
                                buffer = buffer[msg_len:]
                                self._process_mavlink_message(msg_bytes)
                            else:
                                break
                                
                        elif buffer[0] == 0xFD and len(buffer) >= 10:
                            # MAVLink v2: header(10) + payload + checksum(2) + signature(13, optional)
                            payload_len = buffer[1]
                            incompat_flags = buffer[2]
                            
                            # Check if signature is present
                            signature_len = 13 if (incompat_flags & 0x01) else 0
                            msg_len = 10 + payload_len + 2 + signature_len
                            
                            if len(buffer) >= msg_len:
                                msg_bytes = buffer[:msg_len]
                                buffer = buffer[msg_len:]
                                self._process_mavlink_message(msg_bytes)
                            else:
                                break
                        else:
                            break
                    else:
                        # Invalid start byte, skip
                        buffer = buffer[1:]
                        
            except socket.timeout:
                continue
            except Exception as e:
                logger.error(f"TCP receive error: {e}")
                break
        
        self.tcp_connected = False
        self.stats.tcp_connected = False

    def _process_mavlink_message(self, msg_bytes: bytes):
        """Process received MAVLink message"""
        try:
            # Basic MAVLink parsing
            if msg_bytes[0] == 0xFE:  # MAVLink v1
                payload_len = msg_bytes[1]
                seq = msg_bytes[2]
                system_id = msg_bytes[3]
                component_id = msg_bytes[4]
                msg_id = msg_bytes[5]
                payload = msg_bytes[6:6+payload_len]
                
            elif msg_bytes[0] == 0xFD:  # MAVLink v2
                payload_len = msg_bytes[1]
                incompat_flags = msg_bytes[2]
                compat_flags = msg_bytes[3]
                seq = msg_bytes[4]
                system_id = msg_bytes[5]
                component_id = msg_bytes[6]
                msg_id = struct.unpack('<I', msg_bytes[7:10] + b'\x00')[0]  # 24-bit message ID
                payload = msg_bytes[10:10+payload_len]
            else:
                return
            
            # Create MAVLink message object
            mavlink_msg = MAVLinkMessage(
                msg_type=f"MSG_{msg_id}",
                system_id=system_id,
                component_id=component_id,
                timestamp=time.time(),
                data={
                    'msg_id': msg_id,
                    'seq': seq,
                    'payload_length': payload_len,
                    'payload': payload.hex() if payload else ''
                },
                raw_bytes=msg_bytes
            )
            
            # Update statistics
            self.stats.messages_received += 1
            
            # Check for heartbeat (msg_id = 0)
            if msg_id == 0:
                self.stats.heartbeat_count += 1
                self.stats.last_heartbeat = time.time()
                mavlink_msg.msg_type = "HEARTBEAT"
            
            # Queue message for WebSocket clients
            asyncio.run_coroutine_threadsafe(
                self.inbound_queue.put(mavlink_msg),
                asyncio.get_event_loop()
            )
            
        except Exception as e:
            logger.error(f"Error processing MAVLink message: {e}")

    async def _websocket_handler(self, websocket, path):
        """Handle WebSocket client connections"""
        client_addr = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        logger.info(f"New WebSocket client connected: {client_addr}")
        
        self.websocket_clients.add(websocket)
        self.stats.websocket_clients = len(self.websocket_clients)
        
        try:
            # Send initial connection status
            await self._send_to_client(websocket, {
                'type': 'connection_status',
                'connected': self.tcp_connected,
                'stats': asdict(self.stats)
            })
            
            # Handle incoming messages from client
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self._handle_client_message(websocket, data)
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON from client {client_addr}: {message}")
                except Exception as e:
                    logger.error(f"Error handling client message: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"WebSocket client disconnected: {client_addr}")
        except Exception as e:
            logger.error(f"WebSocket error for client {client_addr}: {e}")
        finally:
            self.websocket_clients.discard(websocket)
            self.stats.websocket_clients = len(self.websocket_clients)

    async def _handle_client_message(self, websocket, data: dict):
        """Handle message from WebSocket client"""
        msg_type = data.get('type')
        
        if msg_type == 'mavlink_command':
            # Forward MAVLink command to TCP bridge
            await self._forward_to_tcp(data.get('command', {}))
            
        elif msg_type == 'request_stats':
            # Send current statistics
            await self._send_to_client(websocket, {
                'type': 'stats_update',
                'stats': asdict(self.stats)
            })
            
        elif msg_type == 'ping':
            # Respond to ping
            await self._send_to_client(websocket, {
                'type': 'pong',
                'timestamp': time.time()
            })

    async def _forward_to_tcp(self, command: dict):
        """Forward command to TCP MAVLink bridge"""
        if not self.tcp_connected:
            logger.warning("Cannot forward command: TCP not connected")
            return
        
        try:
            # Add to outbound queue for TCP sending
            await self.outbound_queue.put(command)
            self.stats.messages_sent += 1
            
        except Exception as e:
            logger.error(f"Error forwarding command to TCP: {e}")

    async def _send_to_client(self, websocket, data: dict):
        """Send data to specific WebSocket client"""
        try:
            await websocket.send(json.dumps(data))
        except Exception as e:
            logger.error(f"Error sending to client: {e}")

    async def _broadcast_to_clients(self, data: dict):
        """Broadcast data to all WebSocket clients"""
        if not self.websocket_clients:
            return
        
        message = json.dumps(data)
        await asyncio.gather(
            *[client.send(message) for client in self.websocket_clients],
            return_exceptions=True
        )

    async def _message_processor(self):
        """Process messages between WebSocket and TCP"""
        while self.running:
            try:
                # Process inbound messages (TCP -> WebSocket)
                try:
                    mavlink_msg = await asyncio.wait_for(self.inbound_queue.get(), timeout=0.1)
                    
                    # Broadcast to all WebSocket clients
                    await self._broadcast_to_clients({
                        'type': 'mavlink_message',
                        'message': asdict(mavlink_msg)
                    })
                    
                except asyncio.TimeoutError:
                    pass
                
                # Process outbound messages (WebSocket -> TCP)
                try:
                    command = await asyncio.wait_for(self.outbound_queue.get(), timeout=0.1)
                    
                    # Send to TCP bridge (implement actual MAVLink encoding here)
                    # For now, just log the command
                    logger.info(f"Forwarding command to TCP: {command}")
                    
                except asyncio.TimeoutError:
                    pass
                    
            except Exception as e:
                logger.error(f"Error in message processor: {e}")
                await asyncio.sleep(1)

    async def _stats_reporter(self):
        """Periodically report statistics"""
        while self.running:
            try:
                # Update uptime
                self.stats.uptime = time.time() - self.stats.start_time
                
                # Broadcast stats to clients
                await self._broadcast_to_clients({
                    'type': 'stats_update',
                    'stats': asdict(self.stats)
                })
                
                # Log stats
                logger.info(
                    f"Stats: {self.stats.websocket_clients} WS clients, "
                    f"TCP: {'connected' if self.stats.tcp_connected else 'disconnected'}, "
                    f"Messages: {self.stats.messages_received} in / {self.stats.messages_sent} out, "
                    f"Heartbeats: {self.stats.heartbeat_count}"
                )
                
                await asyncio.sleep(30)  # Report every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in stats reporter: {e}")
                await asyncio.sleep(30)

    async def _keep_running(self):
        """Keep the event loop running"""
        while self.running:
            await asyncio.sleep(1)

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='WebSocket MAVLink Bridge for IronBrain')
    parser.add_argument('--ws-host', default='0.0.0.0', help='WebSocket host')
    parser.add_argument('--ws-port', type=int, default=8765, help='WebSocket port')
    parser.add_argument('--tcp-host', default='6.tcp.eu.ngrok.io', help='TCP MAVLink bridge host')
    parser.add_argument('--tcp-port', type=int, default=12189, help='TCP MAVLink bridge port')
    parser.add_argument('--log-level', default='INFO', help='Log level')
    
    args = parser.parse_args()
    
    # Set log level
    logging.getLogger().setLevel(getattr(logging, args.log_level.upper()))
    
    # Create and start bridge
    bridge = WebSocketMAVLinkBridge(
        websocket_host=args.ws_host,
        websocket_port=args.ws_port,
        tcp_host=args.tcp_host,
        tcp_port=args.tcp_port
    )
    
    try:
        asyncio.run(bridge.start())
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    except Exception as e:
        logger.error(f"Bridge error: {e}")
    finally:
        logger.info("WebSocket MAVLink Bridge shutdown complete")

if __name__ == '__main__':
    main()

