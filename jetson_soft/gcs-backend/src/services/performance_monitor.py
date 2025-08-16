"""
Performance Monitor Service for Jetson Nano
Real-time system monitoring with automatic optimization

Features:
- CPU, memory, temperature monitoring
- Automatic performance scaling
- Resource usage alerts
- System optimization recommendations
"""

import os
import time
import threading
import logging
import subprocess
import psutil
from typing import Dict, Any, Optional, Callable, List
from dataclasses import dataclass, asdict
from collections import deque
import json

logger = logging.getLogger(__name__)

@dataclass
class SystemStats:
    """System performance statistics"""
    timestamp: float = 0.0
    
    # CPU metrics
    cpu_percent: float = 0.0
    cpu_freq_mhz: float = 0.0
    cpu_temp_c: float = 0.0
    cpu_cores: int = 4
    
    # Memory metrics
    memory_percent: float = 0.0
    memory_used_mb: float = 0.0
    memory_total_mb: float = 0.0
    memory_available_mb: float = 0.0
    
    # Storage metrics
    storage_percent: float = 0.0
    storage_used_gb: float = 0.0
    storage_total_gb: float = 0.0
    storage_available_gb: float = 0.0
    
    # Network metrics
    network_sent_mb: float = 0.0
    network_recv_mb: float = 0.0
    
    # GPU metrics (Jetson specific)
    gpu_usage_percent: float = 0.0
    gpu_memory_used_mb: float = 0.0
    gpu_memory_total_mb: float = 0.0
    
    # System load
    load_1min: float = 0.0
    load_5min: float = 0.0
    load_15min: float = 0.0
    
    # Process count
    process_count: int = 0
    thread_count: int = 0

@dataclass
class PerformanceAlert:
    """Performance alert data"""
    timestamp: float
    level: str  # 'info', 'warning', 'critical'
    category: str  # 'cpu', 'memory', 'temperature', 'storage'
    message: str
    value: float
    threshold: float

