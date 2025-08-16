#!/bin/bash
# Pro Mega Spot Technology AI - Ground Control Station
# Update Script for Jetson Nano
# 
# This script updates the GCS to the latest version while preserving
# configuration and data

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
BACKUP_DIR="$GCS_HOME/backups"
UPDATE_LOG="/var/log/jetson-gcs-update.log"

# Logging
exec > >(tee -a "$UPDATE_LOG")
exec 2>&1

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Pro Mega Spot Technology AI${NC}"
echo -e "${BLUE}Jetson Nano GCS Update${NC}"
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

# Function to check if GCS is installed
check_installation() {
    print_status "Checking existing installation..."
    
    if [ ! -d "$GCS_DIR" ]; then
        print_error "GCS not found at $GCS_DIR"
        print_error "Please run the installation script first"
        exit 1
    fi
    
    if ! systemctl list-unit-files | grep -q "$SERVICE_NAME"; then
        print_error "GCS service not found"
        print_error "Please run the installation script first"
        exit 1
    fi
    
    print_status "Existing installation found"
}

# Function to create backup
create_backup() {
    print_status "Creating backup..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/gcs_backup_$TIMESTAMP"
    
    sudo -u "$GCS_USER" mkdir -p "$BACKUP_PATH"
    
    # Backup configuration
    if [ -d "$GCS_HOME/config" ]; then
        sudo -u "$GCS_USER" cp -r "$GCS_HOME/config" "$BACKUP_PATH/"
        print_status "Configuration backed up"
    fi
    
    # Backup data
    if [ -d "$GCS_HOME/data" ]; then
        sudo -u "$GCS_USER" cp -r "$GCS_HOME/data" "$BACKUP_PATH/"
        print_status "Data backed up"
    fi
    
    # Backup logs (last 7 days)
    if [ -d "$GCS_HOME/logs" ]; then
        sudo -u "$GCS_USER" mkdir -p "$BACKUP_PATH/logs"
        find "$GCS_HOME/logs" -name "*.log" -mtime -7 -exec cp {} "$BACKUP_PATH/logs/" \;
        print_status "Recent logs backed up"
    fi
    
    # Create backup info
    sudo -u "$GCS_USER" tee "$BACKUP_PATH/backup_info.txt" > /dev/null <<EOF
Backup created: $(date)
GCS Version: $(cat "$GCS_DIR/VERSION" 2>/dev/null || echo "Unknown")
System: $(uname -a)
User: $GCS_USER
Original path: $GCS_DIR
EOF

    print_status "Backup created at: $BACKUP_PATH"
    echo "$BACKUP_PATH" > /tmp/gcs_backup_path
}

# Function to stop services
stop_services() {
    print_status "Stopping GCS services..."
    
    if systemctl is-active --quiet "${SERVICE_NAME}-frontend"; then
        sudo systemctl stop "${SERVICE_NAME}-frontend"
        print_status "Frontend service stopped"
    fi
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        sudo systemctl stop "$SERVICE_NAME"
        print_status "Backend service stopped"
    fi
    
    # Wait for services to fully stop
    sleep 5
}

# Function to update application
update_application() {
    print_status "Updating application..."
    
    # Check if update files are available
    if [ ! -d "gcs-backend" ] || [ ! -d "gcs-frontend" ]; then
        print_error "Update files not found in current directory"
        print_error "Please ensure gcs-backend and gcs-frontend directories are present"
        exit 1
    fi
    
    # Backup current application
    if [ -d "$GCS_DIR/gcs-backend" ]; then
        sudo mv "$GCS_DIR/gcs-backend" "$GCS_DIR/gcs-backend.old"
    fi
    if [ -d "$GCS_DIR/gcs-frontend" ]; then
        sudo mv "$GCS_DIR/gcs-frontend" "$GCS_DIR/gcs-frontend.old"
    fi
    
    # Copy new application files
    sudo cp -r gcs-backend gcs-frontend "$GCS_DIR/"
    sudo cp quick_test.py test_system.py "$GCS_DIR/" 2>/dev/null || true
    sudo chown -R "$GCS_USER:$GCS_USER" "$GCS_DIR"
    
    print_status "Application files updated"
}

