#!/bin/bash
# IronBrain Jetson Deployment Script
# Author: Manus AI
# Date: 2025-08-19
# Version: 1.0

set -e

echo "🚁 Starting IronBrain Jetson Deployment..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция логирования
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Проверка прав sudo
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root, use sudo when needed"
fi

# Обновление системы
log "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
log "Installing required packages..."
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    wget \
    git \
    vim \
    tmux \
    htop \
    net-tools \
    screen

# Установка Python зависимостей
log "Installing Python dependencies..."
pip3 install --user \
    pymavlink \
    requests \
    pyserial

# Создание рабочих директорий
log "Creating working directories..."
mkdir -p ~/ironbrain-real/{logs,configs,scripts}
mkdir -p ~/.local/bin

# Копирование скриптов
log "Deploying Jetson scripts..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

cp "$SCRIPT_DIR/tcp_mavlink_bridge.py" ~/ironbrain-real/
cp "$SCRIPT_DIR/orange_cube_setup.py" ~/ironbrain-real/

# Настройка прав доступа
chmod +x ~/ironbrain-real/*.py

# Проверка автопилота
log "Checking autopilot connection..."
if [ -e "/dev/ttyACM0" ]; then
    info "✅ Autopilot found at /dev/ttyACM0"
    # Проверка прав доступа
    if [ -r "/dev/ttyACM0" ] && [ -w "/dev/ttyACM0" ]; then
        info "✅ Read/write access to autopilot confirmed"
    else
        warning "⚠️ Adding user to dialout group for serial access"
        sudo usermod -a -G dialout $USER
        info "Please logout and login again for group changes to take effect"
    fi
else
    warning "⚠️ Autopilot not found at /dev/ttyACM0"
    info "Please connect Orange Cube and run: ls -la /dev/ttyACM*"
fi

# Установка ngrok (если не установлен)
log "Checking ngrok installation..."
if ! command -v ngrok &> /dev/null; then
    log "Installing ngrok..."
    wget -q https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
    tar xzf ngrok-v3-stable-linux-arm64.tgz
    sudo mv ngrok /usr/local/bin/
    rm ngrok-v3-stable-linux-arm64.tgz
    info "✅ ngrok installed"
else
    info "✅ ngrok already installed"
fi

# Создание systemd сервисов
log "Creating systemd services..."

# TCP MAVLink Bridge сервис
sudo tee /etc/systemd/system/ironbrain-tcp-bridge.service > /dev/null << EOF
[Unit]
Description=IronBrain TCP MAVLink Bridge
After=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=/home/$USER/ironbrain-real
Environment=PATH=/usr/bin:/usr/local/bin:/home/$USER/.local/bin
ExecStart=/usr/bin/python3 /home/$USER/ironbrain-real/tcp_mavlink_bridge.py
Restart=always
RestartSec=10
StandardOutput=append:/home/$USER/ironbrain-real/logs/tcp_bridge.log
StandardError=append:/home/$USER/ironbrain-real/logs/tcp_bridge_error.log

[Install]
WantedBy=multi-user.target
EOF

# Ngrok SSH туннель сервис
sudo tee /etc/systemd/system/ironbrain-ngrok-ssh.service > /dev/null << EOF
[Unit]
Description=IronBrain Ngrok SSH Tunnel
After=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=/home/$USER
ExecStart=/usr/local/bin/ngrok tcp 22
Restart=always
RestartSec=30
StandardOutput=append:/home/$USER/ironbrain-real/logs/ngrok_ssh.log
StandardError=append:/home/$USER/ironbrain-real/logs/ngrok_ssh_error.log

[Install]
WantedBy=multi-user.target
EOF

# Создание скриптов управления
log "Creating management scripts..."

# Скрипт запуска TCP моста
cat > ~/ironbrain-real/scripts/start_tcp_bridge.sh << 'EOF'
#!/bin/bash
# Запуск TCP MAVLink моста

echo "🚁 Starting TCP MAVLink Bridge..."

# Остановка существующих процессов
pkill -f "tcp_mavlink_bridge.py" || true
sleep 2

# Запуск в screen сессии
screen -dmS tcp_bridge bash -c "cd ~/ironbrain-real && python3 tcp_mavlink_bridge.py"

echo "✅ TCP Bridge started in screen session 'tcp_bridge'"
echo "📋 View logs: screen -r tcp_bridge"
echo "🛑 Stop: screen -S tcp_bridge -X quit"
EOF

# Скрипт настройки ngrok
cat > ~/ironbrain-real/scripts/setup_ngrok.sh << 'EOF'
#!/bin/bash
# Настройка ngrok туннелей

echo "🌐 Setting up ngrok tunnels..."

# Остановка существующих ngrok процессов
pkill ngrok || true
sleep 3

# Запуск SSH туннеля
echo "🔐 Starting SSH tunnel..."
screen -dmS ngrok_ssh bash -c "ngrok tcp 22"
sleep 5

# Запуск MAVLink туннеля
echo "📡 Starting MAVLink tunnel..."
screen -dmS ngrok_mavlink bash -c "ngrok tcp 14560"
sleep 5

# Получение URL туннелей
echo "📋 Tunnel URLs:"
curl -s http://localhost:4040/api/tunnels | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for tunnel in data['tunnels']:
        print(f'{tunnel[\"name\"]}: {tunnel[\"public_url\"]}')
except:
    print('Failed to get tunnel info')
"

echo "✅ Ngrok tunnels configured"
echo "📋 View SSH session: screen -r ngrok_ssh"
echo "📋 View MAVLink session: screen -r ngrok_mavlink"
EOF

# Скрипт мониторинга системы
cat > ~/ironbrain-real/scripts/system_monitor.sh << 'EOF'
#!/bin/bash
# Мониторинг системы IronBrain

LOG_FILE="$HOME/ironbrain-real/logs/system_monitor.log"

log_message() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Проверка автопилота
if [ -e "/dev/ttyACM0" ]; then
    log_message "✅ Autopilot connected"
else
    log_message "❌ Autopilot not found"
fi

# Проверка TCP моста
if pgrep -f "tcp_mavlink_bridge.py" > /dev/null; then
    log_message "✅ TCP Bridge running"
else
    log_message "❌ TCP Bridge not running"
fi

# Проверка ngrok
if pgrep ngrok > /dev/null; then
    log_message "✅ Ngrok running"
    # Получение URL
    TUNNEL_INFO=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null || echo "Failed to get tunnel info")
    log_message "📡 Tunnel info: $TUNNEL_INFO"
else
    log_message "❌ Ngrok not running"
fi

# Проверка ресурсов
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
DISK_USAGE=$(df /home | awk 'NR==2 {print $5}' | sed 's/%//')

log_message "📊 CPU: ${CPU_USAGE}%, Memory: ${MEM_USAGE}%, Disk: ${DISK_USAGE}%"

# Проверка температуры (если доступно)
if [ -f "/sys/class/thermal/thermal_zone0/temp" ]; then
    TEMP=$(cat /sys/class/thermal/thermal_zone0/temp)
    TEMP_C=$((TEMP/1000))
    log_message "🌡️ Temperature: ${TEMP_C}°C"
fi

log_message "✅ System monitor check completed"
EOF

# Делаем скрипты исполняемыми
chmod +x ~/ironbrain-real/scripts/*.sh

# Создание алиасов
log "Creating command aliases..."
cat >> ~/.bashrc << 'EOF'

# IronBrain aliases
alias ib-start='~/ironbrain-real/scripts/start_tcp_bridge.sh'
alias ib-ngrok='~/ironbrain-real/scripts/setup_ngrok.sh'
alias ib-monitor='~/ironbrain-real/scripts/system_monitor.sh'
alias ib-logs='tail -f ~/ironbrain-real/logs/*.log'
alias ib-status='systemctl status ironbrain-*'
EOF

# Создание cron задач
log "Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "*/5 * * * * ~/ironbrain-real/scripts/system_monitor.sh") | crontab -

