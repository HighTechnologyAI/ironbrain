#!/bin/bash
# Pro Mega Spot Technology AI - Ground Control Station
# Jetson Nano Installation Script
# 
# This script installs and configures the optimized GCS for Jetson Nano
# with all necessary dependencies and optimizations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GCS_USER="gcs"
GCS_HOME="/home/$GCS_USER"
GCS_DIR="$GCS_HOME/jetson-nano-gcs"
SERVICE_NAME="jetson-gcs"
PYTHON_VERSION="3.8"

# Logging
LOG_FILE="/var/log/jetson-gcs-install.log"
exec > >(tee -a "$LOG_FILE")
exec 2>&1

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Pro Mega Spot Technology AI${NC}"
echo -e "${BLUE}Jetson Nano GCS Installation${NC}"
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

# Function to check if running on Jetson Nano
check_jetson() {
    print_status "Checking if running on Jetson Nano..."
    
    if [ -f /proc/device-tree/model ]; then
        MODEL=$(cat /proc/device-tree/model 2>/dev/null | tr -d '\0')
        if [[ "$MODEL" == *"jetson"* ]] || [[ "$MODEL" == *"Jetson"* ]]; then
            print_status "Detected Jetson device: $MODEL"
            return 0
        fi
    fi
    
    print_warning "Not running on Jetson hardware, but continuing installation..."
    return 0
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Ubuntu version
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        print_status "OS: $NAME $VERSION"
        
        if [[ "$VERSION_ID" < "18.04" ]]; then
            print_error "Ubuntu 18.04 or later required"
            exit 1
        fi
    fi
    
    # Check available memory
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [ "$TOTAL_MEM" -lt 3000 ]; then
        print_warning "Low memory detected: ${TOTAL_MEM}MB (recommended: 4GB+)"
    else
        print_status "Memory: ${TOTAL_MEM}MB"
    fi
    
    # Check available disk space
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    AVAILABLE_GB=$((AVAILABLE_SPACE / 1024 / 1024))
    if [ "$AVAILABLE_GB" -lt 5 ]; then
        print_error "Insufficient disk space: ${AVAILABLE_GB}GB (minimum: 5GB)"
        exit 1
    else
        print_status "Available disk space: ${AVAILABLE_GB}GB"
    fi
}

# Function to create GCS user
create_user() {
    print_status "Creating GCS user..."
    
    if id "$GCS_USER" &>/dev/null; then
        print_status "User $GCS_USER already exists"
    else
        sudo useradd -m -s /bin/bash "$GCS_USER"
        sudo usermod -aG sudo,dialout,video "$GCS_USER"
        print_status "Created user $GCS_USER"
    fi
    
    # Set up user directories
    sudo -u "$GCS_USER" mkdir -p "$GCS_HOME"/{logs,config,data}
}

# Function to install system dependencies
install_system_deps() {
    print_status "Installing system dependencies..."
    
    # Update package list
    sudo apt update
    
    # Install essential packages
    sudo apt install -y \
        python3 \
        python3-pip \
        python3-dev \
        python3-venv \
        nodejs \
        npm \
        git \
        curl \
        wget \
        build-essential \
        cmake \
        pkg-config \
        libjpeg-dev \
        libpng-dev \
        libtiff-dev \
        libavcodec-dev \
        libavformat-dev \
        libswscale-dev \
        libv4l-dev \
        libxvidcore-dev \
        libx264-dev \
        libgtk-3-dev \
        libatlas-base-dev \
        gfortran \
        python3-numpy \
        htop \
        iotop \
        screen \
        tmux \
        nano \
        vim
    
    print_status "System dependencies installed"
}

# Function to install Jetson-specific packages
install_jetson_deps() {
    print_status "Installing Jetson-specific dependencies..."
    
    # Install GStreamer for hardware-accelerated video
    sudo apt install -y \
        gstreamer1.0-tools \
        gstreamer1.0-plugins-base \
        gstreamer1.0-plugins-good \
        gstreamer1.0-plugins-bad \
        gstreamer1.0-plugins-ugly \
        gstreamer1.0-libav \
        libgstreamer1.0-dev \
        libgstreamer-plugins-base1.0-dev \
        python3-gst-1.0
    
    # Install OpenCV with GStreamer support (if not already installed)
    if ! python3 -c "import cv2" 2>/dev/null; then
        print_status "Installing OpenCV..."
        sudo apt install -y python3-opencv
    fi
    
    # Install additional Jetson tools
    if command -v tegrastats >/dev/null 2>&1; then
        print_status "Tegrastats available for monitoring"
    else
        print_warning "Tegrastats not available"
    fi
    
    print_status "Jetson-specific dependencies installed"
}

# Function to install Python dependencies
install_python_deps() {
    print_status "Installing Python dependencies..."
    
    # Upgrade pip
    sudo python3 -m pip install --upgrade pip
    
    # Install global Python packages
    sudo python3 -m pip install \
        virtualenv \
        wheel \
        setuptools
    
    print_status "Python dependencies installed"
}