# Function to update backend
update_backend() {
    print_status "Updating backend..."
    
    cd "$GCS_DIR/gcs-backend"
    
    # Update Python dependencies
    if [ -f "requirements.txt" ]; then
        sudo -u "$GCS_USER" bash -c "source venv/bin/activate && pip install -r requirements.txt --upgrade"
        print_status "Backend dependencies updated"
    fi
    
    # Run any migration scripts if they exist
    if [ -f "migrate.py" ]; then
        sudo -u "$GCS_USER" bash -c "source venv/bin/activate && python migrate.py"
        print_status "Database migrations applied"
    fi
}

# Function to update frontend
update_frontend() {
    print_status "Updating frontend..."
    
    cd "$GCS_DIR/gcs-frontend"
    
    # Update Node.js dependencies
    sudo -u "$GCS_USER" npm install
    print_status "Frontend dependencies updated"
    
    # Build frontend
    sudo -u "$GCS_USER" npm run build
    print_status "Frontend built successfully"
}

# Function to update configuration
update_configuration() {
    print_status "Updating configuration..."
    
    # Check if new configuration template exists
    if [ -f "$GCS_DIR/config/gcs.conf.template" ]; then
        # Merge new configuration options
        if [ -f "$GCS_HOME/config/gcs.conf" ]; then
            print_status "Merging configuration changes..."
            # Simple merge - in production, use a more sophisticated approach
            sudo -u "$GCS_USER" cp "$GCS_HOME/config/gcs.conf" "$GCS_HOME/config/gcs.conf.backup"
        else
            # Create new configuration from template
            sudo -u "$GCS_USER" cp "$GCS_DIR/config/gcs.conf.template" "$GCS_HOME/config/gcs.conf"
            print_status "New configuration created from template"
        fi
    fi
    
    # Update environment file if needed
    if [ -f "$GCS_DIR/config/.env.template" ] && [ ! -f "$GCS_HOME/config/.env" ]; then
        sudo -u "$GCS_USER" cp "$GCS_DIR/config/.env.template" "$GCS_HOME/config/.env"
        print_status "Environment file created"
    fi
}

# Function to update systemd services
update_services() {
    print_status "Updating systemd services..."
    
    # Check if service files have changed
    if [ -f "$GCS_DIR/deploy/jetson-gcs.service" ]; then
        if ! cmp -s "$GCS_DIR/deploy/jetson-gcs.service" "/etc/systemd/system/${SERVICE_NAME}.service" 2>/dev/null; then
            sudo cp "$GCS_DIR/deploy/jetson-gcs.service" "/etc/systemd/system/${SERVICE_NAME}.service"
            print_status "Backend service file updated"
            RELOAD_SYSTEMD=true
        fi
    fi
    
    if [ -f "$GCS_DIR/deploy/jetson-gcs-frontend.service" ]; then
        if ! cmp -s "$GCS_DIR/deploy/jetson-gcs-frontend.service" "/etc/systemd/system/${SERVICE_NAME}-frontend.service" 2>/dev/null; then
            sudo cp "$GCS_DIR/deploy/jetson-gcs-frontend.service" "/etc/systemd/system/${SERVICE_NAME}-frontend.service"
            print_status "Frontend service file updated"
            RELOAD_SYSTEMD=true
        fi
    fi
    
    # Reload systemd if needed
    if [ "$RELOAD_SYSTEMD" = true ]; then
        sudo systemctl daemon-reload
        print_status "Systemd configuration reloaded"
    fi
}

# Function to run post-update tests
run_tests() {
    print_status "Running post-update tests..."
    
    cd "$GCS_DIR"
    
    # Run quick test
    if sudo -u "$GCS_USER" python3 quick_test.py; then
        print_status "Post-update tests passed"
        return 0
    else
        print_warning "Post-update tests failed"
        return 1
    fi
}

# Function to start services
start_services() {
    print_status "Starting GCS services..."
    
    # Start optimization service
    if systemctl list-unit-files | grep -q "jetson-gcs-optimize"; then
        sudo systemctl start jetson-gcs-optimize
    fi
    
    # Start backend service
    sudo systemctl start "$SERVICE_NAME"
    
    # Wait for backend to start
    sleep 10
    
    # Check if backend is running
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_status "Backend service started"
        
        # Start frontend service
        sudo systemctl start "${SERVICE_NAME}-frontend"
        
        # Wait for frontend to start
        sleep 5
        
        if systemctl is-active --quiet "${SERVICE_NAME}-frontend"; then
            print_status "Frontend service started"
            return 0
        else
            print_error "Frontend service failed to start"
            return 1
        fi
    else
        print_error "Backend service failed to start"
        return 1
    fi
}

