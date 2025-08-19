# Facility Hub - Docker Deployment Guide

🚀 **Hướng dẫn triển khai Facility Hub trên Ubuntu Server với Docker**

## 📋 Yêu cầu hệ thống

- **OS**: Ubuntu 20.04+ hoặc tương đương
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **Storage**: Tối thiểu 10GB dung lượng trống
- **Network**: Kết nối internet ổn định
- **User**: User không phải root với quyền sudo

## 🚀 Triển khai tự động (Khuyến nghị)

### 1. Tải và chạy script deployment:

```bash
# Tải repository
git clone https://github.com/ththuan/facility-hub.git
cd facility-hub

# Chạy script triển khai tự động
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

Script sẽ tự động:
- ✅ Cài đặt Docker & Docker Compose
- ✅ Cấu hình firewall
- ✅ Clone source code
- ✅ Build và khởi động containers
- ✅ Thiết lập systemd service
- ✅ Cấu hình log rotation

### 2. Cấu hình environment:

```bash
# Chỉnh sửa file cấu hình
nano /opt/facility-hub/.env.production
```

**Thông tin cần điền:**
```env
# Supabase (Bắt buộc)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Domain/URL
NEXTAUTH_URL=http://your-domain.com
NEXTAUTH_SECRET=your_random_secret_key
```

### 3. Khởi động lại ứng dụng:

```bash
cd /opt/facility-hub
docker-compose restart
```

## 🛠️ Triển khai thủ công

### Bước 1: Cài đặt Docker

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Đăng xuất và đăng nhập lại để áp dụng group docker
```

### Bước 2: Clone source code

```bash
git clone https://github.com/ththuan/facility-hub.git
cd facility-hub
```

### Bước 3: Cấu hình environment

```bash
cp .env.production .env.production.local
nano .env.production.local
```

### Bước 4: Build và chạy

```bash
# Build containers
docker-compose build

# Khởi động
docker-compose up -d

# Kiểm tra status
docker-compose ps
```

## 🔧 Quản lý ứng dụng

### Các lệnh cơ bản:

```bash
cd /opt/facility-hub

# Xem logs
docker-compose logs -f

# Khởi động lại
docker-compose restart

# Dừng ứng dụng
docker-compose down

# Cập nhật từ GitHub
git pull origin main
docker-compose up -d --build

# Xem trạng thái containers
docker-compose ps
```

### Health Check:

```bash
# Kiểm tra health endpoint
curl http://localhost/health

# Kiểm tra Nginx
curl http://localhost/health
```

## 📊 Monitoring & Backup

### Thiết lập monitoring:

```bash
# Thêm vào crontab
crontab -e

# Thêm dòng sau để check mỗi 5 phút:
*/5 * * * * /opt/facility-hub/monitor.sh
```

### Thiết lập backup tự động:

```bash
# Thêm vào crontab để backup hàng ngày lúc 2h sáng:
0 2 * * * /opt/facility-hub/backup.sh
```

## 🔒 Cấu hình SSL (Production)

### Với Let's Encrypt:

```bash
# Cài đặt Certbot
sudo apt install certbot

# Tạo SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Cập nhật nginx.conf để enable SSL section
# Khởi động lại
docker-compose restart nginx
```

## 🔥 Firewall Configuration

```bash
# Cho phép SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 🐛 Troubleshooting

### Lỗi thường gặp:

**1. Container không khởi động được:**
```bash
# Xem logs chi tiết
docker-compose logs facility-hub
docker-compose logs nginx
```

**2. Không truy cập được ứng dụng:**
```bash
# Kiểm tra ports
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Kiểm tra firewall
sudo ufw status
```

**3. Lỗi database connection:**
- Kiểm tra Supabase credentials trong .env.production
- Kiểm tra network connection đến Supabase

**4. Permission errors:**
```bash
# Fix ownership
sudo chown -R $USER:$USER /opt/facility-hub
```

## 📈 Performance Tuning

### Tối ưu hóa production:

```bash
# Tăng file descriptors limit
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Tối ưu kernel parameters
echo "net.core.somaxconn = 65536" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 🆘 Support

Nếu gặp vấn đề trong quá trình triển khai:

1. **Kiểm tra logs**: `docker-compose logs`
2. **Xem system resources**: `htop`, `df -h`
3. **Kiểm tra network**: `netstat -tlnp`
4. **Health check**: `curl http://localhost/health`

## 📱 Truy cập ứng dụng

Sau khi triển khai thành công:
- **URL**: http://your-server-ip hoặc http://your-domain.com
- **Admin login**: `admin / admin123`
- **Health check**: http://your-server-ip/health

---

🎉 **Chúc mừng! Facility Hub đã sẵn sàng hoạt động trên server Ubuntu của bạn!**