# Function to install Node.js dependencies
install_nodejs_deps() {
    print_status "Installing Node.js dependencies..."
    
    # Update npm
    sudo npm install -g npm@latest
    
    # Install global packages
    sudo npm install -g \
        pm2 \
        serve
    
    print_status "Node.js dependencies installed"
}

# Function to clone and setup GCS
setup_gcs() {
    print_status "Setting up GCS application..."
    
    # Create GCS directory
    sudo -u "$GCS_USER" mkdir -p "$GCS_DIR"
    
    # Copy application files (assuming they're in current directory)
    if [ -d "gcs-backend" ] && [ -d "gcs-frontend" ]; then
        print_status "Copying GCS files..."
        sudo cp -r gcs-backend gcs-frontend "$GCS_DIR/"
        sudo cp quick_test.py test_system.py "$GCS_DIR/"
        sudo chown -R "$GCS_USER:$GCS_USER" "$GCS_DIR"
    else
        print_error "GCS source files not found in current directory"
        exit 1
    fi
    
    # Setup backend
    print_status "Setting up backend..."
    cd "$GCS_DIR/gcs-backend"
    sudo -u "$GCS_USER" python3 -m venv venv
    sudo -u "$GCS_USER" bash -c "source venv/bin/activate && pip install -r requirements.txt"
    
    # Setup frontend
    print_status "Setting up frontend..."
    cd "$GCS_DIR/gcs-frontend"
    sudo -u "$GCS_USER" npm install
    sudo -u "$GCS_USER" npm run build
    
    print_status "GCS application setup complete"
}

# Function to create systemd service
create_service() {
    print_status "Creating systemd service..."
    
    # Create service file
    sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=Pro Mega Spot Technology AI - Jetson Nano GCS
After=network.target
Wants=network.target

[Service]
Type=simple
User=$GCS_USER
Group=$GCS_USER
WorkingDirectory=$GCS_DIR/gcs-backend
Environment=PATH=$GCS_DIR/gcs-backend/venv/bin
ExecStart=$GCS_DIR/gcs-backend/venv/bin/python run.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

# Resource limits for Jetson Nano
MemoryLimit=512M
CPUQuota=200%

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$GCS_HOME

[Install]
WantedBy=multi-user.target
EOF

    # Create frontend service
    sudo tee /etc/systemd/system/${SERVICE_NAME}-frontend.service > /dev/null <<EOF
[Unit]
Description=Pro Mega Spot Technology AI - Frontend Server
After=network.target ${SERVICE_NAME}.service
Wants=network.target

[Service]
Type=simple
User=$GCS_USER
Group=$GCS_USER
WorkingDirectory=$GCS_DIR/gcs-frontend
ExecStart=/usr/bin/serve -s dist -l 3000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}-frontend

# Resource limits
MemoryLimit=256M
CPUQuota=100%

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable services
    sudo systemctl daemon-reload
    sudo systemctl enable ${SERVICE_NAME}
    sudo systemctl enable ${SERVICE_NAME}-frontend
    
    print_status "Systemd services created and enabled"
}

# Function to configure system optimizations
configure_optimizations() {
    print_status "Configuring system optimizations for Jetson Nano..."
    
    # Create optimization script
    sudo tee /usr/local/bin/jetson-gcs-optimize > /dev/null <<'EOF'
#!/bin/bash
# Jetson Nano GCS Optimization Script

# Set CPU governor to performance
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Increase GPU frequency (if available)
if [ -f /sys/devices/gpu.0/devfreq/57000000.gpu/governor ]; then
    echo performance | sudo tee /sys/devices/gpu.0/devfreq/57000000.gpu/governor
fi

# Optimize memory settings
echo 1 | sudo tee /proc/sys/vm/compact_memory
echo 3 | sudo tee /proc/sys/vm/drop_caches

# Set network optimizations
echo 'net.core.rmem_max = 16777216' | sudo tee -a /etc/sysctl.conf
echo 'net.core.wmem_max = 16777216' | sudo tee -a /etc/sysctl.conf

echo "Jetson Nano optimizations applied"
EOF

    sudo chmod +x /usr/local/bin/jetson-gcs-optimize
    
    # Create optimization service
    sudo tee /etc/systemd/system/jetson-gcs-optimize.service > /dev/null <<EOF
[Unit]
Description=Jetson Nano GCS Optimizations
After=multi-user.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/jetson-gcs-optimize
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable jetson-gcs-optimize
    
    print_status "System optimizations configured"
}

