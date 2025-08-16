#!/bin/bash
# Pro Mega Spot Technology AI - Ground Control Station
# Package Creation Script
# 
# This script creates a deployment package for Jetson Nano GCS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PACKAGE_NAME="jetson-nano-gcs"
VERSION=$(date +%Y.%m.%d)
PACKAGE_DIR="/tmp/${PACKAGE_NAME}-${VERSION}"
ARCHIVE_NAME="${PACKAGE_NAME}-${VERSION}.tar.gz"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Pro Mega Spot Technology AI${NC}"
echo -e "${BLUE}Package Creation for Jetson Nano GCS${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -d "$PROJECT_DIR/gcs-backend" ] || [ ! -d "$PROJECT_DIR/gcs-frontend" ]; then
        print_error "Project directories not found"
        print_error "Please run this script from the project root or deploy directory"
        exit 1
    fi
    
    # Check required tools
    for tool in tar gzip; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            print_error "Required tool not found: $tool"
            exit 1
        fi
    done
    
    print_status "Prerequisites check passed"
}

# Function to create package directory
create_package_dir() {
    print_status "Creating package directory..."
    
    # Remove existing package directory
    if [ -d "$PACKAGE_DIR" ]; then
        rm -rf "$PACKAGE_DIR"
    fi
    
    mkdir -p "$PACKAGE_DIR"
    print_status "Package directory created: $PACKAGE_DIR"
}

# Function to copy application files
copy_application() {
    print_status "Copying application files..."
    
    # Copy backend
    cp -r "$PROJECT_DIR/gcs-backend" "$PACKAGE_DIR/"
    
    # Copy frontend
    cp -r "$PROJECT_DIR/gcs-frontend" "$PACKAGE_DIR/"
    
    # Copy test scripts
    cp "$PROJECT_DIR/quick_test.py" "$PACKAGE_DIR/" 2>/dev/null || true
    cp "$PROJECT_DIR/test_system.py" "$PACKAGE_DIR/" 2>/dev/null || true
    
    print_status "Application files copied"
}

# Function to copy deployment scripts
copy_deployment_scripts() {
    print_status "Copying deployment scripts..."
    
    mkdir -p "$PACKAGE_DIR/deploy"
    
    # Copy deployment scripts
    cp "$SCRIPT_DIR/install_jetson.sh" "$PACKAGE_DIR/"
    cp "$SCRIPT_DIR/update_gcs.sh" "$PACKAGE_DIR/deploy/"
    cp "$SCRIPT_DIR/create_package.sh" "$PACKAGE_DIR/deploy/"
    
    # Make scripts executable
    chmod +x "$PACKAGE_DIR/install_jetson.sh"
    chmod +x "$PACKAGE_DIR/deploy/"*.sh
    
    print_status "Deployment scripts copied"
}

# Function to create configuration templates
create_config_templates() {
    print_status "Creating configuration templates..."
    
    mkdir -p "$PACKAGE_DIR/config"
    
    # Create main configuration template
    cat > "$PACKAGE_DIR/config/gcs.conf.template" <<EOF
# Pro Mega Spot Technology AI - GCS Configuration Template
# Copy this file to /home/gcs/config/gcs.conf and customize

[server]
host = 0.0.0.0
port = 5000
debug = false

[video]
default_source = test
hardware_accel = true
max_resolution = 1280x720
target_fps = 30
bitrate = 2000000

[mavlink]
default_connection = udp:0.0.0.0:14550
heartbeat_rate = 1.0
update_rate = 30.0
timeout = 10.0

[performance]
auto_optimization = true
memory_limit_mb = 512
cpu_limit_percent = 80
monitor_interval = 1.0

[logging]
level = INFO
file = /home/gcs/logs/gcs.log
max_size_mb = 100
backup_count = 5

[security]
enable_cors = true
allowed_origins = *
api_key_required = false
EOF

    # Create environment template
    cat > "$PACKAGE_DIR/config/.env.template" <<EOF
# Environment variables for GCS
# Copy this file to /home/gcs/config/.env and customize

FLASK_ENV=production
FLASK_DEBUG=false
GCS_CONFIG_FILE=/home/gcs/config/gcs.conf
GCS_LOG_DIR=/home/gcs/logs
GCS_DATA_DIR=/home/gcs/data

# Optional: Custom settings
# MAVLINK_CONNECTION=udp:0.0.0.0:14550
# VIDEO_SOURCE=camera
# HARDWARE_ACCEL=true
EOF

    print_status "Configuration templates created"
}

