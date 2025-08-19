#!/bin/bash

# Facility Hub Deployment Script for Ubuntu Server
# Run with: sudo bash deploy-ubuntu.sh

set -e

echo "🚀 Starting Facility Hub deployment on Ubuntu..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}Please don't run this script as root. Use a regular user with sudo privileges.${NC}"
   exit 1
fi

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Install Git if not present
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}📋 Installing Git...${NC}"
    sudo apt install -y git
fi

# Create application directory
APP_DIR="/opt/facility-hub"
echo -e "${YELLOW}📁 Setting up application directory: $APP_DIR${NC}"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    echo -e "${YELLOW}🔄 Updating existing repository...${NC}"
    cd $APP_DIR
    git pull origin main
else
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    git clone https://github.com/ththuan/facility-hub.git $APP_DIR
    cd $APP_DIR
fi

# Setup environment file
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚙️  Creating environment file...${NC}"
    cp .env.production.example .env.production
    echo -e "${RED}⚠️  Please edit .env.production with your actual configuration values${NC}"
    echo -e "${YELLOW}Run: nano .env.production${NC}"
    read -p "Press Enter after editing the environment file..."
fi

# Create SSL directory (for future SSL setup)
mkdir -p ssl

# Setup firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Build and start containers
echo -e "${YELLOW}🏗️  Building and starting containers...${NC}"
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for containers to start
echo -e "${YELLOW}⏳ Waiting for containers to start...${NC}"
sleep 30

# Check container status
echo -e "${YELLOW}📊 Checking container status...${NC}"
docker-compose ps

# Test application
echo -e "${YELLOW}🧪 Testing application...${NC}"
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running successfully!${NC}"
else
    echo -e "${RED}❌ Application health check failed${NC}"
    echo "Check logs with: docker-compose logs"
fi

# Setup log rotation
echo -e "${YELLOW}📝 Setting up log rotation...${NC}"
sudo tee /etc/logrotate.d/facility-hub > /dev/null <<EOF
/opt/facility-hub/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f /opt/facility-hub/docker-compose.yml restart > /dev/null 2>&1 || true
    endscript
}
EOF

# Create systemd service for auto-start
echo -e "${YELLOW}🔄 Creating systemd service...${NC}"
sudo tee /etc/systemd/system/facility-hub.service > /dev/null <<EOF
[Unit]
Description=Facility Hub Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=$USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable facility-hub.service

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Edit environment variables: nano $APP_DIR/.env.production"
echo "2. Configure your domain/DNS to point to this server"
echo "3. Setup SSL certificates (recommended)"
echo "4. Access your application at: http://your-server-ip"
echo ""
echo -e "${YELLOW}📚 Useful commands:${NC}"
echo "- View logs: cd $APP_DIR && docker-compose logs"
echo "- Restart app: cd $APP_DIR && docker-compose restart"
echo "- Update app: cd $APP_DIR && git pull && docker-compose up -d --build"
echo "- Stop app: cd $APP_DIR && docker-compose down"

# Final reminder
echo -e "${RED}⚠️  IMPORTANT: Please configure your .env.production file with actual values!${NC}"