# Function to create configuration files
create_config() {
    print_status "Creating configuration files..."
    
    # Create main config
    sudo -u "$GCS_USER" tee "$GCS_HOME/config/gcs.conf" > /dev/null <<EOF
# Pro Mega Spot Technology AI - GCS Configuration

[server]
host = 0.0.0.0
port = 5000
debug = false

[video]
default_source = test
hardware_accel = true
max_resolution = 1280x720
target_fps = 30

[mavlink]
default_connection = udp:0.0.0.0:14550
heartbeat_rate = 1.0
update_rate = 30.0

[performance]
auto_optimization = true
memory_limit_mb = 512
cpu_limit_percent = 80

[logging]
level = INFO
file = $GCS_HOME/logs/gcs.log
max_size_mb = 100
backup_count = 5
EOF

    # Create environment file
    sudo -u "$GCS_USER" tee "$GCS_HOME/config/.env" > /dev/null <<EOF
# Environment variables for GCS
FLASK_ENV=production
FLASK_DEBUG=false
GCS_CONFIG_FILE=$GCS_HOME/config/gcs.conf
GCS_LOG_DIR=$GCS_HOME/logs
GCS_DATA_DIR=$GCS_HOME/data
EOF

    print_status "Configuration files created"
}

# Function to setup log rotation
setup_logging() {
    print_status "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/jetson-gcs > /dev/null <<EOF
$GCS_HOME/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $GCS_USER $GCS_USER
    postrotate
        systemctl reload $SERVICE_NAME
    endscript
}
EOF

    print_status "Log rotation configured"
}

# Function to create management scripts
create_management_scripts() {
    print_status "Creating management scripts..."
    
    # Create start script
    sudo tee /usr/local/bin/gcs-start > /dev/null <<EOF
#!/bin/bash
echo "Starting Pro Mega Spot Technology AI GCS..."
sudo systemctl start jetson-gcs-optimize
sudo systemctl start $SERVICE_NAME
sudo systemctl start ${SERVICE_NAME}-frontend
echo "GCS started successfully"
systemctl status $SERVICE_NAME --no-pager -l
EOF

    # Create stop script
    sudo tee /usr/local/bin/gcs-stop > /dev/null <<EOF
#!/bin/bash
echo "Stopping Pro Mega Spot Technology AI GCS..."
sudo systemctl stop ${SERVICE_NAME}-frontend
sudo systemctl stop $SERVICE_NAME
echo "GCS stopped successfully"
EOF

    # Create status script
    sudo tee /usr/local/bin/gcs-status > /dev/null <<EOF
#!/bin/bash
echo "Pro Mega Spot Technology AI GCS Status:"
echo "========================================"
systemctl status $SERVICE_NAME --no-pager -l
echo ""
systemctl status ${SERVICE_NAME}-frontend --no-pager -l
echo ""
echo "System Resources:"
echo "=================="
free -h
echo ""
df -h /
echo ""
if command -v tegrastats >/dev/null 2>&1; then
    echo "Jetson Stats:"
    echo "============="
    timeout 3 tegrastats
fi
EOF

    # Create logs script
    sudo tee /usr/local/bin/gcs-logs > /dev/null <<EOF
#!/bin/bash
if [ "\$1" = "follow" ] || [ "\$1" = "-f" ]; then
    journalctl -u $SERVICE_NAME -f
else
    journalctl -u $SERVICE_NAME --no-pager -l
fi
EOF

    # Make scripts executable
    sudo chmod +x /usr/local/bin/gcs-{start,stop,status,logs}
    
    print_status "Management scripts created"
}

# Function to run post-installation tests
run_tests() {
    print_status "Running post-installation tests..."
    
    cd "$GCS_DIR"
    
    # Run quick test
    if sudo -u "$GCS_USER" python3 quick_test.py; then
        print_status "Quick test passed"
    else
        print_warning "Quick test failed, but installation continues"
    fi
    
    print_status "Post-installation tests completed"
}

# Function to display final instructions
show_final_instructions() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Installation Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Pro Mega Spot Technology AI Ground Control Station${NC}"
    echo -e "${BLUE}has been successfully installed on Jetson Nano${NC}"
    echo ""
    echo -e "${YELLOW}Management Commands:${NC}"
    echo "  gcs-start    - Start the GCS services"
    echo "  gcs-stop     - Stop the GCS services"
    echo "  gcs-status   - Check service status"
    echo "  gcs-logs     - View service logs"
    echo ""
    echo -e "${YELLOW}Service Information:${NC}"
    echo "  Backend:  http://localhost:5000"
    echo "  Frontend: http://localhost:3000"
    echo "  User:     $GCS_USER"
    echo "  Home:     $GCS_HOME"
    echo "  Config:   $GCS_HOME/config/"
    echo "  Logs:     $GCS_HOME/logs/"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Start the services: sudo gcs-start"
    echo "2. Check status: gcs-status"
    echo "3. Access the web interface at http://localhost:3000"
    echo "4. Configure MAVLink connection in settings"
    echo "5. Connect your drone and start flying!"
    echo ""
    echo -e "${GREEN}Installation log saved to: $LOG_FILE${NC}"
    echo ""
}

# Main installation function
main() {
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root (use sudo)"
        exit 1
    fi
    
    # Run installation steps
    check_jetson
    check_requirements
    create_user
    install_system_deps
    install_jetson_deps
    install_python_deps
    install_nodejs_deps
    setup_gcs
    create_service
    configure_optimizations
    create_config
    setup_logging
    create_management_scripts
    run_tests
    show_final_instructions
    
    print_status "Installation completed successfully!"
}

# Run main function
main "$@"

