"""
Pro Mega Spot Technology AI Ground Control Station
Optimized Flask Backend for Jetson Nano

Memory-efficient, high-performance backend designed specifically for
Jetson Nano's limited resources (4GB RAM, ARM Cortex-A57)
"""

import os
import sys
import logging
import threading
import time
from typing import Dict, Any

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import eventlet

# Import optimized services
from src.services.mavlink_service import mavlink_service
from src.services.video_service import VideoService
from src.services.mission_service import MissionService
from src.services.system_monitor import SystemMonitor

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app with optimized settings for Jetson Nano
app = Flask(__name__, 
           static_folder=os.path.join(os.path.dirname(__file__), 'static'),
           static_url_path='')

# Security and CORS configuration
app.config['SECRET_KEY'] = 'ProMegaSpotTech_AI_GCS_2024_Secure_Key'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file upload

# Enable CORS for all origins (required for web-based GCS)
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

# Initialize SocketIO with eventlet for better performance on ARM
socketio = SocketIO(app, 
                   cors_allowed_origins="*",
                   async_mode='eventlet',
                   logger=False,  # Disable verbose logging
                   engineio_logger=False)

# Global services
video_service = VideoService()
mission_service = MissionService()
system_monitor = SystemMonitor()

class OptimizedGCSBackend:
    """
    Main GCS Backend class optimized for Jetson Nano
    Manages all services and real-time communication
    """
    
    def __init__(self):
        self.is_running = False
        self.telemetry_thread = None
        self.system_monitor_thread = None
        self.connected_clients = set()
        
        # Performance metrics
        self.metrics = {
            'start_time': time.time(),
            'telemetry_updates': 0,
            'video_frames': 0,
            'commands_sent': 0,
            'memory_usage': 0,
            'cpu_usage': 0
        }
    
    def start(self):
        """Start all backend services"""
        if self.is_running:
            return
        
        logger.info("🚀 Starting Pro Mega Spot Technology AI GCS Backend")
        
        self.is_running = True
        
        # Start MAVLink service
        if not mavlink_service.is_connected:
            mavlink_service.connect("udp:0.0.0.0:14550")
        
        # Start video service
        video_service.start()
        
        # Start real-time data threads
        self.start_telemetry_thread()
        self.start_system_monitor_thread()
        
        logger.info("✅ All services started successfully")
    
    def stop(self):
        """Stop all backend services"""
        logger.info("🛑 Stopping GCS Backend services")
        
        self.is_running = False
        
        # Stop services
        mavlink_service.disconnect()
        video_service.stop()
        
        # Wait for threads to finish
        if self.telemetry_thread and self.telemetry_thread.is_alive():
            self.telemetry_thread.join(timeout=2.0)
        
        if self.system_monitor_thread and self.system_monitor_thread.is_alive():
            self.system_monitor_thread.join(timeout=2.0)
        
        logger.info("✅ All services stopped")
    
    def start_telemetry_thread(self):
        """Start telemetry broadcasting thread"""
        self.telemetry_thread = threading.Thread(
            target=self._telemetry_loop,
            name="Telemetry-Broadcaster",
            daemon=True
        )
        self.telemetry_thread.start()
    
    def start_system_monitor_thread(self):
        """Start system monitoring thread"""
        self.system_monitor_thread = threading.Thread(
            target=self._system_monitor_loop,
            name="System-Monitor",
            daemon=True
        )
        self.system_monitor_thread.start()
    
    def _telemetry_loop(self):
        """Real-time telemetry broadcasting (10Hz)"""
        while self.is_running:
            try:
                if len(self.connected_clients) > 0:
                    # Get telemetry data
                    telemetry = mavlink_service.get_telemetry()
                    connection_stats = mavlink_service.get_connection_stats()
                    
                    # Broadcast to all connected clients
                    socketio.emit('telemetry_update', {
                        'telemetry': telemetry,
                        'connection': connection_stats,
                        'timestamp': time.time()
                    })
                    
                    self.metrics['telemetry_updates'] += 1
                
                # 10Hz update rate (100ms)
                eventlet.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Error in telemetry loop: {e}")
                eventlet.sleep(1.0)
    
    def _system_monitor_loop(self):
        """System monitoring loop (1Hz)"""
        while self.is_running:
            try:
                if len(self.connected_clients) > 0:
                    # Get system metrics
                    system_stats = system_monitor.get_system_stats()
                    
                    # Update internal metrics
                    self.metrics['memory_usage'] = system_stats.get('memory_percent', 0)
                    self.metrics['cpu_usage'] = system_stats.get('cpu_percent', 0)
                    
                    # Broadcast system status
                    socketio.emit('system_status', {
                        'system': system_stats,
                        'metrics': self.metrics,
                        'timestamp': time.time()
                    })
                
                # 1Hz update rate
                eventlet.sleep(1.0)
                
            except Exception as e:
                logger.error(f"Error in system monitor loop: {e}")
                eventlet.sleep(5.0)

