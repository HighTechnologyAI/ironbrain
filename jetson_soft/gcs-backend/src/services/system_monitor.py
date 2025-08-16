"""
System Monitor Service for Jetson Nano
Real-time monitoring of system resources and performance

Features:
- CPU, Memory, GPU monitoring
- Temperature monitoring
- Network statistics
- Storage usage
- Performance optimization alerts
"""

import os
import time
import psutil
import logging
import threading
import subprocess
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

@dataclass
class SystemStats:
    """System statistics data structure"""
    timestamp: float
    
    # CPU metrics
    cpu_percent: float = 0.0
    cpu_freq_mhz: float = 0.0
    cpu_temp_c: float = 0.0
    cpu_cores: int = 4
    
    # Memory metrics
    memory_total_mb: float = 0.0
    memory_used_mb: float = 0.0
    memory_percent: float = 0.0
    memory_available_mb: float = 0.0
    swap_total_mb: float = 0.0
    swap_used_mb: float = 0.0
    swap_percent: float = 0.0
    
    # GPU metrics (Jetson specific)
    gpu_percent: float = 0.0
    gpu_freq_mhz: float = 0.0
    gpu_temp_c: float = 0.0
    gpu_memory_used_mb: float = 0.0
    gpu_memory_total_mb: float = 0.0
    
    # Storage metrics
    storage_total_gb: float = 0.0
    storage_used_gb: float = 0.0
    storage_percent: float = 0.0
    storage_available_gb: float = 0.0
    
    # Network metrics
    network_sent_mb: float = 0.0
    network_recv_mb: float = 0.0
    network_sent_rate_mbps: float = 0.0
    network_recv_rate_mbps: float = 0.0
    
    # Power metrics (Jetson specific)
    power_draw_w: float = 0.0
    power_mode: str = "UNKNOWN"
    
    # System info
    uptime_seconds: float = 0.0
    load_average: float = 0.0
    processes_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