# Function to create systemd service files
create_service_files() {
    print_status "Creating systemd service files..."
    
    # Backend service
    cat > "$PACKAGE_DIR/deploy/jetson-gcs.service" <<EOF
[Unit]
Description=Pro Mega Spot Technology AI - Jetson Nano GCS Backend
After=network.target
Wants=network.target

[Service]
Type=simple
User=gcs
Group=gcs
WorkingDirectory=/home/gcs/jetson-nano-gcs/gcs-backend
Environment=PATH=/home/gcs/jetson-nano-gcs/gcs-backend/venv/bin
EnvironmentFile=/home/gcs/config/.env
ExecStart=/home/gcs/jetson-nano-gcs/gcs-backend/venv/bin/python run.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=jetson-gcs

# Resource limits for Jetson Nano
MemoryLimit=512M
CPUQuota=200%

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/home/gcs

[Install]
WantedBy=multi-user.target
EOF

    # Frontend service
    cat > "$PACKAGE_DIR/deploy/jetson-gcs-frontend.service" <<EOF
[Unit]
Description=Pro Mega Spot Technology AI - Frontend Server
After=network.target jetson-gcs.service
Wants=network.target

[Service]
Type=simple
User=gcs
Group=gcs
WorkingDirectory=/home/gcs/jetson-nano-gcs/gcs-frontend
ExecStart=/usr/bin/serve -s dist -l 3000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=jetson-gcs-frontend

# Resource limits
MemoryLimit=256M
CPUQuota=100%

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true

[Install]
WantedBy=multi-user.target
EOF

    print_status "Systemd service files created"
}

