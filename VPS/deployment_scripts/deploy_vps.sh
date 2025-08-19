#!/bin/bash
# IronBrain VPS Deployment Script
# Author: Manus AI
# Date: 2025-08-19
# Version: 1.0

set -e

echo "🚀 Starting IronBrain VPS Deployment..."

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

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

# Обновление системы
log "Updating system packages..."
apt update && apt upgrade -y

# Установка необходимых пакетов
log "Installing required packages..."
apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    nginx \
    supervisor \
    ufw \
    htop \
    curl \
    wget \
    git \
    vim \
    tmux \
    net-tools

# Создание пользователя ironbrain
log "Creating ironbrain user..."
if ! id "ironbrain" &>/dev/null; then
    useradd -m -s /bin/bash ironbrain
    usermod -aG sudo ironbrain
    info "User ironbrain created"
else
    info "User ironbrain already exists"
fi

# Создание директорий
log "Creating directories..."
mkdir -p /opt/ironbrain/{api,logs,configs,scripts}
mkdir -p /var/log/ironbrain
mkdir -p /var/www/ironbrain/static

# Установка Python зависимостей
log "Installing Python dependencies..."
pip3 install \
    flask \
    flask-cors \
    requests \
    pymavlink \
    gunicorn \
    supervisor

# Копирование файлов API
log "Deploying API services..."
cp /home/ubuntu/ironbrain/VPS/api_services/drone_control_api_v2.py /opt/ironbrain/api/
cp /home/ubuntu/ironbrain/VPS/tcp_proxy/mavlink_tcp_proxy.py /opt/ironbrain/api/

