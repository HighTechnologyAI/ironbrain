#!/usr/bin/env python3
"""
Quick Performance Test for Jetson Nano GCS
Fast validation of key components and performance metrics

This script performs essential tests without full system startup:
- Memory usage validation
- Service initialization tests
- Performance benchmarks
- Hardware capability detection
"""

import os
import sys
import time
import psutil
import logging
from typing import Dict, Any

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'gcs-backend', 'src'))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class QuickTester:
    """Quick performance tester for Jetson Nano GCS"""
    
    def __init__(self):
        self.results = {
            'system_info': {},
            'memory_test': {},
            'service_test': {},
            'performance_test': {},
            'overall_score': 0
        }
        
    def run_quick_tests(self) -> Dict[str, Any]:
        """Run quick validation tests"""
        logger.info("🚀 Starting quick performance tests for Jetson Nano GCS")
        
        try:
            # Test 1: System information
            logger.info("📋 Test 1: System information")
            self.test_system_info()
            
            # Test 2: Memory usage baseline
            logger.info("📋 Test 2: Memory usage baseline")
            self.test_memory_baseline()
            
            # Test 3: Service initialization
            logger.info("📋 Test 3: Service initialization")
            self.test_service_initialization()
            
            # Test 4: Performance benchmarks
            logger.info("📋 Test 4: Performance benchmarks")
            self.test_performance_benchmarks()
            
            # Calculate overall score
            self.calculate_overall_score()
            
            # Print results
            self.print_results()
            
        except Exception as e:
            logger.error(f"❌ Quick test failed: {e}")
            self.results['error'] = str(e)
        
        return self.results
    
    def test_system_info(self):
        """Test system information and capabilities"""
        try:
            # Basic system info
            memory = psutil.virtual_memory()
            cpu_count = psutil.cpu_count()
            
            # Check if running on Jetson (simulated)
            is_jetson = os.path.exists('/proc/device-tree/model')
            if is_jetson:
                try:
                    with open('/proc/device-tree/model', 'r') as f:
                        model = f.read().strip()
                except:
                    model = 'Unknown Jetson'
            else:
                model = 'Generic Linux'
            
            # Check for hardware acceleration capabilities
            hw_capabilities = self._check_hardware_capabilities()
            
            self.results['system_info'] = {
                'model': model,
                'is_jetson': is_jetson,
                'cpu_cores': cpu_count,
                'memory_total_gb': memory.total / 1024 / 1024 / 1024,
                'memory_available_gb': memory.available / 1024 / 1024 / 1024,
                'hardware_capabilities': hw_capabilities
            }
            
            logger.info(f"✅ System: {model} ({cpu_count} cores, {memory.total/1024/1024/1024:.1f}GB RAM)")
            
        except Exception as e:
            logger.error(f"❌ System info test failed: {e}")
            self.results['system_info'] = {'error': str(e)}
    
    def _check_hardware_capabilities(self) -> Dict[str, bool]:
        """Check hardware acceleration capabilities"""
        capabilities = {
            'opencv': False,
            'gstreamer': False,
            'cuda': False,
            'tegrastats': False
        }
        
        try:
            # Check OpenCV
            import cv2
            capabilities['opencv'] = True
            logger.info("✅ OpenCV available")
        except ImportError:
            logger.warning("⚠️ OpenCV not available")
        
        try:
            # Check GStreamer
            import subprocess
            result = subprocess.run(['gst-launch-1.0', '--version'], 
                                  capture_output=True, timeout=2)
            capabilities['gstreamer'] = result.returncode == 0
            if capabilities['gstreamer']:
                logger.info("✅ GStreamer available")
            else:
                logger.warning("⚠️ GStreamer not available")
        except:
            logger.warning("⚠️ GStreamer not available")
        
        try:
            # Check CUDA
            import subprocess
            result = subprocess.run(['nvcc', '--version'], 
                                  capture_output=True, timeout=2)
            capabilities['cuda'] = result.returncode == 0
            if capabilities['cuda']:
                logger.info("✅ CUDA available")
            else:
                logger.warning("⚠️ CUDA not available")
        except:
            logger.warning("⚠️ CUDA not available")
        
        try:
            # Check tegrastats (Jetson monitoring)
            import subprocess
            result = subprocess.run(['tegrastats', '--help'], 
                                  capture_output=True, timeout=2)
            capabilities['tegrastats'] = result.returncode == 0
            if capabilities['tegrastats']:
                logger.info("✅ Tegrastats available")
            else:
                logger.warning("⚠️ Tegrastats not available")
        except:
            logger.warning("⚠️ Tegrastats not available")
        
        return capabilities
    
    def test_memory_baseline(self):
        """Test baseline memory usage"""
        try:
            # Get initial memory state
            memory_before = psutil.virtual_memory()
            process = psutil.Process()
            process_memory_before = process.memory_info()
            
            # Force garbage collection
            import gc
            gc.collect()
            
            # Get memory after cleanup
            memory_after = psutil.virtual_memory()
            process_memory_after = process.memory_info()
            
            self.results['memory_test'] = {
                'system_total_gb': memory_after.total / 1024 / 1024 / 1024,
                'system_available_gb': memory_after.available / 1024 / 1024 / 1024,
                'system_used_percent': memory_after.percent,
                'process_rss_mb': process_memory_after.rss / 1024 / 1024,
                'process_vms_mb': process_memory_after.vms / 1024 / 1024,
                'memory_freed_mb': (process_memory_before.rss - process_memory_after.rss) / 1024 / 1024
            }
            
            # Check if memory usage is within acceptable limits for Jetson Nano
            if memory_after.percent < 75:
                logger.info(f"✅ Memory usage: {memory_after.percent:.1f}% (good)")
            elif memory_after.percent < 85:
                logger.warning(f"⚠️ Memory usage: {memory_after.percent:.1f}% (moderate)")
            else:
                logger.error(f"❌ Memory usage: {memory_after.percent:.1f}% (high)")
            
        except Exception as e:
            logger.error(f"❌ Memory baseline test failed: {e}")
            self.results['memory_test'] = {'error': str(e)}
    
    def test_service_initialization(self):
        """Test service initialization without full startup"""
        try:
            service_results = {}
            
            # Test MAVLink service initialization
            try:
                from services.mavlink_service import OptimizedMAVLinkService
                
                start_time = time.time()
                mavlink_service = OptimizedMAVLinkService()
                init_time = time.time() - start_time
                
                service_results['mavlink'] = {
                    'success': True,
                    'init_time_ms': init_time * 1000,
                    'memory_mb': self._get_object_memory_usage(mavlink_service)
                }
                logger.info(f"✅ MAVLink service initialized ({init_time*1000:.1f}ms)")
                
                # Cleanup
                del mavlink_service
                
            except Exception as e:
                service_results['mavlink'] = {
                    'success': False,
                    'error': str(e)
                }
                logger.error(f"❌ MAVLink service initialization failed: {e}")
            
            # Test Video service initialization
            try:
                from services.video_service import VideoService
                
                start_time = time.time()
                video_service = VideoService()
                init_time = time.time() - start_time
                
                service_results['video'] = {
                    'success': True,
                    'init_time_ms': init_time * 1000,
                    'memory_mb': self._get_object_memory_usage(video_service),
                    'hardware_accel': getattr(video_service, 'hw_accel_available', False)
                }
                logger.info(f"✅ Video service initialized ({init_time*1000:.1f}ms)")
                
                # Cleanup
                del video_service
                
            except Exception as e:
                service_results['video'] = {
                    'success': False,
                    'error': str(e)
                }
                logger.error(f"❌ Video service initialization failed: {e}")
            
            # Test Performance monitor initialization
            try:
                from services.performance_monitor import PerformanceMonitor
                
                start_time = time.time()
                perf_monitor = PerformanceMonitor()
                init_time = time.time() - start_time
                
                service_results['performance_monitor'] = {
                    'success': True,
                    'init_time_ms': init_time * 1000,
                    'memory_mb': self._get_object_memory_usage(perf_monitor),
                    'jetson_optimized': perf_monitor.optimization_enabled
                }
                logger.info(f"✅ Performance monitor initialized ({init_time*1000:.1f}ms)")
                
                # Cleanup
                del perf_monitor
                
            except Exception as e:
                service_results['performance_monitor'] = {
                    'success': False,
                    'error': str(e)
                }
                logger.error(f"❌ Performance monitor initialization failed: {e}")
            
            self.results['service_test'] = service_results
            
        except Exception as e:
            logger.error(f"❌ Service initialization test failed: {e}")
            self.results['service_test'] = {'error': str(e)}
    
    def test_performance_benchmarks(self):
        """Test basic performance benchmarks"""
        try:
            benchmarks = {}
            
            # CPU benchmark
            logger.info("⚡ Running CPU benchmark...")
            cpu_times = []
            for i in range(5):
                start_time = time.time()
                # Simple CPU-intensive task
                result = sum(x*x for x in range(100000))
                cpu_time = time.time() - start_time
                cpu_times.append(cpu_time)
            
            benchmarks['cpu'] = {
                'avg_time_ms': (sum(cpu_times) / len(cpu_times)) * 1000,
                'min_time_ms': min(cpu_times) * 1000,
                'max_time_ms': max(cpu_times) * 1000
            }
            
            # Memory allocation benchmark
            logger.info("💾 Running memory benchmark...")
            start_time = time.time()
            # Allocate and deallocate memory
            large_list = [i for i in range(1000000)]
            del large_list
            memory_time = time.time() - start_time
            
            benchmarks['memory'] = {
                'allocation_time_ms': memory_time * 1000
            }
            
            # I/O benchmark
            logger.info("💿 Running I/O benchmark...")
            import tempfile
            start_time = time.time()
            with tempfile.NamedTemporaryFile(mode='w+', delete=True) as f:
                # Write test data
                test_data = "x" * 1024 * 1024  # 1MB
                f.write(test_data)
                f.flush()
                f.seek(0)
                # Read test data
                read_data = f.read()
            io_time = time.time() - start_time
            
            benchmarks['io'] = {
                'read_write_time_ms': io_time * 1000,
                'throughput_mb_per_sec': 2.0 / io_time  # 1MB write + 1MB read
            }
            
            self.results['performance_test'] = benchmarks
            
            # Log results
            logger.info(f"✅ CPU benchmark: {benchmarks['cpu']['avg_time_ms']:.1f}ms avg")
            logger.info(f"✅ Memory benchmark: {benchmarks['memory']['allocation_time_ms']:.1f}ms")
            logger.info(f"✅ I/O benchmark: {benchmarks['io']['throughput_mb_per_sec']:.1f}MB/s")
            
        except Exception as e:
            logger.error(f"❌ Performance benchmark failed: {e}")
            self.results['performance_test'] = {'error': str(e)}
    
    def _get_object_memory_usage(self, obj) -> float:
        """Estimate memory usage of an object in MB"""
        try:
            import sys
            return sys.getsizeof(obj) / 1024 / 1024
        except:
            return 0.0
    
    def calculate_overall_score(self):
        """Calculate overall performance score (0-100)"""
        score = 0
        max_score = 100
        
        try:
            # System info score (20 points)
            if self.results['system_info'].get('cpu_cores', 0) >= 4:
                score += 10
            if self.results['system_info'].get('memory_total_gb', 0) >= 3:
                score += 10
            
            # Memory test score (30 points)
            memory_percent = self.results['memory_test'].get('system_used_percent', 100)
            if memory_percent < 50:
                score += 30
            elif memory_percent < 75:
                score += 20
            elif memory_percent < 85:
                score += 10
            
            # Service test score (30 points)
            services = self.results['service_test']
            service_count = 0
            successful_services = 0
            
            for service_name, service_data in services.items():
                if isinstance(service_data, dict) and 'success' in service_data:
                    service_count += 1
                    if service_data['success']:
                        successful_services += 1
            
            if service_count > 0:
                service_score = (successful_services / service_count) * 30
                score += service_score
            
            # Performance test score (20 points)
            perf_test = self.results['performance_test']
            if 'cpu' in perf_test and perf_test['cpu'].get('avg_time_ms', 1000) < 100:
                score += 10
            if 'io' in perf_test and perf_test['io'].get('throughput_mb_per_sec', 0) > 50:
                score += 10
            
            self.results['overall_score'] = min(score, max_score)
            
        except Exception as e:
            logger.error(f"❌ Score calculation failed: {e}")
            self.results['overall_score'] = 0
    
    def print_results(self):
        """Print comprehensive test results"""
        logger.info("\n" + "="*60)
        logger.info("📊 QUICK TEST RESULTS")
        logger.info("="*60)
        
        # Overall score
        score = self.results['overall_score']
        if score >= 80:
            logger.info(f"🎉 OVERALL SCORE: {score}/100 (EXCELLENT)")
        elif score >= 60:
            logger.info(f"✅ OVERALL SCORE: {score}/100 (GOOD)")
        elif score >= 40:
            logger.info(f"⚠️ OVERALL SCORE: {score}/100 (FAIR)")
        else:
            logger.info(f"❌ OVERALL SCORE: {score}/100 (POOR)")
        
        # System info
        sys_info = self.results['system_info']
        if 'error' not in sys_info:
            logger.info(f"\n🖥️ System: {sys_info.get('model', 'Unknown')}")
            logger.info(f"   CPU Cores: {sys_info.get('cpu_cores', 0)}")
            logger.info(f"   Memory: {sys_info.get('memory_total_gb', 0):.1f}GB total, {sys_info.get('memory_available_gb', 0):.1f}GB available")
            
            hw_caps = sys_info.get('hardware_capabilities', {})
            logger.info(f"   Hardware: OpenCV={hw_caps.get('opencv', False)}, GStreamer={hw_caps.get('gstreamer', False)}, CUDA={hw_caps.get('cuda', False)}")
        
        # Memory test
        mem_test = self.results['memory_test']
        if 'error' not in mem_test:
            logger.info(f"\n💾 Memory Usage: {mem_test.get('system_used_percent', 0):.1f}%")
            logger.info(f"   Process Memory: {mem_test.get('process_rss_mb', 0):.1f}MB")
        
        # Service test
        service_test = self.results['service_test']
        if 'error' not in service_test:
            logger.info("\n🔧 Services:")
            for service_name, service_data in service_test.items():
                if isinstance(service_data, dict):
                    if service_data.get('success', False):
                        init_time = service_data.get('init_time_ms', 0)
                        memory = service_data.get('memory_mb', 0)
                        logger.info(f"   {service_name}: ✅ OK ({init_time:.1f}ms, {memory:.1f}MB)")
                    else:
                        logger.info(f"   {service_name}: ❌ FAILED")
        
        # Performance test
        perf_test = self.results['performance_test']
        if 'error' not in perf_test:
            logger.info("\n⚡ Performance:")
            if 'cpu' in perf_test:
                cpu_time = perf_test['cpu'].get('avg_time_ms', 0)
                logger.info(f"   CPU: {cpu_time:.1f}ms avg")
            if 'io' in perf_test:
                io_throughput = perf_test['io'].get('throughput_mb_per_sec', 0)
                logger.info(f"   I/O: {io_throughput:.1f}MB/s")
        
        logger.info("="*60)
        
        # Recommendations
        self._print_recommendations()
    
    def _print_recommendations(self):
        """Print optimization recommendations"""
        logger.info("\n💡 RECOMMENDATIONS:")
        
        # Memory recommendations
        memory_percent = self.results['memory_test'].get('system_used_percent', 0)
        if memory_percent > 80:
            logger.info("   🔴 High memory usage detected - consider:")
            logger.info("      • Reducing background processes")
            logger.info("      • Enabling swap if not already active")
            logger.info("      • Using memory optimization settings")
        elif memory_percent > 60:
            logger.info("   🟡 Moderate memory usage - monitor during operation")
        else:
            logger.info("   🟢 Memory usage is optimal")
        
        # Hardware recommendations
        hw_caps = self.results['system_info'].get('hardware_capabilities', {})
        if not hw_caps.get('gstreamer', False):
            logger.info("   🔴 GStreamer not available - video performance will be limited")
            logger.info("      • Install GStreamer: sudo apt install gstreamer1.0-*")
        
        if not hw_caps.get('cuda', False):
            logger.info("   🟡 CUDA not available - hardware acceleration disabled")
            logger.info("      • Install CUDA toolkit for better performance")
        
        # Service recommendations
        service_test = self.results['service_test']
        failed_services = []
        for service_name, service_data in service_test.items():
            if isinstance(service_data, dict) and not service_data.get('success', False):
                failed_services.append(service_name)
        
        if failed_services:
            logger.info(f"   🔴 Failed services: {', '.join(failed_services)}")
            logger.info("      • Check dependencies and error logs")
        else:
            logger.info("   🟢 All services initialized successfully")
        
        logger.info("")

def main():
    """Main test function"""
    tester = QuickTester()
    results = tester.run_quick_tests()
    
    # Save results
    import json
    with open('quick_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    # Exit with appropriate code
    if results['overall_score'] >= 60:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()