# Function to create documentation
create_documentation() {
    print_status "Creating documentation..."
    
    mkdir -p "$PACKAGE_DIR/docs"
    
    # Create README
    cat > "$PACKAGE_DIR/README.md" <<EOF
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
   \`\`\`bash
   tar -xzf jetson-nano-gcs-*.tar.gz
   cd jetson-nano-gcs-*
   \`\`\`

2. Run the installation script:
   \`\`\`bash
   sudo ./install_jetson.sh
   \`\`\`

3. Start the services:
   \`\`\`bash
   sudo gcs-start
   \`\`\`

4. Access the web interface:
   - Open browser to http://localhost:3000

### Management Commands

- \`gcs-start\` - Start all GCS services
- \`gcs-stop\` - Stop all GCS services  
- \`gcs-status\` - Check service status
- \`gcs-logs\` - View service logs

### Configuration

Configuration files are located in \`/home/gcs/config/\`:
- \`gcs.conf\` - Main configuration
- \`.env\` - Environment variables

### Updating

To update to a new version:
\`\`\`bash
sudo ./deploy/update_gcs.sh
\`\`\`

### Troubleshooting

1. **Services won't start**: Check logs with \`gcs-logs\`
2. **High memory usage**: Run \`gcs-status\` to check resources
3. **Video issues**: Ensure GStreamer is installed
4. **MAVLink connection**: Check firewall and connection string

### Support

For technical support, please contact Pro Mega Spot Technology AI support team.

### Version

Version: $VERSION
Build Date: $(date)
Target: NVIDIA Jetson Nano
EOF

    # Create installation guide
    cat > "$PACKAGE_DIR/docs/INSTALLATION.md" <<EOF
# Installation Guide

## Prerequisites

- NVIDIA Jetson Nano with JetPack 4.4 or later
- Ubuntu 18.04/20.04
- Root access (sudo)
- Internet connection

## Step-by-Step Installation

### 1. Prepare the System

Update your system:
\`\`\`bash
sudo apt update && sudo apt upgrade -y
\`\`\`

### 2. Extract Package

\`\`\`bash
tar -xzf jetson-nano-gcs-*.tar.gz
cd jetson-nano-gcs-*
\`\`\`

### 3. Run Installation

\`\`\`bash
sudo ./install_jetson.sh
\`\`\`

The installation script will:
- Install system dependencies
- Create GCS user and directories
- Set up Python and Node.js environments
- Configure systemd services
- Apply Jetson-specific optimizations

### 4. Verify Installation

\`\`\`bash
gcs-status
\`\`\`

### 5. Start Services

\`\`\`bash
sudo gcs-start
\`\`\`

### 6. Access Web Interface

Open your browser to: http://localhost:3000

## Post-Installation

### Configure MAVLink Connection

1. Open the web interface
2. Go to Settings
3. Set MAVLink connection string (e.g., \`udp:0.0.0.0:14550\`)
4. Click Connect

### Configure Video Source

1. Go to Video settings
2. Select source type (camera, RTSP, UDP)
3. Configure source parameters
4. Enable hardware acceleration if available

## Troubleshooting

### Installation Fails

Check the installation log:
\`\`\`bash
sudo tail -f /var/log/jetson-gcs-install.log
\`\`\`

### Services Don't Start

Check service status:
\`\`\`bash
systemctl status jetson-gcs
systemctl status jetson-gcs-frontend
\`\`\`

### Memory Issues

Monitor system resources:
\`\`\`bash
free -h
htop
\`\`\`

Consider enabling swap:
\`\`\`bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
\`\`\`
EOF

    print_status "Documentation created"
}

# Function to create version file
create_version_file() {
    print_status "Creating version file..."
    
    cat > "$PACKAGE_DIR/VERSION" <<EOF
Pro Mega Spot Technology AI - Ground Control Station
Jetson Nano Optimized Version

Version: $VERSION
Build Date: $(date)
Build Host: $(hostname)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "N/A")

Components:
- Backend: Flask + optimized services
- Frontend: React + Vite
- Video: Hardware-accelerated streaming
- MAVLink: Optimized telemetry processing
- Monitoring: Real-time performance tracking

Target Platform: NVIDIA Jetson Nano
Minimum Requirements: 4GB RAM, 5GB storage
EOF

    print_status "Version file created"
}

# Function to clean up package
cleanup_package() {
    print_status "Cleaning up package..."
    
    # Remove development files
    find "$PACKAGE_DIR" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    find "$PACKAGE_DIR" -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    find "$PACKAGE_DIR" -name "*.pyc" -delete 2>/dev/null || true
    find "$PACKAGE_DIR" -name ".git" -type d -exec rm -rf {} + 2>/dev/null || true
    find "$PACKAGE_DIR" -name ".gitignore" -delete 2>/dev/null || true
    find "$PACKAGE_DIR" -name "*.log" -delete 2>/dev/null || true
    
    # Remove virtual environment (will be recreated during installation)
    rm -rf "$PACKAGE_DIR/gcs-backend/venv" 2>/dev/null || true
    
    # Remove build artifacts
    rm -rf "$PACKAGE_DIR/gcs-frontend/dist" 2>/dev/null || true
    rm -rf "$PACKAGE_DIR/gcs-frontend/build" 2>/dev/null || true
    
    print_status "Package cleaned up"
}

# Function to create archive
create_archive() {
    print_status "Creating archive..."
    
    cd "$(dirname "$PACKAGE_DIR")"
    tar -czf "$ARCHIVE_NAME" "$(basename "$PACKAGE_DIR")"
    
    # Move archive to project directory
    mv "$ARCHIVE_NAME" "$PROJECT_DIR/"
    
    # Calculate size and checksum
    ARCHIVE_PATH="$PROJECT_DIR/$ARCHIVE_NAME"
    ARCHIVE_SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)
    ARCHIVE_SHA256=$(sha256sum "$ARCHIVE_PATH" | cut -d' ' -f1)
    
    print_status "Archive created: $ARCHIVE_NAME ($ARCHIVE_SIZE)"
    print_status "SHA256: $ARCHIVE_SHA256"
    
    # Create checksum file
    echo "$ARCHIVE_SHA256  $ARCHIVE_NAME" > "$PROJECT_DIR/${ARCHIVE_NAME}.sha256"
}

# Function to show package summary
show_summary() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Package Creation Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Package Details:${NC}"
    echo "  Name: $ARCHIVE_NAME"
    echo "  Version: $VERSION"
    echo "  Size: $(du -h "$PROJECT_DIR/$ARCHIVE_NAME" | cut -f1)"
    echo "  Location: $PROJECT_DIR/$ARCHIVE_NAME"
    echo ""
    echo -e "${BLUE}Package Contents:${NC}"
    echo "  ✓ Optimized backend (Flask + services)"
    echo "  ✓ Lightweight frontend (React + Vite)"
    echo "  ✓ Installation scripts"
    echo "  ✓ Update scripts"
    echo "  ✓ Configuration templates"
    echo "  ✓ Systemd service files"
    echo "  ✓ Documentation"
    echo ""
    echo -e "${YELLOW}Installation Instructions:${NC}"
    echo "1. Copy $ARCHIVE_NAME to your Jetson Nano"
    echo "2. Extract: tar -xzf $ARCHIVE_NAME"
    echo "3. Install: sudo ./install_jetson.sh"
    echo "4. Start: sudo gcs-start"
    echo "5. Access: http://localhost:3000"
    echo ""
    echo -e "${GREEN}Package ready for deployment!${NC}"
    echo ""
}

# Function to cleanup temporary files
cleanup_temp() {
    print_status "Cleaning up temporary files..."
    
    if [ -d "$PACKAGE_DIR" ]; then
        rm -rf "$PACKAGE_DIR"
    fi
    
    print_status "Temporary files cleaned up"
}

# Main package creation function
main() {
    print_status "Starting package creation for version $VERSION"
    
    # Run package creation steps
    check_prerequisites
    create_package_dir
    copy_application
    copy_deployment_scripts
    create_config_templates
    create_service_files
    create_documentation
    create_version_file
    cleanup_package
    create_archive
    cleanup_temp
    show_summary
    
    print_status "Package creation completed successfully!"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Pro Mega Spot Technology AI - Package Creation Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --version VER  Set custom version (default: current date)"
        echo ""
        echo "This script creates a deployment package for Jetson Nano GCS."
        exit 0
        ;;
    --version)
        if [ -n "${2:-}" ]; then
            VERSION="$2"
            PACKAGE_DIR="/tmp/${PACKAGE_NAME}-${VERSION}"
            ARCHIVE_NAME="${PACKAGE_NAME}-${VERSION}.tar.gz"
            shift 2
        else
            print_error "Version argument required"
            exit 1
        fi
        ;;
esac

# Run main function
main "$@"

