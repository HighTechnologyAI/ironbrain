# Installation Guide

## Prerequisites

- NVIDIA Jetson Nano with JetPack 4.4 or later
- Ubuntu 18.04/20.04
- Root access (sudo)
- Internet connection

## Step-by-Step Installation

### 1. Prepare the System

Update your system:
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Extract Package

```bash
tar -xzf jetson-nano-gcs-*.tar.gz
cd jetson-nano-gcs-*
```

### 3. Run Installation

```bash
sudo ./install_jetson.sh
```

The installation script will:
- Install system dependencies
- Create GCS user and directories
- Set up Python and Node.js environments
- Configure systemd services
- Apply Jetson-specific optimizations

### 4. Verify Installation

```bash
gcs-status
```

### 5. Start Services

```bash
sudo gcs-start
```

### 6. Access Web Interface

Open your browser to: http://localhost:3000

## Post-Installation

### Configure MAVLink Connection

1. Open the web interface
2. Go to Settings
3. Set MAVLink connection string (e.g., `udp:0.0.0.0:14550`)
4. Click Connect

### Configure Video Source

1. Go to Video settings
2. Select source type (camera, RTSP, UDP)
3. Configure source parameters
4. Enable hardware acceleration if available

## Troubleshooting

### Installation Fails

Check the installation log:
```bash
sudo tail -f /var/log/jetson-gcs-install.log
```

### Services Don't Start

Check service status:
```bash
systemctl status jetson-gcs
systemctl status jetson-gcs-frontend
```

### Memory Issues

Monitor system resources:
```bash
free -h
htop
```

Consider enabling swap:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```