class SystemMonitor:
    """
    System monitoring service optimized for Jetson Nano
    Provides real-time system metrics with minimal overhead
    """
    
    def __init__(self):
        self.is_monitoring = False
        self.monitor_thread = None
        self.stats = SystemStats(timestamp=time.time())
        
        # Monitoring settings
        self.settings = {
            'update_interval': 1.0,  # seconds
            'history_size': 300,     # keep 5 minutes of history
            'enable_gpu_monitoring': True,
            'enable_thermal_monitoring': True,
            'enable_power_monitoring': True
        }
        
        # Performance thresholds
        self.thresholds = {
            'cpu_warning': 80.0,      # %
            'cpu_critical': 95.0,     # %
            'memory_warning': 80.0,   # %
            'memory_critical': 95.0,  # %
            'temp_warning': 70.0,     # °C
            'temp_critical': 85.0,    # °C
            'storage_warning': 80.0,  # %
            'storage_critical': 95.0  # %
        }
        
        # History for rate calculations
        self.history = []
        self.last_network_stats = None
        
        # Jetson-specific paths
        self.jetson_paths = {
            'cpu_temp': '/sys/class/thermal/thermal_zone0/temp',
            'gpu_temp': '/sys/class/thermal/thermal_zone1/temp',
            'gpu_freq': '/sys/kernel/debug/clk/gbus/clk_rate',
            'power_mode': '/sys/kernel/debug/tegra_pm_domains/gpu/state',
            'gpu_load': '/sys/devices/gpu.0/load'
        }
        
        # Check if running on Jetson
        self.is_jetson = self._detect_jetson()
        
        logger.info(f"🔍 System Monitor initialized (Jetson: {self.is_jetson})")
    
    def _detect_jetson(self) -> bool:
        """Detect if running on Jetson Nano"""
        try:
            with open('/proc/device-tree/model', 'r') as f:
                model = f.read().strip()
                return 'jetson' in model.lower() or 'tegra' in model.lower()
        except:
            return False
    
    def start_monitoring(self):
        """Start system monitoring"""
        if self.is_monitoring:
            return
        
        self.is_monitoring = True
        self.monitor_thread = threading.Thread(
            target=self._monitoring_loop,
            name="System-Monitor",
            daemon=True
        )
        self.monitor_thread.start()
        
        logger.info("📊 System monitoring started")
    
    def stop_monitoring(self):
        """Stop system monitoring"""
        self.is_monitoring = False
        
        if self.monitor_thread and self.monitor_thread.is_alive():
            self.monitor_thread.join(timeout=3.0)
        
        logger.info("🛑 System monitoring stopped")
    
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.is_monitoring:
            try:
                start_time = time.time()
                
                # Collect system metrics
                self._collect_cpu_metrics()
                self._collect_memory_metrics()
                self._collect_storage_metrics()
                self._collect_network_metrics()
                
                if self.is_jetson:
                    self._collect_jetson_metrics()
                
                self._collect_system_info()
                
                # Update timestamp
                self.stats.timestamp = time.time()
                
                # Add to history
                self._update_history()
                
                # Check for alerts
                self._check_thresholds()
                
                # Sleep for remaining time
                elapsed = time.time() - start_time
                sleep_time = max(0, self.settings['update_interval'] - elapsed)
                time.sleep(sleep_time)
                
            except Exception as e:
                logger.error(f"❌ Error in monitoring loop: {e}")
                time.sleep(self.settings['update_interval'])
    
    def _collect_cpu_metrics(self):
        """Collect CPU metrics"""
        try:
            # CPU usage
            self.stats.cpu_percent = psutil.cpu_percent(interval=None)
            
            # CPU frequency
            cpu_freq = psutil.cpu_freq()
            if cpu_freq:
                self.stats.cpu_freq_mhz = cpu_freq.current
            
            # CPU temperature
            if self.is_jetson:
                self.stats.cpu_temp_c = self._read_jetson_temp('cpu_temp')
            else:
                # Try generic thermal sensors
                try:
                    temps = psutil.sensors_temperatures()
                    if 'coretemp' in temps:
                        self.stats.cpu_temp_c = temps['coretemp'][0].current
                except:
                    pass
            
            # CPU cores
            self.stats.cpu_cores = psutil.cpu_count()
            
        except Exception as e:
            logger.debug(f"Error collecting CPU metrics: {e}")
    
    def _collect_memory_metrics(self):
        """Collect memory metrics"""
        try:
            # Physical memory
            memory = psutil.virtual_memory()
            self.stats.memory_total_mb = memory.total / 1024 / 1024
            self.stats.memory_used_mb = memory.used / 1024 / 1024
            self.stats.memory_percent = memory.percent
            self.stats.memory_available_mb = memory.available / 1024 / 1024
            
            # Swap memory
            swap = psutil.swap_memory()
            self.stats.swap_total_mb = swap.total / 1024 / 1024
            self.stats.swap_used_mb = swap.used / 1024 / 1024
            self.stats.swap_percent = swap.percent
            
        except Exception as e:
            logger.debug(f"Error collecting memory metrics: {e}")
    
    def _collect_storage_metrics(self):
        """Collect storage metrics"""
        try:
            # Root filesystem
            disk = psutil.disk_usage('/')
            self.stats.storage_total_gb = disk.total / 1024 / 1024 / 1024
            self.stats.storage_used_gb = disk.used / 1024 / 1024 / 1024
            self.stats.storage_percent = (disk.used / disk.total) * 100
            self.stats.storage_available_gb = disk.free / 1024 / 1024 / 1024
            
        except Exception as e:
            logger.debug(f"Error collecting storage metrics: {e}")
    
    def _collect_network_metrics(self):
        """Collect network metrics"""
        try:
            # Network I/O
            net_io = psutil.net_io_counters()
            
            current_sent = net_io.bytes_sent / 1024 / 1024  # MB
            current_recv = net_io.bytes_recv / 1024 / 1024  # MB
            
            self.stats.network_sent_mb = current_sent
            self.stats.network_recv_mb = current_recv
            
            # Calculate rates if we have previous data
            if self.last_network_stats:
                time_diff = time.time() - self.last_network_stats['timestamp']
                if time_diff > 0:
                    sent_diff = current_sent - self.last_network_stats['sent']
                    recv_diff = current_recv - self.last_network_stats['recv']
                    
                    self.stats.network_sent_rate_mbps = (sent_diff / time_diff) * 8  # Mbps
                    self.stats.network_recv_rate_mbps = (recv_diff / time_diff) * 8  # Mbps
            
            # Update last stats
            self.last_network_stats = {
                'timestamp': time.time(),
                'sent': current_sent,
                'recv': current_recv
            }
            
        except Exception as e:
            logger.debug(f"Error collecting network metrics: {e}")
    
    def _collect_jetson_metrics(self):
        """Collect Jetson-specific metrics"""
        try:
            # GPU temperature
            self.stats.gpu_temp_c = self._read_jetson_temp('gpu_temp')
            
            # GPU frequency
            gpu_freq = self._read_jetson_file('gpu_freq')
            if gpu_freq:
                self.stats.gpu_freq_mhz = int(gpu_freq) / 1000000  # Convert Hz to MHz
            
            # GPU load (if available)
            gpu_load = self._read_jetson_file('gpu_load')
            if gpu_load:
                self.stats.gpu_percent = float(gpu_load) / 10.0  # Convert to percentage
            
            # Power mode
            power_mode = self._read_jetson_file('power_mode')
            if power_mode:
                self.stats.power_mode = power_mode.strip()
            
            # GPU memory (estimate based on total system memory)
            # Jetson Nano shares memory between CPU and GPU
            self.stats.gpu_memory_total_mb = self.stats.memory_total_mb * 0.25  # ~25% for GPU
            self.stats.gpu_memory_used_mb = self.stats.gpu_memory_total_mb * (self.stats.gpu_percent / 100.0)
            
        except Exception as e:
            logger.debug(f"Error collecting Jetson metrics: {e}")
    
    def _collect_system_info(self):
        """Collect general system information"""
        try:
            # System uptime
            boot_time = psutil.boot_time()
            self.stats.uptime_seconds = time.time() - boot_time
            
            # Load average
            load_avg = os.getloadavg()
            self.stats.load_average = load_avg[0]  # 1-minute average
            
            # Process count
            self.stats.processes_count = len(psutil.pids())
            
        except Exception as e:
            logger.debug(f"Error collecting system info: {e}")
    
    def _read_jetson_temp(self, sensor: str) -> float:
        """Read temperature from Jetson thermal sensors"""
        try:
            path = self.jetson_paths.get(sensor)
            if path and os.path.exists(path):
                with open(path, 'r') as f:
                    temp_millic = int(f.read().strip())
                    return temp_millic / 1000.0  # Convert millicelsius to celsius
        except:
            pass
        return 0.0
    
    def _read_jetson_file(self, key: str) -> Optional[str]:
        """Read value from Jetson system file"""
        try:
            path = self.jetson_paths.get(key)
            if path and os.path.exists(path):
                with open(path, 'r') as f:
                    return f.read().strip()
        except:
            pass
        return None
    
    def _update_history(self):
        """Update statistics history"""
        self.history.append(self.stats.to_dict())
        
        # Limit history size
        if len(self.history) > self.settings['history_size']:
            self.history.pop(0)
    
    def _check_thresholds(self):
        """Check performance thresholds and log warnings"""
        # CPU warnings
        if self.stats.cpu_percent > self.thresholds['cpu_critical']:
            logger.warning(f"🔥 CRITICAL: CPU usage {self.stats.cpu_percent:.1f}%")
        elif self.stats.cpu_percent > self.thresholds['cpu_warning']:
            logger.warning(f"⚠️ WARNING: High CPU usage {self.stats.cpu_percent:.1f}%")
        
        # Memory warnings
        if self.stats.memory_percent > self.thresholds['memory_critical']:
            logger.warning(f"🔥 CRITICAL: Memory usage {self.stats.memory_percent:.1f}%")
        elif self.stats.memory_percent > self.thresholds['memory_warning']:
            logger.warning(f"⚠️ WARNING: High memory usage {self.stats.memory_percent:.1f}%")
        
        # Temperature warnings
        if self.stats.cpu_temp_c > self.thresholds['temp_critical']:
            logger.warning(f"🔥 CRITICAL: CPU temperature {self.stats.cpu_temp_c:.1f}°C")
        elif self.stats.cpu_temp_c > self.thresholds['temp_warning']:
            logger.warning(f"⚠️ WARNING: High CPU temperature {self.stats.cpu_temp_c:.1f}°C")
        
        # Storage warnings
        if self.stats.storage_percent > self.thresholds['storage_critical']:
            logger.warning(f"🔥 CRITICAL: Storage usage {self.stats.storage_percent:.1f}%")
        elif self.stats.storage_percent > self.thresholds['storage_warning']:
            logger.warning(f"⚠️ WARNING: High storage usage {self.stats.storage_percent:.1f}%")
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get current system statistics"""
        return self.stats.to_dict()
    
    def get_history(self, minutes: int = 5) -> List[Dict[str, Any]]:
        """Get historical statistics"""
        if not self.history:
            return []
        
        # Calculate how many samples to return
        samples = min(len(self.history), int(minutes * 60 / self.settings['update_interval']))
        
        return self.history[-samples:] if samples > 0 else []
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary and recommendations"""
        stats = self.stats
        
        # Performance status
        status = "good"
        issues = []
        recommendations = []
        
        # Check CPU
        if stats.cpu_percent > 80:
            status = "warning" if status == "good" else "critical"
            issues.append(f"High CPU usage: {stats.cpu_percent:.1f}%")
            recommendations.append("Consider reducing video quality or frame rate")
        
        # Check memory
        if stats.memory_percent > 80:
            status = "warning" if status == "good" else "critical"
            issues.append(f"High memory usage: {stats.memory_percent:.1f}%")
            recommendations.append("Close unnecessary applications")
        
        # Check temperature
        if stats.cpu_temp_c > 70:
            status = "warning" if status == "good" else "critical"
            issues.append(f"High temperature: {stats.cpu_temp_c:.1f}°C")
            recommendations.append("Check cooling and reduce workload")
        
        # Check storage
        if stats.storage_percent > 80:
            status = "warning" if status == "good" else "critical"
            issues.append(f"Low storage space: {stats.storage_available_gb:.1f}GB free")
            recommendations.append("Clean up log files and temporary data")
        
        return {
            'status': status,
            'issues': issues,
            'recommendations': recommendations,
            'performance_score': self._calculate_performance_score(),
            'optimization_tips': self._get_optimization_tips()
        }
    
    def _calculate_performance_score(self) -> int:
        """Calculate overall performance score (0-100)"""
        score = 100
        
        # Deduct points for high resource usage
        score -= max(0, self.stats.cpu_percent - 50) * 0.5
        score -= max(0, self.stats.memory_percent - 50) * 0.5
        score -= max(0, self.stats.cpu_temp_c - 50) * 0.3
        score -= max(0, self.stats.storage_percent - 70) * 0.2
        
        return max(0, int(score))
    
    def _get_optimization_tips(self) -> List[str]:
        """Get optimization tips for Jetson Nano"""
        tips = []
        
        if self.stats.memory_percent > 70:
            tips.append("Enable zram swap for better memory management")
            tips.append("Reduce video buffer sizes")
        
        if self.stats.cpu_percent > 70:
            tips.append("Use hardware video acceleration")
            tips.append("Optimize React component rendering")
        
        if self.stats.cpu_temp_c > 60:
            tips.append("Ensure adequate cooling")
            tips.append("Consider reducing CPU frequency")
        
        if self.stats.storage_percent > 80:
            tips.append("Enable log rotation")
            tips.append("Move large files to external storage")
        
        return tips
    
    def optimize_system(self) -> Dict[str, Any]:
        """Perform automatic system optimization"""
        optimizations = []
        
        try:
            # Clear system caches
            if self.stats.memory_percent > 80:
                os.system("sync && echo 3 > /proc/sys/vm/drop_caches")
                optimizations.append("Cleared system caches")
            
            # Adjust CPU governor for performance
            if self.stats.cpu_percent > 80:
                try:
                    subprocess.run(['sudo', 'cpufreq-set', '-g', 'performance'], 
                                 capture_output=True, check=True)
                    optimizations.append("Set CPU governor to performance mode")
                except:
                    pass
            
            # Clean temporary files
            if self.stats.storage_percent > 80:
                os.system("find /tmp -type f -atime +1 -delete 2>/dev/null")
                optimizations.append("Cleaned temporary files")
            
            return {
                'success': True,
                'optimizations': optimizations,
                'message': f"Applied {len(optimizations)} optimizations"
            }
            
        except Exception as e:
            logger.error(f"❌ System optimization failed: {e}")
            return {
                'success': False,
                'optimizations': optimizations,
                'error': str(e)
            }

