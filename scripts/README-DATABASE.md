# Database Setup Guide

## 📋 Hướng dẫn thiết lập Database

### 1. Vào Supabase Dashboard
- Truy cập: https://app.supabase.com
- Đăng nhập tài khoản của bạn
- Chọn project của bạn

### 2. Mở SQL Editor
- Trong dashboard, click vào **SQL Editor** ở sidebar bên trái
- Click **New Query** để tạo query mới

### 3. Chạy Database Schema
```sql
-- Copy toàn bộ nội dung từ file scripts/setup-database.sql
-- Paste vào SQL Editor và click "Run"
```

### 4. Nếu có dữ liệu trùng lặp
```sql
-- Chạy file scripts/clean-database.sql trước
-- Sau đó chạy lại setup-database.sql
```

## 🔍 Kiểm tra Database

### Truy cập debug page
- Vào http://localhost:3000/debug
- Click "Test Connection" để kiểm tra kết nối
- Xem data tables để kiểm tra dữ liệu

### Expected Results
- ✅ Documents: 3 items
- ✅ Devices: 6 items  
- ✅ Rooms: 4 items
- ✅ Work Orders: 4 items

## 🚨 Troubleshooting

### Lỗi "relation does not exist"
➡️ **Nguyên nhân**: Chưa chạy setup-database.sql
➡️ **Giải pháp**: Chạy setup-database.sql trong Supabase SQL Editor

### Lỗi "duplicate key value"
➡️ **Nguyên nhân**: Dữ liệu đã tồn tại
➡️ **Giải pháp**: Chạy clean-database.sql trước, sau đó setup-database.sql

### Lỗi connection timeout
➡️ **Nguyên nhân**: Supabase credentials không đúng
➡️ **Giải pháp**: Kiểm tra file .env.local

## 📄 Files cần thiết
- `scripts/setup-database.sql` - Tạo tables và sample data
- `scripts/clean-database.sql` - Xóa data trùng lặp  
- `scripts/test-supabase.ts` - Test connection
- `app/debug/page.tsx` - Debug interface

## 🎯 Kết quả mong đợi
Sau khi setup thành công:
1. Documents page sẽ load được dữ liệu từ Supabase
2. Có thể thêm/sửa/xóa documents
3. Google Drive integration hoạt động bình thường
4. Không còn lỗi duplicate data
