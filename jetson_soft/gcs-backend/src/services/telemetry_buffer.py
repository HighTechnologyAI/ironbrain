"""
Telemetry Buffer Service - Store-and-Forward Telemetry Management
Handles telemetry buffering, persistence, and sync with central server
"""

import time
import json
import threading
import logging
from typing import Dict, Any, List, Optional, Deque
from collections import deque
from dataclasses import dataclass, asdict
from pathlib import Path

from ..utils.serialization import SerializationUtils

logger = logging.getLogger(__name__)


@dataclass
class TelemetryRecord:
    """Single telemetry record"""
    timestamp: float
    drone_id: str
    data: Dict[str, Any]
    synced: bool = False
    retry_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class BufferStats:
    """Buffer statistics"""
    total_records: int = 0
    pending_sync: int = 0
    failed_sync: int = 0
    last_sync_time: float = 0
    sync_failures: int = 0
    buffer_size_mb: float = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class TelemetryBuffer:
    """
    Store-and-forward telemetry buffer with persistence
    Handles connection loss gracefully
    """
    
    def __init__(self, 
                 max_memory_records: int = 1000,
                 max_file_records: int = 10000,
                 buffer_file: str = "/tmp/telemetry_buffer.json",
                 sync_interval: float = 5.0):
        
        # Configuration
        self.max_memory_records = max_memory_records
        self.max_file_records = max_file_records
        self.buffer_file = Path(buffer_file)
        self.sync_interval = sync_interval
        
        # Buffer storage
        self.memory_buffer: Deque[TelemetryRecord] = deque(maxlen=max_memory_records)
        self.failed_buffer: Deque[TelemetryRecord] = deque(maxlen=100)
        
        # Threading
        self._lock = threading.RLock()
        self._sync_thread: Optional[threading.Thread] = None
        self._running = False
        
        # Statistics
        self.stats = BufferStats()
        
        # Persistence
        self._load_from_file()
        
        # Start background sync
        self.start()
    
    def start(self):
        """Start background synchronization"""
        if self._running:
            return
        
        self._running = True
        self._sync_thread = threading.Thread(
            target=self._sync_loop,
            name="Telemetry-Sync-Loop",
            daemon=True
        )
        self._sync_thread.start()
        logger.info("📡 Telemetry buffer service started")
    
    def stop(self):
        """Stop background synchronization"""
        self._running = False
        
        if self._sync_thread and self._sync_thread.is_alive():
            self._sync_thread.join(timeout=3.0)
        
        self._save_to_file()
        logger.info("🛑 Telemetry buffer service stopped")
    
    def add_telemetry(self, drone_id: str, telemetry_data: Dict[str, Any]):
        """Add telemetry record to buffer"""
        record = TelemetryRecord(
            timestamp=time.time(),
            drone_id=drone_id,
            data=SerializationUtils.sanitize_telemetry(telemetry_data)
        )
        
        with self._lock:
            self.memory_buffer.append(record)
            self.stats.total_records += 1
            self.stats.pending_sync += 1
        
        logger.debug(f"📊 Telemetry added for drone {drone_id}")
    
    def get_latest_telemetry(self, drone_id: Optional[str] = None, count: int = 10) -> List[Dict[str, Any]]:
        """Get latest telemetry records"""
        with self._lock:
            records = list(self.memory_buffer)
            
            if drone_id:
                records = [r for r in records if r.drone_id == drone_id]
            
            # Return most recent records
            latest = records[-count:] if len(records) > count else records
            return [r.to_dict() for r in latest]
    
    def get_pending_records(self, max_count: int = 50) -> List[TelemetryRecord]:
        """Get records pending synchronization"""
        with self._lock:
            pending = [r for r in self.memory_buffer if not r.synced]
            return pending[:max_count]
    
    def mark_synced(self, records: List[TelemetryRecord]):
        """Mark records as successfully synced"""
        with self._lock:
            synced_count = 0
            for record in records:
                if not record.synced:
                    record.synced = True
                    synced_count += 1
            
            self.stats.pending_sync = max(0, self.stats.pending_sync - synced_count)
            self.stats.last_sync_time = time.time()
        
        logger.debug(f"✅ Marked {synced_count} records as synced")
    
    def mark_failed(self, records: List[TelemetryRecord]):
        """Mark records as failed to sync"""
        with self._lock:
            for record in records:
                record.retry_count += 1
                
                # Move to failed buffer if too many retries
                if record.retry_count >= 3:
                    self.failed_buffer.append(record)
                    try:
                        self.memory_buffer.remove(record)
                        self.stats.failed_sync += 1
                        self.stats.pending_sync = max(0, self.stats.pending_sync - 1)
                    except ValueError:
                        pass  # Record already removed
            
            self.stats.sync_failures += 1
        
        logger.warning(f"❌ Marked {len(records)} records as failed")
    
    def retry_failed_records(self) -> List[TelemetryRecord]:
        """Get failed records for retry"""
        with self._lock:
            # Reset retry count and move back to main buffer
            retry_records = []
            while self.failed_buffer and len(retry_records) < 10:
                record = self.failed_buffer.popleft()
                record.retry_count = 0
                record.synced = False
                self.memory_buffer.append(record)
                retry_records.append(record)
                
                self.stats.failed_sync = max(0, self.stats.failed_sync - 1)
                self.stats.pending_sync += 1
            
            return retry_records
    
    def _sync_loop(self):
        """Background synchronization loop"""
        while self._running:
            try:
                self._attempt_sync()
                
                # Update buffer statistics
                self._update_stats()
                
                # Periodic cleanup
                self._cleanup_old_records()
                
                # Save to file periodically
                if self.stats.total_records % 100 == 0:
                    self._save_to_file()
                
            except Exception as e:
                logger.error(f"Sync loop error: {e}")
            
            time.sleep(self.sync_interval)
    
    def _attempt_sync(self):
        """Attempt to sync pending records"""
        pending_records = self.get_pending_records()
        
        if not pending_records:
            return
        
        # Simulate sync to central server (replace with actual implementation)
        success = self._sync_to_central_server(pending_records)
        
        if success:
            self.mark_synced(pending_records)
        else:
            self.mark_failed(pending_records)
            
            # Retry some failed records
            retry_records = self.retry_failed_records()
            if retry_records:
                logger.info(f"🔄 Retrying {len(retry_records)} failed records")
    
    def _sync_to_central_server(self, records: List[TelemetryRecord]) -> bool:
        """
        Sync records to central server (Supabase)
        Replace this with actual implementation
        """
        try:
            # This would be actual sync logic to Supabase
            # For now, simulate success/failure
            sync_data = [r.to_dict() for r in records]
            
            # Simulate network condition
            import random
            success_rate = 0.9  # 90% success rate
            return random.random() < success_rate
            
        except Exception as e:
            logger.error(f"Central server sync error: {e}")
            return False
    
    def _update_stats(self):
        """Update buffer statistics"""
        with self._lock:
            self.stats.pending_sync = len([r for r in self.memory_buffer if not r.synced])
            self.stats.failed_sync = len(self.failed_buffer)
            
            # Calculate buffer size
            total_size = 0
            for record in self.memory_buffer:
                total_size += len(json.dumps(record.to_dict()).encode('utf-8'))
            
            self.stats.buffer_size_mb = total_size / (1024 * 1024)
    
    def _cleanup_old_records(self):
        """Remove old synced records to save memory"""
        with self._lock:
            # Remove synced records older than 1 hour
            cutoff_time = time.time() - 3600
            
            to_remove = []
            for record in self.memory_buffer:
                if record.synced and record.timestamp < cutoff_time:
                    to_remove.append(record)
            
            for record in to_remove:
                try:
                    self.memory_buffer.remove(record)
                except ValueError:
                    pass
    
    def _save_to_file(self):
        """Save buffer to file for persistence"""
        try:
            with self._lock:
                buffer_data = {
                    'memory_buffer': [r.to_dict() for r in self.memory_buffer],
                    'failed_buffer': [r.to_dict() for r in self.failed_buffer],
                    'stats': self.stats.to_dict(),
                    'saved_at': time.time()
                }
            
            with open(self.buffer_file, 'w') as f:
                json.dump(buffer_data, f)
            
            logger.debug(f"💾 Buffer saved to {self.buffer_file}")
            
        except Exception as e:
            logger.error(f"Failed to save buffer: {e}")
    
    def _load_from_file(self):
        """Load buffer from file"""
        if not self.buffer_file.exists():
            return
        
        try:
            with open(self.buffer_file, 'r') as f:
                buffer_data = json.load(f)
            
            # Restore buffers
            for record_data in buffer_data.get('memory_buffer', []):
                record = TelemetryRecord(**record_data)
                self.memory_buffer.append(record)
            
            for record_data in buffer_data.get('failed_buffer', []):
                record = TelemetryRecord(**record_data)
                self.failed_buffer.append(record)
            
            # Restore stats
            stats_data = buffer_data.get('stats', {})
            for key, value in stats_data.items():
                if hasattr(self.stats, key):
                    setattr(self.stats, key, value)
            
            logger.info(f"📂 Buffer loaded from {self.buffer_file}")
            
        except Exception as e:
            logger.error(f"Failed to load buffer: {e}")
    
    def get_buffer_stats(self) -> Dict[str, Any]:
        """Get buffer statistics"""
        return SerializationUtils.add_timestamp(self.stats.to_dict())
    
    def clear_buffer(self):
        """Clear all buffer data"""
        with self._lock:
            self.memory_buffer.clear()
            self.failed_buffer.clear()
            self.stats = BufferStats()
        
        logger.info("🗑️ Telemetry buffer cleared")


# Singleton instance
telemetry_buffer = TelemetryBuffer()