# Initialize backend
gcs_backend = OptimizedGCSBackend()

# ============================================================================
# REST API Routes
# ============================================================================

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Pro Mega Spot Technology AI GCS',
        'version': '1.0.0',
        'platform': 'Jetson Nano Optimized',
        'uptime': time.time() - gcs_backend.metrics['start_time'],
        'memory_usage': gcs_backend.metrics['memory_usage'],
        'cpu_usage': gcs_backend.metrics['cpu_usage']
    })

@app.route('/api/mavlink/connect', methods=['POST'])
def mavlink_connect():
    """Connect to MAVLink source"""
    data = request.get_json()
    connection_string = data.get('connection_string', 'udp:0.0.0.0:14550')
    
    success = mavlink_service.connect(connection_string)
    
    return jsonify({
        'success': success,
        'connection_string': connection_string,
        'message': 'Connected successfully' if success else 'Connection failed'
    })

@app.route('/api/mavlink/disconnect', methods=['POST'])
def mavlink_disconnect():
    """Disconnect from MAVLink source"""
    mavlink_service.disconnect()
    
    return jsonify({
        'success': True,
        'message': 'Disconnected successfully'
    })

@app.route('/api/mavlink/command', methods=['POST'])
def mavlink_command():
    """Send command to autopilot"""
    data = request.get_json()
    command = data.get('command')
    params = data.get('params', {})
    
    if not command:
        return jsonify({'success': False, 'message': 'Command required'}), 400
    
    success = mavlink_service.send_command(command, params)
    gcs_backend.metrics['commands_sent'] += 1
    
    return jsonify({
        'success': success,
        'command': command,
        'params': params,
        'message': 'Command sent successfully' if success else 'Command failed'
    })

@app.route('/api/mavlink/telemetry')
def get_telemetry():
    """Get current telemetry data"""
    telemetry = mavlink_service.get_telemetry()
    connection_stats = mavlink_service.get_connection_stats()
    
    return jsonify({
        'telemetry': telemetry,
        'connection': connection_stats,
        'timestamp': time.time()
    })

@app.route('/api/video/start', methods=['POST'])
def start_video():
    """Start video streaming"""
    data = request.get_json()
    source = data.get('source', 'test')  # test, rtsp, udp
    
    success = video_service.start_stream(source)
    
    return jsonify({
        'success': success,
        'source': source,
        'message': 'Video stream started' if success else 'Failed to start video'
    })

@app.route('/api/video/stop', methods=['POST'])
def stop_video():
    """Stop video streaming"""
    video_service.stop_stream()
    
    return jsonify({
        'success': True,
        'message': 'Video stream stopped'
    })

@app.route('/api/video/status')
def video_status():
    """Get video streaming status"""
    status = video_service.get_status()
    
    return jsonify(status)

@app.route('/api/mission/waypoints')
def get_waypoints():
    """Get mission waypoints"""
    waypoints = mission_service.get_waypoints()
    
    return jsonify({
        'waypoints': waypoints,
        'count': len(waypoints)
    })

@app.route('/api/mission/waypoints', methods=['POST'])
def add_waypoint():
    """Add mission waypoint"""
    data = request.get_json()
    
    waypoint = mission_service.add_waypoint(
        lat=data.get('lat'),
        lon=data.get('lon'),
        alt=data.get('alt', 50),
        action=data.get('action', 'WAYPOINT')
    )
    
    return jsonify({
        'success': True,
        'waypoint': waypoint,
        'message': 'Waypoint added successfully'
    })

