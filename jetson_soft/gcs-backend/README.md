# Pro Mega Spot Technology AI GCS Backend

Optimized Flask backend for Jetson Nano with minimal resource usage and maximum performance.

## 🎯 Features

- **Memory Efficient**: Designed for 4GB RAM constraint
- **Hardware Accelerated**: Utilizes Jetson Nano GPU for video processing
- **Real-time Communication**: WebSocket support for live telemetry
- **MAVLink Integration**: Full autopilot communication
- **Video Streaming**: Hardware-accelerated H.264/H.265 support
- **Mission Planning**: Waypoint management and flight planning
- **System Monitoring**: Real-time performance monitoring

## 🚀 Quick Start

### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install system dependencies
sudo apt install -y python3-pip python3-venv python3-dev
sudo apt install -y python3-opencv python3-numpy python3-psutil
sudo apt install -y gstreamer1.0-tools gstreamer1.0-plugins-base
sudo apt install -y gstreamer1.0-plugins-good gstreamer1.0-plugins-bad
sudo apt install -y gstreamer1.0-libav python3-gst-1.0
```

### Installation

```bash
# Clone or copy the backend code
cd jetson-nano-gcs/gcs-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Running the Backend

```bash
# Development mode
python3 run.py --debug

# Production mode
python3 run.py --host 0.0.0.0 --port 5000

# Background service
nohup python3 run.py > /tmp/gcs_backend.log 2>&1 &
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### MAVLink Control
```
POST /api/mavlink/connect
POST /api/mavlink/disconnect
POST /api/mavlink/command
GET  /api/mavlink/telemetry
```

### Video Streaming
```
POST /api/video/start
POST /api/video/stop
GET  /api/video/status
```

### Mission Planning
```
GET  /api/mission/waypoints
POST /api/mission/waypoints
POST /api/mission/upload
```

### System Monitoring
```
GET /api/system/stats
```

## 🔌 WebSocket Events

### Client → Server
- `connect` - Client connection
- `request_telemetry` - Request telemetry data
- `send_command` - Send MAVLink command

### Server → Client
- `telemetry_update` - Real-time telemetry (10Hz)
- `system_status` - System metrics (1Hz)
- `command_result` - Command execution result

## 🎥 Video Sources

### Supported Sources

1. **Test Pattern** (`test`)
   ```json
   {
     "source": "test",
     "width": 1280,
     "height": 720,
     "fps": 30
   }
   ```

2. **Nighthawk2-UZ Camera** (`nighthawk`)
   ```json
   {
     "source": "nighthawk",
     "ip": "192.168.1.100",
     "port": 554,
     "username": "admin",
     "password": "admin"
   }
   ```

3. **RTSP Stream** (`rtsp`)
   ```json
   {
     "source": "rtsp",
     "url": "rtsp://192.168.1.100:554/stream1"
   }
   ```

4. **UDP Stream** (`udp`)
   ```json
   {
     "source": "udp",
     "port": 5000
   }
   ```

5. **USB Camera** (`usb`)
   ```json
   {
     "source": "usb",
     "device": "/dev/video0",
     "width": 1280,
     "height": 720,
     "fps": 30
   }
   ```

## 🛠️ Configuration

### Environment Variables

```bash
# Optional configuration
export GCS_LOG_LEVEL=INFO
export GCS_MAX_CLIENTS=10
export GCS_VIDEO_BITRATE=2000000
export GCS_TELEMETRY_RATE=10
```

### Settings File

Create `config.json` in the backend directory:

```json
{
  "mavlink": {
    "connection_string": "udp:0.0.0.0:14550",
    "heartbeat_rate": 1.0
  },
  "video": {
    "hardware_accel": true,
    "target_fps": 30,
    "bitrate": 2000000,
    "quality": "medium"
  },
  "system": {
    "monitor_interval": 1.0,
    "history_size": 300,
    "enable_optimization": true
  }
}
```

## 📊 Performance Optimization

### Memory Usage
- **Target**: < 350MB total
- **Baseline**: ~100MB Flask + services
- **Video**: ~150MB buffers
- **Telemetry**: ~50MB history

### CPU Usage
- **Target**: < 50% average
- **Video**: Hardware acceleration reduces CPU load
- **Telemetry**: Optimized parsing (10Hz)
- **WebSocket**: Efficient broadcasting

### Network
- **Video**: Adaptive bitrate (1-5 Mbps)
- **Telemetry**: ~1KB/s
- **Commands**: Minimal overhead

## 🔧 Troubleshooting

### Common Issues

1. **High Memory Usage**
   ```bash
   # Check memory
   free -h
   
   # Restart backend
   sudo systemctl restart gcs-backend
   ```

2. **Video Not Working**
   ```bash
   # Check GStreamer
   gst-inspect-1.0 nvh264dec
   
   # Test pipeline
   gst-launch-1.0 videotestsrc ! autovideosink
   ```

3. **MAVLink Connection Failed**
   ```bash
   # Check port
   netstat -an | grep 14550
   
   # Test connection
   mavproxy.py --master=udp:127.0.0.1:14550
   ```

### Performance Monitoring

```bash
# System resources
htop

# GPU usage (Jetson)
sudo tegrastats

# Network traffic
iftop

# Backend logs
tail -f /tmp/gcs_backend.log
```

## 🔒 Security

### Production Deployment

1. **Change default secrets**
2. **Enable HTTPS** (use nginx proxy)
3. **Firewall configuration**
4. **Regular updates**

### Network Security

```bash
# Firewall rules
sudo ufw allow 5000/tcp  # Backend API
sudo ufw allow 14550/udp # MAVLink
sudo ufw allow 5600/udp  # Video stream
```

## 📈 Monitoring

### System Health

The backend provides comprehensive monitoring:

- CPU, Memory, GPU usage
- Temperature monitoring
- Network statistics
- Performance alerts
- Automatic optimization

### Alerts

- **Warning**: Resource usage > 80%
- **Critical**: Resource usage > 95%
- **Temperature**: CPU > 70°C
- **Storage**: Disk usage > 80%

## 🚀 Deployment

### Systemd Service

Create `/etc/systemd/system/gcs-backend.service`:

```ini
[Unit]
Description=Pro Mega Spot Technology AI GCS Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/jetson-nano-gcs/gcs-backend
ExecStart=/home/ubuntu/jetson-nano-gcs/gcs-backend/venv/bin/python run.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
sudo systemctl enable gcs-backend
sudo systemctl start gcs-backend
sudo systemctl status gcs-backend
```

## 📝 Development

### Adding New Features

1. **Create service** in `src/services/`
2. **Add routes** in `src/main.py`
3. **Update requirements** if needed
4. **Test thoroughly** on Jetson Nano

### Code Structure

```
gcs-backend/
├── src/
│   ├── main.py              # Main Flask application
│   ├── services/
│   │   ├── mavlink_service.py    # MAVLink communication
│   │   ├── video_service.py      # Video streaming
│   │   ├── mission_service.py    # Mission planning
│   │   └── system_monitor.py     # System monitoring
│   └── static/              # Frontend files (if any)
├── requirements.txt         # Python dependencies
├── run.py                  # Production runner
└── README.md              # This file
```

## 🤝 Contributing

1. Test on actual Jetson Nano hardware
2. Monitor resource usage
3. Follow memory optimization guidelines
4. Document performance impact

## 📄 License

Pro Mega Spot Technology AI - Proprietary Software

---

**Optimized for Jetson Nano** 🚀
**Memory Efficient** 💾
**Hardware Accelerated** ⚡