# Перезагрузка systemd
log "Configuring systemd services..."
sudo systemctl daemon-reload
sudo systemctl enable ironbrain-tcp-bridge
sudo systemctl enable ironbrain-ngrok-ssh

# Создание информационного файла
log "Creating system info..."
cat > ~/ironbrain-real/system_info.txt << EOF
IronBrain Jetson Deployment Information
======================================
Deployment Date: $(date)
Jetson IP: $(hostname -I | awk '{print $1}')
OS: $(lsb_release -d | cut -f2)
Kernel: $(uname -r)

Services:
- TCP MAVLink Bridge: Port 14560
- Ngrok SSH: Dynamic port
- Ngrok MAVLink: Dynamic port

Scripts:
- Start TCP Bridge: ib-start
- Setup Ngrok: ib-ngrok
- System Monitor: ib-monitor
- View Logs: ib-logs
- Service Status: ib-status

Files:
- TCP Bridge: ~/ironbrain-real/tcp_mavlink_bridge.py
- Orange Cube Setup: ~/ironbrain-real/orange_cube_setup.py
- Logs: ~/ironbrain-real/logs/

Management:
- Start services: sudo systemctl start ironbrain-tcp-bridge
- Stop services: sudo systemctl stop ironbrain-tcp-bridge
- View logs: journalctl -u ironbrain-tcp-bridge -f
- Screen sessions: screen -list

Autopilot:
- Device: /dev/ttyACM0
- Baud: 921600
- Protocol: MAVLink2
EOF

log "🎉 IronBrain Jetson deployment completed!"
log "📋 System information saved to ~/ironbrain-real/system_info.txt"
log "🔍 Check logs in ~/ironbrain-real/logs/"

echo ""
echo "🚁 Deployment Summary:"
echo "====================="
echo "✅ System packages updated"
echo "✅ Python dependencies installed"
echo "✅ MAVLink scripts deployed"
echo "✅ Systemd services created"
echo "✅ Management scripts created"
echo "✅ Command aliases added"
echo "✅ System monitoring enabled"
echo ""
echo "🔗 Next steps:"
echo "1. Logout and login to apply group changes"
echo "2. Run: ib-ngrok (setup ngrok tunnels)"
echo "3. Run: ib-start (start TCP bridge)"
echo "4. Run: ib-monitor (check system status)"
echo ""
echo "📞 Support: Check ~/ironbrain-real/system_info.txt for details"