@app.route('/api/mission/upload', methods=['POST'])
def upload_mission():
    """Upload mission to autopilot"""
    success = mission_service.upload_mission()
    
    return jsonify({
        'success': success,
        'message': 'Mission uploaded successfully' if success else 'Mission upload failed'
    })

@app.route('/api/system/stats')
def system_stats():
    """Get system statistics"""
    stats = system_monitor.get_system_stats()
    
    return jsonify({
        'system': stats,
        'metrics': gcs_backend.metrics,
        'timestamp': time.time()
    })

# ============================================================================
# WebSocket Events
# ============================================================================

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    gcs_backend.connected_clients.add(request.sid)
    logger.info(f"Client connected: {request.sid}")
    
    # Send initial status
    emit('connection_status', {
        'connected': True,
        'message': 'Connected to Pro Mega Spot Technology AI GCS',
        'server_time': time.time()
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    gcs_backend.connected_clients.discard(request.sid)
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('request_telemetry')
def handle_telemetry_request():
    """Handle telemetry data request"""
    telemetry = mavlink_service.get_telemetry()
    connection_stats = mavlink_service.get_connection_stats()
    
    emit('telemetry_update', {
        'telemetry': telemetry,
        'connection': connection_stats,
        'timestamp': time.time()
    })

@socketio.on('send_command')
def handle_command(data):
    """Handle command from client"""
    command = data.get('command')
    params = data.get('params', {})
    
    if command:
        success = mavlink_service.send_command(command, params)
        gcs_backend.metrics['commands_sent'] += 1
        
        emit('command_result', {
            'success': success,
            'command': command,
            'params': params,
            'timestamp': time.time()
        })

# ============================================================================
# Static File Serving (SPA Support)
# ============================================================================

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    """Serve Single Page Application"""
    static_folder_path = app.static_folder
    
    if static_folder_path is None:
        return "Static folder not configured", 404
    
    # Try to serve the requested file
    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    
    # Fall back to index.html for SPA routing
    index_path = os.path.join(static_folder_path, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(static_folder_path, 'index.html')
    
    # Return a basic HTML page if no static files exist
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Pro Mega Spot Technology AI GCS</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #fff; }
            .container { max-width: 800px; margin: 0 auto; text-align: center; }
            .logo { font-size: 2.5em; font-weight: bold; margin-bottom: 20px; 
                   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                   -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .status { background: #2a2a2a; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .api-link { color: #667eea; text-decoration: none; }
            .api-link:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">Pro Mega Spot Technology AI</div>
            <h2>Ground Control Station Backend</h2>
            <div class="status">
                <h3>🚀 Backend is Running</h3>
                <p>Optimized for Jetson Nano</p>
                <p>API Endpoint: <a href="/api/health" class="api-link">/api/health</a></p>
                <p>WebSocket: Connected and ready</p>
            </div>
            <p>Deploy your frontend static files to the static folder to see the full GCS interface.</p>
        </div>
    </body>
    </html>
    """, 200

# ============================================================================
# Application Startup
# ============================================================================

def create_app():
    """Application factory"""
    return app

if __name__ == '__main__':
    try:
        # Start backend services
        gcs_backend.start()
        
        logger.info("🌟 Pro Mega Spot Technology AI GCS Backend Starting...")
        logger.info("🎯 Optimized for Jetson Nano (4GB RAM, ARM Cortex-A57)")
        logger.info("🔗 WebSocket enabled for real-time communication")
        logger.info("📡 MAVLink service ready")
        logger.info("📹 Video streaming service ready")
        logger.info("🗺️ Mission planning service ready")
        
        # Run with eventlet for better performance on ARM
        socketio.run(app, 
                    host='0.0.0.0', 
                    port=5000, 
                    debug=False,  # Disable debug in production
                    use_reloader=False)  # Disable reloader for stability
        
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down gracefully...")
        gcs_backend.stop()
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        gcs_backend.stop()
        sys.exit(1)
