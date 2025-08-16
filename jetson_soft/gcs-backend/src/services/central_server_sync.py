"""
Central Server Sync Service - Supabase/WebSocket Integration
Handles communication with Tiger CRM central server
"""

import asyncio
import json
import logging
import threading
import time
from typing import Dict, Any, List, Optional, Callable
import websockets
import requests
from dataclasses import dataclass, asdict

from ..utils.serialization import SerializationUtils

logger = logging.getLogger(__name__)


@dataclass
class SyncStats:
    """Synchronization statistics"""
    websocket_connected: bool = False
    last_sync_time: float = 0
    total_syncs: int = 0
    failed_syncs: int = 0
    bytes_sent: int = 0
    bytes_received: int = 0
    latency_ms: float = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class CentralServerSync:
    """
    Handles sync with Tiger CRM central server (Supabase)
    Manages WebSocket real-time communication and REST API calls
    """
    
    def __init__(self, 
                 server_url: str = "https://zqnjgwrvvrqaenzmlvfx.supabase.co",
                 websocket_url: str = "wss://zqnjgwrvvrqaenzmlvfx.supabase.co/realtime/v1/websocket",
                 api_key: str = ""):
        
        self.server_url = server_url.rstrip('/')
        self.websocket_url = websocket_url
        self.api_key = api_key
        
        # Connection management
        self.websocket: Optional[websockets.WebSocketServerProtocol] = None
        self.session = requests.Session()
        self._running = False
        self._ws_thread: Optional[threading.Thread] = None
        
        # Statistics
        self.stats = SyncStats()
        
        # Message handlers
        self.message_handlers: Dict[str, Callable] = {}
        
        # Setup HTTP session
        self._setup_session()
    
    def _setup_session(self):
        """Setup HTTP session with headers"""
        self.session.headers.update({
            'Content-Type': 'application/json',
            'apikey': self.api_key,
            'Authorization': f'Bearer {self.api_key}'
        })
    
    def start(self):
        """Start central server sync"""
        if self._running:
            return
        
        self._running = True
        
        # Start WebSocket connection in background thread
        self._ws_thread = threading.Thread(
            target=self._websocket_loop,
            name="Central-Server-Sync",
            daemon=True
        )
        self._ws_thread.start()
        
        logger.info("🌐 Central server sync started")
    
    def stop(self):
        """Stop central server sync"""
        self._running = False
        
        if self.websocket:
            asyncio.create_task(self.websocket.close())
        
        if self._ws_thread and self._ws_thread.is_alive():
            self._ws_thread.join(timeout=3.0)
        
        self.session.close()
        self.stats.websocket_connected = False
        
        logger.info("🛑 Central server sync stopped")
    
    def register_message_handler(self, message_type: str, handler: Callable):
        """Register handler for specific message types"""
        self.message_handlers[message_type] = handler
    
    def sync_telemetry_batch(self, telemetry_records: List[Dict[str, Any]]) -> bool:
        """Sync batch of telemetry records via REST API"""
        try:
            start_time = time.time()
            
            # Prepare payload
            payload = {
                'records': telemetry_records,
                'timestamp': time.time(),
                'source': 'jetson_gcs'
            }
            
            # Send to Supabase Edge Function
            response = self.session.post(
                f"{self.server_url}/functions/v1/ingest-telemetry",
                json=payload,
                timeout=10.0
            )
            
            # Update statistics
            self.stats.bytes_sent += len(json.dumps(payload).encode('utf-8'))
            self.stats.latency_ms = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                self.stats.total_syncs += 1
                self.stats.last_sync_time = time.time()
                logger.debug(f"✅ Synced {len(telemetry_records)} telemetry records")
                return True
            else:
                self.stats.failed_syncs += 1
                logger.error(f"❌ Sync failed: {response.status_code} {response.text}")
                return False
                
        except Exception as e:
            self.stats.failed_syncs += 1
            logger.error(f"❌ Telemetry sync error: {e}")
            return False
    
    def send_drone_status(self, drone_id: str, status_data: Dict[str, Any]) -> bool:
        """Send drone status update"""
        try:
            payload = {
                'drone_id': drone_id,
                'status': status_data,
                'timestamp': time.time()
            }
            
            response = self.session.post(
                f"{self.server_url}/rest/v1/drones",
                json=payload,
                timeout=5.0
            )
            
            return response.status_code in [200, 201]
            
        except Exception as e:
            logger.error(f"❌ Drone status update error: {e}")
            return False
    
    def get_mission_updates(self, drone_id: str) -> Optional[List[Dict[str, Any]]]:
        """Get mission updates from central server"""
        try:
            response = self.session.get(
                f"{self.server_url}/rest/v1/missions_extended",
                params={'org_id': 'eq.your-org-id'},  # Replace with actual org ID
                timeout=5.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"❌ Mission fetch failed: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Mission fetch error: {e}")
            return None
    
    def _websocket_loop(self):
        """WebSocket connection loop"""
        while self._running:
            try:
                asyncio.run(self._websocket_handler())
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                self.stats.websocket_connected = False
                time.sleep(5.0)  # Wait before reconnect
    
    async def _websocket_handler(self):
        """Handle WebSocket connection"""
        try:
            async with websockets.connect(
                self.websocket_url,
                extra_headers={'apikey': self.api_key}
            ) as websocket:
                
                self.websocket = websocket
                self.stats.websocket_connected = True
                logger.info("🔗 WebSocket connected to central server")
                
                # Send join message
                await self._join_realtime_channel()
                
                # Listen for messages
                async for message in websocket:
                    await self._handle_websocket_message(message)
                    
        except Exception as e:
            logger.error(f"WebSocket handler error: {e}")
            self.stats.websocket_connected = False
    
    async def _join_realtime_channel(self):
        """Join realtime channels for drone data"""
        join_message = {
            "topic": "realtime:drones",
            "event": "phx_join",
            "payload": {},
            "ref": str(int(time.time()))
        }
        
        await self.websocket.send(json.dumps(join_message))
        logger.debug("📡 Joined realtime drone channel")
    
    async def _handle_websocket_message(self, message: str):
        """Handle incoming WebSocket message"""
        try:
            data = json.loads(message)
            event_type = data.get('event', '')
            payload = data.get('payload', {})
            
            # Update stats
            self.stats.bytes_received += len(message.encode('utf-8'))
            
            # Call registered handlers
            if event_type in self.message_handlers:
                self.message_handlers[event_type](payload)
            
            # Handle specific events
            if event_type == 'postgres_changes':
                await self._handle_database_change(payload)
            elif event_type == 'system':
                await self._handle_system_message(payload)
                
        except Exception as e:
            logger.error(f"WebSocket message handling error: {e}")
    
    async def _handle_database_change(self, payload: Dict[str, Any]):
        """Handle database change notifications"""
        table = payload.get('table', '')
        event_type = payload.get('eventType', '')
        record = payload.get('new', payload.get('old', {}))
        
        logger.debug(f"📊 Database change: {table}.{event_type}")
        
        # Handle mission updates
        if table == 'missions_extended' and event_type in ['INSERT', 'UPDATE']:
            # Notify local mission service about updates
            logger.info(f"🎯 Mission update received: {record.get('id', 'unknown')}")
    
    async def _handle_system_message(self, payload: Dict[str, Any]):
        """Handle system messages"""
        message_type = payload.get('type', '')
        
        if message_type == 'ping':
            # Respond to ping
            pong_message = {
                "topic": "realtime:system",
                "event": "pong",
                "payload": {"timestamp": time.time()},
                "ref": str(int(time.time()))
            }
            await self.websocket.send(json.dumps(pong_message))
    
    def send_realtime_update(self, channel: str, event: str, data: Dict[str, Any]) -> bool:
        """Send real-time update via WebSocket"""
        if not self.stats.websocket_connected or not self.websocket:
            return False
        
        try:
            message = {
                "topic": f"realtime:{channel}",
                "event": event,
                "payload": data,
                "ref": str(int(time.time()))
            }
            
            # Send async
            asyncio.create_task(self.websocket.send(json.dumps(message)))
            return True
            
        except Exception as e:
            logger.error(f"Real-time send error: {e}")
            return False
    
    def get_sync_stats(self) -> Dict[str, Any]:
        """Get synchronization statistics"""
        return SerializationUtils.add_timestamp(self.stats.to_dict())
    
    def health_check(self) -> Dict[str, Any]:
        """Check connection health"""
        try:
            response = self.session.get(
                f"{self.server_url}/rest/v1/",
                timeout=3.0
            )
            
            api_healthy = response.status_code == 200
            
        except:
            api_healthy = False
        
        return {
            'api_healthy': api_healthy,
            'websocket_connected': self.stats.websocket_connected,
            'last_sync_age_seconds': time.time() - self.stats.last_sync_time,
            'total_syncs': self.stats.total_syncs,
            'failed_syncs': self.stats.failed_syncs,
            'timestamp': time.time()
        }


# Singleton instance
central_server_sync = CentralServerSync()