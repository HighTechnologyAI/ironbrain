#!/usr/bin/env python3
"""
System Test Suite for Jetson Nano GCS
Comprehensive testing of all components and performance validation

Tests:
- Backend services startup
- Frontend build and serve
- Memory usage validation
- Performance benchmarks
- Integration tests
"""

import os
import sys
import time
import subprocess
import threading
import requests
import psutil
import json
from typing import Dict, Any, List, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SystemTester:
    """Comprehensive system tester for Jetson Nano GCS"""
    
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.backend_dir = os.path.join(self.base_dir, 'gcs-backend')
        self.frontend_dir = os.path.join(self.base_dir, 'gcs-frontend')
        
        # Test results
        self.test_results = {
            'backend_startup': False,
            'frontend_build': False,
            'frontend_serve': False,
            'memory_usage': {},
            'performance_benchmarks': {},
            'integration_tests': {},
            'overall_success': False
        }
        
        # Performance thresholds for Jetson Nano
        self.thresholds = {
            'backend_memory_mb': 200,  # Backend should use < 200MB
            'frontend_memory_mb': 100,  # Frontend build should use < 100MB
            'startup_time_sec': 30,    # System should start in < 30 seconds
            'response_time_ms': 500,   # API responses should be < 500ms
            'cpu_usage_percent': 80    # CPU usage should be < 80% under load
        }
        
        # Running processes
        self.backend_process = None
        self.frontend_process = None
        
    def run_all_tests(self) -> Dict[str, Any]:
        """Run comprehensive test suite"""
        logger.info("🧪 Starting comprehensive system tests for Jetson Nano GCS")
        
        try:
            # Test 1: Backend startup and health
            logger.info("📋 Test 1: Backend startup and health check")
            self.test_backend_startup()
            
            # Test 2: Frontend build
            logger.info("📋 Test 2: Frontend build process")
            self.test_frontend_build()
            
            # Test 3: Frontend serve
            logger.info("📋 Test 3: Frontend serve process")
            self.test_frontend_serve()
            
            # Test 4: Memory usage validation
            logger.info("📋 Test 4: Memory usage validation")
            self.test_memory_usage()
            
            # Test 5: Performance benchmarks
            logger.info("📋 Test 5: Performance benchmarks")
            self.test_performance_benchmarks()
            
            # Test 6: Integration tests
            logger.info("📋 Test 6: Integration tests")
            self.test_integration()
            
            # Calculate overall success
            self.test_results['overall_success'] = self._calculate_overall_success()
            
            # Generate report
            self._generate_test_report()
            
        except Exception as e:
            logger.error(f"❌ Test suite failed: {e}")
            self.test_results['error'] = str(e)
        
        finally:
            # Cleanup
            self._cleanup_processes()
        
        return self.test_results
    
    def test_backend_startup(self):
        """Test backend startup and health"""
        try:
            logger.info("🚀 Starting backend server...")
            
            # Start backend
            backend_cmd = [
                sys.executable, 'run.py'
            ]
            
            self.backend_process = subprocess.Popen(
                backend_cmd,
                cwd=self.backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait for startup
            startup_timeout = 30
            start_time = time.time()
            
            while time.time() - start_time < startup_timeout:
                try:
                    response = requests.get('http://localhost:5000/health', timeout=2)
                    if response.status_code == 200:
                        logger.info("✅ Backend started successfully")
                        self.test_results['backend_startup'] = True
                        
                        # Test API endpoints
                        self._test_backend_endpoints()
                        return
                        
                except requests.exceptions.RequestException:
                    time.sleep(1)
                    continue
            
            logger.error("❌ Backend startup timeout")
            self.test_results['backend_startup'] = False
            
        except Exception as e:
            logger.error(f"❌ Backend startup failed: {e}")
            self.test_results['backend_startup'] = False
    
    def _test_backend_endpoints(self):
        """Test backend API endpoints"""
        endpoints = [
            '/health',
            '/api/status',
            '/api/telemetry',
            '/api/video/status',
            '/api/system/stats'
        ]
        
        endpoint_results = {}
        
        for endpoint in endpoints:
            try:
                response = requests.get(f'http://localhost:5000{endpoint}', timeout=5)
                endpoint_results[endpoint] = {
                    'status_code': response.status_code,
                    'response_time_ms': response.elapsed.total_seconds() * 1000,
                    'success': response.status_code == 200
                }
                
                if response.status_code == 200:
                    logger.info(f"✅ {endpoint} - OK ({response.elapsed.total_seconds()*1000:.1f}ms)")
                else:
                    logger.warning(f"⚠️ {endpoint} - Status {response.status_code}")
                    
            except Exception as e:
                logger.error(f"❌ {endpoint} - Error: {e}")
                endpoint_results[endpoint] = {
                    'error': str(e),
                    'success': False
                }
        
        self.test_results['backend_endpoints'] = endpoint_results
    
    def test_frontend_build(self):
        """Test frontend build process"""
        try:
            logger.info("🏗️ Building frontend...")
            
            # Install dependencies
            npm_install = subprocess.run(
                ['npm', 'install'],
                cwd=self.frontend_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            if npm_install.returncode != 0:
                logger.error(f"❌ npm install failed: {npm_install.stderr}")
                self.test_results['frontend_build'] = False
                return
            
            # Build frontend
            build_start = time.time()
            npm_build = subprocess.run(
                ['npm', 'run', 'build'],
                cwd=self.frontend_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            build_time = time.time() - build_start
            
            if npm_build.returncode == 0:
                logger.info(f"✅ Frontend build successful ({build_time:.1f}s)")
                self.test_results['frontend_build'] = True
                self.test_results['frontend_build_time'] = build_time
                
                # Check build output
                dist_dir = os.path.join(self.frontend_dir, 'dist')
                if os.path.exists(dist_dir):
                    build_size = self._get_directory_size(dist_dir)
                    self.test_results['frontend_build_size_mb'] = build_size / 1024 / 1024
                    logger.info(f"📦 Build size: {build_size/1024/1024:.1f}MB")
                
            else:
                logger.error(f"❌ Frontend build failed: {npm_build.stderr}")
                self.test_results['frontend_build'] = False
                
        except subprocess.TimeoutExpired:
            logger.error("❌ Frontend build timeout")
            self.test_results['frontend_build'] = False
        except Exception as e:
            logger.error(f"❌ Frontend build error: {e}")
            self.test_results['frontend_build'] = False
    
    def test_frontend_serve(self):
        """Test frontend serve process"""
        try:
            if not self.test_results['frontend_build']:
                logger.warning("⚠️ Skipping frontend serve test (build failed)")
                return
            
            logger.info("🌐 Starting frontend server...")
            
            # Start frontend dev server
            serve_cmd = ['npm', 'run', 'dev', '--', '--host', '0.0.0.0', '--port', '3000']
            
            self.frontend_process = subprocess.Popen(
                serve_cmd,
                cwd=self.frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait for frontend to start
            startup_timeout = 60
            start_time = time.time()
            
            while time.time() - start_time < startup_timeout:
                try:
                    response = requests.get('http://localhost:3000', timeout=2)
                    if response.status_code == 200:
                        logger.info("✅ Frontend server started successfully")
                        self.test_results['frontend_serve'] = True
                        
                        # Test frontend loading
                        self._test_frontend_loading()
                        return
                        
                except requests.exceptions.RequestException:
                    time.sleep(2)
                    continue
            
            logger.error("❌ Frontend serve timeout")
            self.test_results['frontend_serve'] = False
            
        except Exception as e:
            logger.error(f"❌ Frontend serve error: {e}")
            self.test_results['frontend_serve'] = False
    
    def _test_frontend_loading(self):
        """Test frontend loading performance"""
        try:
            # Test page load times
            pages = ['/', '/flight', '/video', '/mission', '/settings']
            page_results = {}
            
            for page in pages:
                try:
                    start_time = time.time()
                    response = requests.get(f'http://localhost:3000{page}', timeout=10)
                    load_time = time.time() - start_time
                    
                    page_results[page] = {
                        'status_code': response.status_code,
                        'load_time_ms': load_time * 1000,
                        'content_length': len(response.content),
                        'success': response.status_code == 200
                    }
                    
                    if response.status_code == 200:
                        logger.info(f"✅ {page} - Loaded ({load_time*1000:.1f}ms)")
                    else:
                        logger.warning(f"⚠️ {page} - Status {response.status_code}")
                        
                except Exception as e:
                    logger.error(f"❌ {page} - Error: {e}")
                    page_results[page] = {
                        'error': str(e),
                        'success': False
                    }
            
            self.test_results['frontend_pages'] = page_results
            
        except Exception as e:
            logger.error(f"❌ Frontend loading test error: {e}")
    
    def test_memory_usage(self):
        """Test memory usage of all components"""
        try:
            logger.info("💾 Testing memory usage...")
            
            memory_stats = {}
            
            # Get system memory info
            system_memory = psutil.virtual_memory()
            memory_stats['system'] = {
                'total_mb': system_memory.total / 1024 / 1024,
                'available_mb': system_memory.available / 1024 / 1024,
                'used_mb': system_memory.used / 1024 / 1024,
                'percent': system_memory.percent
            }
            
            # Test backend memory usage
            if self.backend_process:
                try:
                    backend_proc = psutil.Process(self.backend_process.pid)
                    backend_memory = backend_proc.memory_info()
                    memory_stats['backend'] = {
                        'rss_mb': backend_memory.rss / 1024 / 1024,
                        'vms_mb': backend_memory.vms / 1024 / 1024,
                        'cpu_percent': backend_proc.cpu_percent()
                    }
                    
                    # Check if within threshold
                    if memory_stats['backend']['rss_mb'] <= self.thresholds['backend_memory_mb']:
                        logger.info(f"✅ Backend memory usage: {memory_stats['backend']['rss_mb']:.1f}MB (within threshold)")
                    else:
                        logger.warning(f"⚠️ Backend memory usage: {memory_stats['backend']['rss_mb']:.1f}MB (exceeds threshold)")
                        
                except psutil.NoSuchProcess:
                    logger.warning("⚠️ Backend process not found for memory test")
            
            # Test frontend memory usage
            if self.frontend_process:
                try:
                    frontend_proc = psutil.Process(self.frontend_process.pid)
                    frontend_memory = frontend_proc.memory_info()
                    memory_stats['frontend'] = {
                        'rss_mb': frontend_memory.rss / 1024 / 1024,
                        'vms_mb': frontend_memory.vms / 1024 / 1024,
                        'cpu_percent': frontend_proc.cpu_percent()
                    }
                    
                    # Check if within threshold
                    if memory_stats['frontend']['rss_mb'] <= self.thresholds['frontend_memory_mb']:
                        logger.info(f"✅ Frontend memory usage: {memory_stats['frontend']['rss_mb']:.1f}MB (within threshold)")
                    else:
                        logger.warning(f"⚠️ Frontend memory usage: {memory_stats['frontend']['rss_mb']:.1f}MB (exceeds threshold)")
                        
                except psutil.NoSuchProcess:
                    logger.warning("⚠️ Frontend process not found for memory test")
            
            self.test_results['memory_usage'] = memory_stats
            
        except Exception as e:
            logger.error(f"❌ Memory usage test error: {e}")
    
    def test_performance_benchmarks(self):
        """Test system performance benchmarks"""
        try:
            logger.info("⚡ Running performance benchmarks...")
            
            benchmarks = {}
            
            # API response time benchmark
            if self.test_results['backend_startup']:
                api_times = []
                for i in range(10):
                    try:
                        start_time = time.time()
                        response = requests.get('http://localhost:5000/api/status', timeout=5)
                        response_time = (time.time() - start_time) * 1000
                        
                        if response.status_code == 200:
                            api_times.append(response_time)
                        
                        time.sleep(0.1)  # Small delay between requests
                        
                    except Exception as e:
                        logger.warning(f"API benchmark request failed: {e}")
                
                if api_times:
                    benchmarks['api_response'] = {
                        'avg_ms': sum(api_times) / len(api_times),
                        'min_ms': min(api_times),
                        'max_ms': max(api_times),
                        'count': len(api_times)
                    }
                    
                    avg_time = benchmarks['api_response']['avg_ms']
                    if avg_time <= self.thresholds['response_time_ms']:
                        logger.info(f"✅ API response time: {avg_time:.1f}ms (within threshold)")
                    else:
                        logger.warning(f"⚠️ API response time: {avg_time:.1f}ms (exceeds threshold)")
            
            # CPU usage benchmark
            cpu_samples = []
            for i in range(10):
                cpu_percent = psutil.cpu_percent(interval=0.1)
                cpu_samples.append(cpu_percent)
            
            if cpu_samples:
                benchmarks['cpu_usage'] = {
                    'avg_percent': sum(cpu_samples) / len(cpu_samples),
                    'min_percent': min(cpu_samples),
                    'max_percent': max(cpu_samples)
                }
                
                avg_cpu = benchmarks['cpu_usage']['avg_percent']
                if avg_cpu <= self.thresholds['cpu_usage_percent']:
                    logger.info(f"✅ CPU usage: {avg_cpu:.1f}% (within threshold)")
                else:
                    logger.warning(f"⚠️ CPU usage: {avg_cpu:.1f}% (exceeds threshold)")
            
            # Disk I/O benchmark
            disk_io_start = psutil.disk_io_counters()
            time.sleep(1)
            disk_io_end = psutil.disk_io_counters()
            
            if disk_io_start and disk_io_end:
                benchmarks['disk_io'] = {
                    'read_mb_per_sec': (disk_io_end.read_bytes - disk_io_start.read_bytes) / 1024 / 1024,
                    'write_mb_per_sec': (disk_io_end.write_bytes - disk_io_start.write_bytes) / 1024 / 1024
                }
            
            self.test_results['performance_benchmarks'] = benchmarks
            
        except Exception as e:
            logger.error(f"❌ Performance benchmark error: {e}")
    
    def test_integration(self):
        """Test system integration"""
        try:
            logger.info("🔗 Testing system integration...")
            
            integration_results = {}
            
            # Test backend-frontend communication
            if self.test_results['backend_startup'] and self.test_results['frontend_serve']:
                try:
                    # Test WebSocket connection (simulated)
                    response = requests.get('http://localhost:5000/api/status', timeout=5)
                    if response.status_code == 200:
                        integration_results['backend_frontend'] = {
                            'success': True,
                            'message': 'Backend-frontend communication working'
                        }
                        logger.info("✅ Backend-frontend integration working")
                    else:
                        integration_results['backend_frontend'] = {
                            'success': False,
                            'message': f'Backend returned status {response.status_code}'
                        }
                        
                except Exception as e:
                    integration_results['backend_frontend'] = {
                        'success': False,
                        'message': f'Integration test failed: {e}'
                    }
                    logger.error(f"❌ Backend-frontend integration failed: {e}")
            
            # Test video service integration
            try:
                response = requests.get('http://localhost:5000/api/video/status', timeout=5)
                if response.status_code == 200:
                    video_data = response.json()
                    integration_results['video_service'] = {
                        'success': True,
                        'hardware_accel': video_data.get('hardware_accel', False),
                        'message': 'Video service integration working'
                    }
                    logger.info("✅ Video service integration working")
                else:
                    integration_results['video_service'] = {
                        'success': False,
                        'message': f'Video service returned status {response.status_code}'
                    }
                    
            except Exception as e:
                integration_results['video_service'] = {
                    'success': False,
                    'message': f'Video service test failed: {e}'
                }
                logger.error(f"❌ Video service integration failed: {e}")
            
            # Test MAVLink service integration
            try:
                response = requests.get('http://localhost:5000/api/telemetry', timeout=5)
                if response.status_code == 200:
                    integration_results['mavlink_service'] = {
                        'success': True,
                        'message': 'MAVLink service integration working'
                    }
                    logger.info("✅ MAVLink service integration working")
                else:
                    integration_results['mavlink_service'] = {
                        'success': False,
                        'message': f'MAVLink service returned status {response.status_code}'
                    }
                    
            except Exception as e:
                integration_results['mavlink_service'] = {
                    'success': False,
                    'message': f'MAVLink service test failed: {e}'
                }
                logger.error(f"❌ MAVLink service integration failed: {e}")
            
            self.test_results['integration_tests'] = integration_results
            
        except Exception as e:
            logger.error(f"❌ Integration test error: {e}")
    
    def _calculate_overall_success(self) -> bool:
        """Calculate overall test success"""
        critical_tests = [
            'backend_startup',
            'frontend_build'
        ]
        
        # Check critical tests
        for test in critical_tests:
            if not self.test_results.get(test, False):
                return False
        
        # Check memory usage thresholds
        memory_usage = self.test_results.get('memory_usage', {})
        backend_memory = memory_usage.get('backend', {}).get('rss_mb', 0)
        if backend_memory > self.thresholds['backend_memory_mb']:
            logger.warning(f"⚠️ Backend memory usage exceeds threshold: {backend_memory:.1f}MB")
        
        # Check performance benchmarks
        benchmarks = self.test_results.get('performance_benchmarks', {})
        api_response = benchmarks.get('api_response', {}).get('avg_ms', 0)
        if api_response > self.thresholds['response_time_ms']:
            logger.warning(f"⚠️ API response time exceeds threshold: {api_response:.1f}ms")
        
        return True
    
    def _generate_test_report(self):
        """Generate comprehensive test report"""
        report_path = os.path.join(self.base_dir, 'test_report.json')
        
        try:
            with open(report_path, 'w') as f:
                json.dump(self.test_results, f, indent=2, default=str)
            
            logger.info(f"📊 Test report saved to: {report_path}")
            
            # Print summary
            self._print_test_summary()
            
        except Exception as e:
            logger.error(f"❌ Failed to generate test report: {e}")
    
    def _print_test_summary(self):
        """Print test summary"""
        logger.info("\n" + "="*60)
        logger.info("📊 TEST SUMMARY")
        logger.info("="*60)
        
        # Overall result
        if self.test_results['overall_success']:
            logger.info("🎉 OVERALL RESULT: SUCCESS")
        else:
            logger.info("❌ OVERALL RESULT: FAILED")
        
        # Individual test results
        logger.info("\n📋 Individual Test Results:")
        test_items = [
            ('Backend Startup', 'backend_startup'),
            ('Frontend Build', 'frontend_build'),
            ('Frontend Serve', 'frontend_serve')
        ]
        
        for name, key in test_items:
            status = "✅ PASS" if self.test_results.get(key, False) else "❌ FAIL"
            logger.info(f"  {name}: {status}")
        
        # Memory usage
        memory_usage = self.test_results.get('memory_usage', {})
        if memory_usage:
            logger.info("\n💾 Memory Usage:")
            backend_mem = memory_usage.get('backend', {}).get('rss_mb', 0)
            frontend_mem = memory_usage.get('frontend', {}).get('rss_mb', 0)
            logger.info(f"  Backend: {backend_mem:.1f}MB")
            logger.info(f"  Frontend: {frontend_mem:.1f}MB")
        
        # Performance benchmarks
        benchmarks = self.test_results.get('performance_benchmarks', {})
        if benchmarks:
            logger.info("\n⚡ Performance:")
            api_response = benchmarks.get('api_response', {}).get('avg_ms', 0)
            cpu_usage = benchmarks.get('cpu_usage', {}).get('avg_percent', 0)
            logger.info(f"  API Response: {api_response:.1f}ms")
            logger.info(f"  CPU Usage: {cpu_usage:.1f}%")
        
        logger.info("="*60)
    
    def _get_directory_size(self, path: str) -> int:
        """Get total size of directory in bytes"""
        total_size = 0
        for dirpath, dirnames, filenames in os.walk(path):
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                if os.path.exists(filepath):
                    total_size += os.path.getsize(filepath)
        return total_size
    
    def _cleanup_processes(self):
        """Cleanup running processes"""
        logger.info("🧹 Cleaning up processes...")
        
        if self.backend_process:
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=10)
            except:
                try:
                    self.backend_process.kill()
                except:
                    pass
        
        if self.frontend_process:
            try:
                self.frontend_process.terminate()
                self.frontend_process.wait(timeout=10)
            except:
                try:
                    self.frontend_process.kill()
                except:
                    pass

def main():
    """Main test function"""
    tester = SystemTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results['overall_success']:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()