class PerformanceMonitor:
    """
    Advanced performance monitor for Jetson Nano
    - Real-time system monitoring
    - Automatic optimization
    - Performance alerts
    - Resource management
    """
    
    def __init__(self):
        self.is_running = False
        self.monitor_thread = None
        self.optimization_thread = None
        
        # Current stats
        self.current_stats = SystemStats()
        self.stats_history = deque(maxlen=300)  # 5 minutes at 1Hz
        
        # Performance thresholds
        self.thresholds = {
            'cpu_warning': 70.0,
            'cpu_critical': 85.0,
            'memory_warning': 75.0,
            'memory_critical': 90.0,
            'temp_warning': 70.0,
            'temp_critical': 80.0,
            'storage_warning': 80.0,
            'storage_critical': 95.0
        }
        
        # Alerts
        self.alerts = deque(maxlen=100)
        self.alert_callbacks = []
        
        # Settings
        self.settings = {
            'monitor_interval': 1.0,  # seconds
            'optimization_interval': 30.0,  # seconds
            'auto_optimization': True,
            'alert_enabled': True,
            'history_size': 300
        }
        
        # Jetson-specific detection
        self.jetson_info = self._detect_jetson_hardware()
        self.optimization_enabled = self.jetson_info['is_jetson']
        
        # Performance optimization state
        self.optimization_state = {
            'cpu_governor': 'performance',
            'gpu_freq_locked': False,
            'memory_optimized': False,
            'swap_disabled': False
        }
        
        logger.info("🔍 Performance Monitor initialized for Jetson Nano")
    
    def _detect_jetson_hardware(self) -> Dict[str, Any]:
        """Detect Jetson Nano hardware capabilities"""
        info = {
            'is_jetson': False,
            'model': 'unknown',
            'cuda_available': False,
            'tegrastats_available': False,
            'nvpmodel_available': False
        }
        
        try:
            # Check if running on Jetson
            if os.path.exists('/proc/device-tree/model'):
                with open('/proc/device-tree/model', 'r') as f:
                    model = f.read().strip()
                    if 'jetson' in model.lower():
                        info['is_jetson'] = True
                        info['model'] = model
            
            # Check for tegrastats (Jetson monitoring tool)
            try:
                result = subprocess.run(['tegrastats', '--help'], 
                                      capture_output=True, timeout=2)
                info['tegrastats_available'] = result.returncode == 0
            except:
                pass
            
            # Check for nvpmodel (power management)
            try:
                result = subprocess.run(['nvpmodel', '-q'], 
                                      capture_output=True, timeout=2)
                info['nvpmodel_available'] = result.returncode == 0
            except:
                pass
            
            # Check CUDA
            try:
                result = subprocess.run(['nvcc', '--version'], 
                                      capture_output=True, timeout=2)
                info['cuda_available'] = result.returncode == 0
            except:
                pass
                
        except Exception as e:
            logger.warning(f"Hardware detection error: {e}")
        
        logger.info(f"Jetson hardware info: {info}")
        return info
    
    def add_alert_callback(self, callback: Callable[[PerformanceAlert], None]):
        """Add callback for performance alerts"""
        self.alert_callbacks.append(callback)
    
    def start(self):
        """Start performance monitoring"""
        if self.is_running:
            return
        
        logger.info("🚀 Starting performance monitor")
        
        self.is_running = True
        
        # Start monitoring thread
        self.monitor_thread = threading.Thread(
            target=self._monitor_loop,
            name="PerformanceMonitor",
            daemon=True
        )
        self.monitor_thread.start()
        
        # Start optimization thread if enabled
        if self.optimization_enabled and self.settings['auto_optimization']:
            self.optimization_thread = threading.Thread(
                target=self._optimization_loop,
                name="PerformanceOptimizer",
                daemon=True
            )
            self.optimization_thread.start()
        
        logger.info("✅ Performance monitor started")
    
    def stop(self):
        """Stop performance monitoring"""
        if not self.is_running:
            return
        
        logger.info("🛑 Stopping performance monitor")
        
        self.is_running = False
        
        # Wait for threads to finish
        if self.monitor_thread and self.monitor_thread.is_alive():
            self.monitor_thread.join(timeout=3.0)
        
        if self.optimization_thread and self.optimization_thread.is_alive():
            self.optimization_thread.join(timeout=3.0)
        
        logger.info("✅ Performance monitor stopped")
    
    def _monitor_loop(self):
        """Main monitoring loop"""
        logger.info("🔄 Starting monitoring loop")
        
        while self.is_running:
            try:
                start_time = time.time()
                
                # Collect system stats
                self._collect_system_stats()
                
                # Check for alerts
                if self.settings['alert_enabled']:
                    self._check_alerts()
                
                # Add to history
                self.stats_history.append(self.current_stats.to_dict())
                
                # Rate limiting
                elapsed = time.time() - start_time
                sleep_time = max(0, self.settings['monitor_interval'] - elapsed)
                if sleep_time > 0:
                    time.sleep(sleep_time)
                
            except Exception as e:
                logger.error(f"❌ Monitor loop error: {e}")
                time.sleep(1.0)
    
    def _optimization_loop(self):
        """Automatic optimization loop"""
        logger.info("⚡ Starting optimization loop")
        
        while self.is_running:
            try:
                # Apply optimizations based on current load
                self._apply_optimizations()
                
                # Sleep until next optimization cycle
                time.sleep(self.settings['optimization_interval'])
                
            except Exception as e:
                logger.error(f"❌ Optimization loop error: {e}")
                time.sleep(10.0)
    
    def _collect_system_stats(self):
        """Collect comprehensive system statistics"""
        current_time = time.time()
        
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=None)
            cpu_freq = psutil.cpu_freq()
            cpu_temp = self._get_cpu_temperature()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            
            # Storage metrics
            storage = psutil.disk_usage('/')
            
            # Network metrics
            network = psutil.net_io_counters()
            
            # System load
            load_avg = os.getloadavg()
            
            # Process metrics
            process_count = len(psutil.pids())
            
            # GPU metrics (Jetson specific)
            gpu_stats = self._get_gpu_stats()
            
            # Update current stats
            self.current_stats = SystemStats(
                timestamp=current_time,
                
                # CPU
                cpu_percent=cpu_percent,
                cpu_freq_mhz=cpu_freq.current if cpu_freq else 0.0,
                cpu_temp_c=cpu_temp,
                cpu_cores=psutil.cpu_count(),
                
                # Memory
                memory_percent=memory.percent,
                memory_used_mb=memory.used / 1024 / 1024,
                memory_total_mb=memory.total / 1024 / 1024,
                memory_available_mb=memory.available / 1024 / 1024,
                
                # Storage
                storage_percent=(storage.used / storage.total) * 100,
                storage_used_gb=storage.used / 1024 / 1024 / 1024,
                storage_total_gb=storage.total / 1024 / 1024 / 1024,
                storage_available_gb=storage.free / 1024 / 1024 / 1024,
                
                # Network
                network_sent_mb=network.bytes_sent / 1024 / 1024,
                network_recv_mb=network.bytes_recv / 1024 / 1024,
                
                # GPU
                gpu_usage_percent=gpu_stats.get('usage', 0.0),
                gpu_memory_used_mb=gpu_stats.get('memory_used', 0.0),
                gpu_memory_total_mb=gpu_stats.get('memory_total', 0.0),
                
                # System load
                load_1min=load_avg[0],
                load_5min=load_avg[1],
                load_15min=load_avg[2],
                
                # Processes
                process_count=process_count,
                thread_count=threading.active_count()
            )
            
        except Exception as e:
            logger.error(f"❌ Error collecting system stats: {e}")
    
    def _get_cpu_temperature(self) -> float:
        """Get CPU temperature (Jetson specific)"""
        try:
            # Try Jetson thermal zones first
            thermal_paths = [
                '/sys/class/thermal/thermal_zone0/temp',
                '/sys/class/thermal/thermal_zone1/temp',
                '/sys/devices/virtual/thermal/thermal_zone0/temp'
            ]
            
            for path in thermal_paths:
                if os.path.exists(path):
                    with open(path, 'r') as f:
                        temp_millicelsius = int(f.read().strip())
                        return temp_millicelsius / 1000.0
            
            # Fallback to psutil
            temps = psutil.sensors_temperatures()
            if temps:
                for name, entries in temps.items():
                    if entries:
                        return entries[0].current
            
            return 0.0
            
        except Exception as e:
            logger.warning(f"Could not read temperature: {e}")
            return 0.0
    
    def _get_gpu_stats(self) -> Dict[str, float]:
        """Get GPU statistics (Jetson specific)"""
        stats = {
            'usage': 0.0,
            'memory_used': 0.0,
            'memory_total': 0.0
        }
        
        try:
            if self.jetson_info['tegrastats_available']:
                # Use tegrastats for Jetson GPU info
                result = subprocess.run(['tegrastats', '--interval', '100'], 
                                      capture_output=True, text=True, timeout=1)
                
                if result.returncode == 0:
                    # Parse tegrastats output
                    # Format: RAM 1234/4096MB (lfb 123x4MB) IRAM 0/252kB(lfb 252kB) CPU [25%@1479,off,off,25%@1479] EMC_FREQ 0% GR3D_FREQ 0% PLL@45C CPU@46.5C PMIC@100C GPU@45C AO@52C thermal@46.25C POM_5V_IN 2633/2633 POM_5V_GPU 123/123 POM_5V_CPU 456/456
                    output = result.stdout.strip()
                    
                    # Extract GPU frequency (GR3D_FREQ)
                    if 'GR3D_FREQ' in output:
                        import re
                        match = re.search(r'GR3D_FREQ (\d+)%', output)
                        if match:
                            stats['usage'] = float(match.group(1))
            
            # Try nvidia-smi as fallback
            try:
                result = subprocess.run(['nvidia-smi', '--query-gpu=utilization.gpu,memory.used,memory.total', 
                                       '--format=csv,noheader,nounits'], 
                                      capture_output=True, text=True, timeout=2)
                
                if result.returncode == 0:
                    lines = result.stdout.strip().split('\n')
                    if lines:
                        parts = lines[0].split(', ')
                        if len(parts) >= 3:
                            stats['usage'] = float(parts[0])
                            stats['memory_used'] = float(parts[1])
                            stats['memory_total'] = float(parts[2])
            except:
                pass
                
        except Exception as e:
            logger.warning(f"Could not read GPU stats: {e}")
        
        return stats
    
    def _check_alerts(self):
        """Check for performance alerts"""
        current_time = time.time()
        stats = self.current_stats
        
        alerts_to_send = []
        
        # CPU alerts
        if stats.cpu_percent >= self.thresholds['cpu_critical']:
            alerts_to_send.append(PerformanceAlert(
                timestamp=current_time,
                level='critical',
                category='cpu',
                message=f'Critical CPU usage: {stats.cpu_percent:.1f}%',
                value=stats.cpu_percent,
                threshold=self.thresholds['cpu_critical']
            ))
        elif stats.cpu_percent >= self.thresholds['cpu_warning']:
            alerts_to_send.append(PerformanceAlert(
                timestamp=current_time,
                level='warning',
                category='cpu',
                message=f'High CPU usage: {stats.cpu_percent:.1f}%',
                value=stats.cpu_percent,
                threshold=self.thresholds['cpu_warning']
            ))
        
        # Memory alerts
        if stats.memory_percent >= self.thresholds['memory_critical']:
            alerts_to_send.append(PerformanceAlert(
                timestamp=current_time,
                level='critical',
                category='memory',
                message=f'Critical memory usage: {stats.memory_percent:.1f}%',
                value=stats.memory_percent,
                threshold=self.thresholds['memory_critical']
            ))
        elif stats.memory_percent >= self.thresholds['memory_warning']:
            alerts_to_send.append(PerformanceAlert(
                timestamp=current_time,
                level='warning',
                category='memory',
                message=f'High memory usage: {stats.memory_percent:.1f}%',
                value=stats.memory_percent,
                threshold=self.thresholds['memory_warning']
            ))
        
        # Temperature alerts
        if stats.cpu_temp_c >= self.thresholds['temp_critical']:
            alerts_to_send.append(PerformanceAlert(
                timestamp=current_time,
                level='critical',
                category='temperature',
                message=f'Critical CPU temperature: {stats.cpu_temp_c:.1f}°C',
                value=stats.cpu_temp_c,
                threshold=self.thresholds['temp_critical']
            ))
        elif stats.cpu_temp_c >= self.thresholds['temp_warning']:
            alerts_to_send.append(PerformanceAlert(
                timestamp=current_time,
                level='warning',
                category='temperature',
                message=f'High CPU temperature: {stats.cpu_temp_c:.1f}°C',
                value=stats.cpu_temp_c,
                threshold=self.thresholds['temp_warning']
            ))
        
        # Storage alerts
        if stats.storage_percent >= self.thresholds['storage_critical']:
            alerts_to_send.append(PerformanceAlert(
                timestamp=current_time,
                level='critical',
                category='storage',
                message=f'Critical storage usage: {stats.storage_percent:.1f}%',
                value=stats.storage_percent,
                threshold=self.thresholds['storage_critical']
            ))
        elif stats.storage_percent >= self.thresholds['storage_warning']:
            alerts_to_send.append(PerformanceAlert(
                timestamp=current_time,
                level='warning',
                category='storage',
                message=f'High storage usage: {stats.storage_percent:.1f}%',
                value=stats.storage_percent,
                threshold=self.thresholds['storage_warning']
            ))
        
        # Send alerts
        for alert in alerts_to_send:
            self.alerts.append(alert)
            self._notify_alert_callbacks(alert)
    
    def _notify_alert_callbacks(self, alert: PerformanceAlert):
        """Notify alert callbacks"""
        for callback in self.alert_callbacks:
            try:
                callback(alert)
            except Exception as e:
                logger.error(f"❌ Alert callback error: {e}")
    
    def _apply_optimizations(self):
        """Apply automatic performance optimizations"""
        if not self.optimization_enabled:
            return
        
        stats = self.current_stats
        
        try:
            # CPU governor optimization
            if stats.cpu_percent > 80 and self.optimization_state['cpu_governor'] != 'performance':
                self._set_cpu_governor('performance')
                self.optimization_state['cpu_governor'] = 'performance'
                logger.info("⚡ Switched to performance CPU governor")
            elif stats.cpu_percent < 30 and self.optimization_state['cpu_governor'] != 'powersave':
                self._set_cpu_governor('powersave')
                self.optimization_state['cpu_governor'] = 'powersave'
                logger.info("🔋 Switched to powersave CPU governor")
            
            # Memory optimization
            if stats.memory_percent > 85 and not self.optimization_state['memory_optimized']:
                self._optimize_memory()
                self.optimization_state['memory_optimized'] = True
                logger.info("💾 Applied memory optimizations")
            
            # GPU frequency optimization (Jetson specific)
            if (stats.gpu_usage_percent > 70 and 
                not self.optimization_state['gpu_freq_locked'] and
                self.jetson_info['is_jetson']):
                self._lock_gpu_frequency()
                self.optimization_state['gpu_freq_locked'] = True
                logger.info("🎮 Locked GPU frequency for performance")
            
        except Exception as e:
            logger.error(f"❌ Optimization error: {e}")
    
    def _set_cpu_governor(self, governor: str):
        """Set CPU frequency governor"""
        try:
            for cpu in range(psutil.cpu_count()):
                governor_path = f'/sys/devices/system/cpu/cpu{cpu}/cpufreq/scaling_governor'
                if os.path.exists(governor_path):
                    subprocess.run(['sudo', 'sh', '-c', f'echo {governor} > {governor_path}'], 
                                 check=True, timeout=5)
        except Exception as e:
            logger.warning(f"Could not set CPU governor: {e}")
    
    def _optimize_memory(self):
        """Apply memory optimizations"""
        try:
            # Force garbage collection
            import gc
            gc.collect()
            
            # Drop caches (requires root)
            try:
                subprocess.run(['sudo', 'sh', '-c', 'echo 3 > /proc/sys/vm/drop_caches'], 
                             timeout=5)
            except:
                pass
            
            # Compact memory
            try:
                subprocess.run(['sudo', 'sh', '-c', 'echo 1 > /proc/sys/vm/compact_memory'], 
                             timeout=5)
            except:
                pass
                
        except Exception as e:
            logger.warning(f"Memory optimization warning: {e}")
    
    def _lock_gpu_frequency(self):
        """Lock GPU frequency for consistent performance (Jetson specific)"""
        try:
            if self.jetson_info['is_jetson']:
                # Set maximum GPU frequency
                subprocess.run(['sudo', 'sh', '-c', 
                              'echo 1 > /sys/devices/gpu.0/devfreq/57000000.gpu/userspace/set_freq'], 
                             timeout=5)
        except Exception as e:
            logger.warning(f"Could not lock GPU frequency: {e}")
    
    def get_current_stats(self) -> Dict[str, Any]:
        """Get current system statistics"""
        return self.current_stats.to_dict()
    
    def get_stats_history(self, count: int = 60) -> List[Dict[str, Any]]:
        """Get statistics history"""
        return list(self.stats_history)[-count:]
    
    def get_alerts(self, count: int = 20) -> List[Dict[str, Any]]:
        """Get recent alerts"""
        return [asdict(alert) for alert in list(self.alerts)[-count:]]
    
    def get_status(self) -> Dict[str, Any]:
        """Get monitor status"""
        return {
            'running': self.is_running,
            'jetson_info': self.jetson_info,
            'optimization_enabled': self.optimization_enabled,
            'optimization_state': self.optimization_state,
            'settings': self.settings,
            'thresholds': self.thresholds,
            'stats_history_size': len(self.stats_history),
            'alerts_count': len(self.alerts)
        }
    
    def update_settings(self, settings: Dict[str, Any]) -> bool:
        """Update monitor settings"""
        try:
            for key, value in settings.items():
                if key in self.settings:
                    self.settings[key] = value
                    logger.info(f"📝 Updated monitor setting: {key} = {value}")
                elif key in self.thresholds:
                    self.thresholds[key] = value
                    logger.info(f"📝 Updated threshold: {key} = {value}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to update settings: {e}")
            return False
    
    def optimize_system(self) -> Dict[str, Any]:
        """Manually trigger system optimization"""
        results = {
            'success': False,
            'optimizations_applied': [],
            'errors': []
        }
        
        try:
            logger.info("🔧 Manual system optimization triggered")
            
            # Apply all available optimizations
            optimizations = [
                ('cpu_governor', self._set_cpu_governor, 'performance'),
                ('memory_cleanup', self._optimize_memory, None),
                ('gpu_frequency', self._lock_gpu_frequency, None)
            ]
            
            for name, func, arg in optimizations:
                try:
                    if arg:
                        func(arg)
                    else:
                        func()
                    results['optimizations_applied'].append(name)
                except Exception as e:
                    results['errors'].append(f"{name}: {str(e)}")
            
            results['success'] = len(results['optimizations_applied']) > 0
            logger.info(f"✅ Optimization complete: {len(results['optimizations_applied'])} applied")
            
        except Exception as e:
            logger.error(f"❌ Manual optimization failed: {e}")
            results['errors'].append(str(e))
        
        return results
    
    def __del__(self):
        """Cleanup on destruction"""
        self.stop()

