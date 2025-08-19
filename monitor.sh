#!/bin/bash

# Facility Hub Monitoring Script
# Add to crontab: */5 * * * * /opt/facility-hub/monitor.sh

APP_DIR="/opt/facility-hub"
LOG_FILE="$APP_DIR/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Create logs directory if it doesn't exist
mkdir -p "$APP_DIR/logs"

# Function to log messages
log_message() {
    echo "[$DATE] $1" >> "$LOG_FILE"
}

# Function to send alert (customize as needed)
send_alert() {
    echo "[$DATE] ALERT: $1" >> "$LOG_FILE"
    # Add your notification method here (email, webhook, etc.)
    # Example: curl -X POST "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK" -d "{\"text\":\"Facility Hub Alert: $1\"}"
}

# Check if containers are running
cd "$APP_DIR"
if ! docker-compose ps | grep -q "Up"; then
    send_alert "One or more containers are down"
    docker-compose up -d
    log_message "Attempted to restart containers"
fi

# Check application health
if ! curl -f -s http://localhost/health > /dev/null; then
    send_alert "Application health check failed"
    log_message "Health check failed, restarting containers"
    docker-compose restart
fi

# Check disk space
DISK_USAGE=$(df /opt | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    send_alert "Disk usage is high: ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ "$MEMORY_USAGE" -gt 85 ]; then
    send_alert "Memory usage is high: ${MEMORY_USAGE}%"
fi

# Clean old logs (keep last 7 days)
find "$APP_DIR/logs" -name "*.log" -type f -mtime +7 -delete

log_message "Monitoring check completed"