# Настройка прав доступа
chown -R ironbrain:ironbrain /opt/ironbrain
chown -R ironbrain:ironbrain /var/log/ironbrain
chmod +x /opt/ironbrain/api/*.py

# Конфигурация Nginx
log "Configuring Nginx..."
cp /home/ubuntu/ironbrain/VPS/nginx_configs/ironbrain.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/ironbrain.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Тестирование конфигурации Nginx
nginx -t || error "Nginx configuration test failed"

# Создание systemd сервисов
log "Creating systemd services..."

# API v2 сервис
cat > /etc/systemd/system/ironbrain-api-v2.service << EOF
[Unit]
Description=IronBrain API v2 Service
After=network.target

[Service]
Type=simple
User=ironbrain
Group=ironbrain
WorkingDirectory=/opt/ironbrain/api
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/bin/python3 /opt/ironbrain/api/drone_control_api_v2.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# TCP Proxy сервис
cat > /etc/systemd/system/ironbrain-tcp-proxy.service << EOF
[Unit]
Description=IronBrain MAVLink TCP Proxy
After=network.target

[Service]
Type=simple
User=ironbrain
Group=ironbrain
WorkingDirectory=/opt/ironbrain/api
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/bin/python3 /opt/ironbrain/api/mavlink_tcp_proxy.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Конфигурация UFW Firewall
log "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Разрешенные порты
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 3001/tcp    # API v1
ufw allow 3002/tcp    # API v2
ufw allow 8554/tcp    # RTSP
ufw allow 14550/tcp   # MAVLink
ufw allow 14551/tcp   # MAVLink TCP Proxy
ufw allow 5000:5001/tcp # Jetson integration

ufw --force enable

# Создание скрипта мониторинга
log "Creating monitoring script..."
cat > /opt/ironbrain/scripts/health_monitor.sh << 'EOF'
#!/bin/bash
# IronBrain Health Monitor
# Checks system health and restarts services if needed

LOG_FILE="/var/log/ironbrain/health_monitor.log"

log_message() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

check_service() {
    local service_name=$1
    if ! systemctl is-active --quiet $service_name; then
        log_message "WARNING: $service_name is not running, restarting..."
        systemctl restart $service_name
        sleep 5
        if systemctl is-active --quiet $service_name; then
            log_message "SUCCESS: $service_name restarted successfully"
        else
            log_message "ERROR: Failed to restart $service_name"
        fi
    fi
}

# Проверка сервисов
check_service "nginx"
check_service "ironbrain-api-v2"
check_service "ironbrain-tcp-proxy"

# Проверка дискового пространства
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    log_message "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Проверка памяти
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 80 ]; then
    log_message "WARNING: Memory usage is ${MEM_USAGE}%"
fi

log_message "Health check completed"
EOF

chmod +x /opt/ironbrain/scripts/health_monitor.sh

# Добавление в crontab
log "Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/ironbrain/scripts/health_monitor.sh") | crontab -

# Перезагрузка systemd и запуск сервисов
log "Starting services..."
systemctl daemon-reload
systemctl enable ironbrain-api-v2
systemctl enable ironbrain-tcp-proxy
systemctl enable nginx

systemctl restart nginx
systemctl start ironbrain-api-v2
systemctl start ironbrain-tcp-proxy

# Проверка статуса сервисов
log "Checking service status..."
sleep 5

services=("nginx" "ironbrain-api-v2" "ironbrain-tcp-proxy")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        info "✅ $service is running"
    else
        error "❌ $service failed to start"
    fi
done

# Создание информационного файла
log "Creating system info..."
cat > /opt/ironbrain/system_info.txt << EOF
IronBrain VPS Deployment Information
===================================
Deployment Date: $(date)
Server IP: $(curl -s ifconfig.me)
OS: $(lsb_release -d | cut -f2)
Kernel: $(uname -r)

Services:
- Nginx: Port 80 (HTTP)
- API v1: Port 3001 (Tiger CRM)
- API v2: Port 3002 (Extended API)
- TCP Proxy: Port 14551 (MAVLink)
- RTSP: Port 8554 (Video streams)

Endpoints:
- Health: http://$(curl -s ifconfig.me)/health
- API v1: http://$(curl -s ifconfig.me)/api/v1/
- API v2: http://$(curl -s ifconfig.me)/api/v2/
- MAVLink Status: http://$(curl -s ifconfig.me)/api/v2/mavlink/status

Logs:
- API: /var/log/ironbrain/api_v2.log
- TCP Proxy: /var/log/ironbrain/tcp_proxy.log
- Nginx: /var/log/nginx/ironbrain_*.log
- Health Monitor: /var/log/ironbrain/health_monitor.log

Management:
- Restart API: systemctl restart ironbrain-api-v2
- Restart Proxy: systemctl restart ironbrain-tcp-proxy
- Restart Nginx: systemctl restart nginx
- View logs: journalctl -u ironbrain-api-v2 -f
EOF

# Финальная проверка
log "Performing final health check..."
sleep 10

# Тест API
if curl -s http://localhost/health > /dev/null; then
    info "✅ HTTP API is responding"
else
    warning "⚠️ HTTP API is not responding"
fi

# Тест портов
for port in 80 3002 14551; do
    if netstat -tuln | grep -q ":$port "; then
        info "✅ Port $port is listening"
    else
        warning "⚠️ Port $port is not listening"
    fi
done

log "🎉 IronBrain VPS deployment completed!"
log "📋 System information saved to /opt/ironbrain/system_info.txt"
log "🔍 Check logs in /var/log/ironbrain/"
log "🌐 Access API at http://$(curl -s ifconfig.me)/api/v2/mavlink/status"

echo ""
echo "🚀 Deployment Summary:"
echo "====================="
echo "✅ System packages updated"
echo "✅ Python dependencies installed"
echo "✅ API services deployed"
echo "✅ Nginx configured"
echo "✅ Firewall configured"
echo "✅ Systemd services created"
echo "✅ Health monitoring enabled"
echo "✅ All services started"
echo ""
echo "🔗 Next steps:"
echo "1. Configure Jetson to connect to this VPS"
echo "2. Set up ngrok tunnels for external access"
echo "3. Test Mission Planner connectivity"
echo ""
echo "📞 Support: Check /opt/ironbrain/system_info.txt for details"