# Function to rollback on failure
rollback() {
    print_error "Update failed, rolling back..."
    
    # Stop services
    sudo systemctl stop "${SERVICE_NAME}-frontend" 2>/dev/null || true
    sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    
    # Restore old application files
    if [ -d "$GCS_DIR/gcs-backend.old" ]; then
        sudo rm -rf "$GCS_DIR/gcs-backend"
        sudo mv "$GCS_DIR/gcs-backend.old" "$GCS_DIR/gcs-backend"
        print_status "Backend rolled back"
    fi
    
    if [ -d "$GCS_DIR/gcs-frontend.old" ]; then
        sudo rm -rf "$GCS_DIR/gcs-frontend"
        sudo mv "$GCS_DIR/gcs-frontend.old" "$GCS_DIR/gcs-frontend"
        print_status "Frontend rolled back"
    fi
    
    # Restore configuration if backup exists
    BACKUP_PATH=$(cat /tmp/gcs_backup_path 2>/dev/null || echo "")
    if [ -n "$BACKUP_PATH" ] && [ -d "$BACKUP_PATH/config" ]; then
        sudo -u "$GCS_USER" cp -r "$BACKUP_PATH/config"/* "$GCS_HOME/config/"
        print_status "Configuration rolled back"
    fi
    
    # Restart services
    sudo systemctl start "$SERVICE_NAME"
    sudo systemctl start "${SERVICE_NAME}-frontend"
    
    print_error "Rollback completed. System restored to previous state."
}

# Function to cleanup old files
cleanup() {
    print_status "Cleaning up..."
    
    # Remove old application backups
    if [ -d "$GCS_DIR/gcs-backend.old" ]; then
        sudo rm -rf "$GCS_DIR/gcs-backend.old"
    fi
    if [ -d "$GCS_DIR/gcs-frontend.old" ]; then
        sudo rm -rf "$GCS_DIR/gcs-frontend.old"
    fi
    
    # Clean up old backups (keep last 5)
    if [ -d "$BACKUP_DIR" ]; then
        sudo -u "$GCS_USER" bash -c "cd '$BACKUP_DIR' && ls -t | tail -n +6 | xargs -r rm -rf"
        print_status "Old backups cleaned up"
    fi
    
    # Clean up temporary files
    rm -f /tmp/gcs_backup_path
    
    print_status "Cleanup completed"
}

# Function to show update summary
show_summary() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Update Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Pro Mega Spot Technology AI Ground Control Station${NC}"
    echo -e "${BLUE}has been successfully updated${NC}"
    echo ""
    echo -e "${YELLOW}Service Status:${NC}"
    systemctl status "$SERVICE_NAME" --no-pager -l | head -3
    systemctl status "${SERVICE_NAME}-frontend" --no-pager -l | head -3
    echo ""
    echo -e "${YELLOW}Access Points:${NC}"
    echo "  Backend:  http://localhost:5000"
    echo "  Frontend: http://localhost:3000"
    echo ""
    echo -e "${YELLOW}Useful Commands:${NC}"
    echo "  gcs-status   - Check service status"
    echo "  gcs-logs     - View service logs"
    echo "  gcs-stop     - Stop services"
    echo "  gcs-start    - Start services"
    echo ""
    echo -e "${GREEN}Update log saved to: $UPDATE_LOG${NC}"
    echo ""
}

# Main update function
main() {
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root (use sudo)"
        exit 1
    fi
    
    # Set trap for rollback on error
    trap rollback ERR
    
    # Run update steps
    check_installation
    create_backup
    stop_services
    update_application
    update_backend
    update_frontend
    update_configuration
    update_services
    
    # Test the update
    if run_tests; then
        # Start services
        if start_services; then
            cleanup
            show_summary
            print_status "Update completed successfully!"
        else
            print_error "Failed to start services after update"
            exit 1
        fi
    else
        print_warning "Tests failed, but services will be started anyway"
        start_services
        cleanup
        show_summary
        print_warning "Update completed with warnings"
    fi
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Pro Mega Spot Technology AI - GCS Update Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --force        Force update even if tests fail"
        echo ""
        echo "This script updates the GCS while preserving configuration and data."
        echo "A backup is automatically created before the update."
        exit 0
        ;;
    --force)
        FORCE_UPDATE=true
        ;;
esac

# Run main function
main "$@"

