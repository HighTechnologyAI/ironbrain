#!/bin/bash

# =============================================================================
# VPS Setup Script for Pro Mega Spot Technology AI - Drone Video Gateway
# =============================================================================
# Server: 87.120.254.156 (vpsbg.eu)
# OS: Ubuntu 22.04 LTS
# Purpose: RTSP relay, WireGuard VPN, HTTPS proxy for Jetson GCS connections
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="87.120.254.156"
DOMAIN=""  # Set this if you have a domain, otherwise uses IP
JETSON_NETWORK="10.50.0.0/24"
WIREGUARD_PORT="51820"
RTSP_PORT="8554"
GCS_PORT="5000"
NGINX_STREAM_PORT="1935"

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}Pro Mega Spot Technology AI - VPS Setup${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo -e "${GREEN}VPS IP: ${VPS_IP}${NC}"
echo -e "${GREEN}Jetson Network: ${JETSON_NETWORK}${NC}"
echo -e "${GREEN}WireGuard Port: ${WIREGUARD_PORT}${NC}"
echo -e "${GREEN}RTSP Port: ${RTSP_PORT}${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# Ask for domain if not set
if [ -z "$DOMAIN" ]; then
    read -p "Enter domain name for HTTPS (or press Enter for IP-only setup): " DOMAIN
fi

if [ -z "$DOMAIN" ]; then
    DOMAIN="$VPS_IP"
    USE_HTTPS=false
    echo -e "${YELLOW}Using IP-only setup: $DOMAIN${NC}"
else
    USE_HTTPS=true
    echo -e "${GREEN}Using domain: $DOMAIN${NC}"
fi

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Update system
echo -e "${BLUE}Updating system packages...${NC}"
apt update && apt upgrade -y
print_status "System updated"

# Install essential packages
echo -e "${BLUE}Installing essential packages...${NC}"
apt install -y \
    curl \
    wget \
    ufw \
    nginx \
    wireguard \
    wireguard-tools \
    qrencode \
    gstreamer1.0-tools \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-rtsp \
    vlc \
    ffmpeg \
    certbot \
    python3-certbot-nginx \
    htop \
    iftop \
    tcpdump \
    net-tools

print_status "Essential packages installed"

# Configure UFW Firewall
echo -e "${BLUE}Configuring firewall...${NC}"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow $WIREGUARD_PORT/udp
ufw allow $RTSP_PORT/tcp
ufw allow $NGINX_STREAM_PORT/tcp
ufw --force enable
print_status "Firewall configured"

# Generate WireGuard configuration
echo -e "${BLUE}Setting up WireGuard VPN...${NC}"

# Generate server private key
SERVER_PRIVATE_KEY=$(wg genkey)
SERVER_PUBLIC_KEY=$(echo $SERVER_PRIVATE_KEY | wg pubkey)

# Generate client private key (for Jetson)
CLIENT_PRIVATE_KEY=$(wg genkey)
CLIENT_PUBLIC_KEY=$(echo $CLIENT_PRIVATE_KEY | wg pubkey)

# Create WireGuard server config
cat > /etc/wireguard/wg0.conf << EOF
[Interface]
PrivateKey = $SERVER_PRIVATE_KEY
Address = 10.50.0.1/24
ListenPort = $WIREGUARD_PORT
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Jetson Nano Client
[Peer]
PublicKey = $CLIENT_PUBLIC_KEY
AllowedIPs = 10.50.0.10/32
EOF

# Enable IP forwarding
echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf
sysctl -p

# Start and enable WireGuard
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

print_status "WireGuard VPN configured"

# Generate Jetson client config
mkdir -p /root/jetson-configs

cat > /root/jetson-configs/jetson-wg0.conf << EOF
[Interface]
PrivateKey = $CLIENT_PRIVATE_KEY
Address = 10.50.0.10/24
DNS = 8.8.8.8

[Peer]
PublicKey = $SERVER_PUBLIC_KEY
Endpoint = $VPS_IP:$WIREGUARD_PORT
AllowedIPs = 10.50.0.0/24, $VPS_IP/32
PersistentKeepalive = 25
EOF

# Generate QR code for easy mobile setup
qrencode -t ansiutf8 < /root/jetson-configs/jetson-wg0.conf > /root/jetson-configs/jetson-qr.txt

print_status "Jetson WireGuard config generated"

# Setup RTSP relay server
echo -e "${BLUE}Setting up RTSP relay server...${NC}"

# Create RTSP relay script
cat > /usr/local/bin/rtsp-relay.sh << 'EOF'
#!/bin/bash

# RTSP Relay Server using GStreamer
# Receives RTSP streams from Jetson and relays them

RTSP_PORT=8554
RELAY_PORT=8555

echo "Starting RTSP relay server on port $RTSP_PORT"

# Start GStreamer RTSP server
gst-launch-1.0 -v \
    rtspsrc location=rtsp://10.50.0.10:8554/stream latency=50 ! \
    rtph264depay ! h264parse ! \
    rtph264pay name=pay0 pt=96 ! \
    udpsink host=0.0.0.0 port=$RELAY_PORT &

# Simple RTSP proxy using VLC
vlc -I dummy \
    --sout '#rtp{sdp=rtsp://:8554/relay}' \
    --sout-keep \
    --loop \
    udp://@:$RELAY_PORT 2>/dev/null &

echo "RTSP relay server started"
wait
EOF

chmod +x /usr/local/bin/rtsp-relay.sh

# Create systemd service for RTSP relay
cat > /etc/systemd/system/rtsp-relay.service << EOF
[Unit]
Description=RTSP Relay Server
After=network.target wg-quick@wg0.service

[Service]
Type=forking
ExecStart=/usr/local/bin/rtsp-relay.sh
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable rtsp-relay
# Note: Will start after Nginx configuration

print_status "RTSP relay server configured"

# Configure Nginx
echo -e "${BLUE}Configuring Nginx...${NC}"

# Remove default config
rm -f /etc/nginx/sites-enabled/default

# Create main Nginx config
cat > /etc/nginx/sites-available/drone-gateway << EOF
# Drone Gateway Configuration
map \$http_upgrade \$connection_upgrade {
    default upgrade;
    '' close;
}

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=video:10m rate=30r/s;

# Upstream for Jetson GCS
upstream jetson_gcs {
    server 10.50.0.10:5000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Main server block
server {
    listen 80;
    server_name $DOMAIN;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }

    # API endpoints to Jetson GCS
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://jetson_gcs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # WebSocket endpoint for telemetry
    location /ws {
        limit_req zone=api burst=10 nodelay;
        
        proxy_pass http://jetson_gcs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket specific settings
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        proxy_connect_timeout 60s;
    }
    
    # Video stream endpoints
    location /video/ {
        limit_req zone=video burst=50 nodelay;
        
        proxy_pass http://jetson_gcs;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Video streaming optimizations
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # CORS for video streaming
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
        add_header Access-Control-Expose-Headers "Content-Length,Content-Range";
    }
    
    # Static file serving
    location /static/ {
        proxy_pass http://jetson_gcs;
        proxy_cache_valid 200 1h;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
    
    # Default location
    location / {
        return 301 /api/health;
    }
}

# RTSP stream proxy (TCP)
server {
    listen $RTSP_PORT;
    proxy_pass 10.50.0.10:8554;
    proxy_timeout 1s;
    proxy_responses 1;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/drone-gateway /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

print_status "Nginx configured"

# Setup HTTPS if domain is provided
if [ "$USE_HTTPS" = true ]; then
    echo -e "${BLUE}Setting up HTTPS with Let's Encrypt...${NC}"
    
    # Start Nginx to allow certbot verification
    systemctl start nginx
    
    # Get SSL certificate
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect
    
    print_status "HTTPS certificate obtained"
else
    print_warning "Skipping HTTPS setup (no domain provided)"
fi

# Start services
echo -e "${BLUE}Starting services...${NC}"
systemctl restart nginx
systemctl start rtsp-relay

print_status "All services started"

# Create monitoring script
cat > /usr/local/bin/drone-gateway-status.sh << 'EOF'
#!/bin/bash

echo "=== Drone Gateway Status ==="
echo

echo "WireGuard Status:"
wg show
echo

echo "Nginx Status:"
systemctl status nginx --no-pager -l
echo

echo "RTSP Relay Status:"
systemctl status rtsp-relay --no-pager -l
echo

echo "Network Connections:"
netstat -tulpn | grep -E ':(80|443|51820|8554|5000|1935)\s'
echo

echo "Jetson Connectivity:"
if ping -c 1 10.50.0.10 >/dev/null 2>&1; then
    echo "✓ Jetson reachable via VPN"
else
    echo "✗ Jetson not reachable"
fi
EOF

chmod +x /usr/local/bin/drone-gateway-status.sh

# Create installation summary
cat > /root/installation-summary.txt << EOF
=============================================================================
Pro Mega Spot Technology AI - VPS Installation Summary
=============================================================================

VPS Configuration:
- IP Address: $VPS_IP
- Domain: $DOMAIN
- OS: Ubuntu 22.04 LTS

Services Installed:
✓ WireGuard VPN Server (Port: $WIREGUARD_PORT)
✓ Nginx Reverse Proxy (Ports: 80, 443)
✓ RTSP Relay Server (Port: $RTSP_PORT)
✓ SSL/TLS Certificate: $([ "$USE_HTTPS" = true ] && echo "Enabled" || echo "Disabled")

Network Configuration:
- VPN Network: $JETSON_NETWORK
- Server VPN IP: 10.50.0.1
- Jetson VPN IP: 10.50.0.10

Open Ports:
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- $WIREGUARD_PORT (WireGuard VPN)
- $RTSP_PORT (RTSP Stream)
- $NGINX_STREAM_PORT (Stream Relay)

Jetson Configuration Files:
- WireGuard Config: /root/jetson-configs/jetson-wg0.conf
- QR Code: /root/jetson-configs/jetson-qr.txt

Management Commands:
- Check status: /usr/local/bin/drone-gateway-status.sh
- View Jetson config: cat /root/jetson-configs/jetson-wg0.conf
- View QR code: cat /root/jetson-configs/jetson-qr.txt
- Restart services: systemctl restart nginx rtsp-relay wg-quick@wg0

Connection URLs:
- API Endpoint: $([ "$USE_HTTPS" = true ] && echo "https" || echo "http")://$DOMAIN/api/
- WebSocket: $([ "$USE_HTTPS" = true ] && echo "wss" || echo "ws")://$DOMAIN/ws
- RTSP Stream: rtsp://$DOMAIN:$RTSP_PORT/relay
- Health Check: $([ "$USE_HTTPS" = true ] && echo "https" || echo "http")://$DOMAIN/health

Next Steps:
1. Copy /root/jetson-configs/jetson-wg0.conf to your Jetson Nano
2. Install WireGuard on Jetson: apt install wireguard
3. Start VPN on Jetson: wg-quick up jetson-wg0
4. Configure Jetson GCS to bind to 10.50.0.10:5000
5. Test connectivity: curl $([ "$USE_HTTPS" = true ] && echo "https" || echo "http")://$DOMAIN/health

=============================================================================
EOF

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Installation completed successfully!${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo
cat /root/installation-summary.txt
echo
echo -e "${BLUE}Jetson WireGuard Configuration:${NC}"
echo -e "${YELLOW}Copy this configuration to your Jetson Nano:${NC}"
echo
cat /root/jetson-configs/jetson-wg0.conf
echo
echo -e "${BLUE}QR Code for mobile setup:${NC}"
cat /root/jetson-configs/jetson-qr.txt
echo
echo -e "${GREEN}Run '/usr/local/bin/drone-gateway-status.sh' to check service status${NC}"
echo -e "${GREEN}Installation summary saved to: /root/installation-summary.txt${NC}"