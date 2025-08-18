# 👤 Tài khoản mặc định

Hệ thống có sẵn tài khoản admin mặc định:

## 🔑 Tài khoản Admin
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: admin@company.com
- **Quyền**: Quản trị toàn hệ thống

## 🌐 Truy cập
1. Mở trình duyệt và vào: http://localhost:3000/login
2. Đăng nhập bằng tài khoản admin ở trên
3. Sau khi đăng nhập thành công, bạn có thể:
   - Tạo tài khoản mới cho nhân viên
   - Quản lý quyền truy cập
   - Cấu hình hệ thống

## ⚠️ Lưu ý quan trọng
- **Luôn chạy server trên port 3000** để đảm bảo dữ liệu không bị mất
- Dữ liệu được lưu trong localStorage của trình duyệt
- Nếu xóa dữ liệu trình duyệt, tài khoản sẽ được reset về mặc định

## 🔧 Chạy hệ thống
```bash
# Khởi động server (luôn trên port 3000)
npm run dev

# Nếu port 3000 bị chiếm:
# 1. Tắt ứng dụng đang chạy trên port 3000
# 2. Hoặc chạy lệnh sau để kill tất cả Node.js processes:
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

## 📧 Liên hệ hỗ trợ
Nếu gặp vấn đề, kiểm tra:
1. Server có đang chạy trên đúng port 3000 không
2. Console browser có lỗi gì không (F12)
3. LocalStorage có dữ liệu không (F12 > Application > Local Storage)
