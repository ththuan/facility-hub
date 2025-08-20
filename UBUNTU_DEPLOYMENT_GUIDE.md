# Ubuntu Docker Deployment Guide

## ✅ Status: Ready for Deployment
Docker build issues have been fixed and the application is ready for Ubuntu deployment.

## 🐳 Deployment Steps

### 1. Prepare Ubuntu Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose -y
```

### 2. Clone Repository
```bash
git clone <your-repo-url> facility-hub
cd facility-hub
```

### 3. Environment Setup
```bash
# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXTAUTH_URL=http://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# Port configuration
PORT=3000
NGINX_PORT=80
```

### 4. Deploy with Docker Compose
```bash
# Build and start services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 5. Access Application
- Application: `http://your-server-ip`
- Direct Next.js: `http://your-server-ip:3000`

## 🔧 Troubleshooting Commands

### Check Container Status
```bash
docker-compose ps
docker logs facility-hub-app-1
docker logs facility-hub-nginx-1
```

### Restart Services
```bash
docker-compose restart
docker-compose down && docker-compose up -d
```

### Force Rebuild
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### View Resource Usage
```bash
docker stats
```

## 📋 Pre-deployment Checklist

### ✅ Fixed Issues (Completed)
- [x] Removed all problematic test/debug folders
- [x] Fixed TypeScript compilation errors
- [x] Updated property names to match database schema
- [x] Simplified Docker configuration
- [x] Fixed analytics page dependencies
- [x] Clean npm build successful

### 🔒 Security Checklist
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Configure proper Supabase RLS policies
- [ ] Set up SSL/TLS certificates (Let's Encrypt)
- [ ] Configure firewall rules
- [ ] Update default passwords

### 🌐 Production Checklist
- [ ] Configure domain name
- [ ] Set up reverse proxy with SSL
- [ ] Configure environment variables
- [ ] Test database connectivity
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## 📊 Service Configuration

### Docker Compose Services
1. **facility-hub-app**: Next.js application (port 3000)
2. **facility-hub-nginx**: Nginx reverse proxy (port 80)

### Health Checks
- Application health: `http://your-server-ip:3000/api/health`
- Nginx status: `http://your-server-ip/nginx_status`

## 🔍 Monitoring

### Log Files
```bash
# Application logs
docker-compose logs app

# Nginx logs
docker-compose logs nginx

# All services
docker-compose logs
```

### Performance Monitoring
```bash
# Resource usage
docker stats

# Container processes
docker-compose exec app ps aux
```

## 🚀 Quick Start Script
```bash
#!/bin/bash
# quick-deploy.sh
set -e

echo "🐳 Starting Ubuntu Docker deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo apt install docker-compose -y
fi

# Build and start
echo "🔨 Building and starting services..."
docker-compose up -d --build

echo "✅ Deployment complete!"
echo "🌐 Application available at: http://$(hostname -I | awk '{print $1}')"
```

## 📞 Support
If you encounter any issues during deployment, check:
1. Docker and Docker Compose versions
2. Available disk space and memory
3. Network connectivity to external services
4. Environment variable configuration
5. Container logs for specific error messages

## 🔄 Updates
To update the application:
```bash
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```
