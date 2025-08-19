#!/bin/bash

# Facility Hub Backup Script
# Run daily via cron: 0 2 * * * /opt/facility-hub/backup.sh

APP_DIR="/opt/facility-hub"
BACKUP_DIR="/opt/backups/facility-hub"
DATE=$(date '+%Y%m%d_%H%M%S')
LOG_FILE="$APP_DIR/logs/backup.log"

# Create backup directory
mkdir -p "$BACKUP_DIR"
mkdir -p "$APP_DIR/logs"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log_message "Starting backup process"

# Backup application files
log_message "Backing up application files"
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" -C /opt facility-hub --exclude='node_modules' --exclude='.git' --exclude='logs'

# Backup Docker volumes (if any)
if docker volume ls | grep -q facility; then
    log_message "Backing up Docker volumes"
    docker run --rm -v facility_data:/data -v "$BACKUP_DIR:/backup" alpine tar -czf "/backup/volumes_$DATE.tar.gz" -C /data .
fi

# Backup environment files
log_message "Backing up configuration"
cp "$APP_DIR/.env.production" "$BACKUP_DIR/env_$DATE.backup" 2>/dev/null || true

# Clean old backups (keep last 7 days)
log_message "Cleaning old backups"
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +7 -delete
find "$BACKUP_DIR" -name "*.backup" -type f -mtime +7 -delete

# Optional: Upload to cloud storage
# Example for AWS S3:
# aws s3 sync "$BACKUP_DIR" s3://your-backup-bucket/facility-hub/

log_message "Backup completed successfully"

# Check backup size and send notification
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log_message "Total backup size: $BACKUP_SIZE"
