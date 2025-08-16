# Pro Mega Spot Technology AI - Ground Control Station
## Jetson Nano Optimized Version

### Overview

This is an optimized Ground Control Station (GCS) specifically designed for NVIDIA Jetson Nano with limited resources. The system replaces the original Electron-based interface with a lightweight web application while maintaining all core functionality.

### Key Features

- **Ultra-lightweight**: < 200MB memory usage
- **Hardware acceleration**: NVENC/NVDEC support for video
- **Real-time telemetry**: Optimized MAVLink processing
- **Web-based interface**: Modern React frontend
- **Auto-optimization**: Adaptive performance scaling
- **Professional monitoring**: System performance tracking

### System Requirements

- NVIDIA Jetson Nano (4GB recommended)
- Ubuntu 18.04 or later
- 5GB free disk space
- Internet connection for installation

### Quick Installation

1. Extract the package:
   ```bash
   tar -xzf jetson-nano-gcs-*.tar.gz
   cd jetson-nano-gcs-*
   ```

2. Run the installation script:
   ```bash
   sudo ./install_jetson.sh
   ```

3. Start the services:
   ```bash
   sudo gcs-start
   ```

4. Access the web interface:
   - Open browser to http://localhost:3000

### Management Commands

- `gcs-start` - Start all GCS services
- `gcs-stop` - Stop all GCS services  
- `gcs-status` - Check service status
- `gcs-logs` - View service logs

### Configuration

Configuration files are located in `/home/gcs/config/`:
- `gcs.conf` - Main configuration
- `.env` - Environment variables

### Updating

To update to a new version:
```bash
sudo ./deploy/update_gcs.sh
```

### Troubleshooting

1. **Services won't start**: Check logs with `gcs-logs`
2. **High memory usage**: Run `gcs-status` to check resources
3. **Video issues**: Ensure GStreamer is installed
4. **MAVLink connection**: Check firewall and connection string

### Support

For technical support, please contact Pro Mega Spot Technology AI support team.

### Version

Version: 2025.08.06
Build Date: Wed Aug  6 12:08:57 EDT 2025
Target: NVIDIA Jetson Nano
